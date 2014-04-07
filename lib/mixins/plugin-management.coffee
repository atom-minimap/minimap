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
  # name - The identifying name of the plugin. It will be used as activation
  #        settings name as well as the key to unregister the module.
  # plugin - The plugin {Object} to register.
  registerPlugin: (name, plugin) ->
    @configDefaults.plugins[name] = true
    unless atom.config.get("minimap.plugins.#{name}")?
      atom.config.set "minimap.plugins.#{name}", true

    @plugins[name] = plugin

    @emit('plugin:added', {name, plugin})
    atom.config.observe "minimap.plugins.#{name}", =>
      @updatesPluginActivationState(name)

    @updatesPluginActivationState(name)

  # Public: Unregisters a plugin from the minimap.
  #
  # name - The identifying name of the plugin to unregister.
  unregisterPlugin: (name) ->
    atom.config.unobserve "minimap.plugins.#{name}"
    plugin = @plugins[name]
    delete @configDefaults.plugins[name]
    delete @plugins[name]
    @emit('plugin:removed', {name, plugin})

  # Internal: Updates the plugin activation state according to the current
  # config.
  updatesPluginActivationState: (name) ->
    plugin = @plugins[name]

    if atom.config.get("minimap.plugins.#{name}")
      plugin.activatePlugin()
      @emit('plugin:activated', {name, plugin})
    else
      plugin.deactivatePlugin()
      @emit('plugin:deactivated', {name, plugin})
