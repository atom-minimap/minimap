Minimap = require '../lib/minimap'
{WorkspaceView} = require 'atom'

# Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
#
# To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
# or `fdescribe`). Remove the `f` to unfocus the block.

describe "Minimap", ->
  beforeEach ->
    runs ->
      atom.workspaceView = new WorkspaceView
      atom.workspaceView.openSync('sample.js')

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
