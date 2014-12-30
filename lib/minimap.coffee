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

    subs.add atom.config.observe 'editor.scrollPastEnd', (@scrollPastEnd) =>
      @emitter.emit('did-change-config')
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
    subs.add @textEditor.onDidDestroy => @destroy()

    # FIXME: Some changes occuring during the tokenization produces
    # ranges that deceive the canvas rendering by making some
    # lines at the end of the buffer intact while they are in fact not
    # resulting in extra lines appearing at the end of the minimap.
    # Forcing a whole repaint fix that but is suboptimal.
    subs.add @textEditor.displayBuffer.onDidTokenize =>
      @emitter.emit('did-change-config')

  destroyed: ->
    @subscriptions.dispose()
    @textEditor = null
    @emitter.emit 'did-destroy'

  onDidChange: (callback) ->
    @emitter.on 'did-change', callback

  onDidChangeConfig: (callback) ->
    @emitter.on 'did-change-config', callback

  onDidChangeScrollTop: (callback) ->
    @emitter.on 'did-change-scroll-top', callback

  onDidChangeScrollLeft: (callback) ->
    @emitter.on 'did-change-scroll-left', callback

  onDidDestroy: (callback) ->
    @emitter.on 'did-destroy', callback

  getTextEditor: -> @textEditor

  getTextEditorHeight: -> @textEditor.getHeight() * @getVerticalScaleFactor()

  getTextEditorScrollTop: -> @textEditor.getScrollTop() * @getVerticalScaleFactor()

  getTextEditorScrollLeft: -> @textEditor.getScrollLeft() * @getHorizontalScaleFactor()

  getTextEditorMaxScrollTop: ->
    maxScrollTop = @textEditor.displayBuffer.getMaxScrollTop()
    if @scrollPastEnd
      maxScrollTop -= @textEditor.getHeight() - 3 * @textEditor.displayBuffer.getLineHeightInPixels()

    maxScrollTop

  getTextEditorScrollRatio: ->
    @textEditor.getScrollTop() / @getTextEditorMaxScrollTop()

  getCapedTextEditorScrollRation: ->
    Math.min(1, @getTextEditorScrollRatio())

  getHeight: -> @textEditor.getScreenLineCount() * @getLineHeight()

  getVisibleHeight: ->
    Math.min(@textEditor.getHeight(), @getHeight())

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
    Math.abs(@getCapedTextEditorScrollRation() * @getMinimapMaxScrollTop())

  getMinimapMaxScrollTop: -> Math.max(0, @getHeight() - @textEditor.getHeight())

  canScroll: -> @getMinimapMaxScrollTop() > 0

  getMarker: (id) -> @textEditor.getMarker(id)

  findMarkers: (o) ->
    # FIXME In tests this call leads to an error raised deep down in the
    # editor model when looping in markers.
    try
      @textEditor.findMarkers(o)
    catch
      return []

  markBufferRange: (range) -> @textEditor.markBufferRange(range)

  emitChanges: (changes) -> @emitter.emit('did-change', changes)

  stackChanges: (changes) -> @emitChanges(changes)
