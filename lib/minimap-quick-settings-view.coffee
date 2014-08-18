{View} = require 'atom'
$ = View.__super__.constructor

Minimap = require './minimap'

module.exports =
class MinimapQuickSettingsView extends View
  @content: ->
    @div class: 'select-list popover-list minimap-quick-settings', =>
      @input type: 'text', class: 'hidden-input', outlet: 'hiddenInput'
      @ol class: 'list-group mark-active', outlet: 'list', =>
        @li class: 'separator', outlet: 'separator'
        @li class: (if atom.config.get('minimap.displayCodeHighlights') then 'active' else ''), outlet: 'codeHighlights', 'code-highlights'

  selectedItem: null

  initialize: (@minimapView) ->
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

    @subscribe @codeHighlights, 'mousedown', (e) =>
      e.preventDefault()
      @minimapView.setDisplayCodeHighlights(!@minimapView.displayCodeHighlights)
      @codeHighlights.toggleClass('active', @minimapView.displayCodeHighlights)

    @hiddenInput.on 'focusout', @destroy

    @initList()

  attach: ->
    atom.workspaceView.append this
    @hiddenInput.focus()

  destroy: =>
    @trigger('minimap:quick-settings-destroyed')
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
      @selectedItem = @selectedItem.next() if @selectedItem.is('.separator')
    else
      @selectedItem = @list.children().first()
    @selectedItem.addClass('selected')

  selectPreviousItem: =>
    @selectedItem.removeClass('selected')
    if @selectedItem.index() isnt 0
      @selectedItem = @selectedItem.prev()
      @selectedItem = @selectedItem.prev() if @selectedItem.is('.separator')
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
    @separator.before item
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
