{View} = require 'atom'
MinimapQuickSettingsView = require './minimap-quick-settings-view'

module.exports =
class MinimapOpenQuickSettingsView extends View
  @content: ->
    @div class: 'open-minimap-quick-settings'
  
  dropdown: null

  initialize: ->
    @on 'mousedown', (e) =>
      e.preventDefault()
      e.stopPropagation()

      if @dropdown?
        @dropdown.destroy()
      else
        minimap = @parent()
        offset = minimap.offset()
        @dropdown = new MinimapQuickSettingsView(@parent().data('view'))

        css = top: offset.top
        if atom.config.get('minimap.displayMinimapOnLeft')
          css.left = offset.left + minimap.width()
        else
          css.right =  window.innerWidth - offset.left

        @dropdown.css(css).attach()

        @dropdown.on 'minimap:quick-settings-destroyed', =>
          @dropdown.off()
          @dropdown = null
