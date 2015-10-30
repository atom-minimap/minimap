beforeEach ->
  unless atom.workspace.buildTextEditor?
    {TextEditor} = require 'atom'
    atom.workspace.buildTextEditor = (opts) -> new TextEditor(opts)
