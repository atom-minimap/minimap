'use babel'

import _ from 'underscore-plus'
import Mixin from 'mixto'

/**
 * Public: The {CanvasDrawer} mixin is responsible for the rendering of a
 * {Minimap} in a `canvas` element.
 *
 * This mixin is injected in the {MinimapElement} prototype, so all these *thods
 * are available on any {MinimapElement} instance.
 */
export default class CanvasDrawer extends Mixin {
  // Initializes the canvas elements needed to perform the {Minimap} rendering.
  initializeCanvas() {
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')
    this.canvas.webkitImageSmoothingEnabled = false

    this.offscreenCanvas = document.createElement('canvas')
    this.offscreenContext = this.offscreenCanvas.getContext('2d')
    this.offscreenCanvas.webkitImageSmoothingEnabled = false

    if (!this.pendingChanges) { this.pendingChanges = [] }
  }

  // Performs an update of the rendered {Minimap} based on the changes registered in the instance.
  updateCanvas() {
    var firstRow = this.minimap.getFirstVisibleScreenRow()
    var lastRow = this.minimap.getLastVisibleScreenRow()
    var intactRanges = this.computeIntactRanges(firstRow, lastRow)

    this.context.clearRect(0,0,this.canvas.width, this.canvas.height)

    if (intactRanges.length === 0) {
      this.drawLines(this.context, firstRow, lastRow, 0)
    } else {
      for (let intact of intactRanges) {
        this.copyBitmapPart(
          this.context,
          this.offscreenCanvas,
          intact.domStart,
          intact.start - firstRow,
          intact.end - intact.start
        )
      }
      this.fillGapsBetweenIntactRanges(this.context, intactRanges, firstRow, lastRow)
    }

    // copy displayed canvas to offscreen canvas
    this.offscreenCanvas.width = this.canvas.width
    this.offscreenCanvas.height = this.canvas.height
    this.offscreenContext.drawImage(this.canvas, 0, 0)
    this.offscreenFirstRow = firstRow
    this.offscreenLastRow = lastRow
  }

  //     ######   #######  ##        #######  ########   ######
  //    ##    ## ##     ## ##       ##     ## ##     ## ##    ##
  //    ##       ##     ## ##       ##     ## ##     ## ##
  //    ##       ##     ## ##       ##     ## ########   ######
  //    ##       ##     ## ##       ##     ## ##   ##         ##
  //    ##    ## ##     ## ##       ##     ## ##    ##  ##    ##
  //     ######   #######  ########  #######  ##     ##  ######

  // Returns the opacity value to use when rendering the {Minimap} text.
  //
  // Returns a {Number}.
  getTextOpacity() { return this.textOpacity }

  // Returns the default text color for an editor content.
  //
  // The color value is directly read from the `TextEditorView` computed
  // styles.
  //
  // Returns a {String}.
  getDefaultColor() {
    var color = this.retrieveStyleFromDom(['.editor'], 'color', false, true)
    return this.transparentize(color, this.getTextOpacity())
  }

  // Returns the text color for the passed-in `token` object.
  //
  // The color value is read from the DOM by creating a node structure
  // that match the token `scope` property.
  //
  // token - A token {Object}.
  //
  // Returns a {String}.
  getTokenColor(token) { return this.retrieveTokenColorFromDom(token) }

  // Returns the background color for the passed-in `decoration` object.
  //
  // The color value is read from the DOM by creating a node structure
  // that match the decoration `scope` property unless the decoration
  // provides its own `color` property.
  //
  // decoration - A `Decoration` object.
  //
  // Returns a {String}.
  getDecorationColor(decoration) {
    var properties = decoration.getProperties()
    if (properties.color) { return properties.color }
    return this.retrieveDecorationColorFromDom(decoration)
  }

  // Internal: Returns the text color for the passed-in token.
  //
  // token - A token {Object}.
  //
  // Returns a {String}.
  retrieveTokenColorFromDom(token) {
    // This is quite an expensive operation so results are cached in getTokenColor.
    var scopes = (token.scopeDescriptor || token.scopes)
    var color = this.retrieveStyleFromDom(scopes, 'color')
    return this.transparentize(color, this.getTextOpacity())
  }

  // Internal: Returns the background color for the passed-in decoration.
  //
  // decoration - A `Decoration` object.
  //
  // Returns a {String}.
  retrieveDecorationColorFromDom(decoration) {
    return this.retrieveStyleFromDom(decoration.getProperties().scope.split(/\s+/), 'background-color', false)
  }

  // Internal: Converts a `rgb(...)` color into a `rgba(...)` color
  // with the specified opacity.
  //
  // color - The {String} of the color to modify.
  // opacity - The opacity {Number} to apply to the color.
  //
  // Returns a {String}.
  transparentize(color, opacity=1) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`)
  }

  //    ########  ########     ###    ##      ##
  //    ##     ## ##     ##   ## ##   ##  ##  ##
  //    ##     ## ##     ##  ##   ##  ##  ##  ##
  //    ##     ## ########  ##     ## ##  ##  ##
  //    ##     ## ##   ##   ######### ##  ##  ##
  //    ##     ## ##    ##  ##     ## ##  ##  ##
  //    ########  ##     ## ##     ##  ###  ###

  // Internal: Draws lines on the passed-in `context`.
  //
  // The lines range to draw is specified by the `firstRow` and `lastRow`
  // parameters.
  //
  // context - The canvas context {Object} into which drawing the lines.
  // firstRow - The starting row {Number} of the lines range to draw.
  // endRow - The ending row {Number} of the lines range to draw.
  // offsetRow - The offset {Number} to apply to rows index.
  drawLines (context, firstRow, lastRow, offsetRow) {
    if (firstRow > lastRow) { return }

    let lines = this.getTextEditor().tokenizedLinesForScreenRows(firstRow, lastRow)
    let lineHeight = this.minimap.getLineHeight() * devicePixelRatio
    let charHeight = this.minimap.getCharHeight() * devicePixelRatio
    let charWidth = this.minimap.getCharWidth() * devicePixelRatio
    let canvasWidth = this.canvas.width
    let displayCodeHighlights = this.displayCodeHighlights
    let decorations = this.decorationsByTypeThenRows(firstRow, lastRow)

    let line = lines[0]

    // Whitespaces can be substituted by other characters so we need
    // to replace them when that's the case.
    let invisibleRegExp = this.getInvisibleRegExp(line)

    for (let row in lines) {
      line = lines[row]

      let x = 0
      let y = offsetRow + row
      let screenRow = firstRow + row
      let y0 = y * lineHeight

      // Line decorations are first drawn on the canvas.
      let lineDecorations = decorations['line'] ? decorations['line'][screenRow] : []

      if (lineDecorations.length > 0) {
        this.drawLineDecorations(context, lineDecorations, y0, canvasWidth, lineHeight)
      }

      // Then comes the highlight decoration with `highlight-under` type.
      let highlightDecorations = decorations['highlight-under'] ? decorations['highlight-under'][screenRow] : []

      if (highlightDecorations.length > 0) {
        for (let decoration of highlightDecorations) {
          this.drawHighlightDecoration(context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth)
        }
      }

      // Then the line tokens are drawn
      if (line && line.tokens) {
        for (let token of line.tokens) {
          let w = token.screenDelta
          let color
          if (token.isOnlyWhitespace()) {
            x += w * charWidth
          } else {
            if (displayCodeHighlights) {
              color = this.getDefaultColor()
            } else {
              color = this.getTokenColor(token)
            }

            let value = token.value
            if (invisibleRegExp) {
              value = value.replace(invisibleRegExp, ' ')
            }

            x = this.drawToken(context, value, color, x, y0, charWidth, charHeight)
          }

          if (x > canvasWidth) { break }
        }
      }

      // Then the highlight over decorations are drawn.
      highlightDecorations = decorations['highlight-over'] ? decorations['highlight-over'][screenRow] : []

      if (highlightDecorations.length > 0) {
        for (let decoration of highlightDecorations) {
          this.drawHighlightDecoration(context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth)
        }
      }

      // Finally the highlight box decorations are drawn.
      highlightDecorations = decorations['highlight-outline'] ? decorations['highlight-outline'][screenRow] : []

      if (highlightDecorations.length > 0) {
        for (let decoration of highlightDecorations) {
          this.drawHighlightOutlineDecoration(context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth)
        }
      }
    }

    context.fill()
  }

  // Internal: Returns the regexp to replace invisibles substitution characters
  // in editor lines.
  //
  // line - The screen line for which replacing the invisibles characters.
  getInvisibleRegExp(line) {
    if (line && line.invisibles) {
      let invisibles = []

      for (let key in line.invisibles) {
        invisibles.push(line.invisibles[key])
      }

      return new RegExp(invisibles.filter((s) => {
        return typeof s === 'string'
      }).map(_.escapeRegExp).join('|'), 'g')
    }
  }

  // Internal: Draws a single token on the given context.
  //
  // context - The canvas context object onto which draw the token.
  // text - The {String} text of the token.
  // color - The {String} color of the token.
  // x - The {Number} position on the x axis at which render the token.
  // y - The {Number} position on the y axis at which render the token.
  // charWidth - The char width {Number}.
  // charHeight - The char height {Number}.
  //
  // Returns a {Number} that correspond to the new x position after the render.
  drawToken(context, text, color, x, y, charWidth, charHeight) {
    context.fillStyle = color
    let chars = 0

    for (let char of text) {
      if (/\s/.test(char)) {
        if (chars > 0) {
          context.fillRect(x - (chars * charWidth), y, chars * charWidth, charHeight)
        }
        chars = 0
      } else {
        chars++
      }

      if (chars > 0) {
        context.fillRect(x - (chars * charWidth), y, chars * charWidth, charHeight)
      }

      x += charWidth
    }

    return x
  }

  // Internal: Draws a line decoration on the passed-in context.
  //
  // context - The canvas context object.
  // decoration - The `Decoration` object to render.
  // y - The {Number} position on the y axis at which render the decoration.
  // canvasWidth - The {Number} of the canvas width.
  // lineHeight - The {Number} for the line height.
  drawLineDecorations(context, decorations, y, canvasWidth, lineHeight) {
    for (var i = 0, decoration i < decorations.length i++) {
      decoration = decorations[i]
      context.fillStyle = this.getDecorationColor(decoration)
      context.fillRect(0,y,canvasWidth,lineHeight)
    }
  }

  // Internal: Draws a highlight decoration on the passed-in context.
  //
  // It renders only the part of the highlight corresponding to the specified
  // row.
  //
  // context - The canvas context object.
  // decoration - The `Decoration` object to render.
  // y - The {Number} position on the y axis at which render the decoration.
  // screenRow - The row {Number} corresponding to the rendered row.
  // lineHeight - The {Number} for the line height.
  // charWidth - The {Number} for the character width.
  // canvasWidth - The {Number} of the canvas width.
  drawHighlightDecoration(context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth) {
    context.fillStyle = this.getDecorationColor(decoration)
    var range = decoration.getMarker().getScreenRange()
    var rowSpan = range.end.row - range.start.row

    if (rowSpan === 0) {
      var colSpan = range.end.column - range.start.column
      context.fillRect(
        range.start.column * charWidth,
        y * lineHeight,
        colSpan * charWidth,
        lineHeight
      )
    } else {
      if (screenRow === range.start.row) {
        var x = range.start.column * charWidth
        context.fillRect(x,y*lineHeight,canvasWidth-x,lineHeight)
      } else if (screenRow === range.end.row) {
        context.fillRect(0,y*lineHeight,range.end.column * charWidth,lineHeight)
      } else {
        context.fillRect(0,y*lineHeight,canvasWidth,lineHeight)
      }
    }
  }

  // Internal: Draws a highlight outline decoration on the passed-in context.
  //
  // It renders only the part of the highlight corresponding to the specified
  // row.
  //
  // context - The canvas context object.
  // decoration - The `Decoration` object to render.
  // y - The {Number} position on the y axis at which render the decoration.
  // screenRow - The row {Number} corresponding to the rendered row.
  // lineHeight - The {Number} for the line height.
  // charWidth - The {Number} for the character width.
  // canvasWidth - The {Number} of the canvas width.
  drawHighlightOutlineDecoration(context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth) {
    context.fillStyle = this.getDecorationColor(decoration)
    var range = decoration.getMarker().getScreenRange()
    var rowSpan = range.end.row - range.start.row

    if (rowSpan === 0) {
      var colSpan = range.end.column - range.start.column
      var width = colSpan * charWidth
      var xStart = range.start.column * charWidth
      var xEnd = xStart + width
      var yStart = y * lineHeight
      var yEnd = yStart + lineHeight

      context.fillRect(xStart, yStart, width, 1)
      context.fillRect(xStart, yEnd, width, 1)
      context.fillRect(xStart, yStart, 1, lineHeight)
      return context.fillRect(xEnd, yStart, 1, lineHeight)

    } else if (rowSpan === 1) {
      xStart = range.start.column * charWidth
      xEnd = range.end.column * charWidth
      if (screenRow === range.start.row) {
        width = canvasWidth - xStart
        yStart = y * lineHeight
        yEnd = yStart + lineHeight
        var xBottomStart = Math.max(xStart, xEnd)
        var bottomWidth = canvasWidth - xBottomStart

        context.fillRect(xStart, yStart, width, 1)
        context.fillRect(xBottomStart, yEnd, bottomWidth, 1)
        context.fillRect(xStart, yStart, 1, lineHeight)
        return context.fillRect(canvasWidth - 1, yStart, 1, lineHeight)
      } else {
        width = canvasWidth - xStart
        yStart = y * lineHeight
        yEnd = yStart + lineHeight
        bottomWidth = canvasWidth - xEnd

        context.fillRect(0, yStart, xStart, 1)
        context.fillRect(0, yEnd, xEnd, 1)
        context.fillRect(0, yStart, 1, lineHeight)
        return context.fillRect(xEnd, yStart, 1, lineHeight)
      }
    } else {
      xStart = range.start.column * charWidth
      xEnd = range.end.column * charWidth

      if (screenRow === range.start.row) {
        width = canvasWidth - xStart
        yStart = y * lineHeight
        yEnd = yStart + lineHeight

        context.fillRect(xStart, yStart, width, 1)
        context.fillRect(xStart, yStart, 1, lineHeight)
        return context.fillRect(canvasWidth - 1, yStart, 1, lineHeight)

      } else if (screenRow === range.end.row) {
        width = canvasWidth - xStart
        yStart = y * lineHeight
        yEnd = yStart + lineHeight

        context.fillRect(0, yEnd, xEnd, 1)
        context.fillRect(0, yStart, 1, lineHeight)
        return context.fillRect(xEnd, yStart, 1, lineHeight)
      } else {
        yStart = y * lineHeight
        yEnd = yStart + lineHeight

        context.fillRect(0, yStart, 1, lineHeight)
        context.fillRect(canvasWidth - 1, yStart, 1, lineHeight)

        if (screenRow === range.start.row + 1) {
          context.fillRect(0, yStart, xStart, 1)
        }

        if (screenRow === range.end.row - 1) {
          return context.fillRect(xEnd, yEnd, canvasWidth - xEnd, 1)
        }
      }
    }
  }

  // Internal: Copy a part of the offscreen bitmap into the onscreen one to
  // reduce the amount of rendered lines during scroll.
  //
  // context - The canvas context object.
  // bitmapCanvas - The source bitmap.
  // srcRow - The row {Number} on the source bitmap.
  // destRow - The row {Number} on the destination bitmap.
  // rowCount - The {Number} of rows to copy.
  copyBitmapPart(context, bitmapCanvas, srcRow, destRow, rowCount) {
    var lineHeight = this.minimap.getLineHeight() * devicePixelRatio
    return context.drawImage(bitmapCanvas, 0, srcRow * lineHeight, bitmapCanvas.width, rowCount * lineHeight, 0, destRow * lineHeight, bitmapCanvas.width, rowCount * lineHeight)
  }

  //    ########     ###    ##    ##  ######   ########  ######
  //    ##     ##   ## ##   ###   ## ##    ##  ##       ##    ##
  //    ##     ##  ##   ##  ####  ## ##        ##       ##
  //    ########  ##     ## ## ## ## ##   #### ######    ######
  //    ##   ##   ######### ##  #### ##    ##  ##             ##
  //    ##    ##  ##     ## ##   ### ##    ##  ##       ##    ##
  //    ##     ## ##     ## ##    ##  ######   ########  ######

  //## Internal ###

  // Renders the lines between the intact ranges when an update has pending
  // changes.
  //
  // context - The canvas context object.
  // intactRanges - The {Array} of intact ranges.
  // firstRow - The first visible row index {Number}.
  // lastRow - The last visible row index {Number}.
  fillGapsBetweenIntactRanges(context, intactRanges, firstRow, lastRow) {
    var currentRow = firstRow
    // intactRanges is sorted, we can safely fill between ranges
    for (var i = 0, intact i < intactRanges.length i++) {
      intact = intactRanges[i]
      this.drawLines(context, currentRow, intact.start-1, currentRow-firstRow)
      currentRow = intact.end
    }
    if (currentRow <= lastRow) {
      return this.drawLines(context, currentRow, lastRow, currentRow-firstRow)
    }
  }

  // Computes the ranges that are not affected by the current pending changes.
  //
  // firstRow - The first visible row index {Number}.
  // lastRow - The last visible row index {Number}.
  //
  // Returns an {Array} of ranges.
  computeIntactRanges(firstRow, lastRow) {
    if (!(this.offscreenFirstRow != null) && !(this.offscreenLastRow != null)) { return [] }

    var intactRanges = [{start: this.offscreenFirstRow, end: this.offscreenLastRow, domStart: 0}]

    var iterable = this.pendingChanges
    for (var i = 0, change i < iterable.length i++) {
      change = iterable[i]
      var newIntactRanges = []
      for (var j = 0, range j < intactRanges.length j++) {
        range = intactRanges[j]
        if (change.end < range.start && change.screenDelta !== 0) {
          newIntactRanges.push(
            {start: range.start + change.screenDelta,
            end: range.end + change.screenDelta,
            domStart: range.domStart}
          )
        } else if (change.end < range.start || change.start > range.end) {
          newIntactRanges.push(range)
        } else {
          if (change.start > range.start) {
            newIntactRanges.push(
              {start: range.start,
              end: change.start - 1,
              domStart: range.domStart})
          }
          if (change.end < range.end) {
            // If the bufferDelta is 0 it's a change in the screen lines
            // due to soft wrapping, we don't need to touch to the intact ranges
            if (!(change.bufferDelta === 0)) {
              newIntactRanges.push(
                {start: change.end + change.screenDelta + 1,
                end: range.end + change.screenDelta,
                domStart: range.domStart + change.end + 1 - range.start}
              )
            }
          }
        }

        var intactRange = newIntactRanges[newIntactRanges.length - 1]
      }

      intactRanges = newIntactRanges
    }

    this.truncateIntactRanges(intactRanges, firstRow, lastRow)

    this.pendingChanges = []

    return intactRanges
  }

  // Truncates the intact ranges so that they doesn't expand past the visible
  // area of the minimap.
  //
  // intactRanges - The {Array} of ranges to truncate.
  // firstRow - The first visible row index {Number}.
  // lastRow - The last visible row index {Number}.
  //
  // Returns an {Array} of ranges.
  truncateIntactRanges(intactRanges, firstRow, lastRow) {
    var i = 0
    while (i < intactRanges.length) {
      var range = intactRanges[i]
      if (range.start < firstRow) {
        range.domStart += firstRow - range.start
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
    return intactRanges.sort(function(a, b) { return a.domStart - b.domStart })
  }
}
