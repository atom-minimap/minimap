{$, View, EditorView} = require 'atom'
Debug = require 'prolix'
Delegato = require 'delegato'

MinimapEditorView = require './minimap-editor-view'
MinimapIndicator = require './minimap-indicator'
MinimapOpenQuickSettingsView = require './minimap-open-quick-settings-view'

module.exports =
class MinimapView extends View
  Debug('minimap').includeInto(this)
  Delegato.includeInto(this)

  @delegatesMethods 'getLineHeight', 'getCharHeight', 'getCharWidth', 'getLinesCount', 'getMinimapHeight', 'getMinimapScreenHeight', 'getMinimapHeightInLines', 'getFirstVisibleScreenRow', 'getLastVisibleScreenRow', 'addLineClass', 'removeLineClass', 'removeAllLineClasses', 'pixelPositionForScreenPosition', 'decorateMarker', 'removeDecoration', 'decorationsForScreenRowRange', 'removeAllDecorationsForMarker', toProperty: 'miniEditorView'

  @delegatesProperty 'lineHeight', toMethod: 'getLineHeight'
  @delegatesProperty 'charWidth', toMethod: 'getCharWidth'

  @content: ->
    @div class: 'minimap', =>
      @subview 'openQuickSettings', new MinimapOpenQuickSettingsView if atom.config.get('minimap.displayPluginsControls')
      @div outlet: 'miniScroller', class: "minimap-scroller"
      @div outlet: 'miniWrapper', class: "minimap-wrapper", =>
        @div outlet: 'miniUnderlayer', class: "minimap-underlayer"
        @subview 'miniEditorView', new MinimapEditorView
        @div outlet: 'miniOverlayer', class: "minimap-overlayer", =>
          @div outlet: 'miniVisibleArea', class: "minimap-visible-area"

  isClicked: false

  # VIEW CREATION/DESTRUCTION

  constructor: (@editorView) ->
    @editor = @editorView.getEditor()
    @paneView = @editorView.getPane()

    @paneView.addClass('with-minimap')

    super

    @computeScale()
    @miniScrollView = @miniEditorView.scrollView
    @offsetLeft = 0
    @offsetTop = 0
    @indicator = new MinimapIndicator()

    @scrollView = @editorView.scrollView
    @scrollViewLines = @scrollView.find('.lines')

    @subscribeToEditor()

    @miniEditorView.minimapView = this
    @miniEditorView.setEditorView(@editorView)

    @updateMinimapView()

  initialize: ->
    @on 'mousewheel', @onMouseWheel
    @on 'mousedown', @onMouseDown
    @miniVisibleArea.on 'mousedown', @onDragStart

    @obsPane = @paneView.model.observeActiveItem @onActiveItemChanged

    # Fix items movin to another pane.
    @subscribe @paneView.model, 'item-removed', (item) -> item.off? '.minimap'

    @subscribe @miniEditorView, 'minimap:updated', @updateMinimapSize
    @subscribe @miniEditorView, 'minimap:scaleChanged', =>
      @computeScale()
      @updatePositions()

    # The mutation observer is required so that we can relocate the minimap
    # everytime the children of the pane changes.
    @observer = new MutationObserver (mutations) =>
      @adjustTopPosition()

    config = childList: true
    @observer.observe @paneView.element, config

    # The resize:end event is dispatched at the end of an animated resize
    # to not flood the cpu with updates.
    @subscribe $(window), 'resize:end', @onScrollViewResized

    @miniScrollVisible = atom.config.get('minimap.minimapScrollIndicator')
    @miniScroller.toggleClass 'visible', @miniScrollVisible

    @displayCodeHighlights = atom.config.get('minimap.displayCodeHighlights')

    atom.config.observe 'minimap.minimapScrollIndicator', =>
      @miniScrollVisible = atom.config.get('minimap.minimapScrollIndicator')
      @miniScroller.toggleClass 'visible', @miniScrollVisible

    atom.config.observe 'minimap.useHardwareAcceleration', =>
      @updateScroll() if @ScrollView?

    atom.config.observe 'minimap.displayCodeHighlights', =>
      newOptionValue = atom.config.get 'minimap.displayCodeHighlights'
      @setDisplayCodeHighlights(newOptionValue)

  computeScale: ->
    originalLineHeight = parseInt(@editorView.find('.lines').css('line-height'))
    computedLineHeight = @getLineHeight()

    @scaleX = @scaleY = computedLineHeight / originalLineHeight

  adjustTopPosition: ->
    @offset top: (@offsetTop = @editorView.offset().top)

  setDisplayCodeHighlights: (value) ->
    if value isnt @displayCodeHighlights
      @displayCodeHighlights = value
      @miniEditorView.forceUpdate()

  destroy: ->
    @paneView.removeClass('with-minimap')
    @off()
    @obsPane.dispose()
    @unsubscribe()
    @observer.disconnect()

    @detachFromPaneView()
    @miniEditorView.destroy()
    @remove()

  # MINIMAP DISPLAY MANAGEMENT

  attachToPaneView: ->
    @paneView.append(this)
    @adjustTopPosition()

  detachFromPaneView: ->
    @detach()

  minimapIsAttached: -> @paneView.find('.minimap').length is 1

  # EDITOR VIEW MANAGEMENT

  unsubscribeFromEditor: ->
    @unsubscribe @editor, '.minimap' if @editor?
    @unsubscribe @scrollView, '.minimap' if @scrollView?

  subscribeToEditor: ->
    @subscribe @editor, 'scroll-top-changed.minimap', @updateScrollY
    # Hacked scroll-left
    @subscribe @scrollView, 'scroll.minimap', @updateScrollX

  getEditorViewClientRect: -> @scrollView[0].getBoundingClientRect()

  getScrollViewClientRect: -> @scrollViewLines[0].getBoundingClientRect()

  getMinimapClientRect: -> @[0].getBoundingClientRect()

  # UPDATE METHODS

  updateMinimapEditorView: => @miniEditorView.update()

  updateMinimapSize: =>
    return unless @indicator?

    {width, height} = @getMinimapClientRect()
    editorViewRect = @getEditorViewClientRect()
    miniScrollViewRect = @miniEditorView.getClientRect()

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

    msvw = miniScrollViewRect.width || 0
    msvh = miniScrollViewRect.height || 0

    # Minimap's size
    @indicator.setWrapperSize width, Math.min(height, msvh)

    # Minimap ScrollView's size
    @indicator.setScrollerSize msvw, msvh

    # Compute boundary
    @indicator.updateBoundary()


  updateMinimapView: =>
    return unless @editorView
    return unless @indicator

    return if @frameRequested

    @updateMinimapSize()
    @frameRequested = true
    requestAnimationFrame =>
      @updateScroll()
      @frameRequested = false

  updateScrollY: (top) =>
    # Need scroll-top value when in find pane or on Vim mode(`gg`, `shift+g`).
    # Or we can find a better solution.
    if top?
      overlayY = top
    else
      scrollViewOffset = @scrollView.offset().top
      overlayerOffset = @scrollView.find('.overlayer').offset().top
      overlayY = -overlayerOffset + scrollViewOffset

    @indicator.setY(overlayY * @scaleY)
    @updatePositions()

  updateScrollX: =>
    @indicator.setX(@scrollView[0].scrollLeft)
    @updatePositions()

  updateScroll: =>
    @indicator.setX(@scrollView[0].scrollLeft)
    @updateScrollY()
    @trigger 'minimap:scroll'

  updatePositions: ->
    @transform @miniVisibleArea[0], @translate(0, @indicator.y)
    @miniEditorView.scrollTop(@indicator.scroller.y * -1)

    @transform @miniEditorView[0], @translate(0, @indicator.scroller.y + @getFirstVisibleScreenRow() * @getLineHeight())

    @transform @miniUnderlayer[0], @translate(0, @indicator.scroller.y)
    @transform @miniOverlayer[0], @translate(0, @indicator.scroller.y)

    @updateScrollerPosition()

  updateScrollerPosition: ->
    height = @miniScroller.height()
    totalHeight = @height()

    scrollRange = totalHeight - height

    @transform @miniScroller[0], @translate(0, @indicator.ratioY * scrollRange)

  # EVENT CALLBACKS

  onActiveItemChanged: (activeItem) =>
    if activeItem is @editor
      @attachToPaneView() if @parent().length is 0
      @updateMinimapView()
      @miniEditorView.forceUpdate()
    else
      @detachFromPaneView() if @parent().length is 1

  onMouseWheel: (e) =>
    return if @isClicked
    {wheelDeltaX, wheelDeltaY} = e.originalEvent
    if wheelDeltaX
      @editorView.scrollLeft(@editorView.scrollLeft() - wheelDeltaX)
    if wheelDeltaY
      @editorView.scrollTop(@editorView.scrollTop() - wheelDeltaY)

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

  onScrollViewResized: =>
    @miniEditorView.lineCanvas.height(@editorView.height())
    @updateMinimapView()
    @miniEditorView.forceUpdate()

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

  onMove: (e) =>
    if e.which is 1
      @onDrag e
    else
      @isClicked = false
      @off '.visible-area'

  onDrag: (e) =>
    # The logic for dragging the scroller is a bit different
    # than for a single click.
    # Here we have to compensate for the minimap scroll
    y = e.pageY - @offsetTop
    top = (y-@grabY) * (@indicator.scroller.height-@indicator.height) / (@indicator.wrapper.height-@indicator.height)
    @editorView.scrollTop(top / @scaleY)


  # OTHER PRIVATE METHODS

  scale: (x=1,y=1) -> "scale(#{x}, #{y}) "
  translate: (x=0,y=0) ->
    if atom.config.get 'minimap.useHardwareAcceleration'
      "translate3d(#{x}px, #{y}px, 0)"
    else
      "translate(#{x}px, #{y}px)"

  transform: (el, transform) ->
    el.style.webkitTransform = el.style.transform = transform
