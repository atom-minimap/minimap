{CompositeDisposable} = require 'event-kit'
SampleMinimapPluginView = require './sample-minimap-plugin-view'

module.exports =
  active: false
  views: {}

  isActive: -> @active

  activate: (state) ->
    minimapPackage = atom.packages.getLoadedPackage('minimap')
    return @deactivate() unless minimapPackage?

    @minimap = require minimapPackage.path
    return @deactivate() unless @minimap.versionMatch('3.x')

    @subscriptions = new CompositeDisposable
    @minimap.registerPlugin 'sample-minimap-plugin', this

  deactivate: ->
    @minimap.unregisterPlugin 'sample-minimap-plugin'
    @minimap = null

  activatePlugin: ->
    return if @active

    @active = true

    @subscriptions.add @minimap.onDidActivate => @createViews()
    @subscriptions.add @minimap.onDidDeactivate => @destroyViews()

    @createViews()

  deactivatePlugin: ->
    return unless @active

    @active = false
    @destroyViews()
    @subscription.off()
    @subscriptions.dispose()

  createViews: ->
    @subscription = @minimap.eachMinimapView ({view}) =>
      pluginView = new SampleMinimapPluginView(view)
      @views[view.editor.id] = pluginView

      pluginView.attach()

      view.editor.once 'destroyed', =>
        pluginView.destroy()
        delete @views[view.editor.id]

  destroyViews: ->
    view.destroy() for id,view of @views
    @views = {}
