'use strict'

const fs = require('fs-plus')
const Main = require('../lib/main')
const Minimap = require('../lib/minimap')
const {styles} = require('./helpers/workspace')
const {mousemove, mousedown, mouseup, mousewheel, touchstart, touchmove} = require('./helpers/events')

const HIDE_ELEMENTS = true

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

function sleep (duration) {
  const t = new Date()
  waitsFor(`${duration}ms`, () => { return new Date() - t > duration })
}

function createPlugin () {
  const plugin = {
    active: false,
    activatePlugin () { this.active = true },
    deactivatePlugin () { this.active = false },
    isActive () { return this.active }
  }
  return plugin
}

describe('MinimapElement', () => {
  let [editor, minimap, largeSample, mediumSample, smallSample, jasmineContent, editorElement, minimapElement, dir] = []

  const resizeEditor = (height, width) => {
    editorElement.setHeight(height)
    if (width) { editorElement.setWidth(width) }
    editorElement.component.measureDimensions()
  }

  beforeEach(() => {
    jasmineContent = HIDE_ELEMENTS
      ? document.body.querySelector('#jasmine-content')
      : document.body

    waitsForPromise(() => atom.packages.activatePackage('minimap'))

    runs(() => {
      atom.config.set('minimap.charHeight', 4)
      atom.config.set('minimap.charWidth', 2)
      atom.config.set('minimap.interline', 1)
      atom.config.set('minimap.textOpacity', 1)
      atom.config.set('minimap.autoToggle', true)
      atom.config.set('minimap.displayMinimapOnLeft', false)
      atom.config.set('minimap.displayCodeHighlights', false)
      atom.config.set('minimap.displayPluginsControls', false)
      atom.config.set('minimap.minimapScrollIndicator', false)
      atom.config.set('minimap.adjustMinimapWidthToSoftWrap', false)
      atom.config.set('minimap.smoothScrolling', true)
      atom.config.set('minimap.adjustMinimapWidthOnlyIfSmaller', true)
      atom.config.set('minimap.plugins', {})

      editor = atom.workspace.buildTextEditor({})
      editor.autoHeight = false

      editorElement = atom.views.getView(editor)
      jasmineContent.insertBefore(editorElement, jasmineContent.firstChild)
      resizeEditor(50)

      minimap = new Minimap({textEditor: editor})
      minimap.adapter.useCache = false
      dir = atom.project.getDirectories()[0]

      largeSample = fs.readFileSync(dir.resolve('large-file.coffee')).toString()
      mediumSample = fs.readFileSync(dir.resolve('two-hundred.txt')).toString()
      smallSample = fs.readFileSync(dir.resolve('sample.coffee')).toString()

      editor.setText(largeSample)

      minimapElement = atom.views.getView(minimap)

      const styleNode = document.createElement('style')
      styleNode.textContent = HIDE_ELEMENTS
        ? styles
        : `
          ${styles}
          atom-text-editor {
            background: white;
            z-index: 100000;
          }
        `
      jasmineContent.appendChild(styleNode)
    })
  })

  it('has been registered in the view registry', () => {
    expect(minimapElement).toExist()
  })

  it('has stored the minimap as its model', () => {
    expect(minimapElement.getModel()).toBe(minimap)
  })

  it('has a canvas in DOM', () => {
    expect(minimapElement.querySelector('canvas')).toExist()
  })

  it('has a div representing the visible area', () => {
    expect(minimapElement.querySelector('.minimap-visible-area')).toExist()
  })

  //       ###    ######## ########    ###     ######  ##     ##
  //      ## ##      ##       ##      ## ##   ##    ## ##     ##
  //     ##   ##     ##       ##     ##   ##  ##       ##     ##
  //    ##     ##    ##       ##    ##     ## ##       #########
  //    #########    ##       ##    ######### ##       ##     ##
  //    ##     ##    ##       ##    ##     ## ##    ## ##     ##
  //    ##     ##    ##       ##    ##     ##  ######  ##     ##

  describe('when attached to the text editor element', () => {
    let [noAnimationFrame, nextAnimationFrame, requestAnimationFrameSafe, canvas, visibleArea] = []

    beforeEach(() => {
      noAnimationFrame = () => {
        throw new Error('No animation frame requested')
      }
      nextAnimationFrame = noAnimationFrame

      requestAnimationFrameSafe = window.requestAnimationFrame
      spyOn(window, 'requestAnimationFrame').andCallFake((fn) => {
        nextAnimationFrame = () => {
          nextAnimationFrame = noAnimationFrame
          fn()
        }
      })
    })

    beforeEach(() => {
      canvas = minimapElement.querySelector('canvas')
      resizeEditor(50, 200)

      editorElement.setScrollTop(1000)
      editorElement.setScrollLeft(200)
      minimapElement.attach()
    })

    afterEach(() => {
      if (HIDE_ELEMENTS) { minimap.destroy() }
      window.requestAnimationFrame = requestAnimationFrameSafe
    })

    it('adds a with-minimap attribute on the text editor element', () => {
      expect(editorElement.hasAttribute('with-minimap')).toBeTruthy()
    })

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

    describe('when detached', () => {
      it('removes the attribute from the editor', () => {
        minimapElement.detach()

        expect(editorElement.hasAttribute('with-minimap')).toBeFalsy()
      })
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
            atom-text-editor .editor, .editor {
              color: red;
              -webkit-filter: hue-rotate(180deg);
            }
          `

          jasmineContent.appendChild(additionnalStyleNode)
        })

        it('computes the new color by applying the hue rotation', () => {
          waitsFor('new animation frame', () => {
            return nextAnimationFrame !== noAnimationFrame
          })
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
            atom-text-editor .editor, .editor {
              color: rgba(255, 0, 0, 0);
              -webkit-filter: hue-rotate(180deg);
            }
          `

          jasmineContent.appendChild(additionnalStyleNode)
        })

        it('computes the new color by applying the hue rotation', () => {
          waitsFor('a new animation frame request', () => {
            return nextAnimationFrame !== noAnimationFrame
          })
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
        waitsFor('a new animation frame request', () => {
          return nextAnimationFrame !== noAnimationFrame
        })
        runs(() => {
          nextAnimationFrame()
          visibleArea = minimapElement.querySelector('.minimap-visible-area')
        })
      })

      it('sets the visible area width and height', () => {
        expect(visibleArea.offsetWidth).toEqual(minimapElement.clientWidth + Math.floor(minimap.getTextEditorScaledScrollLeft()))
        expect(visibleArea.offsetHeight).toBeCloseTo(minimap.getTextEditorScaledHeight(), 0)
      })

      it('sets the visible visible area offset', () => {
        expect(realOffsetTop(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop(), 0)

        expect(Math.floor(parseFloat(visibleArea.style.borderLeftWidth)))
        .toEqual(Math.floor(minimap.getTextEditorScaledScrollLeft()))
      })

      it('offsets the canvas when the scroll does not match line height', () => {
        editorElement.setScrollTop(1004)

        waitsFor('a new animation frame request', () => {
          return nextAnimationFrame !== noAnimationFrame
        })
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

      it('renders the decorations based on the order settings', () => {
        atom.config.set('minimap.displayPluginsControls', true)

        const pluginFoo = createPlugin()
        const pluginBar = createPlugin()

        Main.registerPlugin('foo', pluginFoo)
        Main.registerPlugin('bar', pluginBar)

        atom.config.set('minimap.plugins.fooDecorationsZIndex', 1)

        const calls = []
        spyOn(minimapElement, 'drawLineDecoration').andCallFake((d) => {
          calls.push(d.getProperties().plugin)
        })
        spyOn(minimapElement, 'drawHighlightDecoration').andCallFake((d) => {
          calls.push(d.getProperties().plugin)
        })

        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 10]]), {type: 'line', color: '#0000FF', plugin: 'bar'})
        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 10]]), {type: 'highlight-under', color: '#0000FF', plugin: 'foo'})

        editorElement.setScrollTop(0)

        waitsFor('a new animation frame request', () => {
          return nextAnimationFrame !== noAnimationFrame
        })
        runs(() => {
          nextAnimationFrame()

          expect(calls).toEqual(['bar', 'foo'])

          atom.config.set('minimap.plugins.fooDecorationsZIndex', -1)

          calls.length = 0
        })

        waitsFor('a new animation frame request', () => {
          return nextAnimationFrame !== noAnimationFrame
        })

        runs(() => {
          nextAnimationFrame()

          expect(calls).toEqual(['foo', 'bar'])

          Main.unregisterPlugin('foo')
          Main.unregisterPlugin('bar')
        })
      })

      it('renders the visible line decorations', () => {
        spyOn(minimapElement, 'drawLineDecoration').andCallThrough()

        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 10]]), {type: 'line', color: '#0000FF'})
        minimap.decorateMarker(editor.markBufferRange([[10, 0], [10, 10]]), {type: 'line', color: '#0000FF'})
        minimap.decorateMarker(editor.markBufferRange([[100, 0], [100, 10]]), {type: 'line', color: '#0000FF'})

        editorElement.setScrollTop(0)

        waitsFor('a new animation frame request', () => {
          return nextAnimationFrame !== noAnimationFrame
        })
        runs(() => {
          nextAnimationFrame()

          expect(minimapElement.drawLineDecoration).toHaveBeenCalled()
          expect(minimapElement.drawLineDecoration.calls.length).toEqual(2)
        })
      })

      it('renders the visible gutter decorations', () => {
        spyOn(minimapElement, 'drawGutterDecoration').andCallThrough()

        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 10]]), {type: 'gutter', color: '#0000FF'})
        minimap.decorateMarker(editor.markBufferRange([[10, 0], [10, 10]]), {type: 'gutter', color: '#0000FF'})
        minimap.decorateMarker(editor.markBufferRange([[100, 0], [100, 10]]), {type: 'gutter', color: '#0000FF'})

        editorElement.setScrollTop(0)

        waitsFor('a new animation frame request', () => {
          return nextAnimationFrame !== noAnimationFrame
        })
        runs(() => {
          nextAnimationFrame()

          expect(minimapElement.drawGutterDecoration).toHaveBeenCalled()
          expect(minimapElement.drawGutterDecoration.calls.length).toEqual(2)
        })
      })

      it('renders the visible highlight decorations', () => {
        spyOn(minimapElement, 'drawHighlightDecoration').andCallThrough()

        minimap.decorateMarker(editor.markBufferRange([[1, 0], [1, 4]]), {type: 'highlight-under', color: '#0000FF'})
        minimap.decorateMarker(editor.markBufferRange([[2, 20], [2, 30]]), {type: 'highlight-over', color: '#0000FF'})
        minimap.decorateMarker(editor.markBufferRange([[100, 3], [100, 5]]), {type: 'highlight-under', color: '#0000FF'})

        editorElement.setScrollTop(0)

        waitsFor('a new animation frame request', () => {
          return nextAnimationFrame !== noAnimationFrame
        })
        runs(() => {
          nextAnimationFrame()

          expect(minimapElement.drawHighlightDecoration).toHaveBeenCalled()
          expect(minimapElement.drawHighlightDecoration.calls.length).toEqual(2)
        })
      })

      it('renders the visible outline decorations', () => {
        spyOn(minimapElement, 'drawHighlightOutlineDecoration').andCallThrough()

        minimap.decorateMarker(editor.markBufferRange([[1, 4], [3, 6]]), {type: 'highlight-outline', color: '#0000ff'})
        minimap.decorateMarker(editor.markBufferRange([[6, 0], [6, 7]]), {type: 'highlight-outline', color: '#0000ff'})
        minimap.decorateMarker(editor.markBufferRange([[100, 3], [100, 5]]), {type: 'highlight-outline', color: '#0000ff'})

        editorElement.setScrollTop(0)

        waitsFor('a new animation frame request', () => {
          return nextAnimationFrame !== noAnimationFrame
        })
        runs(() => {
          nextAnimationFrame()

          expect(minimapElement.drawHighlightOutlineDecoration).toHaveBeenCalled()
          expect(minimapElement.drawHighlightOutlineDecoration.calls.length).toEqual(4)
        })
      })

      it('renders the visible custom foreground decorations', () => {
        spyOn(minimapElement, 'drawCustomDecoration').andCallThrough()

        const renderRoutine = jasmine.createSpy('renderRoutine')

        const properties = {
          type: 'foreground-custom',
          render: renderRoutine
        }

        minimap.decorateMarker(editor.markBufferRange([[1, 4], [3, 6]]), properties)
        minimap.decorateMarker(editor.markBufferRange([[6, 0], [6, 7]]), properties)
        minimap.decorateMarker(editor.markBufferRange([[100, 3], [100, 5]]), properties)

        editorElement.setScrollTop(0)

        waitsFor('a new animation frame request', () => {
          return nextAnimationFrame !== noAnimationFrame
        })
        runs(() => {
          nextAnimationFrame()

          expect(minimapElement.drawCustomDecoration).toHaveBeenCalled()
          expect(minimapElement.drawCustomDecoration.calls.length).toEqual(4)

          expect(renderRoutine).toHaveBeenCalled()
          expect(renderRoutine.calls.length).toEqual(4)
        })
      })

      it('renders the visible custom background decorations', () => {
        spyOn(minimapElement, 'drawCustomDecoration').andCallThrough()

        const renderRoutine = jasmine.createSpy('renderRoutine')

        const properties = {
          type: 'background-custom',
          render: renderRoutine
        }

        minimap.decorateMarker(editor.markBufferRange([[1, 4], [3, 6]]), properties)
        minimap.decorateMarker(editor.markBufferRange([[6, 0], [6, 7]]), properties)
        minimap.decorateMarker(editor.markBufferRange([[100, 3], [100, 5]]), properties)

        editorElement.setScrollTop(0)

        waitsFor('a new animation frame request', () => {
          return nextAnimationFrame !== noAnimationFrame
        })
        runs(() => {
          nextAnimationFrame()

          expect(minimapElement.drawCustomDecoration).toHaveBeenCalled()
          expect(minimapElement.drawCustomDecoration.calls.length).toEqual(4)

          expect(renderRoutine).toHaveBeenCalled()
          expect(renderRoutine.calls.length).toEqual(4)
        })
      })

      describe('when the editor is scrolled', () => {
        beforeEach(() => {
          editorElement.setScrollTop(2000)
          editorElement.setScrollLeft(50)

          waitsFor('a new animation frame request', () => {
            return nextAnimationFrame !== noAnimationFrame
          })
          runs(() => { nextAnimationFrame() })
        })

        it('updates the visible area', () => {
          expect(realOffsetTop(visibleArea)).toBeCloseTo(minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop(), 0)

          expect(parseFloat(visibleArea.style.borderLeftWidth))
          .toEqual(Math.round(minimap.getTextEditorScaledScrollLeft()))
        })
      })

      describe('when the editor is resized to a greater size', () => {
        beforeEach(() => {
          editorElement.style.width = '800px'
          editorElement.style.height = '500px'

          minimapElement.measureHeightAndWidth()

          waitsFor('a new animation frame request', () => {
            return nextAnimationFrame !== noAnimationFrame
          })
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

          waitsFor('a new animation frame request', () => {
            return nextAnimationFrame !== noAnimationFrame
          })
          runs(() => {
            nextAnimationFrame()

            spyOn(minimapElement, 'drawLines').andCallThrough()
            editor.insertText('foo')
          })
        })

        it('rerenders the part that have changed', () => {
          waitsFor('a new animation frame request', () => {
            return nextAnimationFrame !== noAnimationFrame
          })
          runs(() => {
            nextAnimationFrame()

            expect(minimapElement.drawLines).toHaveBeenCalled()

            const [firstLine, lastLine] = minimapElement.drawLines.argsForCall[0]

            expect(firstLine).toEqual(100)
            expect(lastLine === 102 || lastLine === 111).toBeTruthy()
          })
        })
      })

      describe('when the editor visibility change', () => {
        it('does not modify the size of the canvas', () => {
          let canvasWidth = minimapElement.getFrontCanvas().width
          let canvasHeight = minimapElement.getFrontCanvas().height
          editorElement.style.display = 'none'

          minimapElement.measureHeightAndWidth()

          waitsFor('a new animation frame request', () => {
            return nextAnimationFrame !== noAnimationFrame
          })
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
        resizeEditor(400, 400)
        editorElement.setScrollTop(0)
        editorElement.setScrollLeft(0)

        nextAnimationFrame()

        minimapElement.measureHeightAndWidth()

        waitsFor('a new animation frame request', () => {
          return nextAnimationFrame !== noAnimationFrame
        })
        runs(() => { nextAnimationFrame() })
      })

      describe('using the mouse scrollwheel over the minimap', () => {
        it('relays the events to the editor view', () => {
          spyOn(editorElement.component.presenter, 'setScrollTop').andCallFake(() => {})

          mousewheel(minimapElement, 0, 15)

          expect(editorElement.component.presenter.setScrollTop).toHaveBeenCalled()
        })

        describe('when the independentMinimapScroll setting is true', () => {
          let previousScrollTop

          beforeEach(() => {
            atom.config.set('minimap.independentMinimapScroll', true)
            atom.config.set('minimap.scrollSensitivity', 0.5)

            spyOn(editorElement.component.presenter, 'setScrollTop').andCallFake(() => {})

            previousScrollTop = minimap.getScrollTop()

            mousewheel(minimapElement, 0, -15)
          })

          it('does not relay the events to the editor', () => {
            expect(editorElement.component.presenter.setScrollTop).not.toHaveBeenCalled()
          })

          it('scrolls the minimap instead', () => {
            expect(minimap.getScrollTop()).not.toEqual(previousScrollTop)
          })

          it('clamp the minimap scroll into the legit bounds', () => {
            mousewheel(minimapElement, 0, -100000)

            expect(minimap.getScrollTop()).toEqual(minimap.getMaxScrollTop())

            mousewheel(minimapElement, 0, 100000)

            expect(minimap.getScrollTop()).toEqual(0)
          })
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

        it('scrolls to the top', () => {
          mousedown(canvas, {x: originalLeft + 1, y: 0, btn: 1})
          expect(editorElement.getScrollTop()).toEqual(0)
        })

        describe('scrolling to the middle using the middle mouse button', () => {
          beforeEach(() => {
            const midY = minimap.getTextEditorHeight() / 2
            mousedown(canvas, {x: originalLeft + 1, y: midY, btn: 1})
          })

          it('scrolls the editor to the middle', () => {
            let middleScrollTop = Math.round((maxScroll) / 2.0)
            expect(editorElement.getScrollTop()).toEqual(middleScrollTop)
          })

          it('updates the visible area to be centered', () => {
            waitsFor('a new animation frame request', () => {
              return nextAnimationFrame !== noAnimationFrame
            })
            runs(() => {
              nextAnimationFrame()
              let {top, height} = visibleArea.getBoundingClientRect()

              let visibleCenterY = top + (height / 2)
              expect(visibleCenterY).toBeCloseTo(200, -1)
            })
          })
        })

        describe('scrolling the editor to an arbitrary location', () => {
          let [scrollTo, scrollRatio] = []

          beforeEach(() => {
            scrollTo = 101 // pixels
            scrollRatio = (scrollTo - minimap.getTextEditorScaledHeight() / 2) / (minimap.getVisibleHeight() - minimap.getTextEditorScaledHeight())
            scrollRatio = Math.max(0, scrollRatio)
            scrollRatio = Math.min(1, scrollRatio)

            mousedown(canvas, {x: originalLeft + 1, y: scrollTo, btn: 1})

            waitsFor('a new animation frame request', () => {
              return nextAnimationFrame !== noAnimationFrame
            })
            runs(() => { nextAnimationFrame() })
          })

          it('scrolls the editor to an arbitrary location', () => {
            let expectedScroll = maxScroll * scrollRatio
            expect(editorElement.getScrollTop()).toBeCloseTo(expectedScroll, 0)
          })

          describe('dragging the visible area with middle mouse button ' +
          'after scrolling to the arbitrary location', () => {
            let [originalTop] = []

            beforeEach(() => {
              originalTop = visibleArea.getBoundingClientRect().top
              mousemove(visibleArea, {x: originalLeft + 1, y: scrollTo + 40, btn: 1})

              waitsFor('a new animation frame request', () => {
                return nextAnimationFrame !== noAnimationFrame
              })
              runs(() => { nextAnimationFrame() })
            })

            afterEach(() => {
              minimapElement.endDrag()
            })

            it('scrolls the editor so that the visible area was moved down ' +
            'by 40 pixels from the arbitrary location', () => {
              let {top} = visibleArea.getBoundingClientRect()
              expect(top).toBeCloseTo(originalTop + 40, -1)
            })
          })
        })
      })

      describe('pressing the mouse on the minimap canvas (without scroll animation)', () => {
        let canvas

        beforeEach(() => {
          let t = 0
          spyOn(minimapElement, 'getTime').andCallFake(() => {
            let n = t
            t += 100
            return n
          })
          spyOn(minimapElement, 'requestUpdate').andCallFake(() => {})

          atom.config.set('minimap.scrollAnimation', false)

          canvas = minimapElement.getFrontCanvas()
        })

        it('scrolls the editor to the line below the mouse', () => {
          mousedown(canvas)
          expect(editorElement.getScrollTop()).toBeCloseTo(480)
        })

        describe('when independentMinimapScroll setting is enabled', () => {
          beforeEach(() => {
            minimap.setScrollTop(1000)
            atom.config.set('minimap.independentMinimapScroll', true)
          })

          it('scrolls the editor to the line below the mouse', () => {
            mousedown(canvas)
            expect(editorElement.getScrollTop()).toBeCloseTo(480)
          })
        })

        describe('when moveCursorOnMinimapClick is true', () => {
          beforeEach(() => {
            atom.config.set('minimap.moveCursorOnMinimapClick', true)
          })

          it('moves the cursor to the corresponding line', () => {
            mousedown(canvas)
            expect(editor.getCursorScreenPosition()).toEqual([40, 0])
          })
        })
      })

      describe('pressing the mouse on the minimap canvas (with scroll animation)', () => {
        let canvas

        beforeEach(() => {
          let t = 0
          spyOn(minimapElement, 'getTime').andCallFake(() => {
            let n = t
            t += 100
            return n
          })
          spyOn(minimapElement, 'requestUpdate').andCallFake(() => {})

          atom.config.set('minimap.scrollAnimation', true)
          atom.config.set('minimap.scrollAnimationDuration', 300)

          canvas = minimapElement.getFrontCanvas()
        })

        it('scrolls the editor gradually to the line below the mouse', () => {
          mousedown(canvas)
          waitsFor('a new animation frame request', () => {
            return nextAnimationFrame !== noAnimationFrame
          })
          // wait until all animations run out
          waitsFor(() => {
            nextAnimationFrame !== noAnimationFrame && nextAnimationFrame()
            return editorElement.getScrollTop() >= 480
          })
        })

        it('stops the animation if the text editor is destroyed', () => {
          mousedown(canvas)
          waitsFor('a new animation frame request', () => {
            return nextAnimationFrame !== noAnimationFrame
          })

          runs(() => {
            editor.destroy()

            nextAnimationFrame !== noAnimationFrame && nextAnimationFrame()

            expect(nextAnimationFrame === noAnimationFrame)
          })
        })

        describe('when independentMinimapScroll setting is enabled', () => {
          beforeEach(() => {
            minimap.setScrollTop(1000)
            atom.config.set('minimap.independentMinimapScroll', true)
          })

          it('scrolls the editor gradually to the line below the mouse', () => {
            mousedown(canvas)
            waitsFor('a new animation frame request', () => {
              return nextAnimationFrame !== noAnimationFrame
            })
            // wait until all animations run out
            waitsFor(() => {
              nextAnimationFrame !== noAnimationFrame && nextAnimationFrame()
              return editorElement.getScrollTop() >= 480
            })
          })

          it('stops the animation if the text editor is destroyed', () => {
            mousedown(canvas)
            waitsFor('a new animation frame request', () => {
              return nextAnimationFrame !== noAnimationFrame
            })

            runs(() => {
              editor.destroy()

              nextAnimationFrame !== noAnimationFrame && nextAnimationFrame()

              expect(nextAnimationFrame === noAnimationFrame)
            })
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

          waitsFor('a new animation frame request', () => {
            return nextAnimationFrame !== noAnimationFrame
          })
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

          waitsFor('a new animation frame request', () => {
            return nextAnimationFrame !== noAnimationFrame
          })
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
            waitsFor('a new animation frame request', () => {
              return nextAnimationFrame !== noAnimationFrame
            })
            runs(() => {
              nextAnimationFrame()

              visibleArea = minimapElement.visibleArea
              let {top, left} = visibleArea.getBoundingClientRect()
              originalTop = top

              mousedown(visibleArea, {x: left + 10, y: top + 10})
              mousemove(visibleArea, {x: left + 10, y: top + 50})
            })

            waitsFor('a new animation frame request', () => {
              return nextAnimationFrame !== noAnimationFrame
            })
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

          waitsFor('a new animation frame request', () => {
            return nextAnimationFrame !== noAnimationFrame
          })
          runs(() => { nextAnimationFrame() })
        })

        describe('dragging the visible area', () => {
          let [originalTop, visibleArea] = []

          beforeEach(() => {
            visibleArea = minimapElement.visibleArea
            let {top, left} = visibleArea.getBoundingClientRect()
            originalTop = top

            mousedown(visibleArea, {x: left + 10, y: top + 10})
            mousemove(visibleArea, {x: left + 10, y: top + 50})

            waitsFor('a new animation frame request', () => {
              return nextAnimationFrame !== noAnimationFrame
            })
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
        expect(minimapElement.querySelector('.minimap-controls')).toBeNull()
      })

      it('removes the visible area', () => {
        expect(minimapElement.visibleArea).toBeUndefined()
      })

      it('removes the quick settings button', () => {
        atom.config.set('minimap.displayPluginsControls', true)

        waitsFor('a new animation frame request', () => {
          return nextAnimationFrame !== noAnimationFrame
        })
        runs(() => {
          nextAnimationFrame()
          expect(minimapElement.openQuickSettings).toBeUndefined()
        })
      })

      it('removes the scroll indicator', () => {
        editor.setText(mediumSample)
        editorElement.setScrollTop(50)

        waitsFor('minimap frame requested', () => {
          return minimapElement.frameRequested
        })
        runs(() => {
          nextAnimationFrame()
          atom.config.set('minimap.minimapScrollIndicator', true)
        })

        waitsFor('minimap frame requested', () => {
          return minimapElement.frameRequested
        })
        runs(() => {
          nextAnimationFrame()
          expect(minimapElement.querySelector('.minimap-scroll-indicator')).toBeNull()
        })
      })

      describe('pressing the mouse on the minimap canvas', () => {
        beforeEach(() => {
          jasmineContent.appendChild(minimapElement)

          let t = 0
          spyOn(minimapElement, 'getTime').andCallFake(() => {
            let n = t
            t += 100
            return n
          })
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
          expect(minimapElement.querySelector('.minimap-controls')).toExist()
          expect(minimapElement.querySelector('.minimap-visible-area')).toExist()
          expect(minimapElement.querySelector('.minimap-scroll-indicator')).toExist()
          expect(minimapElement.querySelector('.open-minimap-quick-settings')).toExist()
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
        waitsFor('a new animation frame request', () => {
          return nextAnimationFrame !== noAnimationFrame
        })
        runs(() => {
          nextAnimationFrame()
          spyOn(minimapElement, 'requestForcedUpdate').andCallThrough()
          spyOn(minimapElement, 'invalidateDOMStylesCache').andCallThrough()

          let styleNode = document.createElement('style')
          styleNode.textContent = 'body{ color: #233 }'
          atom.styles.emitter.emit('did-add-style-element', styleNode)
        })

        waitsFor('minimap frame requested', () => {
          return minimapElement.frameRequested
        })
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

        waitsFor('minimap frame requested', () => {
          return minimapElement.frameRequested
        })
        runs(() => { nextAnimationFrame() })
      })

      it('requests a complete update', () => {
        expect(minimapElement.requestForcedUpdate).toHaveBeenCalled()
      })
    })

    describe('when minimap.displayCodeHighlights is changed', () => {
      beforeEach(() => {
        spyOn(minimapElement, 'requestForcedUpdate').andCallThrough()

        waitsFor('minimap attached', () => minimapElement.attached)

        runs(() => { atom.config.set('minimap.displayCodeHighlights', true) })

        waitsFor('minimap frame requested', () => minimapElement.frameRequested)

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

        waitsFor('minimap frame requested', () => {
          return minimapElement.frameRequested
        })
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

        waitsFor('minimap frame requested', () => {
          return minimapElement.frameRequested
        })
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

        waitsFor('minimap frame requested', () => {
          return minimapElement.frameRequested
        })
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

      it('creates a style node with an offset for atom overlays', () => {
        atom.config.set('minimap.displayMinimapOnLeft', true)

        const node = document.querySelector('style[context="atom-text-editor-minimap"]')
        expect(node).toExist()
      })

      describe('and then toggled off', () => {
        it('removes the overlays style node', () => {
          atom.config.set('minimap.displayMinimapOnLeft', true)
          atom.config.set('minimap.displayMinimapOnLeft', false)

          expect(document.querySelector('style[context="atom-text-editor-minimap"]')).not.toExist()
        })
      })

      describe('when the minimap is not attached yet', () => {
        beforeEach(() => {
          editor = atom.workspace.buildTextEditor({})
          editor.autoHeight = false
          editorElement = atom.views.getView(editor)
          editor.setLineHeightInPixels(10)
          resizeEditor(50)

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
      beforeEach(() => {
        atom.config.set('editor.softWrap', true)
        atom.config.set('editor.softWrapAtPreferredLineLength', true)
        atom.config.set('editor.preferredLineLength', 2)

        atom.config.set('minimap.adjustMinimapWidthToSoftWrap', true)

        waitsFor('minimap frame requested', () => {
          return minimapElement.frameRequested
        })
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

          waitsFor('a new animation frame request', () => {
            return nextAnimationFrame !== noAnimationFrame
          })
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

          waitsFor('a new animation frame request', () => {
            return nextAnimationFrame !== noAnimationFrame
          })
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

          waitsFor('minimap frame requested', () => {
            return minimapElement.frameRequested
          })
          runs(() => {
            nextAnimationFrame()
            atom.config.set('minimap.minimapScrollIndicator', true)
          })

          waitsFor('minimap frame requested', () => {
            return minimapElement.frameRequested
          })
          runs(() => { nextAnimationFrame() })
        })

        it('offsets the scroll indicator by the difference', () => {
          let indicator = minimapElement.querySelector('.minimap-scroll-indicator')
          expect(realOffsetLeft(indicator)).toBeCloseTo(2, -1)
        })
      })

      describe('and when minimap.displayPluginsControls setting is true', () => {
        beforeEach(() => {
          atom.config.set('minimap.displayPluginsControls', true)
        })

        it('offsets the scroll indicator by the difference', () => {
          let openQuickSettings = minimapElement.querySelector('.open-minimap-quick-settings')
          expect(realOffsetLeft(openQuickSettings)).not.toBeCloseTo(2, -1)
        })
      })

      describe('and then disabled', () => {
        beforeEach(() => {
          atom.config.set('minimap.adjustMinimapWidthToSoftWrap', false)

          waitsFor('minimap frame requested', () => {
            return minimapElement.frameRequested
          })
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

          waitsFor('minimap frame requested', () => {
            return minimapElement.frameRequested
          })
          runs(() => { nextAnimationFrame() })
        })

        it('adjusts the width of the minimap', () => {
          expect(minimapElement.offsetWidth).toBeCloseTo(editorElement.offsetWidth / 10, -1)
          expect(minimapElement.style.width).toEqual('')
        })
      })

      describe('when adjustMinimapWidthOnlyIfSmaller is disabled', () => {
        describe('and when preferredLineLength >= 16384', () => {
          beforeEach(() => {
            atom.config.set('minimap.adjustMinimapWidthOnlyIfSmaller', false)
            atom.config.set('editor.preferredLineLength', 16384)

            waitsFor('minimap frame requested', () => {
              return minimapElement.frameRequested
            })
            runs(() => { nextAnimationFrame() })
          })

          it('adjusts the width of the minimap', () => {
            expect(minimapElement.offsetWidth).toBeCloseTo(16384 * 2)
            expect(minimapElement.style.width).toEqual(16384 * 2 + 'px')
          })
        })
      })
    })

    describe('when minimap.minimapScrollIndicator setting is true', () => {
      beforeEach(() => {
        editor.setText(mediumSample)
        editorElement.setScrollTop(50)

        waitsFor('minimap frame requested', () => {
          return minimapElement.frameRequested
        })
        runs(() => { nextAnimationFrame() })

        atom.config.set('minimap.minimapScrollIndicator', true)
      })

      it('adds a scroll indicator in the element', () => {
        expect(minimapElement.querySelector('.minimap-scroll-indicator')).toExist()
      })

      describe('and then deactivated', () => {
        it('removes the scroll indicator from the element', () => {
          atom.config.set('minimap.minimapScrollIndicator', false)
          expect(minimapElement.querySelector('.minimap-scroll-indicator')).not.toExist()
        })
      })

      describe('on update', () => {
        beforeEach(() => {
          editorElement.style.height = '500px'

          atom.views.performDocumentPoll()

          waitsFor('a new animation frame request', () => {
            return nextAnimationFrame !== noAnimationFrame
          })
          runs(() => { nextAnimationFrame() })
        })

        it('adjusts the size and position of the indicator', () => {
          let indicator = minimapElement.querySelector('.minimap-scroll-indicator')

          let height = editorElement.getHeight() * (editorElement.getHeight() / minimap.getHeight())
          let scroll = (editorElement.getHeight() - height) * minimap.getTextEditorScrollRatio()

          expect(indicator.offsetHeight).toBeCloseTo(height, 0)
          expect(realOffsetTop(indicator)).toBeCloseTo(scroll, 0)
        })
      })

      describe('when the minimap cannot scroll', () => {
        beforeEach(() => {
          editor.setText(smallSample)

          waitsFor('minimap frame requested', () => {
            return minimapElement.frameRequested
          })
          runs(() => { nextAnimationFrame() })
        })

        it('removes the scroll indicator', () => {
          expect(minimapElement.querySelector('.minimap-scroll-indicator')).not.toExist()
        })

        describe('and then can scroll again', () => {
          beforeEach(() => {
            editor.setText(largeSample)

            waitsFor('minimap frame requested', () => {
              return minimapElement.frameRequested
            })
            runs(() => { nextAnimationFrame() })
          })

          it('attaches the scroll indicator', () => {
            waitsFor('minimap scroll indicator', () => {
              return minimapElement.querySelector('.minimap-scroll-indicator')
            })
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

      describe('when minimap.adjustAbsoluteModeHeight setting is true', () => {
        beforeEach(() => {
          atom.config.set('minimap.adjustAbsoluteModeHeight', true)
        })
        describe('when the content of the minimap is smaller that the editor height', () => {
          beforeEach(() => {
            editor.setText(smallSample)
            resizeEditor(400)
            minimapElement.measureHeightAndWidth()

            waitsFor('a new animation frame request', () => {
              return nextAnimationFrame !== noAnimationFrame
            })

            runs(() => nextAnimationFrame())
          })
          it('adjusts the canvas height to the minimap height', () => {
            expect(minimapElement.querySelector('canvas').offsetHeight).toEqual(minimap.getHeight())
          })

          describe('when the content is modified', () => {
            beforeEach(() => {
              editor.insertText('foo\n\nbar\n')

              waitsFor('a new animation frame request', () => {
                return nextAnimationFrame !== noAnimationFrame
              })

              runs(() => nextAnimationFrame())
            })

            it('adjusts the canvas height to the new minimap height', () => {
              expect(minimapElement.querySelector('canvas').offsetHeight).toEqual(minimap.getHeight())
            })
          })
        })
      })
    })

    describe('when the smoothScrolling setting is disabled', () => {
      beforeEach(() => {
        atom.config.set('minimap.smoothScrolling', false)
      })
      it('does not offset the canvas when the scroll does not match line height', () => {
        editorElement.setScrollTop(1004)

        waitsFor('a new animation frame request', () => {
          return nextAnimationFrame !== noAnimationFrame
        })
        runs(() => {
          nextAnimationFrame()

          expect(realOffsetTop(canvas)).toEqual(0)
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
        expect(minimapElement.querySelector('.open-minimap-quick-settings')).toExist()
      })

      describe('clicking on the div', () => {
        beforeEach(() => {
          workspaceElement = atom.views.getView(atom.workspace)
          jasmineContent.appendChild(workspaceElement)

          openQuickSettings = minimapElement.querySelector('.open-minimap-quick-settings')
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

            openQuickSettings = minimapElement.querySelector('.open-minimap-quick-settings')
            mousedown(openQuickSettings)

            quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings')
          })

          afterEach(() => {
            minimapElement.quickSettingsElement.destroy()
          })

          it('positions the quick settings view next to the minimap', () => {
            let minimapBounds = minimapElement.getFrontCanvas().getBoundingClientRect()

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

          controls = minimapElement.querySelector('.minimap-controls')
          openQuickSettings = minimapElement.querySelector('.open-minimap-quick-settings')

          editorElement.style.width = '1024px'

          atom.views.performDocumentPoll()
          waitsFor('minimap frame requested', () => {
            return minimapElement.frameRequested
          })
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

              openQuickSettings = minimapElement.querySelector('.open-minimap-quick-settings')
              mousedown(openQuickSettings)

              quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings')
            })

            afterEach(() => {
              minimapElement.quickSettingsElement.destroy()
            })

            it('positions the quick settings view next to the minimap', () => {
              let minimapBounds = minimapElement.getFrontCanvas().getBoundingClientRect()

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

          openQuickSettings = minimapElement.querySelector('.open-minimap-quick-settings')
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
          expect(minimapElement.querySelector('.open-minimap-quick-settings')).not.toExist()
        })
      })

      describe('with plugins registered in the package', () => {
        let [minimapPackage, pluginA, pluginB] = []
        beforeEach(() => {
          waitsForPromise(() => {
            return atom.packages.activatePackage('minimap').then((pkg) => {
              minimapPackage = pkg.mainModule
            })
          })

          runs(() => {
            class Plugin {
              constructor () { this.active = false }
              activatePlugin () { this.active = true }
              deactivatePlugin () { this.active = false }
              isActive () { return this.active }
            }

            pluginA = new Plugin()
            pluginB = new Plugin()

            minimapPackage.registerPlugin('dummyA', pluginA)
            minimapPackage.registerPlugin('dummyB', pluginB)

            workspaceElement = atom.views.getView(atom.workspace)
            jasmineContent.appendChild(workspaceElement)

            openQuickSettings = minimapElement.querySelector('.open-minimap-quick-settings')
            mousedown(openQuickSettings)

            quickSettingsElement = workspaceElement.querySelector('minimap-quick-settings')
          })
        })

        it('creates one list item for each registered plugin', () => {
          expect(quickSettingsElement.querySelectorAll('li').length).toEqual(6)
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

          describe('on the adjust absolute mode height item', () => {
            let [initial] = []
            beforeEach(() => {
              initial = atom.config.get('minimap.adjustAbsoluteModeHeight')
              atom.commands.dispatch(quickSettingsElement, 'core:move-down')
              atom.commands.dispatch(quickSettingsElement, 'core:move-down')
              atom.commands.dispatch(quickSettingsElement, 'core:move-down')
              atom.commands.dispatch(quickSettingsElement, 'core:move-down')
              atom.commands.dispatch(quickSettingsElement, 'core:confirm')
            })

            it('toggles the code highlights on the minimap element', () => {
              expect(atom.config.get('minimap.adjustAbsoluteModeHeight')).toEqual(!initial)
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
