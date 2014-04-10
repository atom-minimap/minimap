{Emitter} = require 'emissary'
Debug = require './mixins/debug'

###
  Container-box - Minimap-editor
###
module.exports =
class MinimapBlock
  Emitter.includeInto(this)
  Debug.includeInto(this)

  x: 0
  y: 0
  width: 0
  height: 0

  offsetX: 0
  offsetY: 0

  scrollY: 0
  scrollX: 0

  scrollWidth: 0
  scrollHeight: 0

  scaleX: 1
  scaleY: 1

  box: null

  constructor: () ->
    @box = new MinimapBox()
    @on 'scrollX', (x) => @box.setOffsetX x
    @on 'scrollY', (y) => @box.setOffsetY y

  getBox: -> @box

  resetScrollXY: ->
    @scrollX = 0
    @scrollY = 0

  setScale: (x = 0.2, y = 0.16) ->
    @scaleX = x
    @scaleY = y
    @emit 'scale', @scaleX, @scaleY
    @log 'scale', @scaleX, @scaleY

  resetScale: (x = 1, y = 1) ->
    @scaleX = x
    @scaleY = y
    @emit 'rest-scale', @scaleX, @scaleY
    @log 'reset-scale', @scaleX, @scaleY

  setX: (@x = 0) ->
    @emit 'xy', @x, @y
    @log 'x', @x

  setY: (@y = 0) ->
    @emit 'xy', @x, @y
    @log 'y', @y

  setOffsetX: (@offsetX = 0) ->
    @emit 'offsetX', @offsetX
    @log 'offsetX', @offsetX

  setOffsetY: (@offsetY = 0) ->
    @emit 'offsetY', @offsetY
    @log 'offsetY', @offsetY

###
  Overlayer-box - Minimap-Overlayer
###
class MinimapBox
  Emitter.includeInto(this)
  Debug.includeInto(this)

  x: 0
  y: 0

  offsetX: 0
  offsetY: 0

  width: 0
  height: 0

  setWidth: (w = 0) ->
    @width = w
    @emit 'width', @width
    @log 'box width', @width

  setHeight: (h = 0) ->
    @height = h
    @emit 'height', @height
    @log 'box height', @height

  setX: (@x = 0) ->
    @emit 'x', @offsetX + @x
    @log 'box x', @offsetX + @x

  setY: (@y = 0) ->
    @emit 'y', @offsetY + @y
    @log 'box y', @offsetY + @y

  setOffsetX: (@offsetX = 0) ->
    @emit 'x', @offsetX + @x
    @log 'box x', @offsetX + @x

  setOffsetY: (@offsetY = 0) ->
    @emit 'y', @offsetY + @y
    @log 'box y', @offsetY + @y

  getCenter: ->
    {
      x: @x + @offsetX + @width / 2
      y: @y + @offsetY + @height / 2
    }

