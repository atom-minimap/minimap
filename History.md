0.9.4 / 2014/05-01
==================

* fix item move to other pane, both panes's minimap updates #65

0.9.3 / 2014/04-25
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
