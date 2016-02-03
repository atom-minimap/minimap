'use babel'

import CanvasLayer from '../lib/canvas-layer'

describe('CanvasLayer', () => {
  let [layer] = []

  beforeEach(() => {
    layer = new CanvasLayer()

    layer.setSize(100, 300)
  })

  it('has two canvas', () => {
    expect(layer.canvas).toBeDefined()
    expect(layer.offscreenCanvas).toBeDefined()
  })

  it('has a context for each canvas', () => {
    expect(layer.context).toBeDefined()
    expect(layer.offscreenContext).toBeDefined()
  })

  it('disables the smoothing for the canvas', () => {
    expect(layer.canvas.webkitImageSmoothingEnabled).toBeFalsy()
    expect(layer.offscreenCanvas.webkitImageSmoothingEnabled).toBeFalsy()

    expect(layer.context.imageSmoothingEnabled).toBeFalsy()
    expect(layer.offscreenContext.imageSmoothingEnabled).toBeFalsy()
  })

  describe('.prototype.attach', () => {
    it('attaches the onscreen canvas to the provided element', () => {
      let jasmineContent = document.body.querySelector('#jasmine-content')

      layer.attach(jasmineContent)

      expect(jasmineContent.querySelector('canvas')).toExist()
    })
  })

  describe('.prototype.resetOffscreenSize', () => {
    it('sets the width of the offscreen canvas to the ', () => {
      layer.canvas.width = 500
      layer.canvas.height = 400

      expect(layer.offscreenCanvas.width).toEqual(100)
      expect(layer.offscreenCanvas.height).toEqual(300)

      layer.resetOffscreenSize()

      expect(layer.offscreenCanvas.width).toEqual(500)
      expect(layer.offscreenCanvas.height).toEqual(400)
    })
  })

  describe('.prototype.copyToOffscreen', () => {
    it('copies the onscreen bitmap onto the offscreen canvas', () => {
      spyOn(layer.offscreenContext, 'drawImage')

      layer.copyToOffscreen()

      expect(layer.offscreenContext.drawImage).toHaveBeenCalledWith(layer.canvas, 0, 0)
    })
  })

  describe('.prototype.copyFromOffscreen', () => {
    it('copies the offscreen bitmap onto the onscreen canvas', () => {
      spyOn(layer.context, 'drawImage')

      layer.copyFromOffscreen()

      expect(layer.context.drawImage).toHaveBeenCalledWith(layer.offscreenCanvas, 0, 0)
    })
  })

  describe('.prototype.copyPartFromOffscren', () => {
    it('copies to the onscreen canvas the region that were specified', () => {
      spyOn(layer.context, 'drawImage')

      layer.copyPartFromOffscreen(50, 100, 150)

      expect(layer.context.drawImage).toHaveBeenCalledWith(
        layer.offscreenCanvas,
        0, 50, 100, 150,
        0, 100, 100, 150
      )
    })
  })

  describe('.prototype.clearCanvas', () => {
    it('clears the whole canvas region', () => {
      spyOn(layer.context, 'clearRect')

      layer.clearCanvas()

      expect(layer.context.clearRect).toHaveBeenCalledWith(0, 0, layer.canvas.width, layer.canvas.height)
    })
  })
})
