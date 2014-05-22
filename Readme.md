# Minimap package [![Build Status](https://travis-ci.org/fundon/atom-minimap.svg?branch=master)](https://travis-ci.org/fundon/atom-minimap)

A preview of the full source code.

![Minimap Screenshot](https://github.com/fundon/atom-minimap/blob/master/screenshot.png?raw=true)

### Installation

```
apm install minimap
```

### Features

* [Redacted Font][]
* Multiple Panes
* Responsive
* Mouse wheel and click-to-scroll _(no animation)_
* Drag-to-scroll

### Settings

* `Auto Toggle`: If checked the minimap is toggled on at startup. (default=false)
* `Display Minimap On Left`: If checked the minimap appears on the left side of editors, otherwise it appears on the ride side. (default=false)

### Shortcuts

* `ctrl-k ctrl-m` toggle the minimap without the logs
* `ctrl-k ctrl-d` toggle the minimap with the logs

Customizing Key Bindings

```cson
'.editor':
  'cmd-m': 'minimap:toggle'
  'cmd-d': 'minimap:toggle-debug'
```

### Customizing Style

If you want to use another font instead of the default Redacted font or change any styles, edit your `style.less` (Open Your Stylesheet).

```css
.minimap .lines {
  font-family: Monaco;
}

// hide scrollbar
.with-minimap .vertical-scrollbar {
  opacity: 0;
  width: 0;
}
...
```

### Contributors

https://github.com/fundon/atom-minimap/graphs/contributors

### Plugins

The minimap can be augmented with plugins, belows the list of available plugins so far:

  * [Find And Replace](https://atom.io/packages/minimap-find-and-replace)
  * [Git Diff](https://atom.io/packages/minimap-git-diff)
  * [Color Highlight](https://atom.io/packages/minimap-color-highlight)
  * [Highlight Selected](https://atom.io/packages/minimap-highlight-selected)

Plugins activation can be managed directly from the minimap package settings.

### Wiki

* [How to create a minimap plugin?](https://github.com/fundon/atom-minimap/wiki/Plugin)

### Roadmap

* Smooth animation

### License

MIT

[Redacted Font]: https://github.com/christiannaths/Redacted-Font
