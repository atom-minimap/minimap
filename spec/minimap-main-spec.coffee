describe "Minimap", ->
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

  describe "when the minimap:toggle event is triggered", ->
    beforeEach ->
      waitsForPromise -> atom.packages.activatePackage('minimap')

    it "attaches and then detaches the view", ->
      expect(workspaceElement.querySelector('.minimap')).toBeNull()
      expect(workspaceElement.querySelector('.pane.with-minimap')).toBeNull()

      atom.commands.dispatch workspaceElement, 'minimap:toggle'
      expect(workspaceElement.querySelector('.minimap')).toBeDefined()
      expect(workspaceElement.querySelector('.pane.with-minimap')).toBeDefined()

      atom.commands.dispatch workspaceElement, 'minimap:toggle'
      expect(workspaceElement.querySelector('.minimap')).toBeNull()
      expect(workspaceElement.querySelector('.pane.with-minimap')).toBeNull()
