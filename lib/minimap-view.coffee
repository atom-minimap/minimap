{View} = require 'atom'

MinimapEditorView = require './minimap-editor-view'

CONFIGS = require './config'

minTop = 0
maxTop = 0

scaleX = 1
scaleY = 1

module.exports =
class MinimapView extends View
  @content: ->
    @div class: 'minimap', =>
      @div outlet: 'miniOverlayer', class: "minimap-overlayer"

  configs: {}

  initialize: ->
    atom.workspaceView.minimap = this

    @attach()

    this.on('mousewheel', @mousewheel.bind(this))

    @subscribe atom.workspaceView, 'pane-container:active-pane-item-changed', =>
      @updateActiveStatus()

    #@subscribe atom.workspaceView, 'cursor:moved', =>
    #  @update()


  attach: ->
    themeProp = 'minimap.theme'
    this.subscribe atom.config.observe themeProp, callNow: true, =>
      this.configs.theme = atom.config.get(themeProp) || CONFIGS.theme
      this.updateTheme()

  destroy: ->
    atom.workspaceView.minimap = null
    @remove()
    @detach()

  # Update Styles
  updateTheme: ->
    this.attr('data-theme', this.configs.theme)

  updateActiveStatus: ->
    @getActivePane()
    @getActiveEditor()
    @updateMinimapView()

  getActivePane: ->
    unless @pane
      @pane = atom.workspaceView.getActivePane()

  getActiveEditor: ->
    @editorView = atom.workspaceView.getActiveView()
    # Ignore `Settings Tab` or `Tabs` are empty.
    if !@editorView || !@editorView.hasClass('editor')
      return @editor = @scrollView = null
    @editor = @editorView.getEditor()
    @scrollView = @editorView.find('.scroll-view')
    @scrollViewLines = @scrollView.find('.lines')


  # wtf? Long long function!
  updateMinimapView: ->
    unless @pane.find('.minimap').length
      @miniEditorView = new MinimapEditorView()
      @miniScrollView = @miniEditorView.find('.scroll-view')
      @miniOverlayer.before(@miniEditorView)
      @pane.append(this)

    if !@editor
      this.addClass('hide')
      return
    if this.hasClass('hide')
      this.removeClass('hide')

    # update minimap-editor
    @miniEditorView.update(@editor.displayBuffer.screenLines)

    # offset minimap
    this.offset({ 'top': @editorView.offset().top })

    # current editor bind scrollTop event
    @editor.off('scroll-top-changed.editor')
    @editor.on('scroll-top-changed.editor', @scrollTop.bind(this))

    # reset minimap layer size
    @reset()

    # get rects
    @editorViewRect = @getEditorViewClientRect()
    @scrollViewRect = @getScrollViewClientRect()
    @miniScrollViewRect = @miniEditorView.getClientRect()

    # reset minimap-editor
    maxTop = @miniEditorView.height()
    @miniScrollView.css({ top: 0 })

    # reset minimap-overlayer
    @miniOverlayer.css({ height: @editorViewRect.height, top: 0 })

    scaleX = .2
    scaleY = scaleX * .8
    width = 125 / scaleX
    x = y = 0
    @transform(width, [scaleX, scaleY], [x, y])
    #if @scrollViewRect.height < @editorViewRect.height #else

    @scrollTop(@editorView.scrollTop())


  reset: ->
    scaleX = scaleY = 1
    @transform(125, [scaleX, scaleY], [0, 0])

  getEditorViewClientRect: ->
    @scrollView[0].getBoundingClientRect()

  getScrollViewClientRect: ->
    @scrollViewLines[0].getBoundingClientRect()

  mousewheel: (e) ->
    delta = e.originalEvent.wheelDeltaY
    if delta
      @editorView.scrollTop(@editorView.scrollTop() - delta)

  scrollTop: (top) ->
    h = @miniEditorView.height() * scaleY
    if h > @scrollView.height()
      miniOverLayerHeight = @miniOverlayer.height()
      n = top / (@scrollViewLines.outerHeight() - @editorView.height())
      @miniScrollView.css({ top: -(@miniScrollView.outerHeight() - miniOverLayerHeight / scaleY) * n })
      @miniOverlayer.css({ top: n * (miniOverLayerHeight / scaleY - miniOverLayerHeight) })
    else
      @miniOverlayer.css({ top: top })

  transform: (width, scale, xy) ->
    scaleStr = 'scale(' + scale.join(',') + ')'
    translateStr = 'translate(' + xy.join(',') + 'px)'
    this.css({
      width: width,
      '-webkit-transform': scaleStr + ' ' + translateStr,
      'transform': scaleStr + ' ' + translateStr
    })

