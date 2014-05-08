Mixin = require 'mixto'
MinimapView = require '../minimap-view'

# Public: Provides methods to manage minimap views per pane.
module.exports =
class ViewManagement extends Mixin
  # Internal: Stores each MinimapView using the id of their PaneView
  minimapViews: {}

  # Public: Updates all views currently in use.
  updateAllViews: ->
    view.onScrollViewResized() for id,view of @minimapViews

  # Public: Returns the {MinimapView} object associated to the pane containing
  # the passed-in {EditorView}.
  #
  # editorView - An {EditorView} instance
  #
  # Returns the {MinimapView} object associated to the pane containing
  # the passed-in {EditorView}.
  minimapForEditorView: (editorView) ->
    @minimapForPaneView(editorView?.getPane())

  # Public: Returns the {MinimapView} object associated to the passed-in
  # {PaneView} object.
  #
  # paneView - A {PaneView} instance
  #
  # Returns the {MinimapView} object associated to the passed-in
  # {PaneView} object.
  minimapForPaneView: (paneView) -> @minimapForPane(paneView?.model)

  # Public: Returns the {MinimapView} object associated to the passed-in
  # {Pane} object.
  #
  # pane - A {Pane} instance
  #
  # Returns the {MinimapView} object associated to the passed-in
  # {Pane} object.
  minimapForPane: (pane) -> @minimapViews[pane.id] if pane?

  # Internal: Destroys all views currently in use.
  destroyViews: ->
    view.destroy() for id, view of @minimapViews
    @eachPaneViewSubscription?.off()
    @minimapViews = {}

  # Internal: Registers to each pane view existing or to be created and creates
  # a {MinimapView} instance for each.
  createViews: ->
    # When toggled we'll look for each existing and future pane thanks to
    # the `eachPaneView` method. It returns a subscription object so we'll
    # store it and it will be used in the `deactivate` method to removes
    # the callback.
    @eachPaneViewSubscription = atom.workspaceView.eachPaneView (paneView) =>
      paneId = paneView.model.id
      view = new MinimapView(paneView)
      view.onActiveItemChanged(paneView.getActiveItem())
      @updateAllViews()

      @minimapViews[paneId] = view
      @emit('minimap-view:created', {view})

      paneView.model.on 'destroyed', =>
        view = @minimapViews[paneId]

        if view?
          @emit('minimap-view:will-be-destroyed', {view})

          view.destroy()
          delete @minimapViews[paneId]
          @emit('minimap-view:destroyed', {view})
          @updateAllViews()
