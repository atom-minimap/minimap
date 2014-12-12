{Emitter, CompositeDisposable} = require 'event-kit'
DecorationManagement = require './mixins/decoration-management'

module.exports =
class Minimap
  DecorationManagement.includeInto(this)

  constructor: ({@textEditor}) ->
    @emitter = new Emitter
    @subscriptions = new CompositeDisposable
    @subscribeToConfig()
    @initializeDecorations()

  onDidChange: (callback) ->
    @emitter.on 'did-change', callback

  getTextEditor: -> @textEditor

  getTextEditorHeight: -> @textEditor.getHeight() * @getScaleFactor()

  getTextEditorScrollTop: -> @textEditor.getScrollTop() * @getScaleFactor()

  getTextEditorScrollRatio: ->
    @textEditor.getScrollTop() / @textEditor.displayBuffer.getMaxScrollTop()

  getHeight: -> @textEditor.getLineCount() * @getLineHeight()

  getScaleFactor: -> @getLineHeight() / @textEditor.getLineHeightInPixels()

  getLineHeight: -> @charHeight + @interline

  getFirstVisibleScreenRow: ->
    Math.floor(@getMinimapScrollTop() / @getLineHeight())

  getLastVisibleScreenRow: ->
    Math.ceil((@getMinimapScrollTop() + @textEditor.getHeight()) / @getLineHeight())

  getMinimapScrollTop: ->
    Math.abs(@getTextEditorScrollRatio() * @getMinimapMaxScrollTop())

  getMinimapMaxScrollTop: -> Math.max(0, @getHeight() - @textEditor.getHeight())

  canScroll: -> @getMinimapMaxScrollTop() > 0

  getMarker: (id) -> @textEditor.getMarker(id)

  markBufferRange: (range) -> @textEditor.markBufferRange(range)

  subscribeToConfig: ->
    @subscriptions.add atom.config.observe 'minimap.charHeight', (@charHeight) =>
    @subscriptions.add atom.config.observe 'minimap.charWidth', (@charWidth) =>
  emitChanges: (changes) ->
    @emitter.emit('did-change', changes)

    @subscriptions.add atom.config.observe 'minimap.interline', (@interline) =>
  stackChanges: (changes) -> @emitChanges(changes)
