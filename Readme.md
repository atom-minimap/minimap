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

* `Auto Toggle`: If checked the minimap is toggled on at startup. (default=false)
* `Display Code Highlights`: If checked the code will be highlighted using the grammar tokens.
* `Display Minimap On Left`: If checked the minimap appears on the left side of editors, otherwise it appears on the ride side. (default=false)
* `Display Plugins Controls`: If checked, the minimap plugins can be activated/deactivated from the minimap settings view and a quick settings dropdown will be available on the top right corner of the minimap. **You need to restart Atom for this setting to be effective.**
* `Line Overdraw`: The amount of lines that are rendered past the bounds of the editor view. Smaller values may result in more updates but with less lines rendered each time while larger values will reduce the latency between a scroll and the display of the previously hidden lines at the cost of a bigger update time.
* `Minimap Scroll Indicator`: Toggles the display of a side line showing which part of the buffer is currently displayed by the minimap. The side line appear only if the
* `Plugins *`: When plugins are installed, a setting is created for each to enable/disable them directly from the minimap settings view.
* `Scale`: The scale of the minimap.
* `Use Hardware Acceleration`: If checked the minimap scroll is done using a `translate3d` transform, otherwise the `translate` transform is used.

### Key Bindings

* `ctrl-k ctrl-m`: Toggles the minimap without the logs.
* `ctrl-k ctrl-d`: Toggles the minimap with the logs.
* `ctrl-k ctrl-s`: Toggles the minimap plugins quick settings dropdown.

Customizing Key Bindings:

```cson
'.editor':
  'cmd-m': 'minimap:toggle'
  'cmd-d': 'minimap:toggle-debug'
```

### Customizing Style

If you want to use another font instead of the default [Redacted][] font or change any styles, edit your `style.less` (Open Your Stylesheet).

```css
.minimap .lines {
  font-family: Monaco;
}

// hide scrollbar
.with-minimap .vertical-scrollbar {
  opacity: 0;
  width: 0;
}
```

### Contributors

https://github.com/fundon/atom-minimap/graphs/contributors

### Plugins

The minimap can be augmented with plugins, belows the list of available plugins so far:

  * [Find And Replace](https://atom.io/packages/minimap-find-and-replace)
  * [Git Diff](https://atom.io/packages/minimap-git-diff)
  * [Color Highlight](https://atom.io/packages/minimap-color-highlight)
  * [Highlight Selected](https://atom.io/packages/minimap-highlight-selected)
  * [Selection](https://atom.io/packages/minimap-selection)

When the `displayPluginsControls` setting is toggled on, plugins activation can be managed directly from the minimap package settings or by using the quick settings dropdown available on the mimimap itself:

![Minimap Screenshot](https://github.com/fundon/atom-minimap/blob/master/plugins-list.gif?raw=true)

### Wiki

* [How to create a minimap plugin?](https://github.com/fundon/atom-minimap/wiki/Plugin)

### License

MIT

[Redacted Font]: https://github.com/christiannaths/Redacted-Font
