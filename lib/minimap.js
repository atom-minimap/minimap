'use babel'

import { Emitter, CompositeDisposable } from 'atom'
import include from './decorators/include'
import DecorationManagement from './mixins/decoration-management'
import LegacyAdater from './adapters/legacy-adapter'
import StableAdapter from './adapters/stable-adapter'

let nextModelId = 1

/**
 * The Minimap class is the underlying model of a <MinimapElement>.
 * Most manipulations of the minimap is done through the model.
 *
 * Any Minimap instance is tied to a `TextEditor`.
 * Their lifecycle follow the one of their target `TextEditor`, so they are
 * destroyed whenever their `TextEditor` is destroyed.
 */
@include(DecorationManagement)
export default class Minimap {
  /**
   * Creates a new Minimap instance for the given `TextEditor`.
   *
   * @param  {Object} options an object with the new Minimap properties
   * @param  {TextEditor} options.textEditor the target text editor for
   *                                         the minimap
   * @param  {boolean} [options.standAlone] whether this minimap is in
   *                                        stand-alone mode or not
   * @param  {number} [options.width] the minimap width in pixels
   * @param  {number} [options.height] the minimap height in pixels
   * @throws {Error} Cannot create a minimap without an editor
   */
  constructor (options = {}) {
    if (!options.textEditor) {
      throw new Error('Cannot create a minimap without an editor')
    }

    /**
     * The Minimap's text editor.
     *
     * @type {TextEditor}
     * @access private
     */
    this.textEditor = options.textEditor
    /**
     * The stand-alone state of the current Minimap.
     *
     * @type {boolean}
     * @access private
     */
    this.standAlone = options.standAlone
    /**
     * The width of the current Minimap.
     *
     * @type {number}
     * @access private
     */
    this.width = options.width
    /**
     * The height of the current Minimap.
     *
     * @type {number}
     * @access private
     */
    this.height = options.height
    /**
     * The id of the current Minimap.
     *
     * @type {Number}
     * @access private
     */
    this.id = nextModelId++
    /**
     * The events emitter of the current Minimap.
     *
     * @type {Emitter}
     * @access private
     */
    this.emitter = new Emitter()
    /**
     * The Minimap's subscriptions.
     *
     * @type {CompositeDisposable}
     * @access private
     */
    this.subscriptions = new CompositeDisposable()
    /**
     * The adapter object leverage the access to several properties from
     * the `TextEditor`/`TextEditorElement` to support the different APIs
     * between different version of Atom.
     *
     * @type {Object}
     * @access private
     */
    this.adapter = null
    /**
     * The char height of the current Minimap, will be `undefined` unless
     * `setCharWidth` is called.
     *
     * @type {number}
     * @access private
     */
    this.charHeight = null
    /**
     * The char height from the package's configuration. Will be overriden
     * by the instance value.
     *
     * @type {number}
     * @access private
     */
    this.configCharHeight = null
    /**
     * The char width of the current Minimap, will be `undefined` unless
     * `setCharWidth` is called.
     *
     * @type {number}
     * @access private
     */
    this.charWidth = null
    /**
     * The char width from the package's configuration. Will be overriden
     * by the instance value.
     *
     * @type {number}
     * @access private
     */
    this.configCharWidth = null
    /**
     * The interline of the current Minimap, will be `undefined` unless
     * `setCharWidth` is called.
     *
     * @type {number}
     * @access private
     */
    this.interline = null
    /**
     * The interline from the package's configuration. Will be overriden
     * by the instance value.
     *
     * @type {number}
     * @access private
     */
    this.configInterline = null
    /**
     * A boolean value to store whether this Minimap have been destroyed or not.
     *
     * @type {boolean}
     * @access private
     */
    this.destroyed = false
    /**
     * A boolean value to store whether the `scrollPastEnd` setting is enabled
     * or not.
     *
     * @type {boolean}
     * @access private
     */
    this.scrollPastEnd = false

    this.initializeDecorations()

    if (atom.views.getView(this.textEditor).getScrollTop != null) {
      this.adapter = new StableAdapter(this.textEditor)
    } else {
      this.adapter = new LegacyAdater(this.textEditor)
    }

    if (this.standAlone) {
      /**
       * When in stand-alone mode, a Minimap doesn't scroll and will use this
       * value instead.
       *
       * @type {number}
       * @access private
       */
      this.scrollTop = 0
    }

    const subs = this.subscriptions
    subs.add(atom.config.observe('editor.scrollPastEnd', (scrollPastEnd) => {
      this.scrollPastEnd = scrollPastEnd
      this.adapter.scrollPastEnd = this.scrollPastEnd
      this.emitter.emit('did-change-config')
    }))
    subs.add(atom.config.observe('minimap.charHeight', (configCharHeight) => {
      this.configCharHeight = configCharHeight
      this.emitter.emit('did-change-config')
    }))
    subs.add(atom.config.observe('minimap.charWidth', (configCharWidth) => {
      this.configCharWidth = configCharWidth
      this.emitter.emit('did-change-config')
    }))
    subs.add(atom.config.observe('minimap.interline', (configInterline) => {
      this.configInterline = configInterline
      this.emitter.emit('did-change-config')
    }))

    subs.add(this.adapter.onDidChangeScrollTop(() => {
      if (!this.standAlone) {
        this.emitter.emit('did-change-scroll-top', this)
      }
    }))
    subs.add(this.adapter.onDidChangeScrollLeft(() => {
      if (!this.standAlone) {
        this.emitter.emit('did-change-scroll-left', this)
      }
    }))

    subs.add(this.textEditor.onDidChange((changes) => {
      this.emitChanges(changes)
    }))
    subs.add(this.textEditor.onDidDestroy(() => { this.destroy() }))

    /*
    FIXME Some changes occuring during the tokenization produces
    ranges that deceive the canvas rendering by making some
    lines at the end of the buffer intact while they are in fact not,
    resulting in extra lines appearing at the end of the minimap.
    Forcing a whole repaint to fix that bug is suboptimal but works.
    */
    subs.add(this.textEditor.displayBuffer.onDidTokenize(() => {
      this.emitter.emit('did-change-config')
    }))
  }

  /**
   * Destroys the model.
   */
  destroy () {
    if (this.destroyed) { return }

    this.removeAllDecorations()
    this.subscriptions.dispose()
    this.subscriptions = null
    this.textEditor = null
    this.emitter.emit('did-destroy')
    this.emitter.dispose()
    this.destroyed = true
  }

  /**
   * Returns `true` when this `Minimap` has benn destroyed.
   *
   * @return {boolean} whether this Minimap has been destroyed or not
   */
  isDestroyed () { return this.destroyed }

  /**
   * Registers an event listener to the `did-change` event.
   *
   * @param  {function(event:Object):void} callback a function to call when the
   *                                                event is triggered.
   *                                                the callback will be called
   *                                                with an event object with
   *                                                the following properties:
   * - start: The change's start row number
   * - end: The change's end row number
   * - screenDelta: the delta in buffer rows between the versions before and
   *   after the change
   * @return {Disposable} a disposable to stop listening to the event
   */
  onDidChange (callback) {
    return this.emitter.on('did-change', callback)
  }

  /**
   * Registers an event listener to the `did-change-config` event.
   *
   * @param  {function():void} callback a function to call when the event
   *                                    is triggered.
   * @return {Disposable} a disposable to stop listening to the event
   */
  onDidChangeConfig (callback) {
    return this.emitter.on('did-change-config', callback)
  }

  /**
   * Registers an event listener to the `did-change-scroll-top` event.
   *
   * The event is dispatched when the text editor `scrollTop` value have been
   * changed or when the minimap scroll top have been changed in stand-alone
   * mode.
   *
   * @param  {function(minimap:Minimap):void} callback a function to call when
   *                                                   the event is triggered.
   *                                                   The current Minimap is
   *                                                   passed as argument to
   *                                                   the callback.
   * @return {Disposable} a disposable to stop listening to the event
   */
  onDidChangeScrollTop (callback) {
    return this.emitter.on('did-change-scroll-top', callback)
  }

  /**
   * Registers an event listener to the `did-change-scroll-left` event.
   *
   * @param  {function(minimap:Minimap):void} callback a function to call when
   *                                                   the event is triggered.
   *                                                   The current Minimap is
   *                                                   passed as argument to
   *                                                   the callback.
   * @return {Disposable} a disposable to stop listening to the event
   */
  onDidChangeScrollLeft (callback) {
    return this.emitter.on('did-change-scroll-left', callback)
  }

  /**
   * Registers an event listener to the `did-change-stand-alone` event.
   *
   * This event is dispatched when the stand-alone of the current Minimap
   * is either enabled or disabled.
   *
   * @param  {function(minimap:Minimap):void} callback a function to call when
   *                                                   the event is triggered.
   *                                                   The current Minimap is
   *                                                   passed as argument to
   *                                                   the callback.
   * @return {Disposable} a disposable to stop listening to the event
   */
  onDidChangeStandAlone (callback) {
    return this.emitter.on('did-change-stand-alone', callback)
  }

  /**
   * Registers an event listener to the `did-destroy` event.
   *
   * This event is dispatched when this Minimap have been destroyed. It can
   * occurs either because the {@link destroy} method have been called on the
   * Minimap or because the target text editor have been destroyed.
   *
   * @param  {function():void} callback a function to call when the event
   *                                    is triggered.
   * @return {Disposable} a disposable to stop listening to the event
   */
  onDidDestroy (callback) {
    return this.emitter.on('did-destroy', callback)
  }

  /**
   * Returns `true` when the current Minimap is a stand-alone minimap.
   *
   * @return {boolean} whether this Minimap is in stand-alone mode or not.
   */
  isStandAlone () { return this.standAlone }

  /**
   * Sets the stand-alone mode for this minimap.
   *
   * @param {boolean} standAlone the new state of the stand-alone mode for this
   *                             Minimap
   * @emits {did-change-stand-alone} if the stand-alone mode have been toggled
   *        on or off by the call
   */
  setStandAlone (standAlone) {
    if (standAlone !== this.standAlone) {
      this.standAlone = standAlone
      this.emitter.emit('did-change-stand-alone', this)
    }
  }

  /**
   * Returns the `TextEditor` that this minimap represents.
   *
   * @return {TextEditor} this Minimap's text editor
   */
  getTextEditor () { return this.textEditor }

  /**
   * Returns the height of the `TextEditor` at the Minimap scale.
   *
   * @return {number} the scaled height of the text editor
   */
  getTextEditorScaledHeight () {
    return this.adapter.getHeight() * this.getVerticalScaleFactor()
  }

  /**
   * Returns the `TextEditor` scroll top value at the Minimap scale.
   *
   * @return {number} the scaled scroll top of the text editor
   */
  getTextEditorScaledScrollTop () {
    return this.adapter.getScrollTop() * this.getVerticalScaleFactor()
  }

  /**
   * Returns the `TextEditor` scroll left value at the Minimap scale.
   *
   * @return {number} the scaled scroll left of the text editor
   */
  getTextEditorScaledScrollLeft () {
    return this.adapter.getScrollLeft() * this.getHorizontalScaleFactor()
  }

  /**
   * Returns the `TextEditor` maximum scroll top value.
   *
   * When the `scrollPastEnd` setting is enabled, the method compensate the
   * extra scroll by removing the same height as added by the editor from the
   * final value.
   *
   * @return {number} the maximum scroll top of the text editor
   */
  getTextEditorMaxScrollTop () { return this.adapter.getMaxScrollTop() }

  /**
   * Returns the `TextEditor` scroll top value.
   *
   * @return {number} the scroll top of the text editor
   */
  getTextEditorScrollTop () { return this.adapter.getScrollTop() }

  /**
   * Sets the scroll top of the `TextEditor`.
   *
   * @param {number} scrollTop the new scroll top value
   */
  setTextEditorScrollTop (scrollTop) { this.adapter.setScrollTop(scrollTop) }

  /**
   * Returns the `TextEditor` scroll left value.
   *
   * @return {number} the scroll left of the text editor
   */
  getTextEditorScrollLeft () { return this.adapter.getScrollLeft() }

  /**
   * Returns the height of the `TextEditor`.
   *
   * @return {number} the height of the text editor
   */
  getTextEditorHeight () { return this.adapter.getHeight() }

  /**
   * Returns the `TextEditor` scroll as a value normalized between `0` and `1`.
   *
   * When the `scrollPastEnd` setting is enabled the value may exceed `1` as the
   * maximum scroll value used to compute this ratio compensate for the extra
   * height in the editor. **Use {@link getCapedTextEditorScrollRatio} when
   * you need a value that is strictly between `0` and `1`.**
   *
   * @return {number} the scroll ratio of the text editor
   */
  getTextEditorScrollRatio () {
    return this.adapter.getScrollTop() / (this.getTextEditorMaxScrollTop() || 1)
  }

  /**
   * Returns the `TextEditor` scroll as a value normalized between `0` and `1`.
   *
   * The returned value will always be strictly between `0` and `1`.
   *
   * @return {number} the scroll ratio of the text editor strictly between
   *                  0 and 1
   */
  getCapedTextEditorScrollRatio () {
    return Math.min(1, this.getTextEditorScrollRatio())
  }

  /**
   * Returns the height of the whole minimap in pixels based on the `minimap`
   * settings.
   *
   * @return {number} the height of the minimap
   */
  getHeight () {
    return this.textEditor.getScreenLineCount() * this.getLineHeight()
  }

  /**
   * Returns the width of the whole minimap in pixels based on the `minimap`
   * settings.
   *
   * @return {number} the width of the minimap
   */
  getWidth () {
    return this.textEditor.getMaxScreenLineLength() * this.getCharWidth()
  }

  /**
   * Returns the height the Minimap content will take on screen.
   *
   * When the Minimap height is greater than the `TextEditor` height, the
   * `TextEditor` height is returned instead.
   *
   * @return {number} the visible height of the Minimap
   */
  getVisibleHeight () {
    return Math.min(this.getScreenHeight(), this.getHeight())
  }

  /**
   * Returns the height the minimap should take once displayed, it's either
   * the height of the `TextEditor` or the provided `height` when in stand-alone
   * mode.
   *
   * @return {number} the total height of the Minimap
   */
  getScreenHeight () {
    if (this.isStandAlone()) {
      if (this.height != null) {
        return this.height
      } else {
        return this.getHeight()
      }
    } else {
      return this.adapter.getHeight()
    }
  }

  /**
   * Returns the width the whole Minimap will take on screen.
   *
   * @return {number} the width of the Minimap when displayed
   */
  getVisibleWidth () {
    return Math.min(this.getScreenWidth(), this.getWidth())
  }

  /**
   * Returns the width the Minimap should take once displayed, it's either the
   * width of the Minimap content or the provided `width` when in standAlone
   * mode.
   *
   * @return {number} the Minimap screen width
   */
  getScreenWidth () {
    if (this.isStandAlone() && this.width != null) {
      return this.width
    } else {
      return this.getWidth()
    }
  }

  /**
   * Sets the preferred height and width when in stand-alone mode.
   *
   * This method is called by the <MinimapElement> for this Minimap so that
   * the model is kept in sync with the view.
   *
   * @param {number} height the new height of the Minimap
   * @param {number} width the new width of the Minimap
   */
  setScreenHeightAndWidth (height, width) {
    this.height = height
    this.width = width
  }

  /**
   * Returns the vertical scaling factor when converting coordinates from the
   * `TextEditor` to the Minimap.
   *
   * @return {number} the Minimap vertical scaling factor
   */
  getVerticalScaleFactor () {
    return this.getLineHeight() / this.textEditor.getLineHeightInPixels()
  }

  /**
   * Returns the horizontal scaling factor when converting coordinates from the
   * `TextEditor` to the Minimap.
   *
   * @return {number} the Minimap horizontal scaling factor
   */
  getHorizontalScaleFactor () {
    return this.getCharWidth() / this.textEditor.getDefaultCharWidth()
  }

  /**
   * Returns the height of a line in the Minimap in pixels.
   *
   * @return {number} a line's height in the Minimap
   */
  getLineHeight () { return this.getCharHeight() + this.getInterline() }

  /**
   * Returns the width of a character in the Minimap in pixels.
   *
   * @return {number} a character's width in the Minimap
   */
  getCharWidth () {
    if (this.charWidth != null) {
      return this.charWidth
    } else {
      return this.configCharWidth
    }
  }

  /**
   * Sets the char width for this Minimap. This value will override the
   * value from the config for this instance only. A `did-change-config`
   * event is dispatched.
   *
   * @param {number} charWidth the new width of a char in the Minimap
   * @emits {did-change-config} when the value is changed
   */
  setCharWidth (charWidth) {
    this.charWidth = Math.floor(charWidth)
    this.emitter.emit('did-change-config')
  }

  /**
   * Returns the height of a character in the Minimap in pixels.
   *
   * @return {number} a character's height in the Minimap
   */
  getCharHeight () {
    if (this.charHeight != null) {
      return this.charHeight
    } else {
      return this.configCharHeight
    }
  }

  /**
   * Sets the char height for this Minimap. This value will override the
   * value from the config for this instance only. A `did-change-config`
   * event is dispatched.
   *
   * @param {number} charHeight the new height of a char in the Minimap
   * @emits {did-change-config} when the value is changed
   */
  setCharHeight (charHeight) {
    this.charHeight = Math.floor(charHeight)
    this.emitter.emit('did-change-config')
  }

  /**
   * Returns the height of an interline in the Minimap in pixels.
   *
   * @return {number} the interline's height in the Minimap
   */
  getInterline () {
    if (this.interline != null) {
      return this.interline
    } else {
      return this.configInterline
    }
  }

  /**
   * Sets the interline height for this Minimap. This value will override the
   * value from the config for this instance only. A `did-change-config`
   * event is dispatched.
   *
   * @param {number} interline the new height of an interline in the Minimap
   * @emits {did-change-config} when the value is changed
   */
  setInterline (interline) {
    this.interline = Math.floor(interline)
    this.emitter.emit('did-change-config')
  }

  /**
   * Returns the index of the first visible row in the Minimap.
   *
   * @return {number} the index of the first visible row
   */
  getFirstVisibleScreenRow () {
    return Math.floor(this.getScrollTop() / this.getLineHeight())
  }

  /**
   * Returns the index of the last visible row in the Minimap.
   *
   * @return {number} the index of the last visible row
   */
  getLastVisibleScreenRow () {
    return Math.ceil(
      (this.getScrollTop() + this.getScreenHeight()) / this.getLineHeight()
    )
  }

  /**
   * Returns the current scroll of the Minimap.
   *
   * The Minimap can scroll only when its height is greater that the height
   * of its `TextEditor`.
   *
   * @return {number} the scroll top of the Minimap
   */
  getScrollTop () {
    if (this.standAlone) {
      return this.scrollTop
    } else {
      return Math.abs(
        this.getCapedTextEditorScrollRatio() * this.getMaxScrollTop()
      )
    }
  }

  /**
   * Sets the minimap scroll top value when in stand-alone mode.
   *
   * @param {number} scrollTop the new scroll top for the Minimap
   * @emits {did-change-scroll-top} if the Minimap's stand-alone mode is enabled
   */
  setScrollTop (scrollTop) {
    this.scrollTop = scrollTop
    if (this.standAlone) {
      this.emitter.emit('did-change-scroll-top', this)
    }
  }

  /**
   * Returns the maximum scroll value of the Minimap.
   *
   * @return {number} the maximum scroll top for the Minimap
   */
  getMaxScrollTop () {
    return Math.max(0, this.getHeight() - this.getScreenHeight())
  }

  /**
   * Returns `true` when the Minimap can scroll.
   *
   * @return {boolean} whether this Minimap can scroll or not
   */
  canScroll () { return this.getMaxScrollTop() > 0 }

  /**
   * Delegates to `TextEditor#getMarker`.
   *
   * @access private
   */
  getMarker (id) { return this.textEditor.getMarker(id) }

  /**
   * Delegates to `TextEditor#findMarkers`.
   *
   * @access private
   */
  findMarkers (o) {
    try {
      return this.textEditor.findMarkers(o)
    } catch (error) {
      return []
    }
  }

  /**
   * Delegates to `TextEditor#markBufferRange`.
   *
   * @access private
   */
  markBufferRange (range) { return this.textEditor.markBufferRange(range) }

  /**
   * Emits a change events with the passed-in changes as data.
   *
   * @param  {Object} changes a change to dispatch
   * @access private
   */
  emitChanges (changes) { this.emitter.emit('did-change', changes) }

  /**
   * Enables the cache at the adapter level to avoid consecutive access to the
   * text editor API during a render phase.
   *
   * @access private
   */
  enableCache () { this.adapter.enableCache() }

  /**
   * Disable the adapter cache.
   *
   * @access private
   */
  clearCache () { this.adapter.clearCache() }
}
