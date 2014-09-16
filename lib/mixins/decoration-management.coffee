Mixin = require 'mixto'
path = require 'path'
Decoration = require path.join(atom.config.resourcePath, 'src', 'decoration')

# Public: The mixin that provides the decorations API to the minimap editor
# view.
module.exports =
class DecorationManagement extends Mixin
  ### Public ###

  initializeDecorations: ->
    @decorationsById = {}
    @decorationsByMarkerId = {}
    @decorationMarkerChangedSubscriptions = {}
    @decorationMarkerDestroyedSubscriptions = {}
    @decorationUpdatedSubscriptions = {}
    @decorationDestroyedSubscriptions = {}

  decorationForId: (id) ->
    @decorationsById[id]

  decorationsForScreenRowRange: (startScreenRow, endScreenRow) ->
    decorationsByMarkerId = {}

    for marker in @findMarkers(intersectsScreenRowRange: [startScreenRow, endScreenRow])
      if decorations = @decorationsByMarkerId[marker.id]
        decorationsByMarkerId[marker.id] = decorations

    decorationsByMarkerId

  decorateMarker: (marker, decorationParams) ->
    marker = @getMarker(marker.id)

    if !decorationParams.scope? and decorationParams.class?
      cls = decorationParams.class.split(' ').join('.')
      decorationParams.scope = ".minimap .#{cls}"

    @decorationMarkerDestroyedSubscriptions[marker.id] ?= marker.onDidDestroy =>
      @removeAllDecorationsForMarker(marker)
      @stackRangeChanges(marker.getScreenRange())

    @decorationMarkerChangedSubscriptions[marker.id] ?= marker.onDidChange (event) =>
      decorations = @decorationsByMarkerId[marker.id]

      # Why check existence? Markers may get destroyed or decorations removed
      # in the change handler. Bookmarks does this.
      if decorations?
        for decoration in decorations
          @trigger 'minimap:decoration-changed', marker, decoration, event

      @stackRangeChanges(start: event.oldTailScreenPosition, end: event.oldHeadScreenPosition)

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

  stackDecorationChanges: (decoration) ->
    range = decoration.marker.getScreenRange()
    return unless range?

    @stackRangeChanges(range)

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

  removeAllDecorationsForMarker: (marker) ->
    decorations = @decorationsByMarkerId[marker.id].slice()
    for decoration in decorations
      @trigger 'minimap:decoration-removed', marker, decoration
    @removedAllMarkerDecorations(marker)

  removedAllMarkerDecorations: (marker) ->
    @decorationMarkerChangedSubscriptions[marker.id].dispose()
    @decorationMarkerDestroyedSubscriptions[marker.id].dispose()

    delete @decorationsByMarkerId[marker.id]
    delete @decorationMarkerChangedSubscriptions[marker.id]
    delete @decorationMarkerDestroyedSubscriptions[marker.id]

  decorationUpdated: (decoration) ->
    @trigger 'minimap:decoration-updated', decoration
