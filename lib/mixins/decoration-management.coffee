Mixin = require 'mixto'
path = require 'path'
{Emitter} = require 'event-kit'
Decoration = null

# Public: The mixin that provides the decorations API to the minimap editor
# view.
#
# This mixin is injected into the {Minimap} prototype, so every methods defined
# in this file will be available on any {Minimap} instance.
module.exports =
class DecorationManagement extends Mixin
  ### Public ###

  # Initializes the decorations related properties.
  initializeDecorations: ->
    @emitter ?= new Emitter
    @decorationsById = {}
    @decorationsByMarkerId = {}
    @decorationMarkerChangedSubscriptions = {}
    @decorationMarkerDestroyedSubscriptions = {}
    @decorationUpdatedSubscriptions = {}
    @decorationDestroyedSubscriptions = {}

    Decoration ?= require '../decoration'

  # Registers an event listener to the `did-add-decoration` event.
  #
  # callback - The {Function} to call when the event is triggered.
  #            The callback will be called with an object with the following
  #            properties:
  #            marker - The {Marker} object that was decorated.
  #            decoration - The {Decoration} object that was created.
  onDidAddDecoration: (callback) ->
    @emitter.on 'did-add-decoration', callback

  # Registers an event listener to the `did-remove-decoration` event.
  #
  # callback - The {Function} to call when the event is triggered.
  #            The callback will be called with an object with the following
  #            properties:
  #            marker - The {Marker} object targeted by the decoration that
  #                     was removed.
  #            decoration - The {Decoration} object that was removed.
  onDidRemoveDecoration: (callback) ->
    @emitter.on 'did-remove-decoration', callback

  # Registers an event listener to the `did-change-decoration` event.
  #
  # This event is triggered when the marker targeted by the decoration
  # was changed.
  #
  # callback - The {Function} to call when the event is triggered.
  #            The callback will be called with an object with the following
  #            properties:
  #            marker - The {Marker} object targeted by the decoration.
  #            decoration - The {Decoration} object.
  #            event - The original {Event} object dispatched by the {Marker}.
  onDidChangeDecoration: (callback) ->
    @emitter.on 'did-change-decoration', callback

  # Registers an event listener to the `did-update-decoration` event.
  #
  # This event is triggered when the decoration itself is modified.
  #
  # callback - The {Function} to call when the event is triggered.
  #            The callback will be called with the {Decoration} that was
  #            updated.
  onDidUpdateDecoration: (callback) ->
    @emitter.on 'did-update-decoration', callback

  # Returns the decoration with the passed-in id.
  #
  # id - The decoration id {Number}.
  #
  # Returns a `Decoration`.
  decorationForId: (id) ->
    @decorationsById[id]

  # Returns all the decorations that intersect the passed-in row range.
  #
  # startScreenRow - The index {Number} of the starting screen row.
  # endScreenRow - The index {Number} of the ending screen row.
  #
  # Returns an {Array} of decorations.
  decorationsForScreenRowRange: (startScreenRow, endScreenRow) ->
    decorationsByMarkerId = {}

    for marker in @findMarkers(intersectsScreenRowRange: [startScreenRow, endScreenRow])
      if decorations = @decorationsByMarkerId[marker.id]
        decorationsByMarkerId[marker.id] = decorations

    decorationsByMarkerId

  # Returns the decorations that intersects the passed-in row range
  # in a structured way.
  #
  # The returned object look like:
  #
  # ```coffee
  # {
  #   'line':
  #     '1': [...]
  #     '2': [...]
  #   'highlight-over':
  #     '10': [...]
  #     '11': [...]
  # }
  # ```
  #
  # At the first level, the keys are the available decoration types.
  # At the second level, the keys are the row index for which there
  # are decorations available. The value is an array containing the
  # decorations that intersects with the corresponding row.
  #
  # startScreenRow - The starting row index.
  # endScreenRow - The ending row index.
  #
  # Returns an {Object}.
  decorationsByTypeThenRows: (startScreenRow, endScreenRow) ->
    return @decorationsByTypeThenRowsCache if @decorationsByTypeThenRowsCache?

    cache = {}

    for id, decoration of @decorationsById
      range = decoration.marker.getScreenRange()
      rows = [range.start.row..range.end.row]

      {type} = decoration.getProperties()
      cache[type] ?= {}

      for row in rows
        cache[type][row] ?= []
        cache[type][row].push(decoration)

    @decorationsByTypeThenRowsCache = cache

  invalidateDecorationForScreenRowsCache: ->
    @decorationsByTypeThenRowsCache = null

  # Public: Adds a decoration that tracks a `Marker`. When the marker moves,
  # is invalidated, or is destroyed, the decoration will be updated to reflect
  # the marker's state.
  #
  # There are three types of supported decorations:
  #
  # * __line__: Fills the line background with the decoration color.
  # * __highlight__: Renders a colored rectangle on the minimap. The highlight
  #   is rendered above the line's text.
  # * __highlight-over__: Same as __highlight__.
  # * __highlight-under__: Renders a colored rectangle on the minimap. The
  #   highlight is rendered below the line's text.
  # * __highlight-outline__: Renders a colored outline on the minimap. The
  #   highlight box is rendered above the line's text.
  #
  # marker - A `Marker` you want this decoration to follow.
  # decorationParams - An {Object} representing the decoration eg.
  #                   `{type: 'gutter', class: 'linter-error'}`.
  #                   The object can have the following properties:
  #                   :type - The type {String}. There are a few supported
  #                           decoration types: `line`, `highlight`,
  #                           `highlight-over` and `highlight-under`
  #                   :class - This CSS class {String} will be used to retrieve
  #                            the background color of the decoration by
  #                            building a scope corresponding to `.minimap
  #                            .editor <your-class>`.
  #                   :scope - The scope {String} to use to retrieve the
  #                            decoration background. Note that if the `scope`
  #                            property is set, the `class` won't be used.
  #                   :color - The color {String} to use to render the
  #                            decoration. When set, neither `scope` nor `class`
  #                            are used.
  #
  # Returns a `Decoration` object.
  decorateMarker: (marker, decorationParams) ->
    return if @destroyed
    return unless marker?
    marker = @getMarker(marker.id)
    return unless marker?

    if decorationParams.type is 'highlight'
      decorationParams.type = 'highlight-over'

    if !decorationParams.scope? and decorationParams.class?
      cls = decorationParams.class.split(' ').join('.')
      decorationParams.scope = ".minimap .#{cls}"

    @decorationMarkerDestroyedSubscriptions[marker.id] ?= marker.onDidDestroy =>
      @removeAllDecorationsForMarker(marker)

    @decorationMarkerChangedSubscriptions[marker.id] ?= marker.onDidChange (event) =>
      decorations = @decorationsByMarkerId[marker.id]
      @invalidateDecorationForScreenRowsCache()

      # Why check existence? Markers may get destroyed or decorations removed
      # in the change handler. Bookmarks does this.
      if decorations?
        for decoration in decorations
          @emitter.emit 'did-change-decoration', {marker, decoration, event}

      oldStart = event.oldTailScreenPosition
      oldEnd = event.oldHeadScreenPosition

      newStart = event.newTailScreenPosition
      newEnd = event.newHeadScreenPosition

      [oldStart, oldEnd] = [oldEnd, oldStart] if oldStart.row > oldEnd.row
      [newStart, newEnd] = [newEnd, newStart] if newStart.row > newEnd.row

      rangesDiffs = @computeRangesDiffs(oldStart, oldEnd, newStart, newEnd)
      @emitRangeChanges({start, end}, 0) for [start, end] in rangesDiffs

    decoration = new Decoration(marker, this, decorationParams)
    @decorationsByMarkerId[marker.id] ?= []
    @decorationsByMarkerId[marker.id].push(decoration)
    @decorationsById[decoration.id] = decoration

    @decorationUpdatedSubscriptions[decoration.id] ?= decoration.onDidChangeProperties (event) =>
      @emitDecorationChanges(decoration)

    @decorationDestroyedSubscriptions[decoration.id] ?= decoration.onDidDestroy (event) =>
      @removeDecoration(decoration)

    @emitDecorationChanges(decoration)
    @emitter.emit 'did-add-decoration', {marker, decoration}
    decoration

  computeRangesDiffs: (oldStart, oldEnd, newStart, newEnd) ->
    diffs = []

    if oldStart.isLessThan(newStart)
      diffs.push([oldStart, newStart])
    else if newStart.isLessThan(oldStart)
      diffs.push([newStart, oldStart])

    if oldEnd.isLessThan(newEnd)
      diffs.push([oldEnd, newEnd])
    else if newEnd.isLessThan(oldEnd)
      diffs.push([newEnd, oldEnd])

    diffs

  # Internal: Emits a change in the {Minimap} corresponding to the
  # passed-in decoration.
  #
  # decoration - The `Decoration` to register changes for.
  emitDecorationChanges: (decoration) ->
    return if decoration.marker.displayBuffer.isDestroyed()
    @invalidateDecorationForScreenRowsCache()
    range = decoration.marker.getScreenRange()
    return unless range?

    @emitRangeChanges(range, 0)

  # Internal: Emits a change for the specified range.
  #
  # range - The `Range` to emits changes for.
  emitRangeChanges: (range, screenDelta) ->
    startScreenRow = range.start.row
    endScreenRow = range.end.row
    lastRenderedScreenRow  = @getLastVisibleScreenRow()
    firstRenderedScreenRow = @getFirstVisibleScreenRow()
    screenDelta ?= (lastRenderedScreenRow - firstRenderedScreenRow) - (endScreenRow - startScreenRow)

    changeEvent =
      start: startScreenRow
      end: endScreenRow
      screenDelta: screenDelta

    @emitChanges changeEvent

  # Removes a `Decoration` from this minimap.
  #
  # decoration - The `Decoration` to remove.
  removeDecoration: (decoration) ->
    return unless decoration?
    {marker} = decoration
    delete @decorationsById[decoration.id]

    @decorationUpdatedSubscriptions[decoration.id]?.dispose()
    @decorationDestroyedSubscriptions[decoration.id]?.dispose()

    delete @decorationUpdatedSubscriptions[decoration.id]
    delete @decorationDestroyedSubscriptions[decoration.id]

    return unless decorations = @decorationsByMarkerId[marker.id]

    @emitDecorationChanges(decoration)
    index = decorations.indexOf(decoration)

    if index > -1
      decorations.splice(index, 1)
      @emitter.emit 'did-remove-decoration', {marker, decoration}
      @removedAllMarkerDecorations(marker) if decorations.length is 0

  # Removes all the decorations registered for the passed-in marker.
  #
  # marker - The {Marker} for which removing decorations.
  removeAllDecorationsForMarker: (marker) ->
    return unless marker?
    decorations = @decorationsByMarkerId[marker.id]?.slice()
    return unless decorations
    for decoration in decorations
      @emitter.emit 'did-remove-decoration', {marker, decoration}
      @emitDecorationChanges(decoration)

    @removedAllMarkerDecorations(marker)

  # Internal: Performs the removal of a decoration for a given marker.
  #
  # marker - The {Marker} for which removing decorations.
  removedAllMarkerDecorations: (marker) ->
    return unless marker?
    @decorationMarkerChangedSubscriptions[marker.id].dispose()
    @decorationMarkerDestroyedSubscriptions[marker.id].dispose()

    delete @decorationsByMarkerId[marker.id]
    delete @decorationMarkerChangedSubscriptions[marker.id]
    delete @decorationMarkerDestroyedSubscriptions[marker.id]

  # Removes all the decorations that was created in the current {Minimap}.
  removeAllDecorations: ->
    sub.dispose() for id,sub of @decorationMarkerChangedSubscriptions
    sub.dispose() for id,sub of @decorationMarkerDestroyedSubscriptions
    sub.dispose() for id,sub of @decorationUpdatedSubscriptions
    sub.dispose() for id,sub of @decorationDestroyedSubscriptions
    decoration.destroy() for id,decoration of @decorationsById

    @decorationsById = {}
    @decorationsByMarkerId = {}
    @decorationMarkerChangedSubscriptions = {}
    @decorationMarkerDestroyedSubscriptions = {}
    @decorationUpdatedSubscriptions = {}
    @decorationDestroyedSubscriptions = {}

  # Internal: Introduced in the DisplayBuffer in v0.206.0 to handle change
  # in overlay decorations. It does nothing here because we don't use the
  # overlay type.
  decorationDidChangeType: (decoration) ->

  # Internal: Receive the update event of a decoration and trigger
  # a `minimap:decoration-updated` event.
  #
  # decoration - The updated `Decoration`.
  decorationUpdated: (decoration) ->
    @emitter.emit 'did-update-decoration', decoration
