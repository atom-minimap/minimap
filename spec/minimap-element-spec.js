'use babel'

import fs from 'fs-plus'
import path from 'path'
import Minimap from '../lib/minimap'
import MinimapElement from '../lib/minimap-element'
import {stylesheet} from './helpers/workspace'
import {mousemove, mousedown, mouseup, mousewheel, touchstart, touchmove} from './helpers/events'

function realOffsetTop (o) {
  // transform = new WebKitCSSMatrix window.getComputedStyle(o).transform
  // o.offsetTop + transform.m42
  return o.offsetTop
}

function realOffsetLeft (o) {
  // transform = new WebKitCSSMatrix window.getComputedStyle(o).transform
  // o.offsetLeft + transform.m41
  return o.offsetLeft
}

function isVisible (node) {
  return node.offsetWidth > 0 || node.offsetHeight > 0
}

function sleep (duration) {
  let t = new Date()
  waitsFor(() => { return new Date() - t > duration })
}

describe('MinimapElement', () => {
  let [editor, minimap, largeSample, mediumSample, smallSample, jasmineContent, editorElement, minimapElement, dir] = []

  beforeEach(() => {
    // Comment after body below to leave the created text editor and minimap
    // on DOM after the test run.
    jasmineContent = document.body.querySelector('#jasmine-content')

    atom.config.set('minimap.charHeight', 4)
    atom.config.set('minimap.charWidth', 2)
    atom.config.set('minimap.interline', 1)
    atom.config.set('minimap.textOpacity', 1)

    MinimapElement.registerViewProvider(Minimap)

    editor = atom.workspace.buildTextEditor({})
    editorElement = atom.views.getView(editor)
    jasmineContent.insertBefore(editorElement, jasmineContent.firstChild)
    editorElement.setHeight(50)
    // editor.setLineHeightInPixels(10)

    minimap = new Minimap({textEditor: editor})
    dir = atom.project.getDirectories()[0]

    largeSample = fs.readFileSync(dir.resolve('large-file.coffee')).toString()
    mediumSample = fs.readFileSync(dir.resolve('two-hundred.txt')).toString()
    smallSample = fs.readFileSync(dir.resolve('sample.coffee')).toString()

    editor.setText(largeSample)

    minimapElement = atom.views.getView(minimap)
  })

  it('has been registered in the view registry', () => {
    expect(minimapElement).toExist()
  })

  it('has stored the minimap as its model', () => {
    expect(minimapElement.getModel()).toBe(minimap)
  })

  it('has a canvas in a shadow DOM', () => {
    expect(minimapElement.shadowRoot.querySelector('canvas')).toExist()
  })

  it('has a div representing the visible area', () => {
    expect(minimapElement.shadowRoot.querySelector('.minimap-visible-area')).toExist()
  })

  //       ###    ######## ########    ###     ######  ##     ##
  //      ## ##      ##       ##      ## ##   ##    ## ##     ##
  //     ##   ##     ##       ##     ##   ##  ##       ##     ##
  //    ##     ##    ##       ##    ##     ## ##       #########
  //    #########    ##       ##    ######### ##       ##     ##
  //    ##     ##    ##       ##    ##     ## ##    ## ##     ##
  //    ##     ##    ##       ##    ##     ##  ######  ##     ##

  describe('when attached to the text editor element', () => {
    let [noAnimationFrame, nextAnimationFrame, lastFn, canvas, visibleArea] = []

    beforeEach(() => {
      noAnimationFrame = () => { throw new Error('No animation frame requested') }
      nextAnimationFrame = noAnimationFrame

      let requestAnimationFrameSafe = window.requestAnimationFrame
      spyOn(window, 'requestAnimationFrame').andCallFake(function(fn) {
        lastFn = fn
        nextAnimationFrame = () => {
          nextAnimationFrame = noAnimationFrame
          fn()
        }
      })
    })

    beforeEach(() => {
      canvas = minimapElement.shadowRoot.querySelector('canvas')
      editorElement.setWidth(200)
      editorElement.setHeight(50)

      editorElement.setScrollTop(1000)
      editorElement.setScrollLeft(200)
      minimapElement.attach()
    })

    afterEach(() => { minimap.destroy() })

    it('takes the height of the editor', () => {
      expect(minimapElement.offsetHeight).toEqual(editorElement.clientHeight)

      expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.clientWidth / 10, 0)
    })

    it('knows when attached to a text editor', () => {
      expect(minimapElement.attachedToTextEditor).toBeTruthy()
    })

    it('resizes the canvas to fit the minimap', () => {
      expect(canvas.offsetHeight / devicePixelRatio).toBeCloseTo(minimapElement.offsetHeight + minimap.getLineHeight(), 0)
      expect(canvas.offsetWidth / devicePixelRatio).toBeCloseTo(minimapElement.offsetWidth, 0)
    })

    it('requests an update', () => {
      expect(minimapElement.frameRequested).toBeTruthy()
    })

    //     ######   ######   ######
    //    ##    ## ##    ## ##    ##
    //    ##       ##       ##
    //    ##        ######   ######
    //    ##             ##       ##
    //    ##    ## ##    ## ##    ##
    //     ######   ######   ######

    describe('with css filters', () => {
      describe('when a hue-rotate filter is applied to a rgb color', () => {
        let [additionnalStyleNode] = []
        beforeEach(() => {
          minimapElement.invalidateDOMStylesCache()

          additionnalStyleNode = document.createElement('style')
          additionnalStyleNode.textContent = `
            ${stylesheet}

            .editor {
              color: red;
              -webkit-filter: hue-rotate(180deg);
            }
          `

          jasmineContent.appendChild(additionnalStyleNode)
        })

        it('computes the new color by applying the hue rotation', () => {
          waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
          runs(() => {
            nextAnimationFrame()
            expect(minimapElement.retrieveStyleFromDom(['.editor'], 'color')).toEqual(`rgb(0, ${0x6d}, ${0x6d})`)
          })
        })
      })

      describe('when a hue-rotate filter is applied to a rgba color', () => {
        let [additionnalStyleNode] = []

        beforeEach(() => {
          minimapElement.invalidateDOMStylesCache()

          additionnalStyleNode = document.createElement('style')
          additionnalStyleNode.textContent = `
            ${stylesheet}

            .editor {
              color: rgba(255,0,0,0);
              -webkit-filter: hue-rotate(180deg);
            }
          `

          jasmineContent.appendChild(additionnalStyleNode)
        })

        it('computes the new color by applying the hue rotation', () => {
          waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
          runs(() => {
            nextAnimationFrame()
            expect(minimapElement.retrieveStyleFromDom(['.editor'], 'color')).toEqual(`rgba(0, ${0x6d}, ${0x6d}, 0)`)
          })
        })
      })
    })


    //    ##     ## ########  ########     ###    ######## ########
    //    ##     ## ##     ## ##     ##   ## ##      ##    ##
    //    ##     ## ##     ## ##     ##  ##   ##     ##    ##
    //    ##     ## ########  ##     ## ##     ##    ##    ######
    //    ##     ## ##        ##     ## #########    ##    ##
    //    ##     ## ##        ##     ## ##     ##    ##    ##
    //     #######  ##        ########  ##     ##    ##    ########

    describe('when the update is performed', () => {
      beforeEach(() => {
        waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
        runs(() => {
          nextAnimationFrame()
          visibleArea = minimapElement.shadowRoot.querySelector('.minimap-visible-area')
        })
      })

      it('sets the visible area width and height', () => {
        expect(visibleArea.offsetWidth).toEqual(minimapElement.clientWidth)
        expect(visibleArea.offsetHeight).toBeCloseTo(minimap.getTextEditorScaledHeight(), 0)
      })

      it('sets the visible visible area offset', () => {
        expect(realOffsetTop(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop(), 0)
        expect(realOffsetLeft(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollLeft(), 0)
      })

      it('offsets the canvas when the scroll does not match line height', () => {
        editorElement.setScrollTop(1004)

        waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
        runs(() => {
          nextAnimationFrame()

          expect(realOffsetTop(canvas)).toBeCloseTo(-2, -1)
        })
      })

      it('does not fail to update render the invisible char when modified', () => {
        atom.config.set('editor.showInvisibles', true)
        atom.config.set('editor.invisibles', {cr: '*'})

        expect(() => { nextAnimationFrame() }).not.toThrow()
      })

      it('renders the visible line decorations', () => {
        spyOn(minimapElement, 'drawLineDecoration').andCallThrough()

        minimap.decorateMarker(editor.markBufferRange([[1,0], [1,10]]), {type: 'line', color: '#0000FF'})
        minimap.decorateMarker(editor.markBufferRange([[10,0], [10,10]]), {type: 'line', color: '#0000FF'})
        minimap.decorateMarker(editor.markBufferRange([[100,0], [100,10]]), {type: 'line', color: '#0000FF'})

        editorElement.setScrollTop(0)

        waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
        runs(() => {
          nextAnimationFrame()

          expect(minimapElement.drawLineDecoration).toHaveBeenCalled()
          expect(minimapElement.drawLineDecoration.calls.length).toEqual(2)
        })
      })

      it('renders the visible highlight decorations', () => {
        spyOn(minimapElement, 'drawHighlightDecoration').andCallThrough()

        minimap.decorateMarker(editor.markBufferRange([[1,0], [1,4]]), {type: 'highlight-under', color: '#0000FF'})
        minimap.decorateMarker(editor.markBufferRange([[2,20], [2,30]]), {type: 'highlight-over', color: '#0000FF'})
        minimap.decorateMarker(editor.markBufferRange([[100,3], [100,5]]), {type: 'highlight-under', color: '#0000FF'})

        editorElement.setScrollTop(0)

        waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
        runs(() => {
          nextAnimationFrame()

          expect(minimapElement.drawHighlightDecoration).toHaveBeenCalled()
          expect(minimapElement.drawHighlightDecoration.calls.length).toEqual(2)
        })
      })

      it('renders the visible outline decorations', () => {
        spyOn(minimapElement, 'drawHighlightOutlineDecoration').andCallThrough()

        minimap.decorateMarker(editor.markBufferRange([[1,4], [3,6]]), {type: 'highlight-outline', color: '#0000ff'})
        minimap.decorateMarker(editor.markBufferRange([[6,0], [6,7]]), {type: 'highlight-outline', color: '#0000ff'})
        minimap.decorateMarker(editor.markBufferRange([[100,3], [100,5]]), {type: 'highlight-outline', color: '#0000ff'})

        editorElement.setScrollTop(0)

        waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
        runs(() => {
          nextAnimationFrame()

          expect(minimapElement.drawHighlightOutlineDecoration).toHaveBeenCalled()
          expect(minimapElement.drawHighlightOutlineDecoration.calls.length).toEqual(4)
        })
      })

      describe('when the editor is scrolled', () => {
        beforeEach(() => {
          editorElement.setScrollTop(2000)
          editorElement.setScrollLeft(50)

          waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
          runs(() => { nextAnimationFrame() })
        })

        it('updates the visible area', () => {
          expect(realOffsetTop(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop(), 0)
          expect(realOffsetLeft(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollLeft(), 0)
        })
      })

      describe('when the editor is resized to a greater size', () => {
        beforeEach(() => {
          let height = editorElement.getHeight()
          editorElement.style.width = '800px'
          editorElement.style.height = '500px'

          minimapElement.measureHeightAndWidth()

          waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
          runs(() => { nextAnimationFrame() })
        })

        it('detects the resize and adjust itself', () => {
          expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 10, 0)
          expect(minimapElement.offsetHeight).toEqual(editorElement.offsetHeight)

          expect(canvas.offsetWidth / devicePixelRatio).toBeCloseTo(minimapElement.offsetWidth, 0)
          expect(canvas.offsetHeight / devicePixelRatio).toBeCloseTo(minimapElement.offsetHeight + minimap.getLineHeight(), 0)
        })
      })

      describe('when the editor visible content is changed', () => {
        beforeEach(() => {
          editorElement.setScrollLeft(0)
          editorElement.setScrollTop(1400)
          editor.setSelectedBufferRange([[101, 0], [102, 20]])

          waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
          runs(() => {
            nextAnimationFrame()

            spyOn(minimapElement, 'drawLines').andCallThrough()
            editor.insertText('foo')
          })
        })

        it('rerenders the part that have changed', () => {
          waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
          runs(() => {
            nextAnimationFrame()

            expect(minimapElement.drawLines).toHaveBeenCalled()
            expect(minimapElement.drawLines.argsForCall[0][0]).toEqual(100)
            expect(minimapElement.drawLines.argsForCall[0][1]).toEqual(101)
          })
        })
      })

      describe('when the editor visibility change', () => {
        it('does not modify the size of the canvas', () => {
          let canvasWidth = minimapElement.getFrontCanvas().width
          let canvasHeight = minimapElement.getFrontCanvas().height
          editorElement.style.display = 'none'

          minimapElement.measureHeightAndWidth()

          waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
          runs(() => {
            nextAnimationFrame()

            expect(minimapElement.getFrontCanvas().width).toEqual(canvasWidth)
            expect(minimapElement.getFrontCanvas().height).toEqual(canvasHeight)
          })
        })

        describe('from hidden to visible', () => {
          beforeEach(() => {
            editorElement.style.display = 'none'
            minimapElement.checkForVisibilityChange()
            spyOn(minimapElement, 'requestForcedUpdate')
            editorElement.style.display = ''
            minimapElement.pollDOM()
          })

          it('requests an update of the whole minimap', () => {
            expect(minimapElement.requestForcedUpdate).toHaveBeenCalled()
          })
        })
      })
    })

    //     ######   ######  ########   #######  ##       ##
    //    ##    ## ##    ## ##     ## ##     ## ##       ##
    //    ##       ##       ##     ## ##     ## ##       ##
    //     ######  ##       ########  ##     ## ##       ##
    //          ## ##       ##   ##   ##     ## ##       ##
    //    ##    ## ##    ## ##    ##  ##     ## ##       ##
    //     ######   ######  ##     ##  #######  ######## ########

    describe('mouse scroll controls', () => {
      beforeEach(() => {
        editorElement.setWidth(400)
        editorElement.setHeight(400)
        editorElement.setScrollTop(0)
        editorElement.setScrollLeft(0)

        nextAnimationFrame()

        minimapElement.measureHeightAndWidth()

        waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
        runs(() => { nextAnimationFrame() })
      })

      describe('using the mouse scrollwheel over the minimap', () => {
        beforeEach(() => {
          spyOn(editorElement.component.presenter, 'setScrollTop').andCallFake(() => {})

          mousewheel(minimapElement, 0, 15)
        })

        it('relays the events to the editor view', () => {
          expect(editorElement.component.presenter.setScrollTop).toHaveBeenCalled()
        })
      })

      describe('middle clicking the minimap', () => {
        let [canvas, visibleArea, originalLeft, maxScroll] = []

        beforeEach(() => {
          canvas = minimapElement.getFrontCanvas()
          visibleArea = minimapElement.visibleArea
          originalLeft = visibleArea.getBoundingClientRect().left
          maxScroll = minimap.getTextEditorMaxScrollTop()
        })

        it('scrolls to the top using the middle mouse button', () => {
          mousedown(canvas, {x: originalLeft + 1, y: 0, btn: 1})
          expect(editorElement.getScrollTop()).toEqual(0)
        })

        describe('scrolling to the middle using the middle mouse button', () => {
          let canvasMidY = undefined

          beforeEach(() => {
            let editorMidY = editorElement.getHeight() / 2.0
            let {top, height} = canvas.getBoundingClientRect()
            canvasMidY = top + (height / 2.0)
            let actualMidY = Math.min(canvasMidY, editorMidY)
            mousedown(canvas, {x: originalLeft + 1, y: actualMidY, btn: 1})
          })

          it('scrolls the editor to the middle', () => {
            let middleScrollTop = Math.round((maxScroll) / 2.0)
            expect(editorElement.getScrollTop()).toEqual(middleScrollTop)
          })

          it('updates the visible area to be centered', () => {
            waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
            runs(() => {
              nextAnimationFrame()
              let {top, height} = visibleArea.getBoundingClientRect()

              let visibleCenterY = top + (height / 2)
              expect(visibleCenterY).toBeCloseTo(200, 0)
            })
          })
        })

        describe('scrolling the editor to an arbitrary location', () => {
          let [scrollTo, scrollRatio] = []

          beforeEach(() => {
            scrollTo = 101 // pixels
            scrollRatio = (scrollTo - minimap.getTextEditorScaledHeight()/2) / (minimap.getVisibleHeight() - minimap.getTextEditorScaledHeight())
            scrollRatio = Math.max(0, scrollRatio)
            scrollRatio = Math.min(1, scrollRatio)

            mousedown(canvas, {x: originalLeft + 1, y: scrollTo, btn: 1})

            waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
            runs(() => { nextAnimationFrame() })
          })

          it('scrolls the editor to an arbitrary location', () => {
            let expectedScroll = maxScroll * scrollRatio
            expect(editorElement.getScrollTop()).toBeCloseTo(expectedScroll, 0)
          })

          describe( 'dragging the visible area with middle mouse button ' +
          'after scrolling to the arbitrary location', () => {
            let [originalTop] = []

            beforeEach(() => {
              originalTop = visibleArea.getBoundingClientRect().top
              mousemove(visibleArea, {x: originalLeft + 1, y: scrollTo + 40})

              waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
              runs(() => { nextAnimationFrame() })
            })

            afterEach(() => {
              minimapElement.endDrag()
            })

            it( 'scrolls the editor so that the visible area was moved down ' +
            'by 40 pixels from the arbitrary location', () => {
              let {top} = visibleArea.getBoundingClientRect()
              expect(top).toBeCloseTo(originalTop + 40, -1)
            })
          })
        })
      })

      describe('pressing the mouse on the minimap canvas (without scroll animation)', () => {
        beforeEach(() => {
          let t = 0
          spyOn(minimapElement, 'getTime').andCallFake(() => { return n = t, t += 100, n })
          spyOn(minimapElement, 'requestUpdate').andCallFake(() => {})

          atom.config.set('minimap.scrollAnimation', false)

          canvas = minimapElement.getFrontCanvas()
          mousedown(canvas)
        })

        it('scrolls the editor to the line below the mouse', () => {
          let scrollTop
          let {top, left, width, height} = minimapElement.getFrontCanvas().getBoundingClientRect()
          let middle = top + height / 2

          // Should be 400 on stable and 480 on beta.
          // I'm still looking for a reason.
          scrollTop =
          expect(editorElement.getScrollTop()).toBeGreaterThan(380)
        })
      })

      describe('pressing the mouse on the minimap canvas (with scroll animation)', () => {
        beforeEach(() => {

          let t = 0
          spyOn(minimapElement, 'getTime').andCallFake(() => { return n = t, t += 100, n })
          spyOn(minimapElement, 'requestUpdate').andCallFake(() => {})

          atom.config.set('minimap.scrollAnimation', true)
          atom.config.set('minimap.scrollAnimationDuration', 300)

          canvas = minimapElement.getFrontCanvas()
          mousedown(canvas)

          waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
        })

        it('scrolls the editor gradually to the line below the mouse', () => {
          // wait until all animations run out
          waitsFor(() => {
            // Should be 400 on stable and 480 on beta.
            // I'm still looking for a reason.
            nextAnimationFrame !== noAnimationFrame && nextAnimationFrame()
            return editorElement.getScrollTop() >= 380
          })
        })
      })

      describe('dragging the visible area', () => {
        let [visibleArea, originalTop] = []

        beforeEach(() => {
          visibleArea = minimapElement.visibleArea
          let o = visibleArea.getBoundingClientRect()
          let left = o.left
          originalTop = o.top

          mousedown(visibleArea, {x: left + 10, y: originalTop + 10})
          mousemove(visibleArea, {x: left + 10, y: originalTop + 50})

          waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
          runs(() => { nextAnimationFrame() })
        })

        afterEach(() => {
          minimapElement.endDrag()
        })

        it('scrolls the editor so that the visible area was moved down by 40 pixels', () => {
          let {top} = visibleArea.getBoundingClientRect()
          expect(top).toBeCloseTo(originalTop + 40, -1)
        })

        it('stops the drag gesture when the mouse is released outside the minimap', () => {
          let {top, left} = visibleArea.getBoundingClientRect()
          mouseup(jasmineContent, {x: left - 10, y: top + 80})

          spyOn(minimapElement, 'drag')
          mousemove(visibleArea, {x: left + 10, y: top + 50})

          expect(minimapElement.drag).not.toHaveBeenCalled()
        })
      })

      describe('dragging the visible area using touch events', () => {
        let [visibleArea, originalTop] = []

        beforeEach(() => {
          visibleArea = minimapElement.visibleArea
          let o = visibleArea.getBoundingClientRect()
          let left = o.left
          originalTop = o.top

          touchstart(visibleArea, {x: left + 10, y: originalTop + 10})
          touchmove(visibleArea, {x: left + 10, y: originalTop + 50})

          waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
          runs(() => { nextAnimationFrame() })
        })

        afterEach(() => {
          minimapElement.endDrag()
        })

        it('scrolls the editor so that the visible area was moved down by 40 pixels', () => {
          let {top} = visibleArea.getBoundingClientRect()
          expect(top).toBeCloseTo(originalTop + 40, -1)
        })

        it('stops the drag gesture when the mouse is released outside the minimap', () => {
          let {top, left} = visibleArea.getBoundingClientRect()
          mouseup(jasmineContent, {x: left - 10, y: top + 80})

          spyOn(minimapElement, 'drag')
          touchmove(visibleArea, {x: left + 10, y: top + 50})

          expect(minimapElement.drag).not.toHaveBeenCalled()
        })
      })

      describe('when the minimap cannot scroll', () => {
        let [visibleArea, originalTop] = []

        beforeEach(() => {
          let sample = fs.readFileSync(dir.resolve('seventy.txt')).toString()
          editor.setText(sample)
          editorElement.setScrollTop(0)
        })

        describe('dragging the visible area', () => {
          beforeEach(() => {
            waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
            runs(() => {
              nextAnimationFrame()

              visibleArea = minimapElement.visibleArea
              let {top, left} = visibleArea.getBoundingClientRect()
              originalTop = top

              mousedown(visibleArea, {x: left + 10, y: top + 10})
              mousemove(visibleArea, {x: left + 10, y: top + 50})
            })

            waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
            runs(() => { nextAnimationFrame() })
          })

          afterEach(() => {
            minimapElement.endDrag()
          })

          it('scrolls based on a ratio adjusted to the minimap height', () => {
            let {top} = visibleArea.getBoundingClientRect()
            expect(top).toBeCloseTo(originalTop + 40, -1)
          })
        })
      })

      describe('when scroll past end is enabled', () => {
        beforeEach(() => {
          atom.config.set('editor.scrollPastEnd', true)

          waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
          runs(() => { nextAnimationFrame() })
        })

        describe('dragging the visible area', () => {
          let [visibleArea, originalTop] = []

          beforeEach(() => {
            visibleArea = minimapElement.visibleArea
            let {top, left} = visibleArea.getBoundingClientRect()
            originalTop = top

            mousedown(visibleArea, {x: left + 10, y: top + 10})
            mousemove(visibleArea, {x: left + 10, y: top + 50})

            waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
            runs(() => { nextAnimationFrame() })
          })

          afterEach(() => {
            minimapElement.endDrag()
          })

          it('scrolls the editor so that the visible area was moved down by 40 pixels', () => {
            let {top} = visibleArea.getBoundingClientRect()
            expect(top).toBeCloseTo(originalTop + 40, -1)
          })
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

    describe('when the model is a stand-alone minimap', () => {
      beforeEach(() => {
        minimap.setStandAlone(true)
      })

      it('has a stand-alone attribute', () => {
        expect(minimapElement.hasAttribute('stand-alone')).toBeTruthy()
      })

      it('sets the minimap size when measured', () => {
        minimapElement.measureHeightAndWidth()

        expect(minimap.width).toEqual(minimapElement.clientWidth)
        expect(minimap.height).toEqual(minimapElement.clientHeight)
      })

      it('removes the controls div', () => {
        expect(minimapElement.shadowRoot.querySelector('.minimap-controls')).toBeNull()
      })

      it('removes the visible area', () => {
        expect(minimapElement.visibleArea).toBeUndefined()
      })

      it('removes the quick settings button', () => {
        atom.config.set('minimap.displayPluginsControls', true)

        waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
        runs(() => {
          nextAnimationFrame()
          expect(minimapElement.openQuickSettings).toBeUndefined()
        })
      })

      it('removes the scroll indicator', () => {
        editor.setText(mediumSample)
        editorElement.setScrollTop(50)

        waitsFor(() => { return minimapElement.frameRequested })
        runs(() => {
          nextAnimationFrame()
          atom.config.set('minimap.minimapScrollIndicator', true)
        })

        waitsFor(() => { return minimapElement.frameRequested })
        runs(() => {
          nextAnimationFrame()
          expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).toBeNull()
        })
      })

      describe('pressing the mouse on the minimap canvas', () => {
        beforeEach(() => {
          jasmineContent.appendChild(minimapElement)

          let t = 0
          spyOn(minimapElement, 'getTime').andCallFake(() => { return n = t, t += 100, n })
          spyOn(minimapElement, 'requestUpdate').andCallFake(() => {})

          atom.config.set('minimap.scrollAnimation', false)

          canvas = minimapElement.getFrontCanvas()
          mousedown(canvas)
        })

        it('does not scroll the editor to the line below the mouse', () => {
          expect(editorElement.getScrollTop()).toEqual(1000)
        })
      })

      describe('and is changed to be a classical minimap again', () => {
        beforeEach(() => {
          atom.config.set('minimap.displayPluginsControls', true)
          atom.config.set('minimap.minimapScrollIndicator', true)

          minimap.setStandAlone(false)
        })

        it('recreates the destroyed elements', () => {
          expect(minimapElement.shadowRoot.querySelector('.minimap-controls')).toExist()
          expect(minimapElement.shadowRoot.querySelector('.minimap-visible-area')).toExist()
          expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).toExist()
          expect(minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')).toExist()
        })
      })
    })

    //    ########  ########  ######  ######## ########   #######  ##    ##
    //    ##     ## ##       ##    ##    ##    ##     ## ##     ##  ##  ##
    //    ##     ## ##       ##          ##    ##     ## ##     ##   ####
    //    ##     ## ######    ######     ##    ########  ##     ##    ##
    //    ##     ## ##             ##    ##    ##   ##   ##     ##    ##
    //    ##     ## ##       ##    ##    ##    ##    ##  ##     ##    ##
    //    ########  ########  ######     ##    ##     ##  #######     ##

    describe('when the model is destroyed', () => {
      beforeEach(() => {
        minimap.destroy()
      })

      it('detaches itself from its parent', () => {
        expect(minimapElement.parentNode).toBeNull()
      })

      it('stops the DOM polling interval', () => {
        spyOn(minimapElement, 'pollDOM')

        sleep(200)

        runs(() => { expect(minimapElement.pollDOM).not.toHaveBeenCalled() })
      })
    })

    //     ######   #######  ##    ## ######## ####  ######
    //    ##    ## ##     ## ###   ## ##        ##  ##    ##
    //    ##       ##     ## ####  ## ##        ##  ##
    //    ##       ##     ## ## ## ## ######    ##  ##   ####
    //    ##       ##     ## ##  #### ##        ##  ##    ##
    //    ##    ## ##     ## ##   ### ##        ##  ##    ##
    //     ######   #######  ##    ## ##       ####  ######

    describe('when the atom styles are changed', () => {
      beforeEach(() => {
        waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
        runs(() => {
          nextAnimationFrame()
          spyOn(minimapElement, 'requestForcedUpdate').andCallThrough()
          spyOn(minimapElement, 'invalidateDOMStylesCache').andCallThrough()

          let styleNode = document.createElement('style')
          styleNode.textContent = 'body{ color: #233 }'
          atom.styles.emitter.emit('did-add-style-element', styleNode)
        })

        waitsFor(() => { return minimapElement.frameRequested })
      })

      it('forces a refresh with cache invalidation', () => {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled()
        expect(minimapElement.invalidateDOMStylesCache).toHaveBeenCalled()
      })
    })

    describe('when minimap.textOpacity is changed', () => {
      beforeEach(() => {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough()
        atom.config.set('minimap.textOpacity', 0.3)

        waitsFor(() => { return minimapElement.frameRequested })
        runs(() => { nextAnimationFrame() })
      })

      it('requests a complete update', () => {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled()
      })
    })

    describe('when minimap.displayCodeHighlights is changed', () => {
      beforeEach(() => {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough()
        atom.config.set('minimap.displayCodeHighlights', true)

        waitsFor(() => { return minimapElement.frameRequested })
        runs(() => { nextAnimationFrame() })
      })

      it('requests a complete update', () => {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled()
      })
    })

    describe('when minimap.charWidth is changed', () => {
      beforeEach(() => {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough()
        atom.config.set('minimap.charWidth', 1)

        waitsFor(() => { return minimapElement.frameRequested })
        runs(() => { nextAnimationFrame() })
      })

      it('requests a complete update', () => {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled()
      })
    })

    describe('when minimap.charHeight is changed', () => {
      beforeEach(() => {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough()
        atom.config.set('minimap.charHeight', 1)

        waitsFor(() => { return minimapElement.frameRequested })
        runs(() => { nextAnimationFrame() })
      })

      it('requests a complete update', () => {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled()
      })
    })

    describe('when minimap.interline is changed', () => {
      beforeEach(() => {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough()
        atom.config.set('minimap.interline', 2)

        waitsFor(() => { return minimapElement.frameRequested })
        runs(() => { nextAnimationFrame() })
      })

      it('requests a complete update', () => {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled()
      })
    })

    describe('when minimap.displayMinimapOnLeft setting is true', () => {
      it('moves the attached minimap to the left', () => {
        atom.config.set('minimap.displayMinimapOnLeft', true)
        expect(minimapElement.classList.contains('left')).toBeTruthy()
      })

      describe('when the minimap is not attached yet', () => {
        beforeEach(() => {
          editor = atom.workspace.buildTextEditor({})
          editorElement = atom.views.getView(editor)
          editorElement.setHeight(50)
          editor.setLineHeightInPixels(10)

          minimap = new Minimap({textEditor: editor})
          minimapElement = atom.views.getView(minimap)

          jasmineContent.insertBefore(editorElement, jasmineContent.firstChild)

          atom.config.set('minimap.displayMinimapOnLeft', true)
          minimapElement.attach()
        })

        it('moves the attached minimap to the left', () => {
          expect(minimapElement.classList.contains('left')).toBeTruthy()
        })
      })
    })

    describe('when minimap.adjustMinimapWidthToSoftWrap is true', () => {
      let [minimapWidth] = []
      beforeEach(() => {
        minimapWidth = minimapElement.offsetWidth

        atom.config.set('editor.softWrap', true)
        atom.config.set('editor.softWrapAtPreferredLineLength', true)
        atom.config.set('editor.preferredLineLength', 2)

        atom.config.set('minimap.adjustMinimapWidthToSoftWrap', true)

        waitsFor(() => { return minimapElement.frameRequested })
        runs(() => { nextAnimationFrame() })
      })

      it('adjusts the width of the minimap canvas', () => {
        expect(minimapElement.getFrontCanvas().width / devicePixelRatio).toEqual(4)
      })

      it('offsets the minimap by the difference', () => {
        expect(realOffsetLeft(minimapElement)).toBeCloseTo(editorElement.clientWidth - 4, -1)
        expect(minimapElement.clientWidth).toEqual(4)
      })

      describe('the dom polling routine', () => {
        it('does not change the value', () => {
          atom.views.performDocumentPoll()

          waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
          runs(() => {
            nextAnimationFrame()
            expect(minimapElement.getFrontCanvas().width / devicePixelRatio).toEqual(4)
          })
        })
      })

      describe('when the editor is resized', () => {
        beforeEach(() => {
          atom.config.set('editor.preferredLineLength', 6)
          editorElement.style.width = '100px'
          editorElement.style.height = '100px'

          atom.views.performDocumentPoll()

          waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
          runs(() => { nextAnimationFrame() })
        })

        it('makes the minimap smaller than soft wrap', () => {
          expect(minimapElement.offsetWidth).toBeCloseTo(12, -1)
          expect(minimapElement.style.marginRight).toEqual('')
        })
      })

      describe('and when minimap.minimapScrollIndicator setting is true', () => {
        beforeEach(() => {
          editor.setText(mediumSample)
          editorElement.setScrollTop(50)

          waitsFor(() => { return minimapElement.frameRequested })
          runs(() => {
            nextAnimationFrame()
            atom.config.set('minimap.minimapScrollIndicator', true)
          })

          waitsFor(() => { return minimapElement.frameRequested })
          runs(() => { nextAnimationFrame() })
        })

        it('offsets the scroll indicator by the difference', () => {
          let indicator = minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')
          expect(realOffsetLeft(indicator)).toBeCloseTo(2, -1)
        })
      })

      describe('and when minimap.displayPluginsControls setting is true', () => {
        beforeEach(() => {
          atom.config.set('minimap.displayPluginsControls', true)
        })

        it('offsets the scroll indicator by the difference', () => {
          let openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')
          expect(realOffsetLeft(openQuickSettings)).not.toBeCloseTo(2, -1)
        })
      })

      describe('and then disabled', () => {
        beforeEach(() => {
          atom.config.set('minimap.adjustMinimapWidthToSoftWrap', false)

          waitsFor(() => { return minimapElement.frameRequested })
          runs(() => { nextAnimationFrame() })
        })

        it('adjusts the width of the minimap', () => {
          expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 10, -1)
          expect(minimapElement.style.width).toEqual('')
        })
      })

      describe('and when preferredLineLength >= 16384', () => {
        beforeEach(() => {
          atom.config.set('editor.preferredLineLength', 16384)

          waitsFor(() => { return minimapElement.frameRequested })
          runs(() => { nextAnimationFrame() })
        })

        it('adjusts the width of the minimap', () => {
          expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 10, -1)
          expect(minimapElement.style.width).toEqual('')
        })
      })
    })

    describe('when minimap.minimapScrollIndicator setting is true', () => {
      beforeEach(() => {
        editor.setText(mediumSample)
        editorElement.setScrollTop(50)

        waitsFor(() => { return minimapElement.frameRequested })
        runs(() => { nextAnimationFrame() })

        atom.config.set('minimap.minimapScrollIndicator', true)
      })

      it('adds a scroll indicator in the element', () => {
        expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).toExist()
      })

      describe('and then deactivated', () => {
        it('removes the scroll indicator from the element', () => {
          atom.config.set('minimap.minimapScrollIndicator', false)
          expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).not.toExist()
        })
      })

      describe('on update', () => {
        beforeEach(() => {
          let height = editorElement.getHeight()
          editorElement.style.height = '500px'

          atom.views.performDocumentPoll()

          waitsFor(() => { return nextAnimationFrame !== noAnimationFrame })
          runs(() => { nextAnimationFrame() })
        })

        it('adjusts the size and position of the indicator', () => {
          let indicator = minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')

          let height = editorElement.getHeight() * (editorElement.getHeight() / minimap.getHeight())
          let scroll = (editorElement.getHeight() - height) * minimap.getTextEditorScrollRatio()

          expect(indicator.offsetHeight).toBeCloseTo(height, 0)
          expect(realOffsetTop(indicator)).toBeCloseTo(scroll, 0)
        })
      })

      describe('when the minimap cannot scroll', () => {
        beforeEach(() => {
          editor.setText(smallSample)

          waitsFor(() => { return minimapElement.frameRequested })
          runs(() => { nextAnimationFrame() })
        })

        it('removes the scroll indicator', () => {
          expect(minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator')).not.toExist()
        })

        describe('and then can scroll again', () => {
          beforeEach(() => {
            editor.setText(largeSample)

            waitsFor(() => { return minimapElement.frameRequested })
            runs(() => { nextAnimationFrame() })
          })

          it('attaches the scroll indicator', () => {
            waitsFor(() => { return minimapElement.shadowRoot.querySelector('.minimap-scroll-indicator') })
          })
        })
      })
    })

    describe('when minimap.absoluteMode setting is true', () => {
      beforeEach(() => {
        atom.config.set('minimap.absoluteMode', true)
      })

      it('adds a absolute class to the minimap element', () => {
        expect(minimapElement.classList.contains('absolute')).toBeTruthy()
      })

      describe('when minimap.displayMinimapOnLeft setting is true', () => {
        it('also adds a left class to the minimap element', () => {
          atom.config.set('minimap.displayMinimapOnLeft', true)
          expect(minimapElement.classList.contains('absolute')).toBeTruthy()
          expect(minimapElement.classList.contains('left')).toBeTruthy()
        })
      })
    })

    //     #######  ##     ## ####  ######  ##    ##
    //    ##     ## ##     ##  ##  ##    ## ##   ##
    //    ##     ## ##     ##  ##  ##       ##  ##
    //    ##     ## ##     ##  ##  ##       #####
    //    ##  ## ## ##     ##  ##  ##       ##  ##
    //    ##    ##  ##     ##  ##  ##    ## ##   ##
    //     ##### ##  #######  ####  ######  ##    ##
    //
    //     ######  ######## ######## ######## #### ##    ##  ######    ######
    //    ##    ## ##          ##       ##     ##  ###   ## ##    ##  ##    ##
    //    ##       ##          ##       ##     ##  ####  ## ##        ##
    //     ######  ######      ##       ##     ##  ## ## ## ##   ####  ######
    //          ## ##          ##       ##     ##  ##  #### ##    ##        ##
    //    ##    ## ##          ##       ##     ##  ##   ### ##    ##  ##    ##
    //     ######  ########    ##       ##    #### ##    ##  ######    ######

    describe('when minimap.displayPluginsControls setting is true', () => {
      let [openQuickSettings, quickSettingsElement, workspaceElement] = []
      beforeEach(() => {
        atom.config.set('minimap.displayPluginsControls', true)
      })

      it('has a div to open the quick settings', () => {
        expect(minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')).toExist()
      })

      describe('clicking on the div', () => {
        beforeEach(() => {
          workspaceElement = atom.views.getView(atom.workspace)
          jasmineContent.appendChild(workspaceElement)

          openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')
          mousedown(openQuickSettings)

          quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings')
        })

        afterEach(() => {
          minimapElement.quickSettingsElement.destroy()
        })

        it('opens the quick settings view', () => {
          expect(quickSettingsElement).toExist()
        })

        it('positions the quick settings view next to the minimap', () => {
          let minimapBounds = minimapElement.getFrontCanvas().getBoundingClientRect()
          let settingsBounds = quickSettingsElement.getBoundingClientRect()

          expect(realOffsetTop(quickSettingsElement)).toBeCloseTo(minimapBounds.top, 0)
          expect(realOffsetLeft(quickSettingsElement)).toBeCloseTo(minimapBounds.left - settingsBounds.width, 0)
        })
      })

      describe('when the displayMinimapOnLeft setting is enabled', () => {
        describe('clicking on the div', () => {
          beforeEach(() => {
            atom.config.set('minimap.displayMinimapOnLeft', true)

            workspaceElement = atom.views.getView(atom.workspace)
            jasmineContent.appendChild(workspaceElement)

            openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')
            mousedown(openQuickSettings)

            quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings')
          })

          afterEach(() => {
            minimapElement.quickSettingsElement.destroy()
          })

          it('positions the quick settings view next to the minimap', () => {
            let minimapBounds = minimapElement.getFrontCanvas().getBoundingClientRect()
            let settingsBounds = quickSettingsElement.getBoundingClientRect()

            expect(realOffsetTop(quickSettingsElement)).toBeCloseTo(minimapBounds.top, 0)
            expect(realOffsetLeft(quickSettingsElement)).toBeCloseTo(minimapBounds.right, 0)
          })
        })
      })

      describe('when the adjustMinimapWidthToSoftWrap setting is enabled', () => {
        let [controls] = []
        beforeEach(() => {
          atom.config.set('editor.softWrap', true)
          atom.config.set('editor.softWrapAtPreferredLineLength', true)
          atom.config.set('editor.preferredLineLength', 2)

          atom.config.set('minimap.adjustMinimapWidthToSoftWrap', true)
          nextAnimationFrame()

          controls = minimapElement.shadowRoot.querySelector('.minimap-controls')
          openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')

          editorElement.style.width = '1024px'

          atom.views.performDocumentPoll()
          waitsFor(() => { return minimapElement.frameRequested })
          runs(() => { nextAnimationFrame() })
        })

        it('adjusts the size of the control div to fit in the minimap', () => {
          expect(controls.clientWidth).toEqual(minimapElement.getFrontCanvas().clientWidth / devicePixelRatio)
        })

        it('positions the controls div over the canvas', () => {
          let controlsRect = controls.getBoundingClientRect()
          let canvasRect = minimapElement.getFrontCanvas().getBoundingClientRect()
          expect(controlsRect.left).toEqual(canvasRect.left)
          expect(controlsRect.right).toEqual(canvasRect.right)
        })

        describe('when the displayMinimapOnLeft setting is enabled', () => {
          beforeEach(() => {
            atom.config.set('minimap.displayMinimapOnLeft', true)
          })

          it('adjusts the size of the control div to fit in the minimap', () => {
            expect(controls.clientWidth).toEqual(minimapElement.getFrontCanvas().clientWidth / devicePixelRatio)
          })

          it('positions the controls div over the canvas', () => {
            let controlsRect = controls.getBoundingClientRect()
            let canvasRect = minimapElement.getFrontCanvas().getBoundingClientRect()
            expect(controlsRect.left).toEqual(canvasRect.left)
            expect(controlsRect.right).toEqual(canvasRect.right)
          })

          describe('clicking on the div', () => {
            beforeEach(() => {
              workspaceElement = atom.views.getView(atom.workspace)
              jasmineContent.appendChild(workspaceElement)

              openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')
              mousedown(openQuickSettings)

              quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings')
            })

            afterEach(() => {
              minimapElement.quickSettingsElement.destroy()
            })

            it('positions the quick settings view next to the minimap', () => {
              let minimapBounds = minimapElement.getFrontCanvas().getBoundingClientRect()
              let settingsBounds = quickSettingsElement.getBoundingClientRect()

              expect(realOffsetTop(quickSettingsElement)).toBeCloseTo(minimapBounds.top, 0)
              expect(realOffsetLeft(quickSettingsElement)).toBeCloseTo(minimapBounds.right, 0)
            })
          })
        })
      })

      describe('when the quick settings view is open', () => {
        beforeEach(() => {
          workspaceElement = atom.views.getView(atom.workspace)
          jasmineContent.appendChild(workspaceElement)

          openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')
          mousedown(openQuickSettings)

          quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings')
        })

        it('sets the on right button active', () => {
          expect(quickSettingsElement.querySelector('.btn.selected:last-child')).toExist()
        })

        describe('clicking on the code highlight item', () => {
          beforeEach(() => {
            let item = quickSettingsElement.querySelector('li.code-highlights')
            mousedown(item)
          })

          it('toggles the code highlights on the minimap element', () => {
            expect(minimapElement.displayCodeHighlights).toBeTruthy()
          })

          it('requests an update', () => {
            expect(minimapElement.frameRequested).toBeTruthy()
          })
        })

        describe('clicking on the absolute mode item', () => {
          beforeEach(() => {
            let item = quickSettingsElement.querySelector('li.absolute-mode')
            mousedown(item)
          })

          it('toggles the absolute-mode setting', () => {
            expect(atom.config.get('minimap.absoluteMode')).toBeTruthy()
            expect(minimapElement.absoluteMode).toBeTruthy()
          })
        })

        describe('clicking on the on left button', () => {
          beforeEach(() => {
            let item = quickSettingsElement.querySelector('.btn:first-child')
            mousedown(item)
          })

          it('toggles the displayMinimapOnLeft setting', () => {
            expect(atom.config.get('minimap.displayMinimapOnLeft')).toBeTruthy()
          })

          it('changes the buttons activation state', () => {
            expect(quickSettingsElement.querySelector('.btn.selected:last-child')).not.toExist()
            expect(quickSettingsElement.querySelector('.btn.selected:first-child')).toExist()
          })
        })

        describe('core:move-left', () => {
          beforeEach(() => {
            atom.commands.dispatch(quickSettingsElement, 'core:move-left')
          })

          it('toggles the displayMinimapOnLeft setting', () => {
            expect(atom.config.get('minimap.displayMinimapOnLeft')).toBeTruthy()
          })

          it('changes the buttons activation state', () => {
            expect(quickSettingsElement.querySelector('.btn.selected:last-child')).not.toExist()
            expect(quickSettingsElement.querySelector('.btn.selected:first-child')).toExist()
          })
        })

        describe('core:move-right when the minimap is on the right', () => {
          beforeEach(() => {
            atom.config.set('minimap.displayMinimapOnLeft', true)
            atom.commands.dispatch(quickSettingsElement, 'core:move-right')
          })

          it('toggles the displayMinimapOnLeft setting', () => {
            expect(atom.config.get('minimap.displayMinimapOnLeft')).toBeFalsy()
          })

          it('changes the buttons activation state', () => {
            expect(quickSettingsElement.querySelector('.btn.selected:first-child')).not.toExist()
            expect(quickSettingsElement.querySelector('.btn.selected:last-child')).toExist()
          })
        })


        describe('clicking on the open settings button again', () => {
          beforeEach(() => {
            mousedown(openQuickSettings)
          })

          it('closes the quick settings view', () => {
            expect(workspaceElement.querySelector('minimap-quick-settings')).not.toExist()
          })

          it('removes the view from the element', () => {
            expect(minimapElement.quickSettingsElement).toBeNull()
          })
        })

        describe('when an external event destroys the view', () => {
          beforeEach(() => {
            minimapElement.quickSettingsElement.destroy()
          })

          it('removes the view reference from the element', () => {
            expect(minimapElement.quickSettingsElement).toBeNull()
          })
        })
      })

      describe('then disabling it', () => {
        beforeEach(() => {
          atom.config.set('minimap.displayPluginsControls', false)
        })

        it('removes the div', () => {
          expect(minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')).not.toExist()
        })
      })

      describe('with plugins registered in the package', () => {
        let [minimapPackage, pluginA, pluginB] = []
        beforeEach(() => {
          waitsForPromise(() => {
            return atom.packages.activatePackage('minimap').then(function(pkg) {
              minimapPackage = pkg.mainModule
            })
          })

          runs(() => {
            class Plugin {
              active = false
              activatePlugin() { this.active = true }
              deactivatePlugin() { this.active = false }
              isActive() { return this.active }
            }

            pluginA = new Plugin()
            pluginB = new Plugin()

            minimapPackage.registerPlugin('dummyA', pluginA)
            minimapPackage.registerPlugin('dummyB', pluginB)

            workspaceElement = atom.views.getView(atom.workspace)
            jasmineContent.appendChild(workspaceElement)

            openQuickSettings = minimapElement.shadowRoot.querySelector('.open-minimap-quick-settings')
            mousedown(openQuickSettings)

            quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings')
          })
        })

        it('creates one list item for each registered plugin', () => {
          expect(quickSettingsElement.querySelectorAll('li').length).toEqual(5)
        })

        it('selects the first item of the list', () => {
          expect(quickSettingsElement.querySelector('li.selected:first-child')).toExist()
        })

        describe('core:confirm', () => {
          beforeEach(() => {
            atom.commands.dispatch(quickSettingsElement, 'core:confirm')
          })

          it('disable the plugin of the selected item', () => {
            expect(pluginA.isActive()).toBeFalsy()
          })

          describe('triggered a second time', () => {
            beforeEach(() => {
              atom.commands.dispatch(quickSettingsElement, 'core:confirm')
            })

            it('enable the plugin of the selected item', () => {
              expect(pluginA.isActive()).toBeTruthy()
            })
          })

          describe('on the code highlight item', () => {
            let [initial] = []
            beforeEach(() => {
              initial = minimapElement.displayCodeHighlights
              atom.commands.dispatch(quickSettingsElement, 'core:move-down')
              atom.commands.dispatch(quickSettingsElement, 'core:move-down')
              atom.commands.dispatch(quickSettingsElement, 'core:confirm')
            })

            it('toggles the code highlights on the minimap element', () => {
              expect(minimapElement.displayCodeHighlights).toEqual(!initial)
            })
          })

          describe('on the absolute mode item', () => {
            let [initial] = []
            beforeEach(() => {
              initial = atom.config.get('minimap.absoluteMode')
              atom.commands.dispatch(quickSettingsElement, 'core:move-down')
              atom.commands.dispatch(quickSettingsElement, 'core:move-down')
              atom.commands.dispatch(quickSettingsElement, 'core:move-down')
              atom.commands.dispatch(quickSettingsElement, 'core:confirm')
            })

            it('toggles the code highlights on the minimap element', () => {
              expect(atom.config.get('minimap.absoluteMode')).toEqual(!initial)
            })
          })
        })

        describe('core:move-down', () => {
          beforeEach(() => {
            atom.commands.dispatch(quickSettingsElement, 'core:move-down')
          })

          it('selects the second item', () => {
            expect(quickSettingsElement.querySelector('li.selected:nth-child(2)')).toExist()
          })

          describe('reaching a separator', () => {
            beforeEach(() => {
              atom.commands.dispatch(quickSettingsElement, 'core:move-down')
            })

            it('moves past the separator', () => {
              expect(quickSettingsElement.querySelector('li.code-highlights.selected')).toExist()
            })
          })

          describe('then core:move-up', () => {
            beforeEach(() => {
              atom.commands.dispatch(quickSettingsElement, 'core:move-up')
            })

            it('selects again the first item of the list', () => {
              expect(quickSettingsElement.querySelector('li.selected:first-child')).toExist()
            })
          })
        })

        describe('core:move-up', () => {
          beforeEach(() => {
            atom.commands.dispatch(quickSettingsElement, 'core:move-up')
          })

          it('selects the last item', () => {
            expect(quickSettingsElement.querySelector('li.selected:last-child')).toExist()
          })

          describe('reaching a separator', () => {
            beforeEach(() => {
              atom.commands.dispatch(quickSettingsElement, 'core:move-up')
              atom.commands.dispatch(quickSettingsElement, 'core:move-up')
            })

            it('moves past the separator', () => {
              expect(quickSettingsElement.querySelector('li.selected:nth-child(2)')).toExist()
            })
          })

          describe('then core:move-down', () => {
            beforeEach(() => {
              atom.commands.dispatch(quickSettingsElement, 'core:move-down')
            })

            it('selects again the first item of the list', () => {
              expect(quickSettingsElement.querySelector('li.selected:first-child')).toExist()
            })
          })
        })
      })
    })
  })
})
