# Minimap package

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

### Shortcuts

* `ctrl-k ctrl-m` toggle the minimap without the logs
* `ctrl-k ctrl-d` toggle the minimap with the logs

Customizing Key Bindings

```cson
'.editor':
  'cmd-m': 'minimap:toggle'
  'cmd-d': 'minimap:toggle-debug'
```

### Contributors

https://github.com/fundon/atom-minimap/graphs/contributors

### Plugins

The minimap can be augmented with plugins, belows the list of available plugins so far:

  * [Find And Replace](https://atom.io/packages/minimap-find-and-replace)
  * [Git Diff](https://atom.io/packages/minimap-git-diff)
  * [Color Highlight](https://atom.io/packages/minimap-color-highlight)
  * [Highlight Selected](https://atom.io/packages/minimap-highlight-selected)

### Roadmap

* Custom style
* Smooth animation

### License

MIT

[Redacted Font]: https://github.com/christiannaths/Redacted-Font
