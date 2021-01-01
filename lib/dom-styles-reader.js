'use strict'

/**
 * This class is used by the `CanvasDrawer` in `MinimapElement` to
 * read the styles informations from the DOM to use when rendering
 * the `Minimap`.
 */
export default class DOMStylesReader {
  constructor () {
    /**
     * The cache object
     * @access private
     */
    this.domStylesCache = new Map()

    /**
     * Set to true once tokenized
     * @access private
     * unused
     */
    // this.hasTokenizedOnce = false
  }

  /**
   * Returns the computed values for the given property and scope in the DOM.
   *
   * This function insert a dummy element in the DOM to compute
   * its style, return the specified property, and clear the content of the
   * dummy element.
   *
   * @param  {Array<string>} scopes a list of classes reprensenting the scope
   *                                to build
   * @param  {string} property the name of the style property to compute
   * @param  {Node} targetNode
   * @param  {boolean} [cache=true] whether to cache the computed value or not
   * @return {string} the computed property's value
   * used in CanvasDrawer
   */
  retrieveStyleFromDom (scopes, property, targetNode, cache = true) {
    const key = scopes.join(' ')
    let cachedData = this.domStylesCache.get(key)

    if (cache && cachedData !== undefined) {
      const value = cachedData[property]
      if (value != null) {
        return value
      }
    }

    this.ensureDummyNodeExistence(targetNode)

    if (cachedData === undefined) {
      cachedData = {}
      this.domStylesCache.set(key, cachedData)
    }

    let parent = this.dummyNode
    for (let i = 0, len = scopes.length; i < len; i++) {
      const scope = scopes[i]
      const node = document.createElement('span')
      node.className = scope.replace(/\.+/g, ' ')

      if (parent != null) { parent.appendChild(node) }

      parent = node
    }

    const style = window.getComputedStyle(parent)
    const filter = style.getPropertyValue('-webkit-filter')
    let value = style.getPropertyValue(property)

    if (filter.indexOf('hue-rotate') > -1) {
      value = rotateHue(value, filter)
    }

    if (value !== '') {
      cachedData[property] = value
      this.domStylesCache.set(key, cachedData)
    }

    this.dummyNode.innerHTML = ''
    return value
  }

  /**
   * Creates a DOM node container for all the operations that need to read
   * styles properties from DOM.
   * @param {Node} targetNode
   *
   * @access private
   */
  ensureDummyNodeExistence (targetNode) {
    if (this.dummyNode == null) {
      /**
       * @access private
       */
      this.dummyNode = document.createElement('span')
      this.dummyNode.style.visibility = 'hidden'
    }

    targetNode.appendChild(this.dummyNode)
  }

  /**
   * Invalidates the cache by emptying the cache object.
   * used in MinimapElement
   */
  invalidateDOMStylesCache () {
    this.domStylesCache.clear()
  }

  /**
   * Invalidates the cache only for the first tokenization event.
   *
   * @access private
   * unused
   */
  /*
  invalidateIfFirstTokenization () {
    if (this.hasTokenizedOnce) { return }
    this.invalidateDOMStylesCache()
    this.hasTokenizedOnce = true
  }
  */
}

//    ##     ## ######## ##       ########  ######## ########   ######
//    ##     ## ##       ##       ##     ## ##       ##     ## ##    ##
//    ##     ## ##       ##       ##     ## ##       ##     ## ##
//    ######### ######   ##       ########  ######   ########   ######
//    ##     ## ##       ##       ##        ##       ##   ##         ##
//    ##     ## ##       ##       ##        ##       ##    ##  ##    ##
//    ##     ## ######## ######## ##        ######## ##     ##  ######

/**
 * Computes the output color of `value` with a rotated hue defined
 * in `filter`.
 *
 * @param  {string} value the CSS color to apply the rotation on
 * @param  {string} filter the CSS hue rotate filter declaration
 * @return {string} the rotated CSS color
 * @access private
 */
function rotateHue (value, filter) {
  let [, , r, g, b, , a] = value.match(/rgb(a?)\((\d+), (\d+), (\d+)(, (\d+(\.\d+)?))?\)/)
  let rgb = new Uint8ClampedArray([r, g, b])

  let [, hue] = filter.match(/hue-rotate\((\d+)deg\)/)

  ;[a, hue] = [a, hue].map(Number)
  rgb = rotate(rgb, hue)

  if (isNaN(a)) {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
  } else {
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`
  }
}

const lumR = 0.2126
const lumG = 0.7152
const lumB = 0.0722
const hueRotateR = 0.143
const hueRotateG = 0.140
const hueRotateB = 0.283

/**
 * Computes the hue rotation on the provided `r`, `g` and `b` channels
 * by the amount of `angle`.
 *
 * @param  {Uint8ClampedArray} rgb the [red, blue, channel] channel of the color to rotate
 * @param  {number} angle the angle to rotate the hue with
 * @return {Uint8ClampedArray} the rotated color channels
 * @access private
 */
function rotate (rgb, angle) {
  const angleRad = degreeToRad(angle)
  const cos = Math.cos(angleRad)
  const sin = Math.sin(angleRad)
  const r = rgb[0]
  const g = rgb[1]
  const b = rgb[2]
  return new Uint8ClampedArray([
    r * (lumR + (1 - lumR) * cos - (lumR * sin)) +
    g * (lumG - (lumG * cos) - (lumG * sin)) +
    b * (lumB - (lumB * cos) + (1 - lumB) * sin),

    r * (lumR - (lumR * cos) + hueRotateR * sin) +
    g * (lumG + (1 - lumG) * cos + hueRotateG * sin) +
    b * (lumB - (lumB * cos) - (hueRotateB * sin)),

    r * (lumR - (lumR * cos) - ((1 - lumR) * sin)) +
    g * (lumG - (lumG * cos) + lumG * sin) +
    b * (lumB + (1 - lumB) * cos + lumB * sin)
  ])
}

function degreeToRad (angle) {
  return angle * degreeToRadCoeff
}
const degreeToRadCoeff = Math.Pi / 180
