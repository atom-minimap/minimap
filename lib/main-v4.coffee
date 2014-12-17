{CompositeDisposable} = require 'event-kit'
[Minimap, MinimapElement] = []

module.exports =
class V4Main
  @includeInto: (base) ->
    for k,v of @prototype
      base::[k] = v
    console.log 'v4 code included'

  activateV4: ->
    console.log 'v4 activation called'
    @editorsMinimaps = {}
    @subscriptions = new CompositeDisposable
    MinimapElement ?= require './minimap-element'

    MinimapElement.registerViewProvider()

  deactivate: ->
    console.log 'v4 deactivation called'
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

  minimapForEditor: (editor) -> @editorsMinimaps[editor.id]

  initSubscriptions: ->
    Minimap ?= require './minimap'

    @subscriptions.add atom.workspace.observeTextEditors (textEditor) =>
      minimap = new Minimap({textEditor})
      @editorsMinimaps[textEditor.id] = minimap

      editorElement = atom.views.getView(textEditor)
      minimapElement = atom.views.getView(minimap)

      minimapElement.attach()
