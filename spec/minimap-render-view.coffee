path = require 'path'
MinimapRenderView = require '../lib/minimap-render-view'
MinimapView = require '../lib/minimap-view'
Minimap = require '../lib/minimap'
{WorkspaceView} = require 'atom'


xdescribe "MinimapRenderView", ->
  [minimapView, MinimapRenderView, editorView, updateCallback] = []

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
        minimapView.updatePositions = ->

        MinimapRenderView = minimapView.renderView

    describe '::getMinimapHeight', ->
      it 'returns its content height based on its line-height', ->
        lineHeight = parseInt editorView.find('.lines').css('line-height')
        linesCount = editorView.editor.buffer.getLines().length

        height = lineHeight * linesCount * minimapView.scaleY

        expect(MinimapRenderView.getMinimapHeight()).toEqual(height)

    describe '::update', ->
      beforeEach ->
        updateCallback = jasmine.createSpy('updateCallback')
        MinimapRenderView.once 'minimap:updated', updateCallback
        MinimapRenderView.update()

        waitsFor -> updateCallback.callCount is 1

      it 'renders visible lines augmented with line overdraw', ->
        lines = MinimapRenderView.lines.children()
        expect(lines.length).toEqual(12)

    describe '::scrollTop', ->
      beforeEach ->
        updateCallback = jasmine.createSpy('updateCallback')
        MinimapRenderView.on 'minimap:updated', updateCallback
        MinimapRenderView.update()

        waitsFor -> updateCallback.callCount is 1

      it 'renders visible lines augmented with line overdraw', ->

        MinimapRenderView.scrollTop 300

        waitsFor -> updateCallback.callCount >= 2

        runs ->
          lines = MinimapRenderView.lines.children()
          expect(lines.length).toEqual(22)
          expect(MinimapRenderView.scrollTop()).toEqual(300)

    describe '::addLineClass', ->
      describe 'called before the first update', ->
        beforeEach ->
          MinimapRenderView.addLineClass 2, 'some-class'
          updateCallback = jasmine.createSpy('updateCallback')
          MinimapRenderView.on 'minimap:updated', updateCallback
          MinimapRenderView.update()

          waitsFor -> updateCallback.callCount is 1

        it 'decorates the rendered line with the specified class', ->
          lines = MinimapRenderView.lines.children()
          expect(lines[1].className.indexOf('some-class')).not.toEqual(-1)

      describe 'called after an update', ->
        beforeEach ->
          updateCallback = jasmine.createSpy('updateCallback')
          MinimapRenderView.on 'minimap:updated', updateCallback
          MinimapRenderView.update()

          waitsFor -> updateCallback.callCount is 1

        it 'decorates the rendered line with the specified class', ->
          MinimapRenderView.addLineClass 2, 'some-class'
          lines = MinimapRenderView.lines.children()
          expect(lines[1].className.indexOf('some-class')).not.toEqual(-1)

    describe '::removeLineClass', ->
      describe 'called before the first update', ->
        beforeEach ->
          MinimapRenderView.addLineClass 2, 'some-class'
          MinimapRenderView.removeLineClass 2, 'some-class'
          updateCallback = jasmine.createSpy('updateCallback')
          MinimapRenderView.on 'minimap:updated', updateCallback
          MinimapRenderView.update()

          waitsFor -> updateCallback.callCount is 1

        it 'not decorates the rendered line with the specified class', ->
          lines = MinimapRenderView.lines.children()
          expect(lines[1].className.indexOf('some-class')).toEqual(-1)

      describe 'called after an update', ->
        beforeEach ->
          updateCallback = jasmine.createSpy('updateCallback')
          MinimapRenderView.addLineClass 2, 'some-class'
          MinimapRenderView.on 'minimap:updated', updateCallback
          MinimapRenderView.update()

          waitsFor -> updateCallback.callCount is 1

        it 'not decorates the rendered line with the specified class', ->
          MinimapRenderView.removeLineClass 2, 'some-class'
          lines = MinimapRenderView.lines.children()
          expect(lines[1].className.indexOf('some-class')).toEqual(-1)

    describe '::removeAllLineClasses', ->
      describe 'called before the first update', ->
        beforeEach ->
          MinimapRenderView.addLineClass 2, 'some-class'
          MinimapRenderView.addLineClass 4, 'some-class'
          MinimapRenderView.addLineClass 6, 'some-class'
          MinimapRenderView.addLineClass 8, 'some-class'
          MinimapRenderView.removeAllLineClasses()
          updateCallback = jasmine.createSpy('updateCallback')
          MinimapRenderView.on 'minimap:updated', updateCallback
          MinimapRenderView.update()

          waitsFor -> updateCallback.callCount is 1

        it 'not decorates the rendered line with the specified class', ->
          expect(MinimapRenderView.find('some-class').length).toEqual(0)

      describe 'called after an update', ->
        beforeEach ->
          updateCallback = jasmine.createSpy('updateCallback')
          MinimapRenderView.addLineClass 2, 'some-class'
          MinimapRenderView.addLineClass 4, 'some-class'
          MinimapRenderView.addLineClass 6, 'some-class'
          MinimapRenderView.addLineClass 8, 'some-class'
          MinimapRenderView.on 'minimap:updated', updateCallback

          MinimapRenderView.update()

          waitsFor -> updateCallback.callCount is 1

        it 'not decorates the rendered line with the specified class', ->
          MinimapRenderView.removeAllLineClasses()

          expect(MinimapRenderView.find('some-class').length).toEqual(0)
