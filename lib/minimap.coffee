{Model} = require 'theorist'
{Emitter, CompositeDisposable} = require 'event-kit'
DecorationManagement = require './mixins/decoration-management'

module.exports =
class Minimap extends Model
  DecorationManagement.includeInto(this)

  constructor: ({@textEditor}={}) ->
    unless @textEditor?
      throw new Error('Cannot create a minimap without an editor')

    super
    @emitter = new Emitter
    @subscriptions = subs = new CompositeDisposable
    @initializeDecorations()

    subs.add atom.config.observe 'minimap.charHeight', (@charHeight) =>
    subs.add atom.config.observe 'minimap.charWidth', (@charWidth) =>
    subs.add atom.config.observe 'minimap.interline', (@interline) =>

    subs.add @textEditor.onDidChange (changes) => @emitChanges(changes)
    subs.add @textEditor.onDidChangeScrollTop (scrollTop) =>
      @emitter.emit('did-change-scroll-top', scrollTop)

  onDidChange: (callback) -> @emitter.on 'did-change', callback

  onDidChangeScrollTop: (callback) ->
    @emitter.on 'did-change-scroll-top', callback

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

  emitChanges: (changes) -> @emitter.emit('did-change', changes)

  stackChanges: (changes) -> @emitChanges(changes)
