{CompositeDisposable} = require 'event-kit'

module.exports =
class Minimap
  constructor: ({@textEditor}) ->
    @subscriptions = new CompositeDisposable
    @subscribeToConfig()

  getTextEditor: -> @textEditor

  getTextEditorHeight: -> @textEditor.getHeight() * @getScaleFactor()

  getTextEditorScroll: -> @textEditor.getScrollTop() * @getScaleFactor()

  getHeight: -> @textEditor.getLineCount() * @getLineHeight()

  getScaleFactor: -> @getLineHeight() / @textEditor.getLineHeightInPixels()

  getLineHeight: -> @charHeight + @interline

  getMinimapScrollHeight: -> Math.max(0, @getHeight() - @textEditor.getHeight())

  canScroll: -> @getMinimapScrollHeight() > 0

  subscribeToConfig: ->
    @subscriptions.add atom.config.observe 'minimap.charHeight', (@charHeight) =>
    @subscriptions.add atom.config.observe 'minimap.charWidth', (@charWidth) =>

    @subscriptions.add atom.config.observe 'minimap.interline', (@interline) =>
