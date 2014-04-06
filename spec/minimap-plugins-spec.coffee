Minimap = require '../lib/minimap'
{WorkspaceView} = require 'atom'

describe "Minimap Plugins", ->
  beforeEach ->
    runs ->
      atom.workspaceView = new WorkspaceView
      atom.workspaceView.openSync('sample.js')

    runs ->
      atom.workspaceView.attachToDom()
      editorView = atom.workspaceView.getActiveView()

    @plugin =
      activatePlugin: ->
      deactivatePlugin: ->

    spyOn @plugin, 'activatePlugin'
    spyOn @plugin, 'deactivatePlugin'

  describe 'registered before activation', ->

    beforeEach ->
      Minimap.registerPlugin 'dummy', @plugin

    it 'should be available in the minimap', ->
      expect(Minimap.plugins['dummy']).toBe(@plugin)

    it 'should have created a default config for the plugin', ->
      expect(Minimap.configDefaults.plugins.dummy).toBeDefined()

    it 'should have set the corresponding config', ->
      expect(atom.config.get 'minimap.plugins.dummy').toBeDefined()

    describe 'and then unregistered', ->
      beforeEach ->
        Minimap.unregisterPlugin 'dummy'

      it 'should have been removed', ->
        expect(Minimap.plugins['dummy']).toBeUndefined()

      describe 'when the config is modified', ->
        beforeEach ->
          atom.config.set 'minimap.plugins.dummy', false

        it 'should not receive an activation call', ->
          expect(@plugin.deactivatePlugin).not.toHaveBeenCalled()

    describe 'the registered plugin', ->
      it 'should have received an activation call', ->
        Minimap.registerPlugin 'dummy', @plugin
        expect(@plugin.activatePlugin).toHaveBeenCalled()

      describe 'when the config for it is false', ->
        beforeEach ->
          atom.config.set 'minimap.plugins.dummy', false
          Minimap.registerPlugin 'dummy', @plugin

        it 'should have received a deactivation call', ->
          expect(@plugin.deactivatePlugin).toHaveBeenCalled()

      describe 'when the config is modified after registration', ->
        beforeEach ->
          Minimap.registerPlugin 'dummy', @plugin
          atom.config.set 'minimap.plugins.dummy', false

        it 'should have received a deactivation call', ->
          expect(@plugin.deactivatePlugin).toHaveBeenCalled()

    describe 'on minimap activation', ->
      beforeEach ->
        waitsForPromise ->
          promise = atom.packages.activatePackage('minimap')
          expect(atom.workspaceView.find('.minimap')).not.toExist()
          atom.workspaceView.trigger 'minimap:toggle'
          promise
