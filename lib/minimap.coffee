MinimapView = require './minimap-view'

module.exports =
  minimapView: null

  activate: (state) ->
    atom.workspaceView.command 'minimap:toggle', =>
      @createView().toggle(@stats)

  deactivate: ->
    @minimapView.destroy()
    @minimapView = null
    @stats = null

  serialize: ->
    minimapViewState: @minimapView.serialize()

  createView: ->
    unless @minimapView
      @minimapView = new MinimapView()
    @minimapView
