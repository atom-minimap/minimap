{EditorView, ScrollView} = require 'atom'

module.exports =
class MinimapEditorView extends ScrollView

  @content: ->
    @div class: 'minimap-editor editor editor-colors', =>
      @div class: 'scroll-view', outlet: 'scrollView', =>
        @div class: 'lines', outlet: 'lines'

  initialize: ->
    super

  update: (grammar, text) ->
    start = Date.now()
    screenLines = grammar.tokenizeLines(text)
    html = []
    for tokens in screenLines
      html.push(EditorView.buildLineHtml({
        tokens: tokens,
        text: text,
        attributes: { 'class': 'line' },
        htmlEolInvisibles: '&nbsp;'
      }))
    @lines.html(html.join(''))
    html = displayBuffer = screenLines = null
    console.log('Update MinimapEditorView load time ', Date.now() - start, 'ms')

  getClientRect: ->
    sv = @scrollView[0]
    {
      width: sv.scrollWidth,
      height: sv.scrollHeight
    }
