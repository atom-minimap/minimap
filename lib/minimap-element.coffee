
class MinimapElement extends HTMLElement
  createdCallback: ->
    @initializeContent()

  attach: ->
    @getTextEditorElementRoot().appendChild(this)

  attachedCallback: ->
    @measureHeightAndWidth()

  detachedCallback: ->

  attributeChangedCallback: (attrName, oldValue, newValue) ->

  getModel: -> @minimap

  setModel: (@minimap) -> @minimap

  initializeContent: ->
    @shadowRoot = @createShadowRoot()

    @canvas = document.createElement('canvas')
    @shadowRoot.appendChild(@canvas)

    @visibleArea = document.createElement('div')
    @visibleArea.classList.add('minimap-visible-area')
    @shadowRoot.appendChild(@visibleArea)

  measureHeightAndWidth: ->
    editorElement = @getTextEditorElement()
    width = @clientWidth
    height = @clientHeight

    if width isnt @canvas.width or height isnt @canvas.height
      @canvas.width = width
      @canvas.height = height

  getTextEditorElement: ->
    @editorElement ?= atom.views.getView(@minimap.getTextEditor())

  getTextEditorElementRoot: ->
    editorElement = @getTextEditorElement()

    editorElement.shadowRoot ? editorElement

module.exports = MinimapElement = document.registerElement 'atom-text-editor-minimap', prototype: MinimapElement.prototype

MinimapElement.registerViewProvider = ->
  atom.views.addViewProvider require('./minimap'), (model) ->
    element = new MinimapElement
    element.setModel(model)
    element
