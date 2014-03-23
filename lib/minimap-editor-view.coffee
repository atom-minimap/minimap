{EditorView, ScrollView, $} = require 'atom'
{Emitter} = require 'emissary'
Debug = require './mixins/debug'

module.exports =
class MinimapEditorView extends ScrollView
  Emitter.includeInto(this)
  Debug.includeInto(this)

  @content: ->
    @div class: 'minimap-editor editor editor-colors', =>
      @div class: 'scroll-view', outlet: 'scrollView', =>
        @div class: 'lines', outlet: 'lines', =>
          @div class: 'lines-wrapper'


  destroy: ->
    @unsubscribe()
    @buffer = null
    @editorView = null

  setEditorView: (@editorView) ->
    @unsubscribe()
    @buffer = @editorView.getEditor().displayBuffer.tokenizedBuffer
    @subscribeToBuffer()
    @update()

  subscribeToBuffer: ->
    @subscribe @buffer, 'changed', @update

  update: () =>
    @startBench()

    @lines[0].removeChild(@lines[0].childNodes[0])
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

    @emit 'minimap:updated'

    @endBench('minimap update')

  getClientRect: ->
    sv = @scrollView[0]
    {
      width: sv.scrollWidth,
      height: sv.scrollHeight
    }
