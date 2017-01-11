'use strict'

const _ = require('underscore-plus')
const {Emitter} = require('atom')

let idCounter = 0
const nextId = function () { return idCounter++ }

/**
 * The `Decoration` class represents a decoration in the Minimap.
 *
 * It has the same API than the `Decoration` class of a text editor.
 */
module.exports = class Decoration {

  /**
   * Returns `true` if the passed-in decoration properties matches the
   * specified type.
   *
   * @param  {Object} decorationProperties the decoration properties to match
   * @param  {string} type the decoration type to match
   * @return {boolean} whether the decoration properties match the type
   */
  static isType (decorationProperties, type) {
    if (_.isArray(decorationProperties.type)) {
      if (decorationProperties.type.indexOf(type) >= 0) { return true }
      return false
    } else {
      return type === decorationProperties.type
    }
  }

  /**
   * Creates a new decoration.
   *
   * @param  {Marker} marker the target marker for the decoration
   * @param  {Minimap} minimap the Minimap where the decoration will
   *                           be displayed
   * @param  {Object} properties the decoration's properties
   */
  constructor (marker, minimap, properties) {
    /**
     * @access private
     */
    this.marker = marker
    /**
     * @access private
     */
    this.minimap = minimap
    /**
     * @access private
     */
    this.emitter = new Emitter()
    /**
     * @access private
     */
    this.id = nextId()
    /**
     * @access private
     */
    this.properties = null
    this.setProperties(properties)
    this.properties.id = this.id
    /**
     * @access private
     */
    this.destroyed = false
    /**
     * @access private
     */
    this.markerDestroyDisposable = this.marker.onDidDestroy(() => {
      this.destroy()
    })
  }

  /**
   * Destroy this marker.
   *
   * If you own the marker, you should use `Marker#destroy` which will destroy
   * this decoration.
   */
  destroy () {
    if (this.destroyed) { return }

    this.markerDestroyDisposable.dispose()
    this.markerDestroyDisposable = null
    this.destroyed = true
    this.emitter.emit('did-destroy')
    this.emitter.dispose()
  }

  /**
   * Returns whether this decoration is destroyed or not.
   *
   * @return {boolean} whether this decoration is destroyed or not
   */
  isDestroyed () { return this.destroyed }

  /**
   * Registers an event listener to the `did-change-properties` event.
   *
   * This event is triggered when the decoration update method is called.
   *
   * @param  {function(change:Object):void} callback a function to call
   *                                        when the event is triggered
   * @return {Disposable} a disposable to stop listening to the event
   */
  onDidChangeProperties (callback) {
    return this.emitter.on('did-change-properties', callback)
  }

  /**
   * Registers an event listener to the `did-destroy` event.
   *
   * @param  {function():void} callback a function to call when the event
   *                                    is triggered
   * @return {Disposable} a disposable to stop listening to the event
   */
  onDidDestroy (callback) {
    return this.emitter.on('did-destroy', callback)
  }

  /**
   * An id unique across all Decoration objects.
   *
   * @return {number} the decoration id
   */
  getId () { return this.id }

  /**
   * Returns the marker associated with this Decoration.
   *
   * @return {Marker} the decoration's marker
   */
  getMarker () { return this.marker }

  /**
   * Check if this decoration is of type `type`.
   *
   * @param  {string|Array} type a type like `'line-number'`, `'line'`, etc.
   *                             `type` can also be an Array of Strings, where
   *                             it will return true if the decoration's type
   *                             matches any in the array.
   * @return {boolean} whether this decoration match the passed-in type
   */
  isType (type) {
    return Decoration.isType(this.properties, type)
  }

  /**
   * Returns the Decoration's properties.
   *
   * @return {Object} the decoration's properties
   */
  getProperties () {
    return this.properties
  }

  /**
   * Update the marker with new properties. Allows you to change the
   * decoration's class.
   *
   * @param {Object} newProperties the new properties for the decoration
   */
  setProperties (newProperties) {
    if (this.destroyed) { return }

    let oldProperties = this.properties
    this.properties = newProperties
    this.properties.id = this.id

    this.emitter.emit('did-change-properties', {oldProperties, newProperties})
  }
}
