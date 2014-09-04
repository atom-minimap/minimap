Mixin = require 'mixto'
Decoration = require atom.config.resourcePath + '/src/decoration'

module.exports =
class DecorationManagement extends Mixin
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

    @decorationMarkerDestroyedSubscriptions[marker.id] ?= @subscribe marker, 'destroyed', =>
      @removeAllDecorationsForMarker(marker)

    @decorationMarkerChangedSubscriptions[marker.id] ?= @subscribe marker, 'changed', (event) =>
      decorations = @decorationsByMarkerId[marker.id]

      # Why check existence? Markers may get destroyed or decorations removed
      # in the change handler. Bookmarks does this.
      if decorations?
        for decoration in decorations
          @trigger 'minimap:decoration-changed', marker, decoration, event

    decoration = new Decoration(marker, this, decorationParams)
    @decorationsByMarkerId[marker.id] ?= []
    @decorationsByMarkerId[marker.id].push(decoration)
    @decorationsById[decoration.id] = decoration

    @decorationUpdatedSubscriptions[decoration.id] ?= @subscribe decoration, 'updated', (event) =>
      @stackDecorationChanges(decoration)

    @decorationDestroyedSubscriptions[decoration.id] ?= @subscribe decoration, 'destroyed', (event) =>
      @removeDecoration(decoration)

    @stackDecorationChanges(decoration)
    @trigger 'minimap:decoration-added', marker, decoration
    decoration

  stackDecorationChanges: (decoration) ->
    return unless decoration.marker.range?

    startScreenRow = decoration.marker.range.start.row
    endScreenRow = decoration.marker.range.end.row
    screenDelta = (@lastRenderedScreenRow - @firstRenderedScreenRow) - (endScreenRow - startScreenRow)

    changeEvent =
      start: startScreenRow
      end: endScreenRow
      screenDelta: screenDelta

    @stackChanges changeEvent

  removeDecoration: (decoration) ->
    {marker} = decoration
    return unless decorations = @decorationsByMarkerId[marker.id]

    @stackDecorationChanges(decoration)

    @decorationUpdatedSubscriptions[decoration.id].off()
    @decorationDestroyedSubscriptions[decoration.id].off()

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
    @decorationMarkerChangedSubscriptions[marker.id].off()
    @decorationMarkerDestroyedSubscriptions[marker.id].off()

    delete @decorationsByMarkerId[marker.id]
    delete @decorationMarkerChangedSubscriptions[marker.id]
    delete @decorationMarkerDestroyedSubscriptions[marker.id]

  decorationUpdated: (decoration) ->
    @trigger 'minimap:decoration-updated', decoration
