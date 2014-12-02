{View} = require 'atom-space-pen-views'
MinimapQuickSettingsView = require './minimap-quick-settings-view'

module.exports =
class MinimapOpenQuickSettingsView extends View
  @content: ->
    @div class: 'open-minimap-quick-settings'

  dropdown: null

  initialize: (minimap) ->
    @on 'mousedown', (e) =>
      e.preventDefault()
      e.stopPropagation()

      if @dropdown?
        @dropdown.destroy()
      else
        offset = minimap.offset()
        @dropdown = new MinimapQuickSettingsView(minimap)

        css = top: offset.top
        if atom.config.get('minimap.displayMinimapOnLeft')
          css.left = offset.left + minimap.width()
        else
          css.right =  window.innerWidth - offset.left

        @dropdown.css(css).attach()

        @dropdown.onDidDestroy =>
          @dropdown.off()
          @dropdown = null
