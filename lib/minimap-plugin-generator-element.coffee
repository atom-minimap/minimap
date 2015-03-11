_ = require 'underscore-plus'
fs = require 'fs-plus'
path = require 'path'
{TextEditor, BufferedProcess} = require 'atom'
{CompositeDisposable} = require 'event-kit'

# Internal: The {MinimapPluginGeneratorElement} is used whenever the user
# triggers the `minimap:generate-plugin` command.
module.exports =
class MinimapPluginGeneratorElement extends HTMLElement
  previouslyFocusedElement: null
  mode: null

  createdCallback: ->
    @classList.add('minimap-plugin-generator')
    @classList.add('overlay')
    @classList.add('from-top')

    @editor = new TextEditor(mini: true)
    @editorElement = atom.views.getView(@editor)

    @error = document.createElement('div')
    @error.classList.add('error')

    @message = document.createElement('div')
    @message.classList.add('message')

    @appendChild(@editorElement)
    @appendChild(@error)
    @appendChild(@message)

  attachedCallback: ->
    @previouslyFocusedElement = document.activeElement
    @message.textContent = "Enter plugin path"
    @setPathText("my-minimap-plugin")
    @editorElement.focus()

  attach: ->
    atom.views.getView(atom.workspace).appendChild(this)

  setPathText: (placeholderName, rangeToSelect) ->
    rangeToSelect ?= [0, placeholderName.length]
    packagesDirectory = @getPackagesDirectory()
    @editor.setText(path.join(packagesDirectory, placeholderName))
    pathLength = @editor.getText().length
    endOfDirectoryIndex = pathLength - placeholderName.length
    @editor.setSelectedBufferRange([[0, endOfDirectoryIndex + rangeToSelect[0]], [0, endOfDirectoryIndex + rangeToSelect[1]]])

  detach: ->
    return unless @parentNode?
    @previouslyFocusedElement?.focus()
    @parentNode.removeChild(this)

  confirm: ->
    if @validPackagePath()
      @removeChild(@editorElement)
      @message.innerHTML = """
        <span class='loading loading-spinner-tiny inline-block'></span>
        Generate plugin at <span class="text-primary">#{@getPackagePath()}</span>
      """
      @createPackageFiles =>
        packagePath = @getPackagePath()
        atom.open(pathsToOpen: [packagePath], devMode: atom.config.get('minimap.createPluginInDevMode'))

        @message.innerHTML = """
          <span class="text-success">Plugin successfully generated, opening it now...</span>
        """

        setTimeout =>
          @detach()
        , 2000

  getPackagePath: ->
    packagePath = @editor.getText()
    packageName = _.dasherize(path.basename(packagePath))
    path.join(path.dirname(packagePath), packageName)

  getPackagesDirectory: ->
    atom.config.get('core.projectHome') or
      process.env.ATOM_REPOS_HOME or
      path.join(fs.getHomeDirectory(), 'github')

  validPackagePath: ->
    if fs.existsSync(@getPackagePath())
      @error.textContent = "Path already exists at '#{@getPackagePath()}'"
      @error.style.display = 'block'
      false
    else
      true

  initPackage: (packagePath, callback) ->
    templatePath = path.resolve __dirname, path.join('..','templates','plugin')
    @runCommand(atom.packages.getApmPath(), ['init', "-p", "#{packagePath}", "--template", templatePath], callback)

  linkPackage: (packagePath, callback) ->
    args = ['link']
    args.push('--dev') if atom.config.get('minimap.createPluginInDevMode')
    args.push packagePath.toString()

    @runCommand(atom.packages.getApmPath(), args, callback)

  installPackage: (packagePath, callback) ->
    args = ['install']

    @runCommand(atom.packages.getApmPath(), args, callback, cwd: packagePath)

  isStoredInDotAtom: (packagePath) ->
    packagesPath = path.join(atom.getConfigDirPath(), 'packages', path.sep)
    return true if packagePath.indexOf(packagesPath) is 0

    devPackagesPath = path.join(atom.getConfigDirPath(), 'dev', 'packages', path.sep)
    packagePath.indexOf(devPackagesPath) is 0

  createPackageFiles: (callback) ->
    packagePath = @getPackagePath()
    packagesDirectory = @getPackagesDirectory()

    if @isStoredInDotAtom(packagePath)
      @initPackage packagePath, =>
        @installPackage packagePath, callback
    else
      @initPackage packagePath, =>
        @linkPackage packagePath, =>
          @installPackage packagePath, callback

  runCommand: (command, args, exit, options={}) ->
    new BufferedProcess({command, args, exit, options})


module.exports = MinimapPluginGeneratorElement = document.registerElement 'minimap-plugin-generator', prototype: MinimapPluginGeneratorElement.prototype

atom.commands.add 'minimap-plugin-generator', {
  'core:confirm': -> @confirm()
  'core:cancel': -> @detach()
}
