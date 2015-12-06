'use babel'

import _ from 'underscore-plus'
import Mixin from 'mixto'

/**
 * The `CanvasDrawer` mixin is responsible for the rendering of a `Minimap`
 * in a `canvas` element.
 *
 * This mixin is injected in the `MinimapElement` prototype, so all these
 * methods  are available on any `MinimapElement` instance.
 */
export default class CanvasDrawer extends Mixin {
  /**
   * Initializes the canvas elements needed to perform the `Minimap` rendering.
   */
  initializeCanvas () {
    /**
     * The onscreen canvas.
     * @type {HTMLCanvasElement}
     */
    this.canvas = document.createElement('canvas')
    /**
     * The onscreen canvas context.
     * @type {CanvasRenderingContext2D}
     */
    this.context = this.canvas.getContext('2d')
    this.canvas.webkitImageSmoothingEnabled = false
    this.context.imageSmoothingEnabled = false

    /**
    * The offscreen canvas.
    * @type {HTMLCanvasElement}
    * @access private
    */
    this.offscreenCanvas = document.createElement('canvas')
    /**
     * The offscreen canvas context.
     * @type {CanvasRenderingContext2D}
     * @access private
     */
    this.offscreenContext = this.offscreenCanvas.getContext('2d')
    this.offscreenCanvas.webkitImageSmoothingEnabled = false
    this.offscreenContext.imageSmoothingEnabled = false

    if (!this.pendingChanges) {
      /**
       * Stores the changes from the text editor and the minimap.
       * @type {Array<Object>}
       * @access private
       */
      this.pendingChanges = []
    }
  }

  /**
   * Performs an update of the rendered `Minimap` based on the changes
   * registered in the instance.
   */
  updateCanvas () {
    let firstRow = this.minimap.getFirstVisibleScreenRow()
    let lastRow = this.minimap.getLastVisibleScreenRow()
    let intactRanges = this.computeIntactRanges(firstRow, lastRow)
    let context = this.context

    context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (intactRanges.length === 0) {
      this.drawLines(context, firstRow, lastRow, 0)
    } else {
      for (let j = 0, len = intactRanges.length; j < len; j++) {
        let intact = intactRanges[j]
        this.copyBitmapPart(context, this.offscreenCanvas, intact.offscreenRow, intact.start - firstRow, intact.end - intact.start)
      }
      this.fillGapsBetweenIntactRanges(context, intactRanges, firstRow, lastRow)
    }

    this.offscreenCanvas.width = this.canvas.width
    this.offscreenCanvas.height = this.canvas.height
    this.offscreenContext.drawImage(this.canvas, 0, 0)
    /**
     * The first row in the last render of the offscreen canvas.
     * @type {number}
     * @access private
     */
    this.offscreenFirstRow = firstRow
    /**
     * The last row in the last render of the offscreen canvas.
     * @type {number}
     * @access private
     */
    this.offscreenLastRow = lastRow
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
   * @return {Number} the text opacity value
   */
  getTextOpacity () { return this.textOpacity }

  /**
   * Returns the default text color for an editor content.
   *
   * The color value is directly read from the `TextEditorView` computed styles.
   *
   * @return {string} a CSS color
   */
  getDefaultColor () {
    let color = this.retrieveStyleFromDom(['.editor'], 'color', false, true)
    return this.transparentize(color, this.getTextOpacity())
  }

  /**
   * Returns the text color for the passed-in `token` object.
   *
   * The color value is read from the DOM by creating a node structure that
   * match the token `scope` property.
   *
   * @param  {Object} token a `TextEditor` token
   * @return {string} the CSS color for the provided token
   */
  getTokenColor (token) {
    let scopes = token.scopeDescriptor || token.scopes
    let color = this.retrieveStyleFromDom(scopes, 'color')

    return this.transparentize(color, this.getTextOpacity())
  }

  /**
   * Returns the background color for the passed-in `decoration` object.
   *
   * The color value is read from the DOM by creating a node structure that
   * match the decoration `scope` property unless the decoration provides
   * its own `color` property.
   *
   * @param  {Decoration} decoration the decoration to get the color for
   * @return {string} the CSS color for the provided decoration
   */
  getDecorationColor (decoration) {
    let properties = decoration.getProperties()
    if (properties.color) { return properties.color }

    let scopeString = properties.scope.split(/\s+/)
    return this.retrieveStyleFromDom(scopeString, 'background-color', false)
  }

  /**
   * Converts a `rgb(...)` color into a `rgba(...)` color with the specified
   * opacity.
   *
   * @param  {string} color the CSS RGB color to transparentize
   * @param  {number} [opacity=1] the opacity amount
   * @return {string} the transparentized CSS color
   * @access private
   */
  transparentize (color, opacity = 1) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`)
  }

  //    ########  ########     ###    ##      ##
  //    ##     ## ##     ##   ## ##   ##  ##  ##
  //    ##     ## ##     ##  ##   ##  ##  ##  ##
  //    ##     ## ########  ##     ## ##  ##  ##
  //    ##     ## ##   ##   ######### ##  ##  ##
  //    ##     ## ##    ##  ##     ## ##  ##  ##
  //    ########  ##     ## ##     ##  ###  ###

  /**
   * Draws lines on the passed-in `context`.
   *
   * The lines range to draw is specified by the `firstRow` and `lastRow`
   * parameters.
   *
   * @param  {CanvasRenderingContext2D} context the canvas's context where
   *                                            drawing the lines
   * @param  {number} firstRow the first row to render
   * @param  {number} lastRow the last row to render
   * @param  {number} offsetRow the relative offset to apply to rows when
   *                            rendering them
   * @access private
   */
  drawLines (context, firstRow, lastRow, offsetRow) {
    if (firstRow > lastRow) { return }

    let lines = this.getTextEditor().tokenizedLinesForScreenRows(firstRow, lastRow)
    let lineHeight = this.minimap.getLineHeight() * devicePixelRatio
    let charHeight = this.minimap.getCharHeight() * devicePixelRatio
    let charWidth = this.minimap.getCharWidth() * devicePixelRatio
    let canvasWidth = this.canvas.width
    let canvasHeight = this.canvas.height
    let displayCodeHighlights = this.displayCodeHighlights
    let decorations = this.minimap.decorationsByTypeThenRows(firstRow, lastRow)

    let line = lines[0]
    let invisibleRegExp = this.getInvisibleRegExp(line)

    let renderData = {
      context: context,
      canvasWidth: canvasWidth,
      canvasHeight: canvasHeight,
      lineHeight: lineHeight,
      charWidth: charWidth,
      charHeight: charHeight
    }

    for (let i = 0, len = lines.length; i < len; i++) {
      line = lines[i]
      let screenRow = firstRow + i
      let x = 0

      renderData.row = offsetRow + i
      renderData.yRow = renderData.row * lineHeight
      renderData.screenRow = screenRow

      this.drawDecorations(screenRow, decorations, 'line', renderData, this.drawLineDecoration)

      this.drawDecorations(screenRow, decorations, 'highlight-under', renderData, this.drawHighlightDecoration)

      if ((line != null ? line.tokens : void 0) != null) {
        let tokens = line.tokens
        for (let j = 0, tokensCount = tokens.length; j < tokensCount; j++) {
          let token = tokens[j]
          let w = token.screenDelta
          if (!token.isOnlyWhitespace()) {
            let color = displayCodeHighlights ? this.getTokenColor(token) : this.getDefaultColor()

            let value = token.value
            if (invisibleRegExp != null) {
              value = value.replace(invisibleRegExp, ' ')
            }
            x = this.drawToken(context, value, color, x, renderData.yRow, charWidth, charHeight)
          } else {
            x += w * charWidth
          }

          if (x > canvasWidth) { break }
        }
      }

      this.drawDecorations(screenRow, decorations, 'highlight-over', renderData, this.drawHighlightDecoration)

      this.drawDecorations(screenRow, decorations, 'highlight-outline', renderData, this.drawHighlightOutlineDecoration)
    }

    context.fill()
  }

  /**
   * Returns the regexp to replace invisibles substitution characters
   * in editor lines.
   *
   * @param  {TokenizedLine} line a tokenized lize to read the invisible
   *                              characters
   * @return {RegExp} the regular expression to match invisible characters
   * @access private
   */
  getInvisibleRegExp (line) {
    if ((line != null) && (line.invisibles != null)) {
      let invisibles = []
      if (line.invisibles.cr != null) { invisibles.push(line.invisibles.cr) }
      if (line.invisibles.eol != null) { invisibles.push(line.invisibles.eol) }
      if (line.invisibles.space != null) { invisibles.push(line.invisibles.space) }
      if (line.invisibles.tab != null) { invisibles.push(line.invisibles.tab) }

      return RegExp(invisibles.filter((s) => {
        return typeof s === 'string'
      }).map(_.escapeRegExp).join('|'), 'g')
    }
  }

  /**
   * Draws a single token on the given context.
   *
   * @param  {CanvasRenderingContext2D} context the target canvas context
   * @param  {string} text the token's text content
   * @param  {string} color the token's CSS color
   * @param  {number} x the x position of the token in the line
   * @param  {number} y the y position of the line in the minimap
   * @param  {number} charWidth the width of a character in the minimap
   * @param  {number} charHeight the height of a character in the minimap
   * @return {number} the x position at the end of the token
   * @access private
   */
  drawToken (context, text, color, x, y, charWidth, charHeight) {
    context.fillStyle = color

    let chars = 0
    for (let j = 0, len = text.length; j < len; j++) {
      let char = text[j]
      if (/\s/.test(char)) {
        if (chars > 0) {
          context.fillRect(x - (chars * charWidth), y, chars * charWidth, charHeight)
        }
        chars = 0
      } else {
        chars++
      }
      x += charWidth
    }
    if (chars > 0) {
      context.fillRect(x - (chars * charWidth), y, chars * charWidth, charHeight)
    }
    return x
  }

  /**
   * Draws the specified decorations for the current `screenRow`.
   *
   * The `decorations` object contains all the decorations grouped by type and
   * then rows.
   *
   * @param  {number} screenRow the screen row index for which
   *                            render decorations
   * @param  {Object} decorations the object containing all the decorations
   * @param  {string} type the type of decorations to render
   * @param  {Object} renderData the object containing the render data
   * @param  {Fundtion} renderMethod the method to call to render
   *                                 the decorations
   * @access private
   */
  drawDecorations (screenRow, decorations, type, renderData, renderMethod) {
    let ref
    decorations = (ref = decorations[type]) != null ? ref[screenRow] : void 0

    if (decorations != null ? decorations.length : void 0) {
      for (let i = 0, len = decorations.length; i < len; i++) {
        renderMethod.call(this, decorations[i], renderData)
      }
    }
  }

  /**
   * Draws a line decoration.
   *
   * @param  {Decoration} decoration the decoration to render
   * @param  {Object} data the data need to perform the render
   * @access private
   */
  drawLineDecoration (decoration, data) {
    data.context.fillStyle = this.getDecorationColor(decoration)
    data.context.fillRect(0, data.yRow, data.canvasWidth, data.lineHeight)
  }

  /**
   * Draws a highlight decoration.
   *
   * It renders only the part of the highlight corresponding to the specified
   * row.
   *
   * @param  {Decoration} decoration the decoration to render
   * @param  {Object} data the data need to perform the render
   * @access private
   */
  drawHighlightDecoration (decoration, data) {
    let range = decoration.getMarker().getScreenRange()
    let rowSpan = range.end.row - range.start.row

    data.context.fillStyle = this.getDecorationColor(decoration)

    if (rowSpan === 0) {
      let colSpan = range.end.column - range.start.column
      data.context.fillRect(range.start.column * data.charWidth, data.yRow, colSpan * data.charWidth, data.lineHeight)
    } else if (data.screenRow === range.start.row) {
      let x = range.start.column * data.charWidth
      data.context.fillRect(x, data.yRow, data.canvasWidth - x, data.lineHeight)
    } else if (data.screenRow === range.end.row) {
      data.context.fillRect(0, data.yRow, range.end.column * data.charWidth, data.lineHeight)
    } else {
      data.context.fillRect(0, data.yRow, data.canvasWidth, data.lineHeight)
    }
  }

  /**
   * Draws a highlight outline decoration.
   *
   * It renders only the part of the highlight corresponding to the specified
   * row.
   *
   * @param  {Decoration} decoration the decoration to render
   * @param  {Object} data the data need to perform the render
   * @access private
   */
  drawHighlightOutlineDecoration (decoration, data) {
    let bottomWidth, colSpan, width, xBottomStart, xEnd, xStart
    let {lineHeight, charWidth, canvasWidth, screenRow} = data
    let range = decoration.getMarker().getScreenRange()
    let rowSpan = range.end.row - range.start.row
    let yStart = data.yRow
    let yEnd = yStart + lineHeight

    data.context.fillStyle = this.getDecorationColor(decoration)

    if (rowSpan === 0) {
      colSpan = range.end.column - range.start.column
      width = colSpan * charWidth
      xStart = range.start.column * charWidth
      xEnd = xStart + width

      data.context.fillRect(xStart, yStart, width, 1)
      data.context.fillRect(xStart, yEnd, width, 1)
      data.context.fillRect(xStart, yStart, 1, lineHeight)
      data.context.fillRect(xEnd, yStart, 1, lineHeight)
    } else if (rowSpan === 1) {
      xStart = range.start.column * data.charWidth
      xEnd = range.end.column * data.charWidth

      if (screenRow === range.start.row) {
        width = data.canvasWidth - xStart
        xBottomStart = Math.max(xStart, xEnd)
        bottomWidth = data.canvasWidth - xBottomStart

        data.context.fillRect(xStart, yStart, width, 1)
        data.context.fillRect(xBottomStart, yEnd, bottomWidth, 1)
        data.context.fillRect(xStart, yStart, 1, lineHeight)
        data.context.fillRect(canvasWidth - 1, yStart, 1, lineHeight)
      } else {
        width = canvasWidth - xStart
        bottomWidth = canvasWidth - xEnd

        data.context.fillRect(0, yStart, xStart, 1)
        data.context.fillRect(0, yEnd, xEnd, 1)
        data.context.fillRect(0, yStart, 1, lineHeight)
        data.context.fillRect(xEnd, yStart, 1, lineHeight)
      }
    } else {
      xStart = range.start.column * charWidth
      xEnd = range.end.column * charWidth
      if (screenRow === range.start.row) {
        width = canvasWidth - xStart

        data.context.fillRect(xStart, yStart, width, 1)
        data.context.fillRect(xStart, yStart, 1, lineHeight)
        data.context.fillRect(canvasWidth - 1, yStart, 1, lineHeight)
      } else if (screenRow === range.end.row) {
        width = canvasWidth - xStart

        data.context.fillRect(0, yEnd, xEnd, 1)
        data.context.fillRect(0, yStart, 1, lineHeight)
        data.context.fillRect(xEnd, yStart, 1, lineHeight)
      } else {
        data.context.fillRect(0, yStart, 1, lineHeight)
        data.context.fillRect(canvasWidth - 1, yStart, 1, lineHeight)
        if (screenRow === range.start.row + 1) {
          data.context.fillRect(0, yStart, xStart, 1)
        }
        if (screenRow === range.end.row - 1) {
          data.context.fillRect(xEnd, yEnd, canvasWidth - xEnd, 1)
        }
      }
    }
  }

  /**
   * Copy a part of the offscreen bitmap into the onscreen one to
   * reduce the amount of rendered lines during scroll.
   *
   * @param  {CanvasRenderingContext2D} context [description]
   * @param  {HTMLCanvasElement} bitmapCanvas [description]
   * @param  {number} srcRow the source row of the region to copy
   * @param  {number} destRow the destination row
   * @param  {number} rowCount the amount of lines to copy
   * @access private
   */
  copyBitmapPart (context, bitmapCanvas, srcRow, destRow, rowCount) {
    let lineHeight = this.minimap.getLineHeight() * devicePixelRatio

    context.drawImage(
      bitmapCanvas,
      0, srcRow * lineHeight, bitmapCanvas.width, rowCount * lineHeight,
      0, destRow * lineHeight, bitmapCanvas.width, rowCount * lineHeight
    )
  }

  //    ########     ###    ##    ##  ######   ########  ######
  //    ##     ##   ## ##   ###   ## ##    ##  ##       ##    ##
  //    ##     ##  ##   ##  ####  ## ##        ##       ##
  //    ########  ##     ## ## ## ## ##   #### ######    ######
  //    ##   ##   ######### ##  #### ##    ##  ##             ##
  //    ##    ##  ##     ## ##   ### ##    ##  ##       ##    ##
  //    ##     ## ##     ## ##    ##  ######   ########  ######

  /**
   * Renders the lines between the intact ranges when an update has pending
   * changes.
   *
   * @param  {CanvasRenderingContext2D} context the target canvas context
   * @param  {Array<Object>} intactRanges the intact ranges in the minimap
   * @param  {number} firstRow the first row of the rendered region
   * @param  {number} lastRow the last row of the rendered region
   * @access private
   */
  fillGapsBetweenIntactRanges (context, intactRanges, firstRow, lastRow) {
    let currentRow = firstRow
    for (let i = 0, len = intactRanges.length; i < len; i++) {
      let intact = intactRanges[i]

      this.drawLines(context, currentRow, intact.start - 1, currentRow - firstRow)

      currentRow = intact.end
    }
    if (currentRow <= lastRow) {
      this.drawLines(context, currentRow, lastRow, currentRow - firstRow)
    }
  }

  /**
   * Computes the ranges that are not affected by the current pending changes.
   *
   * @param  {number} firstRow the first row of the rendered region
   * @param  {number} lastRow the last row of the rendered region
   * @return {Array<Object>} the intact ranges in the rendered region
   * @access private
   */
  computeIntactRanges (firstRow, lastRow) {
    if ((this.offscreenFirstRow == null) && (this.offscreenLastRow == null)) {
      return []
    }

    let intactRanges = [
      {
        start: this.offscreenFirstRow,
        end: this.offscreenLastRow,
        offscreenRow: 0
      }
    ]

    let changes = this.pendingChanges

    for (let i = 0, len = changes.length; i < len; i++) {
      let change = changes[i]
      let newIntactRanges = []

      for (let j = 0, intactLen = intactRanges.length; j < intactLen; j++) {
        let range = intactRanges[j]

        if (change.end < range.start && change.screenDelta !== 0) {
          newIntactRanges.push({
            start: range.start + change.screenDelta,
            end: range.end + change.screenDelta,
            offscreenRow: range.offscreenRow
          })
        } else if (change.end < range.start || change.start > range.end) {
          newIntactRanges.push(range)
        } else {
          if (change.start > range.start) {
            newIntactRanges.push({
              start: range.start,
              end: change.start - 1,
              offscreenRow: range.offscreenRow
            })
          }
          if (change.end < range.end && change.bufferDelta !== 0) {
            newIntactRanges.push({
              start: change.end + change.screenDelta + 1,
              end: range.end + change.screenDelta,
              offscreenRow: range.offscreenRow + change.end + 1 - range.start
            })
          }
        }
      }
      intactRanges = newIntactRanges
    }

    this.pendingChanges = []
    return this.truncateIntactRanges(intactRanges, firstRow, lastRow)
  }

  /**
   * Truncates the intact ranges so that they doesn't expand past the visible
   * area of the minimap.
   *
   * @param  {Array<Object>} intactRanges the initial array of ranges
   * @param  {number} firstRow the first row of the rendered region
   * @param  {number} lastRow the last row of the rendered region
   * @return {Array<Object>} the array of truncated ranges
   * @access private
   */
  truncateIntactRanges (intactRanges, firstRow, lastRow) {
    let i = 0
    while (i < intactRanges.length) {
      let range = intactRanges[i]

      if (range.start < firstRow) {
        range.offscreenRow += firstRow - range.start
        range.start = firstRow
      }

      if (range.end > lastRow) { range.end = lastRow }

      if (range.start >= range.end) { intactRanges.splice(i--, 1) }

      i++
    }

    return intactRanges.sort((a, b) => {
      return a.offscreenRow - b.offscreenRow
    })
  }
}
