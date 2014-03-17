MinimapView = require './minimap-view'

module.exports =
  minimapView: null

  activate: ->
    atom.workspaceView.command 'minimap:toggle', =>
      @toggle()

  deactivate: ->
    @minimapView.destroy()
    @minimapView = null

  toggle: ->
    if @minimapView
      @deactivate()
    else
      @open()

  open: ->
    unless @minimapView
      @minimapView = new MinimapView()
    @minimapView.updateActiveStatus()
