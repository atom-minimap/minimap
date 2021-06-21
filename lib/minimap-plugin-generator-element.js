"use strict"

import { dasherize } from "./deps/underscore-plus"
import { getHomeDirectory, existsSync } from "fs-plus"
import path from "path"
import { BufferedProcess } from "atom"
import element from "./decorators/element"

/** @access private */
class MinimapPluginGeneratorElement {
  static initClass() {
    this.registerCommands()
    return element(this, "minimap-plugin-generator")
  }

  static registerCommands() {
    atom.commands.add("minimap-plugin-generator", {
      "core:confirm"() {
        this.confirm()
      },
      "core:cancel"() {
        this.detach()
      },
    })
  }

  createdCallback() {
    this.previouslyFocusedElement = null
    this.mode = null

    this.modal = document.createElement("atom-panel")

    this.modal.classList.add("minimap-plugin-generator")
    this.modal.classList.add("modal")
    this.modal.classList.add("overlay")
    this.modal.classList.add("from-top")

    this.editor = atom.workspace.buildTextEditor({ mini: true })
    this.editorElement = atom.views.getView(this.editor)

    this.error = document.createElement("div")
    this.error.classList.add("error")

    this.message = document.createElement("div")
    this.message.classList.add("message")

    this.modal.appendChild(this.editorElement)
    this.modal.appendChild(this.error)
    this.modal.appendChild(this.message)

    this.appendChild(this.modal)
  }

  attachedCallback() {
    this.previouslyFocusedElement = document.activeElement
    this.message.textContent = "Enter plugin path"
    this.setPathText("my-minimap-plugin")
    this.editorElement.focus()
  }

  attach() {
    atom.views.getView(atom.workspace).appendChild(this)
  }

  setPathText(placeholderName, rangeToSelect) {
    if (!rangeToSelect) {
      rangeToSelect = [0, placeholderName.length]
    }

    const packagesDirectory = getPackagesDirectory()

    this.editor.setText(path.join(packagesDirectory, placeholderName))

    const pathLength = this.editor.getText().length
    const endOfDirectoryIndex = pathLength - placeholderName.length

    this.editor.setSelectedBufferRange([
      [0, endOfDirectoryIndex + rangeToSelect[0]],
      [0, endOfDirectoryIndex + rangeToSelect[1]],
    ])
  }

  detach() {
    if (!this.parentNode) {
      return
    }

    if (this.previouslyFocusedElement) {
      this.previouslyFocusedElement.focus()
    }

    this.parentNode.removeChild(this)
  }

  confirm() {
    if (this.validPackagePath()) {
      this.removeChild(this.modal)
      this.message.innerHTML = `
        <span class='loading loading-spinner-tiny inline-block'></span>
        Generate plugin at <span class="text-primary">${this.getPackagePath()}</span>
      `

      this.createPackageFiles(() => {
        const packagePath = this.getPackagePath()
        atom.open({ pathsToOpen: [packagePath], devMode: atom.config.get("minimap.createPluginInDevMode") })

        this.message.innerHTML = '<span class="text-success">Plugin successfully generated, opening it now...</span>'

        setTimeout(() => {
          this.detach()
        }, 2000)
      })
    }
  }

  getPackagePath() {
    const packagePath = this.editor.getText()
    const packageName = dasherize(path.basename(packagePath))

    return path.join(path.dirname(packagePath), packageName)
  }

  validPackagePath() {
    if (existsSync(this.getPackagePath())) {
      this.error.textContent = `Path already exists at '${this.getPackagePath()}'`
      this.error.style.display = "block"
      return false
    } else {
      return true
    }
  }

  initPackage(packagePath, callback) {
    const templatePath = path.resolve(__dirname, path.join("..", "templates", `plugin-${this.template}`))
    runCommand(atom.packages.getApmPath(), ["init", "-p", `${packagePath}`, "--template", templatePath], callback)
  }

  createPackageFiles(callback) {
    const packagePath = this.getPackagePath()

    if (isStoredInDotAtom(packagePath)) {
      this.initPackage(packagePath, () => {
        installPackage(packagePath, callback)
      })
    } else {
      this.initPackage(packagePath, () => {
        linkPackage(packagePath, () => {
          installPackage(packagePath, callback)
        })
      })
    }
  }
}

const minimapPluginGeneratorElement = MinimapPluginGeneratorElement.initClass()
export default minimapPluginGeneratorElement

function linkPackage(packagePath, callback) {
  const args = ["link"]
  if (atom.config.get("minimap.createPluginInDevMode")) {
    args.push("--dev")
  }
  args.push(packagePath.toString())

  runCommand(atom.packages.getApmPath(), args, callback)
}

function installPackage(packagePath, callback) {
  const args = ["install"]

  runCommand(atom.packages.getApmPath(), args, callback, { cwd: packagePath })
}

function getPackagesDirectory() {
  return atom.config.get("core.projectHome") || process.env.ATOM_REPOS_HOME || path.join(getHomeDirectory(), "github")
}

function isStoredInDotAtom(packagePath) {
  const packagesPath = path.join(atom.getConfigDirPath(), "packages", path.sep)
  if (packagePath.indexOf(packagesPath) === 0) {
    return true
  }

  const devPackagesPath = path.join(atom.getConfigDirPath(), "dev", "packages", path.sep)

  return packagePath.indexOf(devPackagesPath) === 0
}

function runCommand(command, args, exit, options = {}) {
  return new BufferedProcess({ command, args, exit, options })
}
