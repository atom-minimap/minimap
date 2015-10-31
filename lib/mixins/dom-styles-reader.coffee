Mixin = require 'mixto'

# Public: This mixin is used by the {CanvasDrawer} in {MinimapElement} to
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

    style = getComputedStyle(parent)
    filter = style.getPropertyValue('-webkit-filter')
    value = style.getPropertyValue(property)
    value = @rotateHue(value, filter) if filter.indexOf('hue-rotate') isnt -1

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

  # Computes the output color of `value` with a rotated hue defined in `filter`.
  #
  # value - the CSS {String} value.
  # filter - the CSS {String} filter.
  #
  # Returns a CSS {String}.
  rotateHue: (value, filter) ->
    [_,_,r,g,b,_,a] = value.match(/rgb(a?)\((\d+), (\d+), (\d+)(, (\d+(\.\d+)?))?\)/)
    [_,hue] = filter.match(/hue-rotate\((\d+)deg\)/)

    [r,g,b,a,hue] = [r,g,b,a,hue].map(Number)

    [r,g,b] = rotate(r,g,b,hue)

    if isNaN(a)
      "rgb(#{r}, #{g}, #{b})"
    else
      "rgba(#{r}, #{g}, #{b}, #{a})"

#    ##     ## ######## ##       ########  ######## ########   ######
#    ##     ## ##       ##       ##     ## ##       ##     ## ##    ##
#    ##     ## ##       ##       ##     ## ##       ##     ## ##
#    ######### ######   ##       ########  ######   ########   ######
#    ##     ## ##       ##       ##        ##       ##   ##         ##
#    ##     ## ##       ##       ##        ##       ##    ##  ##    ##
#    ##     ## ######## ######## ##        ######## ##     ##  ######

# Internal: Computes the hue rotation on the provided `r`, `g` and `b` channels
# by the amount of `angle`.
#
# r - the red channel {Number} value.
# g - the green channel {Number} value.
# b - the blue channel {Number} value.
# angle - the angle {Number} of hue rotation.
#
# Returns an {Array}.
rotate = (r,g,b,angle) ->
  clamp = (num) -> Math.ceil(Math.max(0, Math.min(255, num)))
  matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1]

  # Luminance coefficients.
  lumR = 0.2126
  lumG = 0.7152
  lumB = 0.0722

  # Hue rotate coefficients.
  hueRotateR = 0.143
  hueRotateG = 0.140
  hueRotateB = 0.283

  cos = Math.cos(angle * Math.PI / 180)
  sin = Math.sin(angle * Math.PI / 180)
  matrix[0] = lumR + (1 - lumR) * cos - (lumR * sin)
  matrix[1] = lumG - (lumG * cos) - (lumG * sin)
  matrix[2] = lumB - (lumB * cos) + (1 - lumB) * sin
  matrix[3] = lumR - (lumR * cos) + hueRotateR * sin
  matrix[4] = lumG + (1 - lumG) * cos + hueRotateG * sin
  matrix[5] = lumB - (lumB * cos) - (hueRotateB * sin)
  matrix[6] = lumR - (lumR * cos) - ((1 - lumR) * sin)
  matrix[7] = lumG - (lumG * cos) + lumG * sin
  matrix[8] = lumB + (1 - lumB) * cos + lumB * sin

  R = clamp(matrix[0] * r + matrix[1] * g + matrix[2] * b)
  G = clamp(matrix[3] * r + matrix[4] * g + matrix[5] * b)
  B = clamp(matrix[6] * r + matrix[7] * g + matrix[8] * b)

  [R,G,B]
