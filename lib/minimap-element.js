"use strict"

import { CompositeDisposable, Disposable } from "atom"
import { EventsDelegation, AncestorsMethods } from "atom-utils-plus"
import elementResizeDetectorImport from "element-resize-detector"
import DecorationManagement from "./decoration-management"

import * as Main from "./main"
import CanvasDrawer from "./mixins/canvas-drawer"
import include from "./decorators/include"
import element from "./decorators/element"

import MinimapQuickSettingsElement from "./minimap-quick-settings-element"
const elementResizeDetector = elementResizeDetectorImport({ strategy: "scroll" })

const SPEC_MODE = atom.inSpecMode()

/**
 * Public: The MinimapElement is the view meant to render a {@link Minimap} instance in the DOM.
 *
 * You can retrieve the MinimapElement associated to a Minimap using the `atom.views.getView` method.
 *
 * Note that most interactions with the Minimap package is done through the Minimap model so you should never have to
 * access MinimapElement instances.
 *
 * @example Let minimapElement = atom.views.getView(minimap)
 */
class MinimapElement {
  static initClass() {
    include(this, CanvasDrawer, EventsDelegation, AncestorsMethods)
    return element(this, "atom-text-editor-minimap")
  }

  //    ##     ##  #######   #######  ##    ##  ######
  //    ##     ## ##     ## ##     ## ##   ##  ##    ##
  //    ##     ## ##     ## ##     ## ##  ##   ##
  //    ######### ##     ## ##     ## #####     ######
  //    ##     ## ##     ## ##     ## ##  ##         ##
  //    ##     ## ##     ## ##     ## ##   ##  ##    ##
  //    ##     ##  #######   #######  ##    ##  ######

  /**
   * DOM callback invoked when a new MinimapElement is created.
   *
   * @access private
   */
  createdCallback() {
    // Core properties

    /** @access private */
    this.minimap = undefined

    /** @access private */
    this.width = undefined
    /** @access private */
    this.height = undefined

    // Subscriptions

    /** @access private */
    this.subscriptions = new CompositeDisposable()
    /** @access private */
    this.visibleAreaSubscription = undefined
    /** @access private */
    this.quickSettingsSubscription = undefined
    /** @access private */
    this.dragSubscription = undefined
    /** @access private */
    this.openQuickSettingSubscription = undefined

    // Configs

    /** @access private */
    this.minimapScrollIndicator = undefined
    /** @access private */
    this.displayMinimapOnLeft = undefined
    /** @access private */
    this.displayPluginsControls = undefined
    /** @access private */
    this.textOpacity = undefined
    /** @access private */
    this.displayCodeHighlights = undefined
    /** @access private */
    this.adjustToSoftWrap = undefined
    /** @access private */
    this.useHardwareAcceleration = undefined
    /** @access private */
    this.absoluteMode = undefined

    // Elements

    /** @access private */
    this.visibleArea = undefined
    /** @access private */
    this.controls = undefined
    /** @access private */
    this.scrollIndicator = undefined
    /** @access private */
    this.openQuickSettings = undefined
    /** @access private */
    this.quickSettingsElement = undefined

    this.DecorationManagement = new DecorationManagement()

    // States

    /** @access private */
    this.attached = undefined
    /** @access private */
    this.attachedToTextEditor = undefined
    /** @access private */
    this.standAlone = undefined
    /** @access private */
    this.wasVisible = undefined

    // Other

    /** @access private */
    this.offscreenFirstRow = undefined
    /** @access private */
    this.offscreenLastRow = undefined
    /** @access private */
    this.frameRequested = undefined
    /** @access private */
    this.flexBasis = undefined

    this.initializeContent()

    this.subscriptions.add(
      atom.config.observe("minimap.displayMinimapOnLeft", (displayMinimapOnLeft) => {
        this.displayMinimapOnLeft = displayMinimapOnLeft

        this.updateMinimapFlexPosition()
        this.measureHeightAndWidth(true, true)
      }),

      atom.config.observe("minimap.minimapScrollIndicator", (minimapScrollIndicator) => {
        this.minimapScrollIndicator = minimapScrollIndicator

        if (this.minimapScrollIndicator && !(this.scrollIndicator != null) && !this.standAlone) {
          this.initializeScrollIndicator()
        } else if (this.scrollIndicator != null) {
          this.disposeScrollIndicator()
        }

        if (this.attached) {
          this.requestUpdate()
        }
      }),

      atom.config.observe("minimap.displayPluginsControls", (displayPluginsControls) => {
        this.displayPluginsControls = displayPluginsControls

        if (this.displayPluginsControls && !(this.openQuickSettings != null) && !this.standAlone) {
          this.initializeOpenQuickSettings()
        } else if (this.openQuickSettings != null) {
          this.disposeOpenQuickSettings()
        }
      }),

      atom.config.observe("minimap.textOpacity", (textOpacity) => {
        this.textOpacity = textOpacity

        if (this.attached) {
          this.requestForcedUpdate()
        }
      }),

      atom.config.observe("minimap.displayCodeHighlights", (displayCodeHighlights) => {
        this.displayCodeHighlights = displayCodeHighlights

        if (this.attached) {
          this.requestForcedUpdate()
        }
      }),

      atom.config.observe("minimap.smoothScrolling", (smoothScrolling) => {
        this.smoothScrolling = smoothScrolling

        if (this.attached) {
          if (!this.smoothScrolling) {
            this.backLayer.canvas.style.cssText = ""
            this.tokensLayer.canvas.style.cssText = ""
            this.frontLayer.canvas.style.cssText = ""
          } else {
            this.requestUpdate()
          }
        }
      }),

      atom.config.observe("minimap.adjustMinimapWidthToSoftWrap", (adjustToSoftWrap) => {
        this.adjustToSoftWrap = adjustToSoftWrap

        if (this.attached) {
          this.measureHeightAndWidth()
        }
      }),

      atom.config.observe("minimap.adjustMinimapWidthOnlyIfSmaller", (adjustOnlyIfSmaller) => {
        this.adjustOnlyIfSmaller = adjustOnlyIfSmaller

        if (this.attached) {
          this.measureHeightAndWidth()
        }
      }),

      atom.config.observe("minimap.useHardwareAcceleration", (useHardwareAcceleration) => {
        this.useHardwareAcceleration = useHardwareAcceleration

        if (this.attached) {
          this.requestUpdate()
        }
      }),

      atom.config.observe("minimap.absoluteMode", (absoluteMode) => {
        this.absoluteMode = absoluteMode

        this.classList.toggle("absolute", this.absoluteMode)
      }),

      atom.config.observe("minimap.adjustAbsoluteModeHeight", (adjustAbsoluteModeHeight) => {
        this.adjustAbsoluteModeHeight = adjustAbsoluteModeHeight

        this.classList.toggle("adjust-absolute-height", this.adjustAbsoluteModeHeight)

        if (this.attached) {
          this.measureHeightAndWidth()
        }
      }),

      atom.config.observe("minimap.ignoreWhitespacesInTokens", (ignoreWhitespacesInTokens) => {
        this.ignoreWhitespacesInTokens = ignoreWhitespacesInTokens

        if (this.attached) {
          this.requestForcedUpdate()
        }
      }),

      atom.config.observe("editor.preferredLineLength", () => {
        if (this.attached) {
          this.measureHeightAndWidth()
        }
      }),

      atom.config.observe("editor.softWrap", () => {
        if (this.attached) {
          this.requestUpdate()
        }
      }),

      atom.config.observe("editor.showInvisibles", () => {
        if (this.attached) {
          this.requestUpdate()
        }
      }),

      atom.config.observe("editor.invisibles", () => {
        if (this.attached) {
          this.requestUpdate()
        }
      }),

      atom.config.observe("editor.softWrapAtPreferredLineLength", () => {
        if (this.attached) {
          this.requestUpdate()
        }
      })
    )
  }

  /**
   * DOM callback invoked when a new MinimapElement is attached to the DOM.
   *
   * @access private
   */
  attachedCallback() {
    if (typeof atom.views.pollDocument === "function") {
      this.subscriptions.add(
        atom.views.pollDocument(() => {
          this.pollDOM()
        })
      )
    } else {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        const { intersectionRect } = entries[entries.length - 1]
        if (intersectionRect.width > 0 || intersectionRect.height > 0) {
          this.measureHeightAndWidth(true, true)
        }
      })

      this.intersectionObserver.observe(this)
      if (this.isVisible()) {
        this.measureHeightAndWidth(true, true)
      }

      const measureDimensions = () => {
        this.measureHeightAndWidth(false, false)
      }
      elementResizeDetector.listenTo(this, measureDimensions)
      window.addEventListener("resize", measureDimensions, { passive: true })

      this.subscriptions.add(
        new Disposable(() => {
          elementResizeDetector.removeListener(this, measureDimensions)
        }),
        new Disposable(() => {
          window.removeEventListener("resize", measureDimensions)
        })
      )
    }

    this.measureHeightAndWidth()
    this.updateMinimapFlexPosition()
    this.attached = true
    this.attachedToTextEditor = this.queryParentSelector("atom-text-editor") === this.minimap.getTextEditorElement()

    if (this.attachedToTextEditor) {
      this.minimap.getTextEditorElement().setAttribute("with-minimap", this.displayMinimapOnLeft ? "left" : "right")
    }

    this.subscriptions.add(this.subscribeToMediaQuery())
  }

  /**
   * DOM callback invoked when a new MinimapElement is detached from the DOM.
   *
   * @access private
   */
  detachedCallback() {
    this.minimap.getTextEditorElement().removeAttribute("with-minimap")
    this.attached = false
  }

  //       ###    ######## ########    ###     ######  ##     ##
  //      ## ##      ##       ##      ## ##   ##    ## ##     ##
  //     ##   ##     ##       ##     ##   ##  ##       ##     ##
  //    ##     ##    ##       ##    ##     ## ##       #########
  //    #########    ##       ##    ######### ##       ##     ##
  //    ##     ##    ##       ##    ##     ## ##    ## ##     ##
  //    ##     ##    ##       ##    ##     ##  ######  ##     ##

  /**
   * Returns whether the MinimapElement is currently visible on screen or not.
   *
   * The visibility of the minimap is defined by testing the size of the offset width and height of the element.
   *
   * @returns {boolean} Whether the MinimapElement is currently visible or not
   */
  isVisible() {
    return this.offsetWidth > 0 || this.offsetHeight > 0
  }

  /**
   * Attaches the MinimapElement to the DOM.
   *
   * The position at which the element is attached is defined by the `displayMinimapOnLeft` setting.
   *
   * @param {HTMLElement} [parent] The DOM node where attaching the minimap element
   */
  attach(parent) {
    if (this.attached) {
      return
    }

    const container = parent || this.minimap.getTextEditorElement()
    const minimaps = container.querySelectorAll("atom-text-editor-minimap")
    if (minimaps.length) {
      Array.prototype.forEach.call(minimaps, (el) => {
        el.destroy()
        try {
          container.removeChild(el)
        } catch (e) {
          // TODO: ignore for now
          // https://github.com/atom-minimap/minimap/issues/766#issuecomment-762496374
        }
      })
    }
    container.appendChild(this)
  }

  /** Detaches the MinimapElement from the DOM. */
  detach() {
    if (!this.attached || this.parentNode == null) {
      return
    }
    this.parentNode.removeChild(this)
  }

  /**
   * Toggles the minimap left/right position based on the value of the `displayMinimapOnLeft` setting.
   *
   * @access private
   */
  updateMinimapFlexPosition() {
    this.classList.toggle("left", this.displayMinimapOnLeft)
    if (this.attachedToTextEditor) {
      this.minimap.getTextEditorElement().setAttribute("with-minimap", this.displayMinimapOnLeft ? "left" : "right")
    }
  }

  /** Destroys this MinimapElement */
  destroy() {
    this.DecorationManagement.destroy()
    if (this.quickSettingsElement) {
      this.quickSettingsElement.destroy()
    }
    this.subscriptions.dispose()
    this.detach()
  }

  //     ######   #######  ##    ## ######## ######## ##    ## ########
  //    ##    ## ##     ## ###   ##    ##    ##       ###   ##    ##
  //    ##       ##     ## ####  ##    ##    ##       ####  ##    ##
  //    ##       ##     ## ## ## ##    ##    ######   ## ## ##    ##
  //    ##       ##     ## ##  ####    ##    ##       ##  ####    ##
  //    ##    ## ##     ## ##   ###    ##    ##       ##   ###    ##
  //     ######   #######  ##    ##    ##    ######## ##    ##    ##

  /**
   * Creates the content of the MinimapElement and attaches the mouse control event listeners.
   *
   * @access private
   */
  initializeContent() {
    this.initializeCanvas()

    this.attachCanvases(this)

    this.createVisibleArea()
    this.createControls()

    this.subscriptions.add(
      this.subscribeTo(
        this,
        {
          mousewheel: (e) => {
            if (!this.standAlone && this.minimap.onMouseWheel) {
              this.minimap.onMouseWheel(e)
            }
          },
        },
        { passive: true }
      ),

      this.subscribeTo(
        this.getFrontCanvas(),
        {
          mousedown: (e) => {
            this.canvasPressed(extractMouseEventData(e))
          },
          touchstart: (e) => {
            this.canvasPressed(extractTouchEventData(e))
          },
        },
        { passive: true }
      )
    )
  }

  /**
   * Initializes the visible area div.
   *
   * @access private
   */
  createVisibleArea() {
    if (this.visibleArea) {
      return
    }

    this.visibleArea = document.createElement("div")
    this.visibleArea.classList.add("minimap-visible-area")
    this.appendChild(this.visibleArea)
    this.visibleAreaSubscription = this.subscribeTo(
      this.visibleArea,
      {
        mousedown: (e) => {
          this.startDrag(extractMouseEventData(e))
        },
        touchstart: (e) => {
          this.startDrag(extractTouchEventData(e))
        },
      },
      { passive: true }
    )

    this.subscriptions.add(this.visibleAreaSubscription)
  }

  /**
   * Removes the visible area div.
   *
   * @access private
   */
  removeVisibleArea() {
    if (!this.visibleArea) {
      return
    }

    this.subscriptions.remove(this.visibleAreaSubscription)
    this.visibleAreaSubscription.dispose()
    this.removeChild(this.visibleArea)
    delete this.visibleArea
  }

  /**
   * Creates the controls container div.
   *
   * @access private
   */
  createControls() {
    if (this.controls || this.standAlone) {
      return
    }

    this.controls = document.createElement("div")
    this.controls.classList.add("minimap-controls")
    this.appendChild(this.controls)
  }

  /**
   * Removes the controls container div.
   *
   * @access private
   */
  removeControls() {
    if (!this.controls) {
      return
    }

    this.removeChild(this.controls)
    delete this.controls
  }

  /**
   * Initializes the scroll indicator div when the `minimapScrollIndicator` settings is enabled.
   *
   * @access private
   */
  initializeScrollIndicator() {
    if (this.scrollIndicator || this.standAlone) {
      return
    }

    this.scrollIndicator = document.createElement("div")
    this.scrollIndicator.classList.add("minimap-scroll-indicator")
    this.controls.appendChild(this.scrollIndicator)
  }

  /**
   * Disposes the scroll indicator div when the `minimapScrollIndicator` settings is disabled.
   *
   * @access private
   */
  disposeScrollIndicator() {
    if (!this.scrollIndicator) {
      return
    }

    this.controls.removeChild(this.scrollIndicator)
    delete this.scrollIndicator
  }

  /**
   * Initializes the quick settings openener div when the `displayPluginsControls` setting is enabled.
   *
   * @access private
   */
  initializeOpenQuickSettings() {
    if (this.openQuickSettings || this.standAlone) {
      return
    }

    this.openQuickSettings = document.createElement("div")
    this.openQuickSettings.classList.add("open-minimap-quick-settings")
    this.controls.appendChild(this.openQuickSettings)

    this.openQuickSettingSubscription = this.subscribeTo(this.openQuickSettings, {
      mousedown: (e) => {
        e.preventDefault()
        e.stopPropagation()

        if (this.quickSettingsElement != null) {
          this.quickSettingsElement.destroy()
          this.quickSettingsSubscription.dispose()
        } else {
          this.quickSettingsElement = new MinimapQuickSettingsElement()
          this.quickSettingsElement.setModel(this)
          this.quickSettingsSubscription = this.quickSettingsElement.onDidDestroy(() => {
            this.quickSettingsElement = null
          })

          const { top, left, right } = this.getFrontCanvas().getBoundingClientRect()
          this.quickSettingsElement.style.top = `${top}px`
          this.quickSettingsElement.attach()

          if (this.displayMinimapOnLeft) {
            this.quickSettingsElement.style.left = `${right}px`
          } else {
            this.quickSettingsElement.style.left = `${left - this.quickSettingsElement.clientWidth}px`
          }
        }
      },
    })
  }

  /**
   * Disposes the quick settings openener div when the `displayPluginsControls` setting is disabled.
   *
   * @access private
   */
  disposeOpenQuickSettings() {
    if (!this.openQuickSettings) {
      return
    }

    this.controls.removeChild(this.openQuickSettings)
    this.openQuickSettingSubscription.dispose()
    delete this.openQuickSettings
  }

  /**
   * Get the DecorationManagement API for minimapElement
   *
   * @returns {DecorationManagement}
   */
  getDecorationManagement() {
    return this.DecorationManagement
  }

  //    ##     ##  #######  ########  ######## ##
  //    ###   ### ##     ## ##     ## ##       ##
  //    #### #### ##     ## ##     ## ##       ##
  //    ## ### ## ##     ## ##     ## ######   ##
  //    ##     ## ##     ## ##     ## ##       ##
  //    ##     ## ##     ## ##     ## ##       ##
  //    ##     ##  #######  ########  ######## ########

  /**
   * Returns the Minimap for which this MinimapElement was created.
   *
   * @returns {Minimap} This element's Minimap
   */
  getModel() {
    return this.minimap
  }

  /**
   * Defines the Minimap model for this MinimapElement instance.
   *
   * @param {Minimap} minimap The Minimap model for this instance.
   * @returns {Minimap} This element's Minimap
   */
  setModel(minimap) {
    this.minimap = minimap

    // set minimapElement for Minimap
    this.minimap.minimapElement = this

    this.DecorationManagement.initializeDecorations(this.minimap)

    this.subscriptions.add(
      this.minimap.onDidChangeScrollTop(() => {
        this.requestUpdate()
      }),

      this.minimap.onDidChangeScrollLeft(() => {
        this.requestUpdate()
      }),

      this.minimap.onDidDestroy(() => {
        this.destroy()
      }),

      this.minimap.onDidChangeConfig(() => {
        if (this.attached) {
          return this.requestForcedUpdate()
        }
      }),

      this.minimap.onDidChangeStandAlone(() => {
        this.setStandAlone(this.minimap.isStandAlone())
        this.requestUpdate()
      }),

      this.minimap.onDidChange((change) => {
        this.pendingChanges.push(change)
        this.requestUpdate()
      }),

      this.DecorationManagement.onDidChangeDecorationRange((change) => {
        const { type } = change
        if (type === "line" || type === "highlight-under" || type === "background-custom") {
          this.pendingBackDecorationChanges.push(change)
        } else {
          this.pendingFrontDecorationChanges.push(change)
        }
        this.requestUpdate()
      }),

      Main.onDidChangePluginOrder(() => {
        this.requestForcedUpdate()
      })
    )

    this.setStandAlone(this.minimap.isStandAlone())

    if (this.width != null && this.height != null) {
      this.minimap.setScreenHeightAndWidth(this.height, this.width)
    }

    return this.minimap
  }

  /**
   * Sets the stand-alone mode for this MinimapElement.
   *
   * @param {boolean} standAlone The new mode for this MinimapElement
   */
  setStandAlone(standAlone) {
    this.standAlone = standAlone

    if (this.standAlone) {
      this.setAttribute("stand-alone", true)
      this.disposeScrollIndicator()
      this.disposeOpenQuickSettings()
      this.removeControls()
      this.removeVisibleArea()
    } else {
      this.removeAttribute("stand-alone")
      this.createVisibleArea()
      this.createControls()
      if (this.minimapScrollIndicator) {
        this.initializeScrollIndicator()
      }
      if (this.displayPluginsControls) {
        this.initializeOpenQuickSettings()
      }
    }
  }

  //    ##     ## ########  ########     ###    ######## ########
  //    ##     ## ##     ## ##     ##   ## ##      ##    ##
  //    ##     ## ##     ## ##     ##  ##   ##     ##    ##
  //    ##     ## ########  ##     ## ##     ##    ##    ######
  //    ##     ## ##        ##     ## #########    ##    ##
  //    ##     ## ##        ##     ## ##     ##    ##    ##
  //     #######  ##        ########  ##     ##    ##    ########

  /** Requests an update to be performed on the next frame. */
  requestUpdate() {
    if (this.frameRequested) {
      return
    }

    this.frameRequested = true
    requestAnimationFrame(() => {
      this.update()
      this.frameRequested = false
    })
  }

  /** Requests an update to be performed on the next frame that will completely redraw the minimap. */
  requestForcedUpdate() {
    this.offscreenFirstRow = null
    this.offscreenLastRow = null
    this.requestUpdate()
  }

  /**
   * Performs the actual MinimapElement update.
   *
   * @access private
   */
  update() {
    if (!(this.attached && this.isVisible() && this.minimap)) {
      return
    }
    const minimap = this.minimap
    minimap.enableCache()
    const canvas = this.getFrontCanvas()

    const devicePixelRatio = this.minimap.getDevicePixelRatio()
    const visibleAreaLeft = minimap.getTextEditorScaledScrollLeft()
    const visibleAreaTop = minimap.getTextEditorScaledScrollTop() - minimap.getScrollTop()
    const width = Math.min(canvas.width / devicePixelRatio, this.width)
    const visibleWidth = width + visibleAreaLeft

    if (this.adjustToSoftWrap && this.flexBasis) {
      this.style.flexBasis = `${this.flexBasis}px`
      this.style.width = `${this.flexBasis}px`
    } else {
      this.style.flexBasis = null
      this.style.width = null
    }

    if (SPEC_MODE) {
      applyStyles(this.visibleArea, {
        width: `${Math.round(visibleWidth)}px`,
        height: `${Math.round(minimap.getTextEditorScaledHeight())}px`,
        top: `${Math.round(visibleAreaTop)}px`,
        "border-left-width": `${Math.round(visibleAreaLeft)}px`,
      })
    } else {
      applyStyles(this.visibleArea, {
        width: `${Math.round(visibleWidth)}px`,
        height: `${Math.round(minimap.getTextEditorScaledHeight())}px`,
        transform: makeTranslate(0, visibleAreaTop, this.useHardwareAcceleration),
        "border-left-width": `${Math.round(visibleAreaLeft)}px`,
      })
    }

    applyStyles(this.controls, { width: `${Math.round(width)}px` })

    const canvasTop = minimap.getFirstVisibleScreenRow() * minimap.getLineHeight() - minimap.getScrollTop()

    if (this.smoothScrolling) {
      if (SPEC_MODE) {
        applyStyles(this.backLayer.canvas, { top: `${canvasTop}px` })
        applyStyles(this.tokensLayer.canvas, { top: `${canvasTop}px` })
        applyStyles(this.frontLayer.canvas, { top: `${canvasTop}px` })
      } else {
        let canvasTransform = makeTranslate(0, canvasTop, this.useHardwareAcceleration)
        if (devicePixelRatio !== 1) {
          const scale = 1 / devicePixelRatio
          canvasTransform += ` ${makeScale(scale, scale, this.useHardwareAcceleration)}`
        }
        applyStyles(this.backLayer.canvas, { transform: canvasTransform })
        applyStyles(this.tokensLayer.canvas, { transform: canvasTransform })
        applyStyles(this.frontLayer.canvas, { transform: canvasTransform })
      }
    } else {
      const scale = 1 / devicePixelRatio
      const canvasTransform = makeScale(scale, scale, this.useHardwareAcceleration)
      applyStyles(this.backLayer.canvas, { transform: canvasTransform })
      applyStyles(this.tokensLayer.canvas, { transform: canvasTransform })
      applyStyles(this.frontLayer.canvas, { transform: canvasTransform })
    }

    if (this.minimapScrollIndicator && !this.scrollIndicator && minimap.canScroll()) {
      this.initializeScrollIndicator()
    }

    if (this.scrollIndicator != null) {
      const minimapScreenHeight = minimap.getScreenHeight()
      const indicatorHeight = minimapScreenHeight * (minimapScreenHeight / minimap.getHeight())
      const indicatorScroll = (minimapScreenHeight - indicatorHeight) * minimap.getScrollRatio()

      if (SPEC_MODE) {
        applyStyles(this.scrollIndicator, {
          height: `${indicatorHeight}px`,
          top: `${indicatorScroll}px`,
        })
      } else {
        applyStyles(this.scrollIndicator, {
          height: `${indicatorHeight}px`,
          transform: makeTranslate(0, indicatorScroll, this.useHardwareAcceleration),
        })
      }

      if (!minimap.canScroll()) {
        this.disposeScrollIndicator()
      }
    }

    if (this.absoluteMode && this.adjustAbsoluteModeHeight) {
      this.updateCanvasesSize()
    }

    this.updateCanvas()
    minimap.clearCache()
  }

  /**
   * Defines whether to render the code highlights or not.
   *
   * @param {Boolean} displayCodeHighlights Whether to render the code highlights or not
   */
  setDisplayCodeHighlights(displayCodeHighlights) {
    this.displayCodeHighlights = displayCodeHighlights
    if (this.attached) {
      this.requestForcedUpdate()
    }
  }

  /**
   * Polling callback used to detect visibility and size changes.
   *
   * @access private
   */
  pollDOM() {
    const visibilityChanged = this.checkForVisibilityChange()
    if (this.isVisible()) {
      if (!this.wasVisible) {
        this.requestForcedUpdate()
      }

      this.measureHeightAndWidth(visibilityChanged, false)
    }
  }

  /**
   * A method that checks for visibility changes in the MinimapElement. The method returns `true` when the visibility
   * changed from visible to hidden or from hidden to visible.
   *
   * @returns {boolean} Whether the visibility changed or not since the last call
   * @access private
   */
  checkForVisibilityChange() {
    if (this.isVisible()) {
      if (this.wasVisible) {
        return false
      } else {
        this.wasVisible = true
        return this.wasVisible
      }
    } else {
      if (this.wasVisible) {
        this.wasVisible = false
        return true
      } else {
        this.wasVisible = false
        return this.wasVisible
      }
    }
  }

  /**
   * A method used to measure the size of the MinimapElement and update internal components based on the new size.
   *
   * @param {boolean} visibilityChanged Did the visibility changed since last measurement
   * @param {[type]} [forceUpdate=true] Forces the update even when no changes were detected. Default is `true`
   * @access private
   */
  measureHeightAndWidth(visibilityChanged, forceUpdate = true) {
    if (!this.minimap) {
      return
    }

    const safeFlexBasis = this.style.flexBasis
    this.style.flexBasis = ""

    const wasResized = this.width !== this.clientWidth || this.height !== this.clientHeight

    this.height = this.clientHeight
    this.width = this.clientWidth
    let canvasWidth = this.width

    if (this.minimap != null) {
      this.minimap.setScreenHeightAndWidth(this.height, this.width)
    }

    if (wasResized || visibilityChanged || forceUpdate) {
      this.requestForcedUpdate()
    }

    if (!this.isVisible()) {
      return
    }

    if (wasResized || forceUpdate) {
      if (this.adjustToSoftWrap) {
        const lineLength = atom.config.get("editor.preferredLineLength")
        const softWrap = atom.config.get("editor.softWrap")
        const softWrapAtPreferredLineLength = atom.config.get("editor.softWrapAtPreferredLineLength")
        const width = lineLength * this.minimap.getCharWidth()

        if (
          softWrap &&
          softWrapAtPreferredLineLength &&
          lineLength &&
          (width <= this.width || !this.adjustOnlyIfSmaller)
        ) {
          this.flexBasis = width
          canvasWidth = width
        } else {
          delete this.flexBasis
        }
      } else {
        delete this.flexBasis
      }

      this.updateCanvasesSize(canvasWidth)
    } else {
      this.style.flexBasis = safeFlexBasis
    }
  }

  updateCanvasesSize(canvasWidth) {
    const devicePixelRatio = this.minimap.getDevicePixelRatio()
    const maxCanvasHeight = this.height + this.minimap.getLineHeight()
    const newHeight =
      this.absoluteMode && this.adjustAbsoluteModeHeight
        ? Math.min(this.minimap.getHeight(), maxCanvasHeight)
        : maxCanvasHeight
    const canvas = this.getFrontCanvas()

    if (canvasWidth == null) {
      canvasWidth = canvas.width / devicePixelRatio
    }

    if (canvasWidth !== canvas.width || newHeight !== canvas.height) {
      this.setCanvasesSize(canvasWidth * devicePixelRatio, newHeight * devicePixelRatio)
      if (this.absoluteMode && this.adjustAbsoluteModeHeight) {
        this.offscreenFirstRow = null
        this.offscreenLastRow = null
      }
    }
  }

  //    ######## ##     ## ######## ##    ## ########  ######
  //    ##       ##     ## ##       ###   ##    ##    ##    ##
  //    ##       ##     ## ##       ####  ##    ##    ##
  //    ######   ##     ## ######   ## ## ##    ##     ######
  //    ##        ##   ##  ##       ##  ####    ##          ##
  //    ##         ## ##   ##       ##   ###    ##    ##    ##
  //    ########    ###    ######## ##    ##    ##     ######

  /**
   * Callback triggered when the mouse is pressed on the MinimapElement canvas.
   *
   * @param {number} y The vertical coordinate of the event
   * @param {boolean} isLeftMouse Was the left mouse button pressed?
   * @param {boolean} isMiddleMouse Was the middle mouse button pressed?
   * @access private
   */
  canvasPressed({ y, isLeftMouse, isMiddleMouse }) {
    if (this.minimap.isStandAlone()) {
      return
    }
    if (isLeftMouse) {
      this.canvasLeftMousePressed(y)
    } else if (isMiddleMouse) {
      this.canvasMiddleMousePressed(y)
      const { top, height } = this.visibleArea.getBoundingClientRect()
      this.startDrag({ y: top + height / 2, isLeftMouse: false, isMiddleMouse: true })
    }
  }

  /**
   * Callback triggered when the mouse left button is pressed on the MinimapElement canvas.
   *
   * @param {MouseEvent} e The mouse event object
   * @param {number} e.pageY The mouse y position in page
   * @param {HTMLElement} e.target The source of the event
   * @access private
   */
  canvasLeftMousePressed(y) {
    const deltaY = y - this.getBoundingClientRect().top
    const row = Math.floor(deltaY / this.minimap.getLineHeight()) + this.minimap.getFirstVisibleScreenRow()

    const textEditor = this.minimap.getTextEditor()
    const textEditorElement = this.minimap.getTextEditorElement()

    const scrollTop = row * textEditor.getLineHeightInPixels() - this.minimap.getTextEditorHeight() / 2
    const textEditorScrollTop =
      textEditorElement.pixelPositionForScreenPosition([row, 0]).top - this.minimap.getTextEditorHeight() / 2

    if (atom.config.get("minimap.moveCursorOnMinimapClick")) {
      textEditor.setCursorScreenPosition([row, 0])
    }

    if (atom.config.get("minimap.scrollAnimation")) {
      const duration = atom.config.get("minimap.scrollAnimationDuration")
      const independentScroll = this.minimap.scrollIndependentlyOnMouseWheel()

      const from = this.minimap.getTextEditorScrollTop()
      const to = textEditorScrollTop
      let step

      if (independentScroll) {
        const minimapFrom = this.minimap.getScrollTop()
        const minimapTo =
          Math.min(1, scrollTop / (this.minimap.getTextEditorMaxScrollTop() || 1)) * this.minimap.getMaxScrollTop()

        step = (now, t) => {
          if (this.minimap === null) {
            return
          } // TODO why this happens in the tests?
          this.minimap.setTextEditorScrollTop(now, true)
          this.minimap.setScrollTop(minimapFrom + (minimapTo - minimapFrom) * t)
        }
        animate({ from, to, duration, step })
      } else {
        step = (now) => {
          if (this.minimap === null) {
            return
          } // TODO why this happens in the tests?
          this.minimap.setTextEditorScrollTop(now)
        }
        animate({ from, to, duration, step })
      }
    } else {
      this.minimap.setTextEditorScrollTop(textEditorScrollTop)
    }
  }

  /**
   * Callback triggered when the mouse middle button is pressed on the MinimapElement canvas.
   *
   * @param {MouseEvent} e The mouse event object
   * @param {number} e.pageY The mouse y position in page
   * @access private
   */
  canvasMiddleMousePressed(y) {
    const { top: offsetTop } = this.getBoundingClientRect()
    const deltaY = y - offsetTop - this.minimap.getTextEditorScaledHeight() / 2

    const ratio = deltaY / (this.minimap.getVisibleHeight() - this.minimap.getTextEditorScaledHeight())

    this.minimap.setTextEditorScrollTop(ratio * this.minimap.getTextEditorMaxScrollTop())
  }

  /**
   * Subscribes to a media query for device pixel ratio changes and forces a repaint when it occurs.
   *
   * @returns {Disposable} A disposable to remove the media query listener
   * @access private
   */
  subscribeToMediaQuery() {
    const mediaQuery = window.matchMedia("screen and (-webkit-min-device-pixel-ratio: 1.5)")
    const mediaListener = () => {
      this.requestForcedUpdate()
    }
    mediaQuery.addEventListener("change", mediaListener)

    return new Disposable(() => {
      mediaQuery.removeEventListener("change", mediaListener)
    })
  }

  //    ########    ####    ########
  //    ##     ##  ##  ##   ##     ##
  //    ##     ##   ####    ##     ##
  //    ##     ##  ####     ##     ##
  //    ##     ## ##  ## ## ##     ##
  //    ##     ## ##   ##   ##     ##
  //    ########   ####  ## ########

  /**
   * A method triggered when the mouse is pressed over the visible area that starts the dragging gesture.
   *
   * @param {number} y The vertical coordinate of the event
   * @param {boolean} isLeftMouse Was the left mouse button pressed?
   * @param {boolean} isMiddleMouse Was the middle mouse button pressed?
   * @access private
   */
  startDrag({ y, isLeftMouse, isMiddleMouse }) {
    if (!this.minimap) {
      return
    }
    if (!isLeftMouse && !isMiddleMouse) {
      return
    }

    const initial = {
      dragOffset: y - this.visibleArea.getBoundingClientRect().top,
      offsetTop: this.getBoundingClientRect().top,
    }

    // TODO can we avoid adding and removing the listeners every time?

    const mousemoveHandler = (e) => this.drag(extractMouseEventData(e), initial)
    const dragendHandler = () => this.endDrag()

    const touchmoveHandler = (e) => this.drag(extractTouchEventData(e), initial)

    document.body.addEventListener("mousemove", mousemoveHandler, { passive: true })
    document.body.addEventListener("mouseup", dragendHandler, { passive: true })
    document.body.addEventListener("mouseleave", dragendHandler, { passive: true })

    document.body.addEventListener("touchmove", touchmoveHandler, { passive: true })
    document.body.addEventListener("touchend", dragendHandler, { passive: true })
    document.body.addEventListener("touchcancel", dragendHandler, { passive: true })

    this.dragSubscription = new Disposable(function () {
      document.body.removeEventListener("mousemove", mousemoveHandler)
      document.body.removeEventListener("mouseup", dragendHandler)
      document.body.removeEventListener("mouseleave", dragendHandler)

      document.body.removeEventListener("touchmove", touchmoveHandler)
      document.body.removeEventListener("touchend", dragendHandler)
      document.body.removeEventListener("touchcancel", dragendHandler)
    })
  }

  /**
   * The method called during the drag gesture.
   *
   * @param {number} y The vertical coordinate of the event
   * @param {boolean} isLeftMouse Was the left mouse button pressed?
   * @param {boolean} isMiddleMouse Was the middle mouse button pressed?
   * @param {number} initial.dragOffset The mouse offset within the visible area
   * @param {number} initial.offsetTop The MinimapElement offset at the moment of the drag start
   * @access private
   */
  drag({ y, isLeftMouse, isMiddleMouse }, initial) {
    if (!this.minimap) {
      return
    }
    if (!isLeftMouse && !isMiddleMouse) {
      return
    }
    const deltaY = y - initial.offsetTop - initial.dragOffset

    const ratio = deltaY / (this.minimap.getVisibleHeight() - this.minimap.getTextEditorScaledHeight())

    this.minimap.setTextEditorScrollTop(ratio * this.minimap.getTextEditorMaxScrollTop())
  }

  /**
   * The method that ends the drag gesture.
   *
   * @access private
   */
  endDrag() {
    if (!this.minimap) {
      return
    }
    this.dragSubscription.dispose()
  }
}

const minimapElement = MinimapElement.initClass()
export default minimapElement

//    ######## ##     ## ######## ##    ## ########  ######
//    ##       ##     ## ##       ###   ##    ##    ##    ##
//    ##       ##     ## ##       ####  ##    ##    ##
//    ######   ##     ## ######   ## ## ##    ##     ######
//    ##        ##   ##  ##       ##  ####    ##          ##
//    ##         ## ##   ##       ##   ###    ##    ##    ##
//    ########    ###    ######## ##    ##    ##     ######

/**
 * A method that extracts data from a `MouseEvent` which can then be used to process clicks and drags of the minimap.
 *
 * Used together with `extractTouchEventData` to provide a unified interface for `MouseEvent`s and `TouchEvent`s.
 *
 * @param {MouseEvent} mouseEvent The mouse event object
 * @access private
 */
function extractMouseEventData(mouseEvent) {
  return {
    x: mouseEvent.pageX,
    y: mouseEvent.pageY,
    isLeftMouse: mouseEvent.button === 0,
    isMiddleMouse: mouseEvent.button === 1,
  }
}

/**
 * A method that extracts data from a `TouchEvent` which can then be used to process clicks and drags of the minimap.
 *
 * Used together with `extractMouseEventData` to provide a unified interface for `MouseEvent`s and `TouchEvent`s.
 *
 * @param {TouchEvent} touchEvent The touch event object
 * @access private
 */
function extractTouchEventData(touchEvent) {
  // Use the first touch on the target area. Other touches will be ignored in
  // case of multi-touch.
  const touch = touchEvent.changedTouches[0]

  return {
    x: touch.pageX,
    y: touch.pageY,
    isLeftMouse: true, // Touch is treated like a left mouse button click
    isMiddleMouse: false,
  }
}

//     ######   ######   ######
//    ##    ## ##    ## ##    ##
//    ##       ##       ##
//    ##        ######   ######
//    ##             ##       ##
//    ##    ## ##    ## ##    ##
//     ######   ######   ######

/**
 * Applies the passed-in styles properties to the specified element
 *
 * @param {HTMLElement} element The element onto which apply the styles
 * @param {Object} styles The styles to apply
 * @access private
 */
function applyStyles(element, styles) {
  if (!element) {
    return
  }

  let cssText = ""
  for (const property in styles) {
    cssText += `${property}: ${styles[property]}; `
  }

  element.style.cssText = cssText
}

/**
 * Returns a string with a CSS translation tranform value.
 *
 * @param {number} [x=0] The x offset of the translation. Default is `0`
 * @param {number} [y=0] The y offset of the translation. Default is `0`
 * @param {boolean} [useHardwareAcceleration=false] Use hardware acceleration. Default is `false`
 * @returns {string} The CSS translation string
 * @access private
 */
function makeTranslate(x = 0, y = 0, useHardwareAcceleration = false) {
  if (useHardwareAcceleration) {
    return `translate3d(${x}px, ${y}px, 0)`
  } else {
    return `translate(${x}px, ${y}px)`
  }
}

/**
 * Returns a string with a CSS scaling tranform value.
 *
 * @param {number} [x=0] The x scaling factor. Default is `0`
 * @param {number} [y=0] The y scaling factor. Default is `0`
 * @param {boolean} [useHardwareAcceleration=false] Use hardware acceleration. Default is `false`
 * @returns {string} The CSS scaling string
 * @access private
 */
function makeScale(x = 0, y = x, useHardwareAcceleration = false) {
  if (useHardwareAcceleration) {
    return `scale3d(${x}, ${y}, 1)`
  } else {
    return `scale(${x}, ${y})`
  }
}

/**
 * A method that mimic the jQuery `animate` method and used to animate the scroll when clicking on the MinimapElement canvas.
 *
 * @param {Object} param The animation data object
 * @param {[type]} param.from The start value
 * @param {[type]} param.to The end value
 * @param {[type]} param.duration The animation duration
 * @param {[type]} param.step The easing function for the animation
 * @access private
 */
function animate({ from, to, duration, step }) {
  const start = getTime()
  let progress

  const update = () => {
    const passed = getTime() - start
    if (duration === 0) {
      progress = 1
    } else {
      progress = passed / duration
    }
    if (progress > 1) {
      progress = 1
    }
    const delta = swing(progress)
    const value = from + (to - from) * delta
    step(value, delta)

    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }

  update()
}

function swing(progress) {
  return 0.5 - Math.cos(progress * Math.PI) / 2
}

/**
 * A method that return the current time as a Date.
 *
 * That method exist so that we can mock it in tests.
 *
 * @returns {Date} The current time as Date
 * @access private
 */
function getTime() {
  return new Date()
}
