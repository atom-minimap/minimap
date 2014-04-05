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

  unregisterPlugin: (name) ->
    delete @plugins[name]
