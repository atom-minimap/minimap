{EditorView, ScrollView, $} = require 'atom'
{Emitter} = require 'emissary'
Debug = require 'prolix'

module.exports =
class MinimapEditorView extends ScrollView
  Emitter.includeInto(this)
  Debug('minimap').includeInto(this)

  @content: ->
    @div class: 'minimap-editor editor editor-colors', =>
      @div class: 'scroll-view', outlet: 'scrollView', =>
        @div class: 'lines', outlet: 'lines'

  frameRequested: false
  dummyNode: document.createElement('div')

  constructor: ->
    super
    @pendingChanges = []
    @lineClasses = {}

  initialize: ->
    @lineOverdraw = atom.config.get('minimap.lineOverdraw')

    atom.config.observe 'minimap.lineOverdraw', =>
      @lineOverdraw = atom.config.get('minimap.lineOverdraw')

    atom.config.observe 'editor.lineHeight', =>
      if @editorView?
        @lines.css lineHeight: "#{@getLineHeight()}px"

    atom.config.observe 'editor.fontSize', =>
      if @editorView?
        @lines.css fontSize: "#{@getFontSize()}px"

  destroy: ->
    @unsubscribe()
    @editorView = null

  setEditorView: (@editorView) ->
    @editor = @editorView.getModel()
    @buffer = @editorView.getEditor().buffer

    @lines.css
      lineHeight: "#{@getLineHeight()}px"
      fontSize: "#{@getFontSize()}px"

    @subscribe @editor, 'screen-lines-changed.minimap', (changes) =>
      @pendingChanges.push changes
      @requestUpdate()

  requestUpdate: ->
    return if @frameRequested
    @frameRequested = true

    setImmediate =>
      @startBench()
      @update()
      @endBench('minimpap update')
      @frameRequested = false

  scrollTop: (scrollTop, options={}) ->
    return @cachedScrollTop or 0 unless scrollTop?
    return if scrollTop is @cachedScrollTop

    @cachedScrollTop = scrollTop
    @requestUpdate()

  addLineClass: (line, cls) ->
    @lineClasses[line] ||= []
    @lineClasses[line].push cls

    if @firstRenderedScreenRow? and line >= @firstRenderedScreenRow and line <= @lastRenderedScreenRow
      index = line - @firstRenderedScreenRow - 1
      @lines.children()[index]?.classList.add(cls)

  removeLineClass: (line, cls) ->
    if @lineClasses[line] and (index = @lineClasses[line].indexOf cls) isnt -1
      @lineClasses[line].splice(index, 1)

    if @firstRenderedScreenRow? and line >= @firstRenderedScreenRow and line <= @lastRenderedScreenRow
      index = line - @firstRenderedScreenRow - 1
      @lines.children()[index]?.classList.remove(cls)

  removeAllLineClasses: (classesToRemove...) ->
    for k,classes of @lineClasses
      for cls in classes
        if classesToRemove.length is 0 or cls in classesToRemove
          @find(".#{cls}").removeClass(cls)

    @lineClasses = {}

  registerBufferChanges: (event) =>
    @pendingChanges.push event

  getMinimapHeight: -> @getLinesCount() * @getLineHeight()
  getLineHeight: -> @lineHeight ||= parseInt @editorView.find('.lines').css('line-height')
  getFontSize: -> @fontSize ||= parseInt @editorView.find('.lines').css('font-size')
  getLinesCount: -> @editorView.getEditor().getScreenLineCount()

  getMinimapScreenHeight: -> @minimapView.height() / @minimapView.scaleY
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

  update: =>
    return unless @editorView?

    firstVisibleScreenRow = @getFirstVisibleScreenRow()
    lastScreenRowToRender = firstVisibleScreenRow + @getMinimapHeightInLines() - 1
    lastScreenRow = @editor.getLastScreenRow()

    if @firstRenderedScreenRow? and firstVisibleScreenRow >= @firstRenderedScreenRow and lastScreenRowToRender <= @lastRenderedScreenRow
      renderFrom = Math.min(lastScreenRow, @firstRenderedScreenRow)
      renderTo = Math.min(lastScreenRow, @lastRenderedScreenRow)
    else
      renderFrom = Math.min(lastScreenRow, Math.max(0, firstVisibleScreenRow - @lineOverdraw))
      renderTo = Math.min(lastScreenRow, lastScreenRowToRender + @lineOverdraw)

    has_no_changes = @pendingChanges.length == 0 and @firstRenderedScreenRow and @firstRenderedScreenRow <= renderFrom and renderTo <= @lastRenderedScreenRow
    return if has_no_changes

    changes = @pendingChanges
    intactRanges = @computeIntactRanges(renderFrom, renderTo)

    @clearDirtyRanges(intactRanges)
    @fillDirtyRanges(intactRanges, renderFrom, renderTo)
    @firstRenderedScreenRow = renderFrom
    @lastRenderedScreenRow = renderTo
    @updatePaddingOfRenderedLines()
    @emit 'minimap:updated'

  computeIntactRanges: (renderFrom, renderTo) ->
    return [] if !@firstRenderedScreenRow? and !@lastRenderedScreenRow?

    intactRanges = [{start: @firstRenderedScreenRow, end: @lastRenderedScreenRow, domStart: 0}]

    if @editorView.showIndentGuide
      emptyLineChanges = []
      for change in @pendingChanges
        changes = @computeSurroundingEmptyLineChanges(change)
        emptyLineChanges.push(changes...)

      @pendingChanges.push(emptyLineChanges...)

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

      intactRanges = newIntactRanges

    @truncateIntactRanges(intactRanges, renderFrom, renderTo)

    @pendingChanges = []

    intactRanges

  truncateIntactRanges: (intactRanges, renderFrom, renderTo) ->
    i = 0
    while i < intactRanges.length
      range = intactRanges[i]
      if range.start < renderFrom
        range.domStart += renderFrom - range.start
        range.start = renderFrom
      if range.end > renderTo
        range.end = renderTo
      if range.start >= range.end
        intactRanges.splice(i--, 1)
      i++
    intactRanges.sort (a, b) -> a.domStart - b.domStart

  computeSurroundingEmptyLineChanges: (change) ->
    emptyLineChanges = []

    if change.bufferDelta?
      afterStart = change.end + change.bufferDelta + 1
      if @editor.lineForBufferRow(afterStart) is ''
        afterEnd = afterStart
        afterEnd++ while @editor.lineForBufferRow(afterEnd + 1) is ''
        emptyLineChanges.push({start: afterStart, end: afterEnd, screenDelta: 0})

      beforeEnd = change.start - 1
      if @editor.lineForBufferRow(beforeEnd) is ''
        beforeStart = beforeEnd
        beforeStart-- while @editor.lineForBufferRow(beforeStart - 1) is ''
        emptyLineChanges.push({start: beforeStart, end: beforeEnd, screenDelta: 0})

    emptyLineChanges

  clearDirtyRanges: (intactRanges) ->
    if intactRanges.length == 0
      @lines[0].innerHTML = ''
    else if currentLine = @lines[0].firstChild
      unless currentLine?
        console.warn "Unexpected undefined first line in clearing dirty ranges"
        return

      domPosition = 0
      for intactRange in intactRanges
        while intactRange.domStart > domPosition
          unless currentLine?
            console.warn "Unexpected undefined line at dom position #{domPosition} with range starting at position #{intactRange.domStart} (#{intactRange.start}..#{intactRange.end})"
            return
          currentLine = @clearLine(currentLine)
          domPosition++

        for i in [intactRange.start..intactRange.end]
          unless currentLine?
            console.warn "Unexpected undefined line when clearing dirty range #{intactRange.start}..#{intactRange.end}"
            return
          currentLine = currentLine.nextSibling
          domPosition++

      while currentLine
        currentLine = @clearLine(currentLine)

  clearLine: (lineElement) ->
    next = lineElement.nextSibling
    @lines[0].removeChild(lineElement)
    next

  fillDirtyRanges: (intactRanges, renderFrom, renderTo) ->
    i = 0
    nextIntact = intactRanges[i]
    currentLine = @lines[0].firstChild

    row = renderFrom
    while row <= renderTo
      if row == nextIntact?.end + 1
        nextIntact = intactRanges[++i]

      if !nextIntact or row < nextIntact.start
        if nextIntact
          dirtyRangeEnd = nextIntact.start - 1
        else
          dirtyRangeEnd = renderTo

        if @editorView instanceof EditorView
          for lineElement in @editorView.buildLineElementsForScreenRows(row, dirtyRangeEnd)
            classes = @lineClasses[row+1]
            lineElement?.classList.add(classes...) if classes?
            @lines[0].insertBefore(lineElement, currentLine)
            row++
        else
          linesComponent = @editorView.component.refs.lines
          lines = @editor.linesForScreenRows(row, dirtyRangeEnd)

          linesComponent.props.lineDecorations ||= {}

          for line,i in lines
            screenRow = row + i
            html = linesComponent.buildLineHTML(line, screenRow)
            @dummyNode.innerHTML = html
            lineElement = @dummyNode.childNodes[0]
            unless lineElement?
              console.warn "Unexpected undefined line element at screen row #{screenRow}"
              continue
            classes = @lineClasses[row+1]
            lineElement.className = 'line'
            lineElement.classList.add(classes...) if classes?
            lineElement.style.cssText=""
            @lines[0].insertBefore(lineElement, currentLine)
            row++
      else
        currentLine = currentLine?.nextSibling
        row++

  updatePaddingOfRenderedLines: ->
    paddingTop = @firstRenderedScreenRow * @lineHeight
    @lines.css('padding-top', paddingTop)

    paddingBottom = (@editor.getLastScreenRow() - @lastRenderedScreenRow) * @lineHeight
    @lines.css('padding-bottom', paddingBottom)

  getClientRect: ->
    sv = @scrollView[0]
    {
      width: sv.scrollWidth,
      height: sv.scrollHeight
    }
