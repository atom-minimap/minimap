path = require 'path'
_ = require 'underscore-plus'
{$, BufferedProcess, TextEditorView, View} = require 'atom'
fs = require 'fs-plus'

module.exports =
class MinimapPluginGeneratorView extends View
  previouslyFocusedElement: null
  mode: null

  @content: ->
    @div class: 'minimap-plugin-generator overlay from-top', =>
      @subview 'miniEditor', new TextEditorView(mini: true)
      @div class: 'error', outlet: 'error'
      @div class: 'message', outlet: 'message'

  initialize: ->
    @miniEditor.hiddenInput.on 'focusout', => @detach()
    @on 'core:confirm', => @confirm()
    @on 'core:cancel', => @detach()
    @attach('plugin')

  attach: (@mode) ->
    @previouslyFocusedElement = $(':focus')
    @message.text("Enter #{mode} path")
    atom.workspaceView.append(this)
    @setPathText("my-minimap-plugin")
    @miniEditor.focus()

  setPathText: (placeholderName, rangeToSelect) ->
    {editor} = @miniEditor
    rangeToSelect ?= [0, placeholderName.length]
    packagesDirectory = @getPackagesDirectory()
    editor.setText(path.join(packagesDirectory, placeholderName))
    pathLength = editor.getText().length
    endOfDirectoryIndex = pathLength - placeholderName.length
    editor.setSelectedBufferRange([[0, endOfDirectoryIndex + rangeToSelect[0]], [0, endOfDirectoryIndex + rangeToSelect[1]]])

  detach: ->
    return unless @hasParent()
    @previouslyFocusedElement?.focus()
    super

  confirm: ->
    if @validPackagePath()
      @createPackageFiles =>
        packagePath = @getPackagePath()
        atom.open(pathsToOpen: [packagePath])
        @detach()

  getPackagePath: ->
    packagePath = @miniEditor.getText()
    packageName = _.dasherize(path.basename(packagePath))
    path.join(path.dirname(packagePath), packageName)

  getPackagesDirectory: ->
    atom.config.get('core.projectHome') or
      process.env.ATOM_REPOS_HOME or
      path.join(fs.getHomeDirectory(), 'github')

  validPackagePath: ->
    if fs.existsSync(@getPackagePath())
      @error.text("Path already exists at '#{@getPackagePath()}'")
      @error.show()
      false
    else
      true

  initPackage: (packagePath, callback) ->
    templatePath = path.resolve __dirname, path.join('..','templates','plugin')
    @runCommand(atom.packages.getApmPath(), ['init', "-p", "#{packagePath}", "--template", templatePath], callback)

  linkPackage: (packagePath, callback) ->
    args = ['link']
    args.push('--dev') if atom.config.get('package-generator.createInDevMode')
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
