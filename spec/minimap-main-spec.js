"use strict"
process.env.NODE_ENV = "test"

require("./helpers/workspace")
const { Minimap, MinimapElement } = require("../dist/main")

describe("Minimap package", () => {
  let [editor, minimap, editorElement, minimapElement, workspaceElement, minimapPackage] = []

  beforeEach(() => {
    atom.config.set("minimap.autoToggle", true)

    workspaceElement = atom.views.getView(atom.workspace)
    jasmine.attachToDOM(workspaceElement)

    waitsForPromise(() => {
      return atom.workspace.open("sample.coffee")
    })

    // Package activation will be deferred to the configured, activation hook, which is then triggered
    // Activate activation hook
    atom.packages.triggerDeferredActivationHooks()
    atom.packages.triggerActivationHook("core:loaded-shell-environment")
    waitsForPromise(() => {
      return atom.packages.activatePackage("minimap").then((pkg) => {
        minimapPackage = pkg.mainModule
      })
    })

    waitsFor(() => {
      return workspaceElement.querySelector("atom-text-editor")
    })

    runs(() => {
      editor = atom.workspace.getActiveTextEditor()
      editorElement = atom.views.getView(editor)
    })

    waitsFor(() => {
      return workspaceElement.querySelector("atom-text-editor atom-text-editor-minimap")
    })
  })

  it("registers the minimap views provider", () => {
    const textEditor = atom.workspace.buildTextEditor({})
    minimap = new Minimap({ textEditor })
    minimapElement = atom.views.getView(minimap)

    expect(minimapElement).toExist()
  })

  it("provider returns minimap.minimapElement", () => {
    const textEditor = atom.workspace.buildTextEditor({})
    minimap = new Minimap({ textEditor })
    minimapElement = new MinimapElement()
    minimapElement.setModel(minimap)
    const minimapView = atom.views.getView(minimap)

    expect(minimapView).toBe(minimapElement)
  })

  describe("when an editor is opened", () => {
    it("creates a minimap model for the editor", () => {
      expect(minimapPackage.minimapForEditor(editor)).toBeDefined()
    })

    it("attaches a minimap element to the editor view", () => {
      expect(editorElement.querySelector("atom-text-editor-minimap")).toExist()
    })

    describe("when the package is deactivated", () => {
      beforeEach(() => {
        atom.packages.deactivatePackage("minimap")
      })
      it("removes the minimap from their editor parent", () => {
        expect(editorElement.querySelector("atom-text-editor-minimap")).not.toExist()
      })

      describe("and reactivated with a remaining minimap in the DOM", () => {
        beforeEach(() => {
          const m = new Minimap({ textEditor: editor })
          const v = atom.views.getView(m)
          editorElement.appendChild(v)
          // Package activation will be deferred to the configured, activation hook, which is then triggered
          // Activate activation hook
          atom.packages.triggerDeferredActivationHooks()
          atom.packages.triggerActivationHook("core:loaded-shell-environment")
          waitsForPromise(() => atom.packages.activatePackage("minimap"))
        })

        it("removes the remaining minimap", () => {
          expect(editorElement.querySelectorAll("atom-text-editor-minimap").length).toEqual(1)
        })
      })
    })
  })

  describe("::observeMinimaps", () => {
    let [spy] = []
    beforeEach(() => {
      spy = jasmine.createSpy("observeMinimaps")
      minimapPackage.observeMinimaps(spy)
    })

    it("calls the callback with the existing minimaps", () => {
      expect(spy).toHaveBeenCalled()
    })

    it("calls the callback when a new editor is opened", () => {
      waitsForPromise(() => {
        return atom.workspace.open("other-sample.js")
      })

      runs(() => {
        expect(spy.calls.length).toEqual(2)
      })
    })
  })

  describe("::deactivate", () => {
    beforeEach(() => {
      minimapPackage.deactivate()
    })

    it("destroys all the minimap models", () => {
      expect(minimapPackage.editorsMinimaps.size).toBe(0)
    })

    it("destroys all the minimap elements", () => {
      expect(editorElement.querySelector("atom-text-editor-minimap")).not.toExist()
    })
  })

  describe("service", () => {
    it("returns the minimap public exports", () => {
      const publicExports = Object.keys(minimapPackage.provideMinimapServiceV1())
      const allExports = Object.keys(minimapPackage)
      expect(
        publicExports.every((str) => {
          return allExports.includes(str) || console.log(str)
        })
      ).toBeTruthy()
    })

    it("creates standalone minimap with provided text editor", () => {
      const textEditor = atom.workspace.buildTextEditor({})
      const standaloneMinimap = minimapPackage.standAloneMinimapForEditor(textEditor)
      expect(standaloneMinimap.getTextEditor()).toEqual(textEditor)
    })
  })

  //    ########  ##       ##     ##  ######   #### ##    ##  ######
  //    ##     ## ##       ##     ## ##    ##   ##  ###   ## ##    ##
  //    ##     ## ##       ##     ## ##         ##  ####  ## ##
  //    ########  ##       ##     ## ##   ####  ##  ## ## ##  ######
  //    ##        ##       ##     ## ##    ##   ##  ##  ####       ##
  //    ##        ##       ##     ## ##    ##   ##  ##   ### ##    ##
  //    ##        ########  #######   ######   #### ##    ##  ######

  describe("plugins", () => {
    let [registerHandler, unregisterHandler, plugin] = []

    describe("when the displayPluginsControls setting is enabled", () => {
      beforeEach(() => {
        atom.config.set("minimap.displayPluginsControls", true)
        atom.config.set("minimap.plugins.dummy", undefined)

        plugin = {
          active: false,
          activatePlugin() {
            this.active = true
          },
          deactivatePlugin() {
            this.active = false
          },
          isActive() {
            return this.active
          },
        }

        spyOn(plugin, "activatePlugin").andCallThrough()
        spyOn(plugin, "deactivatePlugin").andCallThrough()

        registerHandler = jasmine.createSpy("register handler")
        unregisterHandler = jasmine.createSpy("unregister handler")
      })

      describe("when registered", () => {
        beforeEach(() => {
          minimapPackage.onDidAddPlugin(registerHandler)
          minimapPackage.onDidRemovePlugin(unregisterHandler)
          minimapPackage.registerPlugin("dummy", plugin)
        })

        it("makes the plugin available in the minimap", () => {
          expect(minimapPackage.plugins.dummy).toBe(plugin)
        })

        it("emits an event", () => {
          expect(registerHandler).toHaveBeenCalled()
        })

        it("creates a default config for the plugin", () => {
          expect(minimapPackage.getConfigSchema().plugins.properties.dummy).toBeDefined()
          expect(minimapPackage.getConfigSchema().plugins.properties.dummyDecorationsZIndex).toBeDefined()
        })

        it("sets the corresponding config", () => {
          expect(atom.config.get("minimap.plugins.dummy")).toBeTruthy()
          expect(atom.config.get("minimap.plugins.dummyDecorationsZIndex")).toEqual(0)
        })

        describe("triggering the corresponding plugin command", () => {
          beforeEach(() => {
            atom.commands.dispatch(workspaceElement, "minimap:toggle-dummy")
          })

          it("receives a deactivation call", () => {
            expect(plugin.deactivatePlugin).toHaveBeenCalled()
          })
        })

        describe("and then unregistered", () => {
          beforeEach(() => {
            minimapPackage.unregisterPlugin("dummy")
          })

          it("has been unregistered", () => {
            expect(minimapPackage.plugins.dummy).toBeUndefined()
          })

          it("emits an event", () => {
            expect(unregisterHandler).toHaveBeenCalled()
          })

          describe("when the config is modified", () => {
            beforeEach(() => {
              atom.config.set("minimap.plugins.dummy", false)
            })

            it("does not activates the plugin", () => {
              expect(plugin.deactivatePlugin).not.toHaveBeenCalled()
            })
          })
        })

        describe("on minimap deactivation", () => {
          beforeEach(() => {
            expect(plugin.active).toBeTruthy()
            minimapPackage.deactivate()
          })

          it("deactivates all the plugins", () => {
            expect(plugin.active).toBeFalsy()
          })
        })
      })

      describe("when the config for it is false", () => {
        beforeEach(() => {
          atom.config.set("minimap.plugins.dummy", false)
          minimapPackage.registerPlugin("dummy", plugin)
        })

        it("does not receive an activation call", () => {
          expect(plugin.activatePlugin).not.toHaveBeenCalled()
        })
      })

      describe("the registered plugin", () => {
        beforeEach(() => {
          minimapPackage.registerPlugin("dummy", plugin)
        })

        it("receives an activation call", () => {
          expect(plugin.activatePlugin).toHaveBeenCalled()
        })

        it("activates the plugin", () => {
          expect(plugin.active).toBeTruthy()
        })

        describe("when the config is modified after registration", () => {
          beforeEach(() => {
            atom.config.set("minimap.plugins.dummy", false)
          })

          it("receives a deactivation call", () => {
            expect(plugin.deactivatePlugin).toHaveBeenCalled()
          })
        })
      })
    })

    describe("when the displayPluginsControls setting is disabled", () => {
      beforeEach(() => {
        atom.config.set("minimap.displayPluginsControls", false)
        atom.config.set("minimap.plugins.dummy", undefined)

        plugin = {
          active: false,
          activatePlugin() {
            this.active = true
          },
          deactivatePlugin() {
            this.active = false
          },
          isActive() {
            return this.active
          },
        }

        spyOn(plugin, "activatePlugin").andCallThrough()
        spyOn(plugin, "deactivatePlugin").andCallThrough()

        registerHandler = jasmine.createSpy("register handler")
        unregisterHandler = jasmine.createSpy("unregister handler")
      })

      describe("when registered", () => {
        beforeEach(() => {
          minimapPackage.onDidAddPlugin(registerHandler)
          minimapPackage.onDidRemovePlugin(unregisterHandler)
          minimapPackage.registerPlugin("dummy", plugin)
        })

        it("makes the plugin available in the minimap", () => {
          expect(minimapPackage.plugins.dummy).toBe(plugin)
        })

        it("emits an event", () => {
          expect(registerHandler).toHaveBeenCalled()
        })

        it("still activates the package", () => {
          expect(plugin.isActive()).toBeTruthy()
        })

        describe("and then unregistered", () => {
          beforeEach(() => {
            minimapPackage.unregisterPlugin("dummy")
          })

          it("has been unregistered", () => {
            expect(minimapPackage.plugins.dummy).toBeUndefined()
          })

          it("emits an event", () => {
            expect(unregisterHandler).toHaveBeenCalled()
          })
        })

        describe("on minimap deactivation", () => {
          beforeEach(() => {
            expect(plugin.active).toBeTruthy()
            minimapPackage.deactivate()
          })

          it("deactivates all the plugins", () => {
            expect(plugin.active).toBeFalsy()
          })
        })
      })
    })
  })
})
