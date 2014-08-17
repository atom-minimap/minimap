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
        offset = @offset()
        @dropdown = new MinimapPluginsDropdownView
        @dropdown.css
          top: offset.top
          right: window.innerWidth - offset.left

        @dropdown.attach()

        @dropdown.on 'minimap:settings-dropdown-destroyed', =>
          @dropdown.off()
          @dropdown = null
