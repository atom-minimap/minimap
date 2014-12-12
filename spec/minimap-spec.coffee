fs = require 'fs-plus'
{TextEditor} = require 'atom'
Minimap = require '../lib/minimap'

describe 'Minimap', ->
  [editor, minimap, largeSample, smallSample] = []

  beforeEach ->
    atom.config.set 'minimap.charHeight', 4
    atom.config.set 'minimap.charWidth', 2
    atom.config.set 'minimap.interline', 1

    editor = new TextEditor({})
    editor.setLineHeightInPixels(10)
    editor.setHeight(50)

    minimap = new Minimap({textEditor: editor})
    largeSample = fs.readFileSync(atom.project.resolve('large-file.coffee')).toString()
    smallSample = fs.readFileSync(atom.project.resolve('sample.coffee')).toString()

  it 'has an associated editor', ->
    expect(minimap.getTextEditor()).toEqual(editor)

  it 'measures the minimap size based on the current editor content', ->
    editor.setText(smallSample)
    expect(minimap.getHeight()).toEqual(20)

    editor.setText(largeSample)
    expect(minimap.getHeight()).toEqual(editor.getLineCount() * 5)

  it 'measures the scaling factor between the editor and the minimap', ->
    expect(minimap.getScaleFactor()).toEqual(0.5)

  it 'measures the editor visible area size at minimap scale', ->
    editor.setText(largeSample)
    expect(minimap.getTextEditorHeight()).toEqual(25)

  it 'measures the available minimap scroll', ->
    editor.setText(largeSample)
    largeLineCount = editor.getLineCount()

    expect(minimap.getMinimapMaxScrollTop()).toEqual(largeLineCount * 5 - 50)
    expect(minimap.canScroll()).toBeTruthy()

  describe 'when there is no scrolling needed to display the whole minimap', ->
    it 'returns 0 when computing the minimap scroll', ->
      console.log minimap.getMinimapScrollTop()
      expect(minimap.getMinimapScrollTop()).toBeCloseTo(0)

    it 'returns 0 when measuring the available minimap scroll', ->
      editor.setText(smallSample)

      expect(minimap.getMinimapMaxScrollTop()).toEqual(0)
      expect(minimap.canScroll()).toBeFalsy()

  describe 'when the editor is scrolled', ->
    [largeLineCount, editorHeight, editorScrollRatio] = []

    beforeEach ->
      editor.setText(largeSample)
      editor.setScrollTop(1000)
      largeLineCount = editor.getLineCount()
      editorHeight = largeLineCount * editor.getLineHeightInPixels()
      editorScrollRatio = editor.getScrollTop() / editor.displayBuffer.getMaxScrollTop()

    it 'scales the editor scroll based on the minimap scale factor', ->
      expect(minimap.getTextEditorScrollTop()).toEqual(500)

    it 'computes the offset to apply based on the editor scroll top', ->
      expect(minimap.getMinimapScrollTop()).toEqual(editorScrollRatio * minimap.getMinimapMaxScrollTop())

    describe 'down to the bottom', ->
      it 'computes an offset that scrolls the minimap to the bottom edge', ->
        editor.setScrollTop(editor.displayBuffer.getMaxScrollTop())
        editorScrollRatio = editor.getScrollTop() / editor.displayBuffer.getMaxScrollTop()

        expect(minimap.getMinimapScrollTop()).toEqual(minimap.getMinimapMaxScrollTop())
