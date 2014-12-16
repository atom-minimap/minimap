{debounce} = require 'underscore-plus'
{CompositeDisposable} = require 'event-kit'
DOMStylesReader = require './mixins/dom-styles-reader'
CanvasDrawer = require './mixins/canvas-drawer'

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

    @subscriptions.add atom.config.observe 'minimap.displayMinimapOnLeft', (displayMinimapOnLeft) =>
      swapPosition = @attached and displayMinimapOnLeft isnt @displayMinimapOnLeft
      @displayMinimapOnLeft = displayMinimapOnLeft

      @swapMinimapPosition() if swapPosition

    @subscriptions.add atom.config.observe 'minimap.minimapScrollIndicator', (@minimapScrollIndicator) =>
      if @minimapScrollIndicator and not @scrollIndicator?
        @initializeScrollIndicator()
      else if @scrollIndicator?
        @disposeScrollIndicator()

    @subscriptions.add atom.config.observe 'minimap.textOpacity', (@textOpacity) =>
      @requestForcedUpdate() if @attached

    @subscriptions.add atom.config.observe 'minimap.displayCodeHighlights', (@displayCodeHighlights) =>
      @requestForcedUpdate() if @attached

  attachedCallback: ->
    @domPollingIntervalId = setInterval((=> @pollDOM()), @domPollingInterval)
    @measureHeightAndWidth()
    @requestUpdate()
    @attached = true

  detachedCallback: ->
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

  getModel: -> @minimap

  setModel: (@minimap) ->
    @subscriptions.add @minimap.onDidChangeScrollTop => @requestUpdate()
    @subscriptions.add @minimap.onDidChangeScrollLeft => @requestUpdate()
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
      @requestUpdate()

  measureHeightAndWidth: ->
    @width = @clientWidth
    @height = @clientHeight

    if @width isnt @canvas.width or @height isnt @canvas.height
      @canvas.width = @width * devicePixelRatio
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
    return unless @attached

    @visibleArea.style.width = @clientWidth + 'px'
    @visibleArea.style.height = @minimap.getTextEditorHeight() + 'px'
    @visibleArea.style.top = (@minimap.getTextEditorScrollTop() - @minimap.getMinimapScrollTop()) + 'px'
    @visibleArea.style.left = (@minimap.getTextEditorScrollLeft()) + 'px'

    @canvas.style.top = (@minimap.getFirstVisibleScreenRow() * @minimap.getLineHeight() - @minimap.getMinimapScrollTop()) + 'px'

    if @minimapScrollIndicator and @minimap.canScroll() and not @scrollIndicator
      @initializeScrollIndicator()

    if @scrollIndicator?
      editorHeight = @getTextEditor().getHeight()
      indicatorHeight = editorHeight * (editorHeight / @minimap.getHeight())
      indicatorScroll = (editorHeight - indicatorHeight) * @minimap.getTextEditorScrollRatio()

      @scrollIndicator.style.height = indicatorHeight + 'px'
      @scrollIndicator.style.top = indicatorScroll + 'px'

      @disposeScrollIndicator() if not @minimap.canScroll()

    @updateCanvas()

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
