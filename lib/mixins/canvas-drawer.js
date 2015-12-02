'use babel'

import _ from 'underscore-plus'
import Mixin from 'mixto'

export default class CanvasDrawer extends Mixin {
  initializeCanvas () {
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')
    this.canvas.webkitImageSmoothingEnabled = false
    if (this.pendingChanges == null) {
      this.pendingChanges = []
    }
    this.offscreenCanvas = document.createElement('canvas')
    return this.offscreenContext = this.offscreenCanvas.getContext('2d')
  }

  updateCanvas () {
    var firstRow, intact, intactRanges, j, lastRow, len
    firstRow = this.minimap.getFirstVisibleScreenRow()
    lastRow = this.minimap.getLastVisibleScreenRow()
    intactRanges = this.computeIntactRanges(firstRow, lastRow)
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (intactRanges.length === 0) {
      this.drawLines(this.context, firstRow, lastRow, 0)
    } else {
      for (j = 0, len = intactRanges.length; j < len; j++) {
        intact = intactRanges[j]
        this.copyBitmapPart(this.context, this.offscreenCanvas, intact.domStart, intact.start - firstRow, intact.end - intact.start)
      }
      this.fillGapsBetweenIntactRanges(this.context, intactRanges, firstRow, lastRow)
    }
    this.offscreenCanvas.width = this.canvas.width
    this.offscreenCanvas.height = this.canvas.height
    this.offscreenContext.drawImage(this.canvas, 0, 0)
    this.offscreenFirstRow = firstRow
    return this.offscreenLastRow = lastRow
  }

  getTextOpacity () {
    return this.textOpacity
  }

  getDefaultColor () {
    var color
    color = this.retrieveStyleFromDom(['.editor'], 'color', false, true)
    return this.transparentize(color, this.getTextOpacity())
  }

  getTokenColor (token) {
    return this.retrieveTokenColorFromDom(token)
  }

  getDecorationColor (decoration) {
    var properties
    properties = decoration.getProperties()
    if (properties.color != null) {
      return properties.color
    }
    return this.retrieveDecorationColorFromDom(decoration)
  }

  retrieveTokenColorFromDom (token) {
    var color, scopes
    scopes = token.scopeDescriptor || token.scopes
    color = this.retrieveStyleFromDom(scopes, 'color')
    return this.transparentize(color, this.getTextOpacity())
  }

  retrieveDecorationColorFromDom (decoration) {
    return this.retrieveStyleFromDom(decoration.getProperties().scope.split(/\s+/), 'background-color', false)
  }

  transparentize (color, opacity) {
    if (opacity == null) {
      opacity = 1
    }
    return color.replace('rgb(', 'rgba(').replace(')', ", " + opacity + ")")
  }

  drawLines (context, firstRow, lastRow, offsetRow) {
    var canvasWidth, charHeight, charWidth, color, decoration, decorations, displayCodeHighlights, highlightDecorations, invisibleRegExp, j, k, l, len, len1, len2, len3, len4, line, lineDecorations, lineHeight, lines, m, n, ref, ref1, ref2, ref3, ref4, row, screenRow, token, value, w, x, y, y0
    if (firstRow > lastRow) {
      return
    }
    lines = this.getTextEditor().tokenizedLinesForScreenRows(firstRow, lastRow)
    lineHeight = this.minimap.getLineHeight() * devicePixelRatio
    charHeight = this.minimap.getCharHeight() * devicePixelRatio
    charWidth = this.minimap.getCharWidth() * devicePixelRatio
    canvasWidth = this.canvas.width
    displayCodeHighlights = this.displayCodeHighlights
    decorations = this.minimap.decorationsByTypeThenRows(firstRow, lastRow)
    line = lines[0]
    invisibleRegExp = this.getInvisibleRegExp(line)
    for (row = j = 0, len = lines.length; j < len; row = ++j) {
      line = lines[row]
      x = 0
      y = offsetRow + row
      screenRow = firstRow + row
      y0 = y * lineHeight
      lineDecorations = (ref = decorations['line']) != null ? ref[screenRow] : void 0
      if (lineDecorations != null ? lineDecorations.length : void 0) {
        this.drawLineDecorations(context, lineDecorations, y0, canvasWidth, lineHeight)
      }
      highlightDecorations = (ref1 = decorations['highlight-under']) != null ? ref1[firstRow + row] : void 0
      if (highlightDecorations != null ? highlightDecorations.length : void 0) {
        for (k = 0, len1 = highlightDecorations.length; k < len1; k++) {
          decoration = highlightDecorations[k]
          this.drawHighlightDecoration(context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth)
        }
      }
      if ((line != null ? line.tokens : void 0) != null) {
        ref2 = line.tokens
        for (l = 0, len2 = ref2.length; l < len2; l++) {
          token = ref2[l]
          w = token.screenDelta
          if (!token.isOnlyWhitespace()) {
            color = displayCodeHighlights ? this.getTokenColor(token) : this.getDefaultColor()
            value = token.value
            if (invisibleRegExp != null) {
              value = value.replace(invisibleRegExp, ' ')
            }
            x = this.drawToken(context, value, color, x, y0, charWidth, charHeight)
          } else {
            x += w * charWidth
          }
          if (x > canvasWidth) {
            break
          }
        }
      }
      highlightDecorations = (ref3 = decorations['highlight-over']) != null ? ref3[firstRow + row] : void 0
      if (highlightDecorations != null ? highlightDecorations.length : void 0) {
        for (m = 0, len3 = highlightDecorations.length; m < len3; m++) {
          decoration = highlightDecorations[m]
          this.drawHighlightDecoration(context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth)
        }
      }
      highlightDecorations = (ref4 = decorations['highlight-outline']) != null ? ref4[firstRow + row] : void 0
      if (highlightDecorations != null ? highlightDecorations.length : void 0) {
        for (n = 0, len4 = highlightDecorations.length; n < len4; n++) {
          decoration = highlightDecorations[n]
          this.drawHighlightOutlineDecoration(context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth)
        }
      }
    }
    context.fill()
  }

  getInvisibleRegExp (line) {
    var invisibles
    if ((line != null) && (line.invisibles != null)) {
      invisibles = []
      if (line.invisibles.cr != null) {
        invisibles.push(line.invisibles.cr)
      }
      if (line.invisibles.eol != null) {
        invisibles.push(line.invisibles.eol)
      }
      if (line.invisibles.space != null) {
        invisibles.push(line.invisibles.space)
      }
      if (line.invisibles.tab != null) {
        invisibles.push(line.invisibles.tab)
      }
      return RegExp("" + (invisibles.filter(function(s) {
        return typeof s === 'string'
      }).map(_.escapeRegExp).join('|')), "g")
    }
  }

  drawToken (context, text, color, x, y, charWidth, charHeight) {
    var char, chars, j, len
    context.fillStyle = color
    chars = 0
    for (j = 0, len = text.length; j < len; j++) {
      char = text[j]
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

  drawLineDecorations (context, decorations, y, canvasWidth, lineHeight) {
    var decoration, j, len
    for (j = 0, len = decorations.length; j < len; j++) {
      decoration = decorations[j]
      context.fillStyle = this.getDecorationColor(decoration)
      context.fillRect(0, y, canvasWidth, lineHeight)
    }
  }

  drawHighlightDecoration (context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth) {
    var colSpan, range, rowSpan, x
    context.fillStyle = this.getDecorationColor(decoration)
    range = decoration.getMarker().getScreenRange()
    rowSpan = range.end.row - range.start.row
    if (rowSpan === 0) {
      colSpan = range.end.column - range.start.column
      return context.fillRect(range.start.column * charWidth, y * lineHeight, colSpan * charWidth, lineHeight)
    } else {
      if (screenRow === range.start.row) {
        x = range.start.column * charWidth
        return context.fillRect(x, y * lineHeight, canvasWidth - x, lineHeight)
      } else if (screenRow === range.end.row) {
        return context.fillRect(0, y * lineHeight, range.end.column * charWidth, lineHeight)
      } else {
        return context.fillRect(0, y * lineHeight, canvasWidth, lineHeight)
      }
    }
  }

  drawHighlightOutlineDecoration (context, decoration, y, screenRow, lineHeight, charWidth, canvasWidth) {
    var bottomWidth, colSpan, range, rowSpan, width, xBottomStart, xEnd, xStart, yEnd, yStart
    context.fillStyle = this.getDecorationColor(decoration)
    range = decoration.getMarker().getScreenRange()
    rowSpan = range.end.row - range.start.row
    if (rowSpan === 0) {
      colSpan = range.end.column - range.start.column
      width = colSpan * charWidth
      xStart = range.start.column * charWidth
      xEnd = xStart + width
      yStart = y * lineHeight
      yEnd = yStart + lineHeight
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
        xBottomStart = Math.max(xStart, xEnd)
        bottomWidth = canvasWidth - xBottomStart
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

  copyBitmapPart (context, bitmapCanvas, srcRow, destRow, rowCount) {
    var lineHeight
    lineHeight = this.minimap.getLineHeight() * devicePixelRatio
    return context.drawImage(bitmapCanvas, 0, srcRow * lineHeight, bitmapCanvas.width, rowCount * lineHeight, 0, destRow * lineHeight, bitmapCanvas.width, rowCount * lineHeight)
  }


  /* Internal */

  fillGapsBetweenIntactRanges (context, intactRanges, firstRow, lastRow) {
    var currentRow, intact, j, len
    currentRow = firstRow
    for (j = 0, len = intactRanges.length; j < len; j++) {
      intact = intactRanges[j]
      this.drawLines(context, currentRow, intact.start - 1, currentRow - firstRow)
      currentRow = intact.end
    }
    if (currentRow <= lastRow) {
      return this.drawLines(context, currentRow, lastRow, currentRow - firstRow)
    }
  }

  computeIntactRanges (firstRow, lastRow) {
    var change, intactRange, intactRanges, j, k, len, len1, newIntactRanges, range, ref
    if ((this.offscreenFirstRow == null) && (this.offscreenLastRow == null)) {
      return []
    }
    intactRanges = [
      {
        start: this.offscreenFirstRow,
        end: this.offscreenLastRow,
        domStart: 0
      }
    ]
    ref = this.pendingChanges
    for (j = 0, len = ref.length; j < len; j++) {
      change = ref[j]
      newIntactRanges = []
      for (k = 0, len1 = intactRanges.length; k < len1; k++) {
        range = intactRanges[k]
        if (change.end < range.start && change.screenDelta !== 0) {
          newIntactRanges.push({
            start: range.start + change.screenDelta,
            end: range.end + change.screenDelta,
            domStart: range.domStart
          })
        } else if (change.end < range.start || change.start > range.end) {
          newIntactRanges.push(range)
        } else {
          if (change.start > range.start) {
            newIntactRanges.push({
              start: range.start,
              end: change.start - 1,
              domStart: range.domStart
            })
          }
          if (change.end < range.end) {
            if (change.bufferDelta !== 0) {
              newIntactRanges.push({
                start: change.end + change.screenDelta + 1,
                end: range.end + change.screenDelta,
                domStart: range.domStart + change.end + 1 - range.start
              })
            }
          }
        }
        intactRange = newIntactRanges[newIntactRanges.length - 1]
      }
      intactRanges = newIntactRanges
    }
    this.truncateIntactRanges(intactRanges, firstRow, lastRow)
    this.pendingChanges = []
    return intactRanges
  }

  truncateIntactRanges (intactRanges, firstRow, lastRow) {
    var i, range
    i = 0
    while (i < intactRanges.length) {
      range = intactRanges[i]
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
    return intactRanges.sort(function(a, b) {
      return a.domStart - b.domStart
    })
  }
}
