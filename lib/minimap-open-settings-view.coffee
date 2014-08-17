{View} = require 'atom'
MinimapPluginsDropdownView = require './minimap-plugins-dropdown-view'

module.exports =
class MinimapOpenSettingsView extends View
  @content: ->
    @div class: 'open-minimap-settings'

  dropdown: null

  initialize: ->
    @on 'click', =>
      if @dropdown?
        @dropdown.destroy()
      else
        minimap = @parent()
        offset = minimap.offset()
        @dropdown = new MinimapPluginsDropdownView

        css = top: offset.top
        if atom.config.get('minimap.displayMinimapOnLeft')
          css.left = offset.left + minimap.width()
        else
          css.right =  window.innerWidth - offset.left

        @dropdown.css(css).attach()

        @dropdown.on 'minimap:settings-dropdown-destroyed', =>
          @dropdown.off()
          @dropdown = null
