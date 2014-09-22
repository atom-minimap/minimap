path = require 'path'
MinimapRenderView = require '../lib/minimap-render-view'
MinimapView = require '../lib/minimap-view'
Minimap = require '../lib/minimap'
{WorkspaceView} = require 'atom'


describe "MinimapRenderView", ->
  [minimapView, MinimapRenderView, editorView, updateCallback] = []

  afterEach -> minimapView?.detach()

  beforeEach ->
    atom.config.set 'minimap', Minimap.configDefaults

    runs ->
      atom.workspaceView = new WorkspaceView

      atom.workspaceView.simulateDomAttachment()

      atom.config.set 'minimap.interline', 3
      atom.config.set 'minimap.charHeight', 2
      atom.config.set 'minimap.charWidth', 1

      atom.project.setPath(path.join(__dirname, 'fixtures'))

    waitsForPromise ->
      promise = atom.packages.activatePackage('minimap')

    waitsForPromise ->
      atom.workspaceView.open('two-hundred.txt')

    runs ->
      editorView = atom.workspaceView.getActiveView()

  describe 'once created and initialized with an editor view', ->
    beforeEach ->
      runs ->
        minimapView = new MinimapView editorView
        minimapView.attachToPaneView()
        minimapView.computeScale()
        minimapView.height 5
        minimapView.updatePositions = ->

        MinimapRenderView = minimapView.renderView

    describe '::getMinimapHeight', ->
      it 'returns its content height based on its line-height', ->
        interline = atom.config.get 'minimap.interline'
        charHeight = atom.config.get 'minimap.charHeight'
        linesCount = editorView.editor.buffer.getLines().length

        height = (interline + charHeight) * linesCount

        expect(MinimapRenderView.getMinimapHeight()).toEqual(height)

    describe '::update', ->
      beforeEach ->
        updateCallback = jasmine.createSpy('updateCallback')
        spyOn(MinimapRenderView, 'drawLines')

        MinimapRenderView.update()

      it 'renders the minimap on canvas', ->
        expect(MinimapRenderView.drawLines).toHaveBeenCalled()
