
class MinimapElement extends HTMLElement
  createdCallback: ->
    @initializeContent()

  attachedCallback: ->

  detachedCallback: ->

  attributeChangedCallback: (attrName, oldValue, newValue) ->

  setModel: (model) ->

  initializeContent: ->
    @shadowRoot = @createShadowRoot()

module.exports = MinimapElement = document.registerElement 'atom-text-editor-minimap', prototype: MinimapElement.prototype

MinimapElement.registerViewProvider = ->
  atom.views.addViewProvider require('./minimap'), (model) ->
    element = new MinimapElement
    element.setModel(model)
    element
