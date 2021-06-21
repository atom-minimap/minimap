"use strict"

import { CompositeDisposable } from "atom"
import { emitter, getConfigSchema } from "./main"

/**
 * Provides methods to manage minimap plugins. Minimap plugins are Atom packages that will augment the minimap. They
 * have a secondary activation cycle going on constrained by the minimap package activation. A minimap plugin life cycle
 * will generally look like this:
 *
 * 1. The plugin module is activated by Atom through the `activate` method
 * 2. The plugin then register itself as a minimap plugin using `registerPlugin`
 * 3. The plugin is activated/deactivated according to the minimap settings.
 * 4. On the plugin module deactivation, the plugin must unregisters itself from the minimap using the `unregisterPlugin`.
 *
 * @access public
 */

// Initialize the properties for plugin management.

/**
 * The registered Minimap plugins stored using their name as key.
 *
 * @type {Object}
 * @access private
 */
export const plugins = {}
/**
 * The plugins' subscriptions stored using the plugin names as keys.
 *
 * @type {Object}
 * @access private
 */
const pluginsSubscriptions = {}

/**
 * A map that stores the display order for each plugin
 *
 * @type {Object}
 * @access private
 */
const pluginsOrderMap = {}

/**
 * Registers a minimap `plugin` with the given `name`.
 *
 * @fires {did-add-plugin} with The name and a reference to the added plugin.
 * @fires {did-activate-plugin} if The plugin was activated during the registration.
 * @param {string} name The identifying name of the plugin. It will be used as activation settings name as well as the
 *   key to unregister the module.
 * @param {MinimapPlugin} plugin The plugin to register.
 */
export function registerPlugin(name, plugin) {
  plugins[name] = plugin
  pluginsSubscriptions[name] = new CompositeDisposable()

  const event = { name, plugin }
  emitter.emit("did-add-plugin", event)

  if (atom.config.get("minimap.displayPluginsControls")) {
    registerPluginControls(name, plugin)
  }

  updatesPluginActivationState(name)
}

/**
 * Unregisters a plugin from the minimap.
 *
 * @fires {did-remove-plugin} with The name and a reference to the added plugin.
 * @param {string} name The identifying name of the plugin to unregister.
 */
export function unregisterPlugin(name) {
  const plugin = plugins[name]

  if (atom.config.get("minimap.displayPluginsControls")) {
    unregisterPluginControls(name)
  }

  delete plugins[name]

  const event = { name, plugin }
  emitter.emit("did-remove-plugin", event)
}

/**
 * Toggles the specified plugin activation state.
 *
 * @fires {did-activate-plugin} if The plugin was activated by the call.
 * @fires {did-deactivate-plugin} if The plugin was deactivated by the call.
 * @param {string} name The name of the plugin.
 * @param {boolean} boolean An optional boolean to set the activation state of the plugin. If ommitted the new plugin
 *   state will be the the inverse of its current state.
 */
export function togglePluginActivation(name, boolean) {
  const settingsKey = `minimap.plugins.${name}`

  if (boolean !== undefined && boolean !== null) {
    atom.config.set(settingsKey, boolean)
  } else {
    atom.config.set(settingsKey, !atom.config.get(settingsKey))
  }

  updatesPluginActivationState(name)
}

/**
 * Deactivates all the plugins registered in the minimap package so far.
 *
 * @fires {did-deactivate-plugin} for Each plugin deactivated by the call.
 */
export function deactivateAllPlugins() {
  for (const [name, plugin] of eachPlugin()) {
    plugin.deactivatePlugin()
    emitter.emit("did-deactivate-plugin", { name, plugin })
  }
}

/**
 * A generator function to iterate over registered plugins.
 *
 * @returns An iterable that yield the name and reference to every plugin as an array in each iteration.
 */
function* eachPlugin() {
  for (const name in plugins) {
    yield [name, plugins[name]]
  }
}

/**
 * Updates the plugin activation state according to the current config.
 *
 * @fires {did-activate-plugin} if The plugin was activated by the call.
 * @fires {did-deactivate-plugin} if The plugin was deactivated by the call.
 * @param {string} name The identifying name of the plugin to update.
 * @access private
 */
function updatesPluginActivationState(name) {
  const plugin = plugins[name]
  const pluginActive = plugin.isActive()
  const settingActive = atom.config.get(`minimap.plugins.${name}`)

  if (atom.config.get("minimap.displayPluginsControls")) {
    if (settingActive && !pluginActive) {
      activatePlugin(name, plugin)
    } else if (pluginActive && !settingActive) {
      deactivatePlugin(name, plugin)
    }
  } else {
    if (!pluginActive) {
      activatePlugin(name, plugin)
    } else if (pluginActive) {
      deactivatePlugin(name, plugin)
    }
  }
}

export function activatePlugin(name, plugin) {
  const event = { name, plugin }

  plugin.activatePlugin()
  emitter.emit("did-activate-plugin", event)
}

export function deactivatePlugin(name, plugin) {
  const event = { name, plugin }

  plugin.deactivatePlugin()
  emitter.emit("did-deactivate-plugin", event)
}

/**
 * When the `minimap.displayPluginsControls` setting is toggled, this function will register the commands and setting to
 * manage the plugin activation from the minimap settings.
 *
 * @param {string} name The identifying name of the plugin.
 * @param {MinimapPlugin} plugin The plugin instance to register controls for.
 * @listens {minimap.plugins.${name}} listen to the setting to update
 *          the plugin state accordingly.
 * @listens {minimap:toggle-${name}} listen to the command on `atom-workspace`
 *          to toggle the plugin state.
 * @access private
 */
function registerPluginControls(name, plugin) {
  const settingsKey = `minimap.plugins.${name}`
  const orderSettingsKey = `minimap.plugins.${name}DecorationsZIndex`

  const config = getConfigSchema()

  config.plugins.properties[name] = {
    type: "boolean",
    title: name,
    description: `Whether the ${name} plugin is activated and displayed in the Minimap.`,
    default: true,
  }

  config.plugins.properties[`${name}DecorationsZIndex`] = {
    type: "integer",
    title: `${name} decorations order`,
    description: `The relative order of the ${name} plugin's decorations in the layer into which they are drawn. Note that this order only apply inside a layer, so highlight-over decorations will always be displayed above line decorations as they are rendered in different layers.`,
    default: 0,
  }

  if (atom.config.get(settingsKey) === undefined) {
    atom.config.set(settingsKey, true)
  }

  if (atom.config.get(orderSettingsKey) === undefined) {
    atom.config.set(orderSettingsKey, 0)
  }

  pluginsSubscriptions[name].add(
    atom.config.observe(settingsKey, () => {
      updatesPluginActivationState(name)
    })
  )

  pluginsSubscriptions[name].add(
    atom.config.observe(orderSettingsKey, (order) => {
      updatePluginsOrderMap(name)
      const event = { name, plugin, order }
      emitter.emit("did-change-plugin-order", event)
    })
  )

  pluginsSubscriptions[name].add(
    atom.commands.add("atom-workspace", {
      [`minimap:toggle-${name}`]: () => {
        togglePluginActivation(name)
      },
    })
  )

  updatePluginsOrderMap(name)
}

/**
 * Updates the display order in the map for the passed-in plugin name.
 *
 * @param {string} name The name of the plugin to update
 * @access private
 */
function updatePluginsOrderMap(name) {
  const orderSettingsKey = `minimap.plugins.${name}DecorationsZIndex`

  pluginsOrderMap[name] = atom.config.get(orderSettingsKey)
}

/**
 * Returns the plugins display order mapped by name.
 *
 * @returns {Object} The plugins order by name
 */
export function getPluginsOrder() {
  return pluginsOrderMap
}

/**
 * When the `minimap.displayPluginsControls` setting is toggled, this function will unregister the commands and setting
 * that was created previously.
 *
 * @param {string} name The identifying name of the plugin.
 * @access private
 */
function unregisterPluginControls(name) {
  pluginsSubscriptions[name].dispose()
  delete pluginsSubscriptions[name]
  delete getConfigSchema().plugins.properties[name]
}
