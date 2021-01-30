"use strict"

import { Emitter, CompositeDisposable } from "atom"
import MinimapElement from "./minimap-element"
import Minimap from "./minimap"
import config from "./config.json"
import * as PluginManagement from "./plugin-management"
import { treeSitterWarning } from "./performance-monitor"
import DOMStylesReader from "./dom-styles-reader"

export { default as config } from "./config.json"
export * from "./plugin-management"
export { default as Minimap } from "./minimap"

/**
 * The `Minimap` package provides an eagle-eye view of text buffers.
 *
 * It also provides API for plugin packages that want to interact with the
 * minimap and be available to the user through the minimap settings.
 */

/**
 * The activation state of the package.
 *
 * @type {boolean}
 * @access private
 */
let active = false
/**
 * The toggle state of the package.
 *
 * @type {boolean}
 * @access private
 */
let toggled = false
/**
 * The `Map` where Minimap instances are stored with the text editor they
 * target as key.
 *
 * @type {Map}
 * @access private
 */
export let editorsMinimaps = null
/**
 * The composite disposable that stores the package's subscriptions.
 *
 * @type {CompositeDisposable}
 * @access private
 */
let subscriptions = null
/**
 * The disposable that stores the package's commands subscription.
 *
 * @type {Disposable}
 * @access private
 */
let subscriptionsOfCommands = null

/**
 * The package's events emitter.
 *
 * @type {Emitter}
 * @access private
 */
export const emitter = new Emitter()

/**
  DOMStylesReader cache used for storing token colors
*/
export let domStylesReader = null

/**
 * Activates the minimap package.
 */
export function activate() {
  if (active) {
    return
  }

  subscriptionsOfCommands = atom.commands.add("atom-workspace", {
    "minimap:toggle": () => {
      toggle()
    },
    "minimap:generate-coffee-plugin": async () => {
      await generatePlugin("coffee")
    },
    "minimap:generate-javascript-plugin": async () => {
      await generatePlugin("javascript")
    },
    "minimap:generate-babel-plugin": async () => {
      await generatePlugin("babel")
    },
  })

  editorsMinimaps = new Map()
  domStylesReader = new DOMStylesReader()

  subscriptions = new CompositeDisposable()
  active = true

  if (atom.config.get("minimap.autoToggle")) {
    toggle()
  }
}

/**
 * Returns a {MinimapElement} for the passed-in model if it's a {Minimap}.
 *
 * @param {Minimap} model the model for which returning a view
 * @return {MinimapElement}
 */
export function minimapViewProvider(model) {
  if (model instanceof Minimap) {
    const element = new MinimapElement()
    element.setModel(model)
    return element
  }
}

/**
 * Deactivates the minimap package.
 */
export function deactivate() {
  if (!active) {
    return
  }

  PluginManagement.deactivateAllPlugins()

  if (editorsMinimaps) {
    editorsMinimaps.forEach((value) => {
      value.destroy()
    })
    editorsMinimaps.clear()
  }

  subscriptions.dispose()
  subscriptionsOfCommands.dispose()
  domStylesReader.invalidateDOMStylesCache()
  toggled = false
  active = false
}

export function getConfigSchema() {
  return config || atom.packages.getLoadedPackage("minimap").metadata.configSchema
}

/**
 * Toggles the minimap display.
 */
export function toggle() {
  if (!active) {
    return
  }

  if (toggled) {
    toggled = false

    if (editorsMinimaps) {
      editorsMinimaps.forEach((minimap) => {
        minimap.destroy()
      })
      editorsMinimaps.clear()
    }
    subscriptions.dispose()

    // HACK: this hack forces rerendering editor size which moves the scrollbar to the right once minimap is removed
    const wasMaximized = atom.isMaximized()
    const { width, height } = atom.getSize()
    atom.setSize(width, height)
    if (wasMaximized) {
      atom.maximize()
    }
  } else {
    toggled = true
    initSubscriptions()
  }
  domStylesReader.invalidateDOMStylesCache()
}

/**
 * Opens the plugin generation view.
 *
 * @param  {string} template the name of the template to use
 */
async function generatePlugin(template) {
  const { default: MinimapPluginGeneratorElement } = await import("./minimap-plugin-generator-element")
  const view = new MinimapPluginGeneratorElement()
  view.template = template
  view.attach()
}

/**
 * Registers a callback to listen to the `did-activate` event of the package.
 *
 * @param  {function(event:Object):void} callback the callback function
 * @return {Disposable} a disposable to stop listening to the event
 */
export function onDidActivate(callback) {
  return emitter.on("did-activate", callback)
}

/**
 * Registers a callback to listen to the `did-deactivate` event of the
 * package.
 *
 * @param  {function(event:Object):void} callback the callback function
 * @return {Disposable} a disposable to stop listening to the event
 */
export function onDidDeactivate(callback) {
  return emitter.on("did-deactivate", callback)
}

/**
 * Registers a callback to listen to the `did-create-minimap` event of the
 * package.
 *
 * @param  {function(event:Object):void} callback the callback function
 * @return {Disposable} a disposable to stop listening to the event
 */
export function onDidCreateMinimap(callback) {
  return emitter.on("did-create-minimap", callback)
}

/**
 * Registers a callback to listen to the `did-add-plugin` event of the
 * package.
 *
 * @param  {function(event:Object):void} callback the callback function
 * @return {Disposable} a disposable to stop listening to the event
 */
export function onDidAddPlugin(callback) {
  return emitter.on("did-add-plugin", callback)
}

/**
 * Registers a callback to listen to the `did-remove-plugin` event of the
 * package.
 *
 * @param  {function(event:Object):void} callback the callback function
 * @return {Disposable} a disposable to stop listening to the event
 */
export function onDidRemovePlugin(callback) {
  return emitter.on("did-remove-plugin", callback)
}

/**
 * Registers a callback to listen to the `did-activate-plugin` event of the
 * package.
 *
 * @param  {function(event:Object):void} callback the callback function
 * @return {Disposable} a disposable to stop listening to the event
 */
export function onDidActivatePlugin(callback) {
  return emitter.on("did-activate-plugin", callback)
}

/**
 * Registers a callback to listen to the `did-deactivate-plugin` event of the
 * package.
 *
 * @param  {function(event:Object):void} callback the callback function
 * @return {Disposable} a disposable to stop listening to the event
 */
export function onDidDeactivatePlugin(callback) {
  return emitter.on("did-deactivate-plugin", callback)
}

/**
 * Registers a callback to listen to the `did-change-plugin-order` event of
 * the package.
 *
 * @param  {function(event:Object):void} callback the callback function
 * @return {Disposable} a disposable to stop listening to the event
 */
export function onDidChangePluginOrder(callback) {
  return emitter.on("did-change-plugin-order", callback)
}

/**
 * Returns the `Minimap` class
 *
 * @return {Function} the `Minimap` class constructor
 */
export function minimapClass() {
  return Minimap
}

/**
 * Returns the `Minimap` object associated to the passed-in
 * `TextEditorElement`.
 *
 * @param  {TextEditorElement} editorElement a text editor element
 * @return {Minimap} the associated minimap
 */
export function minimapForEditorElement(editorElement) {
  if (!editorElement) {
    return
  }
  return minimapForEditor(editorElement.getModel())
}

/**
 * Returns the `Minimap` object associated to the passed-in
 * `TextEditor`.
 *
 * @param  {TextEditor} textEditor a text editor
 * @return {Minimap} the associated minimap
 */
export function minimapForEditor(textEditor) {
  if (!textEditor) {
    return
  }
  if (!editorsMinimaps) {
    return
  }

  let minimap = editorsMinimaps.get(textEditor)

  if (minimap === undefined || minimap.destroyed) {
    minimap = new Minimap({ textEditor })
    editorsMinimaps.set(textEditor, minimap)

    const editorSubscription = textEditor.onDidDestroy(() => {
      if (editorsMinimaps) {
        editorsMinimaps.delete(textEditor)
      }
      if (minimap) {
        // just in case
        minimap.destroy()
      }
      editorSubscription.dispose()
    })
    // dispose the editorSubscription if minimap is deactivated before destroying the editor
    subscriptions.add(editorSubscription)
  }

  return minimap
}

/**
 * Returns a new stand-alone {Minimap} for the passed-in `TextEditor`.
 *
 * @param  {TextEditor} textEditor a text editor instance to create
 *                                 a minimap for
 * @return {Minimap} a new stand-alone Minimap for the passed-in editor
 */
export function standAloneMinimapForEditor(textEditor) {
  if (!textEditor) {
    return
  }

  return new Minimap({
    textEditor,
    standAlone: true,
  })
}

/**
 * Returns the `Minimap` associated to the active `TextEditor`.
 *
 * @return {Minimap} the active Minimap
 */
export function getActiveMinimap() {
  return minimapForEditor(atom.workspace.getActiveTextEditor())
}

/**
 * Calls a function for each present and future minimaps.
 *
 * @param  {function(minimap:Minimap):void} iterator a function to call with
 *                                                   the existing and future
 *                                                   minimaps
 * @return {Disposable} a disposable to unregister the observer
 */
export function observeMinimaps(iterator) {
  if (!iterator) {
    return
  }

  if (editorsMinimaps) {
    editorsMinimaps.forEach((minimap) => {
      iterator(minimap)
    })
  }
  return onDidCreateMinimap((minimap) => {
    iterator(minimap)
  })
}

/**
 * Registers to the `observeTextEditors` method.
 *
 * @access private
 */
function initSubscriptions() {
  subscriptions.add(
    atom.workspace.observeTextEditors((textEditor) => {
      const minimap = minimapForEditor(textEditor)
      const minimapElement = minimap.getMinimapElement() || minimapViewProvider(minimap)

      emitter.emit("did-create-minimap", minimap)
      minimapElement.attach(textEditor.getElement())
    }),
    // empty color cache if the theme changes
    atom.themes.onDidChangeActiveThemes(() => {
      domStylesReader.invalidateDOMStylesCache()
      editorsMinimaps.forEach((minimap) => {
        atom.views.getView(minimap).requestForcedUpdate()
      })
    }),
    treeSitterWarning()
  )
}

// The public exports included in the service:
const MinimapServiceV1 = {
  minimapViewProvider,
  getConfigSchema,
  onDidActivate,
  onDidDeactivate,
  onDidCreateMinimap,
  onDidAddPlugin,
  onDidRemovePlugin,
  onDidActivatePlugin,
  onDidDeactivatePlugin,
  onDidChangePluginOrder,
  minimapClass,
  minimapForEditorElement,
  minimapForEditor,
  standAloneMinimapForEditor,
  getActiveMinimap,
  observeMinimaps,
  registerPlugin: PluginManagement.registerPlugin,
  unregisterPlugin: PluginManagement.unregisterPlugin,
  togglePluginActivation: PluginManagement.togglePluginActivation,
  deactivateAllPlugins: PluginManagement.deactivateAllPlugins,
  activatePlugin: PluginManagement.activatePlugin,
  deactivatePlugin: PluginManagement.deactivatePlugin,
  getPluginsOrder: PluginManagement.getPluginsOrder,
}

/**
 * Returns the Minimap main module instance.
 *
 * @return {Main} The Minimap main module instance.
 */
export function provideMinimapServiceV1() {
  return MinimapServiceV1
}
