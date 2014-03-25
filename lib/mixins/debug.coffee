Mixin = require 'mixto'

module.exports =
class Debug extends Mixin
  log: (args...) ->
    console.log.apply(console, args) if @inDevMode()

  startBench: ->
    @benchmarkTimes = [new Date] if @inDevMode()

  endBench: (label) ->
    if @inDevMode()
      @markIntermediateTime(label)
      @benchmarkTimes = null

      @log('------------------------------------')

  logIntermediateTime: (label) ->
    if @inDevMode()
      time = new Date
      firstTime = @benchmarkTimes[0]
      lastIndex = @benchmarkTimes.length - 1

      results = "#{time - firstTime}ms"

      if lastIndex isnt 0
        lastTime = @benchmarkTimes[lastIndex]
        results += " (#{time - lastTime}ms)"

      @log "#{label}: #{results}"
      time

  markIntermediateTime: (label) ->
    if @inDevMode()
      time = @logIntermediateTime(label)
      @benchmarkTimes.push(time)

  inDevMode: -> atom.inDevMode()
