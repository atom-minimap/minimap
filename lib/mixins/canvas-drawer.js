"use strict"

import { escapeRegExp } from "../deps/underscore-plus"
import Mixin from "mixto"

import * as Main from "../main"
import { styleReader } from "../main"
import CanvasLayer from "../canvas-layer"

const SPEC_MODE = atom.inSpecMode()
// an instance of MinimapElement used for testing and calling spies
let thisSpec

/**
 * The `CanvasDrawer` mixin is responsible for the rendering of a `Minimap` in a `canvas` element.
 *
 * This mixin is injected in the `MinimapElement` prototype, so all these methods are available on any `MinimapElement` instance.
 */
export default class CanvasDrawer extends Mixin {
  /** Initializes the canvas elements needed to perform the `Minimap` rendering. */
  initializeCanvas() {
    if (SPEC_MODE) {
      // class methods only used for spying the calls
      this.drawLines = (firstLine, lastLine) => {
        console.log({ firstLine, lastLine })
      }
      this.drawLineDecoration = drawLineDecoration
      this.drawGutterDecoration = drawGutterDecoration
      this.drawHighlightDecoration = drawHighlightDecoration
      this.drawHighlightOutlineDecoration = drawHighlightOutlineDecoration
      this.drawCustomDecoration = drawCustomDecoration
      this.StyleReader = styleReader
      thisSpec = this
    }

    /**
     * The main canvas layer where lines are rendered.
     *
     * @type {CanvasLayer}
     */
    this.tokensLayer = new CanvasLayer()
    /**
     * The canvas layer for decorations below the text.
     *
     * @type {CanvasLayer}
     */
    this.backLayer = new CanvasLayer()
    /**
     * The canvas layer for decorations above the text.
     *
     * @type {CanvasLayer}
     */
    this.frontLayer = new CanvasLayer()

    if (!this.pendingChanges) {
      /**
       * Stores the changes from the text editor.
       *
       * @type {Object[]}
       * @access private
       */
      this.pendingChanges = []
    }

    if (!this.pendingBackDecorationChanges) {
      /**
       * Stores the changes from the minimap back decorations.
       *
       * @type {Object[]}
       * @access private
       */
      this.pendingBackDecorationChanges = []
    }

    if (!this.pendingFrontDecorationChanges) {
      /**
       * Stores the changes from the minimap front decorations.
       *
       * @type {Object[]}
       * @access private
       */
      this.pendingFrontDecorationChanges = []
    }

    // the maximum number of tokens to render in one line
    this.maxTokensInOneLine = atom.config.get("minimap.maxTokensInOneLine")
  }

  /**
   * Returns the uppermost canvas in the MinimapElement.
   *
   * @returns {HTMLCanvasElement} The html canvas element
   */
  getFrontCanvas() {
    return this.frontLayer.canvas
  }

  /**
   * Attaches the canvases into the specified container.
   *
   * @param {HTMLElement} parent The canvases' container
   * @access private
   */
  attachCanvases(parent) {
    this.backLayer.attach(parent)
    this.tokensLayer.attach(parent)
    this.frontLayer.attach(parent)
  }

  /**
   * Changes the size of all the canvas layers at once.
   *
   * @param {number} width The new width for the three canvases
   * @param {number} height The new height for the three canvases
   * @access private
   */
  setCanvasesSize(width, height) {
    this.backLayer.setSize(width, height)
    this.tokensLayer.setSize(width, height)
    this.frontLayer.setSize(width, height)
  }

  /** Performs an update of the rendered `Minimap` based on the changes registered in the instance. */
  updateCanvas() {
    const firstRow = this.minimap.getFirstVisibleScreenRow()
    const lastRow = this.minimap.getLastVisibleScreenRow()

    const devicePixelRatio = this.minimap.getDevicePixelRatio()
    const lineHeight = this.minimap.getLineHeight() * devicePixelRatio
    const charHeight = this.minimap.getCharHeight() * devicePixelRatio
    const charWidth = this.minimap.getCharWidth() * devicePixelRatio
    const { width: canvasWidth, height: canvasHeight } = this.tokensLayer.getSize()
    const editor = this.minimap.getTextEditor()
    const editorElement = this.minimap.getTextEditorElement()

    // TODO avoid closure: https://stackoverflow.com/a/46256398/7910299
    const getTokenColorClosure = this.displayCodeHighlights
      ? (scopes) => getTokenColor(scopes, editorElement, this.textOpacity)
      : () => getDefaultColor(editorElement, this.textOpacity)

    updateTokensLayer(
      this.tokensLayer,
      firstRow,
      lastRow,
      this.offscreenFirstRow,
      this.offscreenLastRow,
      this.pendingChanges,
      lineHeight,
      charHeight,
      charWidth,
      canvasWidth,
      editor,
      editor.getScreenLineCount(),
      getInvisibleRegExp(editor),
      getTokenColorClosure,
      this.ignoreWhitespacesInTokens,
      this.maxTokensInOneLine
    )

    if (SPEC_MODE) {
      // call the spy for drawLines which is used inside updateTokensLayer
      this.drawLines(firstRow, lastRow)
    }

    const decorations = this.DecorationManagement.decorationsByTypeThenRows(firstRow, lastRow)

    const renderData = {
      context: this.backLayer.context,
      canvasWidth,
      canvasHeight,
      lineHeight,
      charWidth,
      charHeight,
      orders: Main.getPluginsOrder(),
    }

    const drawCustomDecorationLambda = (decoration, data, decorationColor) =>
      drawCustomDecoration(decoration, data, decorationColor, editorElement)
    backgroundDecorationDispatcher["background-custom"] = drawCustomDecorationLambda
    frontDecorationDispatcher["foreground-custom"] = drawCustomDecorationLambda

    updateBackDecorationsLayer(
      this.backLayer,
      firstRow,
      lastRow,
      this.offscreenFirstRow,
      this.offscreenLastRow,
      this.pendingBackDecorationChanges,
      renderData,
      lineHeight,
      editorElement,
      decorations
    )

    renderData.context = this.frontLayer.context

    updateFrontDecorationsLayer(
      this.frontLayer,
      firstRow,
      lastRow,
      this.offscreenFirstRow,
      this.offscreenLastRow,
      this.pendingFrontDecorationChanges,
      renderData,
      lineHeight,
      editorElement,
      decorations
    )

    this.pendingChanges = []
    this.pendingBackDecorationChanges = []
    this.pendingFrontDecorationChanges = []

    /**
     * The first row in the last render of the offscreen canvas.
     *
     * @type {number}
     * @access private
     */
    this.offscreenFirstRow = firstRow
    /**
     * The last row in the last render of the offscreen canvas.
     *
     * @type {number}
     * @access private
     */
    this.offscreenLastRow = lastRow
  }

  //    ########  ########     ###    ##      ##
  //    ##     ## ##     ##   ## ##   ##  ##  ##
  //    ##     ## ##     ##  ##   ##  ##  ##  ##
  //    ##     ## ########  ##     ## ##  ##  ##
  //    ##     ## ##   ##   ######### ##  ##  ##
  //    ##     ## ##    ##  ##     ## ##  ##  ##
  //    ########  ##     ## ##     ##  ###  ###

  /**
   * Routine used to render changes in specific ranges for one layer.
   *
   * @param {CanvasLayer} layer The layer to redraw
   * @param {Object[]} intactRanges An array of the ranges to leave intact
   * @param {number} firstRow FirstRow the first row of the range to update
   * @param {number} lastRow LastRow the last row of the range to update
   * @param {Function} method The render method to use for the lines drawing
   * @access private Unused (inlined the code for performance reasons)
   */
  // redrawRangesOnLayer (layer, intactRanges, firstRow, lastRow, method) {
  //   const devicePixelRatio = this.minimap.getDevicePixelRatio()
  //   const lineHeight = this.minimap.getLineHeight() * devicePixelRatio
  //
  //   layer.clearCanvas()
  //
  //   if (intactRanges.length === 0) {
  //     method.call(this, firstRow, lastRow, 0)
  //   } else {
  //     for (let j = 0, len = intactRanges.length; j < len; j++) {
  //       const intact = intactRanges[j]
  //
  //       layer.copyPartFromOffscreen(
  //         intact.offscreenRow * lineHeight,
  //         (intact.start - firstRow) * lineHeight,
  //         (intact.end - intact.start) * lineHeight
  //       )
  //     }
  //     drawLinesForRanges(method, intactRanges, firstRow, lastRow)
  //   }
  //
  //   layer.resetOffscreenSize()
  //   layer.copyToOffscreen()
  // }

  /**
   * Renders the lines between the intact ranges when an update has pending changes.
   *
   * @param {Function} method The render method to use for the lines drawing
   * @param {Object[]} intactRanges The intact ranges in the minimap
   * @param {number} firstRow The first row of the rendered region
   * @param {number} lastRow The last row of the rendered region
   * @access private Unused (inlined the code for performance reasons)
   */
  // drawLinesForRanges (method, ranges, firstRow, lastRow) {
  //   let currentRow = firstRow
  //   for (let i = 0, len = ranges.length; i < len; i++) {
  //     const range = ranges[i]
  //
  //     method.call(this, currentRow, range.start, currentRow - firstRow)
  //
  //     currentRow = range.end
  //   }
  //   if (currentRow <= lastRow) {
  //     method.call(this, currentRow, lastRow, currentRow - firstRow)
  //   }
  // }
}

//    ########  ########     ###    ##      ##
//    ##     ## ##     ##   ## ##   ##  ##  ##
//    ##     ## ##     ##  ##   ##  ##  ##  ##
//    ##     ## ########  ##     ## ##  ##  ##
//    ##     ## ##   ##   ######### ##  ##  ##
//    ##     ## ##    ##  ##     ## ##  ##  ##
//    ########  ##     ## ##     ##  ###  ###

/**
 * Performs an update of the tokens layer using the pending changes array.
 *
 * @param {CanvasLayer} tokensLayer
 * @param {number} firstRow FirstRow the first row of the range to update
 * @param {number} lastRow LastRow the last row of the range to update
 * @param {number} offscreenFirstRow
 * @param {number} offscreenLastRow
 * @param {Array<>} pendingChanges
 * @param {number} lineHeight This.minimap.getLineHeight() * devicePixelRatio
 * @param {number} charHeight This.minimap.getCharHeight() * devicePixelRatio
 * @param {number} charWidth This.minimap.getCharWidth() * devicePixelRatio
 * @param {number} canvasWidth This.tokensLayer.getSize().width
 * @param {TextEditor} editor This.minimap.getTextEditor()
 * @param {(t: Token) => string} getTokenColorClosure
 * @param {boolean} ignoreWhitespacesInTokens This.ignoreWhitespacesInTokens
 * @param {number} maxTokensInOneLine This.maxTokensInOneLine
 * @access private
 */
function updateTokensLayer(
  tokensLayer,
  firstRow,
  lastRow,
  offscreenFirstRow,
  offscreenLastRow,
  pendingChanges,
  lineHeight,
  charHeight,
  charWidth,
  canvasWidth,
  editor,
  editorScreenLineCount,
  invisibleRegExp,
  getTokenColorClosure,
  ignoreWhitespacesInTokens,
  maxTokensInOneLine
) {
  // NOTE: this method is the hot function of Minimap. Do not refactor. The code is inlined delibarately.

  const intactRanges = computeIntactRanges(firstRow, lastRow, pendingChanges, offscreenFirstRow, offscreenLastRow)

  // redrawRangesOnLayer
  const context = tokensLayer.context

  tokensLayer.clearCanvas()

  if (intactRanges.length === 0) {
    drawLines(
      firstRow,
      lastRow,
      0,
      lineHeight,
      charHeight,
      charWidth,
      canvasWidth,
      context,
      editor,
      editorScreenLineCount,
      invisibleRegExp,
      getTokenColorClosure,
      ignoreWhitespacesInTokens,
      maxTokensInOneLine
    )
  } else {
    for (let j = 0, len = intactRanges.length; j < len; j++) {
      const intact = intactRanges[j]

      tokensLayer.copyPartFromOffscreen(
        intact.offscreenRow * lineHeight,
        (intact.start - firstRow) * lineHeight,
        (intact.end - intact.start) * lineHeight
      )
    }
    // drawLinesForRanges
    let currentRow = firstRow
    for (let i = 0, len = intactRanges.length; i < len; i++) {
      const range = intactRanges[i]

      drawLines(
        currentRow,
        range.start,
        currentRow - firstRow,
        lineHeight,
        charHeight,
        charWidth,
        canvasWidth,
        context,
        editor,
        editorScreenLineCount,
        invisibleRegExp,
        getTokenColorClosure,
        ignoreWhitespacesInTokens,
        maxTokensInOneLine
      )

      currentRow = range.end
    }
    if (currentRow <= lastRow) {
      drawLines(
        currentRow,
        lastRow,
        currentRow - firstRow,
        lineHeight,
        charHeight,
        charWidth,
        canvasWidth,
        context,
        editor,
        editorScreenLineCount,
        invisibleRegExp,
        getTokenColorClosure,
        ignoreWhitespacesInTokens,
        maxTokensInOneLine
      )
    }
  }

  tokensLayer.resetOffscreenSize()
  tokensLayer.copyToOffscreen()
}

/**
 * Performs an update of the back decorations layer using the pending back decorations changes arrays.
 *
 * @param {CanvasLayer} backLayer
 * @param {number} firstRow FirstRow the first row of the range to update
 * @param {number} lastRow LastRow the last row of the range to update
 * @param {number} offscreenFirstRow
 * @param {number} offscreenLastRow
 * @param {Array<>} pendingBackDecorationChanges
 * @param {Object} renderData
 * @param {number} lineHeight This.minimap.getLineHeight() * devicePixelRatio
 * @param {TextEditorElement} editorElement This.minimap.getTextEditorElement()
 * @param {Decoration[]} decorations
 * @access private
 */
function updateBackDecorationsLayer(
  backLayer,
  firstRow,
  lastRow,
  offscreenFirstRow,
  offscreenLastRow,
  pendingBackDecorationChanges,
  renderData,
  lineHeight,
  editorElement,
  decorations
) {
  const intactRanges = computeIntactRanges(
    firstRow,
    lastRow,
    pendingBackDecorationChanges,
    offscreenFirstRow,
    offscreenLastRow
  )

  // NOTE: this method is the hot function of Minimap. Do not refactor. The code is inlined delibarately.

  // redrawRangesOnLayer

  backLayer.clearCanvas()

  if (intactRanges.length === 0) {
    drawBackDecorationsForLines(firstRow, lastRow, 0, renderData, lineHeight, editorElement, decorations)
  } else {
    for (let j = 0, len = intactRanges.length; j < len; j++) {
      const intact = intactRanges[j]

      backLayer.copyPartFromOffscreen(
        intact.offscreenRow * lineHeight,
        (intact.start - firstRow) * lineHeight,
        (intact.end - intact.start) * lineHeight
      )
    }
    // drawLinesForRanges
    let currentRow = firstRow
    for (let i = 0, len = intactRanges.length; i < len; i++) {
      const range = intactRanges[i]

      drawBackDecorationsForLines(
        currentRow,
        range.start,
        currentRow - firstRow,
        renderData,
        lineHeight,
        editorElement,
        decorations
      )

      currentRow = range.end
    }
    if (currentRow <= lastRow) {
      drawBackDecorationsForLines(
        currentRow,
        lastRow,
        currentRow - firstRow,
        renderData,
        lineHeight,
        editorElement,
        decorations
      )
    }
  }

  backLayer.resetOffscreenSize()
  backLayer.copyToOffscreen()
}

/**
 * Performs an update of the front decorations layer using the pending front decorations changes arrays.
 *
 * @param {CanvasLayer} frontLayer
 * @param {number} firstRow FirstRow the first row of the range to update
 * @param {number} lastRow LastRow the last row of the range to update
 * @param {number} offscreenFirstRow
 * @param {number} offscreenLastRow
 * @param {Array<>} pendingFrontDecorationChanges
 * @param {Object} renderData
 * @param {number} lineHeight This.minimap.getLineHeight() * devicePixelRatio
 * @param {TextEditorElement} editorElement This.minimap.getTextEditorElement()
 * @param {Decoration[]} decorations
 * @access private
 */
function updateFrontDecorationsLayer(
  frontLayer,
  firstRow,
  lastRow,
  offscreenFirstRow,
  offscreenLastRow,
  pendingFrontDecorationChanges,
  renderData,
  lineHeight,
  editorElement,
  decorations
) {
  const intactRanges = computeIntactRanges(
    firstRow,
    lastRow,
    pendingFrontDecorationChanges,
    offscreenFirstRow,
    offscreenLastRow
  )

  // NOTE: this method is the hot function of Minimap. Do not refactor. The code is inlined delibarately.

  // redrawRangesOnLayer

  frontLayer.clearCanvas()

  if (intactRanges.length === 0) {
    drawFrontDecorationsForLines(firstRow, lastRow, 0, renderData, lineHeight, editorElement, decorations)
  } else {
    for (let j = 0, len = intactRanges.length; j < len; j++) {
      const intact = intactRanges[j]

      frontLayer.copyPartFromOffscreen(
        intact.offscreenRow * lineHeight,
        (intact.start - firstRow) * lineHeight,
        (intact.end - intact.start) * lineHeight
      )
    }
    // drawLinesForRanges
    let currentRow = firstRow
    for (let i = 0, len = intactRanges.length; i < len; i++) {
      const range = intactRanges[i]

      drawFrontDecorationsForLines(
        currentRow,
        range.start,
        currentRow - firstRow,
        renderData,
        lineHeight,
        editorElement,
        decorations
      )

      currentRow = range.end
    }
    if (currentRow <= lastRow) {
      drawFrontDecorationsForLines(
        currentRow,
        lastRow,
        currentRow - firstRow,
        renderData,
        lineHeight,
        editorElement,
        decorations
      )
    }
  }

  frontLayer.resetOffscreenSize()
  frontLayer.copyToOffscreen()
}

const whitespaceTokenRegex = /^\s+$/
const oneOrMoreWhiteSpaceRegexp = /\s+/

/**
 * Draws a single token on the given context.
 *
 * @param {CanvasRenderingContext2D} context The target canvas context
 * @param {string} text The token's text content
 * @param {string} color The token's CSS color
 * @param {number} x The x position of the token in the line
 * @param {number} y The y position of the line in the minimap
 * @param {number} charWidth The width of a character in the minimap
 * @param {number} charHeight The height of a character in the minimap
 * @returns {number} The x position at the end of the token
 * @access private
 */
function drawToken(context, text, color, x, y, charWidth, charHeight, ignoreWhitespacesInTokens) {
  context.fillStyle = color

  if (ignoreWhitespacesInTokens) {
    const length = text.length * charWidth
    context.fillRect(x, y, length, charHeight)

    return x + length
  } else {
    let chars = 0
    for (let j = 0, len = text.length; j < len; j++) {
      const char = text[j]
      if (char === " ") {
        if (chars > 0) {
          context.fillRect(x - chars * charWidth, y, chars * charWidth, charHeight)
        }
        chars = 0
      } else {
        chars++
      }
      x += charWidth
    }
    if (chars > 0) {
      context.fillRect(x - chars * charWidth, y, chars * charWidth, charHeight)
    }
    return x
  }
}

/**
 * Draws lines on the corresponding layer.
 *
 * The lines range to draw is specified by the `firstRow` and `lastRow` parameters.
 *
 * @param {number} firstRow The first row to render
 * @param {number} lastRow The last row to render
 * @param {number} offsetRow The relative offset to apply to rows when rendering them
 * @param {number} lineHeight This.minimap.getLineHeight() * devicePixelRatio
 * @param {number} charHeight This.minimap.getCharHeight() * devicePixelRatio
 * @param {number} charWidth This.minimap.getCharWidth() * devicePixelRatio
 * @param {number} canvasWidth This.tokensLayer.getSize().width
 * @param {CanvasRenderingContext2D} context This.tokensLayer.context
 * @param {TextEditor} editor This.minimap.getTextEditor()
 * @param {number} editorScreenLineCount
 * @param {RegExp} invisibleRegExp
 * @param {(t: Token) => string} getTokenColorClosure
 * @param {boolean} ignoreWhitespacesInTokens This.ignoreWhitespacesInTokens
 * @param {number} maxTokensInOneLine This.maxTokensInOneLine
 * @access private
 */
function drawLines(
  firstRow,
  lastRow,
  offsetRow,
  lineHeight,
  charHeight,
  charWidth,
  canvasWidth,
  context,
  editor,
  editorScreenLineCount,
  invisibleRegExp,
  getTokenColorClosure,
  ignoreWhitespacesInTokens,
  maxTokensInOneLine
) {
  // NOTE: this method is the hot function of Minimap. Do not refactor. The code is inlined delibarately.

  if (firstRow > lastRow) {
    return
  }

  let lastLine, x
  let y = offsetRow * lineHeight - lineHeight

  // eachTokenForScreenRows
  lastRow = Math.min(lastRow, editorScreenLineCount)

  for (let line = firstRow; line < lastRow; line++) {
    const editorTokensForScreenRow = editor.tokensForScreenRow(line)
    const numToken = editorTokensForScreenRow.length
    const numTokenToRender = Math.min(numToken, maxTokensInOneLine)
    for (let iToken = 0; iToken < numTokenToRender; iToken++) {
      const token = editorTokensForScreenRow[iToken]
      const tokenText = token.text.replace(invisibleRegExp, " ")
      const tokenScopes = token.scopes

      if (lastLine !== line) {
        x = 0
        y += lineHeight
        lastLine = line
        context.clearRect(x, y, canvasWidth, lineHeight)
      }
      if (x > canvasWidth) {
        continue
      }

      if (whitespaceTokenRegex.test(tokenText)) {
        x += tokenText.length * charWidth
      } else {
        x = drawToken(
          context,
          tokenText,
          getTokenColorClosure(tokenScopes),
          x,
          y,
          charWidth,
          charHeight,
          ignoreWhitespacesInTokens
        )
      }
    }
  }

  context.fill()
}

/**
 * Returns the regexp to replace invisibles substitution characters in editor lines.
 *
 * @param {TextEditor} editor
 * @returns {RegExp} The regular expression to match invisible characters
 * @access private
 */
function getInvisibleRegExp(editor) {
  const invisibles = editor.getInvisibles()
  const regexp = []
  if (invisibles.cr != null) {
    regexp.push(invisibles.cr)
  }
  if (invisibles.eol != null) {
    regexp.push(invisibles.eol)
  }
  if (invisibles.space != null) {
    regexp.push(invisibles.space)
  }
  if (invisibles.tab != null) {
    regexp.push(invisibles.tab)
  }

  if (regexp.length !== 0) {
    return RegExp(
      regexp
        .filter((s) => {
          return typeof s === "string"
        })
        .map(escapeRegExp)
        .join("|"),
      "g"
    )
  } else {
    return null
  }
}

/**
 * Dispatchers for decoration drawing (custom decoration drawer added dynamically)
 *
 * @param {Object} backgroundDecorationDispatcher An object with the type to render as key and the render method as value
 */
const backgroundDecorationDispatcher = {
  line: drawLineDecoration,
  "highlight-under": drawHighlightDecoration,
}

/**
 * Dispatchers for decoration drawing (custom decoration drawer added dynamically)
 *
 * @param {Object} frontDecorationDispatcher An object with the type to render as key and the render method as value
 */
const frontDecorationDispatcher = {
  gutter: drawGutterDecoration,
  "highlight-over": drawHighlightDecoration,
  "highlight-outline": drawHighlightOutlineDecoration,
}

/**
 * Draws a line decoration.
 *
 * @param {Decoration} decoration The decoration to render
 * @param {Object} data The data need to perform the render
 * @param {string} decorationColor Decoration color
 * @access private
 */
function drawLineDecoration(decoration, data, decorationColor) {
  const { context, lineHeight, canvasWidth, yRow } = data

  context.fillStyle = decorationColor
  context.fillRect(0, yRow, canvasWidth, lineHeight)
}

/**
 * Draws a gutter decoration.
 *
 * @param {Decoration} decoration The decoration to render
 * @param {Object} data The data need to perform the render
 * @param {string} decorationColor Decoration color
 * @access private
 */
function drawGutterDecoration(decoration, data, decorationColor) {
  const { context, lineHeight, yRow } = data

  context.fillStyle = decorationColor
  context.fillRect(0, yRow, 1, lineHeight)
}

/**
 * Draws a highlight decoration.
 *
 * It renders only the part of the highlight corresponding to the specified row.
 *
 * @param {Decoration} decoration The decoration to render
 * @param {Object} data The data need to perform the render
 * @param {string} decorationColor Decoration color
 * @access private
 */
function drawHighlightDecoration(decoration, data, decorationColor) {
  const { context, lineHeight, charWidth, canvasWidth, screenRow, yRow } = data

  const range = decoration.getMarker().getScreenRange()
  const rowSpan = range.end.row - range.start.row

  context.fillStyle = decorationColor

  if (rowSpan === 0) {
    const colSpan = range.end.column - range.start.column
    context.fillRect(range.start.column * charWidth, yRow, colSpan * charWidth, lineHeight)
  } else if (screenRow === range.start.row) {
    const x = range.start.column * charWidth
    context.fillRect(x, yRow, canvasWidth - x, lineHeight)
  } else if (screenRow === range.end.row) {
    context.fillRect(0, yRow, range.end.column * charWidth, lineHeight)
  } else {
    context.fillRect(0, yRow, canvasWidth, lineHeight)
  }
}

/**
 * Draws a highlight outline decoration.
 *
 * It renders only the part of the highlight corresponding to the specified row.
 *
 * @param {Decoration} decoration The decoration to render
 * @param {Object} data The data need to perform the render
 * @param {string} decorationColor Decoration color
 * @access private
 */
function drawHighlightOutlineDecoration(decoration, data, decorationColor) {
  const { context, lineHeight, charWidth, canvasWidth, screenRow, yRow } = data

  let bottomWidth, colSpan, width, xBottomStart, xEnd, xStart
  const range = decoration.getMarker().getScreenRange()
  const rowSpan = range.end.row - range.start.row
  const yStart = yRow
  const yEnd = yStart + lineHeight

  context.fillStyle = decorationColor

  if (rowSpan === 0) {
    colSpan = range.end.column - range.start.column
    width = colSpan * charWidth
    xStart = range.start.column * charWidth
    xEnd = xStart + width

    context.fillRect(xStart, yStart, width, 1)
    context.fillRect(xStart, yEnd - 1, width, 1)
    context.fillRect(xStart, yStart, 1, lineHeight)
    context.fillRect(xEnd, yStart, 1, lineHeight)
  } else if (rowSpan === 1) {
    xStart = range.start.column * charWidth
    xEnd = range.end.column * charWidth

    if (screenRow === range.start.row) {
      width = canvasWidth - xStart
      xBottomStart = Math.max(xStart, xEnd)
      bottomWidth = canvasWidth - xBottomStart

      context.fillRect(xStart, yStart, width, 1)
      context.fillRect(xBottomStart, yEnd - 1, bottomWidth, 1)
      context.fillRect(xStart, yStart, 1, lineHeight)
      context.fillRect(canvasWidth - 1, yStart, 1, lineHeight)
    } else {
      width = canvasWidth - xStart
      bottomWidth = canvasWidth - xEnd

      context.fillRect(0, yStart, xStart, 1)
      context.fillRect(0, yEnd - 1, xEnd, 1)
      context.fillRect(0, yStart, 1, lineHeight)
      context.fillRect(xEnd, yStart, 1, lineHeight)
    }
  } else {
    xStart = range.start.column * charWidth
    xEnd = range.end.column * charWidth
    if (screenRow === range.start.row) {
      width = canvasWidth - xStart

      context.fillRect(xStart, yStart, width, 1)
      context.fillRect(xStart, yStart, 1, lineHeight)
      context.fillRect(canvasWidth - 1, yStart, 1, lineHeight)
    } else if (screenRow === range.end.row) {
      width = canvasWidth - xStart

      context.fillRect(0, yEnd - 1, xEnd, 1)
      context.fillRect(0, yStart, 1, lineHeight)
      context.fillRect(xEnd, yStart, 1, lineHeight)
    } else {
      context.fillRect(0, yStart, 1, lineHeight)
      context.fillRect(canvasWidth - 1, yStart, 1, lineHeight)
      if (screenRow === range.start.row + 1) {
        context.fillRect(0, yStart, xStart, 1)
      }
      if (screenRow === range.end.row - 1) {
        context.fillRect(xEnd, yEnd - 1, canvasWidth - xEnd, 1)
      }
    }
  }
}

/**
 * Draws a custom decoration.
 *
 * It renders only the part of the highlight corresponding to the specified row.
 *
 * @param {Decoration} decoration The decoration to render
 * @param {Object} data The data need to perform the render
 * @param {string} decorationColor Decoration color
 * @param {TextEditorElement} editorElement
 * @access private
 */
function drawCustomDecoration(decoration, data, decorationColor, editorElement) {
  const renderRoutine = decoration.getProperties().render

  if (renderRoutine) {
    data.color = decorationColor
    renderRoutine(decoration, data, editorElement)
  }
}

/**
 * Draws the specified decorations for the current `screenRow`.
 *
 * The `decorations` object contains all the decorations grouped by type and then rows.
 *
 * @param {number} screenRow The screen row index for which render decorations
 * @param {Object} decorations The object containing all the decorations
 * @param {Object} renderData The object containing the render data
 * @param {Object} types An object with the type to render as key and the render method as value
 * @param {TextEditorElement} editorElement
 * @access private
 */
function drawDecorations(screenRow, decorations, renderData, types, editorElement) {
  let decorationsToRender = []

  renderData.context.clearRect(0, renderData.yRow, renderData.canvasWidth, renderData.lineHeight)

  for (const i in types) {
    decorationsToRender = decorationsToRender.concat(decorations[i] != null ? decorations[i][screenRow] || [] : [])
  }

  decorationsToRender.sort(
    (a, b) => (renderData.orders[a.properties.plugin] || 0) - (renderData.orders[b.properties.plugin] || 0)
  )

  if (decorationsToRender != null ? decorationsToRender.length : undefined) {
    for (let i = 0, len = decorationsToRender.length; i < len; i++) {
      const decoration = decorationsToRender[i]
      const decorationDrawer = types[decoration.properties.type]
      if (!SPEC_MODE) {
        decorationDrawer(decoration, renderData, /* decorationColor */ getDecorationColor(decoration, editorElement))
      } else {
        // get the real function name from the mangeld Parcel names
        const functionName = decorationDrawer.name.split("$").pop().replace("Lambda", "")
        // call the spy:
        thisSpec[functionName](
          decoration,
          renderData,
          /* decorationColor */ getDecorationColor(decoration, editorElement)
        )
      }
    }
  }
}

/**
 * Draws front decorations on the corresponding layer.
 *
 * The lines range to draw is specified by the `firstRow` and `lastRow` parameters.
 *
 * @param {number} firstRow The first row to render
 * @param {number} lastRow The last row to render
 * @param {number} offsetRow The relative offset to apply to rows when rendering them
 * @param {Object} renderData
 * @param {number} lineHeight This.minimap.getLineHeight() * devicePixelRatio
 * @param {TextEditorElement} editorElement This.minimap.getTextEditorElement()
 * @param {Decoration[]} decorations
 * @access private
 */
function drawFrontDecorationsForLines(
  firstRow,
  lastRow,
  offsetRow,
  renderData,
  lineHeight,
  editorElement,
  decorations
) {
  if (firstRow > lastRow) {
    return
  }

  for (let screenRow = firstRow; screenRow <= lastRow; screenRow++) {
    renderData.row = offsetRow + (screenRow - firstRow)
    renderData.yRow = renderData.row * lineHeight
    renderData.screenRow = screenRow

    drawDecorations(screenRow, decorations, renderData, frontDecorationDispatcher, editorElement)
  }

  renderData.context.fill()
}

/**
 * Draws back decorations on the corresponding layer.
 *
 * The lines range to draw is specified by the `firstRow` and `lastRow` parameters.
 *
 * @param {number} firstRow The first row to render
 * @param {number} lastRow The last row to render
 * @param {number} offsetRow The relative offset to apply to rows when rendering them
 * @param {Object} renderData
 * @param {number} lineHeight This.minimap.getLineHeight() * devicePixelRatio
 * @param {TextEditorElement} editorElement This.minimap.getTextEditorElement()
 * @param {Decoration[]} decorations
 * @access private
 */
function drawBackDecorationsForLines(firstRow, lastRow, offsetRow, renderData, lineHeight, editorElement, decorations) {
  if (firstRow > lastRow) {
    return
  }

  for (let screenRow = firstRow; screenRow <= lastRow; screenRow++) {
    renderData.row = offsetRow + (screenRow - firstRow)
    renderData.yRow = renderData.row * lineHeight
    renderData.screenRow = screenRow

    drawDecorations(screenRow, decorations, renderData, backgroundDecorationDispatcher, editorElement)
  }

  renderData.context.fill()
}

//     ######   #######  ##        #######  ########   ######
//    ##    ## ##     ## ##       ##     ## ##     ## ##    ##
//    ##       ##     ## ##       ##     ## ##     ## ##
//    ##       ##     ## ##       ##     ## ########   ######
//    ##       ##     ## ##       ##     ## ##   ##         ##
//    ##    ## ##     ## ##       ##     ## ##    ##  ##    ##
//     ######   #######  ########  #######  ##     ##  ######

/**
 * Returns the opacity value to use when rendering the `Minimap` text.
 *
 * @returns {Number} The text opacity value Unused (inlined)
 */
// getTextOpacity () { return this.textOpacity }

/**
 * Returns the default text color for an editor content.
 *
 * The color value is directly read from the `TextEditorView` computed styles.
 *
 * @param {TextEditorElement} editorElement
 * @param {number} textOpacity
 * @returns {string} A CSS color
 */
function getDefaultColor(editorElement, textOpacity) {
  const color = styleReader.retrieveStyleFromDom([".editor"], "color", editorElement, true)
  return transparentize(color, textOpacity)
}

/**
 * Returns the text color for the passed-in scopes
 *
 * The color value is read from the DOM by creating a node structure that match the token `scope` property.
 *
 * @param {string[]} scopes An array of scopes for a `TextEditor` token (token.scopeDescriptor || token.scopes)
 * @param {TextEditorElement} editorElement
 * @param {number} textOpacity
 * @returns {string} The CSS color for the provided token
 */
function getTokenColor(scopes, editorElement, textOpacity) {
  const color = styleReader.retrieveStyleFromDom(scopes, "color", editorElement, true)

  return transparentize(color, textOpacity)
}

/**
 * Converts a `rgb(...)` color into a `rgba(...)` color with the specified opacity.
 *
 * @param {string} color The CSS RGB color to transparentize
 * @param {number} opacity The opacity amount
 * @returns {string} The transparentized CSS color
 * @access private
 */
function transparentize(color, opacity) {
  // assumes that color is in form of `rgb(content)` with no spaces around the given value
  return `rgba(${color.slice(4, -1)}, ${opacity})`
}

/**
 * Returns the background color for the passed-in `decoration` object.
 *
 * The color value is read from the DOM by creating a node structure that match the decoration `scope` property unless
 * the decoration provides its own `color` property.
 *
 * @param {Decoration} decoration The decoration to get the color for
 * @param {TextEditorElement} editorElement
 * @returns {string} The CSS color for the provided decoration
 */
function getDecorationColor(decoration, editorElement) {
  const properties = decoration.getProperties()
  if (properties.color) {
    return properties.color
  }

  if (properties.scope) {
    const scopeString = properties.scope.split(oneOrMoreWhiteSpaceRegexp)
    return styleReader.retrieveStyleFromDom(scopeString, "background-color", editorElement, true)
  } else {
    return getDefaultColor(editorElement)
  }
}

//    ########     ###    ##    ##  ######   ########  ######
//    ##     ##   ## ##   ###   ## ##    ##  ##       ##    ##
//    ##     ##  ##   ##  ####  ## ##        ##       ##
//    ########  ##     ## ## ## ## ##   #### ######    ######
//    ##   ##   ######### ##  #### ##    ##  ##             ##
//    ##    ##  ##     ## ##   ### ##    ##  ##       ##    ##
//    ##     ## ##     ## ##    ##  ######   ########  ######

/**
 * Computes the ranges that are not affected by the current pending changes.
 *
 * @param {number} firstRow The first row of the rendered region
 * @param {number} lastRow The last row of the rendered region
 * @param {number | null} offscreenFirstRow CanvasDrawer.offscreenLastRow
 * @param {number | null} offscreenLastRow CanvasDrawer.offscreenLastRow
 * @returns {Object[]} The intact ranges in the rendered region
 * @access private
 */
function computeIntactRanges(firstRow, lastRow, changes, offscreenFirstRow, offscreenLastRow) {
  // TODO when do they get null?
  if (offscreenFirstRow == null && offscreenLastRow == null) {
    return []
  }

  // At first, the whole range is considered intact
  let intactRanges = [
    {
      start: offscreenFirstRow,
      end: offscreenLastRow,
      offscreenRow: 0,
    },
  ]

  for (let i = 0, len = changes.length; i < len; i++) {
    const change = changes[i]
    const newIntactRanges = []

    for (let j = 0, intactLen = intactRanges.length; j < intactLen; j++) {
      const range = intactRanges[j]

      if (change.end < range.start && change.screenDelta !== 0) {
        // The change is above of the range and lines are either
        // added or removed
        newIntactRanges.push({
          start: range.start + change.screenDelta,
          end: range.end + change.screenDelta,
          offscreenRow: range.offscreenRow,
        })
      } else if (change.end < range.start || change.start > range.end) {
        // The change is outside the range but didn't add
        // or remove lines
        newIntactRanges.push(range)
      } else {
        // The change is within the range, there's one intact range
        // from the range start to the change start
        if (change.start > range.start) {
          newIntactRanges.push({
            start: range.start,
            end: change.start - 1,
            offscreenRow: range.offscreenRow,
          })
        }
        if (change.end < range.end) {
          // The change ends within the range
          if (change.bufferDelta !== 0) {
            // Lines are added or removed, the intact range starts in the
            // next line after the change end plus the screen delta
            newIntactRanges.push({
              start: change.end + change.screenDelta + 1,
              end: range.end + change.screenDelta,
              offscreenRow: range.offscreenRow + change.end + 1 - range.start,
            })
          } else if (change.screenDelta !== 0) {
            // Lines are added or removed in the display buffer, the intact
            // range starts in the next line after the change end plus the
            // screen delta
            newIntactRanges.push({
              start: change.end + change.screenDelta + 1,
              end: range.end + change.screenDelta,
              offscreenRow: range.offscreenRow + change.end + 1 - range.start,
            })
          } else {
            // No lines are added, the intact range starts on the line after
            // the change end
            newIntactRanges.push({
              start: change.end + 1,
              end: range.end,
              offscreenRow: range.offscreenRow + change.end + 1 - range.start,
            })
          }
        }
      }
    }
    intactRanges = newIntactRanges
  }

  return truncateIntactRanges(intactRanges, firstRow, lastRow)
}

/**
 * Truncates the intact ranges so that they doesn't expand past the visible area of the minimap.
 *
 * @param {Object[]} intactRanges The initial array of ranges
 * @param {number} firstRow The first row of the rendered region
 * @param {number} lastRow The last row of the rendered region
 * @returns {Object[]} The array of truncated ranges
 * @access private
 */
function truncateIntactRanges(intactRanges, firstRow, lastRow) {
  let i = 0
  while (i < intactRanges.length) {
    const range = intactRanges[i]

    if (range.start < firstRow) {
      range.offscreenRow += firstRow - range.start
      range.start = firstRow
    }

    if (range.end > lastRow) {
      range.end = lastRow
    }

    if (range.start >= range.end) {
      intactRanges.splice(i--, 1)
    }

    i++
  }

  return intactRanges.sort((a, b) => {
    return a.offscreenRow - b.offscreenRow
  })
}
