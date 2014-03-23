
{EditorView, ScrollView, $} = require 'atom'

module.exports =
class MinimapEditorView extends ScrollView

  @content: ->
    @div class: 'minimap-editor editor editor-colors', =>
      @div class: 'scroll-view', outlet: 'scrollView', =>
        @div class: 'lines', outlet: 'lines' #, =>
          # @div class: 'lines-wrapper'


  initialize: () ->
    super
    @editor = null
    @editorLines = []
    @htmlLines = []
    @textChanges = []


# <<<<<<< HEAD
  update: (editor) ->
    start = Date.now()
    @lines.html ''
    @htmlLines = []
    @editorLines = []
    @textChanges = []
    @editor = null
    @setEditor(editor)

  updateEditorLines: (editor, start, end, removed) ->
    grammar = editor.getGrammar()
    if not @editorLines?
      @editorLines = []
    if not @htmlLines?
      @htmlLines = []
    if not @domCache?
      @domCache = []

    for x in [start..end]
      @editorLines[x] = editor.buffer.lines[x]
      @htmlLines[x] = []

      line = @editorLines[x]
      if line?
        tokenLine = grammar.tokenizeLines(line)
        for tokens in tokenLine
          @htmlLines[x].push(EditorView.buildLineHtml({
            tokens: tokens,
            text: line,
            attributes: { 'class': 'line' },
            htmlEolInvisibles: '&nbsp;'
          }))

          lineX = $('.minimap-editor .line:nth-child(' + (x+1) + ')')
          if lineX.length > 0
            lineX.replaceWith(@htmlLines[x].join(''))
          else
            @lines.append @htmlLines[x].join('')

  setEditor: (editor) ->

    if not @editorLines?
      @editorLines = []

    if !@editor?
      @editor = editor

    @editor.buffer.stoppedChangingDelay = 300

    for x in [0..@editor.buffer.lines.length]
      @editorLines.push(@editor.buffer.lines[x])
    #build the initial minimap
    @updateEditorLines(editor, 0, @editor.buffer.lines.length)

    @editor.buffer.on 'contents-modified', (e) =>
      start = Date.now()
      minLine = @editor.buffer.lines.length
      maxLine = 0
      for event in @textChanges
        if event? and event.oldRange? and event.newRange?
          oldLines = [(event.oldRange.start.row)..(event.oldRange.end.row)]
          newLines = [(event.newRange.start.row)..(event.newRange.end.row)]

          lineX = null
          #handle deleting lines
          if event.oldRange.end.row > event.newRange.end.row
            for x in [(event.newRange.end.row+1)..(event.oldRange.end.row)]
              @editorLines.splice(x,1)
              lineX = $('.minimap-editor .line:nth-child(' + (x+1) + ')')
              if lineX? and lineX.length > 0
                lineX.remove()

          lineX = null
          #handle adding new lines
          if event.newRange.end.row > event.oldRange.end.row
            x = event.oldRange.end.row
            @editorLines.splice(x+1,0,"")

            lineX = $('.minimap-editor .line:nth-child(' + (x+1) + ')')
            if lineX? and lineX.length > 0
              lineX.after("<div class='line'></div>")

          if event.newRange.start.row < minLine then minLine = event.newRange.start.row
          if event.newRange.end.row > maxLine then maxLine = event.newRange.end.row


      @updateEditorLines(editor, minLine, maxLine)

      @textChanges = []
      console.log('Update MinimapEditorView response time:', (Date.now() - start) + 'ms')

    @editor.buffer.on 'changed', (e) =>
      @textChanges.push(e)

#=======
#   update: (@editorView) ->
#     start = Date.now()
#
#     @lines[0].removeChild(@lines[0].childNodes[0])
#     @lines.css fontSize: "#{@editorView.getFontSize()}px"
#
#     console.log('cleaning:', (Date.now() - start) + 'ms')
#     # FIXME: If the file is very large, the tokenizes doesn't generate
#     # completely, so doesn't have the syntax highlight until a new view
#     # is activated in the same pane.
#     numLines = @editorView.getModel().displayBuffer.getLines().length
#     lines = @editorView.buildLineElementsForScreenRows(0, numLines)
#     console.log(' build lines:', (Date.now() - start) + 'ms')
#     wrapper = $('<div/>')
#     wrapper.append lines
#     @lines.append wrapper
#
#     console.log('Update MinimapEditorView response time:', (Date.now() - start) + 'ms')
# >>>>>>> dev

  getClientRect: ->
    sv = @scrollView[0]
    {
      width: sv.scrollWidth,
      height: sv.scrollHeight
    }
