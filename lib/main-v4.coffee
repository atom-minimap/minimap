{CompositeDisposable} = require 'event-kit'
[Minimap, MinimapElement] = []

module.exports =
class V4Main
  @includeInto: (base) ->
    for k,v of @prototype
      base::[k] = v

  activateV4: ->
    @editorsMinimaps = {}
    @subscriptions = new CompositeDisposable
    MinimapElement ?= require './minimap-element'

    MinimapElement.registerViewProvider()

  deactivate: ->
    @deactivateAllPlugins()
    minimap.destroy() for id,minimap of @editorsMinimaps
    @subscriptions.dispose()
    @editorsMinimaps = {}
    @toggled = false

  toggle: ->
    if @toggled
      @toggled = false
      @subscriptions.dispose()
    else
      @toggled = true
      @initSubscriptions()

  minimapForEditor: (editor) -> @editorsMinimaps[editor.id] if editor?

  observeMinimaps: (iterator) ->
    return unless iterator?
    iterator(minimap) for id,minimap of @editorsMinimaps
    createdCallback = (minimap) -> iterator(minimap)
    disposable = @onDidCreateMinimap(createdCallback)
    disposable.off = ->
      deprecate('Use Disposable::dispose instead')
      disposable.dispose()
    disposable

  initSubscriptions: ->
    Minimap ?= require './minimap'

    @subscriptions.add atom.workspace.observeTextEditors (textEditor) =>
      return if @editorsMinimaps[textEditor.id]?

      minimap = new Minimap({textEditor})
      @editorsMinimaps[textEditor.id] = minimap

      editorElement = atom.views.getView(textEditor)
      minimapElement = atom.views.getView(minimap)

      @emitter.emit('did-create-minimap', minimap)

      minimapElement.attach()
