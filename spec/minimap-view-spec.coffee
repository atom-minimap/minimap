{WorkspaceView} = require 'atom'
Minimap = require '../lib/minimap'

editorView = null

describe "MinimapView", ->
  beforeEach ->

    runs ->
      atom.config.set 'minimap', Minimap.configDefaults
      atom.workspaceView = new WorkspaceView

    waitsForPromise ->

      atom.workspaceView.open('sample.js')

    runs ->
      atom.workspaceView.simulateDomAttachment()
      editorView = atom.workspaceView.getActiveView()
      editorView.find('.lines').css('line-height', '14px')
      editorView.height(50)
      editorView.setText("This is the file content")

    waitsForPromise ->
      atom.packages.activatePackage('minimap')

    runs ->
      atom.workspaceView.trigger 'minimap:toggle'

  describe 'once the package is toggled', ->
    it 'should have retrieved the editor content', ->

      waitsFor ->
        atom.workspaceView.find('.minimap .line').length > 0

      runs ->
        expect(atom.workspaceView.find('.minimap').text())
        .toEqual('This is the file content')
