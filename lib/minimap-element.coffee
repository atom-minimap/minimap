{CompositeDisposable} = require 'event-kit'
DOMStylesReader = require './mixins/dom-styles-reader'
CanvasDrawer = require './mixins/canvas-drawer'

class MinimapElement extends HTMLElement
  DOMStylesReader.includeInto(this)
  CanvasDrawer.includeInto(this)

  createdCallback: ->
    @subscriptions = new CompositeDisposable
    @initializeContent()

  attach: ->
    @getTextEditorElementRoot().appendChild(this)

  attachedCallback: ->
    @measureHeightAndWidth()
    @requestUpdate()

  detachedCallback: ->

  attributeChangedCallback: (attrName, oldValue, newValue) ->

  getModel: -> @minimap

  setModel: (@minimap) ->
    @subscriptions.add @minimap.onDidChangeScrollTop => @requestUpdate()
    @subscriptions.add @minimap.onDidChangeScrollLeft => @requestUpdate()

    @minimap

  initializeContent: ->
    @initializeCanvas()

    @shadowRoot = @createShadowRoot()

    @shadowRoot.appendChild(@canvas)

    @visibleArea = document.createElement('div')
    @visibleArea.classList.add('minimap-visible-area')
    @shadowRoot.appendChild(@visibleArea)

  measureHeightAndWidth: ->
    editorElement = @getTextEditorElement()
    width = @clientWidth
    height = @clientHeight

    if width isnt @canvas.width or height isnt @canvas.height
      @canvas.width = width * devicePixelRatio
      @canvas.height = height * devicePixelRatio

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

  update: ->
    @visibleArea.style.width = @clientWidth + 'px'
    @visibleArea.style.height = @minimap.getTextEditorHeight() + 'px'
    @visibleArea.style.top = (@minimap.getTextEditorScrollTop() - @minimap.getMinimapScrollTop()) + 'px'
    @visibleArea.style.left = (@minimap.getTextEditorScrollLeft()) + 'px'

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
