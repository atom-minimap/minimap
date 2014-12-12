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
    largeLineCount = editor.getLineCount()
    expect(minimap.getHeight()).toEqual(largeLineCount * 5)

  it 'measures the scaling factor between the editor and the minimap', ->
    expect(minimap.getScaleFactor()).toEqual(0.5)

  it 'measures the editor visible area size at minimap scale', ->
    editor.setText(largeSample)
    expect(minimap.getTextEditorHeight()).toEqual(25)

  it 'scales the editor scroll based on the minimap scale factor', ->
    editor.setText(largeSample)
    editor.setScrollTop(1000)

    expect(minimap.getTextEditorScroll()).toEqual(500)

  it 'measures the available minimap scroll', ->
    editor.setText(largeSample)
    largeLineCount = editor.getLineCount()

    expect(minimap.getMinimapScrollHeight()).toEqual(largeLineCount * 5 - 50)
    expect(minimap.canScroll()).toBeTruthy()

  describe 'when there is no scrolling needed to display the whole minimap', ->
    describe 'measuring the available minimap scroll', ->
      it 'returns 0', ->
        editor.setText(smallSample)

        expect(minimap.getMinimapScrollHeight()).toEqual(0)
        expect(minimap.canScroll()).toBeFalsy()
