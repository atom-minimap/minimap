# Internal:
module.exports =
class BetaAdater
  constructor: (@textEditor) ->
    @textEditorElement = atom.views.getView(@textEditor)

  enableCache: -> @useCache = true

  clearCache: ->
    @useCache = false
    delete @heightCache
    delete @scrollTopCache
    delete @scrollLeftCache
    delete @maxScrollTopCache

  onDidChangeScrollTop: (callback) ->
    @textEditorElement.onDidChangeScrollTop(callback)

  onDidChangeScrollLeft: (callback) ->
    @textEditorElement.onDidChangeScrollLeft(callback)

  getHeight: ->
    return @heightCache ?= @textEditorElement.getHeight() if @useCache
    @textEditorElement.getHeight()

  getScrollTop: ->
    return @scrollTopCache ?= @textEditorElement.getScrollTop() if @useCache
    @textEditorElement.getScrollTop()

  setScrollTop: (scrollTop) ->
    @textEditorElement.setScrollTop(scrollTop)

  getScrollLeft: ->
    return @scrollLeftCache ?= @textEditorElement.getScrollLeft() if @useCache
    @textEditorElement.getScrollLeft()

  getMaxScrollTop: ->
    return @maxScrollTopCache if @maxScrollTopCache? and @useCache
    maxScrollTop = @textEditorElement.getScrollHeight() - @getHeight()
    lineHeight = @textEditor.getLineHeightInPixels()

    maxScrollTop -= @getHeight() - 3 * lineHeight if @scrollPastEnd
    return @maxScrollTopCache = maxScrollTop if @useCache
    maxScrollTop
