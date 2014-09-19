{WorkspaceView} = require 'atom'
SampleMinimapPlugin = require '../lib/sample-minimap-plugin'

# Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
#
# To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
# or `fdescribe`). Remove the `f` to unfocus the block.

describe "SampleMinimapPlugin", ->

  beforeEach ->
    atom.workspaceView = new WorkspaceView

    waitsForPromise -> atom.workspaceView.open('sample.js')

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

    waitsForPromise ->
      atom.packages.activatePackage('sample-minimap-plugin')

  describe "with an open editor that have a minimap", ->
    it "creates and attaches the view to the minimap", ->
      expect(atom.workspaceView.find('.minimap .sample-minimap-plugin')).toExist()
