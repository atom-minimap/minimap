# Internal: 
module.exports =
class LegacyAdater
  constructor: (@textEditor) ->

  onDidChangeScrollTop: (callback) ->
    @textEditor.onDidChangeScrollTop(callback)

  onDidChangeScrollLeft: (callback) ->
    @textEditor.onDidChangeScrollLeft(callback)

  getHeight: ->
    @textEditor.getHeight()

  getScrollTop: ->
    @textEditor.getScrollTop()

  setScrollTop: (scrollTop) ->
    @textEditor.setScrollTop(scrollTop)

  getScrollLeft: ->
    @textEditor.getScrollLeft()

  getHeightWithoutScrollPastEnd: ->
    @textEditor.displayBuffer.getLineHeightInPixels()

  getMaxScrollTop: ->
    maxScrollTop = @textEditor.displayBuffer.getMaxScrollTop()
    lineHeight = @textEditor.getLineHeightInPixels()

    maxScrollTop -= @getHeight() - 3 * lineHeight if @scrollPastEnd
    maxScrollTop
