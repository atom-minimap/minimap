fs = require 'fs-plus'
path = require 'path'
{TextEditor} = require 'atom'
Minimap = require '../lib/minimap'
MinimapElement = require '../lib/minimap-element'
{mousemove, mousedown, mouseup, mousewheel} = require './helpers/events'
stylesheetPath = path.resolve __dirname, '..', 'stylesheets', 'minimap.less'
stylesheet = atom.themes.loadStylesheet(stylesheetPath)

realOffsetTop = (o) ->
  transform = new WebKitCSSMatrix window.getComputedStyle(o).transform
  o.offsetTop + transform.m42

realOffsetLeft = (o) ->
  transform = new WebKitCSSMatrix window.getComputedStyle(o).transform
  o.offsetLeft + transform.m41

describe 'MinimapElement', ->
  [editor, minimap, largeSample, mediumSample, smallSample, jasmineContent, editorElement, minimapElement] = []

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
          opacity: 1;
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
        expect(realOffsetTop(visibleArea)).toBeCloseTo(minimap.getTextEditorScrollTop() - minimap.getMinimapScrollTop(), 0)
        expect(realOffsetLeft(visibleArea)).toBeCloseTo(minimap.getTextEditorScrollLeft(), 0)

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

      describe 'when the editor is scrolled', ->
        beforeEach ->
          editor.setScrollTop(2000)
          editor.setScrollLeft(50)

          nextAnimationFrame()

        it 'updates the visible area', ->
          expect(realOffsetTop(visibleArea)).toBeCloseTo(minimap.getTextEditorScrollTop() - minimap.getMinimapScrollTop(), 0)
          expect(realOffsetLeft(visibleArea)).toBeCloseTo(minimap.getTextEditorScrollLeft(), 0)

      describe 'when the editor is resized to a greater size', ->
        beforeEach ->
          height = editor.getHeight()
          editorElement.style.width = '800px'
          editorElement.style.height = '500px'

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

      describe 'when the editor visibility change', ->
        it 'does not modify the size of the canvas', ->
          canvasWidth = minimapElement.canvas.width
          canvasHeight = minimapElement.canvas.height
          editorElement.style.display = 'none'
          advanceClock(150)
          nextAnimationFrame()

          expect(minimapElement.canvas.width).toEqual(canvasWidth)
          expect(minimapElement.canvas.height).toEqual(canvasHeight)

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

        advanceClock(150)
        nextAnimationFrame()

      describe 'using the mouse scrollwheel over the minimap', ->
        beforeEach ->
          spyOn(editor, 'setScrollTop').andCallThrough()

          mousewheel(minimapElement, 0, 15)

        it 'relays the events to the editor view', ->
          expect(editor.setScrollTop).toHaveBeenCalled()

      describe 'pressing the mouse on the minimap canvas', ->
        beforeEach ->
          canvas = minimapElement.canvas
          mousedown(canvas)
          nextAnimationFrame()

        it 'scrolls the editor to the line below the mouse', ->
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
          sample = fs.readFileSync(atom.project.resolve('seventy.txt')).toString()
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

        advanceClock(200)

        expect(minimapElement.pollDOM).not.toHaveBeenCalled()

    #     ######   #######  ##    ## ######## ####  ######
    #    ##    ## ##     ## ###   ## ##        ##  ##    ##
    #    ##       ##     ## ####  ## ##        ##  ##
    #    ##       ##     ## ## ## ## ######    ##  ##   ####
    #    ##       ##     ## ##  #### ##        ##  ##    ##
    #    ##    ## ##     ## ##   ### ##        ##  ##    ##
    #     ######   #######  ##    ## ##       ####  ######

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
        expect(minimapElement.canvas.width).toEqual(4)

      it 'offsets the minimap by the difference', ->
        expect(realOffsetLeft(minimapElement)).toBeCloseTo(editorElement.clientWidth - 4, -1)
        expect(minimapElement.clientWidth).toBeCloseTo(minimapWidth, -1)

      describe 'the dom polling routine', ->
        it 'does not change the value', ->
          advanceClock(150)
          nextAnimationFrame()
          expect(minimapElement.canvas.width).toEqual(4)

      describe 'and when minimap.minimapScrollIndicator setting is true', ->
        beforeEach ->
          editor.setText(mediumSample)
          editor.setScrollTop(50)
          nextAnimationFrame()

          atom.config.set 'minimap.minimapScrollIndicator', true
          nextAnimationFrame()

        it 'offsets the scroll indicator by the difference', ->
          indicator = minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')
          expect(realOffsetLeft(indicator)).toBeCloseTo(2, -1)

      describe 'and when minimap.displayPluginsControls setting is true', ->
        beforeEach ->
          atom.config.set 'minimap.displayPluginsControls', true
          nextAnimationFrame()

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
      [openQuickSettings, quickSettingsView, workspaceElement] = []
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

          quickSettingsView = workspaceElement.querySelector('.minimap-quick-settings')

        afterEach ->
          minimapElement.quickSettingsView.destroy()

        it 'opens the quick settings view', ->
          expect(quickSettingsView).toExist()

        it 'positions the quick settings view next to the minimap', ->
          minimapBounds = minimapElement.getBoundingClientRect()
          settingsBounds = quickSettingsView.getBoundingClientRect()

          expect(realOffsetTop(quickSettingsView)).toBeCloseTo(minimapBounds.top, 0)
          expect(realOffsetLeft(quickSettingsView)).toBeCloseTo(minimapBounds.left - settingsBounds.width, 0)

      describe 'when the quick settings view is open', ->
        beforeEach ->
          workspaceElement = atom.views.getView(atom.workspace)
          jasmineContent.appendChild(workspaceElement)

          openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')
          mousedown(openQuickSettings)

          quickSettingsView = workspaceElement.querySelector('.minimap-quick-settings')

        describe 'clicking on the code highlight item', ->
          beforeEach ->
            item = quickSettingsView.querySelector('li:last-child')
            mousedown(item)

          it 'toggles the code highlights on the minimap element', ->
            expect(minimapElement.displayCodeHighlights).toBeTruthy()

          it 'requests an update', ->
            expect(minimapElement.frameRequested).toBeTruthy()

        describe 'clicking on the open settings button again', ->
          beforeEach ->
            mousedown(openQuickSettings)

          it 'closes the quick settings view', ->
            expect(workspaceElement.querySelector('.minimap-quick-settings')).not.toExist()

          it 'removes the view from the element', ->
            expect(minimapElement.quickSettingsView).toBeNull()

        describe 'when an external event destroys the view', ->
          beforeEach ->
            minimapElement.quickSettingsView.destroy()

          it 'removes the view reference from the element', ->
            expect(minimapElement.quickSettingsView).toBeNull()

      describe 'then disabling it', ->
        beforeEach ->
          atom.config.set 'minimap.displayPluginsControls', false

        it 'removes the div', ->
          expect(minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')).not.toExist()
