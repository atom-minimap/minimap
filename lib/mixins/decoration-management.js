'use strict'

let _, path, Emitter, Decoration

/**
 * The mixin that provides the decorations API to the minimap editor
 * view.
 *
 * This mixin is injected into the `Minimap` prototype, so every methods defined
 * in this file will be available on any `Minimap` instance.
 */
module.exports = class DecorationManagement {

  /**
   * Initializes the decorations related properties.
   */
  initializeDecorations () {
    if (this.emitter == null) {
      if (!Emitter) { Emitter = require('atom').Emitter }

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
    let decorations = this.decorationsById
    let results = []

    for (let id in decorations) { results.push(decorations[id]) }

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
   * Registers an event listener to the `did-change-decoration-range` event.
   *
   * This event is triggered when the marker range targeted by the decoration
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
  onDidChangeDecorationRange (callback) {
    return this.emitter.on('did-change-decoration-range', callback)
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
    let decorationsByMarkerId = {}
    let markers = this.findMarkers({
      intersectsScreenRowRange: [startScreenRow, endScreenRow]
    })

    for (let i = 0, len = markers.length; i < len; i++) {
      let marker = markers[i]
      let decorations = this.decorationsByMarkerId[marker.id]

      if (decorations != null) {
        decorationsByMarkerId[marker.id] = decorations
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

    let cache = {}
    for (let id in this.decorationsById) {
      let decoration = this.decorationsById[id]
      let range = decoration.marker.getScreenRange()
      let type = decoration.getProperties().type

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
   * - __foreground-custom__: A decoration type for which you have the control
   *   over the render routine. Note that your routine should implement a render
   *   on a per-line basis to avoid any side-effect with the offset bitmap cache
   *   mechanism. These decorations are rendred on the foreground decorations
   *   layer.
   * - __background-custom__: A decoration type for which you have the control
   *   over the render routine. Note that your routine should implement a render
   *   on a per-line basis to avoid any side-effect with the offset bitmap cache
   *   mechanism. These decorations are rendred on the background decorations
   *   layer.
   * @param  {string} [decorationParams.class] the CSS class to use to retrieve
   *                                        the background color of the
   *                                        decoration by building a scop
   *                                        corresponding to
   *                                        `.minimap .editor <your-class>`
   * @param  {string} [decorationParams.scope] the scope to use to retrieve the
   *                                        decoration background. Note that if
   *                                        the `scope` property is set, the
   *                                        `class` won't be used.
   * @param  {string} [decorationParams.color] the CSS color to use to render
   *                                           the decoration. When set, neither
   *                                           `scope` nor `class` are used.
   * @param  {string} [decorationParams.plugin] the name of the plugin that
   *                                            created this decoration. It'll
   *                                            be used to order the decorations
   *                                            on the same layer and that are
   *                                            overlapping. If the parameter is
   *                                            omitted the Minimap will attempt
   *                                            to infer the plugin origin from
   *                                            the path of the caller function.
   * @param  {function} [decorationParams.render] the render routine for custom
   *                                              decorations. The function
   *                                              receives the decoration and
   *                                              the render data for the
   *                                              current render pass.
   * @return {Decoration} the created decoration
   * @emits  {did-add-decoration} when the decoration is created successfully
   * @emits  {did-change} when the decoration is created successfully
   */
  decorateMarker (marker, decorationParams) {
    if (this.destroyed || marker == null) { return }

    if (!Decoration) { Decoration = require('../decoration') }

    let {id} = marker

    if (decorationParams.type === 'highlight') {
      decorationParams.type = 'highlight-over'
    }

    const {type, plugin} = decorationParams

    if (plugin == null) {
      decorationParams.plugin = this.getOriginatorPackageName()
    }

    if (decorationParams.scope == null && decorationParams['class'] != null) {
      let cls = decorationParams['class'].split(' ').join('.')
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
        const screenRange = marker.getScreenRange()

        this.invalidateDecorationForScreenRowsCache()

        if (decorations != null) {
          for (let i = 0, len = decorations.length; i < len; i++) {
            let decoration = decorations[i]
            this.emitter.emit('did-change-decoration', {
              marker: marker,
              decoration: decoration,
              event: event
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
          [oldStart, oldEnd] = [oldEnd, oldStart]
        }
        if (newStart.row > newEnd.row) {
          [newStart, newEnd] = [newEnd, newStart]
        }

        let rangesDiffs = this.computeRangesDiffs(
          oldStart, oldEnd,
          newStart, newEnd
        )

        for (let i = 0, len = rangesDiffs.length; i < len; i++) {
          let [start, end] = rangesDiffs[i]
          this.emitRangeChanges(type, {
            start: start,
            end: end
          }, 0)
        }
      })
    }

    let decoration = new Decoration(marker, this, decorationParams)

    if (this.decorationsByMarkerId[id] == null) {
      this.decorationsByMarkerId[id] = []
    }

    this.decorationsByMarkerId[id].push(decoration)
    this.decorationsById[decoration.id] = decoration

    if (this.decorationUpdatedSubscriptions[decoration.id] == null) {
      this.decorationUpdatedSubscriptions[decoration.id] =
      decoration.onDidChangeProperties((event) => {
        this.emitDecorationChanges(type, decoration)
      })
    }

    this.decorationDestroyedSubscriptions[decoration.id] =
    decoration.onDidDestroy(() => {
      this.removeDecoration(decoration)
    })

    this.emitDecorationChanges(type, decoration)
    this.emitter.emit('did-add-decoration', {
      marker: marker,
      decoration: decoration
    })

    return decoration
  }

  getOriginatorPackageName () {
    if (!_) { _ = require('underscore-plus') }
    if (!path) { path = require('path') }

    const line = new Error().stack.split('\n')[3]
    const filePath = line.split('(')[1].replace(')', '')
    const re = new RegExp(
      atom.packages.getPackageDirPaths().join('|') + _.escapeRegExp(path.sep)
    )
    const plugin = filePath.replace(re, '').split(path.sep)[0].replace(/minimap-|-minimap/, '')
    return plugin.indexOf(path.sep) < 0 ? plugin : undefined
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
    let diffs = []

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
   * @param  {string} type the type of decoration that changed
   * @param  {Decoration} decoration the decoration for which emitting an event
   * @access private
   */
  emitDecorationChanges (type, decoration) {
    if (this.editorDestroyed()) { return }

    this.invalidateDecorationForScreenRowsCache()

    const range = decoration.screenRange
    if (!range.start || !range.end) { return }

    this.emitRangeChanges(type, range, 0)
  }

  /**
   * Emits a change for the specified range.
   *
   * @param  {string} type the type of decoration that changed
   * @param  {Object} range the range where changes occured
   * @param  {number} [screenDelta] an optional screen delta for the
   *                                change object
   * @access private
   */
  emitRangeChanges (type, range, screenDelta) {
    let startScreenRow = range.start.row
    let endScreenRow = range.end.row
    let lastRenderedScreenRow = this.getLastVisibleScreenRow()
    let firstRenderedScreenRow = this.getFirstVisibleScreenRow()

    if (screenDelta == null) {
      screenDelta = (lastRenderedScreenRow - firstRenderedScreenRow) -
                    (endScreenRow - startScreenRow)
    }

    let changeEvent = {
      start: startScreenRow,
      end: endScreenRow,
      screenDelta: screenDelta,
      type: type
    }

    this.emitter.emit('did-change-decoration-range', changeEvent)
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

    let marker = decoration.marker
    let subscription

    delete this.decorationsById[decoration.id]

    subscription = this.decorationUpdatedSubscriptions[decoration.id]
    if (subscription != null) { subscription.dispose() }

    subscription = this.decorationDestroyedSubscriptions[decoration.id]
    if (subscription != null) { subscription.dispose() }

    delete this.decorationUpdatedSubscriptions[decoration.id]
    delete this.decorationDestroyedSubscriptions[decoration.id]

    let decorations = this.decorationsByMarkerId[marker.id]
    if (!decorations) { return }

    this.emitDecorationChanges(decoration.getProperties().type, decoration)

    let index = decorations.indexOf(decoration)
    if (index > -1) {
      decorations.splice(index, 1)

      this.emitter.emit('did-remove-decoration', {
        marker: marker,
        decoration: decoration
      })

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

    let decorations = this.decorationsByMarkerId[marker.id]
    if (!decorations) { return }

    for (let i = 0, len = decorations.length; i < len; i++) {
      let decoration = decorations[i]

      if (!this.adapter.editorDestroyed()) {
        this.emitDecorationChanges(decoration.getProperties().type, decoration)
      }
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
    for (let id in this.decorationMarkerChangedSubscriptions) {
      this.decorationMarkerChangedSubscriptions[id].dispose()
    }

    for (let id in this.decorationMarkerDestroyedSubscriptions) {
      this.decorationMarkerDestroyedSubscriptions[id].dispose()
    }

    for (let id in this.decorationUpdatedSubscriptions) {
      this.decorationUpdatedSubscriptions[id].dispose()
    }

    for (let id in this.decorationDestroyedSubscriptions) {
      this.decorationDestroyedSubscriptions[id].dispose()
    }

    for (let id in this.decorationsById) {
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
