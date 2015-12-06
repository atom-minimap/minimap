'use babel'

import {Emitter, CompositeDisposable} from 'atom'
import include from './mixins/include'
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

    let subs = this.subscriptions
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

  onDidChangeScrollTop (callback) {
    return this.emitter.on('did-change-scroll-top', callback)
  }

  onDidChangeScrollLeft (callback) {
    return this.emitter.on('did-change-scroll-left', callback)
  }

  onDidChangeStandAlone (callback) {
    return this.emitter.on('did-change-stand-alone', callback)
  }

  onDidDestroy (callback) {
    return this.emitter.on('did-destroy', callback)
  }

  isStandAlone () { return this.standAlone }

  setStandAlone (standAlone) {
    if (standAlone !== this.standAlone) {
      this.standAlone = standAlone
      this.emitter.emit('did-change-stand-alone', this)
    }
  }

  getTextEditor () { return this.textEditor }

  getTextEditorScaledHeight () {
    return this.adapter.getHeight() * this.getVerticalScaleFactor()
  }

  getTextEditorScaledScrollTop () {
    return this.adapter.getScrollTop() * this.getVerticalScaleFactor()
  }

  getTextEditorScaledScrollLeft () {
    return this.adapter.getScrollLeft() * this.getHorizontalScaleFactor()
  }

  getTextEditorMaxScrollTop () { return this.adapter.getMaxScrollTop() }

  getTextEditorScrollTop () { return this.adapter.getScrollTop() }

  setTextEditorScrollTop (scrollTop) { this.adapter.setScrollTop(scrollTop) }

  getTextEditorScrollLeft () { return this.adapter.getScrollLeft() }

  getTextEditorHeight () { return this.adapter.getHeight() }

  getTextEditorScrollRatio () {
    return this.adapter.getScrollTop() / (this.getTextEditorMaxScrollTop() || 1)
  }

  getCapedTextEditorScrollRatio () {
    return Math.min(1, this.getTextEditorScrollRatio())
  }

  getHeight () {
    return this.textEditor.getScreenLineCount() * this.getLineHeight()
  }

  getWidth () {
    return this.textEditor.getMaxScreenLineLength() * this.getCharWidth()
  }

  getVisibleHeight () {
    return Math.min(this.getScreenHeight(), this.getHeight())
  }

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

  getVisibleWidth () {
    return Math.min(this.getScreenWidth(), this.getWidth())
  }

  getScreenWidth () {
    if (this.isStandAlone() && this.width != null) {
      return this.width
    } else {
      return this.getWidth()
    }
  }

  setScreenHeightAndWidth (height, width) {
    this.height = height
    this.width = width
  }

  getVerticalScaleFactor () {
    return this.getLineHeight() / this.textEditor.getLineHeightInPixels()
  }

  getHorizontalScaleFactor () {
    return this.getCharWidth() / this.textEditor.getDefaultCharWidth()
  }

  getLineHeight () { return this.getCharHeight() + this.getInterline() }

  getCharWidth () {
    if (this.charWidth != null) {
      return this.charWidth
    } else {
      return this.configCharWidth
    }
  }

  setCharWidth (charWidth) {
    this.charWidth = Math.floor(charWidth)
    this.emitter.emit('did-change-config')
  }

  getCharHeight () {
    if (this.charHeight != null) {
      return this.charHeight
    } else {
      return this.configCharHeight
    }
  }

  setCharHeight (charHeight) {
    this.charHeight = Math.floor(charHeight)
    this.emitter.emit('did-change-config')
  }

  getInterline () {
    if (this.interline != null) {
      return this.interline
    } else {
      return this.configInterline
    }
  }

  setInterline (interline) {
    this.interline = Math.floor(interline)
    this.emitter.emit('did-change-config')
  }

  getFirstVisibleScreenRow () {
    return Math.floor(this.getScrollTop() / this.getLineHeight())
  }

  getLastVisibleScreenRow () {
    return Math.ceil(
      (this.getScrollTop() + this.getScreenHeight()) / this.getLineHeight()
    )
  }

  getScrollTop () {
    if (this.standAlone) {
      return this.scrollTop
    } else {
      return Math.abs(
        this.getCapedTextEditorScrollRatio() * this.getMaxScrollTop()
      )
    }
  }

  setScrollTop (scrollTop) {
    this.scrollTop = scrollTop
    if (this.standAlone) { this.emitter.emit('did-change-scroll-top', this) }
  }

  getMaxScrollTop () {
    return Math.max(0, this.getHeight() - this.getScreenHeight())
  }

  canScroll () { return this.getMaxScrollTop() > 0 }

  getMarker (id) { return this.textEditor.getMarker(id) }

  findMarkers (o) {
    try {
      return this.textEditor.findMarkers(o)
    } catch (error) {
      return []
    }
  }

  markBufferRange (range) { return this.textEditor.markBufferRange(range) }

  emitChanges (changes) { this.emitter.emit('did-change', changes) }

  enableCache () { this.adapter.enableCache() }

  clearCache () { this.adapter.clearCache() }
}
