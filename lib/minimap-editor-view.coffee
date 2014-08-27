{EditorView, ScrollView, $} = require 'atom'
{Emitter} = require 'emissary'
Debug = require 'prolix'

module.exports =
class MinimapEditorView extends ScrollView
  Emitter.includeInto(this)
  Debug('minimap').includeInto(this)

  @content: ->
    @div class: 'minimap-editor editor editor-colors', =>
      @tag 'canvas', {
        outlet: 'lineCanvas'
        class: 'minimap-canvas'
        width: 120
        height: 1000
        id: 'line-canvas'
      }

  frameRequested: false

  constructor: ->
    super
    @pendingChanges = []
    @context = @lineCanvas[0].getContext('2d')

  initialize: ->
    @lineOverdraw = atom.config.get('minimap.lineOverdraw')

    atom.config.observe 'minimap.lineOverdraw', =>
      @lineOverdraw = atom.config.get('minimap.lineOverdraw')

    atom.config.observe 'editor.lineHeight', =>
      # if @editorView?
      #   @lines.css lineHeight: "#{@getLineHeight()}px"

    atom.config.observe 'editor.fontSize', =>
      # if @editorView?
      #   @lines.css fontSize: "#{@getFontSize()}px"

  pixelPositionForScreenPosition: (position) ->
    {row, column} = @buffer.constructor.Point.fromObject(position)
    actualRow = Math.floor(row)

    {top: row * @getLineHeight(), left: column}

  destroy: ->
    @unsubscribe()
    @editorView = null

  setEditorView: (@editorView) ->
    @editor = @editorView.getModel()
    @buffer = @editorView.getEditor().buffer

    # @lines.css
    #   lineHeight: "#{@getLineHeight()}px"
    #   fontSize: "#{@getFontSize()}px"

    @subscribe @editor, 'screen-lines-changed.minimap', (changes) =>
      @pendingChanges.push changes
      @requestUpdate()

  requestUpdate: ->
    return if @frameRequested
    @frameRequested = true

    setImmediate =>
      @startBench()
      @update()
      @endBench('minimap update')
      @frameRequested = false

  forceUpdate: ->
    @firstRenderedScreenRow = null
    @lastRenderedScreenRow = null
    @requestUpdate()

  scrollTop: (scrollTop, options={}) ->
    return @cachedScrollTop or 0 unless scrollTop?
    return if scrollTop is @cachedScrollTop

    @cachedScrollTop = scrollTop
    @requestUpdate()


  registerBufferChanges: (event) =>
    @pendingChanges.push event

  getMinimapHeight: -> @getLinesCount() * @getLineHeight()
  getLineHeight: -> @lineHeight ||= Math.round parseInt(@editorView.find('.lines').css('line-height')) * @minimapView.scaleY
  getFontSize: -> @fontSize ||= Math.round  parseInt(@editorView.find('.lines').css('font-size')) * @minimapView.scaleY
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

  update: =>
    return unless @editorView?

    #reset canvas virtual width/height
    @lineCanvas[0].width = @lineCanvas[0].offsetWidth
    @lineCanvas[0].height = @lineCanvas[0].offsetHeight



    lines = @editor.linesForScreenRows(0, 300)
    # linesComponent = @editorView.component.refs.lines
    # linesComponent.props.lineDecorations ||= {}

    # if @minimapView.displayCodeHighlights
    #   @context.beginPath()
    #   for line, y in lines
    #     w = line.text.length
    #     if w > 0
    #       @context.moveTo(0.5, 4*y+0.5)
    #       @context.lineTo(w+0.5, 4*y+0.5)
    #   @context.stroke()
    @context.strokeStyle = "#d0d0d0"
    @context.lineWidth = 2

    for line, y in lines
      w = line.text.length
      if w > 0
        @context.beginPath()
        @context.moveTo(0.5, 4*y+0.5)
        @context.lineTo(w+0.5, 4*y+0.5)
        @context.stroke()

    @emit 'minimap:updated'

  getClientRect: ->
    canvas = @lineCanvas[0]
    {
      width: canvas.scrollWidth,
      height: canvas.scrollHeight
    }
