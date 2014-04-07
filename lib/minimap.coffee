{Emitter} = require 'emissary'
Debug = require 'prolix'

ViewManagement = require './mixins/view-management'
PluginManagement = require './mixins/plugin-management'

require '../vendor/resizeend'

# Public: The `Minimap` package provides a eagle-eye view of text buffers.
#
# It also provides API for plugin packages that want to interact with the
# minimap and be available to the user through the minimap settings..
class Minimap
  Emitter.includeInto(this)
  Debug('minimap').includeInto(this)
  ViewManagement.includeInto(this)
  PluginManagement.includeInto(this)

  # Public: The default minimap settings
  configDefaults:
    plugins: {}
    autoToggle: false

  # Internal: The activation state of the minimap package.
  active: false

  # Public: Activates the minimap package.
  activate: ->
    atom.workspaceView.command 'minimap:toggle', => @toggleNoDebug()
    atom.workspaceView.command 'minimap:toggle-debug', => @toggleDebug()
    @toggleNoDebug() if atom.config.get 'minimap.autoToggle'

  # Public: Deactivates the minimap package.
  deactivate: ->
    @destroyViews()
    @emit('deactivated')

  # Public: Toggles the minimap activation state with debug turned on.
  toggleDebug: ->
    @getChannel().activate()
    @toggle()

  # Public: Toggles the minimap activation state with debug turned off.
  toggleNoDebug: ->
    @getChannel().deactivate()
    @toggle()

  # Internal: Toggles the minimap activation state.
  toggle: () ->
    if @active
      @active = false
      @deactivate()
    else
      @createViews()
      @active = true
      @emit('activated')

# The minimap module is an instance of the {Minimap} class.
module.exports = new Minimap()
