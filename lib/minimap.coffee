{Emitter} = require 'emissary'
MinimapView = require './minimap-view'

class Minimap
  Emitter.includeInto(this)

  # We'll be storing each MinimapView using the id of their PaneView
  minimapViews: {}

  # We'll be using this property to store the toggle state as the
  # minimapViews object will never be set to null.
  active: false

  activate: ->
    atom.workspaceView.command 'minimap:toggle', => @toggle()

  deactivate: ->
    view.destroy() for id, view of @minimapViews
    @eachPaneViewSubscription.off()
    @minimapViews = {}
    @emit('deactivated')

  toggle: ->
    if @active
      @deactivate()
    else
      @open()
      @emit('activated')

    @active = not @active

  updateAllViews: ->
    view.onScrollViewResized() for id,view of @minimapViews

  open: ->
    # When toggled we'll look for each existing and future pane thanks to
    # the `eachPaneView` method. It returns a subscription object so we'll
    # store it and it will be used in the `deactivate` method to removes
    # the callback.
    @eachPaneViewSubscription = atom.workspaceView.eachPaneView (paneView) =>
      view = new MinimapView(paneView)
      view.onActiveItemChanged(paneView.getActiveItem())
      @updateAllViews()

      @minimapViews[paneView.model.id] = view
      @emit('minimap-view:created', view)

      paneView.model.on 'destroyed', =>
        view = @minimapViews[paneView.model.id]

        if view?
          @emit('minimap-view:before-destruction', view)

          view.destroy()
          delete @minimapViews[paneView.model.id]
          @updateAllViews()



module.exports = new Minimap()
