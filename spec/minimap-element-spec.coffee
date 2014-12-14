fs = require 'fs-plus'
{TextEditor} = require 'atom'
Minimap = require '../lib/minimap'
MinimapElement = require '../lib/minimap-element'

describe 'MinimapElement', ->
  [editor, minimap, largeSample, smallSample, jasmineContent, editorElement, minimapElement] = []

  beforeEach ->
    atom.config.set 'minimap.charHeight', 4
    atom.config.set 'minimap.charWidth', 2
    atom.config.set 'minimap.interline', 1

    MinimapElement.registerViewProvider()

    editor = new TextEditor({})
    editor.setLineHeightInPixels(10)
    editor.setHeight(50)

    minimap = new Minimap({textEditor: editor})
    largeSample = fs.readFileSync(atom.project.resolve('large-file.coffee')).toString()
    smallSample = fs.readFileSync(atom.project.resolve('sample.coffee')).toString()

    editorElement = atom.views.getView(editor)
    minimapElement = atom.views.getView(minimap)

  it 'has been registered in the view registry', ->
    expect(minimapElement).toExist()
