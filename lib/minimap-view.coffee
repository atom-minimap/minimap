{$, View} = require 'atom'

MinimapEditorView = require './minimap-editor-view'

module.exports =
class MinimapView extends View
  @CONFIGS = {
  }

  @minTop: 0
  @maxTop: 0

  @content: ->
    @div class: 'minimap', =>
      @div outlet: 'miniOverlayer', class: "minimap-overlayer"

  initialize: ->
    atom.workspaceView.minimap = this

    @subscribe atom.workspaceView, 'pane-container:active-pane-item-changed', =>
      @update()

    @subscribe atom.workspaceView, 'cursor:moved', =>
      @update()

    this.off('mousewheel')
    this.on('mousewheel', @mousewheelFn.bind(this))

  attach: ->

  destroy: ->
    atom.workspaceView.minimap = null
    @remove()
    @detach()

  update: ->
    @getActivePane()
    @getActiveEditor()
    @updateMinimapView()

  getActivePane: ->
    unless @pane
      @pane = atom.workspaceView.getActivePane()

  getActiveEditor: ->
    @editorView = atom.workspaceView.getActiveView()
    # Ignore `Settings Tab` or `Tabs` are empty.
    if !@editorView || @editorView.hasClass('settings-view')
      @editor = null
      @scrollView = null
      return
    @editor = @editorView.getEditor()
    @scrollView = @editorView.find('.scroll-view')

  storeActiveBuffer: ->
    @buffer = @editor?.getBuffer?()

  getActiveBuffer: ->
    @buffer

  updateMinimapView: ->
    unless @pane.find('.minimap').length
      @miniEditorView = new MinimapEditorView()
      @miniOverlayer.before(@miniEditorView)
      @pane.append(this)

    if !@editor
      this.addClass('hide')
      return
    if this.hasClass('hide')
      this.removeClass('hide')

    @editor.off('scroll-top-changed.editor')
    @editor.on('scroll-top-changed.editor', @scroll.bind(this))

    top = @editorView.offset().top
    this.css('top', top + 'px')

    @reset()

    @miniEditorView.update(@editor.getText(), @editor.displayBuffer.screenLines)

    @editorRect = @scrollView[0].getBoundingClientRect()
    linesRect = @scrollView.find('.lines')[0].getBoundingClientRect()
    miniRect = @miniEditorView.getClientRect()

    @minTop = 0
    @maxTop = @miniEditorView.height()

    @miniEditorView.find('.scroll-view').css({
      top: 0
    })

    # height of editor
    a = @editorRect.height / miniRect.height
    # 180 height
    @miniOverlayer.css({
      height: miniRect.height * a,
      top: 0
    })

    height = miniRect.height
    width = Math.max(150, miniRect.width)

    if linesRect.height < @editorRect.height
      @scaleX = 0.2
      width = 150 / @scaleX
    else
      @scaleX = 150 / miniRect.width

    @scaleX = Math.max(@scaleX, 0.1)

    x = width - 150 / @scaleX
    y = 0

    # --- test
    #@scaleX = .3
    #@scaleY = .3
    # --- test
    @scaleX = @scaleX / 2
    @scaleY = @scaleX * 0.66
    scaleStr = 'scale(' + @scaleX + ', ' + @scaleY + ')'
    translateStr = 'translate(' + x + 'px, ' + y + 'px)'
    this.css({
      width: width,
      '-webkit-transform': scaleStr + ' ' + translateStr,
      'transform': scaleStr + ' ' + translateStr
    })

    @scroll(@editorView.scrollTop())

  reset: ->
    scaleX = 1
    scaleY = scaleX
    scaleStr = 'scale(' + scaleX + ', ' + scaleY + ')'
    translateStr = 'translate(0, 0)'

    this.css({
      width: 150,
      '-webkit-transform': scaleStr + ' ' + translateStr,
      'transform': scaleStr + ' ' + translateStr
    })

  mousewheelFn: (e) ->
    delta = e.originalEvent.wheelDeltaY
    if delta
      @editorView.scrollTop(@editorView.scrollTop() - delta)

      #h = @miniEditorView.height() * @scaleX

      #if h > @scrollView.height()
      #  t = parseInt(@miniEditorView.find('.scroll-view').css('top'))
      #  t += delta
      #  t = Math.min(t, 0)
      #  #t = Math.max(Math.min(t, @maxTop - @miniOverlayer.height()), @minTop)
      #  @miniEditorView.find('.scroll-view').css({
      #    top: t
      #  })
      #  #n = parseInt(@miniOverlayer.css('top'))
      #  #n -= delta
      #  #n = Math.max(Math.min(n, t + ), @minTop)
      #  @miniOverlayer.css({
      #    top: n
      #  })
      #else
      #  t = parseInt(@miniOverlayer.css('top'))
      #  t -= delta
      #  t = Math.max(Math.min(t, @maxTop - @miniOverlayer.height()), @minTop)
      #  @miniOverlayer.css({
      #    top: t
      #  })

  scroll: (top) ->
    h = @miniEditorView.height() * @scaleX

    if h > @scrollView.height()
      n = (top) / (@editorView.find('.lines').outerHeight() - @editorView.height())
      sv = @miniEditorView.find('.scroll-view')
      sv.css({
        top: -(sv.outerHeight() - @miniOverlayer.height() / @scaleX) * n
      })
      @miniOverlayer.css({
        top: n * (@miniOverlayer.height() / @scaleX - @miniOverlayer.height())
      })
    else
      @miniOverlayer.css({
        top: top
      })
