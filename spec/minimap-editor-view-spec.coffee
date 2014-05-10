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

      minimapEditorView = minimapView.miniEditorView


    describe '::getHeight', ->
      it 'returns its content height based on its line-height', ->
        lineHeight = parseInt editorView.css('line-height')
        linesCount = editorView.editor.buffer.getLines().length

        height = lineHeight * linesCount

        expect(minimapEditorView.getHeight()).toEqual(height)

    describe 'on update', ->
      beforeEach ->
        updateCallback = jasmine.createSpy('updateCallback')
        minimapEditorView.once 'minimap:updated', updateCallback
        minimapEditorView.update()

        waitsFor -> updateCallback.callCount is 1

      it 'should only render visible lines', ->
        lines = minimapEditorView.lines.children()
        expect(lines.length).toEqual(12)
