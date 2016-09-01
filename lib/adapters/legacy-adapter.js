'use babel'

/**
 * @access private
 */
export default class LegacyAdapter {
  constructor (textEditor) { this.textEditor = textEditor }

  enableCache () { this.useCache = true }

  clearCache () {
    this.useCache = false
    delete this.heightCache
    delete this.scrollTopCache
    delete this.scrollLeftCache
    delete this.maxScrollTopCache
  }

  onDidChangeScrollTop (callback) {
    return this.textEditor.onDidChangeScrollTop(callback)
  }

  onDidChangeScrollLeft (callback) {
    return this.textEditor.onDidChangeScrollLeft(callback)
  }

  getHeight () {
    if (this.useCache) {
      if (!this.heightCache) {
        this.heightCache = this.textEditor.getHeight()
      }
      return this.heightCache
    }
    return this.textEditor.getHeight()
  }

  getScrollTop () {
    if (this.useCache) {
      if (!this.scrollTopCache) {
        this.scrollTopCache = this.textEditor.getScrollTop()
      }
      return this.scrollTopCache
    }
    return this.textEditor.getScrollTop()
  }

  setScrollTop (scrollTop) {
    return this.textEditor.setScrollTop(scrollTop)
  }

  getScrollLeft () {
    if (this.useCache) {
      if (!this.scrollLeftCache) {
        this.scrollLeftCache = this.textEditor.getScrollLeft()
      }
      return this.scrollLeftCache
    }

    return this.textEditor.getScrollLeft()
  }

  getMaxScrollTop () {
    if (this.maxScrollTopCache != null && this.useCache) {
      return this.maxScrollTopCache
    }
    var maxScrollTop = this.textEditor.displayBuffer.getMaxScrollTop()
    var lineHeight = this.textEditor.getLineHeightInPixels()

    if (this.scrollPastEnd) {
      maxScrollTop -= this.getHeight() - 3 * lineHeight
    }
    if (this.useCache) { this.maxScrollTopCache = maxScrollTop }
    return maxScrollTop
  }
}
