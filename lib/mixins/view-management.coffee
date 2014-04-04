Mixin = require 'mixto'
MinimapView = require '../minimap-view'

# Public: Provides methods to manage minimap views per pane.
module.exports =
class ViewManagement extends Mixin
  # We'll be storing each MinimapView using the id of their PaneView
  minimapViews: {}

  updateAllViews: ->
    view.onScrollViewResized() for id,view of @minimapViews

  minimapForEditorView: (editorView) ->
    @minimapForPaneView(editorView.getPane())

  minimapForPaneView: (paneView) -> @minimapForPane(paneView.model)
  minimapForPane: (pane) -> @minimapViews[pane.id]

  destroyViews: ->
    view.destroy() for id, view of @minimapViews
    @eachPaneViewSubscription.off()
    @minimapViews = {}

  createViews: ->
    # When toggled we'll look for each existing and future pane thanks to
    # the `eachPaneView` method. It returns a subscription object so we'll
    # store it and it will be used in the `deactivate` method to removes
    # the callback.
    @eachPaneViewSubscription = atom.workspaceView.eachPaneView (paneView) =>
      paneId = paneView.model.id
      view = new MinimapView(paneView, @allowDebug)
      view.onActiveItemChanged(paneView.getActiveItem())
      @updateAllViews()

      @minimapViews[paneId] = view
      @emit('minimap-view:created', view)

      paneView.model.on 'destroyed', =>
        view = @minimapViews[paneId]

        if view?
          @emit('minimap-view:before-destruction', view)

          view.destroy()
          delete @minimapViews[paneId]
          @updateAllViews()
