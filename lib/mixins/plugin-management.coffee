Mixin = require 'mixto'

# Public: Provides methods to manage minimap plugins.
#
# Minimap plugins are Atom packages that will augment the minimap.
# They have a secondary activation cycle going on constrained by the minimap
# package activation. A minimap plugin life cycle will generally look like this:
#
#  1. The plugin module is activated by Atom through the `activate` method
#  2. The plugin then register itself as a minimap plugin using `registerPlugin`
#  3. The plugin is activated/deactivated according to the minimap settings.
#  4. On the plugin module deactivation, the plugin must unregisters itself
#     from the minimap using the `unregisterPlugin`.
module.exports =
class PluginManagement extends Mixin
  # Internal: Stores the minimap plugin with their identifying name as key.
  plugins: {}

  # Public: Registers a minimap `plugin` with the given `name`.
  #
  # name - The identifying {String} name of the plugin.
  #        It will be used as activation settings name as well
  #        as the key to unregister the module.
  # plugin - The plugin {Object} to register.
  registerPlugin: (name, plugin) ->
    @plugins[name] = plugin

    event = {name, plugin}
    @emit('plugin:added', event)
    @emitter.emit('did-add-plugin', event)

    @registerPluginControls(name, plugin) if atom.config.get('minimap.displayPluginsControls')

    @updatesPluginActivationState(name)

  # Public: Unregisters a plugin from the minimap.
  #
  # name - The identifying {String} name of the plugin to unregister.
  unregisterPlugin: (name) ->
    plugin = @plugins[name]
    @unregisterPluginControls(name) if atom.config.get('minimap.displayPluginsControls')
    delete @plugins[name]

    event = {name, plugin}
    @emit('plugin:removed', event)
    @emitter.emit('did-remove-plugin', event)


  # Internal: Updates the plugin activation state according to the current
  # config.
  #
  # name - The identifying {String} name of the plugin.
  updatesPluginActivationState: (name) ->
    plugin = @plugins[name]

    pluginActive = plugin.isActive()
    settingActive = atom.config.get("minimap.plugins.#{name}")

    event = {name, plugin}

    if settingActive and not pluginActive
      plugin.activatePlugin()
      @emit('plugin:activated', event)
      @emitter.emit('did-activate-plugin', event)
    else if pluginActive and not settingActive
      plugin.deactivatePlugin()
      @emit('plugin:deactivated', event)
      @emitter.emit('did-deactivate-plugin', event)

  # Internal: When the `minimap.displayPluginsControls` setting is toggled,
  # this function will register the commands and setting to manage the plugin
  # activation from the minimap settings.
  #
  # name - The identifying {String} name of the plugin.
  # plugin - The plugin {Object}.
  registerPluginControls: (name, plugin) ->
    settingsKey = "minimap.plugins.#{name}"
    @config.plugins.properties[name] =
      type: 'boolean'
      default: true

    atom.config.set(settingsKey, true) unless atom.config.get(settingsKey)?

    atom.config.observe settingsKey, =>
      @updatesPluginActivationState(name)

    atom.workspaceView.command "minimap:toggle-#{name}", =>
      atom.config.set settingsKey, not atom.config.get(settingsKey)
      @updatesPluginActivationState(name)

  # Internal: When the `minimap.displayPluginsControls` setting is toggled,
  # this function will unregister the commands and setting that was created
  # previously.
  #
  # name - The identifying {String} name of the plugin.
  unregisterPluginControls: (name) ->
    atom.config.unobserve "minimap.plugins.#{name}"
    atom.workspaceView.off "minimap:toggle-#{name}"
    delete @config.plugins.properties[name]
