Mixin = require 'mixto'
path = require 'path'
Decoration = require path.join(atom.config.resourcePath, 'src', 'decoration')

# Public: The mixin that provides the decorations API to the minimap editor
# view.
module.exports =
class DecorationManagement extends Mixin
  ### Public ###

  # Initializes the decorations related properties.
  initializeDecorations: ->
    @decorationsById = {}
    @decorationsByMarkerId = {}
    @decorationMarkerChangedSubscriptions = {}
    @decorationMarkerDestroyedSubscriptions = {}
    @decorationUpdatedSubscriptions = {}
    @decorationDestroyedSubscriptions = {}

  # Returns the decoration with the passed-in id.
  #
  # id - The decoration id {Number}.
  #
  # Returns a `Decoration`.
  decorationForId: (id) ->
    @decorationsById[id]

  # Returns all the decorations of the given type that intersect the passed-in
  # row.
  #
  # row - The row {Number}.
  # types - A list of decoration types {String}.
  # decorations - An {Array} of decorations.
  #
  # Returns an {Array} of decorations.
  decorationsByTypesForRow: (row, types..., decorations) ->
    out = []
    for id, array of decorations
      for decoration in array
        if decoration.getProperties().type in types and
           decoration.getMarker().getScreenRange().intersectsRow(row)
          out.push decoration

    out

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
    marker = @getMarker(marker.id)

    if !decorationParams.scope? and decorationParams.class?
      cls = decorationParams.class.split(' ').join('.')
      decorationParams.scope = ".minimap .#{cls}"

    @decorationMarkerDestroyedSubscriptions[marker.id] ?= marker.onDidDestroy =>
      @removeAllDecorationsForMarker(marker)

    @decorationMarkerChangedSubscriptions[marker.id] ?= marker.onDidChange (event) =>
      decorations = @decorationsByMarkerId[marker.id]

      # Why check existence? Markers may get destroyed or decorations removed
      # in the change handler. Bookmarks does this.
      if decorations?
        for decoration in decorations
          @trigger 'minimap:decoration-changed', marker, decoration, event

      start = event.oldTailScreenPosition
      end = event.oldHeadScreenPosition

      [start, end] = [end, start] if start.row > end.row

      @stackRangeChanges({start, end})

    decoration = new Decoration(marker, this, decorationParams)
    @decorationsByMarkerId[marker.id] ?= []
    @decorationsByMarkerId[marker.id].push(decoration)
    @decorationsById[decoration.id] = decoration

    @decorationUpdatedSubscriptions[decoration.id] ?= decoration.onDidChangeProperties (event) =>
      @stackDecorationChanges(decoration)

    @decorationDestroyedSubscriptions[decoration.id] ?= decoration.onDidDestroy (event) =>
      @removeDecoration(decoration)

    @stackDecorationChanges(decoration)
    @trigger 'minimap:decoration-added', marker, decoration
    decoration

  # Internal: Registers a change in the {MinimapRenderView} pending changes
  # corresponding to the passed-in decoration.
  #
  # decoration - The `Decoration` to register changes for.
  stackDecorationChanges: (decoration) ->
    range = decoration.marker.getScreenRange()
    return unless range?

    @stackRangeChanges(range)

  # Internal: Registers a change for the specified range.
  #
  # range - The `Range` ro register changes for.
  stackRangeChanges: (range) ->
    startScreenRow = range.start.row
    endScreenRow = range.end.row
    lastRenderedScreenRow  = @getLastVisibleScreenRow()
    firstRenderedScreenRow = @getFirstVisibleScreenRow()
    screenDelta = (lastRenderedScreenRow - firstRenderedScreenRow) - (endScreenRow - startScreenRow)

    changeEvent =
      start: startScreenRow
      end: endScreenRow
      screenDelta: screenDelta

    @stackChanges changeEvent

  # Removes a `Decoration` from this minimap.
  #
  # decoration - The `Decoration` to remove.
  removeDecoration: (decoration) ->
    {marker} = decoration
    return unless decorations = @decorationsByMarkerId[marker.id]

    @stackDecorationChanges(decoration)

    @decorationUpdatedSubscriptions[decoration.id].dispose()
    @decorationDestroyedSubscriptions[decoration.id].dispose()

    delete @decorationUpdatedSubscriptions[decoration.id]
    delete @decorationDestroyedSubscriptions[decoration.id]

    index = decorations.indexOf(decoration)

    if index > -1
      decorations.splice(index, 1)
      delete @decorationsById[decoration.id]
      @trigger 'minimap:decoration-removed', marker, decoration
      @removedAllMarkerDecorations(marker) if decorations.length is 0

  # Removes all the decorations registered for the passed-in marker.
  #
  # marker - The `marker` for which removing decorations.
  removeAllDecorationsForMarker: (marker) ->
    decorations = @decorationsByMarkerId[marker.id].slice()
    for decoration in decorations
      @trigger 'minimap:decoration-removed', marker, decoration
      @stackDecorationChanges(decoration)

    @removedAllMarkerDecorations(marker)

  # Internal: Performs the removal of a decoration for a given marker.
  #
  # marker - The `marker` for which removing decorations.
  removedAllMarkerDecorations: (marker) ->
    @decorationMarkerChangedSubscriptions[marker.id].dispose()
    @decorationMarkerDestroyedSubscriptions[marker.id].dispose()

    delete @decorationsByMarkerId[marker.id]
    delete @decorationMarkerChangedSubscriptions[marker.id]
    delete @decorationMarkerDestroyedSubscriptions[marker.id]

  # Internal: Receive the update event of a decoration and trigger
  # a `minimap:decoration-updated` event.
  #
  # decoration - The updated `Decoration`.
  decorationUpdated: (decoration) ->
    @trigger 'minimap:decoration-updated', decoration
