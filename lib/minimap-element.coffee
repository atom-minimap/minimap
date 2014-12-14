
class MinimapElement extends HTMLElement
  createdCallback: ->
    @initializeContent()

  attach: ->
    @getTextEditorElementRoot().appendChild(this)

  attachedCallback: ->
    @measureTextEditorHeightAndWidth()

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

  measureTextEditorHeightAndWidth: ->
    editorElement = @getTextEditorElement()
    if editorElement.offsetHeight isnt @height
      @height = editorElement.offsetHeight
      @style.height = @height + 'px'

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
