{Emitter, CompositeDisposable} = require 'atom'
DecorationManagement = require './mixins/decoration-management'
LegacyAdater = require './adapters/legacy-adapter'
BetaAdater = require './adapters/beta-adapter'

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
    {@textEditor, @standAlone, @width, @height} = options

    unless @textEditor?
      throw new Error('Cannot create a minimap without an editor')

    @id = nextModelId++
    @emitter = new Emitter
    @subscriptions = subs = new CompositeDisposable
    @initializeDecorations()

    if atom.views.getView(@textEditor).getScrollTop?
      @adapter = new BetaAdater(@textEditor)
    else
      @adapter = new LegacyAdater(@textEditor)

    if @standAlone
      @scrollTop = 0

    subs.add atom.config.observe 'editor.scrollPastEnd', (@scrollPastEnd) =>
      @adapter.scrollPastEnd = @scrollPastEnd
      @emitter.emit('did-change-config', {
        config: 'editor.scrollPastEnd'
        value: @scrollPastEnd
      })
    subs.add atom.config.observe 'minimap.charHeight', (@configCharHeight) =>
      @emitter.emit('did-change-config', {
        config: 'minimap.charHeight'
        value: @getCharHeight()
      })
    subs.add atom.config.observe 'minimap.charWidth', (@configCharWidth) =>
      @emitter.emit('did-change-config', {
        config: 'minimap.charWidth'
        value: @getCharWidth()
      })
    subs.add atom.config.observe 'minimap.interline', (@configInterline) =>
      @emitter.emit('did-change-config', {
        config: 'minimap.interline'
        value: @getInterline()
      })

    subs.add @adapter.onDidChangeScrollTop =>
      @emitter.emit('did-change-scroll-top', this) unless @standAlone
    subs.add @adapter.onDidChangeScrollLeft =>
      @emitter.emit('did-change-scroll-left', this) unless @standAlone

    subs.add @textEditor.onDidChange (changes) =>
      @emitChanges(changes)
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

  # Returns `true` when this `Minimap` has benn destroyed.
  #
  # Returns a {Boolean}.
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
  # changed or when the minimap scroll top have been changed in stand-alone
  # mode.
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

  # Calls the `callback` when the text editor stand-alone mode is modified
  #
  # callback - The callback {Function}. The event the callback will receive
  #            the {Minimap} as the sole argument.
  #
  # Returns a `Disposable`.
  onDidChangeStandAlone: (callback) ->
    @emitter.on 'did-change-stand-alone', callback


  # Calls the `callback` when this {Minimap} was destroyed.
  #
  # callback - The callback {Function}.
  #
  # Returns a `Disposable`.
  onDidDestroy: (callback) ->
    @emitter.on 'did-destroy', callback

  # Returns `true` when the minimap is in stand-alone mode.
  #
  # The stand-alone mode means that the minimap size won't be tied
  # to the `TextEditor` but based on the specified options instead.
  #
  # Returns a {Boolean}.
  isStandAlone: -> @standAlone

  # Sets the stand-alone mode for this minimap.
  #
  # standAlone - A {Boolean} of whether the minimap operates in stand-alone
  #              mode or not.
  setStandAlone: (standAlone) ->
    if standAlone isnt @standAlone
      @standAlone = standAlone
      @emitter.emit('did-change-stand-alone', this)

  # Returns the `TextEditor` that this minimap represents.
  #
  # Returns a `TextEditor`.
  getTextEditor: -> @textEditor

  # Returns the height of the `TextEditor` at the {Minimap} scale.
  #
  # Returns a {Number}.
  getTextEditorScaledHeight: ->
    @adapter.getHeight() * @getVerticalScaleFactor()

  # Returns the `TextEditor::getScrollTop` value at the {Minimap} scale.
  #
  # Returns a {Number}.
  getTextEditorScaledScrollTop: ->
    @adapter.getScrollTop() * @getVerticalScaleFactor()

  # Returns the `TextEditor::getScrollLeft` value at the {Minimap} scale.
  #
  # Returns a {Number}.
  getTextEditorScaledScrollLeft: ->
    @adapter.getScrollLeft() * @getHorizontalScaleFactor()

  # Returns the maximum scroll the `TextEditor` can perform.
  #
  # When the `scrollPastEnd` setting is enabled, the method compensate the
  # extra scroll by removing the same height as added by the editor from the
  # final value.
  #
  # Returns a {Number}.
  getTextEditorMaxScrollTop: -> @adapter.getMaxScrollTop()

  # Returns the scroll top of the `TextEditor`.
  #
  # Returns a {Number}.
  getTextEditorScrollTop: -> @adapter.getScrollTop()

  # Sets the scroll top of the `TextEditor`.
  #
  # scrollTop - The new scroll top {Number}.
  #
  # Returns a {Number}.
  setTextEditorScrollTop: (scrollTop) -> @adapter.setScrollTop(scrollTop)

  # Returns the scroll left of the `TextEditor`.
  #
  # Returns a {Number}.
  getTextEditorScrollLeft: -> @adapter.getScrollLeft()

  # Returns the height of the `TextEditor`.
  #
  # Returns a {Number}.
  getTextEditorHeight: -> @adapter.getHeight()

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
    @adapter.getScrollTop() / (@getTextEditorMaxScrollTop() || 1)

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

  # Returns the width of the whole minimap in pixels based on the `minimap`
  # settings.
  #
  # Returns a {Number}.
  getWidth: -> @textEditor.getMaxScreenLineLength() * @getCharWidth()

  # Returns the height the {Minimap} content will take on screen.
  #
  # When the {Minimap} height is greater than the `TextEditor` height, the
  # `TextEditor` height is returned instead.
  #
  # Returns a {Number}.
  getVisibleHeight: -> Math.min(@getScreenHeight(), @getHeight())

  # Returns the height the minimap should take once displayed, it's either the
  # height of the `TextEditor` or the provided `height` when in standAlone mode.
  #
  # Returns a {Number}.
  getScreenHeight: ->
    if @isStandAlone()
      if @height? then @height else @getHeight()
    else
      @adapter.getHeight()

  # Returns the width the whole {Minimap} will take on screen.
  #
  # Returns a {Number}.
  getVisibleWidth: ->
    Math.min(@getScreenWidth(), @getWidth())

  # Returns the width the minimap should take once displayed, it's either the
  # width of the minimap content or the provided `width` when in standAlone
  # mode.
  #
  # Returns a {Number}.
  getScreenWidth: ->
    if @isStandAlone() and @width? then @width else @getWidth()

  # Internal: Sets the preferred height and width when in stand-alone mode.
  #
  # This method is called by the {MinimapElement} for this {Minimap} so that
  # the model is kept in sync with the view.
  #
  # height - The height {Number} of pixels.
  # width - The width {Number} of pixels.
  setScreenHeightAndWidth: (@height, @width) ->

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
  getLineHeight: -> @getCharHeight() + @getInterline()

  # Returns the width of a character in the {Minimap} in pixels.
  #
  # Returns a {Number}.
  getCharWidth: -> @charWidth ? @configCharWidth

  # Sets the char width for this `Minimap`. This value will override the
  # value from the config for this instance only. A `did-change-config` event
  # is dispatched.
  #
  # charWidth - The char width {Number}.
  setCharWidth: (charWidth) ->
    @charWidth = Math.floor(charWidth)
    @emitter.emit('did-change-config')

  # Returns the height of a character in the {Minimap} in pixels.
  #
  # Returns a {Number}.
  getCharHeight: -> @charHeight ? @configCharHeight

  # Sets the char height for this `Minimap`. This value will override the
  # value from the config for this instance only. A `did-change-config` event
  # is dispatched.
  #
  # charHeight - The char height {Number}.
  setCharHeight: (charHeight) ->
    @charHeight = Math.floor(charHeight)
    @emitter.emit('did-change-config')

  # Returns the space between lines in the {Minimap} in pixels.
  #
  # Returns a {Number}.
  getInterline: -> @interline ? @configInterline

  # Sets the interline for this `Minimap`. This value will override the
  # value from the config for this instance only. A `did-change-config` event
  # is dispatched.
  #
  # interline - The interline {Number}.
  setInterline: (interline) ->
    @interline = Math.floor(interline)
    @emitter.emit('did-change-config')

  # Returns the index of the first visible row in the {Minimap}.
  #
  # Returns a {Number}.
  getFirstVisibleScreenRow: ->
    Math.floor(@getScrollTop() / @getLineHeight())

  # Returns the index of the last visible row in the {Minimap}.
  #
  # Returns a {Number}.
  getLastVisibleScreenRow: ->
    Math.ceil((@getScrollTop() + @getScreenHeight()) / @getLineHeight())

  # Returns the current scroll of the {Minimap}.
  #
  # The {Minimap} can scroll only when its height is greater that the height
  # of its `TextEditor`.
  #
  # Returns a {Number}.
  getScrollTop: ->
    if @standAlone
      @scrollTop
    else
      Math.abs(@getCapedTextEditorScrollRatio() * @getMaxScrollTop())

  # Sets the minimap scroll top value when in stand-alone mode.
  #
  # scrollTop - The {Number} of pixels of vertical scroll.
  setScrollTop: (@scrollTop) ->
    @emitter.emit('did-change-scroll-top', this) if @standAlone

  # Returns the maximum scroll value of the {Minimap}.
  #
  # Returns a {Number}.
  getMaxScrollTop: ->
    Math.max(0, @getHeight() - @getScreenHeight())

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

  # Internal:
  enableCache: -> @adapter.enableCache()

  # Internal:
  clearCache: -> @adapter.clearCache()
