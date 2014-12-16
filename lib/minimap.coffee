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
      @emitter.emit('did-change-config')
    subs.add atom.config.observe 'minimap.charWidth', (@charWidth) =>
      @emitter.emit('did-change-config')
    subs.add atom.config.observe 'minimap.interline', (@interline) =>
      @emitter.emit('did-change-config')

    subs.add @textEditor.onDidChange (changes) => @emitChanges(changes)
    subs.add @textEditor.onDidChangeScrollTop (scrollTop) =>
      @emitter.emit('did-change-scroll-top', scrollTop)
    subs.add @textEditor.onDidChangeScrollLeft (scrollLeft) =>
      @emitter.emit('did-change-scroll-left', scrollLeft)

  onDidChange: (callback) -> @emitter.on 'did-change', callback

  onDidChangeConfig: (callback) -> @emitter.on 'did-change-config', callback

  onDidChangeScrollTop: (callback) ->
    @emitter.on 'did-change-scroll-top', callback

  onDidChangeScrollLeft: (callback) ->
    @emitter.on 'did-change-scroll-left', callback

  getTextEditor: -> @textEditor

  getTextEditorHeight: -> @textEditor.getHeight() * @getVerticalScaleFactor()

  getTextEditorScrollTop: -> @textEditor.getScrollTop() * @getVerticalScaleFactor()

  getTextEditorScrollLeft: -> @textEditor.getScrollLeft() * @getHorizontalScaleFactor()

  getTextEditorScrollRatio: ->
    @textEditor.getScrollTop() / @textEditor.displayBuffer.getMaxScrollTop()

  getHeight: -> @textEditor.getScreenLineCount() * @getLineHeight()

  getVerticalScaleFactor: ->
    @getLineHeight() / @textEditor.getLineHeightInPixels()

  getHorizontalScaleFactor: ->
    @getCharWidth() / @textEditor.getDefaultCharWidth()

  getLineHeight: -> @charHeight + @interline

  getCharWidth: -> @charWidth

  getCharHeight: -> @charHeight

  getInterline: -> @interline

  getFirstVisibleScreenRow: ->
    Math.floor(@getMinimapScrollTop() / @getLineHeight())

  getLastVisibleScreenRow: ->
    Math.ceil((@getMinimapScrollTop() + @textEditor.getHeight()) / @getLineHeight())

  getMinimapScrollTop: ->
    Math.abs(@getTextEditorScrollRatio() * @getMinimapMaxScrollTop())

  getMinimapMaxScrollTop: -> Math.max(0, @getHeight() - @textEditor.getHeight())

  canScroll: -> @getMinimapMaxScrollTop() > 0

  getMarker: (id) -> @textEditor.getMarker(id)

  findMarkers: (o) -> @textEditor.findMarkers(o)

  markBufferRange: (range) -> @textEditor.markBufferRange(range)

  emitChanges: (changes) -> @emitter.emit('did-change', changes)

  stackChanges: (changes) -> @emitChanges(changes)
