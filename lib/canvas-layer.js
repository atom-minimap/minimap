'use strict'

/**
 * @access private
 */
module.exports = class CanvasLayer {
  constructor () {
    /**
     * The onscreen canvas.
     * @type {HTMLCanvasElement}
     */
    this.canvas = document.createElement('canvas')
    /**
     * The onscreen canvas context.
     * @type {CanvasRenderingContext2D}
     */
    this.context = this.canvas.getContext('2d')
    this.canvas.webkitImageSmoothingEnabled = false
    this.context.imageSmoothingEnabled = false

    /**
    * The offscreen canvas.
    * @type {HTMLCanvasElement}
    * @access private
    */
    this.offscreenCanvas = document.createElement('canvas')
    /**
     * The offscreen canvas context.
     * @type {CanvasRenderingContext2D}
     * @access private
     */
    this.offscreenContext = this.offscreenCanvas.getContext('2d')
    this.offscreenCanvas.webkitImageSmoothingEnabled = false
    this.offscreenContext.imageSmoothingEnabled = false
  }

  attach (parent) {
    if (this.canvas.parentNode) { return }

    parent.appendChild(this.canvas)
  }

  setSize (width = 0, height = 0) {
    this.canvas.width = width
    this.canvas.height = height
    this.context.imageSmoothingEnabled = false
    this.resetOffscreenSize()
  }

  getSize () {
    return {
      width: this.canvas.width,
      height: this.canvas.height
    }
  }

  resetOffscreenSize () {
    this.offscreenCanvas.width = this.canvas.width
    this.offscreenCanvas.height = this.canvas.height
    this.offscreenContext.imageSmoothingEnabled = false
  }

  copyToOffscreen () {
    this.offscreenContext.drawImage(this.canvas, 0, 0)
  }

  copyFromOffscreen () {
    this.context.drawImage(this.offscreenCanvas, 0, 0)
  }

  copyPartFromOffscreen (srcY, destY, height) {
    this.context.drawImage(
      this.offscreenCanvas,
      0, srcY, this.offscreenCanvas.width, height,
      0, destY, this.offscreenCanvas.width, height
    )
  }

  clearCanvas () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}
