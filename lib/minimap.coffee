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
    console.log atom.workspaceView.getActivePaneView()
    paneView = atom.workspaceView.getActivePaneView()

    unless @minimapView
      @minimapView = new MinimapView(paneView)
    @minimapView.onActiveItemChanged(paneView.getActiveItem())
