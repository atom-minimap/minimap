{$, View, TextEditorView} = require 'atom'
Delegato = require 'delegato'
{CompositeDisposable, Disposable} = require 'event-kit'

MinimapRenderView = require './minimap-render-view'
MinimapIndicator = require './minimap-indicator'
MinimapOpenQuickSettingsView = require './minimap-open-quick-settings-view'

# Public: A `MinimapView` instance is created for every `Editor` opened in Atom.
# It provides delegation to many `Editor` and {MinimapRenderView} methods so
# that in most case you can just substitute a {MinimapView} instance
# instead of an `Editor`.
#
# The following methods are delegated to the {MinimapRenderView} instance:
#
# - [getLineHeight]{MinimapRenderView::getLineHeight}
# - [getCharHeight]{MinimapRenderView::getCharHeight}
# - [getCharWidth]{MinimapRenderView::getCharWidth}
# - [getLinesCount]{MinimapRenderView::getLinesCount}
# - [getMinimapHeight]{MinimapRenderView::getMinimapHeight}
# - [getMinimapScreenHeight]{MinimapRenderView::getMinimapScreenHeight}
# - [getMinimapHeightInLines]{MinimapRenderView::getMinimapHeightInLines}
# - [getFirstVisibleScreenRow]{MinimapRenderView::getFirstVisibleScreenRow}
# - [getLastVisibleScreenRow]{MinimapRenderView::getLastVisibleScreenRow}
# - [pixelPositionForScreenPosition]{MinimapRenderView::pixelPositionForScreenPosition}
# - [decorateMarker]{DecorationManagement::decorateMarker}
# - [removeDecoration]{DecorationManagement::removeDecoration}
# - [decorationsForScreenRowRange]{DecorationManagement::decorationsForScreenRowRange}
# - [removeAllDecorationsForMarker]{DecorationManagement::removeAllDecorationsForMarker}
#
# The following methods are delegated to the `Editor` instance:
#
# - getSelection
# - getSelections
# - getLastSelection
# - bufferRangeForBufferRow
# - getTextInBufferRange
# - getEofBufferPosition
# - scanInBufferRange
# - markBufferRange
module.exports =
class MinimapView extends View
  Delegato.includeInto(this)

  @delegatesMethods 'getLineHeight', 'getCharHeight', 'getCharWidth', 'getLinesCount', 'getMinimapHeight', 'getMinimapScreenHeight', 'getMinimapHeightInLines', 'getFirstVisibleScreenRow', 'getLastVisibleScreenRow', 'pixelPositionForScreenPosition', 'decorateMarker', 'removeDecoration', 'decorationsForScreenRowRange', 'removeAllDecorationsForMarker', toProperty: 'renderView'

  @delegatesMethods 'getSelection', 'getSelections', 'getLastSelection', 'bufferRangeForBufferRow', 'getTextInBufferRange', 'getEofBufferPosition', 'scanInBufferRange', 'markBufferRange', toProperty: 'editor'

  @delegatesProperty 'lineHeight', toMethod: 'getLineHeight'
  @delegatesProperty 'charWidth', toMethod: 'getCharWidth'

  @content: ->
    @div class: 'minimap', =>
      @subview 'openQuickSettings', new MinimapOpenQuickSettingsView if atom.config.get('minimap.displayPluginsControls')
      @div outlet: 'miniScroller', class: "minimap-scroller"
      @div outlet: 'miniWrapper', class: "minimap-wrapper", =>
        @div outlet: 'miniUnderlayer', class: "minimap-underlayer"
        @subview 'renderView', new MinimapRenderView
        @div outlet: 'miniOverlayer', class: "minimap-overlayer", =>
          @div outlet: 'miniVisibleArea', class: "minimap-visible-area"

  isClicked: false

  ### Public ###

  #    #### ##    ## #### ########
  #     ##  ###   ##  ##     ##
  #     ##  ####  ##  ##     ##
  #     ##  ## ## ##  ##     ##
  #     ##  ##  ####  ##     ##
  #     ##  ##   ###  ##     ##
  #    #### ##    ## ####    ##

  # Creates a new {MinimapView}.
  #
  # editorView - The `TextEditorView` for which displaying a minimap.
  constructor: (editorView) ->
    @setEditorView(editorView)

    @paneView.addClass('with-minimap')

    @subscriptions = new CompositeDisposable

    super

    @computeScale()
    @miniScrollView = @renderView.scrollView
    @offsetLeft = 0
    @offsetTop = 0
    @indicator = new MinimapIndicator()

    @scrollView = @editorView.scrollView
    @scrollViewLines = @scrollView.find('.lines')

    @subscribeToEditor()

    @renderView.minimapView = this
    @renderView.setEditorView(@editorView)

    @updateMinimapView()

  # Internal: Initializes the minimap view by registering to various events and
  # by retrieving the base configuration.
  initialize: ->
    @on 'mousewheel', @onMouseWheel
    @on 'mousedown', @onMouseDown
    @miniVisibleArea.on 'mousedown', @onDragStart

    @obsPane = @paneView.model.observeActiveItem @onActiveItemChanged

    # Fix items moving to another pane.
    # @subscriptions.add @paneView.model.onDidRemoveItem ({item}) =>
    #   @destroy() if item is @editor

    @subscribe @renderView, 'minimap:updated', @updateMinimapSize
    @subscribe @renderView, 'minimap:scaleChanged', =>
      @computeScale()
      @updatePositions()

    # The mutation observer is required so that we can relocate the minimap
    # everytime the children of the pane changes.
    @observer = new MutationObserver (mutations) =>
      @updateTopPosition()

    config = childList: true
    @observer.observe @paneView.element, config

    # Update the minimap whenever theme is reloaded
    @subscriptions.add atom.themes.onDidReloadAll =>
      @updateTopPosition()
      @updateMinimapView()

    # The resize:end event is dispatched at the end of an animated resize
    # to not flood the cpu with updates.
    @subscribe $(window), 'resize:end', @onScrollViewResized

    @miniScrollVisible = atom.config.get('minimap.minimapScrollIndicator')
    @miniScroller.toggleClass 'visible', @miniScrollVisible

    @displayCodeHighlights = atom.config.get('minimap.displayCodeHighlights')

    @subscriptions.add @asDisposable atom.config.observe 'minimap.minimapScrollIndicator', =>
      @miniScrollVisible = atom.config.get('minimap.minimapScrollIndicator')
      @miniScroller.toggleClass 'visible', @miniScrollVisible

    @subscriptions.add @asDisposable atom.config.observe 'minimap.useHardwareAcceleration', =>
      @updateScroll() if @ScrollView?

    @subscriptions.add @asDisposable atom.config.observe 'minimap.displayCodeHighlights', =>
      newOptionValue = atom.config.get 'minimap.displayCodeHighlights'
      @setDisplayCodeHighlights(newOptionValue)

    @subscriptions.add @asDisposable atom.config.observe 'minimap.adjustMinimapWidthToSoftWrap', (value) =>
      if value
        @updateMinimapSize()
      else
        @resetMinimapWidthWithWrap()

    @subscriptions.add @asDisposable atom.config.observe 'editor.lineHeight', =>
      @computeScale()
      @updateMinimapView()

    @subscriptions.add @asDisposable atom.config.observe 'editor.fontSize', =>
      @computeScale()
      @updateMinimapView()

    @subscriptions.add @asDisposable atom.config.observe 'editor.softWrap', =>
      @updateMinimapSize()
      @updateMinimapView()

    @subscriptions.add @asDisposable atom.config.observe 'editor.preferredLineLength', =>
      @updateMinimapSize()

  # Internal: Computes the scale of the minimap display relatively to the
  # corresponding editor view.
  # The scale factor are used to map scrolling and offset from the minimap
  # to the editor and vice versa.
  computeScale: ->
    originalLineHeight = parseInt(@editorView.find('.lines').css('line-height'))
    computedLineHeight = @getLineHeight()

    @scaleX = @scaleY = computedLineHeight / originalLineHeight

  # Destroys this view and release all its subobjects.
  destroy: ->
    @paneView.removeClass('with-minimap')
    @off()
    @obsPane.dispose()
    @unsubscribe()
    @observer.disconnect()

    @detachFromPaneView()
    @renderView.destroy()
    @remove()

  setEditorView: (@editorView) ->
    @editor = @editorView.getEditor()
    @paneView = @editorView.getPaneView()
    @renderView?.setEditorView(@editorView)

  #    ########  ####  ######  ########  ##          ###    ##    ##
  #    ##     ##  ##  ##    ## ##     ## ##         ## ##    ##  ##
  #    ##     ##  ##  ##       ##     ## ##        ##   ##    ####
  #    ##     ##  ##   ######  ########  ##       ##     ##    ##
  #    ##     ##  ##        ## ##        ##       #########    ##
  #    ##     ##  ##  ##    ## ##        ##       ##     ##    ##
  #    ########  ####  ######  ##        ######## ##     ##    ##

  # Toggles the display of the code highlights rendering.
  #
  # value - A {Boolean} of whether to render the code highlights or not.
  setDisplayCodeHighlights: (value) ->
    if value isnt @displayCodeHighlights
      @displayCodeHighlights = value
      @renderView.forceUpdate()

  # Internal: Attaches the minimap view to the DOM.
  attachToPaneView: ->
    @paneView.append(this)
    @updateTopPosition()

  # Internal: Detaches the minimap view to the DOM.
  detachFromPaneView: ->
    @detach()

  # Returns `true` when the minimap is actually attached to the DOM.
  #
  # Returns a {Boolean}.
  minimapIsAttached: -> @paneView.find('.minimap').length is 1

  # Internal: Returns the bounds of the `TextEditorView`.
  #
  # Returns an {Object}.
  getEditorViewClientRect: -> @scrollView[0].getBoundingClientRect()

  # Internal: Returns the bounds of the editor `ScrollView`.
  #
  # returns an {Object}.
  getScrollViewClientRect: -> @scrollViewLines[0].getBoundingClientRect()

  # Returns the bounds of the minimap.
  #
  # Returns an {Object}
  getMinimapClientRect: -> @[0].getBoundingClientRect()

  #    ##     ## ########  ########     ###    ######## ########
  #    ##     ## ##     ## ##     ##   ## ##      ##    ##
  #    ##     ## ##     ## ##     ##  ##   ##     ##    ##
  #    ##     ## ########  ##     ## ##     ##    ##    ######
  #    ##     ## ##        ##     ## #########    ##    ##
  #    ##     ## ##        ##     ## ##     ##    ##    ##
  #     #######  ##        ########  ##     ##    ##    ########

  # Updates the minimap view.
  #
  # The size, scrolling and view area are updated as well as the
  # {MinimapRenderView} if the minimap own scrolling is changed during
  # the update.
  updateMinimapView: =>
    return unless @editorView
    return unless @indicator

    return if @frameRequested

    @updateMinimapSize()
    @frameRequested = true
    requestAnimationFrame =>
      @updateScroll()
      @frameRequested = false

  # Calls the `update` method of the {MinimapRenderView}.
  updateMinimapRenderView: => @renderView.update()

  # Internal: Updates the size of the minimap according to the new
  # size of the editor.
  updateMinimapSize: =>
    return unless @indicator?

    {width, height} = @getMinimapClientRect()
    editorViewRect = @getEditorViewClientRect()
    miniScrollViewRect = @renderView.getClientRect()

    evw = editorViewRect.width
    evh = editorViewRect.height

    minimapVisibilityRatio = miniScrollViewRect.height / height

    @miniScroller.height(evh / minimapVisibilityRatio)
    @miniScroller.toggleClass 'visible', minimapVisibilityRatio > 1 and @miniScrollVisible

    @miniWrapper.css {width}

    # VisibleArea's size
    @indicator.height = evh * @scaleY
    @indicator.width = width / @scaleX

    @miniVisibleArea.css
      width : width / @scaleX
      height: evh * @scaleY

    @updateMinimapWidthWithWrap()

    msvw = miniScrollViewRect.width || 0
    msvh = miniScrollViewRect.height || 0

    # Minimap's size
    @indicator.setWrapperSize width, Math.min(height, msvh)

    # Minimap ScrollView's size
    @indicator.setScrollerSize msvw, msvh

    # Compute boundary
    @indicator.updateBoundary()

  # Internal: Updates the width of the minimap based on the soft-wrap
  # and preferred line length settings.
  updateMinimapWidthWithWrap: ->
    @resetMinimapWidthWithWrap()

    size = atom.config.get('editor.preferredLineLength')
    wraps = atom.config.get('editor.softWrap')
    adjustWidth = atom.config.get('minimap.adjustMinimapWidthToSoftWrap')
    displayLeft = atom.config.get('minimap.displayMinimapOnLeft')

    if wraps and adjustWidth and size
      maxWidth = (size * @getCharWidth()) + 'px'

      @css maxWidth: maxWidth
      if displayLeft
        @editorView.find('.editor-contents').css paddingLeft: maxWidth
      else
        @editorView.find('.editor-contents').css paddingRight: maxWidth
        @editorView.find('.vertical-scrollbar').css right: maxWidth

  # Internal: Resets the styles modified when the minimap width is adjusted
  # based on the soft-wrap.
  resetMinimapWidthWithWrap: ->
    @css maxWidth: ''
    @editorView.find('.editor-contents').css paddingRight: ''
    @editorView.find('.editor-contents').css paddingLeft: ''
    @editorView.find('.vertical-scrollbar').css right: ''

  # Internal: Updates the vertical scrolling of the minimap.
  #
  # top - The scroll top offset {Number}.
  updateScrollY: (top) =>
    # Need scroll-top value when in find pane or on Vim mode(`gg`, `shift+g`).
    # Or we can find a better solution.
    if top?
      overlayY = top
    else
      scrollViewOffset = @scrollView.offset().top
      overlayerOffset = @scrollView.find('.lines').offset().top
      overlayY = -overlayerOffset + scrollViewOffset

    @indicator.setY(overlayY * @scaleY)
    @updatePositions()

  # Internal: Updates the horizontal scrolling of the minimap.
  updateScrollX: =>
    @indicator.setX(@scrollView[0].scrollLeft)
    @updatePositions()

  # Internal: Updates the scroll of the minimap both horizontally and
  # vertically.
  updateScroll: =>
    @indicator.setX(@scrollView[0].scrollLeft)
    @updateScrollY()
    @trigger 'minimap:scroll'

  # Internal: Updates the position of the various elements of the minimap
  # after a scroll changes.
  updatePositions: ->
    @transform @miniVisibleArea[0], @translate(0, @indicator.y)
    @renderView.scrollTop(@indicator.scroller.y * -1)

    @transform @renderView[0], @translate(0, @indicator.scroller.y + @getFirstVisibleScreenRow() * @getLineHeight())

    @transform @miniUnderlayer[0], @translate(0, @indicator.scroller.y)
    @transform @miniOverlayer[0], @translate(0, @indicator.scroller.y)

    @updateScrollerPosition()

  # Internal: Updates the position of the scroller indicator of the minimap.
  updateScrollerPosition: ->
    height = @miniScroller.height()
    totalHeight = @height()

    scrollRange = totalHeight - height

    @transform @miniScroller[0], @translate(0, @indicator.ratioY * scrollRange)

  # Internal: Adjusts the position of the minimap so that it sticks to the
  # editor view offset. This is needed as the minimap is positioned absolutely
  # and the tree-view, or other packages, may affect the editor view position.
  updateTopPosition: ->
    @offset top: (@offsetTop = @editorView.offset().top)

  #    ######## ##     ## ######## ##    ## ########  ######
  #    ##       ##     ## ##       ###   ##    ##    ##    ##
  #    ##       ##     ## ##       ####  ##    ##    ##
  #    ######   ##     ## ######   ## ## ##    ##     ######
  #    ##        ##   ##  ##       ##  ####    ##          ##
  #    ##         ## ##   ##       ##   ###    ##    ##    ##
  #    ########    ###    ######## ##    ##    ##     ######

  ### Internal ###

  # Subscribes from the `Editor events`.
  subscribeToEditor: ->
    @subscribe @editor, 'scroll-top-changed.minimap', @updateScrollY
    # Hacked scroll-left
    @subscribe @scrollView, 'scroll.minimap', @updateScrollX

  # Unsubscribes from the `Editor events`.
  unsubscribeFromEditor: ->
    @unsubscribe @editor, '.minimap' if @editor?
    @unsubscribe @scrollView, '.minimap' if @scrollView?

  # Event callbacks called when the active editor of a pane view
  # is changed.
  #
  # activeItem - The newly activated pane item.
  onActiveItemChanged: (activeItem) =>
    if activeItem is @editor
      @attachToPaneView() if @parent().length is 0
      @updateMinimapView()
      @renderView.forceUpdate()
    else
      @detachFromPaneView() if @parent().length is 1

  # Receives the mouse wheel event on the minimap itself and scrolls
  # the editor by the corresponding amount.
  onMouseWheel: (e) =>
    return if @isClicked
    {wheelDeltaX, wheelDeltaY} = e.originalEvent
    if wheelDeltaX
      @editorView.scrollLeft(@editorView.scrollLeft() - wheelDeltaX)
    if wheelDeltaY
      @editorView.scrollTop(@editorView.scrollTop() - wheelDeltaY)

  # Receives the mouse down event on the minimap and scrolls the
  # editor accordingly to the mouse location.
  onMouseDown: (e) =>
    # Handle left-click only
    return if e.which isnt 1
    @isClicked = true
    e.preventDefault()
    e.stopPropagation()
    # VisibleArea's center-y
    y = e.pageY - @offsetTop
    top = @indicator.computeFromCenterY(y) / @scaleY
    # @note: currently, no animation.
    @editorView.scrollTop(top)
    # Fix trigger `mousewheel` event.
    setTimeout =>
      @isClicked = false
    , 377

  # Receives the `resize:end` event and updates the minimap size and position
  # accordingly.
  onScrollViewResized: =>
    @renderView.lineCanvas.height(@editorView.height())
    @updateMinimapSize()
    @updateMinimapView()
    @renderView.forceUpdate()

  # Receives the mouse down event on the minimap visible area div and initiates
  # the drag gesture.
  onDragStart: (e) =>
    # Handle left-click only
    return if e.which isnt 1
    @isClicked = true
    e.preventDefault()
    e.stopPropagation()
    # compute distance between indicator top and where it has been grabbed
    y = e.pageY - @offsetTop
    @grabY = y - (@indicator.y + @indicator.scroller.y)
    @on 'mousemove.visible-area', @onMove

  # Receives the mouse move and performs the drag gesture.
  onMove: (e) =>
    if e.which is 1
      @onDrag e
    else
      @isClicked = false
      @off '.visible-area'

  # Performs the changes on scrolling based on the drag gesture.
  onDrag: (e) =>
    # The logic for dragging the scroller is a bit different
    # than for a single click.
    # Here we have to compensate for the minimap scroll
    y = e.pageY - @offsetTop
    top = (y-@grabY) * (@indicator.scroller.height-@indicator.height) / (@indicator.wrapper.height-@indicator.height)
    @editorView.scrollTop(top / @scaleY)


  #     #######  ######## ##     ## ######## ########
  #    ##     ##    ##    ##     ## ##       ##     ##
  #    ##     ##    ##    ##     ## ##       ##     ##
  #    ##     ##    ##    ######### ######   ########
  #    ##     ##    ##    ##     ## ##       ##   ##
  #    ##     ##    ##    ##     ## ##       ##    ##
  #     #######     ##    ##     ## ######## ##     ##

  # Returns a {String} containing a css transform translation.
  #
  # x - The {Number} for the x axis translation.
  # y - The {Number} for the y axis translation.
  #
  # Returns a {String}.
  translate: (x=0,y=0) ->
    if atom.config.get 'minimap.useHardwareAcceleration'
      "translate3d(#{x}px, #{y}px, 0)"
    else
      "translate(#{x}px, #{y}px)"

  # Returns a {String} containing a css transform scale.
  #
  # scale - The scale {Number}.
  #
  # Returns a {String}.
  scale: (scale) -> " scale(#{scale}, #{scale})"

  # Applies a css transformation to a DOM element.
  #
  # el - The DOM node onto apply the transformation.
  # transform - The css transformation {String}.
  transform: (el, transform) ->
    el.style.webkitTransform = el.style.transform = transform

  # Convert a subscription on the deprecated model with a `::off` method into a
  # `Disposable`.
  #
  # subscription - The subscription {Object} to wrap in a `Disposable`.
  #
  # Returns a `Disposable`.
  asDisposable: (subscription) -> new Disposable -> subscription.off()
