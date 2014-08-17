{View} = require 'atom'
$ = View.__super__.constructor

Minimap = require './minimap'

module.exports =
class MinimapPluginsDropdownView extends View
  @content: ->
    @div class: 'select-list popover-list minimap-plugins-list', =>
      @input type: 'text', class: 'hidden-input', outlet: 'hiddenInput'
      @ol class: 'list-group mark-active', outlet: 'list'

  selectedItem: null

  initialize: ->
    @plugins = {}
    @subscribe Minimap, 'plugin:added', ({name, plugin}) =>
      @addItemFor(name, plugin)
    @subscribe Minimap, 'plugin:removed', ({name, plugin}) =>
      @removeItemFor(name, plugin)
    @subscribe Minimap, 'plugin:activated', ({name, plugin}) =>
      @activateItem(name, plugin)
    @subscribe Minimap, 'plugin:deactivated', ({name, plugin}) =>
      @deactivateItem(name, plugin)

    @on 'core:move-up', @selectPreviousItem
    @on 'core:move-down', @selectNextItem
    @on 'core:cancel', @destroy
    @on 'core:validate', @toggleSelectedItem

    @hiddenInput.on 'focusout', @destroy

    @initList()

  attach: ->
    atom.workspaceView.append this
    @hiddenInput.focus()

  destroy: =>
    @trigger('minimap:plugins-dropdown-destroyed')
    @off()
    @hiddenInput.off()
    @unsubscribe()
    @detach()

  initList: ->
    @addItemFor(name, plugin) for name, plugin of Minimap.plugins

  toggleSelectedItem: =>
    @selectedItem.mousedown()

  selectNextItem: =>
    @selectedItem.removeClass('selected')
    if @selectedItem.index() isnt @list.children().length - 1
      @selectedItem = @selectedItem.next()
    else
      @selectedItem = @list.children().first()
    @selectedItem.addClass('selected')

  selectPreviousItem: =>
    @selectedItem.removeClass('selected')
    if @selectedItem.index() isnt 0
      @selectedItem = @selectedItem.prev()
    else
      @selectedItem = @list.children().last()
    @selectedItem.addClass('selected')

  addItemFor: (name, plugin) ->
    cls = if plugin.isActive() then 'active' else ''
    item = $("<li class='#{cls}'>#{name}</li>")
    item.on 'mousedown', (e) =>
      e.preventDefault()
      @trigger "minimap:toggle-#{name}"
    @plugins[name] = item
    @list.append item
    unless @selectedItem?
      @selectedItem = item
      @selectedItem.addClass('selected')

  removeItemFor: (name, plugin) ->
    @list.remove(@plugins[name])
    delete @plugins[name]

  activateItem: (name, plugin) ->
    @plugins[name].addClass('active')

  deactivateItem: (name, plugin) ->
    @plugins[name].removeClass('active')
