'use babel'

import Mixin from 'mixto'
import { CompositeDisposable } from 'atom'

/**
 * Provides methods to manage minimap plugins.
 * Minimap plugins are Atom packages that will augment the minimap.
 * They have a secondary activation cycle going on constrained by the minimap
 * package activation. A minimap plugin life cycle will generally look
 * like this:
 *
 * 1. The plugin module is activated by Atom through the `activate` method
 * 2. The plugin then register itself as a minimap plugin using `registerPlugin`
 * 3. The plugin is activated/deactivated according to the minimap settings.
 * 4. On the plugin module deactivation, the plugin must unregisters itself
 *    from the minimap using the `unregisterPlugin`.
 *
 * @access public
 */
export default class PluginManagement extends Mixin {
  /**
   * Returns the Minimap main module instance.
   *
   * @return {Main} The Minimap main module instance.
   */
  provideMinimapServiceV1 () { return this }

  /**
   * Initializes the properties for plugins' management.
   *
   * @access private
   */
  initializePlugins () {
    /**
     * The registered Minimap plugins stored using their name as key.
     *
     * @type {Object}
     * @access private
     */
    this.plugins = {}
    /**
     * The plugins' subscriptions stored using the plugin names as keys.
     *
     * @type {Object}
     * @access private
     */
    this.pluginsSubscriptions = {}
  }

  /**
   * Registers a minimap `plugin` with the given `name`.
   *
   * @param {string} name The identifying name of the plugin.
   *                      It will be used as activation settings name
   *                      as well as the key to unregister the module.
   * @param {MinimapPlugin} plugin The plugin to register.
   * @emits {did-add-plugin} with the name and a reference to the added plugin.
   * @emits {did-activate-plugin} if the plugin was activated during
   *                              the registration.
   */
  registerPlugin (name, plugin) {
    this.plugins[name] = plugin
    this.pluginsSubscriptions[name] = new CompositeDisposable()

    let event = { name: name, plugin: plugin }
    this.emitter.emit('did-add-plugin', event)

    if (atom.config.get('minimap.displayPluginsControls')) {
      this.registerPluginControls(name, plugin)
    }

    this.updatesPluginActivationState(name)
  }

  /**
   * Unregisters a plugin from the minimap.
   *
   * @param {string} name The identifying name of the plugin to unregister.
   * @emits {did-remove-plugin} with the name and a reference
   *        to the added plugin.
   */
  unregisterPlugin (name) {
    let plugin = this.plugins[name]

    if (atom.config.get('minimap.displayPluginsControls')) {
      this.unregisterPluginControls(name)
    }

    delete this.plugins[name]

    let event = { name: name, plugin: plugin }
    this.emitter.emit('did-remove-plugin', event)
  }

  /**
   * Toggles the specified plugin activation state.
   *
   * @param  {string} name     The name of the plugin.
   * @param  {boolean} boolean An optional boolean to set the activation
   *                           state of the plugin. If ommitted the new plugin
   *                           state will be the the inverse of its current
   *                           state.
   * @emits {did-activate-plugin} if the plugin was activated by the call.
   * @emits {did-deactivate-plugin} if the plugin was deactivated by the call.
   */
  togglePluginActivation (name, boolean) {
    let settingsKey = `minimap.plugins.${name}`

    if (boolean !== undefined && boolean !== null) {
      atom.config.set(settingsKey, boolean)
    } else {
      atom.config.set(settingsKey, !atom.config.get(settingsKey))
    }

    this.updatesPluginActivationState(name)
  }

  /**
   * Deactivates all the plugins registered in the minimap package so far.
   *
   * @emits {did-deactivate-plugin} for each plugin deactivated by the call.
   */
  deactivateAllPlugins () {
    for (let [name, plugin] of this.eachPlugin()) {
      plugin.deactivatePlugin()
      this.emitter.emit('did-deactivate-plugin', { name: name, plugin: plugin })
    }
  }

  /**
   * A generator function to iterate over registered plugins.
   *
   * @return An iterable that yield the name and reference to every plugin
   *         as an array in each iteration.
   */
  * eachPlugin () {
    for (let name in this.plugins) {
      yield [name, this.plugins[name]]
    }
  }

  /**
   * Updates the plugin activation state according to the current config.
   *
   * @param {string} name The identifying name of the plugin to update.
   * @emits {did-activate-plugin} if the plugin was activated by the call.
   * @emits {did-deactivate-plugin} if the plugin was deactivated by the call.
   * @access private
   */
  updatesPluginActivationState (name) {
    let plugin = this.plugins[name]
    let pluginActive = plugin.isActive()
    let settingActive = atom.config.get(`minimap.plugins.${name}`)
    let event = { name: name, plugin: plugin }

    if (settingActive && !pluginActive) {
      plugin.activatePlugin()
      this.emitter.emit('did-activate-plugin', event)
    } else if (pluginActive && !settingActive) {
      plugin.deactivatePlugin()
      this.emitter.emit('did-deactivate-plugin', event)
    }
  }

  /**
   * When the `minimap.displayPluginsControls` setting is toggled,
   * this function will register the commands and setting to manage the plugin
   * activation from the minimap settings.
   *
   * @param {string} name The identifying name of the plugin.
   * @param {MinimapPlugin} plugin The plugin instance to register
   *        controls for.
   * @listens {minimap.plugins.${name}} listen to the setting to update
   *          the plugin state accordingly.
   * @listens {minimap:toggle-${name}} listen to the command on `atom-workspace`
   *          to toggle the plugin state.
   * @access private
   */
  registerPluginControls (name, plugin) {
    let settingsKey = `minimap.plugins.${name}`

    this.config.plugins.properties[name] = {
      type: 'boolean',
      default: true
    }

    if (atom.config.get(settingsKey) === undefined) {
      atom.config.set(settingsKey, true)
    }

    this.pluginsSubscriptions[name].add(atom.config.observe(settingsKey, () => {
      this.updatesPluginActivationState(name)
    }))

    this.pluginsSubscriptions[name].add(atom.commands.add('atom-workspace', {
      [`minimap:toggle-${name}`]: () => {
        this.togglePluginActivation(name)
      }
    }))
  }

  /**
   * When the `minimap.displayPluginsControls` setting is toggled,
   * this function will unregister the commands and setting that
   * was created previously.
   *
   * @param {string} name The identifying name of the plugin.
   * @access private
   */
  unregisterPluginControls (name) {
    this.pluginsSubscriptions[name].dispose()
    delete this.pluginsSubscriptions[name]
    delete this.config.plugins.properties[name]
  }
}
