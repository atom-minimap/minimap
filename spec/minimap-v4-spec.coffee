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

  describe 'plugins', ->
    [registerHandler, unregisterHandler, plugin] = []

    beforeEach ->
      atom.config.set 'minimap.displayPluginsControls', true
      atom.config.set 'minimap.plugins.dummy', undefined

      plugin =
        active: false
        activatePlugin: -> @active = true
        deactivatePlugin: -> @active = false
        isActive: -> @active

      spyOn(plugin, 'activatePlugin').andCallThrough()
      spyOn(plugin, 'deactivatePlugin').andCallThrough()

      registerHandler = jasmine.createSpy('register handler')
      unregisterHandler = jasmine.createSpy('unregister handler')

    describe 'when registered', ->
      beforeEach ->
        minimapPackage.onDidAddPlugin registerHandler
        minimapPackage.registerPlugin 'dummy', plugin

      it 'makes the plugin available in the minimap', ->
        expect(minimapPackage.plugins['dummy']).toBe(plugin)

      it 'emits an event', ->
        expect(registerHandler).toHaveBeenCalled()

      it 'creates a default config for the plugin', ->
        expect(minimapPackage.config.plugins.properties.dummy).toBeDefined()

      it 'sets the corresponding config', ->
        expect(atom.config.get 'minimap.plugins.dummy').toBeTruthy()

      describe 'triggering the corresponding plugin command', ->
        beforeEach ->
          atom.commands.dispatch workspaceElement, 'minimap:toggle-dummy'

        it 'receives a deactivation call', ->
          expect(plugin.deactivatePlugin).toHaveBeenCalled()

      describe 'and then unregistered', ->
        beforeEach ->
          minimapPackage.unregisterPlugin 'dummy'

        it 'has been unregistered', ->
          expect(minimapPackage.plugins['dummy']).toBeUndefined()

        describe 'when the config is modified', ->
          beforeEach ->
            atom.config.set 'minimap.plugins.dummy', false

          it 'does not activates the plugin', ->
            expect(plugin.deactivatePlugin).not.toHaveBeenCalled()

      describe 'on minimap deactivation', ->
        beforeEach ->
          expect(plugin.active).toBeTruthy()
          minimapPackage.deactivate()

        it 'deactivates all the plugins', ->
          expect(plugin.active).toBeFalsy()

    describe 'when the config for it is false', ->
      beforeEach ->
        atom.config.set 'minimap.plugins.dummy', false
        minimapPackage.registerPlugin 'dummy', plugin

      it 'does not receive an activation call', ->
        expect(plugin.activatePlugin).not.toHaveBeenCalled()

    describe 'the registered plugin', ->
      beforeEach ->
        minimapPackage.registerPlugin 'dummy', plugin

      it 'receives an activation call', ->
        expect(plugin.activatePlugin).toHaveBeenCalled()

      it 'activates the plugin', ->
        expect(plugin.active).toBeTruthy()

      describe 'when the config is modified after registration', ->
        beforeEach ->
          atom.config.set 'minimap.plugins.dummy', false

        it 'receives a deactivation call', ->
          expect(plugin.deactivatePlugin).toHaveBeenCalled()
