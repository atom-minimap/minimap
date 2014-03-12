{$, EditorView, ScrollView} = require 'atom'

module.exports =
class MinimapEditorView extends ScrollView

  @content: ->
    @div class: 'minimap-editor editor editor-colors', =>
      @div class: 'scroll-view', outlet: 'scrollView', =>
        @div class: 'lines', outlet: 'lines'

  initialize: ->
    super

    @editorSettings = atom.config.get('editor')
    this.css(@editorSettings)

  destroy: ->

  update: (text, screenLines) ->
    @lines.empty()

    for line, i in screenLines
      @lines.append(EditorView.buildLineHtml({
        tokens: line.tokens,
        text: line.text,
        attributes: {
          'class': 'line'
        },
        htmlEolInvisibles: ''
      }))

  getClientRect: ->
    sv = @scrollView[0]
    return {
      width: sv.scrollWidth,
      height: sv.scrollHeight
    }
