{View} = require 'atom'

module.exports =
class SampleMinimapPluginView extends View
  @content: ->
    @div class: 'sample-minimap-plugin text-info', 'Sample Minimap Plugin View'

  initialize: (@minimapView) ->

  attach: ->
    @minimapView.miniOverlayer.append(this)

  destroy: ->
    @detach()
