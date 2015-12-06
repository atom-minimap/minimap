'use babel'

/**
 * @access private
 */
export default class StableAdapter {
  constructor (textEditor) {
    this.textEditor = textEditor
    this.textEditorElement = atom.views.getView(this.textEditor)
  }

  enableCache () { this.useCache = true }

  clearCache () {
    this.useCache = false
    delete this.heightCache
    delete this.scrollTopCache
    delete this.scrollLeftCache
    delete this.maxScrollTopCache
  }

  onDidChangeScrollTop (callback) {
    return this.textEditorElement.onDidChangeScrollTop(callback)
  }

  onDidChangeScrollLeft (callback) {
    return this.textEditorElement.onDidChangeScrollLeft(callback)
  }

  getHeight () {
    if (this.useCache) {
      if (!this.heightCache) {
        this.heightCache = this.textEditorElement.getHeight()
      }
      return this.heightCache
    }
    return this.textEditorElement.getHeight()
  }

  getScrollTop () {
    if (this.useCache) {
      if (!this.scrollTopCache) {
        this.scrollTopCache = this.textEditorElement.getScrollTop()
      }
      return this.scrollTopCache
    }
    return this.textEditorElement.getScrollTop()
  }

  setScrollTop (scrollTop) {
    this.textEditorElement.setScrollTop(scrollTop)
  }

  getScrollLeft () {
    if (this.useCache) {
      if (!this.scrollLeftCache) {
        this.scrollLeftCache = this.textEditorElement.getScrollLeft()
      }
      return this.scrollLeftCache
    }
    return this.textEditorElement.getScrollLeft()
  }

  getMaxScrollTop () {
    if (this.maxScrollTopCache != null && this.useCache) {
      return this.maxScrollTopCache
    }

    let maxScrollTop = this.textEditorElement.getScrollHeight() - this.getHeight()
    let lineHeight = this.textEditor.getLineHeightInPixels()

    if (this.scrollPastEnd) {
      maxScrollTop -= this.getHeight() - 3 * lineHeight
    }

    if (this.useCache) {
      this.maxScrollTopCache = maxScrollTop
    }

    return maxScrollTop
  }
}
