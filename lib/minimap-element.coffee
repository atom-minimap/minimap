
class MinimapElement extends HTMLElement
  createdCallback: ->
    @initializeContent()

  attachedCallback: ->
  detachedCallback: ->
  attributeChangedCallback: (attrName, oldValue, newValue) ->

  initializeContent: ->
    @shadowRoot = @createShadowRoot()

module.exports = MinimapElement = document.registerElement 'minimap', prototype: MinimapElement.prototype
