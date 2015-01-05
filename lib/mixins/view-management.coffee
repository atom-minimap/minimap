Mixin = require 'mixto'
{TextEditor} = require 'atom'
{CompositeDisposable} = require 'event-kit'
{deprecate} = require 'grim'
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
  getActiveMinimap: -> @minimapForEditor(atom.workspace.getActiveTextEditor())

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
  observeMinimaps: (iterator) ->
    return unless iterator?
    iterator({view: minimapView}) for id,minimapView of @minimapViews
    createdCallback = (minimapView) -> iterator(minimapView)
    disposable = @onDidCreateMinimap(createdCallback)
    disposable.off = ->
      deprecate('Use Disposable::dispose instead')
      disposable.dispose()
    disposable

  eachMinimapView: (iterator) ->
    deprecate('Use Minimap::observeMinimaps instead')
    @observeMinimaps(iterator)

  # Internal: Destroys all views currently in use.
  destroyViews: ->
    view.destroy() for id, view of @minimapViews
    @observePaneSubscription?.dispose()
    @minimapViews = {}

  # Internal: Registers to each pane view existing or to be created and creates
  # a {MinimapView} instance for each.
  createViews: ->
    # When toggled we'll look for each existing and future editors thanks to
    # the `eacheditorView` method. It returns a subscription object so we'll
    # store it and it will be used in the `deactivate` method to removes
    # the callback.
    @observePaneSubscription = atom.workspace.observePanes (pane) =>
      paneSubscriptions = new CompositeDisposable
      paneView = atom.views.getView(pane)

      paneSubscriptions.add pane.onDidDestroy =>
        paneSubscriptions.dispose()
        requestAnimationFrame => @updateAllViews()

      paneSubscriptions.add pane.observeActiveItem (item) =>
        if item instanceof TextEditor
          paneView.classList.add('with-minimap')
        else
          paneView.classList.remove('with-minimap')

      paneSubscriptions.add pane.observeItems (item) =>
        if item instanceof TextEditor
          @onEditorAdded(item, pane)
          paneView.classList.add('with-minimap')
        else
          paneView.classList.remove('with-minimap')

      @updateAllViews()

  onEditorAdded: (editor, pane) ->
    MinimapView ||= require '../minimap-view'

    editorId = editor.id
    editorView = atom.views.getView(editor)
    paneView = atom.views.getView(pane)

    return unless editorView? and paneView?

    if (view = @minimapViews[editorId])?
      view.paneView = paneView
      view.setEditorView editorView
      view.detachFromPaneView()
      view.attachToPaneView()
      return

    view = new MinimapView(editorView, paneView)

    @minimapViews[editorId] = view

    event = {view}
    @emitter.emit('did-create-minimap', event)

    view.updateMinimapRenderView()

    subscriptions = new CompositeDisposable
    subscriptions.add editor.onDidDestroy =>
      view = @minimapViews[editorId]

      event = {view}
      if view?
        @emitter.emit('will-destroy-minimap', event)

        view.destroy()
        delete @minimapViews[editorId]

        @emitter.emit('did-destroy-minimap', event)

        if paneView.getActiveView()?.classList.contains('editor')
          paneView.classList.add('with-minimap')
