{$, View} = require 'atom'

MinimapEditorView = require './minimap-editor-view'
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
    @minimapScroll = 0
    @transform @miniWrapper[0], @minimapScale
    # dragging's status
    @isPressed = false

  initialize: ->
    @on 'mousewheel', @onMouseWheel
    @on 'mousedown', @onMouseDown

    @on 'mousedown', '.minimap-visible-area', @onDragStart

    @subscribe @paneView.model.$activeItem, @onActiveItemChanged
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
    @unsubscribe @editor, '.minimap'

  subscribeToEditor: ->
    @subscribe @editor, 'screen-lines-changed.minimap', @updateMinimapEditorView
    @subscribe @editor, 'scroll-top-changed.minimap', @updateScroll
    #@subscribe @editor, 'scroll-left-changed.minimap', @updateScroll

  # See /Applications/Atom.app/Contents/Resources/app/src/pane-view.js#349
  # pane-view's private api
  # `paneView.activeView` and `paneView.activeItem`
  getEditorView: -> @paneView.viewForItem(@activeItem)

  getEditorViewClientRect: -> @scrollView[0].getBoundingClientRect()

  getScrollViewClientRect: -> @scrollViewLines[0].getBoundingClientRect()

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
    # offset minimap
    @offset top: @editorView.offset().top

    @editorViewRect = @getEditorViewClientRect()
    @miniVisibleArea.css
      width: @editorViewRect.width
      height: @editorViewRect.height

    setImmediate => @updateScroll()

  updateScroll: (top) =>
    minimapHeight = @miniScrollView.outerHeight()
    scrollViewHeight = @scrollView.outerHeight()
    # Need scroll-top value when in find pane or on Vim mode(`gg`, `shift+g`).
    # Or we can find a better solution.
    if top?
      overlayY = top
    else
      scrollViewOffset = @scrollView.offset().top
      overlayerOffset = @scrollView.find('.overlayer').offset().top
      overlayY = -overlayerOffset + scrollViewOffset
    scrollRatio = overlayY / (minimapHeight - scrollViewHeight)
    minimapMaxScroll = ((minimapHeight * @scaleY) - scrollViewHeight) / @scaleY
    minimapCanScroll = (minimapHeight * @scaleY) > scrollViewHeight

    if minimapCanScroll
      @minimapScroll = -(scrollRatio * minimapMaxScroll)
      @transform @miniWrapper[0], @minimapScale + @translateY(@minimapScroll)
    else
      @minimapScroll = 0
      @transform @miniWrapper[0], @minimapScale

    @transform @miniVisibleArea[0], @translateY(overlayY)

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
    minimapHeight = @miniScrollView.outerHeight()
    miniVisibleAreaHeight = @miniVisibleArea.height()
    # Overlayer's center-y
    y = e.pageY - @offset().top
    y = y - @minimapScroll * @scaleY
    n = y / @scaleY
    top = n - miniVisibleAreaHeight / 2
    top = Math.max(top, 0)
    top = Math.min(top, minimapHeight - miniVisibleAreaHeight)
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
  translateY: (y=0) -> "translate3d(0, #{y}px, 0)"
  transform: (el, transform) ->
    el.style.webkitTransform = el.style.transform = transform
