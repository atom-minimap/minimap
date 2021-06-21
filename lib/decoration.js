"use strict"

import { Emitter } from "atom"

let idCounter = 0
const nextId = function () {
  return idCounter++
}

/**
 * The `Decoration` class represents a decoration in the Minimap.
 *
 * It has the same API than the `Decoration` class of a text editor.
 */
export default class Decoration {
  /**
   * Returns `true` if the passed-in decoration properties matches the specified type.
   *
   * @param {Object} decorationProperties The decoration properties to match
   * @param {string} type The decoration type to match
   * @returns {boolean} Whether the decoration properties match the type
   */
  static isType(decorationProperties, type) {
    if (Array.isArray(decorationProperties.type)) {
      if (decorationProperties.type.indexOf(type) >= 0) {
        return true
      }
      return false
    } else {
      return type === decorationProperties.type
    }
  }

  /**
   * Creates a new decoration.
   *
   * @param {Marker} marker The target marker for the decoration
   * @param {Minimap} minimap The Minimap where the decoration will be displayed
   * @param {Object} properties The decoration's properties
   */
  constructor(marker, minimap, properties) {
    /** @access private */
    this.marker = marker
    /** @access private */
    this.minimap = minimap
    /** @access private */
    this.emitter = new Emitter()
    /** @access private */
    this.id = nextId()
    /** @access private */
    this.properties = null
    this.setProperties(properties)
    this.properties.id = this.id
    /** @access private */
    this.destroyed = false
    /** @access private */
    this.markerDestroyDisposable = this.marker.onDidDestroy(() => {
      this.destroy()
    })

    this.screenRange = marker.getScreenRange()
  }

  /**
   * Destroy this marker.
   *
   * If you own the marker, you should use `Marker#destroy` which will destroy this decoration.
   */
  destroy() {
    if (this.destroyed) {
      return
    }

    this.markerDestroyDisposable?.dispose?.()
    this.destroyed = true
    this.emitter.emit("did-destroy")
    this.emitter.dispose()
  }

  /**
   * Returns whether this decoration is destroyed or not.
   *
   * @returns {boolean} Whether this decoration is destroyed or not
   */
  isDestroyed() {
    return this.destroyed
  }

  /**
   * Registers an event listener to the `did-change-properties` event.
   *
   * This event is triggered when the decoration update method is called.
   *
   * @param {function(change:Object):void} callback A function to call when the event is triggered
   * @returns {Disposable} A disposable to stop listening to the event
   */
  onDidChangeProperties(callback) {
    if (this.destroyed) {
      return
    }
    return this.emitter.on("did-change-properties", callback)
  }

  /**
   * Registers an event listener to the `did-destroy` event.
   *
   * @param {function():void} callback A function to call when the event is triggered
   * @returns {Disposable} A disposable to stop listening to the event
   */
  onDidDestroy(callback) {
    if (this.destroyed) {
      return
    }
    return this.emitter.on("did-destroy", callback)
  }

  /**
   * An id unique across all Decoration objects.
   *
   * @returns {number} The decoration id
   */
  getId() {
    return this.id
  }

  /**
   * Returns the marker associated with this Decoration.
   *
   * @returns {Marker} The decoration's marker
   */
  getMarker() {
    return this.marker
  }

  /**
   * Check if this decoration is of type `type`.
   *
   * @param {string | Array} type A type like `'line-number'`, `'line'`, etc. `type` can also be an Array of Strings,
   *   where it will return true if the decoration's type matches any in the array.
   * @returns {boolean} Whether this decoration match the passed-in type
   */
  isType(type) {
    return Decoration.isType(this.properties, type)
  }

  /**
   * Returns the Decoration's properties.
   *
   * @returns {Object} The decoration's properties
   */
  getProperties() {
    return this.properties
  }

  /**
   * Update the marker with new properties. Allows you to change the decoration's class.
   *
   * @param {Object} newProperties The new properties for the decoration
   */
  setProperties(newProperties) {
    if (this.destroyed) {
      return
    }

    const oldProperties = this.properties
    this.properties = newProperties
    this.properties.id = this.id

    this.emitter.emit("did-change-properties", { oldProperties, newProperties })
  }
}
