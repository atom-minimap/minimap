{debounce} = require 'underscore-plus'
{CompositeDisposable, Disposable} = require 'event-kit'
{EventsDelegation} = require 'atom-utils'
DOMStylesReader = require './mixins/dom-styles-reader'
CanvasDrawer = require './mixins/canvas-drawer'

MinimapQuickSettingsElement = null

# Public:
class MinimapElement extends HTMLElement
  DOMStylesReader.includeInto(this)
  CanvasDrawer.includeInto(this)
  EventsDelegation.includeInto(this)

  ### Public ###

  displayMinimapOnLeft: false

  #    ##     ##  #######   #######  ##    ##  ######
  #    ##     ## ##     ## ##     ## ##   ##  ##    ##
  #    ##     ## ##     ## ##     ## ##  ##   ##
  #    ######### ##     ## ##     ## #####     ######
  #    ##     ## ##     ## ##     ## ##  ##         ##
  #    ##     ## ##     ## ##     ## ##   ##  ##    ##
  #    ##     ##  #######   #######  ##    ##  ######

  createdCallback: ->
    @subscriptions = new CompositeDisposable
    @initializeContent()

    @subscriptions.add atom.themes.onDidChangeActiveThemes =>
      @invalidateCache()
      @requestForcedUpdate()

    @observeConfig
      'minimap.displayMinimapOnLeft': (displayMinimapOnLeft) =>
        swapPosition = @minimap? and displayMinimapOnLeft isnt @displayMinimapOnLeft
        @displayMinimapOnLeft = displayMinimapOnLeft

        @swapMinimapPosition() if swapPosition

      'minimap.minimapScrollIndicator': (@minimapScrollIndicator) =>
        if @minimapScrollIndicator and not @scrollIndicator?
          @initializeScrollIndicator()
        else if @scrollIndicator?
          @disposeScrollIndicator()

        @requestUpdate() if @attached

      'minimap.displayPluginsControls': (@displayPluginsControls) =>
        if @displayPluginsControls and not @openQuickSettings?
          @initializeOpenQuickSettings()
        else if @openQuickSettings?
          @disposeOpenQuickSettings()

      'minimap.textOpacity': (@textOpacity) =>
        @requestForcedUpdate() if @attached

      'minimap.displayCodeHighlights': (@displayCodeHighlights) =>
        @requestForcedUpdate() if @attached

      'minimap.adjustMinimapWidthToSoftWrap': (@adjustToSoftWrap) =>
        @measureHeightAndWidth() if @attached

      'minimap.useHardwareAcceleration': (@useHardwareAcceleration) =>
        @requestUpdate() if @attached

  attachedCallback: ->
    @subscriptions.add atom.views.pollDocument => @pollDOM()
    @measureHeightAndWidth()
    @attached = true

  detachedCallback: ->
    @attached = false

  attributeChangedCallback: (attrName, oldValue, newValue) ->

  #       ###    ######## ########    ###     ######  ##     ##
  #      ## ##      ##       ##      ## ##   ##    ## ##     ##
  #     ##   ##     ##       ##     ##   ##  ##       ##     ##
  #    ##     ##    ##       ##    ##     ## ##       #########
  #    #########    ##       ##    ######### ##       ##     ##
  #    ##     ##    ##       ##    ##     ## ##    ## ##     ##
  #    ##     ##    ##       ##    ##     ##  ######  ##     ##

  isVisible: -> @offsetWidth > 0 or @offsetHeight > 0

  attach: ->
    return if @attached
    @swapMinimapPosition()
    @attached = true

  attachToLeft: ->
    root = @getTextEditorElementRoot()
    root.insertBefore(this, root.children[0])

  attachToRight: ->
    @getTextEditorElementRoot().appendChild(this)

  swapMinimapPosition: ->
    if @displayMinimapOnLeft
      @attachToLeft()
    else
      @attachToRight()

  detach: ->
    return unless @attached
    return unless @parentNode?
    @parentNode.removeChild(this)

  destroy: ->
    @subscriptions.dispose()
    @detach()

  #     ######   #######  ##    ## ######## ######## ##    ## ########
  #    ##    ## ##     ## ###   ##    ##    ##       ###   ##    ##
  #    ##       ##     ## ####  ##    ##    ##       ####  ##    ##
  #    ##       ##     ## ## ## ##    ##    ######   ## ## ##    ##
  #    ##       ##     ## ##  ####    ##    ##       ##  ####    ##
  #    ##    ## ##     ## ##   ###    ##    ##       ##   ###    ##
  #     ######   #######  ##    ##    ##    ######## ##    ##    ##

  initializeContent: ->
    @initializeCanvas()

    @shadowRoot = @createShadowRoot()

    @shadowRoot.appendChild(@canvas)

    @visibleArea = document.createElement('div')
    @visibleArea.classList.add('minimap-visible-area')
    @shadowRoot.appendChild(@visibleArea)

    @controls = document.createElement('div')
    @controls.classList.add('minimap-controls')
    @shadowRoot.appendChild(@controls)

    elementMousewheel = (e) => @relayMousewheelEvent(e)
    canvasMousedown = (e) => @mousePressedOverCanvas(e)
    visibleAreaMousedown = (e) => @startDrag(e)

    @addEventListener 'mousewheel', elementMousewheel
    @canvas.addEventListener 'mousedown', canvasMousedown
    @visibleArea.addEventListener 'mousedown', visibleAreaMousedown

    @subscriptions.add new Disposable =>
      @removeEventListener 'mousewheel', elementMousewheel
      @canvas.removeEventListener 'mousedown', canvasMousedown
      @visibleArea.removeEventListener 'mousedown', visibleAreaMousedown

  initializeScrollIndicator: ->
    @scrollIndicator = document.createElement('div')
    @scrollIndicator.classList.add 'minimap-scroll-indicator'
    @controls.appendChild(@scrollIndicator)

  disposeScrollIndicator: ->
    @controls.removeChild(@scrollIndicator)
    @scrollIndicator = undefined

  initializeOpenQuickSettings: ->
    return if @openQuickSettings?

    @openQuickSettings = document.createElement('div')
    @openQuickSettings.classList.add 'open-minimap-quick-settings'
    @controls.appendChild(@openQuickSettings)
    @openQuickSettingSubscription = @subscribeTo @openQuickSettings,
      'mousedown': (e) =>
        e.preventDefault()
        e.stopPropagation()

        if @quickSettingsElement?
          @quickSettingsElement.destroy()
          @quickSettingsSubscription.dispose()
        else
          MinimapQuickSettingsElement ?= require './minimap-quick-settings-element'
          @quickSettingsElement = new MinimapQuickSettingsElement
          @quickSettingsElement.setModel(this)
          @quickSettingsSubscription = @quickSettingsElement.onDidDestroy =>
            @quickSettingsElement = null

          @quickSettingsElement.attach()
          {top, left, right} = @canvas.getBoundingClientRect()
          @quickSettingsElement.style.top = top + 'px'

          if @displayMinimapOnLeft
            @quickSettingsElement.style.left = (right) + 'px'
          else
            @quickSettingsElement.style.left = (left - @quickSettingsElement.clientWidth) + 'px'

  disposeOpenQuickSettings: ->
    return unless @openQuickSettings?
    @controls.removeChild(@openQuickSettings)
    @openQuickSettingSubscription.dispose()
    @openQuickSettings = undefined

  getTextEditor: -> @minimap.getTextEditor()

  getTextEditorElement: ->
    @editorElement ?= atom.views.getView(@getTextEditor())

  getTextEditorElementRoot: ->
    editorElement = @getTextEditorElement()

    editorElement.shadowRoot ? editorElement

  getDummyDOMRoot: (shadowRoot) ->
    if shadowRoot
      @getTextEditorElementRoot()
    else
      @getTextEditorElement()

  #    ##     ##  #######  ########  ######## ##
  #    ###   ### ##     ## ##     ## ##       ##
  #    #### #### ##     ## ##     ## ##       ##
  #    ## ### ## ##     ## ##     ## ######   ##
  #    ##     ## ##     ## ##     ## ##       ##
  #    ##     ## ##     ## ##     ## ##       ##
  #    ##     ##  #######  ########  ######## ########

  getModel: -> @minimap

  setModel: (@minimap) ->
    @subscriptions.add @minimap.onDidChangeScrollTop => @requestUpdate()
    @subscriptions.add @minimap.onDidChangeScrollLeft => @requestUpdate()
    @subscriptions.add @minimap.onDidDestroy => @destroy()
    @subscriptions.add @minimap.onDidChangeConfig =>
      @requestForcedUpdate() if @attached
    @subscriptions.add @minimap.onDidChange (change) =>
      @pendingChanges.push(change)
      @requestUpdate()

    @minimap

  #    ##     ## ########  ########     ###    ######## ########
  #    ##     ## ##     ## ##     ##   ## ##      ##    ##
  #    ##     ## ##     ## ##     ##  ##   ##     ##    ##
  #    ##     ## ########  ##     ## ##     ##    ##    ######
  #    ##     ## ##        ##     ## #########    ##    ##
  #    ##     ## ##        ##     ## ##     ##    ##    ##
  #     #######  ##        ########  ##     ##    ##    ########

  requestUpdate: ->
    return if @frameRequested

    @frameRequested = true
    requestAnimationFrame =>
      @update()
      @frameRequested = false

  requestForcedUpdate: ->
    @offscreenFirstRow = null
    @offscreenLastRow = null
    @requestUpdate()

  update: ->
    return unless @attached and @isVisible() and not @minimap.isDestroyed()

    if @adjustToSoftWrap and @marginRight?
      @style.marginRight = @marginRight + 'px'
    else
      @style.marginRight = null

    visibleAreaLeft = @minimap.getTextEditorScaledScrollLeft()
    visibleAreaTop = @minimap.getTextEditorScaledScrollTop() - @minimap.getScrollTop()

    @applyStyles @visibleArea,
      width: @clientWidth + 'px'
      height: @minimap.getTextEditorScaledHeight() + 'px'
      transform: @makeTranslate(visibleAreaLeft, visibleAreaTop)

    @applyStyles @controls,
      width: Math.min(@canvas.width / devicePixelRatio, @width) + 'px'

    canvasTop = @minimap.getFirstVisibleScreenRow() * @minimap.getLineHeight() - @minimap.getScrollTop()

    canvasTransform = @makeTranslate(0, canvasTop)
    canvasTransform += " " + @makeScale(1 / devicePixelRatio) if devicePixelRatio isnt 1
    @applyStyles @canvas, transform: canvasTransform

    if @minimapScrollIndicator and @minimap.canScroll() and not @scrollIndicator
      @initializeScrollIndicator()

    if @scrollIndicator?
      editorHeight = @getTextEditor().getHeight()
      indicatorHeight = editorHeight * (editorHeight / @minimap.getHeight())
      indicatorScroll = (editorHeight - indicatorHeight) * @minimap.getCapedTextEditorScrollRatio()

      @applyStyles @scrollIndicator,
        height: indicatorHeight + 'px'
        transform: @makeTranslate(0, indicatorScroll)

      @disposeScrollIndicator() if not @minimap.canScroll()

    @updateCanvas()

  setDisplayCodeHighlights: (@displayCodeHighlights) ->
    @requestForcedUpdate() if @attached

  pollDOM: ->
    @measureHeightAndWidth(false) if @isVisible()

  checkForVisibilityChange: ->
    if @isVisible()
      if @wasVisible
        false
      else
        @wasVisible = true
    else
      if @wasVisible
        @wasVisible = false
        true
      else
        @wasVisible = false

  measureHeightAndWidth: (forceUpdate=true) ->
    wasResized = @width isnt @clientWidth or @height isnt @clientHeight
    visibilityChanged = @checkForVisibilityChange()

    @height = @clientHeight
    @width = @clientWidth
    canvasWidth = @width

    @requestForcedUpdate() if wasResized or visibilityChanged or forceUpdate

    return unless @isVisible()

    if wasResized or forceUpdate
      if @adjustToSoftWrap
        lineLength = atom.config.get('editor.preferredLineLength')
        softWrap = atom.config.get('editor.softWrap')
        softWrapAtPreferredLineLength = atom.config.get('editor.softWrapAtPreferredLineLength')
        width = lineLength * @minimap.getCharWidth()

        if softWrap and softWrapAtPreferredLineLength and lineLength and width < @width
          @marginRight = width - @width
          canvasWidth = width
        else
          @marginRight = null
      else
        delete @marginRight

      if canvasWidth isnt @canvas.width or @height isnt @canvas.height
        @canvas.width = canvasWidth * devicePixelRatio
        @canvas.height = (@height + @minimap.getLineHeight()) * devicePixelRatio

  #    ######## ##     ## ######## ##    ## ########  ######
  #    ##       ##     ## ##       ###   ##    ##    ##    ##
  #    ##       ##     ## ##       ####  ##    ##    ##
  #    ######   ##     ## ######   ## ## ##    ##     ######
  #    ##        ##   ##  ##       ##  ####    ##          ##
  #    ##         ## ##   ##       ##   ###    ##    ##    ##
  #    ########    ###    ######## ##    ##    ##     ######

  observeConfig: (configs={}) ->
    for config, callback of configs
      @subscriptions.add atom.config.observe config, callback

  mousePressedOverCanvas: ({which, pageY, target}) ->
    return if which isnt 1

    y = pageY - target.getBoundingClientRect().top
    row = Math.floor(y / @minimap.getLineHeight()) + @minimap.getFirstVisibleScreenRow()

    scrollTop = row * @minimap.textEditor.getLineHeightInPixels() - @minimap.textEditor.getHeight() / 2

    from = @minimap.textEditor.getScrollTop()
    to = scrollTop
    step = (now) =>
      @minimap.textEditor.setScrollTop(now)
    if atom.config.get('minimap.scrollAnimation')
      duration = 300
    else
      duration = 0

    @animate(from: from, to: to, duration: duration, step: step)

  relayMousewheelEvent: (e) =>
    editorElement = atom.views.getView(@minimap.textEditor)

    editorElement.component.onMouseWheel(e)

  #    ########    ####    ########
  #    ##     ##  ##  ##   ##     ##
  #    ##     ##   ####    ##     ##
  #    ##     ##  ####     ##     ##
  #    ##     ## ##  ## ## ##     ##
  #    ##     ## ##   ##   ##     ##
  #    ########   ####  ## ########

  startDrag: ({which, pageY}) ->
    return if which isnt 1
    {top} = @visibleArea.getBoundingClientRect()
    {top: offsetTop} = @getBoundingClientRect()

    dragOffset = pageY - top

    initial = {dragOffset, offsetTop}

    mousemoveHandler = (e) => @drag(e, initial)
    mouseupHandler = (e) => @endDrag(e, initial)

    document.body.addEventListener('mousemove', mousemoveHandler)
    document.body.addEventListener('mouseup', mouseupHandler)
    document.body.addEventListener('mouseout', mouseupHandler)

    @dragSubscription = new Disposable =>
      document.body.removeEventListener('mousemove', mousemoveHandler)
      document.body.removeEventListener('mouseup', mouseupHandler)
      document.body.removeEventListener('mouseout', mouseupHandler)

  drag: (e, initial) ->
    return if e.which isnt 1
    y = e.pageY - initial.offsetTop - initial.dragOffset

    ratio = y / (@minimap.getVisibleHeight() - @minimap.getTextEditorScaledHeight())

    @minimap.textEditor.setScrollTop(ratio * @minimap.getTextEditorMaxScrollTop())

  endDrag: (e, initial) ->
    @dragSubscription.dispose()

  #     ######   ######   ######
  #    ##    ## ##    ## ##    ##
  #    ##       ##       ##
  #    ##        ######   ######
  #    ##             ##       ##
  #    ##    ## ##    ## ##    ##
  #     ######   ######   ######

  applyStyles: (element, styles) ->
    cssText = ''

    for property,value of styles
      cssText += "#{property}: #{value}; "

    element.style.cssText = cssText

  makeTranslate: (x=0,y=0) ->
    if @useHardwareAcceleration
      "translate3d(#{x}px, #{y}px, 0)"
    else
      "translate(#{x}px, #{y}px)"

  makeScale: (x=0,y=x) ->
    if @useHardwareAcceleration
      "scale3d(#{x}, #{y}, 1)"
    else
      "scale(#{x}, #{y})"

  animate: ({from, to, duration, step}) ->
    start = new Date()

    swing = (progress) ->
      return 0.5 - Math.cos( progress * Math.PI ) / 2

    update = ->
      passed = new Date() - start
      if duration == 0
        progress = 1
      else
        progress = passed / duration
      progress = 1 if progress > 1
      delta = swing(progress)
      step(from + (to-from)*delta)
      requestAnimationFrame(update) if progress < 1

    update()

#    ######## ##       ######## ##     ## ######## ##    ## ########
#    ##       ##       ##       ###   ### ##       ###   ##    ##
#    ##       ##       ##       #### #### ##       ####  ##    ##
#    ######   ##       ######   ## ### ## ######   ## ## ##    ##
#    ##       ##       ##       ##     ## ##       ##  ####    ##
#    ##       ##       ##       ##     ## ##       ##   ###    ##
#    ######## ######## ######## ##     ## ######## ##    ##    ##

module.exports = MinimapElement = document.registerElement 'atom-text-editor-minimap', prototype: MinimapElement.prototype

MinimapElement.registerViewProvider = ->
  atom.views.addViewProvider require('./minimap'), (model) ->
    element = new MinimapElement
    element.setModel(model)
    element
