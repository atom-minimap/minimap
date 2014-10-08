Minimap = require '../lib/minimap'
{WorkspaceView} = require 'atom'

describe "Minimap", ->
  beforeEach ->

    runs ->
      atom.workspaceView = new WorkspaceView
      atom.config.set 'minimap.autoToggle', true

    waitsForPromise ->
      atom.workspaceView.open('sample.js')

    runs ->
      atom.workspaceView.simulateDomAttachment()
      editorView = atom.workspaceView.getActiveView()

  describe "when the minimap:toggle event is triggered", ->
    beforeEach ->
      waitsForPromise -> atom.packages.activatePackage('minimap')

    it "attaches and then detaches the view", ->
      expect(atom.workspaceView.find('.minimap')).toExist()
      atom.workspaceView.trigger 'minimap:toggle'
      expect(atom.workspaceView.find('.minimap')).not.toExist()

    it 'decorates the pane view with a with-minimap class', ->
      expect(atom.workspaceView.find('.pane.with-minimap').length).toEqual(1)
      atom.workspaceView.trigger 'minimap:toggle'
      expect(atom.workspaceView.find('.pane.with-minimap').length).toEqual(0)
