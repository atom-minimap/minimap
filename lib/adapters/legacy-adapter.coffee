# Internal:
module.exports =
class LegacyAdater
  constructor: (@textEditor) ->

  enableCache: -> @useCache = true

  clearCache: ->
    @useCache = false
    delete @heightCache
    delete @scrollTopCache
    delete @scrollLeftCache
    delete @maxScrollTopCache

  onDidChangeScrollTop: (callback) ->
    @textEditor.onDidChangeScrollTop(callback)

  onDidChangeScrollLeft: (callback) ->
    @textEditor.onDidChangeScrollLeft(callback)

  getHeight: ->
    return @heightCache ?= @textEditor.getHeight() if @useCache
    @textEditor.getHeight()

  getScrollTop: ->
    return @scrollTopCache ?= @textEditor.getScrollTop() if @useCache
    @textEditor.getScrollTop()

  setScrollTop: (scrollTop) ->
    @textEditor.setScrollTop(scrollTop)

  getScrollLeft: ->
    return @scrollLeftCache ?= @textEditor.getScrollLeft() if @useCache
    @textEditor.getScrollLeft()

  getMaxScrollTop: ->
    return @maxScrollTopCache if @maxScrollTopCache? and @useCache
    maxScrollTop = @textEditor.displayBuffer.getMaxScrollTop()
    lineHeight = @textEditor.getLineHeightInPixels()

    maxScrollTop -= @getHeight() - 3 * lineHeight if @scrollPastEnd
    return @maxScrollTopCache = maxScrollTop if @useCache
    maxScrollTop
