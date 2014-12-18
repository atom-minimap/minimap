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
    editor.setWidth(200)

    minimap = new Minimap({textEditor: editor})
    largeSample = fs.readFileSync(atom.project.resolve('large-file.coffee')).toString()
    smallSample = fs.readFileSync(atom.project.resolve('sample.coffee')).toString()

  it 'has an associated editor', ->
    expect(minimap.getTextEditor()).toEqual(editor)

  it 'returns false when asked if destroyed', ->
    expect(minimap.isDestroyed()).toBeFalsy()

  it 'raise an exception if created without a text editor', ->
    expect(-> new Minimap).toThrow()

  it 'measures the minimap size based on the current editor content', ->
    editor.setText(smallSample)
    expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5)

    editor.setText(largeSample)
    expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5)

  it 'measures the scaling factor between the editor and the minimap', ->
    expect(minimap.getVerticalScaleFactor()).toEqual(0.5)
    expect(minimap.getHorizontalScaleFactor()).toEqual(2 / editor.getDefaultCharWidth())

  it 'measures the editor visible area size at minimap scale', ->
    editor.setText(largeSample)
    expect(minimap.getTextEditorHeight()).toEqual(25)

  it 'measures the available minimap scroll', ->
    editor.setText(largeSample)
    largeLineCount = editor.getScreenLineCount()

    expect(minimap.getMinimapMaxScrollTop()).toEqual(largeLineCount * 5 - 50)
    expect(minimap.canScroll()).toBeTruthy()

  it 'computes the first visible row in the minimap', ->
    expect(minimap.getFirstVisibleScreenRow()).toEqual(0)

  it 'computes the last visible row in the minimap', ->
    expect(minimap.getLastVisibleScreenRow()).toEqual(10)

  it 'relays change events from the text editor', ->
    changeSpy = jasmine.createSpy('didChange')
    minimap.onDidChange(changeSpy)

    editor.setText('foo')

    expect(changeSpy).toHaveBeenCalled()

  it 'relays scroll top events from the editor', ->
    editor.setText(largeSample)

    scrollSpy = jasmine.createSpy('didScroll')
    minimap.onDidChangeScrollTop(scrollSpy)

    editor.setScrollTop(100)

    expect(scrollSpy).toHaveBeenCalled()

  it 'relays scroll left events from the editor', ->
    editor.setText(largeSample)

    scrollSpy = jasmine.createSpy('didScroll')
    minimap.onDidChangeScrollLeft(scrollSpy)

    editor.setScrollLeft(100)

    expect(scrollSpy).toHaveBeenCalled()

  describe 'when scrols past end is enabled', ->
    beforeEach ->
      editor.setText(largeSample)
      atom.config.set 'editor.scrollPastEnd', true

    it 'adjust the scrolling ratio', ->
      editor.setScrollTop(editor.displayBuffer.getMaxScrollTop())

      maxScrollTop = editor.displayBuffer.getMaxScrollTop() - (editor.getHeight() - 3 * editor.displayBuffer.getLineHeightInPixels())

      expect(minimap.getTextEditorScrollRatio()).toEqual(editor.getScrollTop() / maxScrollTop)

    it 'lock the minimap scroll top to 1', ->
      editor.setScrollTop(editor.displayBuffer.getMaxScrollTop())
      expect(minimap.getMinimapScrollTop()).toEqual(minimap.getMinimapMaxScrollTop())

  describe 'when soft wrap is enabled', ->
    beforeEach ->
      atom.config.set 'editor.softWrap', true
      atom.config.set 'editor.softWrapAtPreferredLineLength', true
      atom.config.set 'editor.preferredLineLength', 2

    it 'measures the minimap using screen lines', ->
      editor.setText(smallSample)
      expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5)

      editor.setText(largeSample)
      expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5)

  describe 'when there is no scrolling needed to display the whole minimap', ->
    it 'returns 0 when computing the minimap scroll', ->
      expect(minimap.getMinimapScrollTop()).toEqual(0)

    it 'returns 0 when measuring the available minimap scroll', ->
      editor.setText(smallSample)

      expect(minimap.getMinimapMaxScrollTop()).toEqual(0)
      expect(minimap.canScroll()).toBeFalsy()

  describe 'when the editor is scrolled', ->
    [largeLineCount, editorHeight, editorScrollRatio] = []

    beforeEach ->
      editor.setText(largeSample)
      editor.setScrollTop(1000)
      editor.setScrollLeft(200)

      largeLineCount = editor.getScreenLineCount()
      editorHeight = largeLineCount * editor.getLineHeightInPixels()
      editorScrollRatio = editor.getScrollTop() / editor.displayBuffer.getMaxScrollTop()

    it 'scales the editor scroll based on the minimap scale factor', ->
      expect(minimap.getTextEditorScrollTop()).toEqual(500)
      expect(minimap.getTextEditorScrollLeft()).toEqual(200 * minimap.getHorizontalScaleFactor())

    it 'computes the offset to apply based on the editor scroll top', ->
      expect(minimap.getMinimapScrollTop()).toEqual(editorScrollRatio * minimap.getMinimapMaxScrollTop())

    it 'computes the first visible row in the minimap', ->
      expect(minimap.getFirstVisibleScreenRow()).toEqual(Math.floor(99))

    it 'computes the last visible row in the minimap', ->
      expect(minimap.getLastVisibleScreenRow()).toEqual(110)

    describe 'down to the bottom', ->
      beforeEach ->
        editor.setScrollTop(editor.displayBuffer.getMaxScrollTop())
        editorScrollRatio = editor.getScrollTop() / editor.displayBuffer.getMaxScrollTop()

      it 'computes an offset that scrolls the minimap to the bottom edge', ->
        expect(minimap.getMinimapScrollTop()).toEqual(minimap.getMinimapMaxScrollTop())

      it 'computes the first visible row in the minimap', ->
        expect(minimap.getFirstVisibleScreenRow()).toEqual(largeLineCount - 10)

      it 'computes the last visible row in the minimap', ->
        expect(minimap.getLastVisibleScreenRow()).toEqual(largeLineCount)

  describe 'destroying the model', ->
    it 'emits a did-destroy event', ->
      spy = jasmine.createSpy('destroy')
      minimap.onDidDestroy(spy)

      minimap.destroy()

      expect(spy).toHaveBeenCalled()

    it 'returns true when asked if destroyed', ->
      minimap.destroy()
      expect(minimap.isDestroyed()).toBeTruthy()

  describe 'destroying the text editor', ->
    it 'destroys the model', ->
      spyOn(minimap,'destroy')

      editor.destroy()

      expect(minimap.destroy).toHaveBeenCalled()

  #    ########  ########  ######   #######
  #    ##     ## ##       ##    ## ##     ##
  #    ##     ## ##       ##       ##     ##
  #    ##     ## ######   ##       ##     ##
  #    ##     ## ##       ##       ##     ##
  #    ##     ## ##       ##    ## ##     ##
  #    ########  ########  ######   #######

  describe '::decorateMarker', ->
    [marker, decoration, changeSpy] = []

    beforeEach ->
      changeSpy = jasmine.createSpy('didChange')
      minimap.onDidChange(changeSpy)

      marker = minimap.markBufferRange [[0,6], [0,11]]
      decoration = minimap.decorateMarker marker, type: 'highlight', class: 'dummy'

    it 'creates a decoration for the given marker', ->
      expect(minimap.decorationsByMarkerId[marker.id]).toBeDefined()

    it 'creates a change corresponding to the marker range', ->
      expect(changeSpy).toHaveBeenCalled()
      expect(changeSpy.calls[0].args[0].start).toEqual(0)
      expect(changeSpy.calls[0].args[0].end).toEqual(0)

    describe 'destroying the marker', ->
      beforeEach ->
        marker.destroy()

      it 'removes the decoration from the render view', ->
        expect(minimap.decorationsByMarkerId[marker.id]).toBeUndefined()

      it 'creates a change corresponding to the marker range', ->
        expect(changeSpy.calls[1].args[0].start).toEqual(0)
        expect(changeSpy.calls[1].args[0].end).toEqual(0)

    describe 'destroying the decoration', ->
      beforeEach ->
        decoration.destroy()

      it 'removes the decoration from the render view', ->
        expect(minimap.decorationsByMarkerId[marker.id]).toBeUndefined()

      it 'creates a change corresponding to the marker range', ->
        expect(changeSpy.calls[1].args[0].start).toEqual(0)
        expect(changeSpy.calls[1].args[0].end).toEqual(0)

    describe 'destroying all the decorations for the marker', ->
      beforeEach ->
        minimap.removeAllDecorationsForMarker(marker)

      it 'removes the decoration from the render view', ->
        expect(minimap.decorationsByMarkerId[marker.id]).toBeUndefined()

      it 'creates a change corresponding to the marker range', ->
        expect(changeSpy.calls[1].args[0].start).toEqual(0)
        expect(changeSpy.calls[1].args[0].end).toEqual(0)
