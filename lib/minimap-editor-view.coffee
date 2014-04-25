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
    return if @frameRequested

    @frameRequested = true
    webkitRequestAnimationFrame =>
      @frameRequested = false
      if @bufferChanges.length > 0
        @updateMinimapWithBufferChanges()
      else
        @rebuildMinimap()

      @emit 'minimap:updated'

  updateMinimapWithBufferChanges: ->
    @startBench()

    displayBuffer = @editorView.getEditor().displayBuffer
    while @bufferChanges.length > 0
      {newRange, oldRange} = @bufferChanges.shift()

      newScreenRange = displayBuffer.screenRangeForBufferRange(newRange)
      oldScreenRange = displayBuffer.screenRangeForBufferRange(oldRange)

      @deleteRowsAtRange(oldScreenRange)
      @createRowsAtRange(newScreenRange)
      @markIntermediateTime("update buffer change")

    @endBench('complete update')

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
    @startBench()

    lines = @lines[0]
    if lines?
      child = lines.childNodes[0]
      lines.removeChild(child) if child?

    @lines.css fontSize: "#{@editorView.getFontSize()}px"

    @markIntermediateTime('cleaning')
    # FIXME: If the file is very large, the tokenizes doesn't generate
    # completely, so doesn't have the syntax highlight until a new view
    # is activated in the same pane.
    numLines = @editorView.getModel().displayBuffer.getLines().length
    lines = @editorView.buildLineElementsForScreenRows(0, numLines)

    @markIntermediateTime('lines building')
    wrapper = $('<div/>')
    wrapper.append lines
    @lines.append wrapper

    @endBench('minimap update')

  getClientRect: ->
    sv = @scrollView[0]
    {
      width: sv.scrollWidth,
      height: sv.scrollHeight
    }
