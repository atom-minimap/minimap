{registerOrUpdateElement, EventsDelegation, SpacePenDSL} = require 'atom-utils'
{CompositeDisposable, Emitter} = require 'atom'

Main = require './main'

# Internal: The {MinimapQuickSettingsElement} class is used to display
# the Minimap quick settings when clicking on the corresponding button.
class MinimapQuickSettingsElement
  SpacePenDSL.includeInto(this)
  EventsDelegation.includeInto(this)

  @content: ->
    @div class: 'select-list popover-list minimap-quick-settings', =>
      @input type: 'text', class: 'hidden-input', outlet: 'hiddenInput'
      @ol class: 'list-group mark-active', outlet: 'list', =>
        @li class: 'separator', outlet: 'separator'
        @li class: 'code-highlights', outlet: 'codeHighlights', 'code-highlights'
        @li class: 'absolute-mode', outlet: 'absoluteMode', 'absolute-mode'
      @div class: 'btn-group', =>
        @button class: 'btn btn-default', outlet: 'onLeftButton', 'On Left'
        @button class: 'btn btn-default', outlet: 'onRightButton', 'On Right'

  selectedItem: null

  setModel: (@minimap) ->
    @emitter = new Emitter
    @subscriptions = new CompositeDisposable
    @plugins = {}
    @itemsActions = new WeakMap

    @subscriptions.add Main.onDidAddPlugin ({name, plugin}) =>
      @addItemFor(name, plugin)
    @subscriptions.add Main.onDidRemovePlugin ({name, plugin}) =>
      @removeItemFor(name, plugin)
    @subscriptions.add Main.onDidActivatePlugin ({name, plugin}) =>
      @activateItem(name, plugin)
    @subscriptions.add Main.onDidDeactivatePlugin ({name, plugin}) =>
      @deactivateItem(name, plugin)

    @subscriptions.add atom.commands.add 'minimap-quick-settings',
      'core:move-up': => @selectPreviousItem()
      'core:move-down': => @selectNextItem()
      'core:move-left': -> atom.config.set('minimap.displayMinimapOnLeft', true)
      'core:move-right': -> atom.config.set('minimap.displayMinimapOnLeft', false)
      'core:cancel': => @destroy()
      'core:confirm': => @toggleSelectedItem()

    @codeHighlights.classList.toggle('active', @minimap.displayCodeHighlights)
    @subscriptions.add @subscribeTo @codeHighlights,
      'mousedown': (e) =>
        e.preventDefault()
        atom.config.set('minimap.displayCodeHighlights', !@minimap.displayCodeHighlights)

    @itemsActions.set @codeHighlights, =>
      atom.config.set('minimap.displayCodeHighlights', !@minimap.displayCodeHighlights)

    @subscriptions.add @subscribeTo @absoluteMode,
      'mousedown': (e) =>
        e.preventDefault()
        atom.config.set('minimap.absoluteMode', !atom.config.get('minimap.absoluteMode'))

    @itemsActions.set @absoluteMode, =>
      atom.config.set('minimap.absoluteMode', !atom.config.get('minimap.absoluteMode'))

    @subscriptions.add @subscribeTo @hiddenInput,
      'focusout': (e) =>
        @destroy()

    @subscriptions.add @subscribeTo @onLeftButton,
      'mousedown': (e) ->
        e.preventDefault()
        atom.config.set('minimap.displayMinimapOnLeft', true)

    @subscriptions.add @subscribeTo @onRightButton,
      'mousedown': (e) ->
        e.preventDefault()
        atom.config.set('minimap.displayMinimapOnLeft', false)

    @subscriptions.add atom.config.observe 'minimap.displayCodeHighlights', (bool) =>
      @codeHighlights.classList.toggle('active', bool)

    @subscriptions.add atom.config.observe 'minimap.absoluteMode', (bool) =>
      @absoluteMode.classList.toggle('active', bool)

    @subscriptions.add atom.config.observe 'minimap.displayMinimapOnLeft', (bool) =>
      @onLeftButton.classList.toggle('selected', bool)
      @onRightButton.classList.toggle('selected', not bool)

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

module.exports =
MinimapQuickSettingsElement = registerOrUpdateElement 'minimap-quick-settings', MinimapQuickSettingsElement.prototype
