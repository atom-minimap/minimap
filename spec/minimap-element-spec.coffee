fs = require 'fs-plus'
path = require 'path'
{TextEditor} = require 'atom'
Minimap = require '../lib/minimap'
MinimapElement = require '../lib/minimap-element'

stylesheetPath = path.resolve __dirname, '..', 'stylesheets', 'minimap.less'
stylesheet = atom.themes.loadStylesheet(stylesheetPath)

describe 'MinimapElement', ->
  [editor, minimap, largeSample, smallSample, jasmineContent, editorElement, minimapElement] = []

  beforeEach ->
    jasmineContent = document.body.querySelector('#jasmine-content')

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

    editor.setText largeSample

    editorElement = atom.views.getView(editor)
    minimapElement = atom.views.getView(minimap)

  it 'has been registered in the view registry', ->
    expect(minimapElement).toExist()

  it 'has stored the minimap as its model', ->
    expect(minimapElement.getModel()).toBe(minimap)

  it 'has a canvas in a shadow DOM', ->
    expect(minimapElement.shadowRoot.querySelector('canvas')).toExist()

  it 'has a div representing the visible area', ->
    expect(minimapElement.shadowRoot.querySelector('.minimap-visible-area')).toExist()

  describe 'when attached to the text editor element', ->
    [nextAnimationFrame, canvas] = []

    beforeEach ->
      spyOn(window, "setInterval").andCallFake window.fakeSetInterval
      spyOn(window, "clearInterval").andCallFake window.fakeClearInterval

      noAnimationFrame = -> throw new Error('No animation frame requested')
      nextAnimationFrame = noAnimationFrame

      requestAnimationFrameSafe = window.requestAnimationFrame
      spyOn(window, 'requestAnimationFrame').andCallFake (fn) ->
        nextAnimationFrame = ->
          nextAnimationFrame = noAnimationFrame
          fn()

      styleNode = document.createElement('style')
      styleNode.textContent = """
        #{stylesheet}
      """

      jasmineContent.appendChild(styleNode)

    beforeEach ->
      canvas = minimapElement.shadowRoot.querySelector('canvas')
      editorElement.style.width = '200px'
      editorElement.style.height = '50px'
      jasmineContent.appendChild(editorElement)
      minimapElement.attach()

    it 'takes the height of the editor', ->
      expect(minimapElement.offsetHeight).toEqual(editorElement.clientHeight)

      # Actually, when in a flex display of 200px width, 10% gives 18px
      # and not 20px
      expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.clientWidth / 10, -1)

    it 'resizes the canvas to fit the minimap', ->
      expect(canvas.offsetHeight).toEqual(minimapElement.offsetHeight)
      expect(canvas.offsetWidth).toEqual(minimapElement.offsetWidth)
