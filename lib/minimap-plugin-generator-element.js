'use strict'

const _ = require('underscore-plus')
const fs = require('fs-plus')
const path = require('path')
const {BufferedProcess} = require('atom')
const element = require('./decorators/element')

/**
 * @access private
 */
class MinimapPluginGeneratorElement {
  static initClass () {
    this.registerCommands()
    return element(this, 'minimap-plugin-generator')
  }

  static registerCommands () {
    atom.commands.add('minimap-plugin-generator', {
      'core:confirm' () { this.confirm() },
      'core:cancel' () { this.detach() }
    })
  }

  createdCallback () {
    this.previouslyFocusedElement = null
    this.mode = null

    this.modal = document.createElement('atom-panel')

    this.modal.classList.add('minimap-plugin-generator')
    this.modal.classList.add('modal')
    this.modal.classList.add('overlay')
    this.modal.classList.add('from-top')

    this.editor = atom.workspace.buildTextEditor({mini: true})
    this.editorElement = atom.views.getView(this.editor)

    this.error = document.createElement('div')
    this.error.classList.add('error')

    this.message = document.createElement('div')
    this.message.classList.add('message')

    this.modal.appendChild(this.editorElement)
    this.modal.appendChild(this.error)
    this.modal.appendChild(this.message)

    this.appendChild(this.modal)
  }

  attachedCallback () {
    this.previouslyFocusedElement = document.activeElement
    this.message.textContent = 'Enter plugin path'
    this.setPathText('my-minimap-plugin')
    this.editorElement.focus()
  }

  attach () {
    atom.views.getView(atom.workspace).appendChild(this)
  }

  setPathText (placeholderName, rangeToSelect) {
    if (!rangeToSelect) { rangeToSelect = [0, placeholderName.length] }

    let packagesDirectory = this.getPackagesDirectory()

    this.editor.setText(path.join(packagesDirectory, placeholderName))

    let pathLength = this.editor.getText().length
    let endOfDirectoryIndex = pathLength - placeholderName.length

    this.editor.setSelectedBufferRange([
      [0, endOfDirectoryIndex + rangeToSelect[0]],
      [0, endOfDirectoryIndex + rangeToSelect[1]]
    ])
  }

  detach () {
    if (!this.parentNode) { return }

    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus()
    }

    this.parentNode.removeChild(this)
  }

  confirm () {
    if (this.validPackagePath()) {
      this.removeChild(this.modal)
      this.message.innerHTML = `
        <span class='loading loading-spinner-tiny inline-block'></span>
        Generate plugin at <span class="text-primary">${this.getPackagePath()}</span>
      `

      this.createPackageFiles(() => {
        let packagePath = this.getPackagePath()
        atom.open({pathsToOpen: [packagePath], devMode: atom.config.get('minimap.createPluginInDevMode')})

        this.message.innerHTML = '<span class="text-success">Plugin successfully generated, opening it now...</span>'

        setTimeout(() => { this.detach() }, 2000)
      })
    }
  }

  getPackagePath () {
    let packagePath = this.editor.getText()
    let packageName = _.dasherize(path.basename(packagePath))

    return path.join(path.dirname(packagePath), packageName)
  }

  getPackagesDirectory () {
    return atom.config.get('core.projectHome') ||
           process.env.ATOM_REPOS_HOME ||
           path.join(fs.getHomeDirectory(), 'github')
  }

  validPackagePath () {
    if (fs.existsSync(this.getPackagePath())) {
      this.error.textContent = `Path already exists at '${this.getPackagePath()}'`
      this.error.style.display = 'block'
      return false
    } else {
      return true
    }
  }

  initPackage (packagePath, callback) {
    let templatePath = path.resolve(__dirname, path.join('..', 'templates', `plugin-${this.template}`))
    this.runCommand(atom.packages.getApmPath(), ['init', '-p', `${packagePath}`, '--template', templatePath], callback)
  }

  linkPackage (packagePath, callback) {
    let args = ['link']
    if (atom.config.get('minimap.createPluginInDevMode')) { args.push('--dev') }
    args.push(packagePath.toString())

    this.runCommand(atom.packages.getApmPath(), args, callback)
  }

  installPackage (packagePath, callback) {
    let args = ['install']

    this.runCommand(atom.packages.getApmPath(), args, callback, {cwd: packagePath})
  }

  isStoredInDotAtom (packagePath) {
    let packagesPath = path.join(atom.getConfigDirPath(), 'packages', path.sep)
    if (packagePath.indexOf(packagesPath) === 0) { return true }

    let devPackagesPath = path.join(atom.getConfigDirPath(), 'dev', 'packages', path.sep)

    return packagePath.indexOf(devPackagesPath) === 0
  }

  createPackageFiles (callback) {
    let packagePath = this.getPackagePath()

    if (this.isStoredInDotAtom(packagePath)) {
      this.initPackage(packagePath, () => {
        this.installPackage(packagePath, callback)
      })
    } else {
      this.initPackage(packagePath, () => {
        this.linkPackage(packagePath, () => {
          this.installPackage(packagePath, callback)
        })
      })
    }
  }

  runCommand (command, args, exit, options = {}) {
    return new BufferedProcess({command, args, exit, options})
  }
}

module.exports = MinimapPluginGeneratorElement.initClass()
