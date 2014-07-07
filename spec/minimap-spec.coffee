Minimap = require '../lib/minimap'
{WorkspaceView} = require 'atom'

describe "Minimap", ->
  beforeEach ->

    runs ->
      atom.workspaceView = new WorkspaceView

    waitsForPromise ->
      atom.workspaceView.open('sample.js')

    runs ->
      atom.workspaceView.attachToDom()
      editorView = atom.workspaceView.getActiveView()

  describe "when the minimap:toggle event is triggered", ->
    beforeEach ->
      waitsForPromise ->
        promise = atom.packages.activatePackage('minimap')
        expect(atom.workspaceView.find('.minimap')).not.toExist()
        atom.workspaceView.trigger 'minimap:toggle'
        promise

    it "attaches and then detaches the view", ->
      expect(atom.workspaceView.find('.minimap')).toExist()
      atom.workspaceView.trigger 'minimap:toggle'
      expect(atom.workspaceView.find('.minimap')).not.toExist()

    it 'decorates the pane view with a with-minimap class', ->
      expect(atom.workspaceView.find('.pane.with-minimap').length).toEqual(1)
      atom.workspaceView.trigger 'minimap:toggle'
      expect(atom.workspaceView.find('.pane.with-minimap').length).toEqual(0)
