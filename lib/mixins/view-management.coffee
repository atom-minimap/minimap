{EditorView} = require 'atom'
Mixin = require 'mixto'
MinimapView = null

# Public: Provides methods to manage minimap views per pane.
module.exports =
class ViewManagement extends Mixin
  # Internal: Stores each MinimapView using the id of their PaneView
  minimapViews: {}

  # Public: Updates all views currently in use.
  updateAllViews: ->
    view.onScrollViewResized() for id,view of @minimapViews

  # Public: Returns the {MinimapView} object associated to the
  # passed-in {EditorView}.
  #
  # editorView - An {EditorView} instance
  #
  # Returns the {MinimapView} object associated to the passed-in {EditorView}.
  minimapForEditorView: (editorView) ->
    @minimapForEditor(editorView?.getEditor())

  # Public: Returns the {MinimapView} object associated to the
  # passed-in {Editor}.
  #
  # editorView - An {Editor} instance
  #
  # Returns the {MinimapView} object associated to the passed-in {Editor}.
  minimapForEditor: (editor) ->
    @minimapViews[editor.id] if editor?

  # Public: Calls `iterator` for each present and future minimap views.
  #
  # iterator - A {Function} to call for each minimap view. It will receive
  #            an object with the following property:
  #            * view - The {MinimapView} instance
  #
  # Returns a subscription object with a `off` method so that it is possible to
  # unsubscribe the iterator from being called for future views.
  eachMinimapView: (iterator) ->
    return unless iterator?
    iterator({view: minimapView}) for id,minimapView of @minimapViews
    createdCallback = (minimapView) -> iterator(minimapView)
    @on('minimap-view:created', createdCallback)
    off: => @off('minimap-view:created', createdCallback)

  # Internal: Destroys all views currently in use.
  destroyViews: ->
    view.destroy() for id, view of @minimapViews
    @eachEditorViewSubscription?.off()
    @minimapViews = {}

  # Internal: Registers to each pane view existing or to be created and creates
  # a {MinimapView} instance for each.
  createViews: ->
    # When toggled we'll look for each existing and future editors thanks to
    # the `eacheditorView` method. It returns a subscription object so we'll
    # store it and it will be used in the `deactivate` method to removes
    # the callback.
    @eachEditorViewSubscription = atom.workspaceView.eachEditorView (editorView) =>
      MinimapView ||= require '../minimap-view'

      editorId = editorView.editor.id
      paneView = editorView.getPane()

      view = new MinimapView(editorView)

      @minimapViews[editorId] = view
      @emit('minimap-view:created', {view})

      view.updateMinimapEditorView()

      editorView.editor.on 'destroyed', =>
        view = @minimapViews[editorId]

        if view?
          @emit('minimap-view:will-be-destroyed', {view})

          view.destroy()
          delete @minimapViews[editorId]
          @emit('minimap-view:destroyed', {view})

          paneView.addClass('with-minimap') if paneView.activeView?.hasClass('editor')
