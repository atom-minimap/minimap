# Internal: 
module.exports =
class BetaAdater
  constructor: (@textEditor) ->
    @textEditorElement = atom.views.getView(@textEditor)

  onDidChangeScrollTop: (callback) ->
    @textEditorElement.onDidChangeScrollTop(callback)

  onDidChangeScrollLeft: (callback) ->
    @textEditorElement.onDidChangeScrollLeft(callback)

  getHeight: ->
    @textEditorElement.getHeight()

  getScrollTop: ->
    @textEditorElement.getScrollTop()

  setScrollTop: (scrollTop) ->
    @textEditorElement.setScrollTop(scrollTop)

  getScrollLeft: ->
    @textEditorElement.getScrollLeft()

  getHeightWithoutScrollPastEnd: ->
    @textEditor.displayBuffer.getLineHeightInPixels()

  getMaxScrollTop: ->
    maxScrollTop = @textEditorElement.getScrollHeight() - @getHeight()
    lineHeight = @textEditor.getLineHeightInPixels()

    maxScrollTop -= @getHeight() - 3 * lineHeight if @scrollPastEnd
    maxScrollTop
