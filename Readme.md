# Minimap package [![Build Status](https://travis-ci.org/fundon/atom-minimap.svg?branch=master)](https://travis-ci.org/fundon/atom-minimap)

A preview of the full source code.

![Minimap Screenshot](https://github.com/fundon/atom-minimap/blob/master/screenshot.png?raw=true)

### Installation

```
apm install minimap
```

### Features

* Mouse wheel and click-to-scroll _(no animation)_
* Drag-to-scroll

### Settings

* `Auto Toggle`: If checked the minimap is toggled on at startup. (default=true)
* `Display Code Highlights`: If checked the code will be highlighted using the grammar tokens. (default=true)
* `Display Minimap On Left`: If checked the minimap appears on the left side of editors, otherwise it appears on the ride side. (default=false)
* `Char Height`: The height of a character in the minimap in pixels. (default=2)
* `Char Width`: The width of a character in the minimap in pixels. (default=1)
* `Interline`: The space between lines in the minimap in pixels. (default=1)
* `Text Opacity`: The opacity used to render the line text in the minimap. (default=0.6)
* `Display Plugins Controls`: If checked, the minimap plugins can be activated/deactivated from the minimap settings view and a quick settings dropdown will be available on the top right corner of the minimap. **You need to restart Atom for this setting to be effective.** (default=true)
* `Minimap Scroll Indicator`: Toggles the display of a side line showing which part of the buffer is currently displayed by the minimap. The side line appear only if the minimap height is bigger than the editor view height. (default=true)
* `Plugins *`: When plugins are installed, a setting is created for each to enable/disable them directly from the minimap settings view.
* `Use Hardware Acceleration`: If checked the minimap scroll is done using a `translate3d` transform, otherwise the `translate` transform is used. (default=true)

### Key Bindings

Customizing Key Bindings:

```cson
'.editor':
  'cmd-m': 'minimap:toggle'
```

### Customizing Style

If you want to hide the default editor scrollbar, edit your `style.less` (Open Your Stylesheet).

```css
// hide scrollbar
.with-minimap atom-text-editor .vertical-scrollbar,
.with-minimap atom-text-editor::shadow .vertical-scrollbar {
  opacity: 0;
  width: 0;
}
```

### Contributors

https://github.com/fundon/atom-minimap/graphs/contributors

### Plugins

The minimap can be augmented with plugins.

Plugins can be created with the `Minimap: Generate Plugin` command available in the command palette.

Below is the list of available plugins so far:

  * [Find And Replace](https://atom.io/packages/minimap-find-and-replace)
  * [Git Diff](https://atom.io/packages/minimap-git-diff)
  * [Color Highlight](https://atom.io/packages/minimap-color-highlight)
  * [Highlight Selected](https://atom.io/packages/minimap-highlight-selected)
  * [Selection](https://atom.io/packages/minimap-selection)

When the `displayPluginsControls` setting is toggled on, plugins activation can be managed directly from the minimap package settings or by using the quick settings dropdown available on the mimimap itself:

![Minimap Screenshot](https://github.com/fundon/atom-minimap/blob/master/plugins-list.gif?raw=true)

### Documentation

* [Minimap API Documentation](http://abe33.github.io/atom-minimap/)
* [How to create a minimap plugin?](http://abe33.github.io/atom-minimap/docs/Plugins.md.html)
* [Minimap's Decorations API](http://abe33.github.io/atom-minimap/docs/Decorations.md.html)

### License

MIT
