path = require 'path'
MinimapEditorView = require '../lib/minimap-editor-view'
MinimapView = require '../lib/minimap-view'
{WorkspaceView} = require 'atom'

minimapView = null
minimapEditorView = null
editorView = null
updateCallback = null

describe "MinimapEditorView", ->
  afterEach -> minimapView?.detach()
  beforeEach ->
    runs ->
      atom.workspaceView = new WorkspaceView
      atom.project.setPath(path.join(__dirname, 'fixtures'))

      atom.workspaceView.openSync('two-hundred.txt')

    runs ->
      atom.workspaceView.attachToDom()
      editorView = atom.workspaceView.getActiveView()

  describe 'once created and initialized with an editor view', ->
    beforeEach ->
      minimapView = new MinimapView editorView
      minimapView.attachToPaneView()
      minimapView.height 5
      minimapView.updatePositions = ->

      minimapEditorView = minimapView.miniEditorView

    describe '::getHeight', ->
      it 'returns its content height based on its line-height', ->
        lineHeight = parseInt editorView.css('line-height')
        linesCount = editorView.editor.buffer.getLines().length

        height = lineHeight * linesCount

        expect(minimapEditorView.getHeight()).toEqual(height)

    describe '::update', ->
      beforeEach ->
        updateCallback = jasmine.createSpy('updateCallback')
        minimapEditorView.once 'minimap:updated', updateCallback
        minimapEditorView.update()

        waitsFor -> updateCallback.callCount is 1

      it 'renders visible lines augmented with line overdraw', ->
        lines = minimapEditorView.lines.children()
        expect(lines.length).toEqual(12)

    describe '::scrollTop', ->
      beforeEach ->
        updateCallback = jasmine.createSpy('updateCallback')
        minimapEditorView.on 'minimap:updated', updateCallback
        minimapEditorView.update()

        waitsFor -> updateCallback.callCount is 1

      it 'renders visible lines augmented with line overdraw', ->

        minimapEditorView.scrollTop 300

        waitsFor -> updateCallback.callCount >= 2

        runs ->
          lines = minimapEditorView.lines.children()
          expect(lines.length).toEqual(22)
          expect(minimapEditorView.scrollTop()).toEqual(300)
