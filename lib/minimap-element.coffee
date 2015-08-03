{debounce} = require 'underscore-plus'
{CompositeDisposable, Disposable} = require 'event-kit'
{EventsDelegation} = require 'atom-utils'
DOMStylesReader = require './mixins/dom-styles-reader'
CanvasDrawer = require './mixins/canvas-drawer'

MinimapQuickSettingsElement = null

# Public: The {MinimapElement} is the view meant to render a {Minimap} instance
# in the DOM.
#
# You can retrieve the {MinimapElement} associated to a {Minimap} as
# demonstrated below:
#
# ```coffee
# minimapElement = atom.views.getView(minimap)
# ```
#
# Note that most interactions with the Minimap package is done through the
# {Minimap} model so you should never have to access {MinimapElement} instances.
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

  # Internal: DOM callback invoked when a new {MinimapElement} is created.
  createdCallback: ->
    @subscriptions = new CompositeDisposable
    @initializeContent()

    @observeConfig
      'minimap.displayMinimapOnLeft': (displayMinimapOnLeft) =>
        swapPosition = @minimap? and displayMinimapOnLeft isnt @displayMinimapOnLeft
        @displayMinimapOnLeft = displayMinimapOnLeft

        @swapMinimapPosition()

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

      'minimap.absoluteMode': (@absoluteMode) =>
        @classList.toggle('absolute', @absoluteMode)

      'editor.preferredLineLength': => @requestUpdate() if @attached

      'editor.softWrap': => @requestUpdate() if @attached

      'editor.softWrapAtPreferredLineLength': => @requestUpdate() if @attached


  # Internal: DOM callback invoked when a new {MinimapElement} is attached
  # to the DOM.
  attachedCallback: ->
    @subscriptions.add atom.views.pollDocument => @pollDOM()
    @measureHeightAndWidth()
    @attached = true

    # Uses of `atom.styles.onDidAddStyleElement` instead of
    # `atom.themes.onDidChangeActiveThemes`.
    # Why?
    # Currently, The styleElement will be removed first,
    # and then re-add. So the `change` event has not be triggered.
    @subscriptions.add atom.styles.onDidAddStyleElement =>
      @invalidateCache()
      @requestForcedUpdate()

  # Internal: DOM callback invoked when a new {MinimapElement} is detached
  # from the DOM.
  detachedCallback: ->
    @attached = false

  #       ###    ######## ########    ###     ######  ##     ##
  #      ## ##      ##       ##      ## ##   ##    ## ##     ##
  #     ##   ##     ##       ##     ##   ##  ##       ##     ##
  #    ##     ##    ##       ##    ##     ## ##       #########
  #    #########    ##       ##    ######### ##       ##     ##
  #    ##     ##    ##       ##    ##     ## ##    ## ##     ##
  #    ##     ##    ##       ##    ##     ##  ######  ##     ##

  # Returns `true` if the {MinimapElement} is currently visible on screen.
  #
  # Returns a {Boolean}.
  isVisible: -> @offsetWidth > 0 or @offsetHeight > 0

  # Attaches the {MinimapElement} to the DOM.
  #
  # The position at which the element is attached is defined by the
  # `displayMinimapOnLeft` setting.
  attach: ->
    return if @attached
    @getTextEditorElementRoot().appendChild(this)
    @swapMinimapPosition()
    @attached = true

  # Attaches the {MinimapElement} to the left of the target {TextEditorElement}.
  attachToLeft: ->
    @classList.add('left')

  # Attaches the {MinimapElement} to the right of the target
  # {TextEditorElement}.
  attachToRight: ->
    @classList.remove('left')

  # Swaps the {MinimapElement} position based on the value of the
  # `displayMinimapOnLeft` setting.
  swapMinimapPosition: ->
    if @displayMinimapOnLeft
      @attachToLeft()
    else
      @attachToRight()

  # Detaches the {MinimapElement} from the DOM.
  detach: ->
    return unless @attached
    return unless @parentNode?
    @parentNode.removeChild(this)

  # Destroys this {MinimapElement}.
  destroy: ->
    @subscriptions.dispose()
    @detach()
    @minimap = null

  #     ######   #######  ##    ## ######## ######## ##    ## ########
  #    ##    ## ##     ## ###   ##    ##    ##       ###   ##    ##
  #    ##       ##     ## ####  ##    ##    ##       ####  ##    ##
  #    ##       ##     ## ## ## ##    ##    ######   ## ## ##    ##
  #    ##       ##     ## ##  ####    ##    ##       ##  ####    ##
  #    ##    ## ##     ## ##   ###    ##    ##       ##   ###    ##
  #     ######   #######  ##    ##    ##    ######## ##    ##    ##

  # Internal: Creates the content of the {MinimapElement} and attaches the
  # mouse control event listeners.
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
    @visibleArea.addEventListener 'touchstart', visibleAreaMousedown

    @subscriptions.add new Disposable =>
      @removeEventListener 'mousewheel', elementMousewheel
      @canvas.removeEventListener 'mousedown', canvasMousedown
      @visibleArea.removeEventListener 'mousedown', visibleAreaMousedown
      @visibleArea.removeEventListener 'touchstart', visibleAreaMousedown

  # Initializes the scroll indicator div when the `minimapScrollIndicator`
  # settings is enabled.
  initializeScrollIndicator: ->
    @scrollIndicator = document.createElement('div')
    @scrollIndicator.classList.add 'minimap-scroll-indicator'
    @controls.appendChild(@scrollIndicator)

  # Disposes the scroll indicator div when the `minimapScrollIndicator`
  # settings is disabled.
  disposeScrollIndicator: ->
    @controls.removeChild(@scrollIndicator)
    @scrollIndicator = undefined

  # Initializes the quick settings openener div when the
  # `displayPluginsControls` setting is enabled.
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

          {top, left, right} = @canvas.getBoundingClientRect()
          @quickSettingsElement.style.top = top + 'px'
          @quickSettingsElement.attach()

          if @displayMinimapOnLeft
            @quickSettingsElement.style.left = (right) + 'px'
          else
            @quickSettingsElement.style.left = (left - @quickSettingsElement.clientWidth) + 'px'

  # Disposes the quick settings openener div when the
  # `displayPluginsControls` setting is disabled.
  disposeOpenQuickSettings: ->
    return unless @openQuickSettings?
    @controls.removeChild(@openQuickSettings)
    @openQuickSettingSubscription.dispose()
    @openQuickSettings = undefined

  # Returns the target {TextEditor} of the {Minimap}.
  #
  # Returns a {TextEditor}.
  getTextEditor: -> @minimap.getTextEditor()

  # Returns the {TextEditorElement} for the {Minimap}'s {TextEditor}.
  #
  # Returns a {TextEditorElement}.
  getTextEditorElement: ->
    @editorElement ?= atom.views.getView(@getTextEditor())

  # Internal: Returns the root of the {TextEditorElement} content.
  # This method is mostly used to ensure compatibility with the `shadowDom`
  # setting.
  #
  # Returns an {HTMLElement}.
  getTextEditorElementRoot: ->
    editorElement = @getTextEditorElement()

    editorElement.shadowRoot ? editorElement

  # Internal: Returns the root where to inject the dummy node used to read
  # DOM styles.
  #
  # Returns an {HTMLElement}.
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

  # Returns the {Minimap} for which this {MinimapElement} was created.
  #
  # Returns a {Minimap}.
  getModel: -> @minimap

  # Defines the {Minimap} model for this {MinimapElement} instance.
  #
  # minimap - The {Minimap} model for this instance.
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

  # Internal: Requests an update to be performed on the next frame.
  requestUpdate: ->
    return if @frameRequested

    @frameRequested = true
    requestAnimationFrame =>
      @update()
      @frameRequested = false

  # Internal: Requests an update to be performed on the next frame that will
  # completely redraw the minimap.
  requestForcedUpdate: ->
    @offscreenFirstRow = null
    @offscreenLastRow = null
    @requestUpdate()

  # Internal: Performs the actual {MinimapElement} update.
  update: ->
    return unless @attached and @isVisible() and @minimap?

    if @adjustToSoftWrap and @marginRight?
      @style.marginRight = @marginRight + 'px'
    else
      @style.marginRight = null

    visibleAreaLeft = @minimap.getTextEditorScaledScrollLeft()
    visibleAreaTop = @minimap.getTextEditorScaledScrollTop() - @minimap.getScrollTop()
    visibleWidth = Math.min(@canvas.width / devicePixelRatio, @width)


    @applyStyles @visibleArea,
      width: visibleWidth + 'px'
      height: @minimap.getTextEditorScaledHeight() + 'px'
      transform: @makeTranslate(visibleAreaLeft, visibleAreaTop)

    @applyStyles @controls,
      width: visibleWidth + 'px'

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

  # Defines whether to render the code highlights or not.
  #
  # displayCodeHighlights - A {Boolean}.
  setDisplayCodeHighlights: (@displayCodeHighlights) ->
    @requestForcedUpdate() if @attached

  # Internal: Polling callback used to detect visibility and size changes.
  pollDOM: ->
    visibilityChanged = @checkForVisibilityChange()
    if @isVisible()
      @requestForcedUpdate() unless @wasVisible

      @measureHeightAndWidth(visibilityChanged, false)

  # Internal: A method that checks for visibility changes in the
  # {MinimapElement}. The method returns `true` when the visibility changed
  # from visible to hidden or from hidden to visible.
  #
  # Returns a {Boolean}.
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

  # Internal: A method used to measure the size of the {MinimapElement} and
  # update internal components based on the new size.
  #
  # forceUpdate - A {Boolean} that forces the update even when no changes were
  #               detected.
  measureHeightAndWidth: (visibilityChanged, forceUpdate=true) ->
    wasResized = @width isnt @clientWidth or @height isnt @clientHeight

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

  # Internal: Helper method to register config observers.
  #
  # config - An {Object} mapping the config name to observe with the listener
  #          {Function} to call when the setting was changed.
  observeConfig: (configs={}) ->
    for config, callback of configs
      @subscriptions.add atom.config.observe config, callback

  # Internal: Callback triggered when the mouse is pressed on the
  # {MinimapElement} canvas.
  #
  # event - The {Event} object.
  mousePressedOverCanvas: (e) ->
    if e.which is 1
      @leftMousePressedOverCanvas(e)
    else if e.which is 2
      @middleMousePressedOverCanvas(e)
      # @requestForcedUpdate()
      {top, height} = @visibleArea.getBoundingClientRect()
      @startDrag({which: 2, pageY: top + height/2}) # ugly hack
    else return

  leftMousePressedOverCanvas: ({pageY, target}) ->
    y = pageY - target.getBoundingClientRect().top
    row = Math.floor(y / @minimap.getLineHeight()) + @minimap.getFirstVisibleScreenRow()

    textEditor = @minimap.getTextEditor()

    scrollTop = row * textEditor.getLineHeightInPixels() - textEditor.getHeight() / 2

    if atom.config.get('minimap.scrollAnimation')
      from = textEditor.getScrollTop()
      to = scrollTop
      step = (now) -> textEditor.setScrollTop(now)
      duration = atom.config.get('minimap.scrollAnimationDuration')
      @animate(from: from, to: to, duration: duration, step: step)
    else
      textEditor.setScrollTop(scrollTop)

  middleMousePressedOverCanvas: ({pageY}) ->
    {top: offsetTop} = @getBoundingClientRect()
    y = pageY - offsetTop - @minimap.getTextEditorScaledHeight()/2

    ratio = y /
      (@minimap.getVisibleHeight() - @minimap.getTextEditorScaledHeight())

    @minimap.textEditor.setScrollTop(
      ratio * @minimap.getTextEditorMaxScrollTop())

  # Internal: A method that relays the `mousewheel` events received by
  # the {MinimapElement} to the {TextEditorElement}.
  #
  # e - The {Event} object.
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

  # Internal: A method triggered when the mouse is pressed over the visible
  # area that starts the dragging gesture.
  #
  # event - The {Event} object.
  startDrag: (e) ->
    {which, pageY} = e
    return unless @minimap
    return if which isnt 1 and which isnt 2 and not e.touches?

    {top} = @visibleArea.getBoundingClientRect()
    {top: offsetTop} = @getBoundingClientRect()

    dragOffset = pageY - top

    initial = {dragOffset, offsetTop}

    mousemoveHandler = (e) => @drag(e, initial)
    mouseupHandler = (e) => @endDrag(e, initial)

    document.body.addEventListener('mousemove', mousemoveHandler)
    document.body.addEventListener('mouseup', mouseupHandler)
    document.body.addEventListener('mouseleave', mouseupHandler)

    document.body.addEventListener('touchmove', mousemoveHandler)
    document.body.addEventListener('touchend', mouseupHandler)

    @dragSubscription = new Disposable ->
      document.body.removeEventListener('mousemove', mousemoveHandler)
      document.body.removeEventListener('mouseup', mouseupHandler)
      document.body.removeEventListener('mouseleave', mouseupHandler)

      document.body.removeEventListener('touchmove', mousemoveHandler)
      document.body.removeEventListener('touchend', mouseupHandler)

  # Internal: The method called during the drag gesture.
  #
  # e - The {Event} object.
  # initial - An {Object} with the data from the original data from the drag
  #           start event. The object holds the following properties:
  #           dragOffset - The mouse offset {Number} within the visible area.
  #           offsetTop - The {MinimapElement} offset at the moment of the
  #                       drag start.
  drag: (e, initial) ->
    return unless @minimap
    return if e.which isnt 1 and e.which isnt 2 and not e.touches?
    y = e.pageY - initial.offsetTop - initial.dragOffset

    ratio = y / (@minimap.getVisibleHeight() - @minimap.getTextEditorScaledHeight())

    @minimap.textEditor.setScrollTop(ratio * @minimap.getTextEditorMaxScrollTop())

  # Internal: The method that ends the drag gesture.
  #
  # e - The {Event} object.
  # initial - An {Object} with the data from the original data from the drag
  #           start event. The object holds the following properties:
  #           dragOffset - The mouse offset {Number} within the visible area.
  #           offsetTop - The {MinimapElement} offset at the moment of the
  #                       drag start.
  endDrag: (e, initial) ->
    return unless @minimap
    @dragSubscription.dispose()

  #     ######   ######   ######
  #    ##    ## ##    ## ##    ##
  #    ##       ##       ##
  #    ##        ######   ######
  #    ##             ##       ##
  #    ##    ## ##    ## ##    ##
  #     ######   ######   ######

  # Internal: Applies the passed-in styles properties to the specified element
  #
  # element - The {HTMLElement} onto which applies the styles.
  # styles - An {Object} where the keys are the properties name and the values
  #          are the CSS values for theses properties.
  applyStyles: (element, styles) ->
    cssText = ''

    for property,value of styles
      cssText += "#{property}: #{value}; "

    element.style.cssText = cssText

  # Returns a {String} with a CSS translation tranform value.
  #
  # x - The translation {Number} on the x axis.
  # y - The translation {Number} on the y axis.
  #
  # Returns a {String}.
  makeTranslate: (x=0,y=0) ->
    if @useHardwareAcceleration
      "translate3d(#{x}px, #{y}px, 0)"
    else
      "translate(#{x}px, #{y}px)"

  # Returns a {String} with a CSS scale tranform value.
  #
  # x - The scaling {Number} on the x axis.
  # y - The scaling {Number} on the y axis.
  #
  # Returns a {String}.
  makeScale: (x=0,y=x) ->
    if @useHardwareAcceleration
      "scale3d(#{x}, #{y}, 1)"
    else
      "scale(#{x}, #{y})"

  # Internal: A method that return the current time as a {Date}.
  #
  # That method exist so that we can mock it in tests.
  #
  # Returns a {Date}.
  getTime: -> new Date()

  # Internal: A method that mimic the jQuery `animate` method and used to
  # animate the scroll when clicking on the {MinimapElement} canvas.
  #
  #  properties - An {Object} with the following properties:
  #               from - The starting {Number} value.
  #               to - The ending {Number} value.
  #               duration - The duration {Number} of the animation.
  #               step - A {Function} to call on each step of the animation.
  #                      The method will receive a {Number} between `0` and `1`
  #                      as argument.
  animate: ({from, to, duration, step}) ->
    start = @getTime()

    swing = (progress) ->
      return 0.5 - Math.cos( progress * Math.PI ) / 2

    update = =>
      passed = @getTime() - start
      if duration == 0
        progress = 1
      else
        progress = passed / duration
      progress = 1 if progress > 1
      delta = swing(progress)
      step(from + (to-from)*delta)

      if progress < 1
        requestAnimationFrame(update)

    update()

#    ######## ##       ######## ##     ## ######## ##    ## ########
#    ##       ##       ##       ###   ### ##       ###   ##    ##
#    ##       ##       ##       #### #### ##       ####  ##    ##
#    ######   ##       ######   ## ### ## ######   ## ## ##    ##
#    ##       ##       ##       ##     ## ##       ##  ####    ##
#    ##       ##       ##       ##     ## ##       ##   ###    ##
#    ######## ######## ######## ##     ## ######## ##    ##    ##

module.exports = MinimapElement = document.registerElement 'atom-text-editor-minimap', prototype: MinimapElement.prototype

# Public: The method that registers the {MinimapElement} factory in the
# `atom.views` registry with the passed-in model.
#
# model - The model class to registers the factory with.
MinimapElement.registerViewProvider = ->
  atom.views.addViewProvider require('./minimap'), (model) ->
    element = new MinimapElement
    element.setModel(model)
    element
