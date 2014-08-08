MinimapView = require '../lib/minimap-view'
{WorkspaceView} = require 'atom'

editorView = null

describe "MinimapView", ->
  beforeEach ->

    runs ->
      atom.workspaceView = new WorkspaceView

    waitsForPromise ->
      atom.config.set 'minimap.lineOverdraw', 10
      atom.config.set 'minimap.scaleX', 0.2
      atom.config.set 'minimap.scaleY', 0.16
      
      atom.workspaceView.open('sample.js')

    runs ->
      atom.workspaceView.simulateDomAttachment()
      editorView = atom.workspaceView.getActiveView()
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
