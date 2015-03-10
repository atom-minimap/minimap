fs = require 'fs-plus'
path = require 'path'
{TextEditor} = require 'atom'
Minimap = require '../lib/minimap'
MinimapElement = require '../lib/minimap-element'
{mousemove, mousedown, mouseup, mousewheel} = require './helpers/events'
stylesheetPath = path.resolve __dirname, '..', 'styles', 'minimap.less'
stylesheet = atom.themes.loadStylesheet(stylesheetPath)

realOffsetTop = (o) ->
  transform = new WebKitCSSMatrix window.getComputedStyle(o).transform
  o.offsetTop + transform.m42

realOffsetLeft = (o) ->
  transform = new WebKitCSSMatrix window.getComputedStyle(o).transform
  o.offsetLeft + transform.m41

# Modify the global `devicePixelRatio` variable.
window.devicePixelRatio = 2

sleep = (duration) ->
  t = new Date
  waitsFor -> new Date - t > duration

describe 'MinimapElement', ->
  [editor, minimap, largeSample, mediumSample, smallSample, jasmineContent, editorElement, minimapElement, dir] = []

  beforeEach ->
    atom.config.set 'minimap.charHeight', 4
    atom.config.set 'minimap.charWidth', 2
    atom.config.set 'minimap.interline', 1
    atom.config.set 'minimap.textOpacity', 1

    MinimapElement.registerViewProvider()

    editor = new TextEditor({})
    editor.setLineHeightInPixels(10)
    editor.setHeight(50)

    minimap = new Minimap({textEditor: editor})
    dir = atom.project.getDirectories()[0]

    largeSample = fs.readFileSync(dir.resolve('large-file.coffee')).toString()
    mediumSample = fs.readFileSync(dir.resolve('two-hundred.txt')).toString()
    smallSample = fs.readFileSync(dir.resolve('sample.coffee')).toString()

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
    [noAnimationFrame, nextAnimationFrame, lastFn, canvas, visibleArea] = []

    beforeEach ->
      # Comment after body below to leave the created text editor and minimap
      # on DOM after the test run.
      jasmineContent = document.body.querySelector('#jasmine-content')

      noAnimationFrame = -> throw new Error('No animation frame requested')
      nextAnimationFrame = noAnimationFrame

      requestAnimationFrameSafe = window.requestAnimationFrame
      spyOn(window, 'requestAnimationFrame').andCallFake (fn) ->
        lastFn = fn
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
          opacity: 1;
        }

        atom-text-editor::shadow atom-text-editor-minimap::shadow .open-minimap-quick-settings {
          opacity: 1 !important;
        }
      """

      jasmineContent.appendChild(styleNode)

    beforeEach ->
      canvas = minimapElement.shadowRoot.querySelector('canvas')
      editorElement.style.width = '200px'
      editorElement.style.height = '50px'

      jasmineContent.insertBefore(editorElement, jasmineContent.firstChild)
      editor.setScrollTop(1000)
      editor.setScrollLeft(200)
      minimapElement.attach()

    afterEach -> minimap.destroy()

    it 'takes the height of the editor', ->
      expect(minimapElement.offsetHeight).toEqual(editorElement.clientHeight)

      # Actually, when in a flex display of 200px width, 10% gives 18px
      # and not 20px
      expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.clientWidth / 11, 0)

    it 'resizes the canvas to fit the minimap', ->
      expect(canvas.offsetHeight / devicePixelRatio).toBeCloseTo(minimapElement.offsetHeight + minimap.getLineHeight(), 0)
      expect(canvas.offsetWidth / devicePixelRatio).toBeCloseTo(minimapElement.offsetWidth, 0)

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
        expect(visibleArea.offsetHeight).toBeCloseTo(minimap.getTextEditorScaledHeight(), 0)

      it 'sets the visible visible area offset', ->
        expect(realOffsetTop(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop(), 0)
        expect(realOffsetLeft(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollLeft(), 0)

      it 'offsets the canvas when the scroll does not match line height', ->
        editor.setScrollTop(1004)
        nextAnimationFrame()

        expect(realOffsetTop(canvas)).toBeCloseTo(-2, -1)

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

      it 'renders the visible outline decorations', ->
        spyOn(minimapElement, 'drawHighlightOutlineDecoration').andCallThrough()

        minimap.decorateMarker(editor.markBufferRange([[1,4], [3,6]]), type: 'highlight-outline', color: '#0000ff')
        minimap.decorateMarker(editor.markBufferRange([[6,0], [6,7]]), type: 'highlight-outline', color: '#0000ff')
        minimap.decorateMarker(editor.markBufferRange([[100,3], [100,5]]), type: 'highlight-outline', color: '#0000ff')

        editor.setScrollTop(0)
        nextAnimationFrame()

        expect(minimapElement.drawHighlightOutlineDecoration).toHaveBeenCalled()
        expect(minimapElement.drawHighlightOutlineDecoration.calls.length).toEqual(4)

      describe 'when the editor is scrolled', ->
        beforeEach ->
          editor.setScrollTop(2000)
          editor.setScrollLeft(50)

          nextAnimationFrame()

        it 'updates the visible area', ->
          expect(realOffsetTop(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop(), 0)
          expect(realOffsetLeft(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollLeft(), 0)

      describe 'when the editor is resized to a greater size', ->
        beforeEach ->
          height = editor.getHeight()
          editorElement.style.width = '800px'
          editorElement.style.height = '500px'

          minimapElement.measureHeightAndWidth()
          nextAnimationFrame()

        it 'detect the resize and adjust itself', ->
          expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 11, 0)
          expect(minimapElement.offsetHeight).toEqual(editorElement.offsetHeight)

          expect(canvas.offsetWidth / devicePixelRatio).toBeCloseTo(minimapElement.offsetWidth, 0)
          expect(canvas.offsetHeight / devicePixelRatio).toBeCloseTo(minimapElement.offsetHeight + minimap.getLineHeight(), 0)

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

      describe 'when the editor visibility change', ->
        it 'does not modify the size of the canvas', ->
          canvasWidth = minimapElement.canvas.width
          canvasHeight = minimapElement.canvas.height
          editorElement.style.display = 'none'

          minimapElement.measureHeightAndWidth()
          nextAnimationFrame()

          expect(minimapElement.canvas.width).toEqual(canvasWidth)
          expect(minimapElement.canvas.height).toEqual(canvasHeight)

        describe 'from hidden to visible', ->
          beforeEach ->
            spyOn(minimapElement, 'requestForcedUpdate')
            editorElement.style.display = ''
            minimapElement.pollDOM()

          it 'requests an update of the whole minimap', ->
            expect(minimapElement.requestForcedUpdate).toHaveBeenCalled()

    #     ######   ######  ########   #######  ##       ##
    #    ##    ## ##    ## ##     ## ##     ## ##       ##
    #    ##       ##       ##     ## ##     ## ##       ##
    #     ######  ##       ########  ##     ## ##       ##
    #          ## ##       ##   ##   ##     ## ##       ##
    #    ##    ## ##    ## ##    ##  ##     ## ##       ##
    #     ######   ######  ##     ##  #######  ######## ########

    describe 'mouse scroll controls', ->
      beforeEach ->
        editorElement.style.height = '400px'
        editorElement.style.width = '400px'
        editor.setWidth(400)
        editor.setHeight(400)
        editor.setScrollTop(0)
        editor.setScrollLeft(0)

        minimapElement.measureHeightAndWidth()
        nextAnimationFrame()

      describe 'using the mouse scrollwheel over the minimap', ->
        beforeEach ->
          spyOn(editorElement.component.presenter, 'setScrollTop').andCallFake ->

          mousewheel(minimapElement, 0, 15)

        it 'relays the events to the editor view', ->
          expect(editorElement.component.presenter.setScrollTop).toHaveBeenCalled()

      describe 'pressing the mouse on the minimap canvas (without scroll animation)', ->
        beforeEach ->
          t = 0
          spyOn(minimapElement, 'getTime').andCallFake -> n = t; t += 100; n
          spyOn(minimapElement, 'requestUpdate').andCallFake ->

          atom.config.set 'minimap.scrollAnimation', false

          canvas = minimapElement.canvas
          mousedown(canvas)

        it 'scrolls the editor to the line below the mouse', ->
          expect(editor.getScrollTop()).toEqual(360)

      describe 'pressing the mouse on the minimap canvas (with scroll animation)', ->
        beforeEach ->

          t = 0
          spyOn(minimapElement, 'getTime').andCallFake -> n = t; t += 100; n
          spyOn(minimapElement, 'requestUpdate').andCallFake ->

          atom.config.set 'minimap.scrollAnimation', true
          atom.config.set 'minimap.scrollAnimationDuration', 300

          canvas = minimapElement.canvas
          mousedown(canvas)

          waitsFor -> nextAnimationFrame isnt noAnimationFrame

        it 'scrolls the editor gradually to the line below the mouse', ->
          # wait until all animations run out
          waitsFor ->
            nextAnimationFrame()
            return nextAnimationFrame is noAnimationFrame

          runs ->
            expect(editor.getScrollTop()).toEqual(360)

      describe 'dragging the visible area', ->
        [visibleArea, originalTop] = []

        beforeEach ->
          visibleArea = minimapElement.visibleArea
          {top, left} = visibleArea.getBoundingClientRect()
          originalTop = top

          mousedown(visibleArea, left + 10, top + 10)
          mousemove(visibleArea, left + 10, top + 50)

          nextAnimationFrame()

        afterEach ->
          minimapElement.endDrag()

        it 'scrolls the editor so that the visible area was moved down by 40 pixels', ->
          {top} = visibleArea.getBoundingClientRect()
          expect(top).toBeCloseTo(originalTop + 40, -1)

        it 'stops the drag gesture when the mouse is released outside the minimap', ->
          {top, left} = visibleArea.getBoundingClientRect()
          mouseup(jasmineContent, left - 10, top + 80)

          spyOn(minimapElement, 'drag')
          mousemove(visibleArea, left + 10, top + 50)

          expect(minimapElement.drag).not.toHaveBeenCalled()

      describe 'when the minimap cannot scroll', ->
        [visibleArea, originalTop] = []

        beforeEach ->
          sample = fs.readFileSync(dir.resolve('seventy.txt')).toString()
          editor.setText(sample)
          editor.setScrollTop(0)

        describe 'dragging the visible area', ->
          beforeEach ->
            nextAnimationFrame()

            visibleArea = minimapElement.visibleArea
            {top, left} = visibleArea.getBoundingClientRect()
            originalTop = top

            mousedown(visibleArea, left + 10, top + 10)
            mousemove(visibleArea, left + 10, top + 50)

            nextAnimationFrame()

          afterEach ->
            minimapElement.endDrag()

          it 'scrolls based on a ratio adjusted to the minimap height', ->
            {top} = visibleArea.getBoundingClientRect()
            expect(top).toBeCloseTo(originalTop + 40, -1)

      describe 'when scroll past end is enabled', ->
        beforeEach ->
          atom.config.set 'editor.scrollPastEnd', true
          nextAnimationFrame()

        describe 'dragging the visible area', ->
          [visibleArea, originalTop] = []

          beforeEach ->
            visibleArea = minimapElement.visibleArea
            {top, left} = visibleArea.getBoundingClientRect()
            originalTop = top

            mousedown(visibleArea, left + 10, top + 10)
            mousemove(visibleArea, left + 10, top + 50)

            nextAnimationFrame()

          afterEach ->
            minimapElement.endDrag()

          it 'scrolls the editor so that the visible area was moved down by 40 pixels', ->
            {top} = visibleArea.getBoundingClientRect()
            expect(top).toBeCloseTo(originalTop + 40, -1)


    #    ########  ########  ######  ######## ########   #######  ##    ##
    #    ##     ## ##       ##    ##    ##    ##     ## ##     ##  ##  ##
    #    ##     ## ##       ##          ##    ##     ## ##     ##   ####
    #    ##     ## ######    ######     ##    ########  ##     ##    ##
    #    ##     ## ##             ##    ##    ##   ##   ##     ##    ##
    #    ##     ## ##       ##    ##    ##    ##    ##  ##     ##    ##
    #    ########  ########  ######     ##    ##     ##  #######     ##

    describe 'when the model is destroyed', ->
      beforeEach ->
        minimap.destroy()

      it 'detaches itself from its parent', ->
        expect(minimapElement.parentNode).toBeNull()

      it 'stops the DOM polling interval', ->
        spyOn(minimapElement, 'pollDOM')

        sleep(200)

        runs -> expect(minimapElement.pollDOM).not.toHaveBeenCalled()

    #     ######   #######  ##    ## ######## ####  ######
    #    ##    ## ##     ## ###   ## ##        ##  ##    ##
    #    ##       ##     ## ####  ## ##        ##  ##
    #    ##       ##     ## ## ## ## ######    ##  ##   ####
    #    ##       ##     ## ##  #### ##        ##  ##    ##
    #    ##    ## ##     ## ##   ### ##        ##  ##    ##
    #     ######   #######  ##    ## ##       ####  ######

    describe 'when the atom themes are changed', ->
      beforeEach ->
        nextAnimationFrame()
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough()
        spyOn(minimapElement, 'invalidateCache').andCallThrough()

        atom.themes.emitter.emit 'did-change-active-themes'

        waitsFor -> minimapElement.frameRequested

      it 'forces a refresh with cache invalidation', ->
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled()
        expect(minimapElement.invalidateCache).toHaveBeenCalled()

    describe 'when minimap.textOpacity is changed', ->
      beforeEach ->
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough()
        atom.config.set 'minimap.textOpacity', 0.3
        nextAnimationFrame()

      it 'requests a complete update', ->
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled()

    describe 'when minimap.displayCodeHighlights is changed', ->
      beforeEach ->
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough()
        atom.config.set 'minimap.displayCodeHighlights', true
        nextAnimationFrame()

      it 'requests a complete update', ->
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled()

    describe 'when minimap.charWidth is changed', ->
      beforeEach ->
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough()
        atom.config.set 'minimap.charWidth', 1
        nextAnimationFrame()

      it 'requests a complete update', ->
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled()

    describe 'when minimap.charHeight is changed', ->
      beforeEach ->
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough()
        atom.config.set 'minimap.charHeight', 1
        nextAnimationFrame()

      it 'requests a complete update', ->
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled()

    describe 'when minimap.interline is changed', ->
      beforeEach ->
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough()
        atom.config.set 'minimap.interline', 2
        nextAnimationFrame()

      it 'requests a complete update', ->
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled()

    describe 'when minimap.displayMinimapOnLeft setting is true', ->
      it 'moves the attached minimap to the left', ->
        atom.config.set 'minimap.displayMinimapOnLeft', true
        expect(Array::indexOf.call(editorElement.shadowRoot.children, minimapElement)).toEqual(0)

      describe 'when the minimap is not attached yet', ->
        beforeEach ->
          editor = new TextEditor({})
          editor.setLineHeightInPixels(10)
          editor.setHeight(50)

          minimap = new Minimap({textEditor: editor})

          editorElement = atom.views.getView(editor)
          minimapElement = atom.views.getView(minimap)

          jasmineContent.insertBefore(editorElement, jasmineContent.firstChild)

          atom.config.set 'minimap.displayMinimapOnLeft', true
          minimapElement.attach()

        it 'moves the attached minimap to the left', ->
          expect(Array::indexOf.call(editorElement.shadowRoot.children, minimapElement)).toEqual(0)

    describe 'when minimap.adjustMinimapWidthToSoftWrap is true', ->
      [minimapWidth] = []
      beforeEach ->
        minimapWidth = minimapElement.offsetWidth

        atom.config.set 'editor.softWrap', true
        atom.config.set 'editor.softWrapAtPreferredLineLength', true
        atom.config.set 'editor.preferredLineLength', 2

        atom.config.set 'minimap.adjustMinimapWidthToSoftWrap', true
        nextAnimationFrame()

      it 'adjusts the width of the minimap canvas', ->
        expect(minimapElement.canvas.width / devicePixelRatio).toEqual(4)

      it 'offsets the minimap by the difference', ->
        expect(realOffsetLeft(minimapElement)).toBeCloseTo(editorElement.clientWidth - 4, -1)
        expect(minimapElement.clientWidth).toBeCloseTo(minimapWidth, -1)

      describe 'the dom polling routine', ->
        it 'does not change the value', ->
          sleep(150)
          runs ->
            nextAnimationFrame()
            expect(minimapElement.canvas.width / devicePixelRatio).toEqual(4)

      describe 'when the editor is resized', ->
        beforeEach ->
          atom.config.set 'editor.preferredLineLength', 6
          editorElement.style.width = '100px'
          editorElement.style.height = '100px'

          sleep(150)
          runs -> nextAnimationFrame()

        it 'makes the minimap smaller than soft wrap', ->
          expect(minimapElement.offsetWidth).toBeCloseTo(10, -1)
          expect(minimapElement.style.marginRight).toEqual('')

      describe 'and when minimap.minimapScrollIndicator setting is true', ->
        beforeEach ->
          editor.setText(mediumSample)
          editor.setScrollTop(50)
          nextAnimationFrame()

          atom.config.set 'minimap.minimapScrollIndicator', true

          waitsFor -> minimapElement.frameRequested
          runs -> nextAnimationFrame()

        it 'offsets the scroll indicator by the difference', ->
          indicator = minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')
          expect(realOffsetLeft(indicator)).toBeCloseTo(2, -1)

      describe 'and when minimap.displayPluginsControls setting is true', ->
        beforeEach ->
          atom.config.set 'minimap.displayPluginsControls', true
          waitsFor -> minimapElement.frameRequested
          runs -> nextAnimationFrame()

        it 'offsets the scroll indicator by the difference', ->
          openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')
          expect(realOffsetLeft(openQuickSettings)).toBeCloseTo(2 - openQuickSettings.offsetWidth, -1)

      describe 'and then disabled', ->
        beforeEach ->
          atom.config.set 'minimap.adjustMinimapWidthToSoftWrap', false
          nextAnimationFrame()

        it 'adjusts the width of the minimap', ->
          expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 11, -1)
          expect(minimapElement.style.width).toEqual('')

      describe 'and when preferredLineLength >= 16384', ->
        beforeEach ->
          atom.config.set 'minimap.preferredLineLength', 16384
          nextAnimationFrame()

        it 'adjusts the width of the minimap', ->
          expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 11, -1)
          expect(minimapElement.style.width).toEqual('')

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

          sleep(150)

          runs -> nextAnimationFrame()

        it 'adjusts the size and position of the indicator', ->
          indicator = minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')

          height = editor.getHeight() * (editor.getHeight() / minimap.getHeight())
          scroll = (editor.getHeight() - height) * minimap.getTextEditorScrollRatio()

          expect(indicator.offsetHeight).toBeCloseTo(height, 0)
          expect(realOffsetTop(indicator)).toBeCloseTo(scroll, 0)

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

    #     #######  ##     ## ####  ######  ##    ##
    #    ##     ## ##     ##  ##  ##    ## ##   ##
    #    ##     ## ##     ##  ##  ##       ##  ##
    #    ##     ## ##     ##  ##  ##       #####
    #    ##  ## ## ##     ##  ##  ##       ##  ##
    #    ##    ##  ##     ##  ##  ##    ## ##   ##
    #     ##### ##  #######  ####  ######  ##    ##
    #
    #     ######  ######## ######## ######## #### ##    ##  ######    ######
    #    ##    ## ##          ##       ##     ##  ###   ## ##    ##  ##    ##
    #    ##       ##          ##       ##     ##  ####  ## ##        ##
    #     ######  ######      ##       ##     ##  ## ## ## ##   ####  ######
    #          ## ##          ##       ##     ##  ##  #### ##    ##        ##
    #    ##    ## ##          ##       ##     ##  ##   ### ##    ##  ##    ##
    #     ######  ########    ##       ##    #### ##    ##  ######    ######

    describe 'when minimap.displayPluginsControls setting is true', ->
      [openQuickSettings, quickSettingsElement, workspaceElement] = []
      beforeEach ->
        atom.config.set 'minimap.displayPluginsControls', true

      it 'has a div to open the quick settings', ->
        expect(minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')).toExist()

      describe 'clicking on the div', ->
        beforeEach ->
          workspaceElement = atom.views.getView(atom.workspace)
          jasmineContent.appendChild(workspaceElement)

          openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')
          mousedown(openQuickSettings)

          quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings')

        afterEach ->
          minimapElement.quickSettingsElement.destroy()

        it 'opens the quick settings view', ->
          expect(quickSettingsElement).toExist()

        it 'positions the quick settings view next to the minimap', ->
          minimapBounds = minimapElement.canvas.getBoundingClientRect()
          settingsBounds = quickSettingsElement.getBoundingClientRect()

          expect(realOffsetTop(quickSettingsElement)).toBeCloseTo(minimapBounds.top, 0)
          expect(realOffsetLeft(quickSettingsElement)).toBeCloseTo(minimapBounds.left - settingsBounds.width, 0)

      describe 'when the displayMinimapOnLeft setting is enabled', ->
        describe 'clicking on the div', ->
          beforeEach ->
            atom.config.set('minimap.displayMinimapOnLeft', true)

            workspaceElement = atom.views.getView(atom.workspace)
            jasmineContent.appendChild(workspaceElement)

            openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')
            mousedown(openQuickSettings)

            quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings')

          afterEach ->
            minimapElement.quickSettingsElement.destroy()

          it 'positions the quick settings view next to the minimap', ->
            minimapBounds = minimapElement.canvas.getBoundingClientRect()
            settingsBounds = quickSettingsElement.getBoundingClientRect()

            expect(realOffsetTop(quickSettingsElement)).toBeCloseTo(minimapBounds.top, 0)
            expect(realOffsetLeft(quickSettingsElement)).toBeCloseTo(minimapBounds.right, 0)

      describe 'when the adjustMinimapWidthToSoftWrap setting is enabled', ->
        [controls] = []
        beforeEach ->
          atom.config.set 'editor.softWrap', true
          atom.config.set 'editor.softWrapAtPreferredLineLength', true
          atom.config.set 'editor.preferredLineLength', 2

          atom.config.set('minimap.adjustMinimapWidthToSoftWrap', true)
          nextAnimationFrame()

          controls = minimapElement.shadowRoot.querySelector('.minimap-controls')
          openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')

          editorElement.style.width = '1024px'

          sleep(150)
          waitsFor -> minimapElement.frameRequested
          runs -> nextAnimationFrame()

        it 'adjusts the size of the control div to fit in the minimap', ->
          expect(controls.clientWidth).toEqual(minimapElement.canvas.clientWidth / devicePixelRatio)

        it 'positions the controls div over the canvas', ->
          controlsRect = controls.getBoundingClientRect()
          canvasRect = minimapElement.canvas.getBoundingClientRect()
          expect(controlsRect.left).toEqual(canvasRect.left)
          expect(controlsRect.right).toEqual(canvasRect.right)

        describe 'when the displayMinimapOnLeft setting is enabled', ->
          beforeEach ->
            atom.config.set('minimap.displayMinimapOnLeft', true)
            nextAnimationFrame()

          it 'adjusts the size of the control div to fit in the minimap', ->
            expect(controls.clientWidth).toEqual(minimapElement.canvas.clientWidth / devicePixelRatio)

          it 'positions the controls div over the canvas', ->
            controlsRect = controls.getBoundingClientRect()
            canvasRect = minimapElement.canvas.getBoundingClientRect()
            expect(controlsRect.left).toEqual(canvasRect.left)
            expect(controlsRect.right).toEqual(canvasRect.right)

          describe 'clicking on the div', ->
            beforeEach ->
              workspaceElement = atom.views.getView(atom.workspace)
              jasmineContent.appendChild(workspaceElement)

              openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')
              mousedown(openQuickSettings)

              quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings')

            afterEach ->
              minimapElement.quickSettingsElement.destroy()

            it 'positions the quick settings view next to the minimap', ->
              minimapBounds = minimapElement.canvas.getBoundingClientRect()
              settingsBounds = quickSettingsElement.getBoundingClientRect()

              expect(realOffsetTop(quickSettingsElement)).toBeCloseTo(minimapBounds.top, 0)
              expect(realOffsetLeft(quickSettingsElement)).toBeCloseTo(minimapBounds.right, 0)

      describe 'when the quick settings view is open', ->
        beforeEach ->
          workspaceElement = atom.views.getView(atom.workspace)
          jasmineContent.appendChild(workspaceElement)

          openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')
          mousedown(openQuickSettings)

          quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings')

        it 'sets the on right button active', ->
          expect(quickSettingsElement.querySelector('.btn.selected:last-child')).toExist()

        describe 'clicking on the code highlight item', ->
          beforeEach ->
            item = quickSettingsElement.querySelector('li:last-child')
            mousedown(item)

          it 'toggles the code highlights on the minimap element', ->
            expect(minimapElement.displayCodeHighlights).toBeTruthy()

          it 'requests an update', ->
            expect(minimapElement.frameRequested).toBeTruthy()

        describe 'clicking on the on left button', ->
          beforeEach ->
            item = quickSettingsElement.querySelector('.btn:first-child')
            mousedown(item)

          it 'toggles the displayMinimapOnLeft setting', ->
            expect(atom.config.get('minimap.displayMinimapOnLeft')).toBeTruthy()

          it 'changes the buttons activation state', ->
            expect(quickSettingsElement.querySelector('.btn.selected:last-child')).not.toExist()
            expect(quickSettingsElement.querySelector('.btn.selected:first-child')).toExist()

        describe 'core:move-left', ->
          beforeEach ->
            atom.commands.dispatch quickSettingsElement, 'core:move-left'

          it 'toggles the displayMinimapOnLeft setting', ->
            expect(atom.config.get('minimap.displayMinimapOnLeft')).toBeTruthy()

          it 'changes the buttons activation state', ->
            expect(quickSettingsElement.querySelector('.btn.selected:last-child')).not.toExist()
            expect(quickSettingsElement.querySelector('.btn.selected:first-child')).toExist()

        describe 'core:move-right when the minimap is on the right', ->
          beforeEach ->
            atom.config.set('minimap.displayMinimapOnLeft', true)
            atom.commands.dispatch quickSettingsElement, 'core:move-right'

          it 'toggles the displayMinimapOnLeft setting', ->
            expect(atom.config.get('minimap.displayMinimapOnLeft')).toBeFalsy()

          it 'changes the buttons activation state', ->
            expect(quickSettingsElement.querySelector('.btn.selected:first-child')).not.toExist()
            expect(quickSettingsElement.querySelector('.btn.selected:last-child')).toExist()


        describe 'clicking on the open settings button again', ->
          beforeEach ->
            mousedown(openQuickSettings)

          it 'closes the quick settings view', ->
            expect(workspaceElement.querySelector('minimap-quick-settings')).not.toExist()

          it 'removes the view from the element', ->
            expect(minimapElement.quickSettingsElement).toBeNull()

        describe 'when an external event destroys the view', ->
          beforeEach ->
            minimapElement.quickSettingsElement.destroy()

          it 'removes the view reference from the element', ->
            expect(minimapElement.quickSettingsElement).toBeNull()

      describe 'then disabling it', ->
        beforeEach ->
          atom.config.set 'minimap.displayPluginsControls', false

        it 'removes the div', ->
          expect(minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')).not.toExist()

      describe 'with plugins registered in the package', ->
        [minimapPackage, pluginA, pluginB] = []
        beforeEach ->
          waitsForPromise ->
            atom.packages.activatePackage('minimap').then (pkg) ->
              minimapPackage = pkg.mainModule

          runs ->
            class Plugin
              active: false
              activatePlugin: -> @active = true
              deactivatePlugin: -> @active = false
              isActive: -> @active

            pluginA = new Plugin
            pluginB = new Plugin

            minimapPackage.registerPlugin('dummyA', pluginA)
            minimapPackage.registerPlugin('dummyB', pluginB)

            workspaceElement = atom.views.getView(atom.workspace)
            jasmineContent.appendChild(workspaceElement)

            openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')
            mousedown(openQuickSettings)

            quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings')

        it 'creates one list item for each registered plugin', ->
          expect(quickSettingsElement.querySelectorAll('li').length).toEqual(4)

        it 'selects the first item of the list', ->
          expect(quickSettingsElement.querySelector('li.selected:first-child')).toExist()

        describe 'core:confirm', ->
          beforeEach ->
            atom.commands.dispatch quickSettingsElement, 'core:confirm'

          it 'disable the plugin of the selected item', ->
            expect(pluginA.isActive()).toBeFalsy()

          describe 'triggered a second time', ->
            beforeEach ->
              atom.commands.dispatch quickSettingsElement, 'core:confirm'

            it 'enable the plugin of the selected item', ->
              expect(pluginA.isActive()).toBeTruthy()

          describe 'on the code highlight item', ->
            [initial] = []
            beforeEach ->
              initial = minimapElement.displayCodeHighlights
              atom.commands.dispatch quickSettingsElement, 'core:move-down'
              atom.commands.dispatch quickSettingsElement, 'core:move-down'
              atom.commands.dispatch quickSettingsElement, 'core:confirm'

            it 'toggles the code highlights on the minimap element', ->
              expect(minimapElement.displayCodeHighlights).toEqual(not initial)

        describe 'core:move-down', ->
          beforeEach ->
            atom.commands.dispatch quickSettingsElement, 'core:move-down'

          it 'selects the second item', ->
            expect(quickSettingsElement.querySelector('li.selected:nth-child(2)')).toExist()

          describe 'reaching a separator', ->
            beforeEach ->
              atom.commands.dispatch quickSettingsElement, 'core:move-down'

            it 'moves past the separator', ->
              expect(quickSettingsElement.querySelector('li.selected:last-child')).toExist()

          describe 'then core:move-up', ->
            beforeEach ->
              atom.commands.dispatch quickSettingsElement, 'core:move-up'

            it 'selects again the first item of the list', ->
              expect(quickSettingsElement.querySelector('li.selected:first-child')).toExist()

        describe 'core:move-up', ->
          beforeEach ->
            atom.commands.dispatch quickSettingsElement, 'core:move-up'

          it 'selects the last item', ->
            expect(quickSettingsElement.querySelector('li.selected:last-child')).toExist()

          describe 'reaching a separator', ->
            beforeEach ->
              atom.commands.dispatch quickSettingsElement, 'core:move-up'

            it 'moves past the separator', ->
              expect(quickSettingsElement.querySelector('li.selected:nth-child(2)')).toExist()

          describe 'then core:move-down', ->
            beforeEach ->
              atom.commands.dispatch quickSettingsElement, 'core:move-down'

            it 'selects again the first item of the list', ->
              expect(quickSettingsElement.querySelector('li.selected:first-child')).toExist()
