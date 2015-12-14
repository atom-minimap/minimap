'use babel'

import './helpers/workspace'

import fs from 'fs-plus'
import Minimap from '../lib/minimap'

describe('Minimap', () => {
  let [editor, editorElement, minimap, largeSample, smallSample, minimapVerticalScaleFactor, minimapHorizontalScaleFactor] = []

  beforeEach(() => {
    atom.config.set('minimap.charHeight', 4)
    atom.config.set('minimap.charWidth', 2)
    atom.config.set('minimap.interline', 1)

    editor = atom.workspace.buildTextEditor({})

    editorElement = atom.views.getView(editor)
    jasmine.attachToDOM(editorElement)
    editorElement.setHeight(50)
    editorElement.setWidth(200)

    minimapVerticalScaleFactor = 5 / editor.getLineHeightInPixels()
    minimapHorizontalScaleFactor = 2 / editor.getDefaultCharWidth()

    let dir = atom.project.getDirectories()[0]

    minimap = new Minimap({textEditor: editor})
    largeSample = fs.readFileSync(dir.resolve('large-file.coffee')).toString()
    smallSample = fs.readFileSync(dir.resolve('sample.coffee')).toString()
  })

  it('has an associated editor', () => {
    expect(minimap.getTextEditor()).toEqual(editor)
  })

  it('returns false when asked if destroyed', () => {
    expect(minimap.isDestroyed()).toBeFalsy()
  })

  it('raise an exception if created without a text editor', () => {
    expect(() => { return new Minimap() }).toThrow()
  })

  it('measures the minimap size based on the current editor content', () => {
    editor.setText(smallSample)
    expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5)

    editor.setText(largeSample)
    expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5)
  })

  it('measures the scaling factor between the editor and the minimap', () => {
    expect(minimap.getVerticalScaleFactor()).toEqual(minimapVerticalScaleFactor)
    expect(minimap.getHorizontalScaleFactor()).toEqual(minimapHorizontalScaleFactor)
  })

  it('measures the editor visible area size at minimap scale', () => {
    editor.setText(largeSample)
    expect(minimap.getTextEditorScaledHeight()).toEqual(50 * minimapVerticalScaleFactor)
  })

  it('measures the available minimap scroll', () => {
    editor.setText(largeSample)
    let largeLineCount = editor.getScreenLineCount()

    expect(minimap.getMaxScrollTop()).toEqual(largeLineCount * 5 - 50)
    expect(minimap.canScroll()).toBeTruthy()
  })

  it('computes the first visible row in the minimap', () => {
    expect(minimap.getFirstVisibleScreenRow()).toEqual(0)
  })

  it('computes the last visible row in the minimap', () => {
    expect(minimap.getLastVisibleScreenRow()).toEqual(10)
  })

  it('relays change events from the text editor', () => {
    let changeSpy = jasmine.createSpy('didChange')
    minimap.onDidChange(changeSpy)

    editor.setText('foo')

    expect(changeSpy).toHaveBeenCalled()
  })

  it('relays scroll top events from the editor', () => {
    editor.setText(largeSample)

    let scrollSpy = jasmine.createSpy('didScroll')
    minimap.onDidChangeScrollTop(scrollSpy)

    editorElement.setScrollTop(100)

    expect(scrollSpy).toHaveBeenCalled()
  })

  it('relays scroll left events from the editor', () => {
    editor.setText(largeSample)

    let scrollSpy = jasmine.createSpy('didScroll')
    minimap.onDidChangeScrollLeft(scrollSpy)

    // Seems like text without a view aren't able to scroll horizontally
    // even when its width was set.
    spyOn(editorElement, 'getScrollWidth').andReturn(10000)

    editorElement.setScrollLeft(100)

    expect(scrollSpy).toHaveBeenCalled()
  })

  describe('when scrols past end is enabled', () => {
    beforeEach(() => {
      editor.setText(largeSample)
      atom.config.set('editor.scrollPastEnd', true)
    })

    it('adjust the scrolling ratio', () => {
      editorElement.setScrollTop(editorElement.getScrollHeight())

      let maxScrollTop = editorElement.getScrollHeight() - editorElement.getHeight() - (editorElement.getHeight() - 3 * editor.displayBuffer.getLineHeightInPixels())

      expect(minimap.getTextEditorScrollRatio()).toEqual(editorElement.getScrollTop() / maxScrollTop)
    })

    it('lock the minimap scroll top to 1', () => {
      editorElement.setScrollTop(editorElement.getScrollHeight())
      expect(minimap.getScrollTop()).toEqual(minimap.getMaxScrollTop())
    })

    describe('getTextEditorScrollRatio(), when getScrollTop() and maxScrollTop both equal 0', () => {
      beforeEach(() => {
        editor.setText(smallSample)
        editorElement.setHeight(40)
        atom.config.set('editor.scrollPastEnd', true)
      })

      it('returns 0', () => {
        editorElement.setScrollTop(0)
        expect(minimap.getTextEditorScrollRatio()).toEqual(0)
      })
    })
  })

  describe('when soft wrap is enabled', () => {
    beforeEach(() => {
      atom.config.set('editor.softWrap', true)
      atom.config.set('editor.softWrapAtPreferredLineLength', true)
      atom.config.set('editor.preferredLineLength', 2)
    })

    it('measures the minimap using screen lines', () => {
      editor.setText(smallSample)
      expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5)

      editor.setText(largeSample)
      expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5)
    })
  })

  describe('when there is no scrolling needed to display the whole minimap', () => {
    it('returns 0 when computing the minimap scroll', () => {
      expect(minimap.getScrollTop()).toEqual(0)
    })

    it('returns 0 when measuring the available minimap scroll', () => {
      editor.setText(smallSample)

      expect(minimap.getMaxScrollTop()).toEqual(0)
      expect(minimap.canScroll()).toBeFalsy()
    })
  })

  describe('when the editor is scrolled', () => {
    let [largeLineCount, editorHeight, editorScrollRatio] = []

    beforeEach(() => {
      // Same here, without a view, the getScrollWidth method always returns 1
      // and the test fails because the capped scroll left value always end up
      // to be 0, inducing errors in computations.
      spyOn(editorElement, 'getScrollWidth').andReturn(10000)

      editor.setText(largeSample)
      editorElement.setScrollTop(1000)
      editorElement.setScrollLeft(200)

      largeLineCount = editor.getScreenLineCount()
      editorHeight = largeLineCount * editor.getLineHeightInPixels()
      editorScrollRatio = editorElement.getScrollTop() / (editorElement.getScrollHeight() - editorElement.getHeight())
    })

    it('scales the editor scroll based on the minimap scale factor', () => {
      expect(minimap.getTextEditorScaledScrollTop()).toEqual(1000 * minimapVerticalScaleFactor)
      expect(minimap.getTextEditorScaledScrollLeft()).toEqual(200 * minimapHorizontalScaleFactor)
    })

    it('computes the offset to apply based on the editor scroll top', () => {
      expect(minimap.getScrollTop()).toEqual(editorScrollRatio * minimap.getMaxScrollTop())
    })

    it('computes the first visible row in the minimap', () => {
      expect(minimap.getFirstVisibleScreenRow()).toEqual(58)
    })

    it('computes the last visible row in the minimap', () => {
      expect(minimap.getLastVisibleScreenRow()).toEqual(69)
    })

    describe('down to the bottom', () => {
      beforeEach(() => {
        editorElement.setScrollTop(editorElement.getScrollHeight())
        editorScrollRatio = editorElement.getScrollTop() / editorElement.getScrollHeight()
      })

      it('computes an offset that scrolls the minimap to the bottom edge', () => {
        expect(minimap.getScrollTop()).toEqual(minimap.getMaxScrollTop())
      })

      it('computes the first visible row in the minimap', () => {
        expect(minimap.getFirstVisibleScreenRow()).toEqual(largeLineCount - 10)
      })

      it('computes the last visible row in the minimap', () => {
        expect(minimap.getLastVisibleScreenRow()).toEqual(largeLineCount)
      })
    })
  })

  describe('destroying the model', () => {
    it('emits a did-destroy event', () => {
      let spy = jasmine.createSpy('destroy')
      minimap.onDidDestroy(spy)

      minimap.destroy()

      expect(spy).toHaveBeenCalled()
    })

    it('returns true when asked if destroyed', () => {
      minimap.destroy()
      expect(minimap.isDestroyed()).toBeTruthy()
    })
  })

  describe('destroying the text editor', () => {
    it('destroys the model', () => {
      spyOn(minimap,'destroy')

      editor.destroy()

      expect(minimap.destroy).toHaveBeenCalled()
    })
  })

  //    ########  ########  ######   #######
  //    ##     ## ##       ##    ## ##     ##
  //    ##     ## ##       ##       ##     ##
  //    ##     ## ######   ##       ##     ##
  //    ##     ## ##       ##       ##     ##
  //    ##     ## ##       ##    ## ##     ##
  //    ########  ########  ######   #######

  describe('::decorateMarker', () => {
    let [marker, decoration, changeSpy] = []

    beforeEach(() => {
      editor.setText(largeSample)

      changeSpy = jasmine.createSpy('didChange')
      minimap.onDidChangeDecorationRange(changeSpy)

      marker = minimap.markBufferRange([[0,6], [1,11]])
      decoration = minimap.decorateMarker(marker, {type: 'highlight', class: 'dummy'})
    })

    it('creates a decoration for the given marker', () => {
      expect(minimap.decorationsByMarkerId[marker.id]).toBeDefined()
    })

    it('creates a change corresponding to the marker range', () => {
      expect(changeSpy).toHaveBeenCalled()
      expect(changeSpy.calls[0].args[0].start).toEqual(0)
      expect(changeSpy.calls[0].args[0].end).toEqual(1)
    })

    describe('when the marker range changes', () => {
      beforeEach(() => {
        let markerChangeSpy = jasmine.createSpy('marker-did-change')
        marker.onDidChange(markerChangeSpy)
        marker.setBufferRange([[0,6], [3,11]])

        waitsFor(() => { return markerChangeSpy.calls.length > 0 })
      })

      it('creates a change only for the dif between the two ranges', () => {
        expect(changeSpy).toHaveBeenCalled()
        expect(changeSpy.calls[1].args[0].start).toEqual(1)
        expect(changeSpy.calls[1].args[0].end).toEqual(3)
      })
    })

    describe('destroying the marker', () => {
      beforeEach(() => {
        marker.destroy()
      })

      it('removes the decoration from the render view', () => {
        expect(minimap.decorationsByMarkerId[marker.id]).toBeUndefined()
      })

      it('creates a change corresponding to the marker range', () => {
        expect(changeSpy.calls[1].args[0].start).toEqual(0)
        expect(changeSpy.calls[1].args[0].end).toEqual(1)
      })
    })

    describe('destroying the decoration', () => {
      beforeEach(() => {
        decoration.destroy()
      })

      it('removes the decoration from the render view', () => {
        expect(minimap.decorationsByMarkerId[marker.id]).toBeUndefined()
      })

      it('creates a change corresponding to the marker range', () => {
        expect(changeSpy.calls[1].args[0].start).toEqual(0)
        expect(changeSpy.calls[1].args[0].end).toEqual(1)
      })
    })

    describe('destroying all the decorations for the marker', () => {
      beforeEach(() => {
        minimap.removeAllDecorationsForMarker(marker)
      })

      it('removes the decoration from the render view', () => {
        expect(minimap.decorationsByMarkerId[marker.id]).toBeUndefined()
      })

      it('creates a change corresponding to the marker range', () => {
        expect(changeSpy.calls[1].args[0].start).toEqual(0)
        expect(changeSpy.calls[1].args[0].end).toEqual(1)
      })
    })

    describe('destroying the minimap', () => {
      beforeEach(() => {
        minimap.destroy()
      })

      it('removes all the previously added decorations', () => {
        expect(minimap.decorationsById).toEqual({})
        expect(minimap.decorationsByMarkerId).toEqual({})
      })

      it('prevents the creation of new decorations', () => {
        marker = editor.markBufferRange([[0,6], [0,11]])
        decoration = minimap.decorateMarker(marker, {type: 'highlight', class: 'dummy'})

        expect(decoration).toBeUndefined()
      })
    })
  })

  describe('::decorationsByTypeThenRows', () => {
    let [decorations] = []

    beforeEach(() => {
      editor.setText(largeSample)

      let createDecoration = function(type, range) {
        let decoration
        let marker = minimap.markBufferRange(range)
        decoration = minimap.decorateMarker(marker, {type})
      }

      createDecoration('highlight', [[6, 0], [11, 0]])
      createDecoration('highlight', [[7, 0], [8, 0]])
      createDecoration('highlight-over', [[1, 0], [2,0]])
      createDecoration('line', [[3,0], [4,0]])
      createDecoration('line', [[12,0], [12,0]])
      createDecoration('highlight-under', [[0,0], [10,1]])

      decorations = minimap.decorationsByTypeThenRows(0, 12)
    })

    it('returns an object whose keys are the decorations types', () => {
      expect(Object.keys(decorations).sort()).toEqual(['highlight-over', 'highlight-under', 'line'])
    })

    it('stores decorations by rows within each type objects', () => {
      expect(Object.keys(decorations['highlight-over']).sort())
      .toEqual('1 2 6 7 8 9 10 11'.split(' ').sort())

      expect(Object.keys(decorations['line']).sort())
      .toEqual('3 4 12'.split(' ').sort())

      expect(Object.keys(decorations['highlight-under']).sort())
      .toEqual('0 1 2 3 4 5 6 7 8 9 10'.split(' ').sort())
    })

    it('stores the decorations spanning a row in the corresponding row array', () => {
      expect(decorations['highlight-over']['7'].length).toEqual(2)

      expect(decorations['line']['3'].length).toEqual(1)

      expect(decorations['highlight-under']['5'].length).toEqual(1)
    })
  })
})

//     ######  ########    ###    ##    ## ########
//    ##    ##    ##      ## ##   ###   ## ##     ##
//    ##          ##     ##   ##  ####  ## ##     ##
//     ######     ##    ##     ## ## ## ## ##     ##
//          ##    ##    ######### ##  #### ##     ##
//    ##    ##    ##    ##     ## ##   ### ##     ##
//     ######     ##    ##     ## ##    ## ########
//
//       ###    ##        #######  ##    ## ########
//      ## ##   ##       ##     ## ###   ## ##
//     ##   ##  ##       ##     ## ####  ## ##
//    ##     ## ##       ##     ## ## ## ## ######
//    ######### ##       ##     ## ##  #### ##
//    ##     ## ##       ##     ## ##   ### ##
//    ##     ## ########  #######  ##    ## ########

describe('Stand alone minimap', () => {
  let [editor, editorElement, minimap, largeSample, smallSample] = []

  beforeEach(() => {
    atom.config.set('minimap.charHeight', 4)
    atom.config.set('minimap.charWidth', 2)
    atom.config.set('minimap.interline', 1)

    editor = atom.workspace.buildTextEditor({})
    editorElement = atom.views.getView(editor)
    jasmine.attachToDOM(editorElement)
    editorElement.setHeight(50)
    editorElement.setWidth(200)
    editor.setLineHeightInPixels(10)

    let dir = atom.project.getDirectories()[0]

    minimap = new Minimap({
      textEditor: editor,
      standAlone: true
    })

    largeSample = fs.readFileSync(dir.resolve('large-file.coffee')).toString()
    smallSample = fs.readFileSync(dir.resolve('sample.coffee')).toString()
  })

  it('has an associated editor', () => {
    expect(minimap.getTextEditor()).toEqual(editor)
  })

  it('measures the minimap size based on the current editor content', () => {
    editor.setText(smallSample)
    expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5)

    editor.setText(largeSample)
    expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5)
  })

  it('measures the scaling factor between the editor and the minimap', () => {
    expect(minimap.getVerticalScaleFactor()).toEqual(0.5)
    expect(minimap.getHorizontalScaleFactor()).toEqual(2 / editor.getDefaultCharWidth())
  })

  it('measures the editor visible area size at minimap scale', () => {
    editor.setText(largeSample)
    expect(minimap.getTextEditorScaledHeight()).toEqual(25)
  })

  it('has a visible height based on the passed-in options', () => {
    expect(minimap.getVisibleHeight()).toEqual(5)

    editor.setText(smallSample)
    expect(minimap.getVisibleHeight()).toEqual(20)

    editor.setText(largeSample)
    expect(minimap.getVisibleHeight()).toEqual(editor.getScreenLineCount() * 5)

    minimap.height = 100
    expect(minimap.getVisibleHeight()).toEqual(100)
  })

  it('has a visible width based on the passed-in options', () => {
    expect(minimap.getVisibleWidth()).toEqual(0)

    editor.setText(smallSample)
    expect(minimap.getVisibleWidth()).toEqual(36)

    editor.setText(largeSample)
    expect(minimap.getVisibleWidth()).toEqual(editor.getMaxScreenLineLength() * 2)

    minimap.width = 50
    expect(minimap.getVisibleWidth()).toEqual(50)
  })

  it('measures the available minimap scroll', () => {
    editor.setText(largeSample)
    let largeLineCount = editor.getScreenLineCount()

    expect(minimap.getMaxScrollTop()).toEqual(0)
    expect(minimap.canScroll()).toBeFalsy()

    minimap.height = 100

    expect(minimap.getMaxScrollTop()).toEqual(largeLineCount * 5 - 100)
    expect(minimap.canScroll()).toBeTruthy()
  })

  it('computes the first visible row in the minimap', () => {
    expect(minimap.getFirstVisibleScreenRow()).toEqual(0)
  })

  it('computes the last visible row in the minimap', () => {
    editor.setText(largeSample)

    expect(minimap.getLastVisibleScreenRow()).toEqual(editor.getScreenLineCount())

    minimap.height = 100
    expect(minimap.getLastVisibleScreenRow()).toEqual(20)
  })

  it('does not relay scroll top events from the editor', () => {
    editor.setText(largeSample)

    let scrollSpy = jasmine.createSpy('didScroll')
    minimap.onDidChangeScrollTop(scrollSpy)

    editorElement.setScrollTop(100)

    expect(scrollSpy).not.toHaveBeenCalled()
  })

  it('does not relay scroll left events from the editor', () => {
    editor.setText(largeSample)

    let scrollSpy = jasmine.createSpy('didScroll')
    minimap.onDidChangeScrollLeft(scrollSpy)

    // Seems like text without a view aren't able to scroll horizontally
    // even when its width was set.
    spyOn(editorElement, 'getScrollWidth').andReturn(10000)

    editorElement.setScrollLeft(100)

    expect(scrollSpy).not.toHaveBeenCalled()
  })

  it('has a scroll top that is not bound to the text editor', () => {
    let scrollSpy = jasmine.createSpy('didScroll')
    minimap.onDidChangeScrollTop(scrollSpy)

    editor.setText(largeSample)
    editorElement.setScrollTop(1000)

    expect(minimap.getScrollTop()).toEqual(0)
    expect(scrollSpy).not.toHaveBeenCalled()

    minimap.setScrollTop(10)

    expect(minimap.getScrollTop()).toEqual(10)
    expect(scrollSpy).toHaveBeenCalled()
  })

  it('has rendering properties that can overrides the config values', () => {
    minimap.setCharWidth(8.5)
    minimap.setCharHeight(10.2)
    minimap.setInterline(10.6)

    expect(minimap.getCharWidth()).toEqual(8)
    expect(minimap.getCharHeight()).toEqual(10)
    expect(minimap.getInterline()).toEqual(10)
    expect(minimap.getLineHeight()).toEqual(20)
  })

  it('emits a config change event when a value is changed', () => {
    let changeSpy = jasmine.createSpy('did-change')
    minimap.onDidChangeConfig(changeSpy)

    minimap.setCharWidth(8.5)
    minimap.setCharHeight(10.2)
    minimap.setInterline(10.6)

    expect(changeSpy.callCount).toEqual(3)
  })

  it('returns the rounding number of devicePixelRatio', () => {
    devicePixelRatio = 1.25

    minimap.setDevicePixelRatioRounding(true)

    expect(minimap.getDevicePixelRatioRounding()).toEqual(true)
    expect(minimap.getDevicePixelRatio()).toEqual(1)
  })

  it('prevents the rounding number of devicePixelRatio', () => {
    devicePixelRatio = 1.25

    minimap.setDevicePixelRatioRounding(false)

    expect(minimap.getDevicePixelRatioRounding()).toEqual(false)
    expect(minimap.getDevicePixelRatio()).toEqual(1.25)
  })
})
