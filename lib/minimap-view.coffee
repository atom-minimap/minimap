{$, View} = require 'atom'

MinimapEditorView = require './minimap-editor-view'

CONFIGS = require './config'

require './resizeend.js'

module.exports =
class MinimapView extends View
  @content: ->
    @div class: 'minimap', =>
      @div outlet: 'miniWrapper', class: "minimap-wrapper", =>
        @subview 'miniEditorView', new MinimapEditorView()
        @div outlet: 'miniOverlayer', class: "minimap-overlayer"

  configs: {}

  constructor: (@paneView) ->
    @scaleX = 0.2
    @scaleY = @scaleX * 0.8
    @minimapScale = @scale(@scaleX, @scaleY)
    super

  initialize: ->
    @attach()

    @on 'mousewheel', @mouseWheel
    @on 'mousedown', @mouseDown

    @subscribe @paneView.model.$activeItem, @onActiveItemChanged
    @subscribe @paneView.model, 'destroy', => @destroy()
    @subscribe $(window), 'resize:end', @resizeend

    #@subscribe atom.workspaceView, 'cursor:moved', =>
    #  @update()

  attach: ->
    themeProp = 'minimap.theme'
    @subscribe atom.config.observe themeProp, callNow: true, =>
      @configs.theme = atom.config.get(themeProp) || CONFIGS.theme
      @updateTheme()

  destroy: ->
    @off 'mousewheel', @mouseWheel
    @off 'mousedown', @mouseDown
    @unsubscribe @paneView.model.$activeItem
    @unsubscribe @paneView.model, 'destroy'
    @unsubscribe $(window), 'resize:end'

    @paneView.removeClass('with-minimap')
    @remove()
    @detach()

  reset: -> @transform @minimapWrapper[0], @scale()

  # Update Styles
  updateTheme: ->
    @attr 'data-theme': this.configs.theme

  onActiveItemChanged: (item) =>
    # Fix called twice when open minimap!
    return if @activeItem == item
    @activeItem = item
    @getActiveEditor()
    @updateMinimapView()

  getActiveEditor: ->
    @editorView = @paneView.viewForItem(@activeItem)
    # Ignore `Settings Tab` or `Tabs` are empty, the pane isn't a editor-view.
    if !@editorView || !@editorView.hasClass('editor')
      return @editor = @scrollView = null

    @editor = @editorView.getEditor()
    @scrollView = @editorView.find('.scroll-view')
    @scrollViewLines = @scrollView.find('.lines')

    # current editor bind scrollTop event
    @editor.off 'scroll-top-changed.editor'
    @editor.on 'scroll-top-changed.editor', @scrollTop
    @editor.off 'scroll-left-changed.editor'
    @editor.on 'scroll-left-changed.editor', @scrollLeft


  # wtf? Long long function!
  updateMinimapView: ->
    unless @paneView.find('.minimap').length
      @miniEditorView.css width: @scrollView.width()
      @miniScrollView = @miniEditorView.scrollView
      @paneView.addClass('with-minimap').append(this)

    if !@editor
      @addClass('hide')
      return
    if @hasClass('hide')
      @removeClass('hide')

    # update minimap-editor
    setImmediate =>
      # FIXME Due to racing conditions during the `destroyed`
      # event dispatch the editor can be null, until a better
      # solution is implemented it will prevent the delayed
      # code from raising an error.
      if @editor?
        @transform @miniScrollView[0], @translateY(0)
        @miniEditorView.update(@editorView)

    # offset minimap
    @offset({ 'top': @editorView.offset().top })

    # reset minimap layer size
    @reset()

    # get rects
    @editorViewRect = @getEditorViewClientRect()
    @scrollViewRect = @getScrollViewClientRect()
    @miniScrollViewRect = @miniEditorView.getClientRect()

    # reset minimap-overlayer
    @miniOverlayer.css
      width: @scrollViewRect.width
      height: @editorViewRect.height
      '-webkit-transform': @translateY()
      transform: @translateY()

    @transform @miniWrapper[0], @minimapScale

    setImmediate =>
      @scrollTop(@editorView.scrollTop())

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

  scrollLeft: (left) =>
    @miniScrollView.scrollLeft(left * @scaleX)

  scrollTop: (top) =>
    minimapHeight = @miniScrollView.outerHeight()
    scrollViewHeight = @scrollView.outerHeight()

    minimapCanScroll = (minimapHeight * @scaleY) > scrollViewHeight
    minimapScroll = 0

    if minimapCanScroll
      editorLinesHeight = @scrollViewLines.outerHeight()
      miniOverLayerHeight = @miniOverlayer.outerHeight()


      maxScroll = editorLinesHeight - miniOverLayerHeight
      topPercent = top / maxScroll
      minimapMaxScroll = editorLinesHeight - miniOverLayerHeight / @scaleY
      minimapScroll = topPercent * minimapMaxScroll * -1

      @transform @miniWrapper[0], @minimapScale + @translateY(minimapScroll)

    else
      @transform @miniWrapper[0], @minimapScale

    # storing miniScrollView scrollTop
    @data('top', minimapScroll)
    @transform @miniOverlayer[0], @translateY(top)


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
    @editorView.scrollTop(top)
    # Fix trigger `mousewheel` event.
    setTimeout =>
      @isClicked = false
    , 377

  resizeend: =>
    @updateMinimapView()
