# How to create a minimap plugin?

A Minimap plugin is just another Atom package that interacts with the Minimap API. To get started, use the `Minimap: Generate Plugin` command in Atom. This will bootstrap a new minimap plugin with the basic interface and behavior
expected from plugins.

## Minimap Plugin Interface

In addition of the Atom package interface, a Minimap plugin implements the following methods:

* `activatePlugin` - A function called to activate the plugin
* `deactivatePlugin` - A function called to deactivate the plugin
* `isActive` - A function returning a boolean that indicates the activation state of the plugin.

These methods allow plugins to be activated/deactivated by the Minimap package independently of their activation as a package.

![Minimap Settings](http://i.imgur.com/JXcQwvB.png)

All Minimap plugins are activated by default.

## A Minimal Minimap Plugin

```coffee
{CompositeDisposable} = require 'event-kit'

module.exports =
  active: false

  isActive: -> @active

  activate: (state) ->
    # During the activation, the minimap package is retrieved.
    minimapPackage = atom.packages.getLoadedPackage('minimap')
    return @deactivate() unless minimapPackage?

    @minimap = require minimapPackage.path

    # And a test against the minimap version allow to prevent compatibility
    # issues.
    return @deactivate() unless @minimap.versionMatch('3.x')

    # The subscriptions object will store the disposable returned when
    # registering to minimap events.
    @subscriptions = new CompositeDisposable

    # The plugin is then registered as a plugin in the minimap.
    @minimap.registerPlugin 'plugin-name', this

  deactivate: ->
    @minimap.unregisterPlugin 'plugin-name'
    @minimap = null

  activatePlugin: ->
    return if @active

    @active = true

    @subscriptions.add @minimap.onDidActivate =>
      # do something when the minimap is activated
    @subscriptions.add @minimap.onDidDeactivate =>
      # do something when the minimap is deactivated

    @subscription = @minimap.eachMinimapView ({view}) ->
      # Do something everytime a minimap view is created.

  deactivatePlugin: ->
    return unless @active

    @active = false
    @subscription.off()
    @subscriptions.dispose()
```

## Minimap Plugin API

The Minimap package provides a simple API for plugins:

* `registerPlugin(name, plugin)` - Registers `plugin` as a minimap plugin. The given `name` will be used to access the plugin as well as a key for the associated minimap setting. When called the Minimap package will proceed as follow:
  * It will create a `minimap.plugins.{name}` setting. If there was no previous setting with that name, the default value will be set to `true`, otherwise the value of the setting is retrieved from the Atom config object.
  * It will create a `minimap:toggle-{name}` command that allow to activate/deactive the plugin through the command palette.
  * It will emit a `plugin:added` event with an object such as `{name, plugin}`.
  * It will activate/deactive the plugin accordingly with its associated setting value.
* `unregisterPlugin(name)` - Unregisters the plugin registered with the given `name`. When called it will proceed as follow:
  * It will stop observing the setting created for the plugin.
  * It will remove the command palette created for the plugin.
  * It will emit a `plugin:removed` event with an object such as `{name, plugin}`.
* `versionMatch(expectedVersion)` - If a plugin needs a specific version of the Minimap package to work with it can use the `versionMatch` method to test the Minimap version against a `semver` version. In that case, the plugin `activate` method could be written as:
  ```coffee
  activate: ->
    minimapPackage = atom.packages.getLoadedPackage('minimap')
    return @deactivate() unless minimapPackage?

    @minimap = require minimapPackage.path
    return @deactivate() unless @minimap.versionMatch('3.x')

    @minimap.registerPlugin 'my-plugin', this
  ```
