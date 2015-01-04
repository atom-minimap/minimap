{TextEditor} = require 'atom'
Minimap = require '../lib/minimap'

describe 'Minimap package v4', ->
  [editor, minimap, editorElement, minimapElement, workspaceElement, minimapPackage] = []

  beforeEach ->
    atom.config.set 'minimap.v4Preview', true
    atom.config.set 'minimap.autoToggle', true

    workspaceElement = atom.views.getView(atom.workspace)
    jasmine.attachToDOM(workspaceElement)

    waitsForPromise ->
      atom.workspace.open('sample.coffee')

    waitsForPromise ->
      atom.packages.activatePackage('minimap').then (pkg) ->
        minimapPackage = pkg.mainModule

    waitsFor -> workspaceElement.querySelector('atom-text-editor')
    runs ->
      editor = atom.workspace.getActiveTextEditor()
      editorElement = atom.views.getView(editor)

    waitsFor ->
      workspaceElement.querySelector('atom-text-editor::shadow atom-text-editor-minimap')

  it 'returns a custom version instead of the one in package.json', ->
    expect(minimapPackage.version).toEqual('4.0.0-preview')

  it 'match semver expression in 4.x', ->
    expect(minimapPackage.versionMatch('4.x')).toBeTruthy()

  it 'registers the minimap views provider', ->
    textEditor = new TextEditor({})
    minimap = new Minimap({textEditor})
    minimapElement = atom.views.getView(minimap)

    expect(minimapElement).toExist()

  describe 'when an editor is opened', ->
    it 'creates a minimap model for the editor', ->
      expect(minimapPackage.minimapForEditor(editor)).toBeDefined()

    it 'attaches a minimap element to the editor view', ->
      expect(editorElement.shadowRoot.querySelector('atom-text-editor-minimap')).toExist()

  describe '::observeMinimaps', ->
    [spy] = []
    beforeEach ->
      spy = jasmine.createSpy('observeMinimaps')
      minimapPackage.observeMinimaps(spy)

    it 'calls the callback with the existing minimaps', ->
      expect(spy).toHaveBeenCalled()

    it 'calls the callback when a new editor is opened', ->
      waitsForPromise -> atom.workspace.open('other-sample.js')

      runs -> expect(spy.calls.length).toEqual(2)

  describe '::deactivate', ->
    beforeEach ->
      minimapPackage.deactivate()

    it 'destroys all the minimap models', ->
      expect(minimapPackage.minimapForEditor(editor)).toBeUndefined()

    it 'destroys all the minimap elements', ->
      expect(editorElement.shadowRoot.querySelector('atom-text-editor-minimap')).not.toExist()
