Mixin = require 'mixto'

# Public: This mixin is used by the {CanvasRenderer} in {MinimapElement} to
# read the styles informations from the DOM to use when rendering the {Minimap}.
module.exports =
class DOMStylesReader extends Mixin
  ### Public ###

  # This function insert a dummy element in the DOM to compute
  # its style, return the specified property, and remove the element
  # from the DOM.
  #
  # scopes - An {Array} of {String} reprensenting the scope to reproduce.
  # property - The property {String} name.
  # shadowRoot - A {Boolean} of whether to evaluate the styles in the editor
  #              shadow DOM or not.
  # cache - A {Boolean} of whether to use the cache or not.
  #
  # Returns a {String} of the property value.
  retrieveStyleFromDom: (scopes, property, shadowRoot=true, cache=true) ->
    @ensureCache()

    key = scopes.join(' ')

    if cache and @constructor.domStylesCache[key]?[property]?
      return @constructor.domStylesCache[key][property]

    @ensureDummyNodeExistence(shadowRoot)
    @constructor.domStylesCache[key] ?= {}

    parent = @dummyNode
    for scope in scopes
      node = document.createElement('span')
      # css class is the scope without the dots,
      # see pushScope @ atom/atom/src/lines-component.coffee
      node.className = scope.replace(/\.+/g, ' ')
      parent.appendChild(node) if parent?
      parent = node

    value = getComputedStyle(parent).getPropertyValue(property)
    @dummyNode.innerHTML = ''

    @constructor.domStylesCache[key][property] = value unless value is ""
    value

  ### Internal ###

  # Creates a DOM node container for all the operations that
  # need to read styles properties from DOM.
  ensureDummyNodeExistence: (shadowRoot) ->
    unless @dummyNode?
      @dummyNode = document.createElement('span')
      @dummyNode.style.visibility = 'hidden'

    @getDummyDOMRoot(shadowRoot).appendChild(@dummyNode)

  # Ensures the presence of the cache {Object} in the class that received
  # this mixin.
  ensureCache: ->
    @constructor.domStylesCache ?= {}

  # Invalidates the cache by emptying the cache {Object}.
  invalidateCache: ->
    @constructor.domStylesCache = {}

  # Invalidates the cache only for the first tokenization event.
  invalidateIfFirstTokenization: ->
    return if @constructor.hasTokenizedOnce

    @invalidateCache()
    @constructor.hasTokenizedOnce = true
