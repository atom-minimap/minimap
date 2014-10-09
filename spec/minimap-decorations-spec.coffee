path = require 'path'
MinimapRenderView = require '../lib/minimap-render-view'
MinimapView = require '../lib/minimap-view'
Minimap = require '../lib/minimap'
{WorkspaceView} = require 'atom'

describe "MinimapRenderView", ->
  [minimapView, MinimapRenderView, editorView, updateCallback, marker, decoration] = []

  afterEach -> minimapView?.detach()

  beforeEach ->
    atom.config.set 'minimap', Minimap.configDefaults

    runs ->
      atom.workspaceView = new WorkspaceView

      atom.workspaceView.simulateDomAttachment()

      atom.config.set 'minimap.lineHeight', 3
      atom.config.set 'minimap.charHeight', 2
      atom.config.set 'minimap.charWidth', 1

      atom.project.setPaths([path.join(__dirname, 'fixtures')])

    waitsForPromise ->
      promise = atom.packages.activatePackage('minimap')

    waitsForPromise ->
      atom.workspaceView.open('sample.coffee')

    runs ->
      editorView = atom.workspaceView.getActiveView()
      minimapView = new MinimapView editorView
      minimapView.attachToPaneView()
      minimapView.computeScale()
      minimapView.height 5
      minimapView.updatePositions = ->

      MinimapRenderView = minimapView.renderView

  describe 'decoration API', ->
    describe '::decorateMarker', ->
      beforeEach ->
        marker = minimapView.markBufferRange [[0,6], [0,11]]
        decoration = minimapView.decorateMarker marker, type: 'highlight', class: 'dummy'

      it 'creates a decoration for the given marker', ->
        expect(MinimapRenderView.decorationsByMarkerId[marker.id]).toBeDefined()

      it 'creates a change corresponding to the marker range', ->
        expect(MinimapRenderView.pendingChanges.length).toEqual(1)
        expect(MinimapRenderView.pendingChanges[0].start).toEqual(0)
        expect(MinimapRenderView.pendingChanges[0].end).toEqual(0)

      it 'requests an update', ->
        expect(MinimapRenderView.frameRequested).toBeTruthy()

      describe 'destroying the marker', ->
        beforeEach ->
          marker.destroy()

        it 'removes the decoration from the render view', ->
          expect(MinimapRenderView.decorationsByMarkerId[marker.id]).toBeUndefined()

        it 'creates a change corresponding to the marker range', ->
          expect(MinimapRenderView.pendingChanges.length).toEqual(2)
          expect(MinimapRenderView.pendingChanges[1].start).toEqual(0)
          expect(MinimapRenderView.pendingChanges[1].end).toEqual(0)

      describe 'destroying the decoration', ->
        beforeEach ->
          decoration.destroy()

        it 'removes the decoration from the render view', ->
          expect(MinimapRenderView.decorationsByMarkerId[marker.id]).toBeUndefined()

        it 'creates a change corresponding to the marker range', ->
          expect(MinimapRenderView.pendingChanges.length).toEqual(2)
          expect(MinimapRenderView.pendingChanges[1].start).toEqual(0)
          expect(MinimapRenderView.pendingChanges[1].end).toEqual(0)

      describe 'destroying all the decorations for the marker', ->
        beforeEach ->
          MinimapRenderView.removeAllDecorationsForMarker(marker)

        it 'removes the decoration from the render view', ->
          expect(MinimapRenderView.decorationsByMarkerId[marker.id]).toBeUndefined()

        it 'creates a change corresponding to the marker range', ->
          expect(MinimapRenderView.pendingChanges.length).toEqual(2)
          expect(MinimapRenderView.pendingChanges[1].start).toEqual(0)
          expect(MinimapRenderView.pendingChanges[1].end).toEqual(0)
