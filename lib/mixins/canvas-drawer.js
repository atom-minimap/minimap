'use babel'

import _ from 'underscore-plus'
import Mixin from 'mixto'
import Main from '../main'
import CanvasLayer from '../canvas-layer'

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
    * The main canvas layer where lines are rendered.
    * @type {CanvasLayer}
    */
    this.tokensLayer = new CanvasLayer()
    /**
    * The canvas layer for decorations below the text.
    * @type {CanvasLayer}
    */
    this.backLayer = new CanvasLayer()
    /**
    * The canvas layer for decorations above the text.
    * @type {CanvasLayer}
    */
    this.frontLayer = new CanvasLayer()

    if (!this.pendingChanges) {
      /**
       * Stores the changes from the text editor.
       * @type {Array<Object>}
       * @access private
       */
      this.pendingChanges = []
    }

    if (!this.pendingBackDecorationChanges) {
      /**
       * Stores the changes from the minimap back decorations.
       * @type {Array<Object>}
       * @access private
       */
      this.pendingBackDecorationChanges = []
    }

    if (!this.pendingFrontDecorationChanges) {
      /**
       * Stores the changes from the minimap front decorations.
       * @type {Array<Object>}
       * @access private
       */
      this.pendingFrontDecorationChanges = []
    }
  }

  /**
   * Returns the uppermost canvas in the MinimapElement.
   *
   * @return {HTMLCanvasElement} the html canvas element
   */
  getFrontCanvas () { return this.frontLayer.canvas }

  /**
   * Attaches the canvases into the specified container.
   *
   * @param  {HTMLElement} parent the canvases' container
   * @access private
   */
  attachCanvases (parent) {
    this.backLayer.attach(parent)
    this.tokensLayer.attach(parent)
    this.frontLayer.attach(parent)
  }

  /**
   * Changes the size of all the canvas layers at once.
   *
   * @param {number} width the new width for the three canvases
   * @param {number} height the new height for the three canvases
   * @access private
   */
  setCanvasesSize (width, height) {
    this.backLayer.setSize(width, height)
    this.tokensLayer.setSize(width, height)
    this.frontLayer.setSize(width, height)
  }

  /**
   * Performs an update of the rendered `Minimap` based on the changes
   * registered in the instance.
   */
  updateCanvas () {
    const firstRow = this.minimap.getFirstVisibleScreenRow()
    const lastRow = this.minimap.getLastVisibleScreenRow()

    this.updateTokensLayer(firstRow, lastRow)
    this.updateBackDecorationsLayer(firstRow, lastRow)
    this.updateFrontDecorationsLayer(firstRow, lastRow)

    this.pendingChanges = []
    this.pendingBackDecorationChanges = []
    this.pendingFrontDecorationChanges = []

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

  /**
   * Performs an update of the tokens layer using the pending changes array.
   *
   * @param  {number} firstRow firstRow the first row of the range to update
   * @param  {number} lastRow lastRow the last row of the range to update
   * @access private
   */
  updateTokensLayer (firstRow, lastRow) {
    const intactRanges = this.computeIntactRanges(firstRow, lastRow, this.pendingChanges)

    this.redrawRangesOnLayer(this.tokensLayer, intactRanges, firstRow, lastRow, this.drawLines)
  }

  /**
   * Performs an update of the back decorations layer using the pending back
   * decorations changes arrays.
   *
   * @param  {number} firstRow firstRow the first row of the range to update
   * @param  {number} lastRow lastRow the last row of the range to update
   * @access private
   */
  updateBackDecorationsLayer (firstRow, lastRow) {
    const intactRanges = this.computeIntactRanges(firstRow, lastRow, this.pendingBackDecorationChanges)

    this.redrawRangesOnLayer(this.backLayer, intactRanges, firstRow, lastRow, this.drawBackDecorationsForLines)
  }

  /**
   * Performs an update of the front decorations layer using the pending front
   * decorations changes arrays.
   *
   * @param  {number} firstRow firstRow the first row of the range to update
   * @param  {number} lastRow lastRow the last row of the range to update
   * @access private
   */
  updateFrontDecorationsLayer (firstRow, lastRow) {
    const intactRanges = this.computeIntactRanges(firstRow, lastRow, this.pendingFrontDecorationChanges)

    this.redrawRangesOnLayer(this.frontLayer, intactRanges, firstRow, lastRow, this.drawFrontDecorationsForLines)
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
    const color = this.retrieveStyleFromDom(['.editor'], 'color', false, true)
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
    const scopes = token.scopeDescriptor || token.scopes
    const color = this.retrieveStyleFromDom(scopes, 'color')

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
    const properties = decoration.getProperties()
    if (properties.color) { return properties.color }

    if (properties.scope) {
      const scopeString = properties.scope.split(/\s+/)
      return this.retrieveStyleFromDom(scopeString, 'background-color', false)
    } else {
      return this.getDefaultColor()
    }
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
   * Routine used to render changes in specific ranges for one layer.
   *
   * @param  {CanvasLayer} layer the layer to redraw
   * @param  {Array<Object>} intactRanges an array of the ranges to leave intact
   * @param  {number} firstRow firstRow the first row of the range to update
   * @param  {number} lastRow lastRow the last row of the range to update
   * @param  {Function} method the render method to use for the lines drawing
   * @access private
   */
  redrawRangesOnLayer (layer, intactRanges, firstRow, lastRow, method) {
    const devicePixelRatio = this.minimap.getDevicePixelRatio()
    const lineHeight = this.minimap.getLineHeight() * devicePixelRatio

    layer.clearCanvas()

    if (intactRanges.length === 0) {
      method.call(this, firstRow, lastRow, 0)
    } else {
      for (let j = 0, len = intactRanges.length; j < len; j++) {
        const intact = intactRanges[j]

        layer.copyPartFromOffscreen(
          intact.offscreenRow * lineHeight,
          (intact.start - firstRow) * lineHeight,
          (intact.end - intact.start) * lineHeight
        )
      }
      this.drawLinesForRanges(method, intactRanges, firstRow, lastRow)
    }

    layer.resetOffscreenSize()
    layer.copyToOffscreen()
  }

  /**
   * Renders the lines between the intact ranges when an update has pending
   * changes.
   *
   * @param  {Function} method the render method to use for the lines drawing
   * @param  {Array<Object>} intactRanges the intact ranges in the minimap
   * @param  {number} firstRow the first row of the rendered region
   * @param  {number} lastRow the last row of the rendered region
   * @access private
   */
  drawLinesForRanges (method, ranges, firstRow, lastRow) {
    let currentRow = firstRow
    for (let i = 0, len = ranges.length; i < len; i++) {
      const range = ranges[i]

      method.call(this, currentRow, range.start, currentRow - firstRow)

      currentRow = range.end
    }
    if (currentRow <= lastRow) {
      method.call(this, currentRow, lastRow, currentRow - firstRow)
    }
  }

  /**
   * Draws back decorations on the corresponding layer.
   *
   * The lines range to draw is specified by the `firstRow` and `lastRow`
   * parameters.
   *
   * @param  {number} firstRow the first row to render
   * @param  {number} lastRow the last row to render
   * @param  {number} offsetRow the relative offset to apply to rows when
   *                            rendering them
   * @access private
   */
  drawBackDecorationsForLines (firstRow, lastRow, offsetRow) {
    if (firstRow > lastRow) { return }

    const devicePixelRatio = this.minimap.getDevicePixelRatio()
    const lineHeight = this.minimap.getLineHeight() * devicePixelRatio
    const charHeight = this.minimap.getCharHeight() * devicePixelRatio
    const charWidth = this.minimap.getCharWidth() * devicePixelRatio
    const decorations = this.minimap.decorationsByTypeThenRows(firstRow, lastRow)
    const {width: canvasWidth, height: canvasHeight} = this.tokensLayer.getSize()
    const renderData = {
      context: this.backLayer.context,
      canvasWidth: canvasWidth,
      canvasHeight: canvasHeight,
      lineHeight: lineHeight,
      charWidth: charWidth,
      charHeight: charHeight,
      orders: Main.getPluginsOrder()
    }

    for (let screenRow = firstRow; screenRow <= lastRow; screenRow++) {
      renderData.row = offsetRow + (screenRow - firstRow)
      renderData.yRow = renderData.row * lineHeight
      renderData.screenRow = screenRow

      this.drawDecorations(screenRow, decorations, renderData, {
        'line': this.drawLineDecoration,
        'highlight-under': this.drawHighlightDecoration,
        'background-custom': this.drawCustomDecoration
      })
    }

    this.backLayer.context.fill()
  }

  /**
   * Draws front decorations on the corresponding layer.
   *
   * The lines range to draw is specified by the `firstRow` and `lastRow`
   * parameters.
   *
   * @param  {number} firstRow the first row to render
   * @param  {number} lastRow the last row to render
   * @param  {number} offsetRow the relative offset to apply to rows when
   *                            rendering them
   * @access private
   */
  drawFrontDecorationsForLines (firstRow, lastRow, offsetRow) {
    if (firstRow > lastRow) { return }

    const devicePixelRatio = this.minimap.getDevicePixelRatio()
    const lineHeight = this.minimap.getLineHeight() * devicePixelRatio
    const charHeight = this.minimap.getCharHeight() * devicePixelRatio
    const charWidth = this.minimap.getCharWidth() * devicePixelRatio
    const decorations = this.minimap.decorationsByTypeThenRows(firstRow, lastRow)
    const {width: canvasWidth, height: canvasHeight} = this.tokensLayer.getSize()
    const renderData = {
      context: this.frontLayer.context,
      canvasWidth: canvasWidth,
      canvasHeight: canvasHeight,
      lineHeight: lineHeight,
      charWidth: charWidth,
      charHeight: charHeight,
      orders: Main.getPluginsOrder()
    }

    for (let screenRow = firstRow; screenRow <= lastRow; screenRow++) {
      renderData.row = offsetRow + (screenRow - firstRow)
      renderData.yRow = renderData.row * lineHeight
      renderData.screenRow = screenRow

      this.drawDecorations(screenRow, decorations, renderData, {
        'gutter': this.drawGutterDecoration,
        'highlight-over': this.drawHighlightDecoration,
        'highlight-outline': this.drawHighlightOutlineDecoration,
        'foreground-custom': this.drawCustomDecoration
      })
    }

    renderData.context.fill()
  }

  /**
   * Returns an array of tokens by line.
   *
   * @param  {number} startRow The start row
   * @param  {number} endRow The end row
   * @return {Array<Array>} An array of tokens by line
   * @access private
   */
  tokenLinesForScreenRows (startRow, endRow) {
    const editor = this.getTextEditor()
    let tokenLines = []
    if (typeof editor.tokenizedLinesForScreenRows === 'function') {
      for (let tokenizedLine of editor.tokenizedLinesForScreenRows(startRow, endRow)) {
        if (tokenizedLine) {
          const invisibleRegExp = this.getInvisibleRegExpForLine(tokenizedLine)
          tokenLines.push(tokenizedLine.tokens.map((token) => {
            return {
              value: token.value.replace(invisibleRegExp, ' '),
              scopes: token.scopes.slice()
            }
          }))
        } else {
          return {
            value: '',
            scopes: []
          }
        }
      }
    } else {
      const displayLayer = editor.displayLayer
      const invisibleRegExp = this.getInvisibleRegExp()
      const screenLines = displayLayer.getScreenLines(startRow, endRow)
      for (let {lineText, tagCodes} of screenLines) {
        let tokens = []
        let scopes = []
        let textIndex = 0
        // console.log(lineText, invisibleRegExp, lineText.replace(invisibleRegExp, ' '))
        for (let tagCode of tagCodes) {
          if (displayLayer.isOpenTagCode(tagCode)) {
            scopes.push(displayLayer.tagForCode(tagCode))
          } else if (displayLayer.isCloseTagCode(tagCode)) {
            scopes.pop()
          } else {
            let value = lineText.substr(textIndex, tagCode)
            if (invisibleRegExp) {
              value = value.replace(invisibleRegExp, ' ')
            }
            tokens.push({ value: value, scopes: scopes.slice() })
            textIndex += tagCode
          }
        }

        tokenLines.push(tokens)
      }
    }
    return tokenLines
  }

  /**
   * Draws lines on the corresponding layer.
   *
   * The lines range to draw is specified by the `firstRow` and `lastRow`
   * parameters.
   *
   * @param  {number} firstRow the first row to render
   * @param  {number} lastRow the last row to render
   * @param  {number} offsetRow the relative offset to apply to rows when
   *                            rendering them
   * @access private
   */
  drawLines (firstRow, lastRow, offsetRow) {
    if (firstRow > lastRow) { return }

    const devicePixelRatio = this.minimap.getDevicePixelRatio()
    const lineHeight = this.minimap.getLineHeight() * devicePixelRatio
    const charHeight = this.minimap.getCharHeight() * devicePixelRatio
    const charWidth = this.minimap.getCharWidth() * devicePixelRatio
    const displayCodeHighlights = this.displayCodeHighlights
    const context = this.tokensLayer.context
    const {width: canvasWidth} = this.tokensLayer.getSize()

    if (typeof this.tokenLinesForScreenRows !== 'function') {
      console.error(`tokenLinesForScreenRows should be a function but it was ${typeof this.tokenLinesForScreenRows}`, this.tokenLinesForScreenRows)

      return
    }

    const screenRowsTokens = this.tokenLinesForScreenRows(firstRow, lastRow)

    let y = offsetRow * lineHeight
    for (let i = 0; i < screenRowsTokens.length; i++) {
      let tokens = screenRowsTokens[i]
      let x = 0
      context.clearRect(x, y, canvasWidth, lineHeight)
      for (let j = 0; j < tokens.length; j++) {
        let token = tokens[j]
        if (/^\s+$/.test(token.value)) {
          x += token.value.length * charWidth
        } else {
          const color = displayCodeHighlights ? this.getTokenColor(token) : this.getDefaultColor()
          x = this.drawToken(context, token.value, color, x, y, charWidth, charHeight)
        }
        if (x > canvasWidth) { break }
      }

      y += lineHeight
    }

    context.fill()
  }

  /**
   * Returns the regexp to replace invisibles substitution characters
   * in editor lines.
   *
   * @return {RegExp} the regular expression to match invisible characters
   * @access private
   */
  getInvisibleRegExp () {
    let invisibles = this.getTextEditor().getInvisibles()
    let regexp = []
    if (invisibles.cr != null) { regexp.push(invisibles.cr) }
    if (invisibles.eol != null) { regexp.push(invisibles.eol) }
    if (invisibles.space != null) { regexp.push(invisibles.space) }
    if (invisibles.tab != null) { regexp.push(invisibles.tab) }

    return regexp.length === 0 ? null : RegExp(regexp.filter((s) => {
      return typeof s === 'string'
    }).map(_.escapeRegExp).join('|'), 'g')
  }

  /**
   * Returns the regexp to replace invisibles substitution characters
   * in editor lines.
   *
   * @param  {Object} line the tokenized line
   * @return {RegExp} the regular expression to match invisible characters
   * @deprecated Is used only to support Atom version before display layer API
   * @access private
   */
  getInvisibleRegExpForLine (line) {
    if ((line != null) && (line.invisibles != null)) {
      const invisibles = []
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

    if (this.ignoreWhitespacesInTokens) {
      const length = text.length * charWidth
      context.fillRect(x, y, length, charHeight)

      return x + length
    } else {
      let chars = 0
      for (let j = 0, len = text.length; j < len; j++) {
        const char = text[j]
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
   * @param  {Object} renderData the object containing the render data
   * @param  {Object} types an object with the type to render as key and the
   *                        render method as value
   * @access private
   */
  drawDecorations (screenRow, decorations, renderData, types) {
    let decorationsToRender = []

    renderData.context.clearRect(
      0, renderData.yRow,
      renderData.canvasWidth, renderData.lineHeight
    )

    for (let i in types) {
      decorationsToRender = decorationsToRender.concat(
        decorations[i] != null ? decorations[i][screenRow] || [] : []
      )
    }

    decorationsToRender.sort((a, b) =>
      (renderData.orders[a.properties.plugin] || 0) - (renderData.orders[b.properties.plugin] || 0)
    )

    if (decorationsToRender != null ? decorationsToRender.length : void 0) {
      for (let i = 0, len = decorationsToRender.length; i < len; i++) {
        types[decorationsToRender[i].properties.type].call(this, decorationsToRender[i], renderData)
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
   * Draws a gutter decoration.
   *
   * @param  {Decoration} decoration the decoration to render
   * @param  {Object} data the data need to perform the render
   * @access private
   */
  drawGutterDecoration (decoration, data) {
    data.context.fillStyle = this.getDecorationColor(decoration)
    data.context.fillRect(0, data.yRow, 1, data.lineHeight)
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
    const range = decoration.getMarker().getScreenRange()
    const rowSpan = range.end.row - range.start.row

    data.context.fillStyle = this.getDecorationColor(decoration)

    if (rowSpan === 0) {
      const colSpan = range.end.column - range.start.column
      data.context.fillRect(range.start.column * data.charWidth, data.yRow, colSpan * data.charWidth, data.lineHeight)
    } else if (data.screenRow === range.start.row) {
      const x = range.start.column * data.charWidth
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
    const {lineHeight, charWidth, canvasWidth, screenRow} = data
    const range = decoration.getMarker().getScreenRange()
    const rowSpan = range.end.row - range.start.row
    const yStart = data.yRow
    const yEnd = yStart + lineHeight

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
   * Draws a custom decoration.
   *
   * It renders only the part of the highlight corresponding to the specified
   * row.
   *
   * @param  {Decoration} decoration the decoration to render
   * @param  {Object} data the data need to perform the render
   * @access private
   */
  drawCustomDecoration (decoration, data) {
    const renderRoutine = decoration.getProperties().render

    if (renderRoutine) {
      data.color = this.getDecorationColor(decoration)
      renderRoutine(decoration, data)
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
   * @param  {number} firstRow the first row of the rendered region
   * @param  {number} lastRow the last row of the rendered region
   * @return {Array<Object>} the intact ranges in the rendered region
   * @access private
   */
  computeIntactRanges (firstRow, lastRow, changes) {
    if ((this.offscreenFirstRow == null) && (this.offscreenLastRow == null)) {
      return []
    }

    // At first, the whole range is considered intact
    let intactRanges = [
      {
        start: this.offscreenFirstRow,
        end: this.offscreenLastRow,
        offscreenRow: 0
      }
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
            offscreenRow: range.offscreenRow
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
              offscreenRow: range.offscreenRow
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
                offscreenRow: range.offscreenRow + change.end + 1 - range.start
              })
            } else if (change.screenDelta !== 0) {
              // Lines are added or removed in the display buffer, the intact
              // range starts in the next line after the change end plus the
              // screen delta
              newIntactRanges.push({
                start: change.end + change.screenDelta + 1,
                end: range.end + change.screenDelta,
                offscreenRow: range.offscreenRow + change.end + 1 - range.start
              })
            } else {
              // No lines are added, the intact range starts on the line after
              // the change end
              newIntactRanges.push({
                start: change.end + 1,
                end: range.end,
                offscreenRow: range.offscreenRow + change.end + 1 - range.start
              })
            }
          }
        }
      }
      intactRanges = newIntactRanges
    }

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
      const range = intactRanges[i]

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
