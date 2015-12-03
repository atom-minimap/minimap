'use babel'

import _ from 'underscore-plus'
import Mixin from 'mixto'

export default class CanvasDrawer extends Mixin {
  initializeCanvas () {
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')
    this.canvas.webkitImageSmoothingEnabled = false
    this.context.imageSmoothingEnabled = false

    this.offscreenCanvas = document.createElement('canvas')
    this.offscreenContext = this.offscreenCanvas.getContext('2d')
    this.offscreenCanvas.webkitImageSmoothingEnabled = false
    this.offscreenContext.imageSmoothingEnabled = false

    if (!this.pendingChanges) { this.pendingChanges = [] }
  }

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
        this.copyBitmapPart(context, this.offscreenCanvas, intact.domStart, intact.start - firstRow, intact.end - intact.start)
      }
      this.fillGapsBetweenIntactRanges(context, intactRanges, firstRow, lastRow)
    }

    this.offscreenCanvas.width = this.canvas.width
    this.offscreenCanvas.height = this.canvas.height
    this.offscreenContext.drawImage(this.canvas, 0, 0)
    this.offscreenFirstRow = firstRow
    this.offscreenLastRow = lastRow
  }

  getTextOpacity () { return this.textOpacity }

  getDefaultColor () {
    let color = this.retrieveStyleFromDom(['.editor'], 'color', false, true)
    return this.transparentize(color, this.getTextOpacity())
  }

  getTokenColor (token) { return this.retrieveTokenColorFromDom(token) }

  getDecorationColor (decoration) {
    let properties = decoration.getProperties()
    if (properties.color) { return properties.color }
    return this.retrieveDecorationColorFromDom(decoration)
  }

  retrieveTokenColorFromDom (token) {
    let scopes = token.scopeDescriptor || token.scopes
    let color = this.retrieveStyleFromDom(scopes, 'color')
    return this.transparentize(color, this.getTextOpacity())
  }

  retrieveDecorationColorFromDom (decoration) {
    let scopeString = decoration.getProperties().scope.split(/\s+/)
    return this.retrieveStyleFromDom(scopeString, 'background-color', false)
  }

  transparentize (color, opacity) {
    if (opacity == null) { opacity = 1 }
    return color.replace('rgb(', 'rgba(').replace(')', `, ${opacity})`)
  }

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
        for (let j = 0, tokensCount = line.tokens.length; j < tokensCount; j++) {
          let token = line.tokens[j]
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

  drawDecorations (screenRow, decorations, type, renderData, renderMethod) {
    decorations = (ref = decorations[type]) != null ? ref[screenRow] : void 0

    if (decorations != null ? decorations.length : void 0) {
      for (let i = 0, len = decorations.length; i < len; i++) {
        renderMethod.call(this, decorations[i], renderData)
      }
    }
  }

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

  drawLineDecoration (decoration, data) {
    data.context.fillStyle = this.getDecorationColor(decoration)
    data.context.fillRect(0, data.yRow, data.canvasWidth, data.lineHeight)
  }

  drawHighlightDecoration (decoration, data) {
    let colSpan
    let range = decoration.getMarker().getScreenRange()
    let rowSpan = range.end.row - range.start.row

    if (rowSpan === 0) {
      colSpan = range.end.column - range.start.column
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
    var change, intactRanges, j, k, len, len1, newIntactRanges, range, ref
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
    return intactRanges.sort((a, b) => { return a.domStart - b.domStart })
  }
}
