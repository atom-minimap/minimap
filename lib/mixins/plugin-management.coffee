Mixin = require 'mixto'

# Public: Provides methods to manage minimap plugins.
module.exports =
class PluginManagement extends Mixin
  plugins: {}

  registerPlugin: (name, plugin) ->
    @configDefaults.plugins[name] = true
    unless atom.config.get("minimap.plugins.#{name}")?
      atom.config.set "minimap.plugins.#{name}", true
      
    @plugins[name] = plugin

    if atom.config.get("minimap.plugins.#{name}")
      plugin.activatePlugin()
    else
      plugin.deactivatePlugin()
  unregisterPlugin: (name) ->
    delete @configDefault.plugins[name]
    delete @plugins[name]
