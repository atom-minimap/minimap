MinimapView = require './minimap-view'

module.exports =
  minimapView: null

  activate: (state) ->
    @minimapView = new MinimapView(state.minimapViewState)

  deactivate: ->
    @minimapView.destroy()

  serialize: ->
    minimapViewState: @minimapView.serialize()
