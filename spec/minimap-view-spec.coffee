MinimapView = require '../lib/minimap-view'
{WorkspaceView} = require 'atom'

editorView = null

describe "MinimapView", ->
  beforeEach ->
    runs ->
      atom.workspaceView = new WorkspaceView
      atom.workspaceView.openSync('sample.js')
      atom.workspaceView.attachToDom()
      editorView = atom.workspaceView.getActiveView()
      editorView.setText("This is the file content")

    waitsForPromise ->
      promise = atom.packages.activatePackage('minimap')
      atom.config.set 'minimap.lineOverdraw', 10
      atom.workspaceView.trigger 'minimap:toggle'
      promise

  describe 'once the package is toggled', ->
    it 'should have retrieved the editor content', ->
      waitsFor ->
        atom.workspaceView.find('.minimap .line').length > 0

      runs ->
        expect(atom.workspaceView.find('.minimap').text())
        .toEqual('This is the file content')
