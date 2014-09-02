Mixin = require 'mixto'
Decoration = require atom.config.resourcePath + '/src/decoration'

module.exports =
class DecorationManagement extends Mixin
  initializeDecorations: ->
    @decorationsById = {}
    @decorationsByMarkerId = {}
    @decorationMarkerChangedSubscriptions = {}
    @decorationMarkerDestroyedSubscriptions = {}

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
          @emit 'decoration-changed', marker, decoration, event

    decoration = new Decoration(marker, this, decorationParams)
    @decorationsByMarkerId[marker.id] ?= []
    @decorationsByMarkerId[marker.id].push(decoration)
    @decorationsById[decoration.id] = decoration
    @emit 'decoration-added', marker, decoration
    decoration

  removeDecoration: (decoration) ->
    {marker} = decoration
    return unless decorations = @decorationsByMarkerId[marker.id]
    index = decorations.indexOf(decoration)

    if index > -1
      decorations.splice(index, 1)
      delete @decorationsById[decoration.id]
      @emit 'decoration-removed', marker, decoration
      @removedAllMarkerDecorations(marker) if decorations.length is 0

  removeAllDecorationsForMarker: (marker) ->
    decorations = @decorationsByMarkerId[marker.id].slice()
    for decoration in decorations
      @emit 'decoration-removed', marker, decoration
    @removedAllMarkerDecorations(marker)

  removedAllMarkerDecorations: (marker) ->
    @decorationMarkerChangedSubscriptions[marker.id].off()
    @decorationMarkerDestroyedSubscriptions[marker.id].off()

    delete @decorationsByMarkerId[marker.id]
    delete @decorationMarkerChangedSubscriptions[marker.id]
    delete @decorationMarkerDestroyedSubscriptions[marker.id]

  decorationUpdated: (decoration) ->
    @emit 'decoration-updated', decoration
