{EventsDelegation, SpacePenDSL} = require 'atom-utils'
{CompositeDisposable, Emitter} = require 'event-kit'

Main = require './main'

module.exports =
class MinimapQuickSettingsElement extends HTMLElement
  SpacePenDSL.includeInto(this)
  EventsDelegation.includeInto(this)

  @content: ->
    @div class: 'select-list popover-list minimap-quick-settings', =>
      @input type: 'text', class: 'hidden-input', outlet: 'hiddenInput'
      @ol class: 'list-group mark-active', outlet: 'list', =>
        @li class: 'separator', outlet: 'separator'
        @li class: '', outlet: 'codeHighlights', 'code-highlights'

  selectedItem: null

  setModel: (@minimap) ->
    @emitter = new Emitter
    @subscriptions = new CompositeDisposable
    @plugins = {}
    @subscriptions.add Main.onDidAddPlugin ({name, plugin}) =>
      @addItemFor(name, plugin)
    @subscriptions.add Main.onDidRemovePlugin ({name, plugin}) =>
      @removeItemFor(name, plugin)
    @subscriptions.add Main.onDidActivatePlugin ({name, plugin}) =>
      @activateItem(name, plugin)
    @subscriptions.add Main.onDidDeactivatePlugin ({name, plugin}) =>
      @deactivateItem(name, plugin)

    @subscriptions.add atom.commands.add '.minimap-quick-settings',
      'core:move-up': => @selectPreviousItem()
      'core:move-down': => @selectNextItem()
      'core:cancel': => @destroy()
      'core:confirm': => @toggleSelectedItem()

    @codeHighlights.classList.toggle('active', @minimap.displayCodeHighlights)
    @subscriptions.add @subscribeTo @codeHighlights,
      'mousedown': (e) =>
        e.preventDefault()
        @minimap.setDisplayCodeHighlights(!@minimap.displayCodeHighlights)
        @codeHighlights.classList.toggle('active', @minimap.displayCodeHighlights)

    @subscriptions.add @subscribeTo @hiddenInput,
      'focusout': (e) =>
        @destroy()

    @initList()

  onDidDestroy: (callback) ->
    @emitter.on 'did-destroy', callback

  attach: ->
    workspaceElement = atom.views.getView(atom.workspace)
    workspaceElement.appendChild this
    @hiddenInput.focus()

  destroy: ->
    @emitter.emit('did-destroy')
    @subscriptions.dispose()
    @parentNode.removeChild(this)

  initList: ->
    @itemsActions = new WeakMap
    @itemsDisposables = new WeakMap
    @addItemFor(name, plugin) for name, plugin of Main.plugins

  toggleSelectedItem: => @itemsActions.get(@selectedItem)?()

  selectNextItem: ->
    @selectedItem.classList.remove('selected')
    if @selectedItem.nextSibling?
      @selectedItem = @selectedItem.nextSibling
      @selectedItem = @selectedItem.nextSibling if @selectedItem.matches('.separator')
    else
      @selectedItem = @list.firstChild
    @selectedItem.classList.add('selected')

  selectPreviousItem: ->
    @selectedItem.classList.remove('selected')
    if @selectedItem.previousSibling?
      @selectedItem = @selectedItem.previousSibling
      @selectedItem = @selectedItem.previousSibling if @selectedItem.matches('.separator')
    else
      @selectedItem = @list.lastChild
    @selectedItem.classList.add('selected')

  addItemFor: (name, plugin) ->
    item = document.createElement('li')
    item.classList.add('active') if plugin.isActive()
    item.textContent = name

    action = => Main.togglePluginActivation(name)

    @itemsActions.set(item, action)
    @itemsDisposables.set item, @addDisposableEventListener item, 'mousedown', (e) =>
      e.preventDefault()
      action()

    @plugins[name] = item
    @list.insertBefore item, @separator

    unless @selectedItem?
      @selectedItem = item
      @selectedItem.classList.add('selected')

  removeItemFor: (name, plugin) ->
    try @list.removeChild(@plugins[name])
    delete @plugins[name]

  activateItem: (name, plugin) ->
    @plugins[name].classList.add('active')

  deactivateItem: (name, plugin) ->
    @plugins[name].classList.remove('active')

module.exports = MinimapQuickSettingsElement = document.registerElement 'minimap-quick-settings', prototype: MinimapQuickSettingsElement.prototype