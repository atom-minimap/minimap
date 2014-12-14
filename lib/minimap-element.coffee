
class MinimapElement extends HTMLElement
  createdCallback: ->
    @initializeContent()

  attach: ->
    @getTextEditorElementRoot().appendChild(this)

  attachedCallback: ->
    @measureHeightAndWidth()
    @requestUpdate()

  detachedCallback: ->

  attributeChangedCallback: (attrName, oldValue, newValue) ->

  getModel: -> @minimap

  setModel: (@minimap) -> @minimap

  initializeContent: ->
    @shadowRoot = @createShadowRoot()

    @canvas = document.createElement('canvas')
    @context = @canvas.getContext('2d')
    @shadowRoot.appendChild(@canvas)

    @offscreenCanvas = document.createElement('canvas')
    @offscreenContext = @offscreenCanvas.getContext('2d')

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

  getTextEditorElement: ->
    @editorElement ?= atom.views.getView(@minimap.getTextEditor())

  getTextEditorElementRoot: ->
    editorElement = @getTextEditorElement()

    editorElement.shadowRoot ? editorElement

  requestUpdate: ->
    return if @frameRequested

    @frameRequested = true
    requestAnimationFrame =>
      @update()
      @frameRequested = false

  update: ->
    @visibleArea.style.width = @clientWidth + 'px'
    @visibleArea.style.height = @minimap.getTextEditorHeight() + 'px'

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
