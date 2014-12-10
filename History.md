<a name="v3.4.7"></a>
# v3.4.7 (2014-12-10)

## :bug: Bug Fixes

- Fix broken scroll when clicking the minimap ([e9c501c9](https://github.com/fundon/atom-minimap/commit/e9c501c908b160cc4a86df9eebe911866fae6c0a), [#171](https://github.com/fundon/atom-minimap/issues/171))

<a name="v3.4.6"></a>
# v3.4.6 (2014-12-10)

## :bug: Bug Fixes

- :guardsman: Try to use the already retrieve pane when possible ([33dd8cf6](https://github.com/fundon/atom-minimap/commit/33dd8cf6bc3f9bf51d3a4cdc4b1c2dcd842a9001))
- Fix editor styles with minimap in zen mode ([6496aa92](https://github.com/fundon/atom-minimap/commit/6496aa92e05f96a5d45d0ec7d77888fd4d8cebed))

<a name="v3.4.5"></a>
# v3.4.5 (2014-12-05)

## :bug: Bug Fixes

- Fix broken view destruction with shadow DOM disabled ([7d062ec6](https://github.com/fundon/atom-minimap/commit/7d062ec601b0c63cedd2ef55f6990c96ab57f483), [#166](https://github.com/fundon/atom-minimap/issues/166))

<a name="v3.4.4"></a>
# v3.4.4 (2014-12-05)

## :bug: Bug Fixes

- Fix broken minimap when shadowRoot isn't enabled ([f5f6e779](https://github.com/fundon/atom-minimap/commit/f5f6e7792bd8ef471d2f122dabfc34e3f2adcb88))

<a name="v3.4.3"></a>
# v3.4.3 (2014-12-05)

## :bug: Bug Fixes

- Fix broken actions and navigation in quick settings ([b2114b34](https://github.com/fundon/atom-minimap/commit/b2114b348d0a66a077a27dd6ec7be121944efee6))

<a name="v3.4.2"></a>
# v3.4.2 (2014-12-05)

## :bug: Bug Fixes

- Should fix non-activation in post update hook ([659ffc63](https://github.com/fundon/atom-minimap/commit/659ffc63d7530ab340ca18054e22e708f1a9b1bf))

<a name="v3.4.1"></a>
# v3.4.1 (2014-12-05)

## :bug: Bug Fixes

- Fix atom-space-pen-views version in package.son ([90aa4588](https://github.com/fundon/atom-minimap/commit/90aa4588e8137a6f74d2883d1d10b73786b12fb4))

<a name="v3.4.0"></a>
# v3.4.0 (2014-12-05)

## :sparkles: Features

- Add an observeMinimaps method replacing eachMinimapView ([98c81307](https://github.com/fundon/atom-minimap/commit/98c8130705c6ffbf1ce4f0cf43f8654d5f5d7615))
- Add more defensive code if a marker can't be retrieved ([600e5bb1](https://github.com/fundon/atom-minimap/commit/600e5bb1ba3c855eac0312a9573d47b605b30ed5))
- Add defensive code on decorations methods ([6104fe17](https://github.com/fundon/atom-minimap/commit/6104fe17625e30af5d4f9d211d393167830f18aa))

## :bug: Bug Fixes

- Prevent removal of inexistant decorations ([a8e21c27](https://github.com/fundon/atom-minimap/commit/a8e21c277e308f6b1de44bac0da39ee4f04f0618))
- Fix broken quick settings button in minimap ([da1986a9](https://github.com/fundon/atom-minimap/commit/da1986a9510ca6410d60a7e8e5f8ff932ea2f47b))
- Fix missing decorations caused by shadow root ([f8b4ae03](https://github.com/fundon/atom-minimap/commit/f8b4ae03af85b0d4c3a10fc80490d4e11f447038))
- Fix bugs with minimap scrolling and height ([6327de96](https://github.com/fundon/atom-minimap/commit/6327de966f12a513641a59af3ac5f3321747c9c6))
- Fix retrieval of the dom colors ([b8c11bb3](https://github.com/fundon/atom-minimap/commit/b8c11bb31733d2bfbab4ed024769db4d6e1869f6))
- Fix last remaining deprecations ([0a6ea03e](https://github.com/fundon/atom-minimap/commit/0a6ea03ef278237216fe9ef66f68c0299d460e98))

## :racehorse: Performances

- Speed up rendering by sharing cache between instances ([6fd00fa6](https://github.com/fundon/atom-minimap/commit/6fd00fa6faa5dcf1d903ac663b8c7a00925391e8))

3.3.16 / 2014-12-01
===================

* fix code-highlights status in quick-settings menu

3.3.15 / 2014-11-30
===================

* fix error raised when trying to remove a decoration for a destroyed buffer

3.3.14 / 2014-11-25
===================

* fix minimap disappearing on tabs drag and drop

3.3.13 / 2014-11-20
===================

* fix minimap styles persisting after minimap deactivation
* remove key bindings for toggling command

3.3.12 / 2014-11-19
===================

* remove forgotten logging

3.3.11 / 2014-11-19
===================

* fix access to minimap view in quick settings

3.3.10 / 2014-11-18
===================

* fix minimap removed when the active item of a previous owner changed

3.3.9 / 2014-11-18
==================

* fix pane and editor styles when shadow dom is enabled

3.3.8 / 2014-11-14
==================

* exclude handling of text editor views that doesn't belong to a pane view

3.3.7 / 2014-11-12
==================

* fix links to documentation in Readme

3.3.6 / 2014-11-06
==================

* fix using `.editor` in tokens scopes breaks layout

3.3.5 / 2014-11-06
==================

* fix relying on overlayer to compute scroll offset

3.3.4 / 2014-10-22
==================

* fix access to deprecated scopes property of tokens

3.3.3 / 2014-10-13
==================

* fix invalid engine version since config changes

3.3.2 / 2014-10-10
==================

* fix minimap height not filling the whole editor height at startup

3.3.1 / 2014-10-10
==================

* fix duplication of minimap when dragging tabs between panes

3.3.0 / 2014-10-03
==================

* add option to set a max width to minimap when soft wrap is enabled

3.2.1 / 2014-10-02
==================

* fix invalid decoration change range registered when head and tail of a marker are inversed

3.2.0 / 2014-10-01
==================

* use new config schema
* fix bug with line decoration and retina display

3.1.4 / 2014-09-30
==================

* fix broken update on editor settings changes


3.1.3 / 2014-09-30
==================

* fix broken access to editor in getLinesCount when changing an editor setting

3.1.2 / 2014-09-29
==================

* fix render on retina display

3.1.1 / 2014-09-24
==================

* add config observers for editor settings that affect the minimap display
* fix various leak with config observers
* fix missing render view event dispatch on settings change

3.1.0 / 2014-09-22
==================

* add command to generate a plugin package
* fix remaining deprecated calls
* update documentation with old wiki pages
* set autoToggle true by default
* replace lineHeight by interline in settings

3.0.3 / 2014-09-19
==================

* fix issue with renamed event in Atom nightly

3.0.2 / 2014-09-19
==================

* fix the case where the minimap is positioned incorrectly when a user style alters the tab bar height

3.0.1 / 2014-09-19
==================

* fix bug with text drawing when charWidth != 1

3.0.0 / 2014-09-19
==================

* :racehorse: improved performances by switching to a canvas-based rendering
* :sparkles: add decoration API using the same interface than the Atom one
* implements a new event model based on the Atom one. Previous events re now deprecated.
* add new API documentation availaible at http://fangduncai.com/atom-minimap/

2.3.3 / 2014-08-27
==================

* handle properly the changes in the atom editors classes

2.3.2 / 2014-08-22
==================

* re-enable the minimap to work with legacy EditorView class

2.3.1 / 2014-08-19
==================

* fix a bug with removeAtKeyPath method in tests

2.3.0 / 2014-08-19
==================

* add a setting to completely turn off the plugin controls from the minimap settings.
* add a new entry in the quick settings dropdown to toggle the minimap highlights on a per-editor basis.


2.2.2 / 2014-08-17
==================

* fix a whitespace issue with Redacted font


2.2.1 / 2014-08-17
==================

* fix error raised when tokenized line doesn't have an `invisibles` property


2.2.0 / 2014-08-17
==================

* add option to toggle code highlights in the minimap

2.1.1 / 2014-08-17
==================

* fix minimap editor background hiding the underlayer

2.1.0 / 2014-08-17
==================

* add a quick access dropdown to toggle activation of minimap plugins

2.0.0 / 2014-08-16
==================

* remove the use of css scaling to render the minimap
* add new API allowing to replace an `EditorView` with a `MinimapView` for screen position computation in plugins that need to display markers over the minimap
* add click-then-drag support on the minimap *track*
* fix broken minimap in atom v0.123.0
* fix broken tests

1.6.0 / 2014-07-09
==================

* add a `Use Hardware Acceleration` option that allow to choose between `translate` or `translate3d` for the minimap scroll offset
* fix a weird rendering issue where many update of the minimap were done with various offset

1.5.2 / 2014-07-09
==================

* fix an unexpected offset on the right side of the editor contents

1.5.1 / 2014-07-09
==================

* fix with-minimap decoration removed on tab change when react editor is enabled
* fix pane styles with minimap and react editor enabled
* fix minimap line-height with react editor enabled
* fix error raised when closing the last tab in a pane

1.5.0 / 2014-07-07
==================

* add support for react editor mode

1.4.0 / 2014-06-28
==================

* fix error on line classlist access

1.3.0 / 2014-05-21
==================

* fix broken minimap when `useReactEditor` is enabled
* 🐎  remove forced hardware acceleration on minimap

1.2.0 / 2014-05-20
==================

* add a `Display Minimap On Left` setting allowing for the minimap to be placed on the left of the editor view
* add a line on the right edge of the minimap indicating how much of the buffer is displayed by the minimap. This line is only displayed if the minimap can scroll.
* add a `lineOverdraw` setting that allow to change the number of additional lines to render in the minimap. Bigger values will increase render time but will reduce the number of redraws during scrolling.

1.1.0 / 2014-05-16
==================

* removes obsolete minimap contextual menu

1.0.2 / 2014-05-15
==================

* fix inconsistent arguments passed to `eachMinimapView` callbacks for already existing minimaps

1.0.1 / 2014-05-12
==================

* fix with-minimap class removed from pane on tab close


1.0.0 / 2014-05-11
==================

* minimap views are now created for each editor and not for each pane
* add a `eachMinimapView` subscription method in `Minimap` class
* add a view aware minimap rendering, it speeds up rendering and updates for large files
* add delegation of `MinimapRenderView` methods in `MinimapView`, allowing to manipulate most of its API directory from a minimap view
* add a lines API on `MinimapRenderView` allowing to decorates lines with classes even when they are not rendered yet


0.10.0 / 2014-05-11
===================

* add Minimap.versionMatch method allowing plugins to test against minimap version

0.9.8 / 2014-05-08
==================

* add Customizing Style to Readme

0.9.7 / 2014-05-08
==================

* better rendering for ASCII characters, fix #69

0.9.6 / 2014-05-07
==================

* fix error on closing an image view pane
* add Travis CI

0.9.5 / 2014-05-04
==================

* add reference to the new highlight-selected plugin

0.9.4 / 2014-05-01
==================

* fix item move to other pane, both panes's minimap updates #65

0.9.3 / 2014-04-25
==================

* Properly stick to the editor line height

0.9.1 / 2014-04-13
==================

* fix minimap doesn't update on active view changes when auto-toggle is true, #59

0.9.0 / 2014-04-11
==================

* add minimap indicator
* split updateScrollX and updateScrollY

0.8.0 / 2014-04-10
==================

* minimap api
* minimap plugin manager

0.7.0 / 2014-04-05
==================

* use `prolix` mixin for debug
* add plugins list
* `find-and-replace` and `git-diff` now available!

0.6.0 / 2014-04-04
==================

* fix broken minimap activation on non editor view, #46
* move resizeend to main file

0.5.0 / 2014-04-03
==================

* drag-to-scroll
* using `ctrl-k ctrl-m` toggle the minimap without the logs
* using `ctrl-k ctrl-d` toggle the minimap with the logs

0.4.0 / 2014-04-02
==================

* update redacted font, fixed instead of regular
* expose an instance of a Minimap class
* refactor view to have the same structure ad editor view
* move resizeend.js to vendor dir
* store pane id as a local variable to minimize bloats
* fix scrolling when on Vim mode or in Find pane
* disalbed syncing scroll when `scroll-left-changed` of editor

0.3.0 / 2014-03-31
==================

* add `minimap-wrapper` container, wrapped `minimap-editor` and `minimap-overlayer`
* add `with-minimap` css class to pane, #16
* responsive support for minimap and tweaks css styles
* `minimap-overlayer` displayed by default, #25
* add test cases, #28
* refactor minimap views, #32
* feature minimap partial update, performance improvement #35
* subscribe `screen-lines-changed` of editor and syncing

0.2.2 / 2014-03-20
==================

* fix `@miniScrollView.data('top')` doesn't reset to 0 after switch with files

0.2.1 / 2014-03-20
==================

* supports window resize
* improve style

0.2.0 / 2014-03-19
==================

* supports to multi `paneViews`, by @abe33
* add simple `click-to-scroll`, no animation
* use css3 transform instead of left/top
* fix minimap obscured when tree view to toggled to right side of window, #9, by @Orangetronic
* fix not display empty line

0.1.4 / 2014-03-17
==================

* add Redacted font, improves styles, by @abe33
* refactors updateMinimapView
* add a config.js, defualts config
* add scrollLeft and scrollTop on minimap, sync to editor
* fix #10, js erors when opening image files

0.0.4 / 2014-03-16
==================

* add gray overlayer, toggle display over/leave
* support mousewheel, sync editor and minimap scrollTop


0.0.3 / 2014-03-14
==================

* fix #2, minimap is appearing on the right when opening settings tab
* fix #3, opening settings tab breaks when minimap is use

0.0.2 / 2014-03-13
==================

* add minimap-editor-view
* add monitor tab-bar and file-tree
