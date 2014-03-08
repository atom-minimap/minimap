{View} = require 'atom'

module.exports =
class MinimapView extends View
  @content: ->
    @div class: 'minimap overlay from-top', =>
      @div "The Minimap package is Alive! It's ALIVE!", class: "message"

  initialize: (serializeState) ->
    atom.workspaceView.command "minimap:toggle", => @toggle()

  # Returns an object that can be retrieved when package is activated
  serialize: ->

  # Tear down any state and detach
  destroy: ->
    @detach()

  toggle: ->
    console.log "MinimapView was toggled!"
    if @hasParent()
      @detach()
    else
      itemViews = atom.workspaceView.getActiveView()
      top = itemViews.offset().top
      clone = itemViews.clone()
      this.css('top', top + 'px')
      this.html(clone)
      atom.workspaceView.getActivePaneView().append(this)
