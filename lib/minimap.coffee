{Emitter} = require 'emissary'

require '../vendor/resizeend'

ViewManagement = require './mixins/view-management'

class Minimap
  Emitter.includeInto(this)
  ViewManagement.includeInto(this)

  configDefaults: { plugins: {} }

  # We'll be using this property to store the toggle state as the
  # minimapViews object will never be set to null.
  active: false

  # Does the minimap debug features are activated on toggle
  allowDebug: false

  activate: ->
    atom.workspaceView.command 'minimap:toggle', => @toggle()
    atom.workspaceView.command 'minimap:toggle-debug', => @toggleDebug()

  deactivate: ->
    @destroyViews()
    @emit('deactivated')

  toggle: (debugMode=false) ->
    @allowDebug = debugMode
    if @active
      @active = false
      @deactivate()
    else
      @createViews()
      @active = true
      @emit('activated')

  toggleDebug: ->
    @toggle(true)


module.exports = new Minimap()
