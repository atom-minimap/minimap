"use strict"
process.env.NODE_ENV = "test"

require("./helpers/workspace")

const fs = require("fs-plus")
const { Minimap } = require("../dist/main")
require("jasmine-expect")

describe("Minimap", () => {
  let [
    editor,
    editorElement,
    minimap,
    largeSample,
    smallSample,
    minimapVerticalScaleFactor,
    minimapHorizontalScaleFactor,
  ] = []

  beforeEach(() => {
    atom.config.set("minimap.charHeight", 4)
    atom.config.set("minimap.charWidth", 2)
    atom.config.set("minimap.interline", 1)

    editor = atom.workspace.buildTextEditor({})
    editor.autoHeight = false

    editorElement = atom.views.getView(editor)
    jasmine.attachToDOM(editorElement)
    editorElement.setHeight(50)
    editorElement.setWidth(200)

    minimapVerticalScaleFactor = 5 / editor.getLineHeightInPixels()
    minimapHorizontalScaleFactor = 2 / editor.getDefaultCharWidth()

    const dir = atom.project.getDirectories()[0]

    minimap = new Minimap({ textEditor: editor })
    largeSample = fs.readFileSync(dir.resolve("large-file.coffee")).toString()
    smallSample = fs.readFileSync(dir.resolve("sample.coffee")).toString()

    if (editorElement.component.measurements) {
      waitsFor(() => editorElement.component.measurements.clientContainerHeight)
    }
  })

  it("has an associated editor", () => {
    expect(minimap.getTextEditor()).toEqual(editor)
  })

  it("returns false when asked if destroyed", () => {
    expect(minimap.isDestroyed()).toBeFalsy()
  })

  it("raise an exception if created without a text editor", () => {
    expect(() => {
      return new Minimap()
    }).toThrow()
  })

  it("measures the minimap size based on the current editor content", () => {
    editor.setText(smallSample)
    expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5)

    editor.setText(largeSample)
    expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5)
  })

  it("measures the scaling factor between the editor and the minimap", () => {
    expect(minimap.getVerticalScaleFactor()).toEqual(minimapVerticalScaleFactor)
    expect(minimap.getHorizontalScaleFactor()).toEqual(minimapHorizontalScaleFactor)
  })

  it("measures the editor visible area size at minimap scale", () => {
    editor.setText(largeSample)

    expect(minimap.getTextEditorScaledHeight()).toEqual(50 * minimapVerticalScaleFactor)
  })

  it("measures the available minimap scroll", () => {
    editor.setText(largeSample)
    const largeLineCount = editor.getScreenLineCount()

    expect(minimap.getMaxScrollTop()).toEqual(largeLineCount * 5 - 50)
    expect(minimap.canScroll()).toBeTruthy()
  })

  it("computes the first visible row in the minimap", () => {
    expect(minimap.getFirstVisibleScreenRow()).toEqual(0)
  })

  it("computes the last visible row in the minimap", () => {
    expect(minimap.getLastVisibleScreenRow()).toEqual(10)
  })

  it("relays change events from the text editor", () => {
    const changeSpy = jasmine.createSpy("didChange")
    minimap.onDidChange(changeSpy)

    editor.setText("foo")

    // because of requestAnimation the change is relayed asynchronously.
    setTimeout(() => {
      expect(changeSpy).toHaveBeenCalled()
    }, 1000)
  })

  it("relays scroll top events from the editor", () => {
    editor.setText(largeSample)

    const scrollSpy = jasmine.createSpy("didScroll")
    minimap.onDidChangeScrollTop(scrollSpy)

    editorElement.setScrollTop(100)

    expect(scrollSpy).toHaveBeenCalled()
  })

  it("relays scroll left events from the editor", () => {
    editor.setText(largeSample)

    const scrollSpy = jasmine.createSpy("didScroll")
    minimap.onDidChangeScrollLeft(scrollSpy)

    // Seems like text without a view aren't able to scroll horizontally
    // even when its width was set.
    spyOn(editorElement, "getScrollWidth").andReturn(10000)

    editorElement.setScrollLeft(100)

    expect(scrollSpy).toHaveBeenCalled()
  })

  describe("when scrolls past end is enabled", () => {
    beforeEach(() => {
      editor.setText(largeSample)
      atom.config.set("editor.scrollPastEnd", true)
    })

    it("adjust the scrolling ratio", () => {
      editorElement.setScrollTop(editorElement.getScrollHeight())

      const maxScrollTop = editorElement.getMaxScrollTop()

      expect(minimap.getTextEditorScrollRatio()).toBeCloseTo(editorElement.getScrollTop() / maxScrollTop, 0)
    })

    it("lock the minimap scroll top to 1", () => {
      editorElement.setScrollTop(editorElement.getScrollHeight())
      expect(minimap.getScrollTop()).toBeCloseTo(minimap.getMaxScrollTop(), 0)
    })

    describe("getTextEditorScrollRatio(), when getScrollTop() and maxScrollTop both equal 0", () => {
      beforeEach(() => {
        editor.setText(smallSample)
        editorElement.setHeight(40)
        atom.config.set("editor.scrollPastEnd", true)
      })

      it("returns 0", () => {
        editorElement.setScrollTop(0)
        expect(minimap.getTextEditorScrollRatio()).toEqual(0)
      })
    })
  })

  describe("when soft wrap is enabled", () => {
    beforeEach(() => {
      atom.config.set("editor.softWrap", true)
      atom.config.set("editor.softWrapAtPreferredLineLength", true)
      atom.config.set("editor.preferredLineLength", 2)
    })

    it("measures the minimap using screen lines", () => {
      editor.setText(smallSample)
      expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5)

      editor.setText(largeSample)
      expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5)
    })
  })

  describe("when there is no scrolling needed to display the whole minimap", () => {
    it("returns 0 when computing the minimap scroll", () => {
      expect(minimap.getScrollTop()).toEqual(0)
    })

    it("returns 0 when measuring the available minimap scroll", () => {
      editor.setText(smallSample)

      expect(minimap.getMaxScrollTop()).toEqual(0)
      expect(minimap.canScroll()).toBeFalsy()
    })
  })

  describe("when the editor is scrolled", () => {
    let [largeLineCount, editorScrollRatio] = []

    beforeEach(() => {
      // Same here, without a view, the getScrollWidth method always returns 1
      // and the test fails because the capped scroll left value always end up
      // to be 0, inducing errors in computations.
      spyOn(editorElement, "getScrollWidth").andReturn(10000)

      editor.setText(largeSample)
      editorElement.setScrollTop(1000)
      editorElement.setScrollLeft(200)

      largeLineCount = editor.getScreenLineCount()
      editorScrollRatio = editorElement.getScrollTop() / editorElement.getMaxScrollTop()
    })

    it("scales the editor scroll based on the minimap scale factor", () => {
      expect(minimap.getTextEditorScaledScrollTop()).toEqual(1000 * minimapVerticalScaleFactor)
      expect(minimap.getTextEditorScaledScrollLeft()).toEqual(200 * minimapHorizontalScaleFactor)
    })

    it("computes the offset to apply based on the editor scroll top", () => {
      expect(minimap.getScrollTop()).toBeCloseTo(editorScrollRatio * minimap.getMaxScrollTop(), 0)
    })

    it("computes the first visible row in the minimap", () => {
      expect(minimap.getFirstVisibleScreenRow()).toBeNear(58, 2)
    })

    it("computes the last visible row in the minimap", () => {
      expect(minimap.getLastVisibleScreenRow()).toBeNear(69, 2)
    })

    describe("down to the bottom", () => {
      beforeEach(() => {
        editorElement.setScrollTop(editorElement.getScrollHeight())
        editorScrollRatio = editorElement.getScrollTop() / editorElement.getScrollHeight()
      })

      it("computes an offset that scrolls the minimap to the bottom edge", () => {
        expect(minimap.getScrollTop()).toEqual(minimap.getMaxScrollTop())
      })

      it("computes the first visible row in the minimap", () => {
        expect(minimap.getFirstVisibleScreenRow()).toEqual(largeLineCount - 10)
      })

      it("computes the last visible row in the minimap", () => {
        expect(minimap.getLastVisibleScreenRow()).toEqual(largeLineCount)
      })
    })
  })

  describe("destroying the model", () => {
    it("emits a did-destroy event", () => {
      const spy = jasmine.createSpy("destroy")
      minimap.onDidDestroy(spy)

      minimap.destroy()

      expect(spy).toHaveBeenCalled()
    })

    it("returns true when asked if destroyed", () => {
      minimap.destroy()
      expect(minimap.isDestroyed()).toBeTruthy()
    })
  })

  describe("destroying the text editor", () => {
    it("destroys the model", () => {
      spyOn(minimap, "destroy")

      editor.destroy()

      expect(minimap.destroy).toHaveBeenCalled()
    })
  })

  describe("with scoped settings", () => {
    beforeEach(() => {
      waitsForPromise(() => {
        return atom.packages.activatePackage("language-javascript")
      })

      runs(() => {
        const opts = { scopeSelector: ".source.js" }

        atom.config.set("minimap.charHeight", 8, opts)
        atom.config.set("minimap.charWidth", 4, opts)
        atom.config.set("minimap.interline", 2, opts)

        editor.setGrammar(atom.grammars.grammarForScopeName("source.js"))
      })
    })

    it("honors the scoped settings for the current editor new grammar", () => {
      expect(minimap.getCharHeight()).toEqual(8)
      expect(minimap.getCharWidth()).toEqual(4)
      expect(minimap.getInterline()).toEqual(2)
    })
  })

  describe("when independentMinimapScroll is true", () => {
    let editorScrollRatio
    beforeEach(() => {
      editor.setText(largeSample)
      editorElement.setScrollTop(1000)
      editorScrollRatio = editorElement.getScrollTop() / editorElement.getMaxScrollTop()

      atom.config.set("minimap.independentMinimapScroll", true)
    })

    it("ignores the scroll computed from the editor and return the one of the minimap instead", () => {
      expect(minimap.getScrollTop()).toEqual(editorScrollRatio * minimap.getMaxScrollTop())

      minimap.setScrollTop(200)

      expect(minimap.getScrollTop()).toEqual(200)
    })

    describe("scrolling the editor", () => {
      it("changes the minimap scroll top", () => {
        editorElement.setScrollTop(2000)

        expect(minimap.getScrollTop()).not.toEqual(editorScrollRatio * minimap.getMaxScrollTop())
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

describe("Stand alone minimap", () => {
  let [editor, editorElement, minimap, largeSample, smallSample] = []

  beforeEach(() => {
    atom.config.set("minimap.charHeight", 4)
    atom.config.set("minimap.charWidth", 2)
    atom.config.set("minimap.interline", 1)

    editor = atom.workspace.buildTextEditor({})
    editor.autoHeight = false
    editorElement = atom.views.getView(editor)
    jasmine.attachToDOM(editorElement)
    editorElement.setHeight(50)
    editorElement.setWidth(200)
    editor.setLineHeightInPixels(10)

    const dir = atom.project.getDirectories()[0]

    minimap = new Minimap({
      textEditor: editor,
      standAlone: true,
    })

    largeSample = fs.readFileSync(dir.resolve("large-file.coffee")).toString()
    smallSample = fs.readFileSync(dir.resolve("sample.coffee")).toString()

    if (editorElement.component.measurements) {
      waitsFor(() => editorElement.component.measurements.clientContainerHeight)
    }
  })

  it("has an associated editor", () => {
    expect(minimap.getTextEditor()).toEqual(editor)
  })

  it("measures the minimap size based on the current editor content", () => {
    editor.setText(smallSample)
    expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5)

    editor.setText(largeSample)
    expect(minimap.getHeight()).toEqual(editor.getScreenLineCount() * 5)
  })

  it("measures the scaling factor between the editor and the minimap", () => {
    expect(minimap.getVerticalScaleFactor()).toEqual(0.5)
    expect(minimap.getHorizontalScaleFactor()).toEqual(2 / editor.getDefaultCharWidth())
  })

  it("measures the editor visible area size at minimap scale", () => {
    editor.setText(largeSample)
    expect(minimap.getTextEditorScaledHeight()).toEqual(25)
  })

  it("has a visible height based on the passed-in options", () => {
    expect(minimap.getVisibleHeight()).toEqual(5)

    editor.setText(smallSample)
    expect(minimap.getVisibleHeight()).toEqual(20)

    editor.setText(largeSample)
    expect(minimap.getVisibleHeight()).toEqual(editor.getScreenLineCount() * 5)

    minimap.height = 100
    expect(minimap.getVisibleHeight()).toEqual(100)
  })

  it("has a visible width based on the passed-in options", () => {
    expect(minimap.getVisibleWidth()).toEqual(0)

    editor.setText(smallSample)
    expect(minimap.getVisibleWidth()).toEqual(36)

    editor.setText(largeSample)
    expect(minimap.getVisibleWidth()).toEqual(editor.getMaxScreenLineLength() * 2)

    minimap.width = 50
    expect(minimap.getVisibleWidth()).toEqual(50)
  })

  it("measures the available minimap scroll", () => {
    editor.setText(largeSample)
    const largeLineCount = editor.getScreenLineCount()

    expect(minimap.getMaxScrollTop()).toEqual(0)
    expect(minimap.canScroll()).toBeFalsy()

    minimap.height = 100

    expect(minimap.getMaxScrollTop()).toEqual(largeLineCount * 5 - 100)
    expect(minimap.canScroll()).toBeTruthy()
  })

  it("computes the first visible row in the minimap", () => {
    expect(minimap.getFirstVisibleScreenRow()).toEqual(0)
  })

  it("computes the last visible row in the minimap", () => {
    editor.setText(largeSample)

    expect(minimap.getLastVisibleScreenRow()).toEqual(editor.getScreenLineCount())

    minimap.height = 100
    expect(minimap.getLastVisibleScreenRow()).toEqual(20)
  })

  it("does not relay scroll top events from the editor", () => {
    editor.setText(largeSample)

    const scrollSpy = jasmine.createSpy("didScroll")
    minimap.onDidChangeScrollTop(scrollSpy)

    editorElement.setScrollTop(100)

    expect(scrollSpy).not.toHaveBeenCalled()
  })

  it("does not relay scroll left events from the editor", () => {
    editor.setText(largeSample)

    const scrollSpy = jasmine.createSpy("didScroll")
    minimap.onDidChangeScrollLeft(scrollSpy)

    // Seems like text without a view aren't able to scroll horizontally
    // even when its width was set.
    spyOn(editorElement, "getScrollWidth").andReturn(10000)

    editorElement.setScrollLeft(100)

    expect(scrollSpy).not.toHaveBeenCalled()
  })

  it("has a scroll top that is not bound to the text editor", () => {
    const scrollSpy = jasmine.createSpy("didScroll")
    minimap.onDidChangeScrollTop(scrollSpy)
    minimap.setScreenHeightAndWidth(100, 100)

    editor.setText(largeSample)
    editorElement.setScrollTop(1000)

    expect(minimap.getScrollTop()).toEqual(0)
    expect(scrollSpy).not.toHaveBeenCalled()

    minimap.setScrollTop(10)

    expect(minimap.getScrollTop()).toEqual(10)
    expect(scrollSpy).toHaveBeenCalled()
  })

  it("has rendering properties that can overrides the config values", () => {
    minimap.setCharWidth(8.5)
    minimap.setCharHeight(10.2)
    minimap.setInterline(10.6)

    expect(minimap.getCharWidth()).toEqual(8)
    expect(minimap.getCharHeight()).toEqual(10)
    expect(minimap.getInterline()).toEqual(10)
    expect(minimap.getLineHeight()).toEqual(20)
  })

  it("emits a config change event when a value is changed", () => {
    const changeSpy = jasmine.createSpy("did-change")
    minimap.onDidChangeConfig(changeSpy)

    minimap.setCharWidth(8.5)
    minimap.setCharHeight(10.2)
    minimap.setInterline(10.6)

    expect(changeSpy.callCount).toEqual(3)
  })

  describe("returns the rounding number of devicePixelRatio", () => {
    it("1.25", () => {
      window.devicePixelRatio = 1.25
      minimap.setDevicePixelRatioRounding(true)

      expect(minimap.getDevicePixelRatioRounding()).toEqual(true)
      expect(minimap.getDevicePixelRatio()).toEqual(1)
    })
    it("0.811", () => {
      window.devicePixelRatio = 0.811
      minimap.setDevicePixelRatioRounding(true)

      expect(minimap.getDevicePixelRatioRounding()).toEqual(true)
      expect(minimap.getDevicePixelRatio()).toEqual(0.8)
    })
    it("0.05", () => {
      window.devicePixelRatio = 0.051
      minimap.setDevicePixelRatioRounding(true)

      expect(minimap.getDevicePixelRatioRounding()).toEqual(true)
      expect(minimap.getDevicePixelRatio()).toEqual(0.1)
    })
  })

  it("prevents the rounding number of devicePixelRatio", () => {
    window.devicePixelRatio = 1.25

    minimap.setDevicePixelRatioRounding(false)

    expect(minimap.getDevicePixelRatioRounding()).toEqual(false)
    expect(minimap.getDevicePixelRatio()).toEqual(1.25)
  })
})
