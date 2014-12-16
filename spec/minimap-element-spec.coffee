fs = require 'fs-plus'
path = require 'path'
{TextEditor} = require 'atom'
Minimap = require '../lib/minimap'
MinimapElement = require '../lib/minimap-element'

stylesheetPath = path.resolve __dirname, '..', 'stylesheets', 'minimap.less'
stylesheet = atom.themes.loadStylesheet(stylesheetPath)

describe 'MinimapElement', ->
  [editor, minimap, largeSample, mediumSample, smallSample, jasmineContent, editorElement, minimapElement] = []

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
    mediumSample = fs.readFileSync(atom.project.resolve('two-hundred.txt')).toString()
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

  #       ###    ######## ########    ###     ######  ##     ##
  #      ## ##      ##       ##      ## ##   ##    ## ##     ##
  #     ##   ##     ##       ##     ##   ##  ##       ##     ##
  #    ##     ##    ##       ##    ##     ## ##       #########
  #    #########    ##       ##    ######### ##       ##     ##
  #    ##     ##    ##       ##    ##     ## ##    ## ##     ##
  #    ##     ##    ##       ##    ##     ##  ######  ##     ##

  describe 'when attached to the text editor element', ->
    [nextAnimationFrame, canvas, visibleArea] = []

    beforeEach ->
      jasmineContent = document.body.querySelector('#jasmine-content')

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

        atom-text-editor atom-text-editor-minimap, atom-text-editor::shadow atom-text-editor-minimap {
          background: rgba(255,0,0,0.3);
        }

        atom-text-editor atom-text-editor-minimap::shadow .minimap-scroll-indicator, atom-text-editor::shadow atom-text-editor-minimap::shadow .minimap-scroll-indicator {
          background: rgba(0,0,255,0.3);
        }

        atom-text-editor atom-text-editor-minimap::shadow .minimap-visible-area, atom-text-editor::shadow atom-text-editor-minimap::shadow .minimap-visible-area {
          background: rgba(0,255,0,0.3);
        }
      """

      jasmineContent.appendChild(styleNode)

    beforeEach ->
      canvas = minimapElement.shadowRoot.querySelector('canvas')
      editorElement.style.width = '200px'
      editorElement.style.height = '50px'

      jasmineContent.appendChild(editorElement)
      editor.setScrollTop(1000)
      editor.setScrollLeft(200)
      minimapElement.attach()

    it 'takes the height of the editor', ->
      expect(minimapElement.offsetHeight).toEqual(editorElement.clientHeight)

      # Actually, when in a flex display of 200px width, 10% gives 18px
      # and not 20px
      expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.clientWidth / 11, 0)

    it 'resizes the canvas to fit the minimap', ->
      expect(canvas.offsetHeight).toEqual(minimapElement.offsetHeight + minimap.getLineHeight())
      expect(canvas.offsetWidth).toEqual(minimapElement.offsetWidth)

    it 'requests an update', ->
      expect(minimapElement.frameRequested).toBeTruthy()

    #    ##     ## ########  ########     ###    ######## ########
    #    ##     ## ##     ## ##     ##   ## ##      ##    ##
    #    ##     ## ##     ## ##     ##  ##   ##     ##    ##
    #    ##     ## ########  ##     ## ##     ##    ##    ######
    #    ##     ## ##        ##     ## #########    ##    ##
    #    ##     ## ##        ##     ## ##     ##    ##    ##
    #     #######  ##        ########  ##     ##    ##    ########

    describe 'when the update is performed', ->
      beforeEach ->
        nextAnimationFrame()
        visibleArea = minimapElement.shadowRoot.querySelector('.minimap-visible-area')

      it 'sets the visible area width and height', ->
        expect(visibleArea.offsetWidth).toEqual(minimapElement.clientWidth)
        expect(visibleArea.offsetHeight).toBeCloseTo(minimap.getTextEditorHeight(), 0)

      it 'sets the visible visible area offset', ->
        expect(visibleArea.offsetTop).toBeCloseTo(minimap.getTextEditorScrollTop() - minimap.getMinimapScrollTop(), 0)
        expect(visibleArea.offsetLeft).toBeCloseTo(minimap.getTextEditorScrollLeft(), 0)

      it 'offsets the canvas when the scroll does not match line height', ->
        editor.setScrollTop(1004)
        nextAnimationFrame()

        expect(canvas.offsetTop).toEqual(-2)

      it 'renders the visible line decorations', ->
        spyOn(minimapElement, 'drawLineDecorations').andCallThrough()

        minimap.decorateMarker(editor.markBufferRange([[1,0], [1,10]]), type: 'line', color: '#0000FF')
        minimap.decorateMarker(editor.markBufferRange([[10,0], [10,10]]), type: 'line', color: '#0000FF')
        minimap.decorateMarker(editor.markBufferRange([[100,0], [100,10]]), type: 'line', color: '#0000FF')

        editor.setScrollTop(0)
        nextAnimationFrame()

        expect(minimapElement.drawLineDecorations).toHaveBeenCalled()
        expect(minimapElement.drawLineDecorations.calls.length).toEqual(2)

      it 'renders the visible highlight decorations', ->
        spyOn(minimapElement, 'drawHighlightDecoration').andCallThrough()

        minimap.decorateMarker(editor.markBufferRange([[1,0], [1,4]]), type: 'highlight-under', color: '#0000FF')
        minimap.decorateMarker(editor.markBufferRange([[2,20], [2,30]]), type: 'highlight-over', color: '#0000FF')
        minimap.decorateMarker(editor.markBufferRange([[100,3], [100,5]]), type: 'highlight-under', color: '#0000FF')

        editor.setScrollTop(0)
        nextAnimationFrame()

        expect(minimapElement.drawHighlightDecoration).toHaveBeenCalled()
        expect(minimapElement.drawHighlightDecoration.calls.length).toEqual(2)

      describe 'when the editor is scrolled', ->
        beforeEach ->
          editor.setScrollTop(2000)
          editor.setScrollLeft(50)

          nextAnimationFrame()

        it 'updates the visible area', ->
          expect(visibleArea.offsetTop).toBeCloseTo(minimap.getTextEditorScrollTop() - minimap.getMinimapScrollTop(), 0)
          expect(visibleArea.offsetLeft).toBeCloseTo(minimap.getTextEditorScrollLeft(), 0)

      describe 'when the editor is resized to a greater size', ->
        beforeEach ->
          height = editor.getHeight()
          editorElement.style.width = '100%'
          editorElement.style.height = '500px'

          waitsFor -> editor.getHeight() isnt height

          runs ->
            advanceClock(150)
            nextAnimationFrame()

        it 'detect the resize and adjust itself', ->
          expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 11, 0)
          expect(minimapElement.offsetHeight).toEqual(editorElement.offsetHeight)

          expect(canvas.offsetWidth).toEqual(minimapElement.offsetWidth)
          expect(canvas.offsetHeight).toEqual(minimapElement.offsetHeight + minimap.getLineHeight())

      describe 'when the editor visible content is changed', ->

        beforeEach ->
          editor.setScrollLeft(0)
          editor.setScrollTop(1400)
          editor.setSelectedBufferRange [[101, 0], [102, 20]]
          nextAnimationFrame()

          spyOn(minimapElement, 'drawLines').andCallThrough()
          editor.insertText 'foo'

        it 'rerenders the part that have changed', ->
          nextAnimationFrame()

          expect(minimapElement.drawLines).toHaveBeenCalled()
          expect(minimapElement.drawLines.calls[1].args[1]).toEqual(100)
          expect(minimapElement.drawLines.calls[1].args[2]).toEqual(101)

    #     ######   #######  ##    ## ######## ####  ######
    #    ##    ## ##     ## ###   ## ##        ##  ##    ##
    #    ##       ##     ## ####  ## ##        ##  ##
    #    ##       ##     ## ## ## ## ######    ##  ##   ####
    #    ##       ##     ## ##  #### ##        ##  ##    ##
    #    ##    ## ##     ## ##   ### ##        ##  ##    ##
    #     ######   #######  ##    ## ##       ####  ######

    describe 'when minimap.displayMinimapOnLeft setting is true', ->
      beforeEach ->
        atom.config.set 'minimap.displayMinimapOnLeft', true

      it 'moves the attached minimap to the left', ->
        expect(Array::indexOf.call(editorElement.shadowRoot.children, minimapElement)).toEqual(0)
        nextAnimationFrame()

    describe 'when minimap.minimapScrollIndicator setting is true', ->
      beforeEach ->
        editor.setText(mediumSample)
        editor.setScrollTop(50)
        nextAnimationFrame()

        atom.config.set 'minimap.minimapScrollIndicator', true

      it 'adds a scroll indicator in the element', ->
        expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).toExist()

      describe 'and then deactivated', ->
        it 'removes the scroll indicator from the element', ->
          atom.config.set 'minimap.minimapScrollIndicator', false
          expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).not.toExist()

      describe 'on update', ->
        beforeEach ->
          height = editor.getHeight()
          editorElement.style.height = '500px'

          waitsFor -> editor.getHeight() isnt height

          runs ->
            advanceClock(150)
            nextAnimationFrame()

        it 'adjusts the size and position of the indicator', ->
          indicator = minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')

          height = editor.getHeight() * (editor.getHeight() / minimap.getHeight())
          scroll = (editor.getHeight() - height) * minimap.getTextEditorScrollRatio()

          expect(indicator.offsetHeight).toBeCloseTo(height, 0)
          expect(indicator.offsetTop).toBeCloseTo(scroll, 0)

      describe 'when the minimap cannot scroll', ->
        beforeEach ->
          editor.setText(smallSample)
          nextAnimationFrame()

        it 'removes the scroll indicator', ->
          expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).not.toExist()

        describe 'and then can scroll again', ->
          beforeEach ->
            editor.setText(largeSample)
            nextAnimationFrame()

          it 'attaches the scroll indicator', ->
            expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).toExist()
