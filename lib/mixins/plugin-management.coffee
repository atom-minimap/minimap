Mixin = require 'mixto'

# Public: Provides methods to manage minimap plugins.
module.exports =
class PluginManagement extends Mixin
  plugins: {}

  registerPlugin: (name, plugin) ->
    @plugins[name] = plugin

  unregisterPlugin: (name) ->
    delete @plugins[name]
