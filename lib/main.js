'use strict'

import { Emitter, CompositeDisposable } from 'atom'
import MinimapElement from './minimap-element'
import Minimap from './minimap'
import MinimapPluginGeneratorElement from './minimap-plugin-generator-element'
import { config } from './config'
import { deactivateAllPlugins } from './mixins/plugin-management'

export { config } from './config'
export * from './mixins/plugin-management'

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
export let active = false
/**
     * The toggle state of the package.
     *
     * @type {boolean}
     * @access private
     */
export let toggled = false
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
export let subscriptions = null
/**
     * The disposable that stores the package's commands subscription.
     *
     * @type {Disposable}
     * @access private
     */
export let subscriptionsOfCommands = null

/**
     * The package's events emitter.
     *
     * @type {Emitter}
     * @access private
     */
export const emitter = new Emitter()

/**
   * Activates the minimap package.
   */
export function activate () {
  if (active) { return }

  subscriptionsOfCommands = atom.commands.add('atom-workspace', {
    'minimap:toggle': () => {
      toggle()
    },
    'minimap:generate-coffee-plugin': () => {
      generatePlugin('coffee')
    },
    'minimap:generate-javascript-plugin': () => {
      generatePlugin('javascript')
    },
    'minimap:generate-babel-plugin': () => {
      generatePlugin('babel')
    }
  })

  editorsMinimaps = new Map()
  subscriptions = new CompositeDisposable()
  active = true

  if (atom.config.get('minimap.autoToggle')) { toggle() }
}

/**
   * Returns a {MinimapElement} for the passed-in model if it's a {Minimap}.
   *
   * @param {*} model the model for which returning a view
   * @return {MinimapElement}
   */
export function minimapViewProvider (model) {
  if (model instanceof Minimap) {
    const element = new MinimapElement()
    element.setModel(model)
    return element
  }
}

/**
   * Deactivates the minimap package.
   */
export function deactivate () {
  if (!active) { return }

  deactivateAllPlugins()

  if (editorsMinimaps) {
    editorsMinimaps.forEach((value, key) => {
      value.destroy()
      editorsMinimaps.delete(key)
    })
  }

  subscriptions.dispose()
  subscriptions = null
  subscriptionsOfCommands.dispose()
  subscriptionsOfCommands = null
  editorsMinimaps = undefined
  toggled = false
  active = false
}

export function getConfigSchema () {
  return config || atom.packages.getLoadedPackage('minimap').metadata.configSchema
}

/**
   * Toggles the minimap display.
   */
export function toggle () {
  if (!active) { return }

  if (toggled) {
    toggled = false

    if (editorsMinimaps) {
      editorsMinimaps.forEach((value, key) => {
        value.destroy()
        editorsMinimaps.delete(key)
      })
    }
    subscriptions.dispose()
  } else {
    toggled = true
    initSubscriptions()
  }
}

/**
   * Opens the plugin generation view.
   *
   * @param  {string} template the name of the template to use
   */
export function generatePlugin (template) {
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
export function onDidActivate (callback) {
  return emitter.on('did-activate', callback)
}

/**
   * Registers a callback to listen to the `did-deactivate` event of the
   * package.
   *
   * @param  {function(event:Object):void} callback the callback function
   * @return {Disposable} a disposable to stop listening to the event
   */
export function onDidDeactivate (callback) {
  return emitter.on('did-deactivate', callback)
}

/**
   * Registers a callback to listen to the `did-create-minimap` event of the
   * package.
   *
   * @param  {function(event:Object):void} callback the callback function
   * @return {Disposable} a disposable to stop listening to the event
   */
export function onDidCreateMinimap (callback) {
  return emitter.on('did-create-minimap', callback)
}

/**
   * Registers a callback to listen to the `did-add-plugin` event of the
   * package.
   *
   * @param  {function(event:Object):void} callback the callback function
   * @return {Disposable} a disposable to stop listening to the event
   */
export function onDidAddPlugin (callback) {
  return emitter.on('did-add-plugin', callback)
}

/**
   * Registers a callback to listen to the `did-remove-plugin` event of the
   * package.
   *
   * @param  {function(event:Object):void} callback the callback function
   * @return {Disposable} a disposable to stop listening to the event
   */
export function onDidRemovePlugin (callback) {
  return emitter.on('did-remove-plugin', callback)
}

/**
   * Registers a callback to listen to the `did-activate-plugin` event of the
   * package.
   *
   * @param  {function(event:Object):void} callback the callback function
   * @return {Disposable} a disposable to stop listening to the event
   */
export function onDidActivatePlugin (callback) {
  return emitter.on('did-activate-plugin', callback)
}

/**
   * Registers a callback to listen to the `did-deactivate-plugin` event of the
   * package.
   *
   * @param  {function(event:Object):void} callback the callback function
   * @return {Disposable} a disposable to stop listening to the event
   */
export function onDidDeactivatePlugin (callback) {
  return emitter.on('did-deactivate-plugin', callback)
}

/**
   * Registers a callback to listen to the `did-change-plugin-order` event of
   * the package.
   *
   * @param  {function(event:Object):void} callback the callback function
   * @return {Disposable} a disposable to stop listening to the event
   */
export function onDidChangePluginOrder (callback) {
  return emitter.on('did-change-plugin-order', callback)
}

/**
   * Returns the `Minimap` class
   *
   * @return {Function} the `Minimap` class constructor
   */
export function minimapClass () {
  return Minimap
}

/**
   * Returns the `Minimap` object associated to the passed-in
   * `TextEditorElement`.
   *
   * @param  {TextEditorElement} editorElement a text editor element
   * @return {Minimap} the associated minimap
   */
export function minimapForEditorElement (editorElement) {
  if (!editorElement) { return }
  return minimapForEditor(editorElement.getModel())
}

/**
   * Returns the `Minimap` object associated to the passed-in
   * `TextEditor`.
   *
   * @param  {TextEditor} textEditor a text editor
   * @return {Minimap} the associated minimap
   */
export function minimapForEditor (textEditor) {
  if (!textEditor) { return }
  if (!editorsMinimaps) { return }

  let minimap = editorsMinimaps.get(textEditor)

  if (!minimap) {
    minimap = new Minimap({ textEditor })
    editorsMinimaps.set(textEditor, minimap)

    const editorSubscription = textEditor.onDidDestroy(() => {
      const minimaps = editorsMinimaps
      if (minimaps) { minimaps.delete(textEditor) }
      editorSubscription.dispose()
    })
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
export function standAloneMinimapForEditor (textEditor) {
  if (!textEditor) { return }

  return new Minimap({
    textEditor: textEditor,
    standAlone: true
  })
}

/**
   * Returns the `Minimap` associated to the active `TextEditor`.
   *
   * @return {Minimap} the active Minimap
   */
export function getActiveMinimap () {
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
export function observeMinimaps (iterator) {
  if (!iterator) { return }

  if (editorsMinimaps) {
    editorsMinimaps.forEach((minimap) => { iterator(minimap) })
  }
  return onDidCreateMinimap((minimap) => { iterator(minimap) })
}

/**
   * Registers to the `observeTextEditors` method.
   *
   * @access private
   */
export function initSubscriptions () {
  subscriptions.add(atom.workspace.observeTextEditors((textEditor) => {
    const minimap = minimapForEditor(textEditor)
    const minimapElement = atom.views.getView(minimap)

    emitter.emit('did-create-minimap', minimap)
    minimapElement.attach()
  }))
}

/**
   * Returns the Minimap main module instance.
   *
   * @return {Main} The Minimap main module instance.
   */
export function provideMinimapServiceV1 () { return exports }
