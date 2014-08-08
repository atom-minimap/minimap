path = require 'path'
MinimapEditorView = require '../lib/minimap-editor-view'
MinimapView = require '../lib/minimap-view'
Minimap = require '../lib/minimap'
{WorkspaceView} = require 'atom'


describe "MinimapEditorView", ->
  [minimapView, minimapEditorView, editorView, updateCallback] = []

  afterEach -> minimapView?.detach()

  beforeEach ->
    atom.config.set 'minimap', Minimap.configDefaults

    runs ->
      atom.workspaceView = new WorkspaceView

      atom.workspaceView.simulateDomAttachment()

      atom.project.setPath(path.join(__dirname, 'fixtures'))

    waitsForPromise ->
      promise = atom.packages.activatePackage('minimap')

    waitsForPromise ->
      atom.workspaceView.open('two-hundred.txt')

    runs ->
      editorView = atom.workspaceView.getActiveView()
      editorView.find('.lines').css('line-height', '16px')

  describe 'once created and initialized with an editor view', ->
    beforeEach ->
      runs ->
        minimapView = new MinimapView editorView
        minimapView.attachToPaneView()
        minimapView.computeScale()
        minimapView.height 5
        minimapView.miniEditorView.lineOverdraw = 10
        minimapView.updatePositions = ->

        minimapEditorView = minimapView.miniEditorView

    describe '::getMinimapHeight', ->
      it 'returns its content height based on its line-height', ->
        lineHeight = parseInt editorView.find('.lines').css('line-height')
        linesCount = editorView.editor.buffer.getLines().length

        height = lineHeight * linesCount * minimapView.scaleY

        expect(minimapEditorView.getMinimapHeight()).toEqual(height)

    describe '::update', ->
      beforeEach ->
        updateCallback = jasmine.createSpy('updateCallback')
        minimapEditorView.once 'minimap:updated', updateCallback
        minimapEditorView.update()

        waitsFor -> updateCallback.callCount is 1

      it 'renders visible lines augmented with line overdraw', ->
        lines = minimapEditorView.lines.children()
        expect(lines.length).toEqual(12)

    describe '::scrollTop', ->
      beforeEach ->
        updateCallback = jasmine.createSpy('updateCallback')
        minimapEditorView.on 'minimap:updated', updateCallback
        minimapEditorView.update()

        waitsFor -> updateCallback.callCount is 1

      it 'renders visible lines augmented with line overdraw', ->

        minimapEditorView.scrollTop 300

        waitsFor -> updateCallback.callCount >= 2

        runs ->
          lines = minimapEditorView.lines.children()
          expect(lines.length).toEqual(22)
          expect(minimapEditorView.scrollTop()).toEqual(300)

    describe '::addLineClass', ->
      describe 'called before the first update', ->
        beforeEach ->
          minimapEditorView.addLineClass 2, 'some-class'
          updateCallback = jasmine.createSpy('updateCallback')
          minimapEditorView.on 'minimap:updated', updateCallback
          minimapEditorView.update()

          waitsFor -> updateCallback.callCount is 1

        it 'decorates the rendered line with the specified class', ->
          lines = minimapEditorView.lines.children()
          expect(lines[1].className.indexOf('some-class')).not.toEqual(-1)

      describe 'called after an update', ->
        beforeEach ->
          updateCallback = jasmine.createSpy('updateCallback')
          minimapEditorView.on 'minimap:updated', updateCallback
          minimapEditorView.update()

          waitsFor -> updateCallback.callCount is 1

        it 'decorates the rendered line with the specified class', ->
          minimapEditorView.addLineClass 2, 'some-class'
          lines = minimapEditorView.lines.children()
          expect(lines[1].className.indexOf('some-class')).not.toEqual(-1)

    describe '::removeLineClass', ->
      describe 'called before the first update', ->
        beforeEach ->
          minimapEditorView.addLineClass 2, 'some-class'
          minimapEditorView.removeLineClass 2, 'some-class'
          updateCallback = jasmine.createSpy('updateCallback')
          minimapEditorView.on 'minimap:updated', updateCallback
          minimapEditorView.update()

          waitsFor -> updateCallback.callCount is 1

        it 'not decorates the rendered line with the specified class', ->
          lines = minimapEditorView.lines.children()
          expect(lines[1].className.indexOf('some-class')).toEqual(-1)

      describe 'called after an update', ->
        beforeEach ->
          updateCallback = jasmine.createSpy('updateCallback')
          minimapEditorView.addLineClass 2, 'some-class'
          minimapEditorView.on 'minimap:updated', updateCallback
          minimapEditorView.update()

          waitsFor -> updateCallback.callCount is 1

        it 'not decorates the rendered line with the specified class', ->
          minimapEditorView.removeLineClass 2, 'some-class'
          lines = minimapEditorView.lines.children()
          expect(lines[1].className.indexOf('some-class')).toEqual(-1)

    describe '::removeAllLineClasses', ->
      describe 'called before the first update', ->
        beforeEach ->
          minimapEditorView.addLineClass 2, 'some-class'
          minimapEditorView.addLineClass 4, 'some-class'
          minimapEditorView.addLineClass 6, 'some-class'
          minimapEditorView.addLineClass 8, 'some-class'
          minimapEditorView.removeAllLineClasses()
          updateCallback = jasmine.createSpy('updateCallback')
          minimapEditorView.on 'minimap:updated', updateCallback
          minimapEditorView.update()

          waitsFor -> updateCallback.callCount is 1

        it 'not decorates the rendered line with the specified class', ->
          expect(minimapEditorView.find('some-class').length).toEqual(0)

      describe 'called after an update', ->
        beforeEach ->
          updateCallback = jasmine.createSpy('updateCallback')
          minimapEditorView.addLineClass 2, 'some-class'
          minimapEditorView.addLineClass 4, 'some-class'
          minimapEditorView.addLineClass 6, 'some-class'
          minimapEditorView.addLineClass 8, 'some-class'
          minimapEditorView.on 'minimap:updated', updateCallback

          minimapEditorView.update()

          waitsFor -> updateCallback.callCount is 1

        it 'not decorates the rendered line with the specified class', ->
          minimapEditorView.removeAllLineClasses()

          expect(minimapEditorView.find('some-class').length).toEqual(0)
