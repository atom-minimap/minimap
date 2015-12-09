'use babel'

import path from 'path'

let stylesheetPath = path.resolve(__dirname, '../../styles/minimap.less')
let stylesheet = atom.themes.loadStylesheet(stylesheetPath)

export default {stylesheet}

beforeEach(() => {
  if (!atom.workspace.buildTextEditor) {
    let {TextEditor} = require('atom')
    atom.workspace.buildTextEditor = function (opts) {
      return new TextEditor(opts)
    }
  }

  let jasmineContent = document.body.querySelector('#jasmine-content')
  let styleNode = document.createElement('style')
  styleNode.textContent = `
    ${stylesheet}

    atom-text-editor-minimap[stand-alone] {
      width: 100px
      height: 100px
    }

    atom-text-editor, atom-text-editor::shadow {
      line-height: 17px
    }

    atom-text-editor atom-text-editor-minimap, atom-text-editor::shadow atom-text-editor-minimap {
      background: rgba(255,0,0,0.3)
    }

    atom-text-editor atom-text-editor-minimap::shadow .minimap-scroll-indicator, atom-text-editor::shadow atom-text-editor-minimap::shadow .minimap-scroll-indicator {
      background: rgba(0,0,255,0.3)
    }

    atom-text-editor atom-text-editor-minimap::shadow .minimap-visible-area, atom-text-editor::shadow atom-text-editor-minimap::shadow .minimap-visible-area {
      background: rgba(0,255,0,0.3)
      opacity: 1
    }

    atom-text-editor::shadow atom-text-editor-minimap::shadow .open-minimap-quick-settings {
      opacity: 1 !important
    }
  `

  jasmineContent.appendChild(styleNode)
})
