"use strict"

import { Emitter } from "atom"
import { escapeRegExp } from "./deps/underscore-plus"
import path from "path"
import Decoration from "./decoration"

/**
 * The mixin that provides the decorations API to the minimap editor view.
 *
 * This mixin is injected into the `Minimap` prototype, so every methods defined in this file will be available on any
 * `Minimap` instance.
 */
export default class DecorationManagement {
  /** Initializes the decorations related properties. */
  initializeDecorations(minimap) {
    this.minimap = minimap

    if (this.emitter == null) {
      /**
       * The minimap emitter, lazily created if not created yet.
       *
       * @type {Emitter}
       * @access private
       */
      this.emitter = new Emitter()
    } else {
      this.emitter = this.minimap.emitter
    }

    /**
     * A map with the decoration id as key and the decoration as value.
     *
     * @type {Object}
     * @access private
     */
    this.decorationsById = new Map()
    /**
     * The decorations stored in an array indexed with their marker id.
     *
     * @type {Object}
     * @access private
     */
    this.decorationsByMarkerId = new Map()
    /**
     * The subscriptions to the markers `did-change` event indexed using the marker id.
     *
     * @type {Object}
     * @access private
     */
    this.decorationMarkerChangedSubscriptions = new Map()
    /**
     * The subscriptions to the markers `did-destroy` event indexed using the marker id.
     *
     * @type {Object}
     * @access private
     */
    this.decorationMarkerDestroyedSubscriptions = new Map()
    /**
     * The subscriptions to the decorations `did-change-properties` event indexed using the decoration id.
     *
     * @type {Object}
     * @access private
     */
    this.decorationUpdatedSubscriptions = new Map()
    /**
     * The subscriptions to the decorations `did-destroy` event indexed using the decoration id.
     *
     * @type {Object}
     * @access private
     */
    this.decorationDestroyedSubscriptions = new Map()

    // is set to true when a minimapElement is destroyed
    this.destroyed = false
  }

  /**
   * Returns all the decorations registered in the current `Minimap`.
   *
   * @returns {Decoration[]} All the decorations in this `Minimap`
   */
  getDecorations() {
    return [...this.decorationsById.values()]
  }

  /**
   * Registers an event listener to the `did-add-decoration` event.
   *
   * @param {function(event:Object):void} callback A function to call when the event is triggered. the callback will be
   *   called with an event object with the following properties:
   *
   *   - Marker: the marker object that was decorated
   *   - Decoration: the decoration object that was created
   *
   * @returns {Disposable} A disposable to stop listening to the event
   */
  onDidAddDecoration(callback) {
    return this.emitter.on("did-add-decoration", callback)
  }

  /**
   * Registers an event listener to the `did-remove-decoration` event.
   *
   * @param {function(event:Object):void} callback A function to call when the event is triggered. the callback will be
   *   called with an event object with the following properties:
   *
   *   - Marker: the marker object that was decorated
   *   - Decoration: the decoration object that was created
   *
   * @returns {Disposable} A disposable to stop listening to the event
   */
  onDidRemoveDecoration(callback) {
    return this.emitter.on("did-remove-decoration", callback)
  }

  /**
   * Registers an event listener to the `did-change-decoration` event.
   *
   * This event is triggered when the marker targeted by the decoration was changed.
   *
   * @param {function(event:Object):void} callback A function to call when the event is triggered. the callback will be
   *   called with an event object with the following properties:
   *
   *   - Marker: the marker object that was decorated
   *   - Decoration: the decoration object that was created
   *
   * @returns {Disposable} A disposable to stop listening to the event
   */
  onDidChangeDecoration(callback) {
    return this.emitter.on("did-change-decoration", callback)
  }

  /**
   * Registers an event listener to the `did-change-decoration-range` event.
   *
   * This event is triggered when the marker range targeted by the decoration was changed.
   *
   * @param {function(event:Object):void} callback A function to call when the event is triggered. the callback will be
   *   called with an event object with the following properties:
   *
   *   - Marker: the marker object that was decorated
   *   - Decoration: the decoration object that was created
   *
   * @returns {Disposable} A disposable to stop listening to the event
   */
  onDidChangeDecorationRange(callback) {
    return this.emitter.on("did-change-decoration-range", callback)
  }

  /**
   * Registers an event listener to the `did-update-decoration` event.
   *
   * This event is triggered when the decoration itself is modified.
   *
   * @param {function(decoration:Decoration):void} callback A function to call when the event is triggered
   * @returns {Disposable} A disposable to stop listening to the event
   */
  onDidUpdateDecoration(callback) {
    return this.emitter.on("did-update-decoration", callback)
  }

  /**
   * Returns the decoration with the passed-in id.
   *
   * @param {number} id The decoration id
   * @returns {Decoration} The decoration with the given id
   */
  decorationForId(id) {
    return this.decorationsById.get(id)
  }

  /**
   * Returns all the decorations that intersect the passed-in row range.
   *
   * @param {number} startScreenRow The first row of the range
   * @param {number} endScreenRow The last row of the range
   * @returns {Record<string, Decoration>} The decorations that intersect the passed-in range
   */
  decorationsForScreenRowRange(startScreenRow, endScreenRow) {
    const decorationsByMarkerId = {}
    const markers = this.findMarkers({
      intersectsScreenRowRange: [startScreenRow, endScreenRow],
    })

    for (let i = 0, len = markers.length; i < len; i++) {
      const marker = markers[i]
      const decorations = this.decorationsByMarkerId.get(marker.id)

      if (decorations !== undefined) {
        decorationsByMarkerId[marker.id] = decorations
      }
    }

    return decorationsByMarkerId
  }

  /**
   * Returns the decorations that intersects the passed-in row range in a structured way.
   *
   * At the first level, the keys are the available decoration types. At the second level, the keys are the row index
   * for which there are decorations available. The value is an array containing the decorations that intersects with
   * the corresponding row.
   *
   * @property {Object} line All the line decorations by row
   * @property {Decoration[]} line[row] All the line decorations at a given row
   * @property {Object} highlight-under All the highlight-under decorations by row
   * @property {Decoration[]} highlight-under[row] All the highlight-under decorations at a given row
   * @property {Object} highlight-over All the highlight-over decorations by row
   * @property {Decoration[]} highlight-over[row] All the highlight-over decorations at a given row
   * @property {Object} highlight-outine All the highlight-outine decorations by row
   * @property {Decoration[]} highlight-outine[row] All the highlight-outine decorations at a given row
   * @returns {Object} The decorations grouped by type and then rows
   */
  decorationsByTypeThenRows() {
    if (this.decorationsByTypeThenRowsCache != null) {
      return this.decorationsByTypeThenRowsCache
    }

    const cache = {}

    const decorations = this.decorationsById.values()
    for (const decoration of decorations) {
      const range = decoration.marker.getScreenRange()
      const type = decoration.getProperties().type

      if (cache[type] == null) {
        cache[type] = {}
      }

      for (let row = range.start.row, len = range.end.row; row <= len; row++) {
        if (cache[type][row] == null) {
          cache[type][row] = []
        }

        cache[type][row].push(decoration)
      }
    }

    /**
     * The grouped decorations cache.
     *
     * @type {Object}
     * @access private
     */
    this.decorationsByTypeThenRowsCache = cache
    return cache
  }

  /** Invalidates the decoration by screen rows cache. */
  invalidateDecorationForScreenRowsCache() {
    this.decorationsByTypeThenRowsCache = null
  }

  /**
   * Adds a decoration that tracks a `Marker`. When the marker moves, is invalidated, or is destroyed, the decoration
   * will be updated to reflect the marker's state.
   *
   * @fires {did-add-decoration} when The decoration is created successfully
   * @fires {did-change} when The decoration is created successfully
   * @param {Marker} marker The marker you want this decoration to follow
   * @param {Object} decorationParams The decoration properties
   * @param {string} decorationParams.type The decoration type in the following list:
   *
   *   - **line**: Fills the line background with the decoration color.
   *   - **highlight**: Renders a colored rectangle on the minimap. The highlight is rendered above the line's text.
   *   - **highlight-over**: Same as **highlight**.
   *   - **highlight-under**: Renders a colored rectangle on the minimap. The highlight is rendered below the line's text.
   *   - **highlight-outline**: Renders a colored outline on the minimap. The highlight box is rendered above the line's text.
   *   - **foreground-custom**: A decoration type for which you have the control over the render routine. Note that your
   *       routine should implement a render on a per-line basis to avoid any side-effect with the offset bitmap cache
   *       mechanism. These decorations are rendred on the foreground decorations layer.
   *   - **background-custom**: A decoration type for which you have the control over the render routine. Note that your
   *       routine should implement a render on a per-line basis to avoid any side-effect with the offset bitmap cache
   *       mechanism. These decorations are rendred on the background decorations layer.
   *
   * @param {string} [decorationParams.class] The CSS class to use to retrieve the background color of the decoration by
   *   building a scop corresponding to `.minimap .editor <your-class>`
   * @param {string} [decorationParams.scope] The scope to use to retrieve the decoration background. Note that if the
   *   `scope` property is set, the `class` won't be used.
   * @param {string} [decorationParams.color] The CSS color to use to render the decoration. When set, neither `scope`
   *   nor `class` are used.
   * @param {string} [decorationParams.plugin] The name of the plugin that created this decoration. It'll be used to
   *   order the decorations on the same layer and that are overlapping. If the parameter is omitted the Minimap will
   *   attempt to infer the plugin origin from the path of the caller function.
   * @param {function} [decorationParams.render] The render routine for custom decorations. The function receives the
   *   decoration and the render data for the current render pass.
   * @returns {Decoration} The created decoration
   */
  decorateMarker(marker, decorationParams) {
    if (this.destroyed || this.minimap.destroyed || marker == null) {
      return
    }

    const { id } = marker

    if (decorationParams.type === "highlight") {
      decorationParams.type = "highlight-over"
    }

    const { type, plugin } = decorationParams

    if (plugin == null) {
      decorationParams.plugin = getOriginatorPackageName()
    }

    if (decorationParams.scope == null && decorationParams.class != null) {
      const cls = decorationParams.class.split(" ").join(".")
      decorationParams.scope = `.minimap .${cls}`
    }

    if (!this.decorationMarkerDestroyedSubscriptions.has(id)) {
      this.decorationMarkerDestroyedSubscriptions.set(
        id,
        marker.onDidDestroy(() => {
          this.removeAllDecorationsForMarker(marker)
        })
      )
    }

    if (!this.decorationMarkerChangedSubscriptions.has(id)) {
      this.decorationMarkerChangedSubscriptions.set(
        id,
        marker.onDidChange((event) => {
          const decorations = this.decorationsByMarkerId.get(id)
          const screenRange = marker.getScreenRange()

          this.invalidateDecorationForScreenRowsCache()

          if (decorations !== undefined) {
            for (let i = 0, len = decorations.length; i < len; i++) {
              const decoration = decorations[i]
              this.emitter.emit("did-change-decoration", {
                marker,
                decoration,
                event,
              })
              this.emitDecorationChanges(decoration.type, decoration)

              decoration.screenRange = screenRange
            }
          }
          let oldStart = event.oldTailScreenPosition
          let oldEnd = event.oldHeadScreenPosition
          let newStart = event.newTailScreenPosition
          let newEnd = event.newHeadScreenPosition

          if (oldStart.row > oldEnd.row) {
            ;[oldStart, oldEnd] = [oldEnd, oldStart]
          }
          if (newStart.row > newEnd.row) {
            ;[newStart, newEnd] = [newEnd, newStart]
          }

          const rangesDiffs = computeRangesDiffs(oldStart, oldEnd, newStart, newEnd)

          for (let i = 0, len = rangesDiffs.length; i < len; i++) {
            const [start, end] = rangesDiffs[i]
            this.emitRangeChanges(
              type,
              {
                start,
                end,
              },
              0
            )
          }
        })
      )
    }

    const decoration = new Decoration(marker, this, decorationParams)

    if (!this.decorationsByMarkerId.has(id)) {
      this.decorationsByMarkerId.set(id, [])
    }

    this.decorationsByMarkerId.get(id).push(decoration)
    this.decorationsById.set(decoration.id, decoration)

    if (!this.decorationUpdatedSubscriptions.has(decoration.id)) {
      this.decorationUpdatedSubscriptions.set(
        decoration.id,
        decoration.onDidChangeProperties((event) => {
          this.emitDecorationChanges(type, decoration)
        })
      )
    }

    this.decorationDestroyedSubscriptions.set(
      decoration.id,
      decoration.onDidDestroy(() => {
        this.removeDecoration(decoration)
      })
    )

    this.emitDecorationChanges(type, decoration)
    this.emitter.emit("did-add-decoration", {
      marker,
      decoration,
    })

    return decoration
  }

  /**
   * Emits a change in the `Minimap` corresponding to the passed-in decoration.
   *
   * @param {string} type The type of decoration that changed
   * @param {Decoration} decoration The decoration for which emitting an event
   * @access private
   */
  emitDecorationChanges(type, decoration) {
    if (this.destroyed || this.minimap.editorDestroyed()) {
      return
    }

    this.invalidateDecorationForScreenRowsCache()

    const range = decoration.screenRange
    if (!range.start || !range.end) {
      return
    }

    this.emitRangeChanges(type, range, 0)
  }

  /**
   * Emits a change for the specified range.
   *
   * @param {string} type The type of decoration that changed
   * @param {Object} range The range where changes occured
   * @param {number} [screenDelta] An optional screen delta for the change object
   * @access private
   */
  emitRangeChanges(type, range, screenDelta) {
    const startScreenRow = range.start.row
    const endScreenRow = range.end.row
    const lastRenderedScreenRow = this.minimap.getLastVisibleScreenRow()
    const firstRenderedScreenRow = this.minimap.getFirstVisibleScreenRow()

    if (screenDelta == null) {
      screenDelta = lastRenderedScreenRow - firstRenderedScreenRow - (endScreenRow - startScreenRow)
    }

    const changeEvent = {
      start: startScreenRow,
      end: endScreenRow,
      screenDelta,
      type,
    }

    this.emitter.emit("did-change-decoration-range", changeEvent)
  }

  /**
   * Removes a `Decoration` from this minimap.
   *
   * @fires {did-change} when The decoration is removed
   * @fires {did-remove-decoration} when The decoration is removed
   * @param {Decoration} decoration The decoration to remove
   */
  removeDecoration(decoration) {
    if (decoration == null) {
      return
    }

    const marker = decoration.marker
    let subscription

    this.decorationsById.delete(decoration.id)

    subscription = this.decorationUpdatedSubscriptions.get(decoration.id)
    if (subscription !== undefined) {
      subscription.dispose()
    }

    subscription = this.decorationDestroyedSubscriptions.get(decoration.id)
    if (subscription !== undefined) {
      subscription.dispose()
    }

    this.decorationUpdatedSubscriptions.delete(decoration.id)
    this.decorationDestroyedSubscriptions.delete(decoration.id)

    const decorations = this.decorationsByMarkerId.get(marker.id)
    if (decorations === undefined) {
      return
    }

    this.emitDecorationChanges(decoration.getProperties().type, decoration)

    const index = decorations.indexOf(decoration)
    if (index > -1) {
      decorations.splice(index, 1)

      this.emitter.emit("did-remove-decoration", {
        marker,
        decoration,
      })

      if (decorations.length === 0) {
        this.removedAllMarkerDecorations(marker)
      }
    }
  }

  /**
   * Removes all the decorations registered for the passed-in marker.
   *
   * @fires {did-change} when A decoration have been removed
   * @fires {did-remove-decoration} when A decoration have been removed
   * @param {Marker} marker The marker for which removing its decorations
   */
  removeAllDecorationsForMarker(marker) {
    if (marker == null) {
      return
    }

    const decorations = this.decorationsByMarkerId.get(marker.id)
    if (decorations === undefined) {
      return
    }

    for (let i = 0, len = decorations.length; i < len; i++) {
      const decoration = decorations[i]

      if (!this.destroyed && !this.minimap.editorDestroyed()) {
        this.emitDecorationChanges(decoration.getProperties().type, decoration)
      }
      this.emitter.emit("did-remove-decoration", {
        marker,
        decoration,
      })
    }

    this.removedAllMarkerDecorations(marker)
  }

  /**
   * Performs the removal of a decoration for a given marker.
   *
   * @param {Marker} marker The marker for which removing decorations
   * @access private
   */
  removedAllMarkerDecorations(marker) {
    if (marker == null) {
      return
    }

    this.decorationMarkerChangedSubscriptions.get(marker.id).dispose()
    this.decorationMarkerDestroyedSubscriptions.get(marker.id).dispose()

    this.decorationsByMarkerId.delete(marker.id)
    this.decorationMarkerChangedSubscriptions.delete(marker.id)
    this.decorationMarkerDestroyedSubscriptions.delete(marker.id)
  }

  /** Removes all the decorations that was created in the current `Minimap`. */
  removeAllDecorations() {
    const decorationMarkerChangedSubscriptionsValues = this.decorationMarkerChangedSubscriptions.values()
    for (const decoration of decorationMarkerChangedSubscriptionsValues) {
      decoration.dispose()
    }

    const decorationMarkerDestroyedSubscriptionsValues = this.decorationMarkerDestroyedSubscriptions.values()
    for (const decoration of decorationMarkerDestroyedSubscriptionsValues) {
      decoration.dispose()
    }

    const decorationUpdatedSubscriptionsValues = this.decorationUpdatedSubscriptions.values()
    for (const decoration of decorationUpdatedSubscriptionsValues) {
      decoration.dispose()
    }

    const decorationDestroyedSubscriptionsValues = this.decorationDestroyedSubscriptions.values()
    for (const decoration of decorationDestroyedSubscriptionsValues) {
      decoration.dispose()
    }

    const decorationsByIdValues = this.decorationsById.values()
    for (const decoration of decorationsByIdValues) {
      decoration.destroy()
    }

    this.decorationsById.clear()
    this.decorationsByMarkerId.clear()
    this.decorationMarkerChangedSubscriptions.clear()
    this.decorationMarkerDestroyedSubscriptions.clear()
    this.decorationUpdatedSubscriptions.clear()
    this.decorationDestroyedSubscriptions.clear()
  }

  destroy() {
    this.removeAllDecorations()
    this.minimap = undefined
    this.emitter = undefined
    this.destroyed = true
  }
}

function getOriginatorPackageName() {
  const line = new Error().stack.split("\n")[3]
  const filePath = line.split("(")[1].replace(")", "")
  const re = new RegExp(atom.packages.getPackageDirPaths().join("|") + escapeRegExp(path.sep))
  const plugin = filePath
    .replace(re, "")
    .split(path.sep)[0]
    .replace(/minimap-|-minimap/, "")
  return plugin.indexOf(path.sep) < 0 ? plugin : undefined
}

/**
 * Given two ranges, it returns an array of ranges representing the differences between them.
 *
 * @param {number} oldStart The row index of the first range start
 * @param {number} oldEnd The row index of the first range end
 * @param {number} newStart The row index of the second range start
 * @param {number} newEnd The row index of the second range end
 * @returns {Object[]} The array of diff ranges
 * @access private
 */
function computeRangesDiffs(oldStart, oldEnd, newStart, newEnd) {
  const diffs = []

  if (oldStart.isLessThan(newStart)) {
    diffs.push([oldStart, newStart])
  } else if (newStart.isLessThan(oldStart)) {
    diffs.push([newStart, oldStart])
  }

  if (oldEnd.isLessThan(newEnd)) {
    diffs.push([oldEnd, newEnd])
  } else if (newEnd.isLessThan(oldEnd)) {
    diffs.push([newEnd, oldEnd])
  }

  return diffs
}
