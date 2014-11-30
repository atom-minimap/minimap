{ScrollView} = require 'atom-space-pen-views'
{Emitter} = require 'emissary'
{CompositeDisposable, Disposable} = require 'event-kit'
Delegato = require 'delegato'
DecorationManagement = require './mixins/decoration-management'

# Public: The {MinimapRenderView} class is responsible to render the minimap
# onto its canvas.
module.exports =
class MinimapRenderView extends ScrollView
  Emitter.includeInto(this)
  Delegato.includeInto(this)
  DecorationManagement.includeInto(this)

  @delegatesMethods 'getMarker', 'findMarkers', toProperty: 'editor'

  @content: ->
    @div class: 'minimap-editor editor editor-colors', =>
      @tag 'canvas', {
        outlet: 'lineCanvas'
        class: 'minimap-canvas'
        id: 'line-canvas'
      }

  frameRequested: false

  ### Public ###

  #    #### ##    ## #### ########
  #     ##  ###   ##  ##     ##
  #     ##  ####  ##  ##     ##
  #     ##  ## ## ##  ##     ##
  #     ##  ##  ####  ##     ##
  #     ##  ##   ###  ##     ##
  #    #### ##    ## ####    ##

  # Creates a new {MinimapRenderView}.
  constructor: ->
    @subscriptions = new CompositeDisposable
    super
    @pendingChanges = []
    @context = @lineCanvas[0].getContext('2d')
    @tokenColorCache = {}
    @decorationColorCache = {}
    @initializeDecorations()
    @tokenized = false

    @offscreenCanvas = document.createElement('canvas')
    @offscreenCtxt = @offscreenCanvas.getContext('2d')

  # Internal: Initializes the {MinimapRenderView} by registering to events
  # and retrieving its base configuration.
  initialize: ->
    @lineCanvas.webkitImageSmoothingEnabled = false

    @subscriptions.add atom.config.observe 'minimap.interline', (@interline) =>
      @emit 'minimap:scaleChanged'
      @forceUpdate()
    @subscriptions.add atom.config.observe 'minimap.charWidth', (@charWidth) =>
      @emit 'minimap:scaleChanged'
      @forceUpdate()
    @subscriptions.add atom.config.observe 'minimap.charHeight', (@charHeight) =>
      @emit 'minimap:scaleChanged'
      @forceUpdate()
    @subscriptions.add atom.config.observe 'minimap.textOpacity', (@textOpacity) =>
      @forceUpdate()

  # Destroys the {MinimapRenderView} instance, unsubscribes from the listened
  # events and releases its resources.
  destroy: ->
    @subscriptions.dispose()
    @editorView = null

  # Sets the `TextEditorView` for which the {MinimapRenderView} instance
  # is displayed.
  #
  # editorView - The `TextEditorView` instance.
  setEditorView: (@editorView) ->
    @editor = @editorView.getModel()
    @buffer = @editorView.getEditor().getBuffer()
    @displayBuffer = @editor.displayBuffer

    if @editor.onDidChangeScreenLines?
      @subscriptions.add @editor.onDidChangeScreenLines (changes) =>
        @stackChanges(changes)
    else
      @subscriptions.add @editor.onDidChange (changes) => @stackChanges(changes)

    @subscriptions.add @displayBuffer.onDidTokenize =>
      @tokenized = true
      @forceUpdate()

    @tokenized = true if @displayBuffer.tokenizedBuffer.fullyTokenized

  #    ##     ## ########  ########     ###    ######## ########
  #    ##     ## ##     ## ##     ##   ## ##      ##    ##
  #    ##     ## ##     ## ##     ##  ##   ##     ##    ##
  #    ##     ## ########  ##     ## ##     ##    ##    ######
  #    ##     ## ##        ##     ## #########    ##    ##
  #    ##     ## ##        ##     ## ##     ##    ##    ##
  #     #######  ##        ########  ##     ##    ##    ########

  # Performs an update of the minimap.
  update: =>
    return unless @editorView?
    return if @buffer.isDestroyed()

    #reset canvas virtual width/height
    @lineCanvas[0].width = @lineCanvas[0].offsetWidth * devicePixelRatio
    @lineCanvas[0].height = @lineCanvas[0].offsetHeight * devicePixelRatio

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

  # Requests a render of the minimap to be performed on the next frame.
  #
  # Only one update can be performed by frame, so calling several time this
  # method during a single frame won't trigger several render.
  requestUpdate: ->
    return if @frameRequested
    @frameRequested = true

    requestAnimationFrame =>
      @update()
      @frameRequested = false

  # Forces a render of the whole minimap.
  #
  # All the caches are cleared when calling this method.
  forceUpdate: ->
    @tokenColorCache = {}
    @decorationColorCache = {}
    @offscreenFirstRow = null
    @offscreenLastRow = null
    @requestUpdate()

  # Registers changes in the minimap for the next render call.
  #
  # Registering changes on an instance will trigger an update request.
  #
  # changes - An {Object} with the following properties:
  #           :start - The start row {Number} for the change.
  #           :end - The end row {Number} for the change.
  #           :screenDelta - The delta {Number} of the change. It corresponds
  #                          to the number of visible lines affected
  #                          by the change
  stackChanges: (changes) ->
    @pendingChanges.push changes
    @requestUpdate()

  # Changes the scroll top position of the minimap.
  # When called, the minimap is automatically updated.
  #
  # scrollTop - The scroll top {Number}.
  #
  # Returns the scroll top {Number}.
  scrollTop: (scrollTop) ->
    return @cachedScrollTop or 0 unless scrollTop?
    return if scrollTop is @cachedScrollTop

    @cachedScrollTop = scrollTop
    @update()

  #    ########  ########   #######  ########   ######
  #    ##     ## ##     ## ##     ## ##     ## ##    ##
  #    ##     ## ##     ## ##     ## ##     ## ##
  #    ########  ########  ##     ## ########   ######
  #    ##        ##   ##   ##     ## ##              ##
  #    ##        ##    ##  ##     ## ##        ##    ##
  #    ##        ##     ##  #######  ##         ######

  # Returns the height of the minimap in pixels. Note that the returned
  # height is not the actual height of the minimap canvas but rather
  # the computation of the minimap height if all the lines were
  # rendered.
  #
  # This function is used when comparing the minimap to its editor
  # to compute the scale factor.
  #
  # Returns a {Number}.
  getMinimapHeight: -> @getLinesCount() * @getLineHeight()

  # Returns the amount of pixels between lines.
  #
  # The space between the minimap lines can be changed using the
  # `minimap.interline` setting.
  #
  # Returns a {Number}.
  getLineHeight: -> @charHeight + @interline

  # Returns the height in pixels of a character rendered in the minimap.
  #
  # The height of the minimap characters can be changed using the
  # `minimap.charHeight` setting.
  #
  # The characters height is dissociated from the line height in order
  # to allow for some spacing between lines when rendering the minimap.
  #
  # Returns a {Number}.
  getCharHeight: -> @charHeight

  # Returns the width in pixels of a character rendered in the minimap.
  #
  # The width of the minimap characters can be changed using the
  # `minimap.charWidth` setting.
  #
  # Returns a {Number}.
  getCharWidth: -> @charWidth

  # Returns the opacity at which the text are rendered in the minimap.
  #
  # Returns a {Number}.
  getTextOpacity: -> @textOpacity

  # Returns the number of lines in the `Editor`.
  #
  # Returns a {Number}
  getLinesCount: -> @editor.getScreenLineCount()

  # Returns the height of the minimap on screen.
  #
  # It differs from {::getMinimapHeight} in that the former returns
  # the height of the whole minimap when this method returns the height
  # of the visible part.
  #
  # Returns a {Number}.
  getMinimapScreenHeight: -> @minimapView.height()

  # Returns the number of lines the visible area of the minimap covers.
  #
  # Returns a {Number}.
  getMinimapHeightInLines: -> Math.ceil(@getMinimapScreenHeight() / @getLineHeight())

  # Returns the index of the first visible row.
  #
  # Returns a {Number}.
  getFirstVisibleScreenRow: ->
    screenRow = Math.floor(@scrollTop() / @getLineHeight())
    screenRow = 0 if isNaN(screenRow)
    screenRow

  # Returns the index of the last visible row.
  #
  # Returns a {Number}.
  getLastVisibleScreenRow: ->
    calculatedRow = Math.ceil((@scrollTop() + @getMinimapScreenHeight()) / @getLineHeight()) - 1
    screenRow = Math.max(0, Math.min(@editor.getScreenLineCount() - 1, calculatedRow))
    screenRow = 0 if isNaN(screenRow)
    screenRow

  # Returns the bounds of the whole minimap.
  #
  # Returns an {Object}.
  getClientRect: ->
    canvas = @lineCanvas[0]
    {
      width: canvas.scrollWidth,
      height: @getMinimapHeight()
    }

  # Returns a pixel position corresponding to a character's screen
  # position.
  #
  # position - A screen position {Object} with the following properties:
  #            :row - The row {Number} of the character.
  #            :column - The column {Number} of the character.
  #
  # Returns an {Object} with the following properties:
  # :top - The position {Number} from top.
  # :left - The position {Number} from left.
  pixelPositionForScreenPosition: (position) ->
    {row, column} = @buffer.constructor.Point.fromObject(position)
    actualRow = Math.floor(row)

    {
      top: row * @getLineHeight() * devicePixelRatio
      left: column * devicePixelRatio
    }

  #     ######   #######  ##        #######  ########   ######
  #    ##    ## ##     ## ##       ##     ## ##     ## ##    ##
  #    ##       ##     ## ##       ##     ## ##     ## ##
  #    ##       ##     ## ##       ##     ## ########   ######
  #    ##       ##     ## ##       ##     ## ##   ##         ##
  #    ##    ## ##     ## ##       ##     ## ##    ##  ##    ##
  #     ######   #######  ########  #######  ##     ##  ######

  # Returns the default text color for an editor content.
  #
  # The color value is directly read from the `TextEditorView` computed
  # styles.
  #
  # Returns a {String}.
  getDefaultColor: ->
    @transparentize(@minimapView.editorView.css('color'), @getTextOpacity())

  # Returns the text color for the passed-in `token` object.
  #
  # The color value is read from the DOM by creating a node structure
  # that match the token `scope` property.
  #
  # token - A token {Object}.
  #
  # Returns a {String}.
  getTokenColor: (token) ->
    #Retrieve color from cache if available
    flatScopes = (token.scopeDescriptor or token.scopes).join()
    if flatScopes not of @tokenColorCache
      color = @retrieveTokenColorFromDom(token)
      @tokenColorCache[flatScopes] = color
    @tokenColorCache[flatScopes]

  # Returns the background color for the passed-in `decoration` object.
  #
  # The color value is read from the DOM by creating a node structure
  # that match the decoration `scope` property unless the decoration
  # provides its own `color` property.
  #
  # decoration - A `Decoration` object.
  #
  # Returns a {String}.
  getDecorationColor: (decoration) ->
    properties = decoration.getProperties()
    return properties.color if properties.color?
    if properties.scope not of @decorationColorCache
      color = @retrieveDecorationColorFromDom(decoration)
      @decorationColorCache[properties.scope] = color
    @decorationColorCache[properties.scope]

  # Internal: Returns the text color for the passed-in token.
  #
  # token - A token {Object}.
  #
  # Returns a {String}.
  retrieveTokenColorFromDom: (token) ->
    # This is quite an expensive operation so results are cached in getTokenColor.
    scopes = (token.scopeDescriptor or token.scopes)
    color = @retrieveStyleFromDom(scopes, 'color')
    @transparentize(color, @getTextOpacity())

  # Internal: Returns the background color for the passed-in decoration.
  #
  # decoration - A `Decoration` object.
  #
  # Returns a {String}.
  retrieveDecorationColorFromDom: (decoration) ->
    @retrieveStyleFromDom(decoration.getProperties().scope.split(/\s+/), 'background-color')

  # Internal: This function insert a dummy element in the DOM to compute
  # its style, return the specified property, and remove the element
  # from the DOM.
  #
  # scopes - An {Array} of {String} reprensenting the scope to reproduce.
  # property - The property {String} name.
  #
  # Returns a {String} of the property value.
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

  # Internal: Creates a DOM node container for all the operations that
  # need to read styles properties from DOM.
  ensureDummyNodeExistence: ->
    unless @dummyNode?
      @dummyNode = document.createElement('span')
      @dummyNode.style.visibility = 'hidden'
      @editorView.append(@dummyNode)

  # Internal: Converts a `rgb(...)` color into a `rgba(...)` color
  # with the specified opacity.
  #
  # color - The {String} of the color to modify.
  # opacity - The opacity {Number} to apply to the color.
  #
  # Returns a {String}.
  transparentize: (color, opacity=1) ->
    color.replace('rgb(', 'rgba(').replace(')', ", #{opacity})")

  #    ########  ########     ###    ##      ##
  #    ##     ## ##     ##   ## ##   ##  ##  ##
  #    ##     ## ##     ##  ##   ##  ##  ##  ##
  #    ##     ## ########  ##     ## ##  ##  ##
  #    ##     ## ##   ##   ######### ##  ##  ##
  #    ##     ## ##    ##  ##     ## ##  ##  ##
  #    ########  ##     ## ##     ##  ###  ###

  # Internal: Draws lines on the passed-in `context`.
  #
  # The lines range to draw is specified by the `firstRow` and `lastRow`
  # parameters.
  #
  # context - The canvas context {Object} into which drawing the lines.
  # firstRow - The starting row {Number} of the lines range to draw.
  # endRow - The ending row {Number} of the lines range to draw.
  # offsetRow - The offset {Number} to apply to rows index.
  drawLines: (context, firstRow, lastRow, offsetRow) ->
    return if firstRow > lastRow

    lines = @editor.tokenizedLinesForScreenRows(firstRow, lastRow)
    lineHeight = @getLineHeight() * devicePixelRatio
    charHeight = @getCharHeight() * devicePixelRatio
    charWidth = @getCharWidth() * devicePixelRatio
    canvasWidth = @lineCanvas.width() * devicePixelRatio
    displayCodeHighlights = @minimapView.displayCodeHighlights
    decorations = @decorationsForScreenRowRange(firstRow, lastRow)

    line = lines[0]

    # Whitespaces can be substituted by other characters so we need
    # to replace them when that's the case.
    if line.invisibles?
      re = ///
      #{line.invisibles.cr}|
      #{line.invisibles.eol}|
      #{line.invisibles.space}|
      #{line.invisibles.tab}
      ///g

    for line, row in lines
      x = 0
      y = offsetRow + row
      screenRow = firstRow + row
      y0 = y*lineHeight

      # Line decorations are first drawn on the canvas.
      lineDecorations = @decorationsByTypesForRow(screenRow, 'line', decorations)
      for decoration in lineDecorations
        context.fillStyle = @getDecorationColor(decoration)
        context.fillRect(0,y0,canvasWidth,lineHeight)

      # Then comes the highlight decoration with `highlight-under` type.
      highlightDecorations = @decorationsByTypesForRow(firstRow + row, 'highlight-under', decorations)
      for decoration in highlightDecorations
        @drawHighlightDecoration(context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth)

      # Then the line tokens are drawn
      for token in line.tokens
        w = token.screenDelta
        unless token.isOnlyWhitespace()
          color = if displayCodeHighlights and @tokenized
            @getTokenColor(token)
          else
            @getDefaultColor()

          value = token.value
          value = value.replace(re, ' ') if re?

          x = @drawToken(context, value, color, x, y0, charWidth, charHeight)
        else
          x += w * charWidth

      # Finally the highlight over decorations are drawn.
      highlightDecorations = @decorationsByTypesForRow(firstRow + row, 'highlight', 'highlight-over', decorations)
      for decoration in highlightDecorations
        @drawHighlightDecoration(context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth)

    context.fill()

  # Internal: Draws a single token on the given context.
  #
  # context - The canvas context object onto which draw the token.
  # text - The {String} text of the token.
  # color - The {String} color of the token.
  # x - The {Number} position on the x axis at which render the token.
  # y - The {Number} position on the y axis at which render the token.
  # charWidth - The char width {Number}.
  # charHeight - The char height {Number}.
  #
  # Returns a {Number} that correspond to the new x position after the render.
  drawToken: (context, text, color, x, y, charWidth, charHeight) ->
    context.fillStyle = color
    chars = 0
    for char in text
      if /\s/.test char
        if chars > 0
          context.fillRect(x-(chars * charWidth), y, chars*charWidth, charHeight)
        chars = 0
      else
        chars++

      x += charWidth

    context.fillRect(x-(chars * charWidth), y, chars*charWidth, charHeight) if chars > 0

    x

  # Internal: Draws a highlight decoration on the passed-in context.
  #
  # It renders only the part of the highlight corresponding to the specified
  # row.
  #
  # context - The canvas context object.
  # decoration - The `Decoration` object to render.
  # y - The {Number} position on the y axis at which render the decoration.
  # screenRow - The row {Number} corresponding to the rendered row.
  # lineHeight - The {Number} for the line height.
  # charWidth - The {Number} for the character width.
  # canvasWidth - The {Number} of the canvas width.
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

  # Internal: Copy a part of the offscreen bitmap into the onscreen one to
  # reduce the amount of rendered lines during scroll.
  #
  # context - The canvas context object.
  # bitmapCanvas - The source bitmap.
  # srcRow - The row {Number} on the source bitmap.
  # destRow - The row {Number} on the destination bitmap.
  # rowCount - The {Number} of rows to copy.
  copyBitmapPart: (context, bitmapCanvas, srcRow, destRow, rowCount) ->
    lineHeight = @getLineHeight() * devicePixelRatio
    context.drawImage(bitmapCanvas,
        0, srcRow * lineHeight,
        bitmapCanvas.width, rowCount * lineHeight,
        0, destRow * lineHeight,
        bitmapCanvas.width, rowCount * lineHeight)

  #    ########     ###    ##    ##  ######   ########  ######
  #    ##     ##   ## ##   ###   ## ##    ##  ##       ##    ##
  #    ##     ##  ##   ##  ####  ## ##        ##       ##
  #    ########  ##     ## ## ## ## ##   #### ######    ######
  #    ##   ##   ######### ##  #### ##    ##  ##             ##
  #    ##    ##  ##     ## ##   ### ##    ##  ##       ##    ##
  #    ##     ## ##     ## ##    ##  ######   ########  ######

  ### Internal ###

  # Renders the lines between the intact ranges when an update has pending
  # changes.
  #
  # context - The canvas context object.
  # intactRanges - The {Array} of intact ranges.
  # firstRow - The first visible row index {Number}.
  # lastRow - The last visible row index {Number}.
  fillGapsBetweenIntactRanges: (context, intactRanges, firstRow, lastRow) ->
    currentRow = firstRow
    # intactRanges is sorted, we can safely fill between ranges
    for intact in intactRanges
      @drawLines(context, currentRow, intact.start-1, currentRow-firstRow)
      currentRow = intact.end
    if currentRow <= lastRow
      @drawLines(context, currentRow, lastRow, currentRow-firstRow)

  # Computes the ranges that are not affected by the current pending changes.
  #
  # firstRow - The first visible row index {Number}.
  # lastRow - The last visible row index {Number}.
  #
  # Returns an {Array} of ranges.
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

  # Truncates the intact ranges so that they doesn't expand past the visible
  # area of the minimap.
  #
  # intactRanges - The {Array} of ranges to truncate.
  # firstRow - The first visible row index {Number}.
  # lastRow - The last visible row index {Number}.
  #
  # Returns an {Array} of ranges.
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
