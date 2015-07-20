{Emitter, CompositeDisposable} = require 'event-kit'
DecorationManagement = require './mixins/decoration-management'

nextModelId = 1

# Public: The {Minimap} class is the underlying model of a {MinimapElement}.
# Most manipulations of the minimap is done through the model.
#
# Any {Minimap} instance is tied to a `TextEditor`.
# Their lifecycle follow the one of their target `TextEditor`, so they are
# destroyed whenever their `TextEditor` is destroyed.
module.exports =
class Minimap
  DecorationManagement.includeInto(this)

  ### Public ###

  # Creates a new {Minimap} instance for the given `TextEditor`.
  #
  # options - An {Object} with the following properties:
  #           :textEditor - A `TextEditor` instance.
  constructor: (options={}) ->
    {@textEditor} = options
    unless @textEditor?
      throw new Error('Cannot create a minimap without an editor')

    @id = nextModelId++
    @emitter = new Emitter
    @subscriptions = subs = new CompositeDisposable
    @initializeDecorations()

    subs.add atom.config.observe 'editor.scrollPastEnd', (@scrollPastEnd) =>
      @emitter.emit('did-change-config', {
        config: 'editor.scrollPastEnd'
        value: @scrollPastEnd
      })
    subs.add atom.config.observe 'minimap.charHeight', (@charHeight) =>
      @emitter.emit('did-change-config', {
        config: 'minimap.charHeight'
        value: @charHeight
      })
    subs.add atom.config.observe 'minimap.charWidth', (@charWidth) =>
      @emitter.emit('did-change-config', {
        config: 'minimap.charWidth'
        value: @charWidth
      })
    subs.add atom.config.observe 'minimap.interline', (@interline) =>
      @emitter.emit('did-change-config', {
        config: 'minimap.interline'
        value: @interline
      })

    subs.add @textEditor.onDidChange (changes) =>
      @emitChanges(changes)
    subs.add @textEditor.onDidChangeScrollTop (scrollTop) =>
      @emitter.emit('did-change-scroll-top', scrollTop)
    subs.add @textEditor.onDidChangeScrollLeft (scrollLeft) =>
      @emitter.emit('did-change-scroll-left', scrollLeft)
    subs.add @textEditor.onDidDestroy =>
      @destroy()

    # FIXME Some changes occuring during the tokenization produces
    # ranges that deceive the canvas rendering by making some
    # lines at the end of the buffer intact while they are in fact not,
    # resulting in extra lines appearing at the end of the minimap.
    # Forcing a whole repaint to fix that bug is suboptimal but works.
    subs.add @textEditor.displayBuffer.onDidTokenize =>
      @emitter.emit('did-change-config')

  # Destroys the model.
  destroy: ->
    return if @destroyed

    @removeAllDecorations()
    @subscriptions.dispose()
    @subscriptions = null
    @textEditor = null
    @emitter.emit 'did-destroy'
    @emitter.dispose()
    @destroyed = true

  isDestroyed: -> @destroyed

  # Calls the `callback` when changes have been made in the buffer or in the
  # minimap that alter the minimap display.
  #
  # callback - The callback {Function}. The event the callback will receive
  #            a change {Object} with the following properties:
  #            :start - The {Number} of the change's start row.
  #            :end - The {Number} of the change's end row.
  #            :screenDelta - The {Number} of rows affected by the changes.
  #
  # Returns a `Disposable`.
  onDidChange: (callback) ->
    @emitter.on 'did-change', callback

  # Calls the `callback` when changes have been made in the configuration fields
  # of the `minimap` package. As many computation are tied to these
  # configurations this method allow to be notified when these fields changes.
  #
  # callback - The callback {Function}. The event the callback will receive
  #            a change {Object} with the following properties:
  #            :config - The {String} name of the changed configuration.
  #            :value - The new value of the configuration.
  #
  # Returns a `Disposable`.
  onDidChangeConfig: (callback) ->
    @emitter.on 'did-change-config', callback

  # Calls the `callback` when the text editor `scrollTop` value have been
  # changed.
  #
  # callback - The callback {Function}. The event the callback will receive
  #            the new `scrollTop` {Number} value.
  #
  # Returns a `Disposable`.
  onDidChangeScrollTop: (callback) ->
    @emitter.on 'did-change-scroll-top', callback

  # Calls the `callback` when the text editor `scrollLeft` value have been
  # changed.
  #
  # callback - The callback {Function}. The event the callback will receive
  #            the new `scrollLeft` {Number} value.
  #
  # Returns a `Disposable`.
  onDidChangeScrollLeft: (callback) ->
    @emitter.on 'did-change-scroll-left', callback

  # Calls the `callback` when this {Minimap} was destroyed.
  #
  # callback - The callback {Function}.
  #
  # Returns a `Disposable`.
  onDidDestroy: (callback) ->
    @emitter.on 'did-destroy', callback

  # Returns the `TextEditor` that this minimap represents.
  #
  # Returns a `TextEditor`.
  getTextEditor: -> @textEditor

  # Returns the height of the `TextEditor` at the {Minimap} scale.
  #
  # Returns a {Number}.
  getTextEditorScaledHeight: -> @textEditor.getHeight() * @getVerticalScaleFactor()

  # Returns the `TextEditor::getScrollTop` value at the {Minimap} scale.
  #
  # Returns a {Number}.
  getTextEditorScaledScrollTop: ->
    @textEditor.getScrollTop() * @getVerticalScaleFactor()

  # Returns the `TextEditor::getScrollLeft` value at the {Minimap} scale.
  #
  # Returns a {Number}.
  getTextEditorScaledScrollLeft: ->
    @textEditor.getScrollLeft() * @getHorizontalScaleFactor()

  # Returns the maximum scroll the `TextEditor` can perform.
  #
  # When the `scrollPastEnd` setting is enabled, the method compensate the
  # extra scroll by removing the same height as added by the editor from the
  # final value.
  #
  # Returns a {Number}.
  getTextEditorMaxScrollTop: ->
    maxScrollTop = @textEditor.displayBuffer.getMaxScrollTop()
    lineHeight = @textEditor.displayBuffer.getLineHeightInPixels()

    maxScrollTop -= @textEditor.getHeight() - 3 * lineHeight if @scrollPastEnd
    maxScrollTop

  # Returns the `TextEditor` scroll as a value normalized between `0` and `1`.
  #
  # When the `scrollPastEnd` setting is enabled the value may exceed `1` as the
  # maximum scroll value used to compute this ratio compensate for the extra
  # height in the editor. **Use {::getCapedTextEditorScrollRatio} when you
  # need a value that is strictly between `0` and `1`.**
  #
  # Returns a {Number}.
  getTextEditorScrollRatio: ->
    # Because `0/0 = NaN`, so make sure that the denominator does not equal `0`.
    @textEditor.getScrollTop() / (@getTextEditorMaxScrollTop() || 1)

  # Returns the `TextEditor` scroll as a value normalized between `0` and `1`.
  #
  # The returned value will always be strictly between `0` and `1`.
  #
  # Returns a {Number}.
  getCapedTextEditorScrollRatio: -> Math.min(1, @getTextEditorScrollRatio())

  # Returns the height of the whole minimap in pixels based on the `minimap`
  # settings.
  #
  # Returns a {Number}.
  getHeight: -> @textEditor.getScreenLineCount() * @getLineHeight()

  # Returns the height the {Minimap} will take on screen.
  #
  # When the {Minimap} height is greater than the `TextEditor` height, the
  # `TextEditor` height is returned instead.
  #
  # Returns a {Number}.
  getVisibleHeight: ->
    Math.min(@textEditor.getHeight(), @getHeight())

  # Returns the vertical scaling factor when converting coordinates from the
  # `TextEditor` to the {Minimap}.
  #
  # Returns a {Number}.
  getVerticalScaleFactor: ->
    @getLineHeight() / @textEditor.getLineHeightInPixels()

  # Returns the horizontal scaling factor when converting coordinates from the
  # `TextEditor` to the {Minimap}.
  #
  # Returns a {Number}.
  getHorizontalScaleFactor: ->
    @getCharWidth() / @textEditor.getDefaultCharWidth()

  # Returns the height of a line in the {Minimap} in pixels.
  #
  # Returns a {Number}.
  getLineHeight: -> @charHeight + @interline

  # Returns the width of a character in the {Minimap} in pixels.
  #
  # Returns a {Number}.
  getCharWidth: -> @charWidth

  # Returns the height of a character in the {Minimap} in pixels.
  #
  # Returns a {Number}.
  getCharHeight: -> @charHeight

  # Returns the space between lines in the {Minimap} in pixels.
  #
  # Returns a {Number}.
  getInterline: -> @interline

  # Returns the index of the first visible row in the {Minimap}.
  #
  # Returns a {Number}.
  getFirstVisibleScreenRow: ->
    Math.floor(@getScrollTop() / @getLineHeight())

  # Returns the index of the last visible row in the {Minimap}.
  #
  # Returns a {Number}.
  getLastVisibleScreenRow: ->
    Math.ceil((@getScrollTop() + @textEditor.getHeight()) / @getLineHeight())

  # Returns the current scroll of the {Minimap}.
  #
  # The {Minimap} can scroll only when its height is greater that the height
  # of its `TextEditor`.
  #
  # Returns a {Number}.
  getScrollTop: ->
    Math.abs(@getCapedTextEditorScrollRatio() * @getMaxScrollTop())

  # Returns the maximum scroll value of the {Minimap}.
  #
  # Returns a {Number}.
  getMaxScrollTop: -> Math.max(0, @getHeight() - @textEditor.getHeight())

  # Returns `true` when the {Minimap} can scroll.
  #
  # Returns a {Boolean}.
  canScroll: -> @getMaxScrollTop() > 0

  # Internal: Delegates to `TextEditor::getMarker`.
  getMarker: (id) -> @textEditor.getMarker(id)

  # Internal: Delegates to `TextEditor::findMarkers`.
  findMarkers: (o) ->
    # FIXME In tests this call leads to an error raised deep down in the
    # editor model when looping in markers.
    try
      @textEditor.findMarkers(o)
    catch
      return []

  # Internal: Delegates to `TextEditor::markBufferRange`.
  markBufferRange: (range) -> @textEditor.markBufferRange(range)

  # Internal: Emits a change events with the passed-in changes as data.
  emitChanges: (changes) -> @emitter.emit('did-change', changes)
