{$, View} = require 'atom'

MinimapEditorView = require './minimap-editor-view'

module.exports =
class MinimapView extends View
  @CONFIGS = {
  }

  @content: ->
    @div class: 'minimap', =>
      @div outlet: 'miniOverlayer', class: "minimap-overlayer"

  initialize: ->
    atom.workspaceView.minimap = this

    @subscribe atom.workspaceView, 'pane-container:active-pane-item-changed', =>
      console.log('Pane changed')
      @update()

    @subscribe atom.workspaceView, 'cursor:moved', =>
      @update()

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
    @editor = atom.workspaceView.getActivePaneItem()
    if !@editor
      return
    @editorView = atom.workspaceView.getActiveView()
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


    top = @editorView.offset().top
    this.css('top', top + 'px')

    @reset()

    @miniEditorView.update(@editor.getText(), @editor.displayBuffer.screenLines)

    editorRect = @scrollView[0].getBoundingClientRect()
    linesRect = @scrollView.find('.lines')[0].getBoundingClientRect()
    miniRect = @miniEditorView.getClientRect()

    width = Math.max(150, miniRect.width)

    if linesRect.height < editorRect.height
      scaleX = 0.2
      width = 150 / scaleX
    else
      scaleX = 150 / miniRect.width

    scaleY = scaleX
    scaleStr = 'scale(' + scaleX + ', ' + scaleY + ')'
    this.css({
      width: width,
      '-webkit-transform': scaleStr,
      'transform': scaleStr
    })

  reset: ->
    scaleX = 1
    scaleY = scaleX
    scaleStr = 'scale(' + scaleX + ', ' + scaleY + ')'

    this.css({
      width: 150,
      '-webkit-transform': scaleStr,
      'transform': scaleStr
    })
