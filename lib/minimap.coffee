{CompositeDisposable} = require 'event-kit'

module.exports =
class Minimap
  constructor: ({@textEditor}) ->
    @subscriptions = new CompositeDisposable
    @subscribeToConfig()

  getTextEditor: -> @textEditor

  getTextEditorHeight: -> @textEditor.getHeight() * @getScaleFactor()

  getTextEditorScrollTop: -> @textEditor.getScrollTop() * @getScaleFactor()

  getTextEditorScrollRatio: ->
    @textEditor.getScrollTop() / @textEditor.displayBuffer.getMaxScrollTop()

  getHeight: -> @textEditor.getLineCount() * @getLineHeight()

  getScaleFactor: -> @getLineHeight() / @textEditor.getLineHeightInPixels()

  getLineHeight: -> @charHeight + @interline

  getFirstVisibleScreenRow: ->
    Math.floor(@getMinimapScrollTop() / @getLineHeight())

  getLastVisibleScreenRow: ->
    Math.ceil((@getMinimapScrollTop() + @textEditor.getHeight()) / @getLineHeight())

  getMinimapScrollTop: ->
    Math.abs(@getTextEditorScrollRatio() * @getMinimapMaxScrollTop())

  getMinimapMaxScrollTop: -> Math.max(0, @getHeight() - @textEditor.getHeight())

  canScroll: -> @getMinimapMaxScrollTop() > 0

  subscribeToConfig: ->
    @subscriptions.add atom.config.observe 'minimap.charHeight', (@charHeight) =>
    @subscriptions.add atom.config.observe 'minimap.charWidth', (@charWidth) =>

    @subscriptions.add atom.config.observe 'minimap.interline', (@interline) =>
