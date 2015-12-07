'use babel'

import {CompositeDisposable, Disposable} from 'atom'
import {EventsDelegation, AncestorsMethods} from 'atom-utils'
import include from './decorators/include'
import element from './decorators/element'
import DOMStylesReader from './mixins/dom-styles-reader'
import CanvasDrawer from './mixins/canvas-drawer'
import MinimapQuickSettingsElement from './minimap-quick-settings-element'

const SPEC_MODE = atom.inSpecMode()

// Public: The {MinimapElement} is the view meant to render a {Minimap} instance
// in the DOM.
//
// You can retrieve the {MinimapElement} associated to a {Minimap} as
// demonstrated below:
//
// ```coffee
// minimapElement = atom.views.getView(minimap)
// ```
//
// Note that most interactions with the Minimap package is done through the
// {Minimap} model so you should never have to access {MinimapElement} instances.
@element('atom-text-editor-minimap')
@include(DOMStylesReader, CanvasDrawer, EventsDelegation, AncestorsMethods)
export default class MinimapElement {

  static registerViewProvider () {
    atom.views.addViewProvider(require('./minimap'), function (model) {
      var element = new MinimapElement()
      element.setModel(model)
      return element
    })
  }

  //    ##     ##  #######   #######  ##    ##  ######
  //    ##     ## ##     ## ##     ## ##   ##  ##    ##
  //    ##     ## ##     ## ##     ## ##  ##   ##
  //    ######### ##     ## ##     ## #####     ######
  //    ##     ## ##     ## ##     ## ##  ##         ##
  //    ##     ## ##     ## ##     ## ##   ##  ##    ##
  //    ##     ##  #######   #######  ##    ##  ######

  // Internal: DOM callback invoked when a new {MinimapElement} is created.
  createdCallback () {
    this.displayMinimapOnLeft = false
    this.subscriptions = new CompositeDisposable()
    this.initializeContent()

    return this.observeConfig({
      'minimap.displayMinimapOnLeft': (displayMinimapOnLeft) => {
        this.displayMinimapOnLeft = displayMinimapOnLeft

        this.updateMinimapFlexPosition()
      },

      'minimap.minimapScrollIndicator': (minimapScrollIndicator) => {
        this.minimapScrollIndicator = minimapScrollIndicator
        if (this.minimapScrollIndicator && !(this.scrollIndicator != null) && !this.standAlone) {
          this.initializeScrollIndicator()
        } else if ((this.scrollIndicator != null)) {
          this.disposeScrollIndicator()
        }

        if (this.attached) { this.requestUpdate() }
      },

      'minimap.displayPluginsControls': (displayPluginsControls) => {
        this.displayPluginsControls = displayPluginsControls
        if (this.displayPluginsControls && !(this.openQuickSettings != null) && !this.standAlone) {
          this.initializeOpenQuickSettings()
        } else if ((this.openQuickSettings != null)) {
          this.disposeOpenQuickSettings()
        }
      },

      'minimap.textOpacity': (textOpacity) => {
        this.textOpacity = textOpacity
        if (this.attached) { this.requestForcedUpdate() }
      },

      'minimap.displayCodeHighlights': (displayCodeHighlights) => {
        this.displayCodeHighlights = displayCodeHighlights
        if (this.attached) { this.requestForcedUpdate() }
      },

      'minimap.adjustMinimapWidthToSoftWrap': (adjustToSoftWrap) => {
        this.adjustToSoftWrap = adjustToSoftWrap
        if (this.attached) { this.measureHeightAndWidth() }
      },

      'minimap.useHardwareAcceleration': (useHardwareAcceleration) => {
        this.useHardwareAcceleration = useHardwareAcceleration
        if (this.attached) { this.requestUpdate() }
      },

      'minimap.absoluteMode': (absoluteMode) => {
        this.absoluteMode = absoluteMode
        return this.classList.toggle('absolute', this.absoluteMode)
      },

      'editor.preferredLineLength': () => {
        if (this.attached) { this.measureHeightAndWidth() }
      },

      'editor.softWrap': () => {
        if (this.attached) { this.requestUpdate() }
      },

      'editor.softWrapAtPreferredLineLength': () => {
        if (this.attached) { this.requestUpdate() }
      }
    })
  }

  // Internal: DOM callback invoked when a new {MinimapElement} is attached
  // to the DOM.
  attachedCallback () {
    this.subscriptions.add(atom.views.pollDocument(() => { this.pollDOM() }))
    this.measureHeightAndWidth()
    this.updateMinimapFlexPosition()
    this.attached = true
    this.attachedToTextEditor = this.parentNode === this.getTextEditorElementRoot()

    // Uses of `atom.styles.onDidAddStyleElement` instead of
    // `atom.themes.onDidChangeActiveThemes`.
    // Why?
    // Currently, The styleElement will be removed first,
    // and then re-add. So the `change` event has not be triggered.
    return this.subscriptions.add(atom.styles.onDidAddStyleElement(() => {
      this.invalidateDOMStylesCache()
      this.requestForcedUpdate()
    }))
  }

  // Internal: DOM callback invoked when a new {MinimapElement} is detached
  // from the DOM.
  detachedCallback () {
    this.attached = false
  }

  //       ###    ######## ########    ###     ######  ##     ##
  //      ## ##      ##       ##      ## ##   ##    ## ##     ##
  //     ##   ##     ##       ##     ##   ##  ##       ##     ##
  //    ##     ##    ##       ##    ##     ## ##       #########
  //    #########    ##       ##    ######### ##       ##     ##
  //    ##     ##    ##       ##    ##     ## ##    ## ##     ##
  //    ##     ##    ##       ##    ##     ##  ######  ##     ##

  // Returns `true` if the {MinimapElement} is currently visible on screen.
  //
  // Returns a {Boolean}.
  isVisible () { return this.offsetWidth > 0 || this.offsetHeight > 0 }

  // Attaches the {MinimapElement} to the DOM.
  //
  // The position at which the element is attached is defined by the
  // `displayMinimapOnLeft` setting.
  attach (parent) {
    if (this.attached) { return }
    (parent || this.getTextEditorElementRoot()).appendChild(this)
  }

  // Detaches the {MinimapElement} from the DOM.
  detach () {
    if (!this.attached) { return }
    if (!(this.parentNode != null)) { return }
    this.parentNode.removeChild(this)
  }

  // Toggles the minimap left/right position based on the value of the
  // `displayMinimapOnLeft` setting.
  updateMinimapFlexPosition () {
    this.classList.toggle('left', this.displayMinimapOnLeft)
  }

  // Destroys this {MinimapElement}.
  destroy () {
    this.subscriptions.dispose()
    this.detach()
    this.minimap = null
  }

  //     ######   #######  ##    ## ######## ######## ##    ## ########
  //    ##    ## ##     ## ###   ##    ##    ##       ###   ##    ##
  //    ##       ##     ## ####  ##    ##    ##       ####  ##    ##
  //    ##       ##     ## ## ## ##    ##    ######   ## ## ##    ##
  //    ##       ##     ## ##  ####    ##    ##       ##  ####    ##
  //    ##    ## ##     ## ##   ###    ##    ##       ##   ###    ##
  //     ######   #######  ##    ##    ##    ######## ##    ##    ##

  // Internal: Creates the content of the {MinimapElement} and attaches the
  // mouse control event listeners.
  initializeContent () {
    this.initializeCanvas()

    this.shadowRoot = this.createShadowRoot()

    this.shadowRoot.appendChild(this.canvas)

    this.createVisibleArea()
    this.createControls()

    this.subscriptions.add(this.subscribeTo(this, {
      'mousewheel': (e) => {
        if (!this.standAlone) { this.relayMousewheelEvent(e) }
      }
    }))

    this.subscriptions.add(this.subscribeTo(this.canvas, {
      'mousedown': (e) => { this.mousePressedOverCanvas(e) }
    }))
  }

  // Initializes the visible area div.
  createVisibleArea () {
    if (this.visibleArea) { return }

    this.visibleArea = document.createElement('div')
    this.visibleArea.classList.add('minimap-visible-area')
    this.shadowRoot.appendChild(this.visibleArea)

    this.visibleAreaSubscription = this.subscribeTo(this.visibleArea, {
      'mousedown': (e) => { this.startDrag(e) },
      'touchstart': (e) => { this.startDrag(e) }
    })

    this.subscriptions.add(this.visibleAreaSubscription)
  }

  // Removes the visible area div.
  removeVisibleArea () {
    if (!this.visibleArea) { return }

    this.subscriptions.remove(this.visibleAreaSubscription)
    this.visibleAreaSubscription.dispose()
    this.shadowRoot.removeChild(this.visibleArea)
    delete this.visibleArea
  }

  // Creates the controls container div.
  createControls () {
    if (this.controls || this.standAlone) { return }

    this.controls = document.createElement('div')
    this.controls.classList.add('minimap-controls')
    this.shadowRoot.appendChild(this.controls)
  }

  removeControls () {
    if (!this.controls) { return }

    this.shadowRoot.removeChild(this.controls)
    delete this.controls
  }

  // Initializes the scroll indicator div when the `minimapScrollIndicator`
  // settings is enabled.
  initializeScrollIndicator () {
    if (this.scrollIndicator || this.standAlone) { return }

    this.scrollIndicator = document.createElement('div')
    this.scrollIndicator.classList.add('minimap-scroll-indicator')
    this.controls.appendChild(this.scrollIndicator)
  }

  // Disposes the scroll indicator div when the `minimapScrollIndicator`
  // settings is disabled.
  disposeScrollIndicator () {
    if (!this.scrollIndicator) { return }

    this.controls.removeChild(this.scrollIndicator)
    delete this.scrollIndicator
  }

  // Initializes the quick settings openener div when the
  // `displayPluginsControls` setting is enabled.
  initializeOpenQuickSettings () {
    if (this.openQuickSettings || this.standAlone) { return }

    this.openQuickSettings = document.createElement('div')
    this.openQuickSettings.classList.add('open-minimap-quick-settings')
    this.controls.appendChild(this.openQuickSettings)
    this.openQuickSettingSubscription = this.subscribeTo(this.openQuickSettings, {
      'mousedown': (e) => {
        e.preventDefault()
        e.stopPropagation()

        if ((this.quickSettingsElement != null)) {
          this.quickSettingsElement.destroy()
          this.quickSettingsSubscription.dispose()
        } else {
          this.quickSettingsElement = new MinimapQuickSettingsElement()
          this.quickSettingsElement.setModel(this)
          this.quickSettingsSubscription = this.quickSettingsElement.onDidDestroy(() => {
            this.quickSettingsElement = null
          })

          var {top, left, right} = this.canvas.getBoundingClientRect()
          this.quickSettingsElement.style.top = top + 'px'
          this.quickSettingsElement.attach()

          if (this.displayMinimapOnLeft) {
            this.quickSettingsElement.style.left = (right) + 'px'
          } else {
            this.quickSettingsElement.style.left = (left - this.quickSettingsElement.clientWidth) + 'px'
          }
        }
      }
    })
  }

  // Disposes the quick settings openener div when the
  // `displayPluginsControls` setting is disabled.
  disposeOpenQuickSettings () {
    if (!this.openQuickSettings) { return }

    this.controls.removeChild(this.openQuickSettings)
    this.openQuickSettingSubscription.dispose()
    delete this.openQuickSettings
  }

  // Returns the target {TextEditor} of the {Minimap}.
  //
  // Returns a {TextEditor}.
  getTextEditor () { return this.minimap.getTextEditor() }

  // Returns the {TextEditorElement} for the {Minimap}'s {TextEditor}.
  //
  // Returns a {TextEditorElement}.
  getTextEditorElement () {
    if (this.editorElement) { return this.editorElement }

    this.editorElement = atom.views.getView(this.getTextEditor())
    return this.editorElement
  }

  // Internal: Returns the root of the {TextEditorElement} content.
  // This method is mostly used to ensure compatibility with the `shadowDom`
  // setting.
  //
  // Returns an {HTMLElement}.
  getTextEditorElementRoot () {
    let editorElement = this.getTextEditorElement()

    if (editorElement.shadowRoot) {
      return editorElement.shadowRoot
    } else {
      return editorElement
    }
  }

  // Internal: Returns the root where to inject the dummy node used to read
  // DOM styles.
  //
  // Returns an {HTMLElement}.
  getDummyDOMRoot (shadowRoot) {
    if (shadowRoot) {
      return this.getTextEditorElementRoot()
    } else {
      return this.getTextEditorElement()
    }
  }

  //    ##     ##  #######  ########  ######## ##
  //    ###   ### ##     ## ##     ## ##       ##
  //    #### #### ##     ## ##     ## ##       ##
  //    ## ### ## ##     ## ##     ## ######   ##
  //    ##     ## ##     ## ##     ## ##       ##
  //    ##     ## ##     ## ##     ## ##       ##
  //    ##     ##  #######  ########  ######## ########

  // Returns the {Minimap} for which this {MinimapElement} was created.
  //
  // Returns a {Minimap}.
  getModel () { return this.minimap }

  // Defines the {Minimap} model for this {MinimapElement} instance.
  //
  // minimap - The {Minimap} model for this instance.
  setModel (minimap) {
    this.minimap = minimap
    this.subscriptions.add(this.minimap.onDidChangeScrollTop(() => {
      this.requestUpdate()
    }))
    this.subscriptions.add(this.minimap.onDidChangeScrollLeft(() => {
      this.requestUpdate()
    }))
    this.subscriptions.add(this.minimap.onDidDestroy(() => {
      this.destroy()
    }))
    this.subscriptions.add(this.minimap.onDidChangeConfig(() => {
      if (this.attached) { return this.requestForcedUpdate() }
    }))

    this.subscriptions.add(this.minimap.onDidChangeStandAlone(() => {
      this.setStandAlone(this.minimap.isStandAlone())
      this.requestUpdate()
    }))

    this.subscriptions.add(this.minimap.onDidChange((change) => {
      this.pendingChanges.push(change)
      this.requestUpdate()
    }))

    this.setStandAlone(this.minimap.isStandAlone())

    if (this.width != null && this.height != null) {
      this.minimap.setScreenHeightAndWidth(this.height, this.width)
    }

    return this.minimap
  }

  setStandAlone (standAlone) {
    this.standAlone = standAlone

    if (this.standAlone) {
      this.setAttribute('stand-alone', true)
      this.disposeScrollIndicator()
      this.disposeOpenQuickSettings()
      this.removeControls()
      this.removeVisibleArea()
    } else {
      this.removeAttribute('stand-alone')
      this.createVisibleArea()
      this.createControls()
      if (this.minimapScrollIndicator) { this.initializeScrollIndicator() }
      if (this.displayPluginsControls) { this.initializeOpenQuickSettings() }
    }
  }

  //    ##     ## ########  ########     ###    ######## ########
  //    ##     ## ##     ## ##     ##   ## ##      ##    ##
  //    ##     ## ##     ## ##     ##  ##   ##     ##    ##
  //    ##     ## ########  ##     ## ##     ##    ##    ######
  //    ##     ## ##        ##     ## #########    ##    ##
  //    ##     ## ##        ##     ## ##     ##    ##    ##
  //     #######  ##        ########  ##     ##    ##    ########

  // Internal: Requests an update to be performed on the next frame.
  requestUpdate () {
    if (this.frameRequested) { return }

    this.frameRequested = true
    requestAnimationFrame(() => {
      this.update()
      this.frameRequested = false
    })
  }

  // Internal: Requests an update to be performed on the next frame that will
  // completely redraw the minimap.
  requestForcedUpdate () {
    this.offscreenFirstRow = null
    this.offscreenLastRow = null
    this.requestUpdate()
  }

  // Internal: Performs the actual {MinimapElement} update.
  update () {
    if (!(this.attached && this.isVisible() && this.minimap)) { return }
    var minimap = this.minimap
    minimap.enableCache()

    var visibleAreaLeft = minimap.getTextEditorScaledScrollLeft()
    var visibleAreaTop = minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop()
    var visibleWidth = Math.min(this.canvas.width / devicePixelRatio, this.width)

    if (this.adjustToSoftWrap && this.flexBasis) {
      this.style.flexBasis = this.flexBasis + 'px'
    } else {
      this.style.flexBasis = null
    }

    if (SPEC_MODE) {
      this.applyStyles(this.visibleArea, {
        width: visibleWidth + 'px',
        height: minimap.getTextEditorScaledHeight() + 'px',
        top: visibleAreaTop + 'px',
        left: visibleAreaLeft + 'px'
      })
    } else {
      this.applyStyles(this.visibleArea, {
        width: visibleWidth + 'px',
        height: minimap.getTextEditorScaledHeight() + 'px',
        transform: this.makeTranslate(visibleAreaLeft, visibleAreaTop)
      })
    }

    this.applyStyles(this.controls, {width: visibleWidth + 'px'})

    var canvasTop = minimap.getFirstVisibleScreenRow() * minimap.getLineHeight() - minimap.getScrollTop()

    var canvasTransform = this.makeTranslate(0, canvasTop)
    if (devicePixelRatio !== 1) {
      canvasTransform += ' ' + this.makeScale(1 / devicePixelRatio)
    }

    if (SPEC_MODE) {
      this.applyStyles(this.canvas, {top: canvasTop + 'px'})
    } else {
      this.applyStyles(this.canvas, {transform: canvasTransform})
    }

    if (this.minimapScrollIndicator && minimap.canScroll() && !this.scrollIndicator) {
      this.initializeScrollIndicator()
    }

    if (this.scrollIndicator != null) {
      var minimapScreenHeight = minimap.getScreenHeight()
      var indicatorHeight = minimapScreenHeight * (minimapScreenHeight / minimap.getHeight())
      var indicatorScroll = (minimapScreenHeight - indicatorHeight) * minimap.getCapedTextEditorScrollRatio()

      if (SPEC_MODE) {
        this.applyStyles(this.scrollIndicator, {
          height: indicatorHeight + 'px',
          top: indicatorScroll + 'px'
        })
      } else {
        this.applyStyles(this.scrollIndicator, {
          height: indicatorHeight + 'px',
          transform: this.makeTranslate(0, indicatorScroll)
        })
      }

      if (!minimap.canScroll()) { this.disposeScrollIndicator() }
    }

    this.updateCanvas()
    minimap.clearCache()
  }

  // Defines whether to render the code highlights or not.
  //
  // displayCodeHighlights - A {Boolean}.
  setDisplayCodeHighlights (displayCodeHighlights) {
    this.displayCodeHighlights = displayCodeHighlights
    if (this.attached) { this.requestForcedUpdate() }
  }

  // Internal: Polling callback used to detect visibility and size changes.
  pollDOM () {
    var visibilityChanged = this.checkForVisibilityChange()
    if (this.isVisible()) {
      if (!this.wasVisible) { this.requestForcedUpdate() }

      this.measureHeightAndWidth(visibilityChanged, false)
    }
  }

  // Internal: A method that checks for visibility changes in the
  // {MinimapElement}. The method returns `true` when the visibility changed
  // from visible to hidden or from hidden to visible.
  //
  // Returns a {Boolean}.
  checkForVisibilityChange () {
    if (this.isVisible()) {
      if (this.wasVisible) {
        return false
      } else {
        this.wasVisible = true
        return this.wasVisible
      }
    } else {
      if (this.wasVisible) {
        this.wasVisible = false
        return true
      } else {
        this.wasVisible = false
        return this.wasVisible
      }
    }
  }

  // Internal: A method used to measure the size of the {MinimapElement} and
  // update internal components based on the new size.
  //
  // forceUpdate - A {Boolean} that forces the update even when no changes were
  //               detected.
  measureHeightAndWidth (visibilityChanged, forceUpdate = true) {
    if (!this.minimap) { return }

    var wasResized = this.width !== this.clientWidth || this.height !== this.clientHeight

    this.height = this.clientHeight
    this.width = this.clientWidth
    var canvasWidth = this.width

    if ((this.minimap != null)) { this.minimap.setScreenHeightAndWidth(this.height, this.width) }

    if (wasResized || visibilityChanged || forceUpdate) { this.requestForcedUpdate() }

    if (!this.isVisible()) { return }

    if (wasResized || forceUpdate) {
      if (this.adjustToSoftWrap) {
        var lineLength = atom.config.get('editor.preferredLineLength')
        var softWrap = atom.config.get('editor.softWrap')
        var softWrapAtPreferredLineLength = atom.config.get('editor.softWrapAtPreferredLineLength')
        var width = lineLength * this.minimap.getCharWidth()

        if (softWrap && softWrapAtPreferredLineLength && lineLength && width <= this.width) {
          this.flexBasis = width
          canvasWidth = width
        } else {
          delete this.flexBasis
        }
      } else {
        delete this.flexBasis
      }

      if (canvasWidth !== this.canvas.width || this.height !== this.canvas.height) {
        this.canvas.width = canvasWidth * devicePixelRatio
        this.canvas.height = (this.height + this.minimap.getLineHeight()) * devicePixelRatio
      }
    }
  }

  //    ######## ##     ## ######## ##    ## ########  ######
  //    ##       ##     ## ##       ###   ##    ##    ##    ##
  //    ##       ##     ## ##       ####  ##    ##    ##
  //    ######   ##     ## ######   ## ## ##    ##     ######
  //    ##        ##   ##  ##       ##  ####    ##          ##
  //    ##         ## ##   ##       ##   ###    ##    ##    ##
  //    ########    ###    ######## ##    ##    ##     ######

  // Internal: Helper method to register config observers.
  //
  // config - An {Object} mapping the config name to observe with the listener
  //          {Function} to call when the setting was changed.
  observeConfig (configs = {}) {
    for (let config in configs) {
      this.subscriptions.add(atom.config.observe(config, configs[config]))
    }
  }

  // Internal: Callback triggered when the mouse is pressed on the
  // {MinimapElement} canvas.
  //
  // event - The {Event} object.
  mousePressedOverCanvas (e) {
    if (this.minimap.isStandAlone()) { return }
    if (e.which === 1) {
      this.leftMousePressedOverCanvas(e)
    } else if (e.which === 2) {
      this.middleMousePressedOverCanvas(e)
      // @requestForcedUpdate()
      var {top, height} = this.visibleArea.getBoundingClientRect()
      this.startDrag({which: 2, pageY: top + height / 2}) // ugly hack
    }
  }

  // Internal: Callback triggered when the mouse left button is pressed on the
  // {MinimapElement} canvas.
  //
  // event - The {Event} object.
  leftMousePressedOverCanvas ({pageY, target}) {
    var y = pageY - target.getBoundingClientRect().top
    var row = Math.floor(y / this.minimap.getLineHeight()) + this.minimap.getFirstVisibleScreenRow()

    var textEditor = this.minimap.getTextEditor()

    var scrollTop = row * textEditor.getLineHeightInPixels() - this.minimap.getTextEditorHeight() / 2

    if (atom.config.get('minimap.scrollAnimation')) {
      var from = this.minimap.getTextEditorScrollTop()
      var to = scrollTop
      var step = (now) => this.minimap.setTextEditorScrollTop(now)
      var duration = atom.config.get('minimap.scrollAnimationDuration')
      this.animate({from: from, to: to, duration: duration, step: step})
    } else {
      this.minimap.setTextEditorScrollTop(scrollTop)
    }
  }

  // Internal: Callback triggered when the mouse middle button is pressed on the
  // {MinimapElement} canvas.
  //
  // event - The {Event} object.
  middleMousePressedOverCanvas ({pageY}) {
    var {top: offsetTop} = this.getBoundingClientRect()
    var y = pageY - offsetTop - this.minimap.getTextEditorScaledHeight() / 2

    var ratio = y / (this.minimap.getVisibleHeight() - this.minimap.getTextEditorScaledHeight())

    this.minimap.setTextEditorScrollTop(ratio * this.minimap.getTextEditorMaxScrollTop())
  }

  // Internal: A method that relays the `mousewheel` events received by
  // the {MinimapElement} to the {TextEditorElement}.
  //
  // e - The {Event} object.
  relayMousewheelEvent (e) {
    this.getTextEditorElement().component.onMouseWheel(e)
  }

  //    ########    ####    ########
  //    ##     ##  ##  ##   ##     ##
  //    ##     ##   ####    ##     ##
  //    ##     ##  ####     ##     ##
  //    ##     ## ##  ## ## ##     ##
  //    ##     ## ##   ##   ##     ##
  //    ########   ####  ## ########

  // Internal: A method triggered when the mouse is pressed over the visible
  // area that starts the dragging gesture.
  //
  // event - The {Event} object.
  startDrag (e) {
    var {which, pageY} = e
    if (!this.minimap) { return }
    if (which !== 1 && which !== 2 && !(e.touches != null)) { return }

    var {top} = this.visibleArea.getBoundingClientRect()
    var {top: offsetTop} = this.getBoundingClientRect()

    var dragOffset = pageY - top

    var initial = {dragOffset, offsetTop}

    var mousemoveHandler = (e) => this.drag(e, initial)
    var mouseupHandler = (e) => this.endDrag(e, initial)

    document.body.addEventListener('mousemove', mousemoveHandler)
    document.body.addEventListener('mouseup', mouseupHandler)
    document.body.addEventListener('mouseleave', mouseupHandler)

    document.body.addEventListener('touchmove', mousemoveHandler)
    document.body.addEventListener('touchend', mouseupHandler)

    this.dragSubscription = new Disposable(function () {
      document.body.removeEventListener('mousemove', mousemoveHandler)
      document.body.removeEventListener('mouseup', mouseupHandler)
      document.body.removeEventListener('mouseleave', mouseupHandler)

      document.body.removeEventListener('touchmove', mousemoveHandler)
      document.body.removeEventListener('touchend', mouseupHandler)
    })
  }

  // Internal: The method called during the drag gesture.
  //
  // e - The {Event} object.
  // initial - An {Object} with the data from the original data from the drag
  //           start event. The object holds the following properties:
  //           dragOffset - The mouse offset {Number} within the visible area.
  //           offsetTop - The {MinimapElement} offset at the moment of the
  //                       drag start.
  drag (e, initial) {
    if (!this.minimap) { return }
    if (e.which !== 1 && e.which !== 2 && !(e.touches != null)) { return }
    var y = e.pageY - initial.offsetTop - initial.dragOffset

    var ratio = y / (this.minimap.getVisibleHeight() - this.minimap.getTextEditorScaledHeight())

    this.minimap.setTextEditorScrollTop(ratio * this.minimap.getTextEditorMaxScrollTop())
  }

  // Internal: The method that ends the drag gesture.
  //
  // e - The {Event} object.
  // initial - An {Object} with the data from the original data from the drag
  //           start event. The object holds the following properties:
  //           dragOffset - The mouse offset {Number} within the visible area.
  //           offsetTop - The {MinimapElement} offset at the moment of the
  //                       drag start.
  endDrag (e, initial) {
    if (!this.minimap) { return }
    this.dragSubscription.dispose()
  }

  //     ######   ######   ######
  //    ##    ## ##    ## ##    ##
  //    ##       ##       ##
  //    ##        ######   ######
  //    ##             ##       ##
  //    ##    ## ##    ## ##    ##
  //     ######   ######   ######

  // Internal: Applies the passed-in styles properties to the specified element
  //
  // element - The {HTMLElement} onto which applies the styles.
  // styles - An {Object} where the keys are the properties name and the values
  //          are the CSS values for theses properties.
  applyStyles (element, styles) {
    if (!element) { return }

    let cssText = ''
    for (var property in styles) {
      cssText += `${property}: ${styles[property]}; `
    }

    element.style.cssText = cssText
  }

  // Returns a {String} with a CSS translation tranform value.
  //
  // x - The translation {Number} on the x axis.
  // y - The translation {Number} on the y axis.
  //
  // Returns a {String}.
  makeTranslate (x = 0, y = 0) {
    if (this.useHardwareAcceleration) {
      return `translate3d(${x}px, ${y}px, 0)`
    } else {
      return `translate(${x}px, ${y}px)`
    }
  }

  // Returns a {String} with a CSS scale tranform value.
  //
  // x - The scaling {Number} on the x axis.
  // y - The scaling {Number} on the y axis.
  //
  // Returns a {String}.
  makeScale (x = 0, y = x) {
    if (this.useHardwareAcceleration) {
      return `scale3d(${x}, ${y}, 1)`
    } else {
      return `scale(${x}, ${y})`
    }
  }

  // Internal: A method that return the current time as a {Date}.
  //
  // That method exist so that we can mock it in tests.
  //
  // Returns a {Date}.
  getTime () { return new Date() }

  // Internal: A method that mimic the jQuery `animate` method and used to
  // animate the scroll when clicking on the {MinimapElement} canvas.
  //
  //  properties - An {Object} with the following properties:
  //               from - The starting {Number} value.
  //               to - The ending {Number} value.
  //               duration - The duration {Number} of the animation.
  //               step - A {Function} to call on each step of the animation.
  //                      The method will receive a {Number} between `0` and `1`
  //                      as argument.
  animate ({from, to, duration, step}) {
    var start = this.getTime()

    var swing = function (progress) {
      return 0.5 - Math.cos(progress * Math.PI) / 2
    }

    var update = () => {
      var passed = this.getTime() - start
      if (duration === 0) {
        var progress = 1
      } else {
        progress = passed / duration
      }
      if (progress > 1) { progress = 1 }
      var delta = swing(progress)
      step(from + (to - from) * delta)

      if (progress < 1) { requestAnimationFrame(update) }
    }

    update()
  }
}
