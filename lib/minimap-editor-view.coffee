{EditorView, ScrollView, $} = require 'atom'
{Emitter} = require 'emissary'
Debug = require 'prolix'

module.exports =
class MinimapPaneView extends ScrollView
  Emitter.includeInto(this)
  Debug('minimap').includeInto(this)

  @content: ->
    @div class: 'minimap-editor editor editor-colors', =>
      @div class: 'scroll-view', outlet: 'scrollView', =>
        @div class: 'lines', outlet: 'lines', =>
          @div class: 'lines-wrapper'

  frameRequested: false

  constructor: ->
    super
    @bufferChanges = []

  initialize: ->
    @lines.css 'line-height', atom.config.get('editor.lineHeight') + 'em'
    atom.config.observe 'editor.lineHeight', =>
      @lines.css 'line-height', atom.config.get('editor.lineHeight') + 'em'

  destroy: ->
    @unsubscribe()
    @editorView = null

  setEditorView: (@editorView) ->
    @unsubscribe()
    @subscribeToBuffer()
    @update()

  subscribeToBuffer: ->
    buffer = @editorView.getEditor().buffer
    tokenizedBuffer = @editorView.getEditor().displayBuffer.tokenizedBuffer
    @subscribe buffer, 'changed', @registerBufferChanges
    @subscribe buffer, 'contents-modified', @update

  registerBufferChanges: (event) =>
    @bufferChanges.push event

  update: =>
    return unless @editorView?

    if @bufferChanges.length > 0
      @updateMinimapWithBufferChanges()
    else
      @rebuildMinimap()

  updateMinimapWithBufferChanges: ->
    @startBench()

    displayBuffer = @editorView.getEditor().displayBuffer
    while @bufferChanges.length > 0
      try
        {newRange, oldRange} = @bufferChanges.shift()

        newScreenRange = displayBuffer.screenRangeForBufferRange(newRange)
        oldScreenRange = displayBuffer.screenRangeForBufferRange(oldRange)

        @deleteRowsAtRange(oldScreenRange)
        @createRowsAtRange(newScreenRange)
        @markIntermediateTime("update buffer change")

      catch e
        continue

    @endBench('complete update')
    @emit 'minimap:updated'

  deleteRowsAtRange: (range) ->
    linesWrapper = @lines[0].childNodes[0]
    start = range.start.row
    end = range.end.row
    lines = Array::slice.call(linesWrapper.childNodes, start, end + 1 or 9e9)

    linesWrapper.removeChild line for line in lines

  createRowsAtRange: (range) ->
    start = range.start.row
    end = range.end.row
    lines = @editorView.buildLineElementsForScreenRows(start, end)

    @insertLineAt(line, start + i) for line,i in lines

  insertLineAt: (line, at) ->
    linesWrapper = @lines[0].childNodes[0]

    refLine = linesWrapper.childNodes[at]
    linesWrapper.insertBefore(line, refLine)


  rebuildMinimap: ->
    return if @rebuilding

    @startBench()

    @rebuilding = true
    lines = @lines[0]
    if lines?
      child = lines.childNodes[0]
      lines.removeChild(child) if child?

    @lines.css fontSize: "#{@editorView.getFontSize()}px"

    @endBench('cleaning')

    numLines = @editorView.getModel().displayBuffer.getLines().length

    wrapper = $('<div/>')
    @lines.append wrapper

    batchSize = 100
    batch = (start=0) =>
      @startBench()

      end = Math.min(start + batchSize, numLines)
      @log start, end
      lines = @editorView.buildLineElementsForScreenRows(start, end)

      wrapper.append lines
      if end is numLines
        @rebuilding = false
        @emit 'minimap:updated'
      else
        webkitRequestAnimationFrame -> batch(end + 1)

      @endBench('batch finished')

    batch()

  getClientRect: ->
    sv = @scrollView[0]
    {
      width: sv.scrollWidth,
      height: sv.scrollHeight
    }
