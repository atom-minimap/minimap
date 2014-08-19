{Emitter} = require 'emissary'
Debug = require 'prolix'
semver = require 'semver'

ViewManagement = require './mixins/view-management'
PluginManagement = require './mixins/plugin-management'

require '../vendor/resizeend'

# Public: The `Minimap` package provides an eagle-eye view of text buffers.
#
# It also provides API for plugin packages that want to interact with the
# minimap and be available to the user through the minimap settings.
#
# ## Events
#
# * `activated` -
#      Emitted synchronously when the package is activated. By suscribing
#      to this event other packages can be notified of the activation of the
#      minimap. At that point the minimap views have been created.
#
# * `deactivated` -
#      Emitted synchronously when the package have been deactivated. The views
#      are no longer available at that point.
#
# * `minimap-view:created` -
#      Emitted synchronously when a {MinimapView} have been created for
#      an active {PaneView}.
#      Your handler will be called with an object containing the following keys.
#      * `view`: The {MinimapView} that was created
#
# * `minimap-view:will-be-destroyed` -
#      Emitted synchronously when a {MinimapView} is about to be destroyed.
#      Your handler will be called with an object containing the following keys.
#      * `view`: The {MinimapView} that was created
#
# * `minimap-view:destroyed` -
#      Emitted synchronously when a {MinimapView} was destroyed, at that point
#      the view have been removed from the DOM.
#      Your handler will be called with an object containing the following keys.
#      * `view`: The {MinimapView} that was created
#
# * `plugin:added` -
#      Emitted synchronously when a minimap plugin was registered.
#      Your handler will be called with an object containing the following keys.
#      * `name` - The {String} name used to register the plugin
#      * `plugin` - The plugin {Object} that was registered
#
# * `plugin:removed` -
#      Emitted synchronously when a minimap plugin was unregistered.
#      Your handler will be called with an object containing the following keys.
#      * `name` - The {String} name used to register the plugin
#      * `plugin` - The plugin {Object} that was unregistered
#
# * `plugin:activated` -
#      Emitted synchronously when a minimap plugin was activated.
#      Your handler will be called with an object containing the following keys.
#      * `name` - The {String} name used to register the plugin
#      * `plugin` - The plugin {Object} that was activated
#
# * `plugin:deactivated` -
#      Emitted synchronously when a minimap plugin was deactivated.
#      Your handler will be called with an object containing the following keys.
#      * `name` - The {String} name used to register the plugin
#      * `plugin` - The plugin {Object} that was deactivated
#
# ## Plugins Interface
#
# Plugins should conform to the following interface:
#
# ```coffee
# class Plugin
#   void activatePlugin: ->
#   void deactivatePlugin: ->
#   bool isActive: ->
# ```
class Minimap
  Emitter.includeInto(this)
  Debug('minimap').includeInto(this)
  ViewManagement.includeInto(this)
  PluginManagement.includeInto(this)

  # Public: The minimap package version
  version: require('../package.json').version

  # Public: The default minimap settings
  configDefaults:
    plugins: {}
    autoToggle: false
    displayMinimapOnLeft: false
    displayCodeHighlights: true
    displayPluginsControls: true
    minimapScrollIndicator: true
    lineOverdraw: 10
    useHardwareAcceleration: true
    scale: 0.16


  # Internal: The activation state of the minimap package.
  active: false

  # Public: Activates the minimap package.
  activate: ->
    atom.workspaceView.command 'minimap:toggle', => @toggleNoDebug()
    atom.workspaceView.command 'minimap:toggle-debug', => @toggleDebug()
    if atom.config.get('minimap.displayPluginsControls')
      atom.workspaceView.command 'minimap:open-quick-settings', =>
        atom.workspaceView.getActivePaneView().find('.minimap .open-minimap-quick-settings').mousedown()

    atom.workspaceView.toggleClass 'minimap-on-left', atom.config.get('minimap.displayMinimapOnLeft')
    atom.config.observe 'minimap.displayMinimapOnLeft', =>
      atom.workspaceView.toggleClass 'minimap-on-left', atom.config.get('minimap.displayMinimapOnLeft')

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

  # Public: Verifies that the passed-in version expression is satisfied by
  # the current minimap version.
  #
  # `expectedVersion` - A [semver]() compatible expression to match against
  #                     the minimap version.
  #
  # Returns `true` if the version matches the expression, `false` otherwise.
  versionMatch: (expectedVersion) -> semver.satisfies(@version, expectedVersion)

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
