MinimapIndicator = require '../lib/minimap-indicator'
{WorkspaceView} = require 'atom'

indicator = new MinimapIndicator()

SCALE_X = .2
SCALE_Y = .16 # .2 * .8

INDICATOR_X = 50
INDICATOR_Y = 100

INDICATOR_WIDTH = 200
INDICATOR_HEIGHT = 200

WRAPPER_WIDTH = 200
WRAPPER_HEIGHT = 500

SCROLLER_WIDTH = 400
SCROLLER_HEIGHT = 1000

#   .............
#   .           .------------> Minimap Scroller:  400 x 1000
#   ---------   .
#   |       |----------> Minimap Wrapper:         200 x 500
#   |       |   .
#   |       |   .
#   #########------> Minimap Indicator:           200 x 200
#   |       |   .
#   ---------   .
#   .           .
#   .............
#

describe "Minimap Indicator", ->
  beforeEach ->
    runs ->
      atom.workspaceView = new WorkspaceView

    waitsForPromise ->
      atom.workspaceView.open('sample.js')

    runs ->
      atom.workspaceView.simulateDomAttachment()
      editorView = atom.workspaceView.getActiveView()

  describe 'set indicator size', ->
    beforeEach ->
      indicator.width = INDICATOR_WIDTH
      indicator.height = INDICATOR_HEIGHT

    it 'should be set width', ->
      expect(indicator.width).toBe(200)

    it 'should be set height', ->
      expect(indicator.height).toBe(200)

  describe 'minimap wrapper', ->

    it 'should have a wrapper', ->
      expect(indicator.wrapper).toBeDefined()

    describe 'set wrapper size', ->
      beforeEach ->
        indicator.setWrapperSize WRAPPER_WIDTH, WRAPPER_HEIGHT

      it 'should have size', ->
        expect(indicator.wrapper.width).toBe(200)
        expect(indicator.wrapper.height).toBe(500)

  describe 'minimap scroller', ->

    it 'should have a scroller', ->
      expect(indicator.scroller).toBeDefined()

    describe 'set scroller size', ->
      beforeEach ->
        indicator.setScrollerSize SCROLLER_WIDTH, SCROLLER_HEIGHT

      it 'should have size', ->
        expect(indicator.scroller.width).toBe(400)
        expect(indicator.scroller.height).toBe(1000)

      it 'should hava maxScrollX', ->
        expect(indicator.scroller.maxScrollX).toBe(SCROLLER_WIDTH - WRAPPER_WIDTH)

      it 'should hava maxScrollY', ->
        expect(indicator.scroller.maxScrollY).toBe(SCROLLER_HEIGHT - WRAPPER_HEIGHT)

  describe 'compute boundary', ->
    beforeEach ->
      indicator.updateBoundary()

    it 'should have maxPosX', ->
      expect(indicator.maxPosX).toBe(SCROLLER_WIDTH - INDICATOR_WIDTH)
    it 'should have maxPosY', ->
      expect(indicator.maxPosY).toBe(SCROLLER_HEIGHT - INDICATOR_HEIGHT)

    it 'should be equal 0, minBoundaryX', ->
      expect(indicator.minBoundaryX).toBe(0)
    it 'should be equal to maxPosX, maxBoundaryX', ->
      expect(indicator.maxBoundaryX).toBe(indicator.maxPosX)

    it 'should be equal 0, minBoundaryY', ->
      expect(indicator.minBoundaryY).toBe(0)
    it 'should be equal to maxPosY, maxBoundaryY', ->
      expect(indicator.maxBoundaryY).toBe(indicator.maxPosY)

    it 'should be equal 0, calBoundaryX', ->
      expect(indicator.calBoundaryX(-20)).toBe(0)
    it 'should be equal 0, calBoundaryY', ->
      expect(indicator.calBoundaryY(-100)).toBe(0)
    it 'should be equal maxBoundaryX, calBoundaryX', ->
      expect(indicator.calBoundaryX(10020)).toBe(200)
    it 'should be equal maxBoundaryY, calBoundaryY', ->
      expect(indicator.calBoundaryY(20020)).toBe(800)

  describe 'set x/y for indicator', ->
    beforeEach ->
      indicator.x = INDICATOR_X
      indicator.y = INDICATOR_Y

    it 'should be equal to 50, x', ->
      expect(indicator.x).toBe(50)

    it 'should be equal to 100, y', ->
      expect(indicator.y).toBe(100)

  describe 'update ratio', ->
    beforeEach ->
      indicator.updateRatio()

    it 'should be equal to 0.25, ratioX', ->
      expect(indicator.ratioX).toBe(INDICATOR_X / (SCROLLER_WIDTH - INDICATOR_WIDTH))

    it 'should be equal to 0.125, ratioY', ->
      expect(indicator.ratioY).toBe(INDICATOR_Y / (SCROLLER_HEIGHT - INDICATOR_HEIGHT))

  describe 'update scroller position', ->
    beforeEach ->
      indicator.updateScrollerPosition()

    it 'should be <= 0, scroller.x', ->
      expect(indicator.scroller.x).toBe(-0.25 * (400 - 200))

    it 'should be <= 0, scroller.y', ->
      expect(indicator.scroller.y).toBe(-0.125 * (1000 - 500))

  describe 'compute from center x/y', ->

    it 'should be equal to 100', ->
      expect(indicator.computeFromCenterX(30 / SCALE_X)).toBe(100)

    it 'should be equal to 862.5', ->
      expect(indicator.computeFromCenterY(500 / SCALE_Y)).toBe(862.5)
