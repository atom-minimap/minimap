{EditorView, ScrollView} = require 'atom'

module.exports =
class MinimapEditorView extends ScrollView

  @content: ->
    @div class: 'minimap-editor editor editor-colors', =>
      @div class: 'scroll-view', outlet: 'scrollView', =>
        @div class: 'lines', outlet: 'lines'

  initialize: ->
    super

  update: (screenLines) ->
    @lines.empty()
    for line in screenLines
      @lines.append(EditorView.buildLineHtml({
        tokens: line.tokens,
        text: line.text,
        attributes: { 'class': 'line' },
        htmlEolInvisibles: ''
      }))

  getClientRect: ->
    sv = @scrollView[0]
    {
      width: sv.scrollWidth,
      height: sv.scrollHeight
    }
