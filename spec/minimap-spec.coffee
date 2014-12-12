fs = require 'fs-plus'
{TextEditor} = require 'atom'
Minimap = require '../lib/minimap'

describe 'Minimap', ->
  [editor, minimap, largeSample, smallSample] = []

