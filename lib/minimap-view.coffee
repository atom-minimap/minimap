{$, View} = require 'atom'

MinimapEditorView = require './minimap-editor-view'
MinimapIndicator = require './minimap-indicator'
Debug = require 'prolix'

CONFIGS = require './config'

module.exports =
class MinimapView extends View
  Debug('minimap').includeInto(this)

  @content: ->
    @div class: 'minimap', =>
      @div outlet: 'miniWrapper', class: "minimap-wrapper", =>
        @div outlet: 'miniUnderlayer', class: "minimap-underlayer"
        @subview 'miniEditorView', new MinimapEditorView()
        @div outlet: 'miniOverlayer', class: "minimap-overlayer", =>
          @div outlet: 'miniVisibleArea', class: "minimap-visible-area"

  configs: {}
  isClicked: false

  # VIEW CREATION/DESTRUCTION

  constructor: (@paneView) ->
    super

    @scaleX = 0.2
    @scaleY = @scaleX * 0.8
    @minimapScale = @scale(@scaleX, @scaleY)
    @miniScrollView = @miniEditorView.scrollView
    @transform @miniWrapper[0], @minimapScale
    # dragging's status
    @isPressed = false
    @offsetLeft = 0
    @offsetTop = 0
    @indicator = new MinimapIndicator()

  initialize: ->
    @on 'mousewheel', @onMouseWheel
    @on 'mousedown', @onMouseDown

    @on 'mousedown', '.minimap-visible-area', @onDragStart

    @subscribe @paneView.model.$activeItem, @onActiveItemChanged
    # Fixed item move to other pane.
    @subscribe @paneView.model, 'item-removed', (item) -> item.off '.minimap'

    @subscribe @miniEditorView, 'minimap:updated', @updateMinimapView

    @subscribe $(window), 'resize:end', @onScrollViewResized

    themeProp = 'minimap.theme'
    @subscribe atom.config.observe themeProp, callNow: true, =>
      @configs.theme = atom.config.get(themeProp) ? CONFIGS.theme
      @updateTheme()


  destroy: ->
    @off()
    @unsubscribe()

    @deactivatePaneViewMinimap()
    @miniEditorView.destroy()
    @remove()

  # MINIMAP DISPLAY MANAGEMENT

  attachToPaneView: -> @paneView.append(this)
  detachFromPaneView: -> @detach()

  activatePaneViewMinimap: ->
    @paneView.addClass('with-minimap')
    @attachToPaneView()

  deactivatePaneViewMinimap: ->
    @paneView.removeClass('with-minimap')
    @detachFromPaneView()

  activeViewSupportMinimap: -> @getEditor()?
  minimapIsAttached: -> @paneView.find('.minimap').length is 1

  # EDITOR VIEW MANAGEMENT

  storeActiveEditor: ->
    @editorView = @getEditorView()
    @editor = @editorView.getEditor()

    @unsubscribeFromEditor()

    @scrollView = @editorView.scrollView
    @scrollViewLines = @scrollView.find('.lines')

    @subscribeToEditor()

  unsubscribeFromEditor: ->
    @unsubscribe @editor, '.minimap' if @editor?
    @unsubscribe @scrollView, '.minimap' if @scrollView?

  subscribeToEditor: ->
    @subscribe @editor, 'screen-lines-changed.minimap', @updateMinimapEditorView
    @subscribe @editor, 'scroll-top-changed.minimap', @updateScrollY
    # Hacked scroll-left
    @subscribe @scrollView, 'scroll.minimap', @updateScrollX

  # See /Applications/Atom.app/Contents/Resources/app/src/pane-view.js#349
  # pane-view's private api
  # `paneView.activeView` and `paneView.activeItem`
  getEditorView: -> @paneView.viewForItem(@activeItem)

  getEditorViewClientRect: -> @scrollView[0].getBoundingClientRect()

  getScrollViewClientRect: -> @scrollViewLines[0].getBoundingClientRect()

  getMinimapClientRect: -> @[0].getBoundingClientRect()

  # See Atom's API /api/classes/Pane.html#getActiveEditor-instance
  # Returns an Editor if the pane item is an Editor, or null otherwise.
  getEditor: -> @paneView.model.getActiveEditor()

  setMinimapEditorView: ->
    # update minimap-editor
    setImmediate => @miniEditorView.setEditorView(@editorView)

  # UPDATE METHODS

  # Update Styles
  updateTheme: -> @attr 'data-theme': @configs.theme

  updateMinimapEditorView: => @miniEditorView.update()

  updateMinimapView: =>
    return unless @editorView
    return unless @indicator

    # offset minimap
    @offset top: (@offsetTop = @editorView.offset().top)

    {width, height} = @getMinimapClientRect()
    editorViewRect = @getEditorViewClientRect()
    miniScrollViewRect = @miniEditorView.getClientRect()

    width /= @scaleX
    height /= @scaleY

    evw = editorViewRect.width
    evh = editorViewRect.height

    @miniWrapper.css {width}

    # VisibleArea's size
    @miniVisibleArea.css
      width : @indicator.width  = width
      height: @indicator.height = evh

    msvw = miniScrollViewRect.width || 0
    msvh = miniScrollViewRect.height || 0

    # Minimap's size
    @indicator.setWrapperSize width, Math.min(height, msvh)

    # Minimap ScrollView's size
    @indicator.setScrollerSize msvw, msvh

    # Compute boundary
    @indicator.updateBoundary()

    setImmediate => @updateScroll()

  updateScrollY: (top) =>
    # Need scroll-top value when in find pane or on Vim mode(`gg`, `shift+g`).
    # Or we can find a better solution.
    if top?
      overlayY = top
    else
      scrollViewOffset = @scrollView.offset().top
      overlayerOffset = @scrollView.find('.overlayer').offset().top
      overlayY = -overlayerOffset + scrollViewOffset

    @indicator.setY(overlayY)
    @updatePositions()

  updateScrollX: =>
    @indicator.setX(@scrollView[0].scrollLeft)
    @updatePositions()

  updateScroll: =>
    @updateScrollX()
    @updateScrollY()

  updatePositions: ->
    @transform @miniVisibleArea[0], @translate(@indicator.x, @indicator.y)
    @transform @miniWrapper[0], @minimapScale + @translate(@indicator.scroller.x, @indicator.scroller.y)

  # EVENT CALLBACKS

  onActiveItemChanged: (item) =>
    # Fix called twice when opening minimap!
    return if item is @activeItem
    @activeItem = item

    if @activeViewSupportMinimap()
      @log 'minimap is supported by the current tab'
      @activatePaneViewMinimap() unless @minimapIsAttached()
      @storeActiveEditor()
      @setMinimapEditorView()
      @updateMinimapView()
    else
      # Ignore any tab that is not an editor
      @deactivatePaneViewMinimap()
      @log 'minimap is not supported by the current tab'

  onMouseWheel: (e) =>
    return if @isClicked
    {wheelDeltaX, wheelDeltaY} = e.originalEvent
    if wheelDeltaX
      @editorView.scrollLeft(@editorView.scrollLeft() - wheelDeltaX)
    if wheelDeltaY
      @editorView.scrollTop(@editorView.scrollTop() - wheelDeltaY)

  onMouseDown: (e) =>
    @isClicked = true
    e.preventDefault()
    e.stopPropagation()
    # VisibleArea's center-y
    y = e.pageY - @offsetTop
    top = @indicator.computeFromCenterY(y / @scaleY)
    # @note: currently, no animation.
    @editorView.scrollTop(top)
    # Fix trigger `mousewheel` event.
    setTimeout =>
      @isClicked = false
    , 377

  onScrollViewResized: => @updateMinimapView()

  onDragStart: (e) =>
    # only supports for left-click
    return if e.which isnt 1
    @isPressed = true
    @on 'mousemove.visible-area', @onMove
    @on 'mouseup.visible-area', @onDragEnd

  onMove: (e) =>
    @onMouseDown e if @isPressed

  onDragEnd: (e) =>
    @isPressed = false
    @off '.visible-area'

  # OTHER PRIVATE METHODS

  scale: (x=1,y=1) -> "scale(#{x}, #{y}) "
  translate: (x=0,y=0) -> "translate3d(#{x}px, #{y}px, 0)"
  transform: (el, transform) ->
    el.style.webkitTransform = el.style.transform = transform
