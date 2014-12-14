
class MinimapElement extends HTMLElement
  createdCallback: ->
    @initializeContent()

  attachedCallback: ->

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

module.exports = MinimapElement = document.registerElement 'atom-text-editor-minimap', prototype: MinimapElement.prototype

MinimapElement.registerViewProvider = ->
  atom.views.addViewProvider require('./minimap'), (model) ->
    element = new MinimapElement
    element.setModel(model)
    element
