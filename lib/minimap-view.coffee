{$, View} = require 'atom'

MinimapEditorView = require './minimap-editor-view'
Debug = require './mixins/debug'

CONFIGS = require './config'

require './resizeend.js'

module.exports =
class MinimapView extends View
  Debug.includeInto(this)

  @content: ->
    @div class: 'minimap', =>
      @div outlet: 'miniWrapper', class: "minimap-wrapper", =>
        @subview 'miniEditorView', new MinimapEditorView()
        @div outlet: 'miniOverlayer', class: "minimap-overlayer"

  configs: {}

  constructor: (@paneView) ->
    super

    @scaleX = 0.2
    @scaleY = @scaleX * 0.8
    @minimapScale = @scale(@scaleX, @scaleY)
    @miniScrollView = @miniEditorView.scrollView

  initialize: ->
    @on 'mousewheel', @mouseWheel
    @on 'mousedown', @mouseDown

    @subscribe @paneView.model.$activeItem, @onActiveItemChanged
    @subscribe @miniEditorView, 'minimap:updated', @updateScroll
    @subscribe $(window), 'resize:end', @resizeend

    themeProp = 'minimap.theme'
    @subscribe atom.config.observe themeProp, callNow: true, =>
      @configs.theme = atom.config.get(themeProp) ? CONFIGS.theme
      @updateTheme()

  destroy: ->
    @off 'mousewheel', @mouseWheel
    @off 'mousedown', @mouseDown
    @unsubscribe()

    @deactivatePaneViewMinimap()
    @miniEditorView.destroy()
    @detach()

  reset: -> @transform @minimapWrapper[0], @scale()

  # Update Styles
  updateTheme: ->
    @attr 'data-theme': @configs.theme

  onActiveItemChanged: (item) =>
    # Fix called twice when opening minimap!
    return if @activeItem == item
    @activeItem = item
    @updateMinimapView()
      @storeActiveEditor()

  storeActiveEditor: ->
    @editorView = @getEditorView()

    @editor = @editorView.getEditor()
    @scrollView = @editorView.scrollView
    @scrollViewLines = @scrollView.find('.lines')

    # current editor bind scrollTop event
    @editor.off 'scroll-top-changed.editor'
    @editor.on 'scroll-top-changed.editor', @updateScroll
    @editor.off 'scroll-left-changed.editor'
    @editor.on 'scroll-left-changed.editor', @updateScroll

  getEditorView: -> @paneView.viewForItem(@activeItem)

  activeTabSupportMinimap: ->
    editorView = @getEditorView()

    editorView? and editorView.hasClass('editor')

  attachToPaneView: -> @paneView.append(this)
  detachFromPaneView: -> @remove()

  activatePaneViewMinimap: ->
    @paneView.addClass('with-minimap')
    @attachToPaneView()

  deactivatePaneViewMinimap: ->
    @paneView.removeClass('with-minimap')
    @detachFromPaneView()
  # wtf? Long long function!
  updateMinimapView: ->
    unless @paneView.find('.minimap').length
      @miniEditorView.css width: @scrollView.width()
      @paneView.addClass('with-minimap').append(this)

    if !@editor
      @addClass('hide')
      return
    if @hasClass('hide')
      @removeClass('hide')
  minimapIsAttached: -> @paneView.find('.minimap').length is 1


    # update minimap-editor
    setImmediate =>
      # FIXME Due to racing conditions during the `destroyed`
      # event dispatch the editor can be null, until a better
      # solution is implemented it will prevent the delayed
      # code from raising an error.
      if @editor?
        @transform @miniScrollView[0], @translateY(0)
        @miniEditorView.setEditorView(@editorView)

    # offset minimap
    @offset({ 'top': @editorView.offset().top })

    # reset size of minimap layer
    @reset()

    # get rects
    @editorViewRect = @getEditorViewClientRect()
    @scrollViewRect = @getScrollViewClientRect()

    # reset minimap-overlayer
    # top will be set 0 when reseting
    @miniOverlayer.addClass 'hide'
    @miniOverlayer.css
      width: @scrollViewRect.width
      height: @editorViewRect.height
      '-webkit-transform': @translateY()
      transform: @translateY()
    @miniOverlayer.removeClass 'hide'

    @transform @miniWrapper[0], @minimapScale

    setImmediate => @updateScroll()

  reset: -> @transform @miniWrapper[0], @scale()

  getEditorViewClientRect: ->
    @scrollView[0].getBoundingClientRect()

  getScrollViewClientRect: ->
    @scrollViewLines[0].getBoundingClientRect()

  mouseWheel: (e) =>
    return if @isClicked
    {wheelDeltaX, wheelDeltaY} = e.originalEvent
    if wheelDeltaX
      @editorView.scrollLeft(@editorView.scrollLeft() - wheelDeltaX)
    if wheelDeltaY
      @editorView.scrollTop(@editorView.scrollTop() - wheelDeltaY)

  updateScroll: =>
    minimapHeight = @miniScrollView.outerHeight()
    scrollViewHeight = @scrollView.outerHeight()
    scrollViewOffset = @scrollView.offset().top
    overlayerOffset = @scrollView.find('.overlayer').offset().top
    editorLinesHeight = @scrollViewLines.height()
    miniOverLayerHeight = @miniOverlayer.outerHeight()
    overlayY = -overlayerOffset + scrollViewOffset
    minimapScroll = 0

    minimapCanScroll = (minimapHeight * @scaleY) > scrollViewHeight

    if minimapCanScroll
      minimapMaxScroll = minimapHeight * @scaleY
      overlayerScroll = overlayY / editorLinesHeight
      minimapScroll = -overlayerScroll * minimapMaxScroll

      @transform @miniWrapper[0], @minimapScale + @translateY(minimapScroll)

    else
      @transform @miniWrapper[0], @minimapScale

    @miniScrollView.data('top', minimapScroll)
    @transform @miniOverlayer[0], @translateY(overlayY)

  scale: (x=1,y=1) -> "scale(#{x}, #{y}) "
  translateY: (y=0) -> "translate3d(0, #{y}px, 0)"
  transform: (el, transform) ->
    el.style.webkitTransform = el.style.transform = transform

  isClicked: false
  mouseDown: (e) =>
    @isClicked = true
    e.preventDefault()
    e.stopPropagation()
    miniOverLayerHeight = @miniOverlayer.height()
    # overlayer center, point-y
    y = e.pageY - @offset().top
    y = y - @data('top') * @scaleY || 0
    n = y / @scaleY
    top = n - miniOverLayerHeight / 2
    top = Math.max(top, 0)
    top = Math.min(top, @miniScrollView.outerHeight() - miniOverLayerHeight)
    # @note: currently, no animation.
    @editorView.updateScroll()
    # Fix trigger `mousewheel` event.
    setTimeout =>
      @isClicked = false
    , 377

  resizeend: =>
    @updateMinimapView()
