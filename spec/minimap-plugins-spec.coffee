Minimap = require '../lib/main'

describe "Minimap Plugins", ->
  [plugin, editor, editorView, workspaceElement, registerHandler, unregisterHandler] = []

  beforeEach ->
    waitsForPromise ->
      atom.workspace.open('sample.js')

    runs ->
      workspaceElement = atom.views.getView(atom.workspace)
      jasmine.attachToDOM(workspaceElement)

      editor = atom.workspace.getActiveTextEditor()
      editorView = atom.views.getView(editor)

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

  describe 'registered before activation', ->

    beforeEach ->
      Minimap.onDidAddPlugin registerHandler
      Minimap.registerPlugin 'dummy', plugin

    it 'should be available in the minimap', ->
      expect(Minimap.plugins['dummy']).toBe(plugin)

    it 'should have emit an event', ->
      expect(registerHandler).toHaveBeenCalled()

    it 'should have created a default config for the plugin', ->
      expect(Minimap.config.plugins.properties.dummy).toBeDefined()

    it 'should have set the corresponding config', ->
      expect(atom.config.get 'minimap.plugins.dummy').toBeDefined()

    describe 'triggering the corresponding plugin command', ->
      beforeEach ->
        atom.commands.dispatch workspaceElement, 'minimap:toggle-dummy'

      it 'should have received a deactivation call', ->
        expect(plugin.deactivatePlugin).toHaveBeenCalled()

    describe 'and then unregistered', ->
      beforeEach ->
        Minimap.unregisterPlugin 'dummy'

      it 'should have been removed', ->
        expect(Minimap.plugins['dummy']).toBeUndefined()

      xdescribe 'when the config is modified', ->
        beforeEach ->
          atom.config.set 'minimap.plugins.dummy', false

        it 'should not receive an activation call', ->
          expect(plugin.deactivatePlugin).not.toHaveBeenCalled()

  describe 'the registered plugin', ->
    it 'should have received an activation call', ->
      Minimap.registerPlugin 'dummy', plugin
      expect(plugin.activatePlugin).toHaveBeenCalled()

    describe 'when the config for it is false', ->
      beforeEach ->
        atom.config.set 'minimap.plugins.dummy', false
        Minimap.registerPlugin 'dummy', plugin

      it 'should not have received an activation call', ->
        expect(plugin.activatePlugin).not.toHaveBeenCalled()

    describe 'when the config is modified after registration', ->
      beforeEach ->
        Minimap.registerPlugin 'dummy', plugin
        atom.config.set 'minimap.plugins.dummy', false

      it 'should have received a deactivation call', ->
        expect(plugin.deactivatePlugin).toHaveBeenCalled()

  describe 'on minimap activation', ->
    beforeEach ->
      waitsForPromise ->
        promise = atom.packages.activatePackage('minimap')
        expect(atom.workspaceView.find('.minimap')).not.toExist()
        atom.commands.dispatch workspaceElement, 'minimap:toggle'
        promise
