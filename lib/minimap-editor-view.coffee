{EditorView, ScrollView} = require 'atom'

module.exports =
class MinimapEditorView extends ScrollView

  @content: ->
    @div class: 'minimap-editor editor editor-colors', =>
      @div class: 'scroll-view', outlet: 'scrollView', =>
        @div class: 'lines', outlet: 'lines'

  constructor: (@editorView) ->
    super

  initialize: ->
    super

  update: (grammar, text) ->
    start = Date.now()
    numLines = @editorView.getModel().displayBuffer.getLines().length
    lines = @editorView.buildLineElementsForScreenRows(0, numLines)
    @lines.html ''
    @lines.append lines
    @lines.css fontSize: "#{@editorView.getFontSize()}px"

    console.log('Update MinimapEditorView response time:', (Date.now() - start) + 'ms')

  getClientRect: ->
    sv = @scrollView[0]
    {
      width: sv.scrollWidth,
      height: sv.scrollHeight
    }
