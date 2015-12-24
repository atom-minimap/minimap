[![Build Status](https://travis-ci.org/atom-minimap/minimap.svg?branch=master)](https://travis-ci.org/atom-minimap/minimap)
[![APM Version](https://img.shields.io/apm/v/minimap.svg)](https://atom.io/packages/minimap)
[![APM Downloads](https://img.shields.io/apm/dm/minimap.svg)](https://atom.io/packages/minimap)

# Minimap package

A preview of the full source code.

![Minimap Screenshot](https://github.com/atom-minimap/minimap/blob/master/resources/screenshot.png?raw=true)
<small>In the screenshot above the minimap-git-diff and minimap-highlight-selected plugins are activated.</small>

### Installation

```
apm install minimap
```

### Features

* Service-based Plugin API: Use the plugin generation command and start developing your plugin right away.
* Decoration API: Use the same API to manage `TextEditor` and `Minimap` decorations.
* Canvas-based Rendering: Simple, fast and flexible.
* Stand-alone Mode: Wants to display a preview of a text editor in your UIs, use a stand-alone version of the Minimap.

### Available Plugins

Below is the list of available plugins so far:

Package|Description
---|---
[Auto-Hide](https://atom.io/packages/minimap-autohide)|Hides the Minimap while editing.
[Bookmarks](https://atom.io/packages/minimap-bookmarks)|Displays Atom bookmarks.
[Code Glance](https://atom.io/packages/minimap-codeglance)|Shows the code that's under the mouse cursor when hovering the Minimap.
[Cursor Line](https://atom.io/packages/minimap-cursorline)|Highlights the line with cursor.
[Find And Replace](https://atom.io/packages/minimap-find-and-replace)|Displays the search matches.
[Git Diff](https://atom.io/packages/minimap-git-diff)|Displays the file diff.
[Google-Repo-Diff-Minimap](https://atom.io/packages/google-repo-diff-minimap)|A Minimap binding for the [google-repo-diff](https://atom.io/packages/google-repo-diff) package and [google-repo](https://atom.io/packages/google-repo) package.
[GPool-Diff-Minimap](https://atom.io/packages/gpool-diff-minimap)|A minimap binding for the [gpool-diff](https://atom.io/packages/gpool-diff) package.
[Hide on inactive panes](https://atom.io/packages/minimap-hide)|Hide the Minimap when pane isn't focus.
[Highlight Selected](https://atom.io/packages/minimap-highlight-selected)|A Minimap binding for the [highlight-selected](http://atom.io/packages/highlight-selected) package.
[Linter](https://atom.io/packages/minimap-linter)|Displays [linter](https://atom.io/packages/linter) markers.
[Pigments](https://atom.io/packages/minimap-pigments)|Displays the [Pigments](https://atom.io/packages/pigments) colors.
[Selection](https://atom.io/packages/minimap-selection)|Display the buffer's selections.
[Split-Diff](https://atom.io/packages/minimap-split-diff)|A Minimap binding for the [split-diff](https://atom.io/packages/split-diff) package.

### Settings

#### Auto Toggle

If checked the Minimap is toggled on at startup. `(default=true)`

#### Device Pixel Ratio Rounding

If checked the `devicePixelRatio` will be rounded using `Math.floor`. `(default=true)`

#### Display Code Highlights

If checked the code will be highlighted using the grammar tokens. `(default=true)`

`true`|`false`
---|---
![](https://github.com/atom-minimap/minimap/blob/master/resources/with-code-highlights.png?raw=true)| ![](https://github.com/atom-minimap/minimap/blob/master/resources/without-code-highlights.png?raw=true)

#### Display Minimap On Left

If checked the Minimap appears on the left side of editors, otherwise it appears on the right side. `(default=false)`

`true`|`false`
---|---
![](https://github.com/atom-minimap/minimap/blob/master/resources/minimap-on-left.png?raw=true)|![](https://github.com/atom-minimap/minimap/blob/master/resources/minimap-on-right.png?raw=true)

#### Char Height

The height of a character in the Minimap in pixels. `(default=2)`

`1px`|`2px`|`4px`
---|---|---
![](https://github.com/atom-minimap/minimap/blob/master/resources/1px-char-height.png?raw=true)|![](https://github.com/atom-minimap/minimap/blob/master/resources/2px-char-height.png?raw=true)|![](https://github.com/atom-minimap/minimap/blob/master/resources/4px-char-height.png?raw=true)

#### Char Width

The width of a character in the Minimap in pixels. `(default=1)`

`1px`|`2px`
---|---
![](https://github.com/atom-minimap/minimap/blob/master/resources/1px-char-width.png?raw=true)|![](https://github.com/atom-minimap/minimap/blob/master/resources/2px-char-width.png?raw=true)

#### Interline

The space between lines in the Minimap in pixels. `(default=1)`

`1px`|`2px`
---|---
![](https://github.com/atom-minimap/minimap/blob/master/resources/1px-interline.png?raw=true)|![](https://github.com/atom-minimap/minimap/blob/master/resources/2px-interline.png?raw=true)

#### Text Opacity

The opacity used to render the line text in the Minimap. `(default=0.6)`

`0.6`|`1`
---|---
![](https://github.com/atom-minimap/minimap/blob/master/resources/text-opacity-default.png?raw=true)|![](https://github.com/atom-minimap/minimap/blob/master/resources/text-opacity-1.png?raw=true)

### Display Plugins Controls

If checked, the Minimap plugins can be activated/deactivated from the Minimap settings view and a quick settings dropdown will be available on the top right corner of the Minimap. `(default=true)`

**You need to restart Atom for this setting to be effective.**

![](https://github.com/atom-minimap/minimap/blob/master/resources/plugins-control.png?raw=true)

#### Minimap Scroll Indicator

Toggles the display of a side line showing which part of the buffer is currently displayed by the Minimap. The side line appear only if the Minimap height is bigger than the editor view height. `(default=true)`

![](https://github.com/atom-minimap/minimap/blob/master/resources/scroll-indicator.png?raw=true)

#### Plugins *

When plugins are installed, a setting is created for each to enable/disable them directly from the Minimap settings view.

#### Smooth Scrolling

Whether to offset the minimap canvas when scrolling to keep the scroll smooth. When `true` the minimap canvas will be offseted, resulting in a smoother scroll, but with the side-effect of a blurry minimap when the canvas is placed between pixels. When `false` the canvas will always stay at the same position, and will never look blurry, but the scroll will appear more jagged. `(default=true)`

`true`|`false`
---|---
![](https://github.com/atom-minimap/minimap/blob/master/resources/smooth-scroll.png?raw=true)|![](https://github.com/atom-minimap/minimap/blob/master/resources/no-smooth-scroll.png?raw=true)

#### Scroll Animation

Enable animations when scrolling the editor by clicking on the Minimap. `(default=false)`

#### Scroll Animation Duration

Duration of the scroll animation when clicking on the Minimap. `(default=300)`


#### Use Hardware Acceleration

If checked the Minimap scroll is done using a `translate3d` transform, otherwise the `translate` transform is used. `(default=true)`

#### Absolute Mode

When enabled the Minimap uses an absolute positioning, letting the editor's content flow below the Minimap. `(default=true)`

Note that this setting will do nothing if `Display Minimap On Left` is also enabled.

`false`|`true`
---|---
![](https://github.com/atom-minimap/minimap/blob/master/resources/normal-mode.png?raw=true)|![](https://github.com/atom-minimap/minimap/blob/master/resources/absolute-mode.png?raw=true)

### Key Bindings

The Minimap package doesn't provide any default keybindings. But you can define your own as demonstrated below:

```coffee
'atom-workspace':
  'cmd-m': 'minimap:toggle'
  'ctrl-alt-cmd-j': 'minimap:generate-javascript-plugin'
  'ctrl-alt-cmd-b': 'minimap:generate-babel-plugin'
  'ctrl-alt-cmd-c': 'minimap:generate-coffee-plugin'
```

### Tweaking The Minimap

#### Hiding scrollbars

If you want to hide the default editor scrollbar, edit your `style.less` (Open Your Stylesheet) and use the following snippet:

```css
atom-text-editor .vertical-scrollbar,
atom-text-editor::shadow .vertical-scrollbar {
  opacity: 0;
  width: 0;
}
```

#### Changing the Minimap's background

![minimap-custom-background](https://github.com/atom-minimap/minimap/blob/master/resources/minimap-custom-background.png?raw=true)

```css
atom-text-editor atom-text-editor-minimap,
atom-text-editor::shadow atom-text-editor-minimap {
  background: green;
}
```

#### Changing the color of the Minimap's `visible-area`

![minimap-custom-background](https://github.com/atom-minimap/minimap/blob/master/resources/minimap-custom-visible-area.png?raw=true)

```css
atom-text-editor atom-text-editor-minimap::shadow .minimap-visible-area,
atom-text-editor::shadow atom-text-editor-minimap::shadow .minimap-visible-area {
  background-color: green;
  opacity: .5;
}
```

#### Changing the color of the Minimap's `scroll-indicator`

![minimap-custom-background](https://github.com/atom-minimap/minimap/blob/master/resources/minimap-custom-scroll-indicator.png?raw=true)

```css
atom-text-editor atom-text-editor-minimap::shadow .minimap-scroll-indicator,
atom-text-editor::shadow atom-text-editor-minimap::shadow .minimap-scroll-indicator {
  background-color: green;
}
```

#### Disabling mouse interactions when in absolute mode

If you want to prevent to catch the mouse pointer when the `absoluteMode` setting is enabled you can use the following snippet to do so:

```css
atom-text-editor atom-text-editor-minimap,
atom-text-editor::shadow atom-text-editor-minimap {
  pointer-events: none;
}

atom-text-editor atom-text-editor-minimap::shadow .minimap-visible-area,
atom-text-editor::shadow atom-text-editor-minimap::shadow .minimap-visible-area {
  pointer-events: auto;
}
```

The visible area will still allow interaction but the Minimap track won't.

### ASCII Art Comments

One neat trick is to use ASCII art to create huge comments visible in the minimap. This is really efficient when navigating huge files.

![ASCII Art Comments](https://github.com/atom-minimap/minimap/blob/master/resources/ascii-comments.png?raw=true)

To generate these comments you can use on these useful Atom packages:

- [Figlet](https://atom.io/packages/figlet)
- [Figletify](https://atom.io/packages/figletify)
- [Minimap Titles](https://atom.io/packages/minimap-titles)
- [Draw Package](https://atom.io/packages/draw-package)

----

## Developers Documentation

You can find below the developers documentation on how to create Minimap's plugins and how to use decorations and stand-alone Minimaps.

For a more detailled documentation of the API make sure to check the [Minimap API Documentation](http://atom-minimap.github.io/minimap/).

### Plugins

The Minimap comes with a plugin system used to extend the features displayed in it. Minimap plugins, once activated, are known and can be managed through the Minimap settings.

#### Plugin Generation Command

Use the `Generate Javascript Plugin`, `Generate Coffee Plugin` or `Generate Babel Plugin` commands, available in the command palette, to generate a new Minimap plugin package.

- `Minimap: Generate Javascript Plugin`: Will generate a vanilla JavaScript package.
- `Minimap: Generate Coffee Plugin`: Will generate a CoffeeScript package.
- `Minimap: Generate Babel Plugin`: Will generate a ES6 package that uses babel-js.

#### Plugins Controls

When the `displayPluginsControls` setting is toggled on, plugins activation can be managed directly from the Minimap package settings or by using the quick settings dropdown available on the Mimimap itself:

![Minimap Screenshot](https://github.com/atom-minimap/minimap/blob/master/resources/plugins-list.gif?raw=true)

### Stand-alone Mode

Starting with version 4.13, the Minimap can operate in a stand-alone mode. Basically, it means that a Minimap can be appended to the DOM outside of a `TextEditor` and without being affected by it.

The example below demonstrates how to retrieve and display a stand-alone Minimap:

```js
atom.packages.serviceHub.consume('minimap', '1.0.0', (api) => {
  editor = atom.workspace.getActiveTextEditor()
  minimap = api.standAloneMinimapForEditor(editor)

  minimapElement = atom.views.getView(minimap)
  minimapElement.attach(document.body)
  minimapElement.style.cssText = `
    width: 300px;
    height: 300px;
    position: fixed;
    top: 0;
    right: 100px;
    z-index: 10;
  `
})
```

In a nutshell, here's the main changes to expect when using a stand-alone Minimap:

- In stand-alone mode, it's the `MinimapElement` that is responsible to sets the size of the underlying `Minimap` model, so you can give it any size and the Minimap will just adapt to it.
- Scrolling in the target `TextEditor` won't change the Minimap display.
- The mouse controls in the Minimap are removed.
- The visible area and the quick settings button are removed.
- Stand-alone Minimaps aren't dispatched in the `observeMinimaps` callback, so they won't be targeted by plugins and won't receive the decorations that plugins normally creates on Minimaps.

For the moment, stand-alone Minimaps still need a target `TextEditor` but I hope to make it work with just a path at some point.

### Minimap Decorations

The Minimap package mimic the decoration API available on editors so that you can easily add your own decorations on the Minimap.

While the interface is the same, some details such as the available decorations types change relatively to the editor's decorations API.

#### Scope And Styling

The most important change is that decorations on the Minimap doesn't use a `class`, but rather a `scope`

```js
minimapView.decorateMarker(marker, {type: 'line', scope: '.scope .to .the.marker.style'})
```

It's still possible to pass a class parameter to the decoration:


```js
minimapView.decorateMarker(marker, {type: 'line', class: 'the marker style'})
```

In that case, when rendering the decoration a scope will be build that will look like `.minimap .editor .the.marker.style`.

The reason of using a scope rather than a class is that while editor's decorations are part of the DOM and benefit of the styles cascading, Minimap's decorations, rendered in a canvas, do not. In order to work around that, decoration's styles are defined using a `scope` property containing the selector allowing to retrieve the decoration style.

This allow the Minimap decorations to still be styled using css. For instance, the scope used by the `minimap-selection` package is:

```css
.minimap .editor .selection .region {
  /* ... */
}
```

Note that the scope is prefixed with `.minimap` so that you can override the selection style in the Minimap without impacting the editor's one.

Also note that only the `background` property will be retrieved to style a decoration.

A last option is to pass a css color directly in a `color` option, such as:

```js
minimapView.decorateMarker(marker, {type: 'line', color: '#ff0000'})
```

In that case neither the scope nor the class will be used.

#### Decorations Types

Another non-trivial change is the list of available decoration's type. At the time, the available types on the Minimap are:

- `line`: Same as the editor one, it colors the line background with a color extracted from the decoration scope.
- `highlight-under`: Correspond to an editor `highlight` decoration that is rendered before rendering the line content.
- `highlight-over`, `highlight`: Correspond to an editor `highlight` decoration that is rendered after having rendered the line content.
- `highlight-outline`: Correspond to an editor `highlight` decoration that is rendered only as an outline in the Minimap.

### License

[MIT](./LICENSE)
