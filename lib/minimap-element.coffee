{debounce} = require 'underscore-plus'
{CompositeDisposable} = require 'event-kit'
DOMStylesReader = require './mixins/dom-styles-reader'
CanvasDrawer = require './mixins/canvas-drawer'

MinimapQuickSettingsView = null

class MinimapElement extends HTMLElement
  DOMStylesReader.includeInto(this)
  CanvasDrawer.includeInto(this)

  domPollingInterval: 100
  domPollingIntervalId: null
  domPollingPaused: false
  displayMinimapOnLeft: false

  createdCallback: ->
    @subscriptions = new CompositeDisposable
    @initializeContent()

    @observeConfig
      'minimap.displayMinimapOnLeft': (displayMinimapOnLeft) =>
        swapPosition = @attached and displayMinimapOnLeft isnt @displayMinimapOnLeft
        @displayMinimapOnLeft = displayMinimapOnLeft

        @swapMinimapPosition() if swapPosition

      'minimap.minimapScrollIndicator': (@minimapScrollIndicator) =>
        if @minimapScrollIndicator and not @scrollIndicator?
          @initializeScrollIndicator()
        else if @scrollIndicator?
          @disposeScrollIndicator()

        @requestUpdate() if @attached

      'minimap.displayPluginsControls': (@displayPluginsControls) =>
        if @displayPluginsControls and not @openQuickSettings?
          @initializeOpenQuickSettings()
        else if @openQuickSettings?
          @disposeOpenQuickSettings()

      'minimap.textOpacity': (@textOpacity) =>
        @requestForcedUpdate() if @attached

      'minimap.displayCodeHighlights': (@displayCodeHighlights) =>
        @requestForcedUpdate() if @attached

      'minimap.adjustMinimapWidthToSoftWrap': (@adjustToSoftWrap) =>
        if @attached
          @measureHeightAndWidth()
          @requestForcedUpdate()

      'minimap.useHardwareAcceleration': (@useHardwareAcceleration) =>
        @requestUpdate() if @attached

  observeConfig: (configs={}) ->
    for config, callback of configs
      @subscriptions.add atom.config.observe config, callback

  attachedCallback: ->
    @domPollingIntervalId = setInterval((=> @pollDOM()), @domPollingInterval)
    @measureHeightAndWidth()
    @requestUpdate()
    @attached = true

  detachedCallback: ->
    clearInterval(@domPollingIntervalId)
    @attached = false

  attributeChangedCallback: (attrName, oldValue, newValue) ->

  attach: ->
    return if @attached
    @swapMinimapPosition()

  swapMinimapPosition: ->
    if @displayMinimapOnLeft
      @attachToLeft()
    else
      @attachToRight()

  attachToLeft: ->
    root = @getTextEditorElementRoot()
    root.insertBefore(this, root.children[0])

  attachToRight: ->
    @getTextEditorElementRoot().appendChild(this)

  detach: ->
    return unless @attached
    return unless @parentNode?
    @parentNode.removeChild(this)

  destroy: ->
    @subscriptions.dispose()
    @detach()

  getModel: -> @minimap

  setModel: (@minimap) ->
    @subscriptions.add @minimap.onDidChangeScrollTop => @requestUpdate()
    @subscriptions.add @minimap.onDidChangeScrollLeft => @requestUpdate()
    @subscriptions.add @minimap.onDidDestroy => @destroy()
    @subscriptions.add @minimap.onDidChangeConfig =>
      @requestForcedUpdate() if @attached
    @subscriptions.add @minimap.onDidChange (change) =>
      @pendingChanges.push(change)
      @requestUpdate()

    @minimap

  initializeContent: ->
    @initializeCanvas()

    @shadowRoot = @createShadowRoot()

    @shadowRoot.appendChild(@canvas)

    @visibleArea = document.createElement('div')
    @visibleArea.classList.add('minimap-visible-area')
    @shadowRoot.appendChild(@visibleArea)

  initializeScrollIndicator: ->
    @scrollIndicator = document.createElement('div')
    @scrollIndicator.classList.add 'minimap-scroll-indicator'
    @shadowRoot.appendChild(@scrollIndicator)

  disposeScrollIndicator: ->
    @shadowRoot.removeChild(@scrollIndicator)
    @scrollIndicator = undefined

  initializeOpenQuickSettings: ->
    @openQuickSettings = document.createElement('div')
    @openQuickSettings.classList.add 'open-minimap-quick-settings'
    @shadowRoot.appendChild(@openQuickSettings)
    @openQuickSettings.addEventListener 'click', (e) =>
      MinimapQuickSettingsView ?= require './minimap-quick-settings-view'

      @quickSettingsView = new MinimapQuickSettingsView(this)
      @quickSettingsView.attach()
      {top, left} = @getBoundingClientRect()
      @quickSettingsView.css({
        top: top + 'px'
        left: (left - @quickSettingsView.width()) + 'px'
      })

  disposeOpenQuickSettings: ->
    @shadowRoot.removeChild(@openQuickSettings)
    @openQuickSettings = undefined

  pauseDOMPolling: ->
    @domPollingPaused = true
    @resumeDOMPollingAfterDelay ?= debounce(@resumeDOMPolling, 100)
    @resumeDOMPollingAfterDelay()

  resumeDOMPolling: ->
    @domPollingPaused = false

  resumeDOMPollingAfterDelay: null

  pollDOM: ->
    return if @domPollingPaused or @updateRequested

    if @width isnt @clientWidth or @height isnt @clientHeight
      @measureHeightAndWidth()
      @requestForcedUpdate()

  measureHeightAndWidth: ->
    @height = @clientHeight
    @width = @clientWidth
    canvasWidth = @width

    return unless @isVisible()

    if @adjustToSoftWrap
      lineLength = atom.config.get('editor.preferredLineLength')
      softWrap = atom.config.get('editor.softWrap')
      width = lineLength * @minimap.getCharWidth()

      @marginRight = width - @width if softWrap and lineLength and width < @width
      canvasWidth = width
    else
      delete @marginRight

    if canvasWidth isnt @canvas.width or @height isnt @canvas.height
      @canvas.width = canvasWidth * devicePixelRatio
      @canvas.height = (@height + @minimap.getLineHeight()) * devicePixelRatio

  getTextEditor: -> @minimap.getTextEditor()

  getTextEditorElement: ->
    @editorElement ?= atom.views.getView(@getTextEditor())

  getTextEditorElementRoot: ->
    editorElement = @getTextEditorElement()

    editorElement.shadowRoot ? editorElement

  getDummyDOMRoot: (shadowRoot) ->
    if shadowRoot
      @getTextEditorElementRoot()
    else
      @getTextEditorElement()

  requestUpdate: ->
    return if @frameRequested

    @frameRequested = true
    requestAnimationFrame =>
      @update()
      @frameRequested = false

  requestForcedUpdate: ->
    @offscreenFirstRow = null
    @offscreenLastRow = null
    @requestUpdate()

  update: ->
    return unless @attached and @isVisible() and not @minimap.isDestroyed()

    if @adjustToSoftWrap
      @style.marginRight = @marginRight + 'px'
    else
      @style.marginRight = null

    visibleAreaLeft = @minimap.getTextEditorScrollLeft()
    visibleAreaTop = @minimap.getTextEditorScrollTop() - @minimap.getMinimapScrollTop()

    @visibleArea.style.width = @clientWidth + 'px'
    @visibleArea.style.height = @minimap.getTextEditorHeight() + 'px'
    @transformElement @visibleArea, @makeTranslate(visibleAreaLeft, visibleAreaTop)

    canvasTop = @minimap.getFirstVisibleScreenRow() * @minimap.getLineHeight() - @minimap.getMinimapScrollTop()

    @transformElement(@canvas, @makeTranslate(0, canvasTop))

    if @minimapScrollIndicator and @minimap.canScroll() and not @scrollIndicator
      @initializeScrollIndicator()

    if @scrollIndicator?
      editorHeight = @getTextEditor().getHeight()
      indicatorHeight = editorHeight * (editorHeight / @minimap.getHeight())
      indicatorScroll = (editorHeight - indicatorHeight) * @minimap.getTextEditorScrollRatio()
      indicatorOffset = 0
      indicatorOffset = @marginRight if @adjustToSoftWrap

      @scrollIndicator.style.height = indicatorHeight + 'px'
      @transformElement @scrollIndicator, @makeTranslate(indicatorOffset, indicatorScroll)

      @disposeScrollIndicator() if not @minimap.canScroll()

    @updateCanvas()

  isVisible: -> @offsetWidth > 0 or @offsetHeight > 0

  transformElement: (el, transform) ->
    el.style.transform = transform

  makeTranslate: (x=0,y=0) ->
    if @useHardwareAcceleration
      "translate3d(#{x}px, #{y}px, 0)"
    else
      "translate(#{x}px, #{y}px)"

#    ######## ##       ######## ##     ## ######## ##    ## ########
#    ##       ##       ##       ###   ### ##       ###   ##    ##
#    ##       ##       ##       #### #### ##       ####  ##    ##
#    ######   ##       ######   ## ### ## ######   ## ## ##    ##
#    ##       ##       ##       ##     ## ##       ##  ####    ##
#    ##       ##       ##       ##     ## ##       ##   ###    ##
#    ######## ######## ######## ##     ## ######## ##    ##    ##

module.exports = MinimapElement = document.registerElement 'atom-text-editor-minimap', prototype: MinimapElement.prototype

MinimapElement.registerViewProvider = ->
  atom.views.addViewProvider require('./minimap'), (model) ->
    element = new MinimapElement
    element.setModel(model)
    element
