_ = require 'underscore-plus'
{Emitter} = require 'event-kit'

idCounter = 0
nextId = -> idCounter++

module.exports =
class Decoration

  # Private: Check if the `decorationProperties.type` matches `type`
  #
  # * `decorationProperties` {Object} eg. `{type: 'line-number', class: 'my-new-class'}`
  # * `type` {String} type like `'line-number'`, `'line'`, etc. `type` can also
  #   be an {Array} of {String}s, where it will return true if the decoration's
  #   type matches any in the array.
  #
  # Returns {Boolean}
  # Note: 'line-number' is a special subtype of the 'gutter' type. I.e., a
  # 'line-number' is a 'gutter', but a 'gutter' is not a 'line-number'.
  @isType: (decorationProperties, type) ->
    # 'line-number' is a special case of 'gutter'.
    if _.isArray(decorationProperties.type)
      return true if type in decorationProperties.type
      return false
    else
      type is decorationProperties.type

  ###
  Section: Construction and Destruction
  ###

  constructor: (@marker, @minimap, properties) ->
    @emitter = new Emitter
    @id = nextId()
    @setProperties properties
    @properties.id = @id
    @destroyed = false
    @markerDestroyDisposable = @marker.onDidDestroy => @destroy()

  # Essential: Destroy this marker.
  #
  # If you own the marker, you should use {Marker::destroy} which will destroy
  # this decoration.
  destroy: ->
    return if @destroyed
    @markerDestroyDisposable.dispose()
    @markerDestroyDisposable = null
    @destroyed = true
    @emitter.emit 'did-destroy'
    @emitter.dispose()

  isDestroyed: -> @destroyed

  ###
  Section: Event Subscription
  ###

  # Essential: When the {Decoration} is updated via {Decoration::update}.
  #
  # * `callback` {Function}
  #   * `event` {Object}
  #     * `oldProperties` {Object} the old parameters the decoration used to have
  #     * `newProperties` {Object} the new parameters the decoration now has
  #
  # Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  onDidChangeProperties: (callback) ->
    @emitter.on 'did-change-properties', callback

  # Essential: Invoke the given callback when the {Decoration} is destroyed
  #
  # * `callback` {Function}
  #
  # Returns a {Disposable} on which `.dispose()` can be called to unsubscribe.
  onDidDestroy: (callback) ->
    @emitter.on 'did-destroy', callback

  ###
  Section: Decoration Details
  ###

  # Essential: An id unique across all {Decoration} objects
  getId: -> @id

  # Essential: Returns the marker associated with this {Decoration}
  getMarker: -> @marker

  # Public: Check if this decoration is of type `type`
  #
  # * `type` {String} type like `'line-number'`, `'line'`, etc. `type` can also
  #   be an {Array} of {String}s, where it will return true if the decoration's
  #   type matches any in the array.
  #
  # Returns {Boolean}
  isType: (type) ->
    Decoration.isType(@properties, type)

  ###
  Section: Properties
  ###

  # Essential: Returns the {Decoration}'s properties.
  getProperties: ->
    @properties

  # Essential: Update the marker with new Properties. Allows you to change the decoration's class.
  #
  # ## Examples
  #
  # ```coffee
  # decoration.update({type: 'line-number', class: 'my-new-class'})
  # ```
  #
  # * `newProperties` {Object} eg. `{type: 'line-number', class: 'my-new-class'}`
  setProperties: (newProperties) ->
    return if @destroyed
    oldProperties = @properties
    @properties = newProperties
    @properties.id = @id
    @minimap.decorationDidChangeType(this) if newProperties.type?

    @emitter.emit 'did-change-properties', {oldProperties, newProperties}

  ###
  Section: Private methods
  ###

  matchesPattern: (decorationPattern) ->
    return false unless decorationPattern?
    for key, value of decorationPattern
      return false if @properties[key] isnt value
    true
