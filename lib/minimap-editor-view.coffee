{EditorView, ScrollView, $} = require 'atom'
{Emitter} = require 'emissary'

module.exports =
class MinimapEditorView extends ScrollView
  Emitter.includeInto(this)

  @content: ->
    @div class: 'minimap-editor editor editor-colors', =>
      @div class: 'scroll-view', outlet: 'scrollView', =>
        @div class: 'lines', outlet: 'lines', =>
          @div class: 'lines-wrapper'

  initialize: ->
    super

  update: (@editorView) ->
    start = Date.now()

    @lines[0].removeChild(@lines[0].childNodes[0])
    @lines.css fontSize: "#{@editorView.getFontSize()}px"

    console.log('cleaning:', (Date.now() - start) + 'ms')
    # FIXME: If the file is very large, the tokenizes doesn't generate
    # completely, so doesn't have the syntax highlight until a new view
    # is activated in the same pane.
    numLines = @editorView.getModel().displayBuffer.getLines().length
    lines = @editorView.buildLineElementsForScreenRows(0, numLines)
    console.log(' build lines:', (Date.now() - start) + 'ms')
    wrapper = $('<div/>')
    wrapper.append lines
    @lines.append wrapper

    @emit 'minimap:updated'

    console.log('Update MinimapEditorView response time:', (Date.now() - start) + 'ms')

  getClientRect: ->
    sv = @scrollView[0]
    {
      width: sv.scrollWidth,
      height: sv.scrollHeight
    }
