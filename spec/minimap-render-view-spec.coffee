path = require 'path'
MinimapRenderView = require '../lib/minimap-render-view'
MinimapView = require '../lib/minimap-view'
Minimap = require '../lib/main'

describe "MinimapRenderView", ->
  [minimapView, MinimapRenderView, editorView, updateCallback, workspaceElement, editor] = []

  afterEach -> minimapView?.detach()

  beforeEach ->
    atom.config.set 'minimap', Minimap.configDefaults

    waitsForPromise ->
      atom.workspace.open('two-hundred.txt')

    runs ->
      workspaceElement = atom.views.getView(atom.workspace)
      jasmine.attachToDOM(workspaceElement)

      atom.config.set 'minimap.interline', 3
      atom.config.set 'minimap.charHeight', 2
      atom.config.set 'minimap.charWidth', 1

      atom.project.setPaths([path.join(__dirname, 'fixtures')])

    waitsFor ->
      editor = atom.workspace.getActiveTextEditor()

    runs ->
      editorView = atom.views.getView(editor)

    waitsForPromise ->
      promise = atom.packages.activatePackage('minimap')

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
        linesCount = editor.getBuffer().getLines().length

        height = (interline + charHeight) * linesCount

        expect(MinimapRenderView.getMinimapHeight()).toEqual(height)

    describe '::update', ->
      beforeEach ->
        updateCallback = jasmine.createSpy('updateCallback')
        spyOn(MinimapRenderView, 'drawLines')

        MinimapRenderView.update()

      it 'renders the minimap on canvas', ->
        expect(MinimapRenderView.drawLines).toHaveBeenCalled()
