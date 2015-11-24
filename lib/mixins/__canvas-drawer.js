'use babel'

import _ from 'underscore-plus'
import Mixin from 'mixto'

export default class CanvasDrawer extends Mixin {
  /**
   * Initializes the canvas elements needed to perform the Minimap rendering.
   *
   * @access private
   */
  initializeCanvas () {
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')
    this.canvas.webkitImageSmoothingEnabled = false

    this.offscreenCanvas = document.createElement('canvas')
    this.offscreenContext = this.offscreenCanvas.getContext('2d')
    this.offscreenCanvas.webkitImageSmoothingEnabled = false

    if (!this.pendingChanges) {
      this.pendingChanges = []
    }
  }

  /**
   * Performs an update of the rendered {Minimap} based on the changes
   * registered in the instance.
   */
  updateCanvas () {
    let firstRow = this.minimap.getFirstVisibleScreenRow()
    let lastRow = this.minimap.getLastVisibleScreenRow()
    let intactRanges = this.computeIntactRanges(firstRow, lastRow)

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

  getTextOpacity () { return this.textOpacity }

  getDefaultColor () {
    let color = this.retrieveStyleFromDom(['.editor'], 'color', false, true)
    return this.transparentize(color, this.getTextOpacity())
  }

  getTokenColor (token) { return this.retrieveTokenColorFromDom(token) }

  getDecorationColor (decoration) {
    let properties = decoration.getProperties()

    if (properties.color) {
      return properties.color
    } else {
      return this.retrieveDecorationColorFromDom(decoration)
    }
  }

  retrieveTokenColorFromDom (token) {
    let scopes = token.scopeDescriptor || token.scopes
    let color = this.retrieveStyleFromDom(scopes, 'color')
    return this.transparentize(color, this.getTextOpacity())
  }

  retrieveDecorationColorFromDom (decoration) {
    let scopes = decoration.getProperties().scope.split(/\s+/)
    return this.retrieveStyleFromDom(scopes, 'background-color', false)
  }

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

  getInvisibleRegExp (line) {
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

  drawToken (context, text, color, x, y, charWidth, charHeight) {
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
}
