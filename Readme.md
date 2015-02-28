# Minimap package [![Build Status](https://travis-ci.org/atom-minimap/minimap.svg?branch=master)](https://travis-ci.org/atom-minimap/minimap)

A preview of the full source code.

![Minimap Screenshot](https://github.com/atom-minimap/minimap/blob/master/screenshot.png?raw=true)

### Installation

```
apm install minimap
```

### Features

* Plugin API: Use the plugin generation command and start developing your plugin right away.
* Decoration API: Use the same API to manage `TextEditor` and `Minimap` decorations.
* Canvas-based Rendering: Simple, fast and flexible.

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

For instance the following result is obtained by setting a `Char Height` of `1px`:

![Minimap Screenshot](https://github.com/atom-minimap/minimap/blob/master/screenshot-alternate.png?raw=true)

### Key Bindings

Customizing Key Bindings:

```cson
'atom-workspace':
  'cmd-m': 'minimap:toggle'
  'ctrl-alt-cmd-m': 'minimap:generate-plugin'
```

### Hiding Scrollbars

If you want to hide the default editor scrollbar, edit your `style.less` (Open Your Stylesheet) and use the following snippet:

```css
atom-text-editor .vertical-scrollbar,
atom-text-editor::shadow .vertical-scrollbar {
  opacity: 0;
  width: 0;
}
```

### Plugins

#### Plugin Generation Command

Use the `Minimap: Generate Plugin` command available in the command palette or add a binding to the `minimap:generate-plugin` event:

```cson
'atom-workspace':
  'ctrl-alt-cmd-m': 'minimap:generate-plugin'
```

#### Available Plugins

Below is the list of available plugins so far:

  * [Find And Replace](https://atom.io/packages/minimap-find-and-replace)
  * [Git Diff](https://atom.io/packages/minimap-git-diff)
  * [Color Highlight](https://atom.io/packages/minimap-color-highlight)
  * [Highlight Selected](https://atom.io/packages/minimap-highlight-selected)
  * [Selection](https://atom.io/packages/minimap-selection)

#### Plugins Controls

When the `displayPluginsControls` setting is toggled on, plugins activation can be managed directly from the minimap package settings or by using the quick settings dropdown available on the mimimap itself:

![Minimap Screenshot](https://github.com/atom-minimap/minimap/blob/master/plugins-list.gif?raw=true)

### External Documentation

* [Minimap API Documentation](https://atom-minimap.github.io/minimap/)
* [How to create a minimap plugin?](https://atom-minimap.github.io/minimap/docs/Plugins.md.html)
* [Minimap's Decorations API](https://atom-minimap.github.io/minimap/docs/Decorations.md.html)
* [Quick Personal Hacks](https://atom-minimap.github.io/minimap/docs/Quick-Personal-Hacks.md.html)

### Contributing

The `minimap` package try to follow the [Atom contribution guidelines](https://atom.io/docs/latest/contributing).

Especially, the commits should follow the conventions defined in the *Git Commit Messages* section of the guideline.

The `CHANGELOG` content is then generated using the [changelog-gen utils](https://github.com/abe33/changelog-gen).

[See all contributors](https://github.com/atom-minimap/minimap/graphs/contributors)

### License

MIT
