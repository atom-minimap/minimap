'use strict'

const path = require('path')
const stylesheetPath = path.resolve(__dirname, '../../styles/minimap.less')
const stylesheet = atom.themes.loadStylesheet(stylesheetPath)
const styles = `
  ${stylesheet}
  atom-text-editor {
    position: relative;
  }

  atom-text-editor-minimap[stand-alone] {
    width: 100px;
    height: 100px;
  }

  atom-text-editor {
    line-height: 17px;
  }

  atom-text-editor atom-text-editor-minimap {
    background: rgba(255,0,0,0.3);
  }

  atom-text-editor atom-text-editor-minimap .minimap-scroll-indicator {
    background: rgba(0,0,255,0.3);
  }

  atom-text-editor atom-text-editor-minimap .minimap-visible-area {
    background: rgba(0,255,0,0.3);
    opacity: 1;
  }

  atom-text-editor atom-text-editor-minimap .open-minimap-quick-settings {
    opacity: 1 !important;
  }
`

module.exports = {stylesheet, styles}

beforeEach(() => {
  if (!atom.workspace.buildTextEditor) {
    const {TextEditor} = require('atom')
    atom.workspace.buildTextEditor = function (opts) {
      return new TextEditor(opts)
    }
  }

  const jasmineContent = document.body.querySelector('#jasmine-content')
  const styleNode = document.createElement('style')
  styleNode.textContent = styles

  jasmineContent.appendChild(styleNode)
})
