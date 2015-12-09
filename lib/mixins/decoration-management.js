'use babel'

import Mixin from 'mixto'
import { Emitter } from 'atom'
import Decoration from '../decoration'

/**
 * The mixin that provides the decorations API to the minimap editor
 * view.
 *
 * This mixin is injected into the `Minimap` prototype, so every methods defined
 * in this file will be available on any `Minimap` instance.
 */
export default class DecorationManagement extends Mixin {

  /**
   * Initializes the decorations related properties.
   */
  initializeDecorations () {
    if (this.emitter == null) {
      /**
       * The minimap emitter, lazily created if not created yet.
       * @type {Emitter}
       * @access private
       */
      this.emitter = new Emitter()
    }

    /**
     * A map with the decoration id as key and the decoration as value.
     * @type {Object}
     * @access private
     */
    this.decorationsById = {}
    /**
     * The decorations stored in an array indexed with their marker id.
     * @type {Object}
     * @access private
     */
    this.decorationsByMarkerId = {}
    /**
     * The subscriptions to the markers `did-change` event indexed using the
     * marker id.
     * @type {Object}
     * @access private
     */
    this.decorationMarkerChangedSubscriptions = {}
    /**
     * The subscriptions to the markers `did-destroy` event indexed using the
     * marker id.
     * @type {Object}
     * @access private
     */
    this.decorationMarkerDestroyedSubscriptions = {}
    /**
     * The subscriptions to the decorations `did-change-properties` event
     * indexed using the decoration id.
     * @type {Object}
     * @access private
     */
    this.decorationUpdatedSubscriptions = {}
    /**
     * The subscriptions to the decorations `did-destroy` event indexed using
     * the decoration id.
     * @type {Object}
     * @access private
     */
    this.decorationDestroyedSubscriptions = {}
  }

  /**
   * Returns all the decorations registered in the current `Minimap`.
   *
   * @return {Array<Decoration>} all the decorations in this `Minimap`
   */
  getDecorations () {
    const decorations = this.decorationsById
    const results = []

    for (const id in decorations) { results.push(decorations[id]) }

    return results
  }

  /**
   * Registers an event listener to the `did-add-decoration` event.
   *
   * @param  {function(event:Object):void} callback a function to call when the
   *                                               event is triggered.
   *                                               the callback will be called
   *                                               with an event object with
   *                                               the following properties:
   * - marker: the marker object that was decorated
   * - decoration: the decoration object that was created
   * @return {Disposable} a disposable to stop listening to the event
   */
  onDidAddDecoration (callback) {
    return this.emitter.on('did-add-decoration', callback)
  }

  /**
   * Registers an event listener to the `did-remove-decoration` event.
   *
   * @param  {function(event:Object):void} callback a function to call when the
   *                                               event is triggered.
   *                                               the callback will be called
   *                                               with an event object with
   *                                               the following properties:
   * - marker: the marker object that was decorated
   * - decoration: the decoration object that was created
   * @return {Disposable} a disposable to stop listening to the event
   */
  onDidRemoveDecoration (callback) {
    return this.emitter.on('did-remove-decoration', callback)
  }

  /**
   * Registers an event listener to the `did-change-decoration` event.
   *
   * This event is triggered when the marker targeted by the decoration
   * was changed.
   *
   * @param  {function(event:Object):void} callback a function to call when the
   *                                               event is triggered.
   *                                               the callback will be called
   *                                               with an event object with
   *                                               the following properties:
   * - marker: the marker object that was decorated
   * - decoration: the decoration object that was created
   * @return {Disposable} a disposable to stop listening to the event
   */
  onDidChangeDecoration (callback) {
    return this.emitter.on('did-change-decoration', callback)
  }

  /**
   * Registers an event listener to the `did-update-decoration` event.
   *
   * This event is triggered when the decoration itself is modified.
   *
   * @param  {function(decoration:Decoration):void} callback a function to call
   *                                                         when the event is
   *                                                         triggered
   * @return {Disposable} a disposable to stop listening to the event
   */
  onDidUpdateDecoration (callback) {
    return this.emitter.on('did-update-decoration', callback)
  }

  /**
   * Returns the decoration with the passed-in id.
   *
   * @param  {number} id the decoration id
   * @return {Decoration} the decoration with the given id
   */
  decorationForId (id) {
    return this.decorationsById[id]
  }

  /**
   * Returns all the decorations that intersect the passed-in row range.
   *
   * @param  {number} startScreenRow the first row of the range
   * @param  {number} endScreenRow the last row of the range
   * @return {Array<Decoration>} the decorations that intersect the passed-in
   *                             range
   */
  decorationsForScreenRowRange (startScreenRow, endScreenRow) {
    const decorationsByMarkerId = {}
    const markers = this.findMarkers({
      intersectsScreenRowRange: [startScreenRow, endScreenRow]
    })

    for (let i = 0, len = markers.length; i < len; i++) {
      const marker = markers[i]
      const id = marker.id
      let decorations = this.decorationsByMarkerId[id]

      if (decorations != null) {
        decorationsByMarkerId[id] = decorations
      }
    }

    return decorationsByMarkerId
  }

  /**
   * Returns the decorations that intersects the passed-in row range
   * in a structured way.
   *
   * At the first level, the keys are the available decoration types.
   * At the second level, the keys are the row index for which there
   * are decorations available. The value is an array containing the
   * decorations that intersects with the corresponding row.
   *
   * @return {Object} the decorations grouped by type and then rows
   * @property {Object} line all the line decorations by row
   * @property {Array<Decoration>} line[row] all the line decorations
   *                                    at a given row
   * @property {Object} highlight-under all the highlight-under decorations
   *                                    by row
   * @property {Array<Decoration>} highlight-under[row] all the highlight-under
   *                                    decorations at a given row
   * @property {Object} highlight-over all the highlight-over decorations
   *                                    by row
   * @property {Array<Decoration>} highlight-over[row] all the highlight-over
   *                                    decorations at a given row
   * @property {Object} highlight-outine all the highlight-outine decorations
   *                                    by row
   * @property {Array<Decoration>} highlight-outine[row] all the
   *                                    highlight-outine decorations at a given
   *                                    row
   */
  decorationsByTypeThenRows () {
    if (this.decorationsByTypeThenRowsCache != null) {
      return this.decorationsByTypeThenRowsCache
    }

    const cache = {}
    for (const id in this.decorationsById) {
      const decoration = this.decorationsById[id]
      const range = decoration.marker.getScreenRange()
      const type = decoration.getProperties().type

      if (cache[type] == null) { cache[type] = {} }

      for (let row = range.start.row, len = range.end.row; row <= len; row++) {
        if (cache[type][row] == null) { cache[type][row] = [] }

        cache[type][row].push(decoration)
      }
    }

    /**
     * The grouped decorations cache.
     * @type {Object}
     * @access private
     */
    this.decorationsByTypeThenRowsCache = cache
    return cache
  }

  /**
   * Invalidates the decoration by screen rows cache.
   */
  invalidateDecorationForScreenRowsCache () {
    this.decorationsByTypeThenRowsCache = null
  }

  /**
   * Adds a decoration that tracks a `Marker`. When the marker moves,
   * is invalidated, or is destroyed, the decoration will be updated to reflect
   * the marker's state.
   *
   * @param  {Marker} marker the marker you want this decoration to follow
   * @param  {Object} decorationParams the decoration properties
   * @param  {string} decorationParams.type the decoration type in the following
   *                                        list:
   * - __line__: Fills the line background with the decoration color.
   * - __highlight__: Renders a colored rectangle on the minimap. The highlight
   *   is rendered above the line's text.
   * - __highlight-over__: Same as __highlight__.
   * - __highlight-under__: Renders a colored rectangle on the minimap. The
   *   highlight is rendered below the line's text.
   * - __highlight-outline__: Renders a colored outline on the minimap. The
   *   highlight box is rendered above the line's text.
   * @param  {string} decorationParams.class the CSS class to use to retrieve
   *                                        the background color of the
   *                                        decoration by building a scop
   *                                        corresponding to
   *                                        `.minimap .editor <your-class>`
   * @param  {string} decorationParams.scope the scope to use to retrieve the
   *                                        decoration background. Note that if
   *                                        the `scope` property is set, the
   *                                        `class` won't be used.
   * @param  {string} decorationParams.color the CSS color to use to render the
   *                                        decoration. When set, neither
   *                                        `scope` nor `class` are used.
   * @return {Decoration} the created decoration
   * @emits  {did-add-decoration} when the decoration is created successfully
   * @emits  {did-change} when the decoration is created successfully
   */
  decorateMarker (marker, decorationParams) {
    if (this.destroyed || marker == null) { return }

    const { id } = marker

    if (decorationParams.type === 'highlight') {
      decorationParams.type = 'highlight-over'
    }

    if (decorationParams.scope == null && decorationParams['class'] != null) {
      const cls = decorationParams['class'].split(' ').join('.')
      decorationParams.scope = `.minimap .${cls}`
    }

    if (this.decorationMarkerDestroyedSubscriptions[id] == null) {
      this.decorationMarkerDestroyedSubscriptions[id] =
      marker.onDidDestroy(() => {
        this.removeAllDecorationsForMarker(marker)
      })
    }

    if (this.decorationMarkerChangedSubscriptions[id] == null) {
      this.decorationMarkerChangedSubscriptions[id] =
      marker.onDidChange((event) => {
        const decorations = this.decorationsByMarkerId[id]

        this.invalidateDecorationForScreenRowsCache()

        if (decorations != null) {
          for (let i = 0, len = decorations.length; i < len; i++) {
            const decoration = decorations[i]
            this.emitter.emit('did-change-decoration', {
              marker,
              decoration,
              event
            })
          }
        }
        let oldStart = event.oldTailScreenPosition
        let oldEnd = event.oldHeadScreenPosition
        let newStart = event.newTailScreenPosition
        let newEnd = event.newHeadScreenPosition

        if (oldStart.row > oldEnd.row) {
          [oldStart, oldEnd] = [oldEnd, oldStart]
        }
        if (newStart.row > newEnd.row) {
          [newStart, newEnd] = [newEnd, newStart]
        }

        const rangesDiffs = this.computeRangesDiffs(
          oldStart, oldEnd,
          newStart, newEnd
        )

        for (let i = 0, len = rangesDiffs.length; i < len; i++) {
          const [start, end] = rangesDiffs[i]
          this.emitRangeChanges({ start, end }, 0)
        }
      })
    }

    const decoration = new Decoration(marker, this, decorationParams)

    if (this.decorationsByMarkerId[id] == null) {
      this.decorationsByMarkerId[id] = []
    }

    this.decorationsByMarkerId[id].push(decoration)
    this.decorationsById[decoration.id] = decoration

    if (this.decorationUpdatedSubscriptions[decoration.id] == null) {
      this.decorationUpdatedSubscriptions[decoration.id] =
      decoration.onDidChangeProperties((event) => {
        this.emitDecorationChanges(decoration)
      })
    }

    this.decorationDestroyedSubscriptions[decoration.id] =
    decoration.onDidDestroy(() => {
      this.removeDecoration(decoration)
    })

    this.emitDecorationChanges(decoration)
    this.emitter.emit('did-add-decoration', { marker, decoration })

    return decoration
  }

  /**
   * Given two ranges, it returns an array of ranges representing the
   * differences between them.
   *
   * @param  {number} oldStart the row index of the first range start
   * @param  {number} oldEnd the row index of the first range end
   * @param  {number} newStart the row index of the second range start
   * @param  {number} newEnd the row index of the second range end
   * @return {Array<Object>} the array of diff ranges
   * @access private
   */
  computeRangesDiffs (oldStart, oldEnd, newStart, newEnd) {
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

  /**
   * Emits a change in the `Minimap` corresponding to the
   * passed-in decoration.
   *
   * @param  {Decoration} decoration the decoration for which emitting an event
   * @access private
   */
  emitDecorationChanges (decoration) {
    if (decoration.marker.displayBuffer.isDestroyed()) { return }

    this.invalidateDecorationForScreenRowsCache()

    const range = decoration.marker.getScreenRange()
    if (range == null) { return }

    this.emitRangeChanges(range, 0)
  }

  /**
   * Emits a change for the specified range.
   *
   * @param  {Object} range the range where changes occured
   * @param  {number} [screenDelta] an optional screen delta for the
   *                                change object
   * @access private
   */
  emitRangeChanges (range, screenDelta) {
    const startScreenRow = range.start.row
    const endScreenRow = range.end.row
    const lastRenderedScreenRow = this.getLastVisibleScreenRow()
    const firstRenderedScreenRow = this.getFirstVisibleScreenRow()

    if (screenDelta == null) {
      screenDelta = (lastRenderedScreenRow - firstRenderedScreenRow) -
                    (endScreenRow - startScreenRow)
    }

    const changeEvent = {
      start: startScreenRow,
      end: endScreenRow,
      screenDelta: screenDelta
    }

    this.emitChanges(changeEvent)
  }

  /**
   * Removes a `Decoration` from this minimap.
   *
   * @param  {Decoration} decoration the decoration to remove
   * @emits  {did-change} when the decoration is removed
   * @emits  {did-remove-decoration} when the decoration is removed
   */
  removeDecoration (decoration) {
    if (decoration == null) { return }

    const marker = decoration.marker
    let subscription

    delete this.decorationsById[decoration.id]

    subscription = this.decorationUpdatedSubscriptions[decoration.id]
    if (subscription != null) { subscription.dispose() }

    subscription = this.decorationDestroyedSubscriptions[decoration.id]
    if (subscription != null) { subscription.dispose() }

    delete this.decorationUpdatedSubscriptions[decoration.id]
    delete this.decorationDestroyedSubscriptions[decoration.id]

    const decorations = this.decorationsByMarkerId[marker.id]
    if (!decorations) { return }

    this.emitDecorationChanges(decoration)

    const index = decorations.indexOf(decoration)
    if (index > -1) {
      decorations.splice(index, 1)

      this.emitter.emit('did-remove-decoration', { marker, decoration })

      if (decorations.length === 0) {
        this.removedAllMarkerDecorations(marker)
      }
    }
  }

  /**
   * Removes all the decorations registered for the passed-in marker.
   *
   * @param  {Marker} marker the marker for which removing its decorations
   * @emits  {did-change} when a decoration have been removed
   * @emits  {did-remove-decoration} when a decoration have been removed
   */
  removeAllDecorationsForMarker (marker) {
    if (marker == null) { return }

    const decorations = this.decorationsByMarkerId[marker.id]
    if (!decorations) { return }

    for (let i = 0, len = decorations.length; i < len; i++) {
      const decoration = decorations[i]

      this.emitDecorationChanges(decoration)
      this.emitter.emit('did-remove-decoration', {
        marker: marker,
        decoration: decoration
      })
    }

    this.removedAllMarkerDecorations(marker)
  }

  /**
   * Performs the removal of a decoration for a given marker.
   *
   * @param  {Marker} marker the marker for which removing decorations
   * @access private
   */
  removedAllMarkerDecorations (marker) {
    if (marker == null) { return }

    this.decorationMarkerChangedSubscriptions[marker.id].dispose()
    this.decorationMarkerDestroyedSubscriptions[marker.id].dispose()

    delete this.decorationsByMarkerId[marker.id]
    delete this.decorationMarkerChangedSubscriptions[marker.id]
    delete this.decorationMarkerDestroyedSubscriptions[marker.id]
  }

  /**
   * Removes all the decorations that was created in the current `Minimap`.
   */
  removeAllDecorations () {
    for (const id in this.decorationMarkerChangedSubscriptions) {
      this.decorationMarkerChangedSubscriptions[id].dispose()
    }

    for (const id in this.decorationMarkerDestroyedSubscriptions) {
      this.decorationMarkerDestroyedSubscriptions[id].dispose()
    }

    for (const id in this.decorationUpdatedSubscriptions) {
      this.decorationUpdatedSubscriptions[id].dispose()
    }

    for (const id in this.decorationDestroyedSubscriptions) {
      this.decorationDestroyedSubscriptions[id].dispose()
    }

    for (const id in this.decorationsById) {
      this.decorationsById[id].destroy()
    }

    this.decorationsById = {}
    this.decorationsByMarkerId = {}
    this.decorationMarkerChangedSubscriptions = {}
    this.decorationMarkerDestroyedSubscriptions = {}
    this.decorationUpdatedSubscriptions = {}
    this.decorationDestroyedSubscriptions = {}
  }
}
