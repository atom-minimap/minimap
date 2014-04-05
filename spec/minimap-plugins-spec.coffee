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

    beforeEach ->
      @plugin =
        activate: ->
        deactivate: ->

      spyOn @plugin, 'activate'
      spyOn @plugin, 'deactivate'

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

    describe 'on minimap activation', ->
      beforeEach ->
        waitsForPromise ->
          promise = atom.packages.activatePackage('minimap')
          expect(atom.workspaceView.find('.minimap')).not.toExist()
          atom.workspaceView.trigger 'minimap:toggle'
          promise
