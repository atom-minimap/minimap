{debounce} = require 'underscore-plus'
{CompositeDisposable, Disposable} = require 'event-kit'
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

  #    ##     ##  #######   #######  ##    ##  ######
  #    ##     ## ##     ## ##     ## ##   ##  ##    ##
  #    ##     ## ##     ## ##     ## ##  ##   ##
  #    ######### ##     ## ##     ## #####     ######
  #    ##     ## ##     ## ##     ## ##  ##         ##
  #    ##     ## ##     ## ##     ## ##   ##  ##    ##
  #    ##     ##  #######   #######  ##    ##  ######

  createdCallback: ->
    @subscriptions = new CompositeDisposable
    @initializeContent()

    @observeConfig
      'minimap.displayMinimapOnLeft': (displayMinimapOnLeft) =>
        swapPosition = @minimap? and displayMinimapOnLeft isnt @displayMinimapOnLeft
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

  attachedCallback: ->
    @domPollingIntervalId = setInterval((=> @pollDOM()), @domPollingInterval)
    @measureHeightAndWidth()
    @requestUpdate()
    @attached = true

  detachedCallback: ->
    clearInterval(@domPollingIntervalId)
    @attached = false

  attributeChangedCallback: (attrName, oldValue, newValue) ->

  #       ###    ######## ########    ###     ######  ##     ##
  #      ## ##      ##       ##      ## ##   ##    ## ##     ##
  #     ##   ##     ##       ##     ##   ##  ##       ##     ##
  #    ##     ##    ##       ##    ##     ## ##       #########
  #    #########    ##       ##    ######### ##       ##     ##
  #    ##     ##    ##       ##    ##     ## ##    ## ##     ##
  #    ##     ##    ##       ##    ##     ##  ######  ##     ##

  isVisible: -> @offsetWidth > 0 or @offsetHeight > 0

  attach: ->
    return if @attached
    @swapMinimapPosition()

  attachToLeft: ->
    root = @getTextEditorElementRoot()
    root.insertBefore(this, root.children[0])

  attachToRight: ->
    @getTextEditorElementRoot().appendChild(this)

  swapMinimapPosition: ->
    if @displayMinimapOnLeft
      @attachToLeft()
    else
      @attachToRight()

  detach: ->
    return unless @attached
    return unless @parentNode?
    @parentNode.removeChild(this)

  destroy: ->
    @subscriptions.dispose()
    @detach()

  #     ######   #######  ##    ## ######## ######## ##    ## ########
  #    ##    ## ##     ## ###   ##    ##    ##       ###   ##    ##
  #    ##       ##     ## ####  ##    ##    ##       ####  ##    ##
  #    ##       ##     ## ## ## ##    ##    ######   ## ## ##    ##
  #    ##       ##     ## ##  ####    ##    ##       ##  ####    ##
  #    ##    ## ##     ## ##   ###    ##    ##       ##   ###    ##
  #     ######   #######  ##    ##    ##    ######## ##    ##    ##

  initializeContent: ->
    @initializeCanvas()

    @shadowRoot = @createShadowRoot()

    @shadowRoot.appendChild(@canvas)

    @visibleArea = document.createElement('div')
    @visibleArea.classList.add('minimap-visible-area')
    @shadowRoot.appendChild(@visibleArea)

    @controls = document.createElement('div')
    @controls.classList.add('minimap-controls')
    @shadowRoot.appendChild(@controls)

    elementMousewheel = (e) => @relayMousewheelEvent(e)
    canvasMousedown = (e) => @mousePressedOverCanvas(e)
    visibleAreaMousedown = (e) => @startDrag(e)

    @addEventListener 'mousewheel', elementMousewheel
    @canvas.addEventListener 'mousedown', canvasMousedown
    @visibleArea.addEventListener 'mousedown', visibleAreaMousedown

    @subscriptions.add new Disposable =>
      @removeEventListener 'mousewheel', elementMousewheel
      @canvas.removeEventListener 'mousedown', canvasMousedown
      @visibleArea.removeEventListener 'mousedown', visibleAreaMousedown

  initializeScrollIndicator: ->
    @scrollIndicator = document.createElement('div')
    @scrollIndicator.classList.add 'minimap-scroll-indicator'
    @controls.appendChild(@scrollIndicator)

  disposeScrollIndicator: ->
    @controls.removeChild(@scrollIndicator)
    @scrollIndicator = undefined

  initializeOpenQuickSettings: ->
    @openQuickSettings = document.createElement('div')
    @openQuickSettings.classList.add 'open-minimap-quick-settings'
    @controls.appendChild(@openQuickSettings)
    @openQuickSettings.addEventListener 'mousedown', (e) =>
      e.preventDefault()
      e.stopPropagation()

      if @quickSettingsView?
        @quickSettingsView.destroy()
        @quickSettingsSubscription.dispose()
      else
        MinimapQuickSettingsView ?= require './minimap-quick-settings-view'
        @quickSettingsView = new MinimapQuickSettingsView(this)
        @quickSettingsSubscription = @quickSettingsView.onDidDestroy =>
          @quickSettingsView = null

        @quickSettingsView.attach()
        {top, left} = @getBoundingClientRect()
        @quickSettingsView.css({
          top: top + 'px'
          left: (left - @quickSettingsView.width()) + 'px'
        })

  disposeOpenQuickSettings: ->
    @controls.removeChild(@openQuickSettings)
    @openQuickSettings = undefined

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

  #    ##     ##  #######  ########  ######## ##
  #    ###   ### ##     ## ##     ## ##       ##
  #    #### #### ##     ## ##     ## ##       ##
  #    ## ### ## ##     ## ##     ## ######   ##
  #    ##     ## ##     ## ##     ## ##       ##
  #    ##     ## ##     ## ##     ## ##       ##
  #    ##     ##  #######  ########  ######## ########

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

  #    ##     ## ########  ########     ###    ######## ########
  #    ##     ## ##     ## ##     ##   ## ##      ##    ##
  #    ##     ## ##     ## ##     ##  ##   ##     ##    ##
  #    ##     ## ########  ##     ## ##     ##    ##    ######
  #    ##     ## ##        ##     ## #########    ##    ##
  #    ##     ## ##        ##     ## ##     ##    ##    ##
  #     #######  ##        ########  ##     ##    ##    ########

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

    @applyStyles @visibleArea,
      width: @clientWidth + 'px'
      height: @minimap.getTextEditorHeight() + 'px'
      transform: @makeTranslate(visibleAreaLeft, visibleAreaTop)

    @applyStyles @controls,
      width: @canvas.width + 'px'

    canvasTop = @minimap.getFirstVisibleScreenRow() * @minimap.getLineHeight() - @minimap.getMinimapScrollTop()

    canvasTransform = @makeTranslate(0, canvasTop)
    canvasTransform += " " + @makeScale(1/devicePixelRatio) if devicePixelRatio isnt 1
    @applyStyles @canvas, transform: canvasTransform

    if @minimapScrollIndicator and @minimap.canScroll() and not @scrollIndicator
      @initializeScrollIndicator()

    if @scrollIndicator?
      editorHeight = @getTextEditor().getHeight()
      indicatorHeight = editorHeight * (editorHeight / @minimap.getHeight())
      indicatorScroll = (editorHeight - indicatorHeight) * @minimap.getCapedTextEditorScrollRation()

      @applyStyles @scrollIndicator,
        height: indicatorHeight + 'px'
        transform: @makeTranslate(0, indicatorScroll)

      @disposeScrollIndicator() if not @minimap.canScroll()

    @updateCanvas()

  setDisplayCodeHighlights: (@displayCodeHighlights) ->
    @requestForcedUpdate() if @attached

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

  #    ######## ##     ## ######## ##    ## ########  ######
  #    ##       ##     ## ##       ###   ##    ##    ##    ##
  #    ##       ##     ## ##       ####  ##    ##    ##
  #    ######   ##     ## ######   ## ## ##    ##     ######
  #    ##        ##   ##  ##       ##  ####    ##          ##
  #    ##         ## ##   ##       ##   ###    ##    ##    ##
  #    ########    ###    ######## ##    ##    ##     ######

  observeConfig: (configs={}) ->
    for config, callback of configs
      @subscriptions.add atom.config.observe config, callback

  mousePressedOverCanvas: ({pageY, target}) ->
    y = pageY - target.getBoundingClientRect().top
    row = Math.floor(y / @minimap.getLineHeight()) + @minimap.getFirstVisibleScreenRow()

    scrollTop = row * @minimap.textEditor.getLineHeightInPixels() - @minimap.textEditor.getHeight() / 2

    @minimap.textEditor.setScrollTop(scrollTop)

  relayMousewheelEvent: (e) =>
    editorElement = atom.views.getView(@minimap.textEditor)

    editorElement.component.onMouseWheel(e)

  #    ########    ####    ########
  #    ##     ##  ##  ##   ##     ##
  #    ##     ##   ####    ##     ##
  #    ##     ##  ####     ##     ##
  #    ##     ## ##  ## ## ##     ##
  #    ##     ## ##   ##   ##     ##
  #    ########   ####  ## ########

  startDrag: ({pageY}) ->
    {top} = @visibleArea.getBoundingClientRect()
    {top: offsetTop} = @getBoundingClientRect()

    dragOffset = pageY - top

    initial = {dragOffset, offsetTop}

    mousemoveHandler = (e) => @drag(e, initial)
    mouseupHandler = (e) => @endDrag(e, initial)

    document.body.addEventListener('mousemove', mousemoveHandler)
    document.body.addEventListener('mouseup', mouseupHandler)
    document.body.addEventListener('mouseout', mouseupHandler)

    @dragSubscription = new Disposable =>
      document.body.removeEventListener('mousemove', mousemoveHandler)
      document.body.removeEventListener('mouseup', mouseupHandler)
      document.body.removeEventListener('mouseout', mouseupHandler)

  drag: (e, initial) ->
    y = e.pageY - initial.offsetTop - initial.dragOffset

    ratio = y / (@minimap.getVisibleHeight() - @minimap.getTextEditorHeight())

    @minimap.textEditor.setScrollTop(ratio * @minimap.getTextEditorMaxScrollTop())

  endDrag: (e, initial) ->
    @dragSubscription.dispose()

  #     ######   ######   ######
  #    ##    ## ##    ## ##    ##
  #    ##       ##       ##
  #    ##        ######   ######
  #    ##             ##       ##
  #    ##    ## ##    ## ##    ##
  #     ######   ######   ######

  applyStyles: (element, styles) ->
    cssText = ''

    for property,value of styles
      cssText += "#{property}: #{value}; "

    element.style.cssText = cssText

  makeTranslate: (x=0,y=0) ->
    if @useHardwareAcceleration
      "translate3d(#{x}px, #{y}px, 0)"
    else
      "translate(#{x}px, #{y}px)"

  makeScale: (x=0,y=x) ->
    if @useHardwareAcceleration
      "scale3d(#{x}, #{y}, 1)"
    else
      "scale(#{x}, #{y})"

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
