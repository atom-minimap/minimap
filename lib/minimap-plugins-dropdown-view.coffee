{View} = require 'atom'
$ = View.__super__.constructor

Minimap = require './minimap'

module.exports =
class MinimapPluginsDropdownView extends View
  @content: ->
    @div class: 'select-list popover-list minimap-plugins-list', =>
      @input type: 'text', class: 'hidden-input', outlet: 'hiddenInput'
      @ol class: 'list-group mark-active', outlet: 'list'

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

    @on 'core:cancel', @destroy
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

  addItemFor: (name, plugin) ->
    cls = if plugin.isActive() then 'active' else ''
    item = $("<li class='#{cls}'>#{name}</li>")
    item.on 'mousedown', (e) =>
      e.preventDefault()
      @trigger "minimap:toggle-#{name}"
    @plugins[name] = item
    @list.append item

  removeItemFor: (name, plugin) ->
    @list.remove(@plugins[name])
    delete @plugins[name]

  activateItem: (name, plugin) ->
    @plugins[name].addClass('active')

  deactivateItem: (name, plugin) ->
    @plugins[name].removeClass('active')
