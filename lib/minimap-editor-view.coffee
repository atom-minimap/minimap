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
    @tokenColorCache = {}

  initialize: ->
    @lineOverdraw = atom.config.get('minimap.lineOverdraw')

    atom.config.observe 'minimap.lineOverdraw', =>
      @lineOverdraw = atom.config.get('minimap.lineOverdraw')

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
    @tokenColorCache = {}
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
  getLineHeight: -> 2
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


  retrieveTokenColorFromDom: (token)->
    # This function insert a dummy token element in the DOM compute its style,
    # return its color property, and remove the element from the DOM.
    # This is quite an expensive operation so results are cached in getTokenColor.
    # Note: it's probably not the best way to do that, but that's the simpler approach I found.
    dummyNode = @editorView.find('#minimap-dummy-node')
    if dummyNode[0]?
      root = dummyNode[0]
    else
      root = document.createElement('span')
      root.style.visibility = 'hidden'
      root.id = 'minimap-dummy-node'
      @editorView.append(root)

    parent = root
    for scope in token.scopes
      node = document.createElement('span')
      # css class is the token scope without the dots,
      # see pushScope @ atom/atom/src/lines-component.coffee
      node.className = scope.replace(/\.+/g, ' ')
      if parent
        parent.appendChild(node)
      parent = node

    color = getComputedStyle(parent).getPropertyValue('color')
    root.innerHTML = ''
    color

  getTokenColor: (token)->
    #Retrieve color from cache if available
    flatScopes = token.scopes.join()
    if flatScopes not of @tokenColorCache
      color = @retrieveTokenColorFromDom(token)
      @tokenColorCache[flatScopes] = color
    @tokenColorCache[flatScopes]

  update: =>
    return unless @editorView?

    #reset canvas virtual width/height
    @lineCanvas[0].width = @lineCanvas[0].offsetWidth
    @lineCanvas[0].height = @lineCanvas[0].offsetHeight

    lines = @editor.linesForScreenRows(@getFirstVisibleScreenRow(), @getLastVisibleScreenRow())
    @context.lineWidth = 1

    if @minimapView.displayCodeHighlights
      for line, y in lines
        x = 0
        for token in line.tokens
          w = token.screenDelta
          if not token.isOnlyWhitespace()
            color = @getTokenColor(token)
            @context.beginPath()
            @context.strokeStyle = color
            @context.moveTo(x, 2*y)
            @context.lineTo(x+w, 2*y)
            @context.stroke()
          x += w
    else
      @context.strokeStyle = "#C0C0C0"
      @context.beginPath()
      for line, y in lines
        w = line.text.length
        if w > 0
          w0 = line.indentLevel * 2
          @context.moveTo(w0, 2*y+0.5)
          @context.lineTo(w, 2*y+0.5)
      @context.stroke()

    @emit 'minimap:updated'

  getClientRect: ->
    canvas = @lineCanvas[0]
    {
      width: canvas.scrollWidth,
      height: @getMinimapHeight()
    }
