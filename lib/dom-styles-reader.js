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

const matrix = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]) // a variable reused in rotate function
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
  const cos = Math.cos(degreeToRad(angle))
  const sin = Math.sin(degreeToRad(angle))

  matrix[0] = lumR + (1 - lumR) * cos - (lumR * sin)
  matrix[1] = lumG - (lumG * cos) - (lumG * sin)
  matrix[2] = lumB - (lumB * cos) + (1 - lumB) * sin
  matrix[3] = lumR - (lumR * cos) + hueRotateR * sin
  matrix[4] = lumG + (1 - lumG) * cos + hueRotateG * sin
  matrix[5] = lumB - (lumB * cos) - (hueRotateB * sin)
  matrix[6] = lumR - (lumR * cos) - ((1 - lumR) * sin)
  matrix[7] = lumG - (lumG * cos) + lumG * sin
  matrix[8] = lumB + (1 - lumB) * cos + lumB * sin

  const r = rgb[0]
  const g = rgb[1]
  const b = rgb[2]
  return new Uint8ClampedArray([
    matrix[0] * r + matrix[1] * g + matrix[2] * b,
    matrix[3] * r + matrix[4] * g + matrix[5] * b,
    matrix[6] * r + matrix[7] * g + matrix[8] * b
  ])
}

function degreeToRad (angle) {
  return angle * degreeToRadCoeff
}
const degreeToRadCoeff = Math.Pi / 180
