{EditorView, ScrollView, $} = require 'atom'
{Emitter} = require 'emissary'
Delegato = require 'delegato'
DecorationManagement = require './mixins/decoration-management'
Debug = require 'prolix'

module.exports =
class MinimapEditorView extends ScrollView
  Emitter.includeInto(this)
  Delegato.includeInto(this)
  DecorationManagement.includeInto(this)
  Debug('minimap').includeInto(this)

  @delegatesMethods 'getMarker', 'findMarkers', toProperty: 'editor'

  @content: ->
    @div class: 'minimap-editor editor editor-colors', =>
      @tag 'canvas', {
        outlet: 'lineCanvas'
        class: 'minimap-canvas'
        id: 'line-canvas'
      }

  frameRequested: false

  constructor: ->
    super
    @pendingChanges = []
    @context = @lineCanvas[0].getContext('2d')
    @tokenColorCache = {}
    @decorationColorCache = {}
    @initializeDecorations()
    @tokenized = false

    @offscreenCanvas = document.createElement('canvas')
    @offscreenCtxt = @offscreenCanvas.getContext('2d')

  initialize: ->
    @lineCanvas.webkitImageSmoothingEnabled = false

    @lineHeight = atom.config.get 'minimap.lineHeight'
    @charWidth = atom.config.get 'minimap.charWidth'
    @charHeight = atom.config.get 'minimap.charHeight'
    @textOpacity = atom.config.get 'minimap.textOpacity'

    atom.config.observe 'minimap.lineHeight', (@lineHeight) =>
      @emit 'minimap:scaleChanged'
      @forceUpdate()
    atom.config.observe 'minimap.charWidth', (@charWidth) => @forceUpdate()
    atom.config.observe 'minimap.charHeight', (@charHeight) => @forceUpdate()
    atom.config.observe 'minimap.textOpacity', (@textOpacity) => @forceUpdate()

  pixelPositionForScreenPosition: (position) ->
    {row, column} = @buffer.constructor.Point.fromObject(position)
    actualRow = Math.floor(row)

    {top: row * @getLineHeight(), left: column}

  # This prevent plugins that relies on these methods to break
  addLineClass: ->
  removeLineClass: ->
  removeAllLineClasses: ->

  destroy: ->
    @unsubscribe()
    @editorView = null

  setEditorView: (@editorView) ->
    @editor = @editorView.getModel()
    @buffer = @editorView.getEditor().getBuffer()
    @displayBuffer = @editor.displayBuffer

    @subscribe @editor, 'screen-lines-changed.minimap', (changes) =>
      @stackChanges(changes)

    @subscribe @displayBuffer, 'tokenized.minimap', =>
      @tokenized = true
      @requestUpdate()

  stackChanges: (changes) ->
    @pendingChanges.push changes
    @requestUpdate()

  requestUpdate: ->
    return if @frameRequested
    @frameRequested = true

    requestAnimationFrame =>
      @startBench()
      @update()
      @endBench('minimap update')
      @frameRequested = false

  forceUpdate: ->
    @tokenColorCache = {}
    @decorationColorCache = {}
    @offscreenFirstRow = null
    @offscreenLastRow = null
    @requestUpdate()

  scrollTop: (scrollTop, options={}) ->
    return @cachedScrollTop or 0 unless scrollTop?
    return if scrollTop is @cachedScrollTop

    @cachedScrollTop = scrollTop
    @update()

  getMinimapHeight: -> @getLinesCount() * @getLineHeight()
  getLineHeight: -> @lineHeight
  getCharHeight: -> @charHeight
  getCharWidth: -> @charWidth
  getTextOpacity: -> @textOpacity
  getLinesCount: -> @editorView.getEditor().getScreenLineCount()

  getMinimapScreenHeight: -> @minimapView.height() #/ @minimapView.scaleY
  getMinimapHeightInLines: -> Math.ceil(@getMinimapScreenHeight() / @getLineHeight())

  getFirstVisibleScreenRow: ->
    screenRow = Math.floor(@scrollTop() / @getLineHeight())
    screenRow = 0 if isNaN(screenRow)
    screenRow

  getLastVisibleScreenRow: ->
    calculatedRow = Math.ceil((@scrollTop() + @getMinimapScreenHeight()) / @getLineHeight()) - 1
    screenRow = Math.max(0, Math.min(@editor.getScreenLineCount() - 1, calculatedRow))
    screenRow = 0 if isNaN(screenRow)
    screenRow

  getDefaultColor: ->
    @defaultColor ||= @transparentize(@minimapView.editorView.css('color'), @getTextOpacity())

  ensureDummyNodeExistence: ->
    unless @dummyNode?
      @dummyNode = document.createElement('span')
      @dummyNode.style.visibility = 'hidden'
      @editorView.append(@dummyNode)

  # This function insert a dummy token element in the DOM to compute its style,
  # return the specified property, and remove the element from the DOM.
  retrieveStyleFromDom: (scopes, property) ->
    @ensureDummyNodeExistence()

    parent = @dummyNode
    for scope in scopes
      node = document.createElement('span')
      # css class is the scope without the dots,
      # see pushScope @ atom/atom/src/lines-component.coffee
      node.className = scope.replace(/\.+/g, ' ')
      parent.appendChild(node) if parent?
      parent = node

    value = getComputedStyle(parent).getPropertyValue(property)
    @dummyNode.innerHTML = ''

    value

  retrieveTokenColorFromDom: (token)->
    # This is quite an expensive operation so results are cached in getTokenColor.
    color = @retrieveStyleFromDom(token.scopes, 'color')
    @transparentize(color, @getTextOpacity())

  getTokenColor: (token)->
    #Retrieve color from cache if available
    flatScopes = token.scopes.join()
    if flatScopes not of @tokenColorCache
      color = @retrieveTokenColorFromDom(token)
      @tokenColorCache[flatScopes] = color
    @tokenColorCache[flatScopes]

  retrieveDecorationColorFromDom: (decoration)->
    @retrieveStyleFromDom(decoration.params.scope.split(/\s+/), 'background-color')

  getDecorationColor: (decoration) ->
    return decoration.params.color if decoration.params.color?
    if decoration.params.scope not of @decorationColorCache
      color = @retrieveDecorationColorFromDom(decoration)
      @decorationColorCache[decoration.params.scope] = color
    @decorationColorCache[decoration.params.scope]

  getDecorationsByTypesForRow: (row, types..., decorations) ->
    out = []
    for id, array of decorations
      for decoration in array
        if decoration.params.type in types and
           decoration.getMarker().getScreenRange().intersectsRow(row)
          out.push decoration

    out

  drawLines: (context, firstRow, lastRow, offsetRow) ->
    return if firstRow > lastRow
    if @editor.tokenizedLinesForScreenRows?
      lines = @editor.tokenizedLinesForScreenRows(firstRow, lastRow)
    else
      lines = @editor.linesForScreenRows(firstRow, lastRow)
    lineHeight = @getLineHeight()
    charHeight = @getCharHeight()
    charWidth = @getCharWidth()
    canvasWidth = @lineCanvas.width()
    displayCodeHighlights = @minimapView.displayCodeHighlights
    decorations = @decorationsForScreenRowRange(firstRow, lastRow)

    for line, row in lines
      x = 0
      y = offsetRow + row
      screenRow = firstRow + row
      y0 = y*lineHeight

      lineDecorations = @getDecorationsByTypesForRow(screenRow, 'line', decorations)
      for decoration in lineDecorations
        context.fillStyle = @getDecorationColor(decoration)
        context.fillRect(0,y0,canvasWidth,lineHeight)

      highlightDecorations = @getDecorationsByTypesForRow(firstRow + row, 'highlight-under', decorations)
      for decoration in highlightDecorations
        @drawHighlightDecoration(context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth)

      for token in line.tokens
        w = token.screenDelta
        unless token.isOnlyWhitespace() or token.hasInvisibleCharacters
          context.fillStyle = if displayCodeHighlights
            @getTokenColor(token)
          else
            @getDefaultColor()

          chars = 0

          for char in token.value
            if /\s/.test char
              if chars > 0
                context.fillRect(x-chars, y0, chars*charWidth, charHeight)
              chars = 0
            else
              chars++

            x += charWidth

          if chars > 0
            context.fillRect(x-chars, y0, chars*charWidth, charHeight)
        else
          x += w * charWidth

      highlightDecorations = @getDecorationsByTypesForRow(firstRow + row, 'highlight', 'highlight-over', decorations)
      for decoration in highlightDecorations
        @drawHighlightDecoration(context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth)


    context.fill()

  drawHighlightDecoration: (context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth) ->
    context.fillStyle = @getDecorationColor(decoration)
    range = decoration.getMarker().getScreenRange()
    rowSpan = range.end.row - range.start.row

    if rowSpan is 0
      colSpan = range.end.column - range.start.column
      context.fillRect(range.start.column*charWidth,y*lineHeight,colSpan*charWidth,lineHeight)
    else
      if screenRow is range.start.row
        x = range.start.column * charWidth
        context.fillRect(x,y*lineHeight,canvasWidth-x,lineHeight)
      else if screenRow is range.end.row
        context.fillRect(0,y*lineHeight,range.end.column * charWidth,lineHeight)
      else
        context.fillRect(0,y*lineHeight,canvasWidth,lineHeight)

  copyBitmapPart: (context, bitmapCanvas, srcRow, destRow, rowCount) ->
    lineHeight = @getLineHeight()
    context.drawImage(bitmapCanvas,
        0, srcRow * lineHeight,
        bitmapCanvas.width, rowCount * lineHeight,
        0, destRow * lineHeight,
        bitmapCanvas.width, rowCount * lineHeight)

  fillGapsBetweenIntactRanges: (context, intactRanges, firstRow, lastRow) ->
    currentRow = firstRow
    # intactRanges is sorted, we can safely fill between ranges
    for intact in intactRanges
      @drawLines(context, currentRow, intact.start-1, currentRow-firstRow)
      currentRow = intact.end
    if currentRow <= lastRow
      @drawLines(context, currentRow, lastRow, currentRow-firstRow)

  update: =>
    return unless @editorView?
    return unless @tokenized

    #reset canvas virtual width/height
    @lineCanvas[0].width = @lineCanvas[0].offsetWidth
    @lineCanvas[0].height = @lineCanvas[0].offsetHeight

    #is this scroll only or has content changed?
    hasChanges = @pendingChanges.length > 0

    firstRow = @getFirstVisibleScreenRow()
    lastRow = @getLastVisibleScreenRow()
    intactRanges = @computeIntactRanges(firstRow, lastRow)
    if intactRanges.length is 0
      @drawLines(@context, firstRow, lastRow, 0)
    else
      for intact in intactRanges
        @copyBitmapPart(@context, @offscreenCanvas, intact.domStart, intact.start-firstRow, intact.end-intact.start)
      @fillGapsBetweenIntactRanges(@context, intactRanges, firstRow, lastRow)

    # copy displayed canvas to offscreen canvas
    @offscreenCanvas.width = @lineCanvas[0].width
    @offscreenCanvas.height = @lineCanvas[0].height
    @offscreenCtxt.drawImage(@lineCanvas[0], 0, 0)
    @offscreenFirstRow = firstRow
    @offscreenLastRow = lastRow

    @emit 'minimap:updated' if hasChanges

  transparentize: (color, opacity=1) ->
    color.replace('rgb', 'rgba').replace(')', ", #{opacity})")

  getClientRect: ->
    canvas = @lineCanvas[0]
    {
      width: canvas.scrollWidth,
      height: @getMinimapHeight()
    }

  computeIntactRanges: (firstRow, lastRow) ->
    return [] if !@offscreenFirstRow? and !@offscreenLastRow?

    intactRanges = [{start: @offscreenFirstRow, end: @offscreenLastRow, domStart: 0}]

    for change in @pendingChanges
      newIntactRanges = []
      for range in intactRanges
        if change.end < range.start and change.screenDelta != 0
          newIntactRanges.push(
            start: range.start + change.screenDelta
            end: range.end + change.screenDelta
            domStart: range.domStart
          )
        else if change.end < range.start or change.start > range.end
          newIntactRanges.push(range)
        else
          if change.start > range.start
            newIntactRanges.push(
              start: range.start
              end: change.start - 1
              domStart: range.domStart)
          if change.end < range.end
            newIntactRanges.push(
              start: change.end + change.screenDelta + 1
              end: range.end + change.screenDelta
              domStart: range.domStart + change.end + 1 - range.start
            )

        intactRange = newIntactRanges[newIntactRanges.length - 1]
        if intactRange? and (isNaN(intactRange.end) or isNaN(intactRange.start))
          debugger

      intactRanges = newIntactRanges

    @truncateIntactRanges(intactRanges, firstRow, lastRow)

    @pendingChanges = []

    intactRanges

  truncateIntactRanges: (intactRanges, firstRow, lastRow) ->
    i = 0
    while i < intactRanges.length
      range = intactRanges[i]
      if range.start < firstRow
        range.domStart += firstRow - range.start
        range.start = firstRow
      if range.end > lastRow
        range.end = lastRow
      if range.start >= range.end
        intactRanges.splice(i--, 1)
      i++
    intactRanges.sort (a, b) -> a.domStart - b.domStart
