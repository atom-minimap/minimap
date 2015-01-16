<a name="v3.5.6"></a>
# v3.5.6 (2015-01-16)

## :bug: Bug Fixes

- Fix deprecations in stylesheet ([393ef8c0](https://github.com/fundon/atom-minimap/commit/393ef8c04caa9c8ace99e1626933ede3a43c8593))

<a name="v3.5.5"></a>
# v3.5.5 (2015-01-14)

## :bug: Bug Fixes

- Prevent text selection of the minimap ([#219](https://github.com/fundon/atom-minimap/pull/219)).

<a name="v3.5.4"></a>
# v3.5.4 (2015-01-07)

## :bug: Bug Fixes

- Fix error raised when clicking on minimap ([a77a94a9](https://github.com/fundon/atom-minimap/commit/a77a94a981128a5a2f1335bc02729d510dfd8310), [#198](https://github.com/fundon/atom-minimap/issues/198))
- Add guard when screenDelta is NaN ([4f1f204c](https://github.com/fundon/atom-minimap/commit/4f1f204c6b18380e5286e0e680289d62177bfd22))
- Fix screen delta not set in decoration changes ([3aa521bd](https://github.com/fundon/atom-minimap/commit/3aa521bdefab1d5c0f27169e106a2e40dca53b6a))

<a name="v3.5.3"></a>
# v3.5.3 (2015-01-07)

## :bug: Bug Fixes

- Fix broken access to minimap for editor when editor is undefined ([3127b25b](https://github.com/fundon/atom-minimap/commit/3127b25bb3d845825a3ec477da1942215f630df1), [#200](https://github.com/fundon/atom-minimap/issues/200))

<a name="v3.5.2"></a>
# v3.5.2 (2015-01-07)

## :bug: Bug Fixes

- Fix broken quick settings command in v3 mode ([8cbde1df](https://github.com/fundon/atom-minimap/commit/8cbde1dfd4a6418335ea6f5235cbbd6b627ef16b), [#194](https://github.com/fundon/atom-minimap/issues/194))

<a name="v3.5.1"></a>
# v3.5.1 (2015-01-07)

## :bug: Bug Fixes

- Fix minimap position not updated if setting change before attachment ([4b9b6242](https://github.com/fundon/atom-minimap/commit/4b9b624243cd8102bc1bd4f4a19eab1d59247b5d))
- Prevent NaN screenDelta in changes ([4f00149e](https://github.com/fundon/atom-minimap/commit/4f00149e8d98a9affe6ca3488db33aa41d1b334a))
- Stop drag gesture when mouse leaves the window ([8d026d14](https://github.com/fundon/atom-minimap/commit/8d026d147e60cb142573ebee755e5ece5028d174), [#193](https://github.com/fundon/atom-minimap/issues/193))
- Fix minimap canvas scaling when device pixel ratio > 1 ([8c066eee](https://github.com/fundon/atom-minimap/commit/8c066eee35694320687b157de5fbb8bd3f3e447d), [#192](https://github.com/fundon/atom-minimap/issues/192))
- Fix duplicated minimap when dragging tab ([83830ca4](https://github.com/fundon/atom-minimap/commit/83830ca40b34fd7361c973a96619dfb20c0bf958))

<a name="v3.5.0"></a>
# v3.5.0 (2015-01-05)

The main change in v3.5.0 is the addition of the `V4 Preview` setting that enable the new custom element based minimap. **A Restart is needed to activate the preview. Plugins may be disabled if they doesn't have been updated to suport the new API.**

The following changes mostly concerns the implementation of the new minimap.

## :sparkles: Features

- Implement minimap creation observer method for v4 ([e583763a](https://github.com/fundon/atom-minimap/commit/e583763a8f166f42f177dcb7df9379827ee0ce28))
- Implement basic minimap scroll through dragging ([769fb815](https://github.com/fundon/atom-minimap/commit/769fb8153960baac29b4f1bc4ace419db852a14d))
- Implement scroll on mouse pressed over canvas ([eb927855](https://github.com/fundon/atom-minimap/commit/eb9278552561539ce9d1ac87f45b738f12d6f573))
- Implement sublime-like minimap scroll with scroll past end ([5d5185b7](https://github.com/fundon/atom-minimap/commit/5d5185b725ba399345cfba363b44b59825782e02))  
  <br>It prevents the minimap from going past the end while the editor is.
- Implement code highlight toggle from quick settings in element ([c779f6fd](https://github.com/fundon/atom-minimap/commit/c779f6fd0eb3c7dac950d423fe95480f4b765a8c))
- Implement proper quick settings view life cycle ([9af0bd12](https://github.com/fundon/atom-minimap/commit/9af0bd12f6b9c6820c8b649f71517c4e6de79558))
- Add quick settings button in minimap element ([a2184d14](https://github.com/fundon/atom-minimap/commit/a2184d14b2b608c85a8ca7070e1c57fa1c2ea872))
- Implement minimap element destruction ([60081818](https://github.com/fundon/atom-minimap/commit/60081818e4a5af66e3245bbd3076b28b1d80a89c))
- Implement minimap model destruction ([b65698bb](https://github.com/fundon/atom-minimap/commit/b65698bb487c5d6a09cd95b263e861cef946ae04))
- Add support for adjustMinimapWidthToSoftWrap config ([b66bbbb1](https://github.com/fundon/atom-minimap/commit/b66bbbb1110b35988e60eff70ec89173307b8e7f))
- Implement a basic switch in main to enable v4 preview ([2d072921](https://github.com/fundon/atom-minimap/commit/2d072921d82006a1c75dcf65b5ff1c3447be5877))
- Implement config observers to update minimap elements ([5bea5458](https://github.com/fundon/atom-minimap/commit/5bea54580ba16270a671cba3688ae27526281be6))
- Implement minimap scroll indicator ([1128bb45](https://github.com/fundon/atom-minimap/commit/1128bb45241cf79e1b7688c65a4dd745bdf7ad61))
- Implement partial redraw on editor changes ([0c50eb55](https://github.com/fundon/atom-minimap/commit/0c50eb559070b0a2047b0ab32820ad6efd6b6b7a))
- Implement minimap on left config support in minimap element ([15a586a0](https://github.com/fundon/atom-minimap/commit/15a586a0cbb99ab70630820ad75084572cffb4ce))
- Implement resize detection with DOM polling ([a5b888ce](https://github.com/fundon/atom-minimap/commit/a5b888cece5f7570322ce7810deb5ab9cdf49e93))
- Implement canvas offset to allow smooth scroll ([57accd3c](https://github.com/fundon/atom-minimap/commit/57accd3c6e503c97eaa824cceb5f71db927442aa))
- Add support for visible area scroll in minimap element update ([f3b68565](https://github.com/fundon/atom-minimap/commit/f3b6856562918efa508505e99777117de2d5ae9b))
- Add support for editor left scroll in the minimap model ([d2f59e38](https://github.com/fundon/atom-minimap/commit/d2f59e38d85f15d1356df3675f2c1c4b466620e8))
- Add basic view update routine ([312b6080](https://github.com/fundon/atom-minimap/commit/312b60802372f17d83c147a954ac337f08a81ae2))
- Add basic content in minimap element ([8a8869d0](https://github.com/fundon/atom-minimap/commit/8a8869d07ae16d523ede73f512861b50d95438cf))
- Add view provider registration method on minimap element ([d1e95aa8](https://github.com/fundon/atom-minimap/commit/d1e95aa87161b0444179f04e7988f04d0899d314))
- Add stub for minimap element ([19f1aeaa](https://github.com/fundon/atom-minimap/commit/19f1aeaa99b19263b753c70031173afbf72ab40d))
- Implement decoration management in minimap model ([f6181c9d](https://github.com/fundon/atom-minimap/commit/f6181c9df4b60481d96ccd5a6f70752164cffc48))  <br>The biggest change so far is that changes are not stacked in the model
  but emitted as events.
- Add model method to compute the visible rows range ([5a38ef5c](https://github.com/fundon/atom-minimap/commit/5a38ef5c87d98ba02186714b8dfa8f047b9bb016))
- Add more minimap scroll related method ([990f29a1](https://github.com/fundon/atom-minimap/commit/990f29a100105c8949eb47a8478283794df7cd9a))
- Add more scroll related methods ([2e517425](https://github.com/fundon/atom-minimap/commit/2e517425bc086003f8c1fa94aa410764639fd99e))
- Add first methods in the new Minimap model ([93651f2a](https://github.com/fundon/atom-minimap/commit/93651f2a8259a68a971f1014180f3a66c19da1b3))

## :bug: Bug Fixes

- Fix missing getTextEditor method on minimap view ([569ee952](https://github.com/fundon/atom-minimap/commit/569ee952583a0b9cb116189c437f4279c92c61ab))
- Fix position of right positioned controls without using offset ([4f32ca74](https://github.com/fundon/atom-minimap/commit/4f32ca74fb0543033aa229aa4aaeab3b53df47f0))
- Change minimap width adjustments to avoid update on every DOM poll ([cca596c7](https://github.com/fundon/atom-minimap/commit/cca596c77c6eb647666a2a70646ba2c31c33da33))
- Prevent canvas resize when minimap become invisible ([43ebe7b9](https://github.com/fundon/atom-minimap/commit/43ebe7b94b41c79b5aad653b1d40691913a526e6))
- Fix minimap model not relying on screen lines ([3ea02bf5](https://github.com/fundon/atom-minimap/commit/3ea02bf51c80fe648eaaa2cc3c3e35968fe6928a))
- Fix minimap redraw when scrolling down ([d3edad15](https://github.com/fundon/atom-minimap/commit/d3edad1542195d3a627c2789107882ff39a10810))
- Bad value returned in getCharHeight ([6f804830](https://github.com/fundon/atom-minimap/commit/6f804830a98e39381656fd891ca26c9741342dbf))
- Fix missing method for decoration management in minimap ([b1911a9f](https://github.com/fundon/atom-minimap/commit/b1911a9f431dcc494d63e989fcf615a2efe4d0c9))
- Fix dom reader failing to append the node outside render view ([17ba1732](https://github.com/fundon/atom-minimap/commit/17ba1732194a47648adf9aa63a13591e064c0122))

## :racehorse: Performances

- Replace sequencial styles affectation with cssText ([f12ae20f](https://github.com/fundon/atom-minimap/commit/f12ae20f128a8dffa60438b3fa697936502c1d25))
- Use translate and translate3d for offsets ([98083d88](https://github.com/fundon/atom-minimap/commit/98083d884e9dcfc2c95625ed228c7b8bdce5761a))
- Prevent drawing tokens past the canvas width ([c7ab242f](https://github.com/fundon/atom-minimap/commit/c7ab242fc78c1be1adc911745c68cb1234211cbf))


<a name="v3.4.9"></a>
# v3.4.9 (2014-12-17)

## :bug: Bug Fixes

- Fix broken invisibles substitution when line is null ([c0c30ee9](https://github.com/fundon/atom-minimap/commit/c0c30ee9b2888c3b7a6f358208e8fd5d3212cb06), [#179](https://github.com/fundon/atom-minimap/issues/179))

<a name="v3.4.8"></a>
# v3.4.8 (2014-12-17)

## :bug: Bug Fixes

- Fix broken quick settings command ([bea14b44](https://github.com/fundon/atom-minimap/commit/bea14b44e78e079dc6813aec6e30e8c819419e4f), [#186](https://github.com/fundon/atom-minimap/issues/186))
- Fix minimum value for interline ([e4a114dc](https://github.com/fundon/atom-minimap/commit/e4a114dc99a65a003ebd4d5b4e2e3a6b0fee467d), [#175](https://github.com/fundon/atom-minimap/issues/175))

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
