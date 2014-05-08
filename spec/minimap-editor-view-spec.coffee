MinimapEditorView = require '../lib/minimap-editor-view'
{WorkspaceView} = require 'atom'

view = null
editorView = null
updateCallback = null

describe "MinimapView", ->
  beforeEach ->
    runs ->
      atom.workspaceView = new WorkspaceView
      atom.workspaceView.openSync('sample.js')

    runs ->
      atom.workspaceView.attachToDom()
      editorView = atom.workspaceView.getActiveView()
      editorView.setText("""
        class Dummy
          constructor: ->
            @name = 'dummy'

          sayHello: ->
            "hello, I'm \#{@name} :)"
      """)

  describe 'once created and initialized with an editor view', ->
    beforeEach ->
      updateCallback = jasmine.createSpy('updateCallback')
      view = new MinimapEditorView
      view.setEditorView editorView

      # @view.once 'minimap:updated', updateCallback
      # waitsFor -> updateCallback.callCount is 1

    describe '::getHeight', ->
      it 'returns its content height based on its line-height', ->
        lineHeight = parseInt editorView.css('line-height')
        linesCount = editorView.editor.buffer.getLines().length

        console.log view.css('line-height')

        height = lineHeight * linesCount

        expect(view.getHeight()).toEqual(height)
