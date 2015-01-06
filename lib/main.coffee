{Emitter, CompositeDisposable} = require 'event-kit'

ViewManagement = require './mixins/view-management'
PluginManagement = require './mixins/plugin-management'
V4Main = null

[MinimapPluginGeneratorView, deprecate, semver] = []

require '../vendor/resizeend'

# Public: The `Minimap` package provides an eagle-eye view of text buffers.
#
# It also provides API for plugin packages that want to interact with the
# minimap and be available to the user through the minimap settings.
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
class Main
  ViewManagement.includeInto(this)
  PluginManagement.includeInto(this)

  ### Public ###

  # The minimap package version
  version: require('../package.json').version

  # The default minimap settings
  config:
    plugins:
      type: 'object'
      properties: {}
    autoToggle:
      type: 'boolean'
      default: true
    displayMinimapOnLeft:
      type: 'boolean'
      default: false
    displayCodeHighlights:
      type: 'boolean'
      default: true
      description: 'Toggles the render of the buffer tokens in the minimap.'
    displayPluginsControls:
      type: 'boolean'
      default: true
      description: 'You need to restart Atom for this setting to be effective.'
    minimapScrollIndicator:
      type: 'boolean'
      default: true
      description: 'Toggles the display of a side line showing which part of the buffer is currently displayed by the minimap. This side line will only appear if the minimap is taller than the editor view height.'
    useHardwareAcceleration:
      type: 'boolean'
      default: true
    adjustMinimapWidthToSoftWrap:
      type: 'boolean'
      default: true
      description: 'If this option is enabled and Soft Wrap is checked then the Minimap max width is set to the Preferred Line Length value.'
    charWidth:
      type: 'integer'
      default: 1
      minimum: 1
    charHeight:
      type: 'integer'
      default: 2
      minimum: 1
    interline:
      type: 'integer'
      default: 1
      minimum: 0
      description: 'The space between lines in the minimap in pixels.'
    textOpacity:
      type: 'number'
      default: 0.6
      minimum: 0
      maximum: 1
      description: "The opacity used to render the line's text in the minimap."
    v4Preview:
      type: 'boolean'
      default: false
      description: "Require Atom restart. Some plugins may be disabled if they don't support the new API."

  # Internal: The activation state of the minimap package.
  active: false

  # Internal: Used only at export time.
  constructor: ->
    @emitter = new Emitter
    @subscriptions = new CompositeDisposable

  # Activates the minimap package.
  activate: ->
    @v4Preview = atom.config.get('minimap.v4Preview')

    if @v4Preview
      @version = '4.0.0-preview'
      V4Main = require './main-v4'

      V4Main.includeInto(Main)

      @activateV4()

    else
      @subscriptions.add atom.commands.add 'atom-workspace',
        'minimap:toggle': => @toggle()
        'minimap:generate-plugin': => @generatePlugin()

      workspaceElement = atom.views.getView(atom.workspace)

      if atom.config.get('minimap.displayPluginsControls')
        @subscriptions.add atom.commands.add 'atom-workspace',
          'minimap:open-quick-settings': =>
            editor = atom.workspace.getActiveEditor()
            @minimapForEditor(editor).openQuickSettings.mousedown()

      @subscriptions.add atom.config.observe 'minimap.displayMinimapOnLeft', (value) ->
        workspaceElement.classList.toggle 'minimap-on-left', value

    @toggle() if atom.config.get 'minimap.autoToggle'

  # Deactivates the minimap package.
  deactivate: ->
    @active = false
    @destroyViews()
    @emitter.emit('did-deactivate')

  # Verifies that the passed-in version expression is satisfied by
  # the current minimap version.
  #
  # `expectedVersion` - A [semver](https://github.com/npm/node-semver)
  #                     compatible expression to match agains the minimap
  #                     version.
  #
  # Returns a {Boolean}.
  versionMatch: (expectedVersion) ->
    semver ?= require 'semver'
    semver.satisfies(@version, expectedVersion)

  # Public: Toggles the minimap activation state.
  toggle: ->
    if @active
      @active = false
      @deactivate()
    else
      @createViews()
      @active = true
      @emitter.emit('did-activate')

  # Public: Opens the plugin generation view.
  generatePlugin: ->
    MinimapPluginGeneratorView ?= require './minimap-plugin-generator-view'
    view = new MinimapPluginGeneratorView()

  # Public: Calls the `callback` when the minimap package have been activated.
  #
  # callback - The callback {Function}.
  #
  # Returns a `Disposable`.
  onDidActivate: (callback) ->
    @emitter.on 'did-activate', callback

  # Public: Calls the `callback` when the minimap package have been deactivated.
  #
  # callback - The callback {Function}.
  #
  # Returns a `Disposable`.
  onDidDeactivate: (callback) ->
    @emitter.on 'did-deactivate', callback

  # Public: Calls the `callback` when a minimap have been created.
  #
  # callback - The callback {Function}. The event the callback will receive
  #            have the following properties:
  #            :view - The {MinimapView} that was created.
  #
  # Returns a `Disposable`.
  onDidCreateMinimap: (callback) ->
    @emitter.on 'did-create-minimap', callback

  # Public: Calls the `callback` when a minimap is about to be destroyed.
  #
  # callback - The callback {Function}. The event the callback will receive
  #            have the following properties:
  #            :view - The {MinimapView} that will be destroyed.
  #
  # Returns a `Disposable`.
  onWillDestroyMinimap: (callback) ->
    @emitter.on 'will-destroy-minimap', callback

  # Public: Calls the `callback` when a minimap have been destroyed.
  #
  # callback - The callback {Function}. The event the callback will receive
  #            have the following properties:
  #            :view - The {MinimapView} that was destroyed.
  #
  # Returns a `Disposable`.
  onDidDestroyMinimap: (callback) ->
    @emitter.on 'did-destroy-minimap', callback

  # Public: Calls the `callback` when a plugin have been registered.
  #
  # callback - The callback {Function}. The event the callback will receive
  #            have the following properties:
  #            :name - The plugin name {String}.
  #            :plugin - The plugin {Object}.
  #
  # Returns a `Disposable`.
  onDidAddPlugin: (callback) ->
    @emitter.on 'did-add-plugin', callback

  # Public: Calls the `callback` when a plugin have been unregistered.
  #
  # callback - The callback {Function}. The event the callback will receive
  #            have the following properties:
  #            :name - The plugin name {String}.
  #            :plugin - The plugin {Object}.
  #
  # Returns a `Disposable`.
  onDidRemovePlugin: (callback) ->
    @emitter.on 'did-remove-plugin', callback

  # Public: Calls the `callback` when a plugin have been activated.
  #
  # callback - The callback {Function}. The event the callback will receive
  #            have the following properties:
  #            :name - The plugin name {String}.
  #            :plugin - The plugin {Object}.
  #
  # Returns a `Disposable`.
  onDidActivatePlugin: (callback) ->
    @emitter.on 'did-activate-plugin', callback

  # Public: Calls the `callback` when a plugin have been deactivated.
  #
  # callback - The callback {Function}. The event the callback will receive
  #            have the following properties:
  #            :name - The plugin name {String}.
  #            :plugin - The plugin {Object}.
  #
  # Returns a `Disposable`.
  onDidDeactivatePlugin: (callback) ->
    @emitter.on 'did-deactivate-plugin', callback

# The minimap module is an instance of the {Minimap} class.
module.exports = new Main()
