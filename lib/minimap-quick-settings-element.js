'use strict'

const {CompositeDisposable, Emitter} = require('atom')
const {EventsDelegation, SpacePenDSL} = require('atom-utils')

const Main = require('./main')
const element = require('./decorators/element')
const include = require('./decorators/include')

/**
 * @access private
 */
class MinimapQuickSettingsElement {
  static initClass () {
    include(this, EventsDelegation, SpacePenDSL.Babel)
    return element(this, 'minimap-quick-settings')
  }

  static content () {
    this.div({class: 'select-list popover-list minimap-quick-settings'}, () => {
      this.input({type: 'text', class: 'hidden-input', outlet: 'hiddenInput'})
      this.ol({class: 'list-group mark-active', outlet: 'list'}, () => {
        this.li({class: 'separator', outlet: 'separator'})
        this.li({class: 'code-highlights', outlet: 'codeHighlights'}, 'code-highlights')
        this.li({class: 'absolute-mode', outlet: 'absoluteMode'}, 'absolute-mode')
        this.li({class: 'adjust-absolute-mode-height', outlet: 'adjustAbsoluteModeHeight'}, 'adjust-absolute-mode-height')
      })
      this.div({class: 'btn-group'}, () => {
        this.button({class: 'btn btn-default', outlet: 'onLeftButton'}, 'On Left')
        this.button({class: 'btn btn-default', outlet: 'onRightButton'}, 'On Right')
      })
    })
  }

  createdCallback () {
    this.buildContent()
  }

  setModel (minimap) {
    this.selectedItem = null
    this.minimap = minimap
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()
    this.plugins = {}
    this.itemsActions = new WeakMap()

    let subs = this.subscriptions

    subs.add(Main.onDidAddPlugin(({name, plugin}) => {
      return this.addItemFor(name, plugin)
    }))
    subs.add(Main.onDidRemovePlugin(({name, plugin}) => {
      return this.removeItemFor(name, plugin)
    }))
    subs.add(Main.onDidActivatePlugin(({name, plugin}) => {
      return this.activateItem(name, plugin)
    }))
    subs.add(Main.onDidDeactivatePlugin(({name, plugin}) => {
      return this.deactivateItem(name, plugin)
    }))

    subs.add(atom.commands.add('minimap-quick-settings', {
      'core:move-up': () => {
        this.selectPreviousItem()
      },
      'core:move-down': () => {
        this.selectNextItem()
      },
      'core:move-left': () => {
        atom.config.set('minimap.displayMinimapOnLeft', true)
      },
      'core:move-right': () => {
        atom.config.set('minimap.displayMinimapOnLeft', false)
      },
      'core:cancel': () => {
        this.destroy()
      },
      'core:confirm': () => {
        this.toggleSelectedItem()
      }
    }))

    this.codeHighlights.classList.toggle('active', this.minimap.displayCodeHighlights)

    subs.add(this.subscribeTo(this.codeHighlights, {
      'mousedown': (e) => {
        e.preventDefault()
        atom.config.set('minimap.displayCodeHighlights', !this.minimap.displayCodeHighlights)
      }
    }))

    this.itemsActions.set(this.codeHighlights, () => {
      atom.config.set('minimap.displayCodeHighlights', !this.minimap.displayCodeHighlights)
    })

    subs.add(this.subscribeTo(this.absoluteMode, {
      'mousedown': (e) => {
        e.preventDefault()
        atom.config.set('minimap.absoluteMode', !atom.config.get('minimap.absoluteMode'))
      }
    }))

    this.itemsActions.set(this.absoluteMode, () => {
      atom.config.set('minimap.absoluteMode', !atom.config.get('minimap.absoluteMode'))
    })

    subs.add(this.subscribeTo(this.adjustAbsoluteModeHeight, {
      'mousedown': (e) => {
        e.preventDefault()
        atom.config.set('minimap.adjustAbsoluteModeHeight', !atom.config.get('minimap.adjustAbsoluteModeHeight'))
      }
    }))

    this.itemsActions.set(this.adjustAbsoluteModeHeight, () => {
      atom.config.set('minimap.adjustAbsoluteModeHeight', !atom.config.get('minimap.adjustAbsoluteModeHeight'))
    })

    subs.add(this.subscribeTo(this.hiddenInput, {
      'focusout': (e) => { this.destroy() }
    }))

    subs.add(this.subscribeTo(this.onLeftButton, {
      'mousedown': (e) => {
        e.preventDefault()
        atom.config.set('minimap.displayMinimapOnLeft', true)
      }
    }))

    subs.add(this.subscribeTo(this.onRightButton, {
      'mousedown': (e) => {
        e.preventDefault()
        atom.config.set('minimap.displayMinimapOnLeft', false)
      }
    }))

    subs.add(atom.config.observe('minimap.displayCodeHighlights', (bool) => {
      this.codeHighlights.classList.toggle('active', bool)
    }))

    subs.add(atom.config.observe('minimap.absoluteMode', (bool) => {
      this.absoluteMode.classList.toggle('active', bool)
    }))

    subs.add(atom.config.observe('minimap.adjustAbsoluteModeHeight', (bool) => {
      this.adjustAbsoluteModeHeight.classList.toggle('active', bool)
    }))

    subs.add(atom.config.observe('minimap.displayMinimapOnLeft', (bool) => {
      this.onLeftButton.classList.toggle('selected', bool)
      this.onRightButton.classList.toggle('selected', !bool)
    }))

    this.initList()
  }

  onDidDestroy (callback) {
    return this.emitter.on('did-destroy', callback)
  }

  attach () {
    let workspaceElement = atom.views.getView(atom.workspace)
    workspaceElement.appendChild(this)
    this.hiddenInput.focus()
  }

  destroy () {
    this.emitter.emit('did-destroy')
    this.subscriptions.dispose()
    this.parentNode.removeChild(this)
  }

  initList () {
    this.itemsDisposables = new WeakMap()
    for (let name in Main.plugins) {
      this.addItemFor(name, Main.plugins[name])
    }
  }

  toggleSelectedItem () {
    let fn = this.itemsActions.get(this.selectedItem)
    if (typeof fn === 'function') { fn() }
  }

  selectNextItem () {
    this.selectedItem.classList.remove('selected')
    if ((this.selectedItem.nextSibling != null)) {
      this.selectedItem = this.selectedItem.nextSibling
      if (this.selectedItem.matches('.separator')) {
        this.selectedItem = this.selectedItem.nextSibling
      }
    } else {
      this.selectedItem = this.list.firstChild
    }
    this.selectedItem.classList.add('selected')
  }

  selectPreviousItem () {
    this.selectedItem.classList.remove('selected')
    if ((this.selectedItem.previousSibling != null)) {
      this.selectedItem = this.selectedItem.previousSibling
      if (this.selectedItem.matches('.separator')) {
        this.selectedItem = this.selectedItem.previousSibling
      }
    } else {
      this.selectedItem = this.list.lastChild
    }
    this.selectedItem.classList.add('selected')
  }

  addItemFor (name, plugin) {
    let item = document.createElement('li')
    let action = () => { Main.togglePluginActivation(name) }

    if (plugin.isActive()) { item.classList.add('active') }

    item.textContent = name

    this.itemsActions.set(item, action)
    this.itemsDisposables.set(item, this.addDisposableEventListener(item, 'mousedown', (e) => {
      e.preventDefault()
      action()
    }))

    this.plugins[name] = item
    this.list.insertBefore(item, this.separator)

    if (!(this.selectedItem != null)) {
      this.selectedItem = item
      this.selectedItem.classList.add('selected')
    }
  }

  removeItemFor (name, plugin) {
    try {
      this.list.removeChild(this.plugins[name])
    } catch (error) {}

    delete this.plugins[name]
  }

  activateItem (name, plugin) {
    this.plugins[name].classList.add('active')
  }

  deactivateItem (name, plugin) {
    this.plugins[name].classList.remove('active')
  }
}

module.exports = MinimapQuickSettingsElement.initClass()
