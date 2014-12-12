
describe 'MinimapModel', ->
  [workspaceElement, editor, editorView] = []

  beforeEach ->
    waitsForPromise ->
      atom.workspace.open('sample.js')

    runs ->
      workspaceElement = atom.views.getView(atom.workspace)
      jasmine.attachToDOM(workspaceElement)
      atom.config.set 'minimap.autoToggle', false

    waitsFor ->
      editor = atom.workspace.getActiveTextEditor()

    runs ->
      editorView = atom.views.getView(editor)
