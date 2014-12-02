Mixin = require 'mixto'
{CompositeDisposable} = require 'event-kit'
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
  # passed-in `TextEditorView`.
  #
  # editorView - An `TextEditorView` instance
  #
  # Returns a {MinimapView}.
  minimapForEditorView: (editorView) ->
    @minimapForEditor(editorView?.getEditor())

  # Public: Returns the {MinimapView} object associated to the
  # passed-in `Editor`.
  #
  # editorView - An `Editor` instance
  #
  # Returns a {MinimapView}.
  minimapForEditor: (editor) ->
    @minimapViews[editor.id] if editor?

  # Public: Returns the {MinimapView} of the active editor view.
  #
  # Returns a {MinimapView}.
  getActiveMinimap: -> @minimapForEditor(atom.workspace.getActiveEditor())

  # Public: Calls `iterator` for each present and future minimap views.
  # It returns a subscription {Object} with a `off` method so that
  # it is possible to unsubscribe the iterator from being called
  # for future views.
  #
  # iterator - A {Function} to call for each minimap view. It will receive
  #            an object with the following property:
  #            * view - The {MinimapView} instance
  #
  # Returns an {Object}.
  eachMinimapView: (iterator) ->
    return unless iterator?
    iterator({view: minimapView}) for id,minimapView of @minimapViews
    createdCallback = (minimapView) -> iterator(minimapView)
    disposable = @onDidCreateMinimap(createdCallback)
    off: => disposable.dispose()

  # Internal: Destroys all views currently in use.
  destroyViews: ->
    view.destroy() for id, view of @minimapViews
    @eachEditorViewSubscription?.dispose()
    @minimapViews = {}

  # Internal: Registers to each pane view existing or to be created and creates
  # a {MinimapView} instance for each.
  createViews: ->
    # When toggled we'll look for each existing and future editors thanks to
    # the `eacheditorView` method. It returns a subscription object so we'll
    # store it and it will be used in the `deactivate` method to removes
    # the callback.
    @eachEditorViewSubscription = atom.workspace.observeTextEditors (editor) =>
      editorView = atom.views.getView(editor)
      MinimapView ||= require '../minimap-view'

      editorId = editor.id
      pane = atom.workspace.paneForItem(editor)
      paneView = atom.views.getView(pane)

      return unless paneView?

      if (view = @minimapViews[editorId])?
        view.setEditorView editorView
        view.detachFromPaneView()
        view.attachToPaneView()
        return

      view = new MinimapView(editorView)

      @minimapViews[editorId] = view

      event = {view}
      @emit('minimap-view:created', event)
      @emitter.emit('did-create-minimap', event)

      view.updateMinimapRenderView()

      subscriptions = new CompositeDisposable
      subscriptions.add editor.onDidDestroy =>
        view = @minimapViews[editorId]

        event = {view}
        if view?
          @emit('minimap-view:will-be-destroyed', event)
          @emitter.emit('will-destroy-minimap', event)

          view.destroy()
          delete @minimapViews[editorId]

          @emit('minimap-view:destroyed', {view})
          @emitter.emit('did-destroy-minimap', event)

          if paneView.getActiveView()?.classList.contains('editor')
            paneView.classList.add('with-minimap')
