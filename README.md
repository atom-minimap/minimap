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
[Auto-Hider](https://atom.io/packages/minimap-autohider)|Hides the Minimap while editing.
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
[Quick-Highlight](https://atom.io/packages/minimap-quick-highlight)|Shows multiple selections done with the [quick-highlight](https://atom.io/packages/quick-highlight) package.
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

#### Ignore Whitespaces In Tokens

When enabled, text editor tokens are rendered as plain blocks, with no regards to the whitespaces they contains. `(default=false)`

`false`|`true`
---|---
![](https://github.com/atom-minimap/minimap/blob/master/resources/with-whitespaces.png?raw=true)|![](https://github.com/atom-minimap/minimap/blob/master/resources/without-whitespaces.png?raw=true)

### Display Plugins Controls

If checked, the Minimap plugins can be activated/deactivated from the Minimap settings view and a quick settings dropdown will be available on the top right corner of the Minimap. `(default=true)`

**You need to restart Atom for this setting to be effective.**

![](https://github.com/atom-minimap/minimap/blob/master/resources/plugins-control.png?raw=true)

#### Minimap Scroll Indicator

Toggles the display of a side line showing which part of the buffer is currently displayed by the Minimap. The side line appear only if the Minimap height is bigger than the editor view height. `(default=true)`

![](https://github.com/atom-minimap/minimap/blob/master/resources/scroll-indicator.png?raw=true)

#### Plugins *

When plugins are installed, a setting is created for each to enable/disable them directly from the Minimap settings view.

#### Plugins * Decorations Z-Index

When several plugins create decorations for the same layer, the general rule is to render the decorations as follows:

- On the background layer, the `line` decorations are rendered before the `highlight-under` decorations.
- On the foreground layer, the `highlight-over` decorations are rendered before the `highlight-outine` decorations.
- When two plugins adds the same type of decorations at the same place, the decorations are rendered in the order they have been created.

But fortunately, it's possible to reorder decorations on their specific layer using these settings. These settings works as a `z-index` in CSS, the higher the value, the higher the decorations will be in the render stack, for instance, a plugin's decorations with an order value of `1` will appear above decorations from a plugin with an order value of `0`.

#### Smooth Scrolling

Whether to offset the minimap canvas when scrolling to keep the scroll smooth. When `true` the minimap canvas will be offseted, resulting in a smoother scroll, but with the side-effect of a blurry minimap when the canvas is placed between pixels. When `false` the canvas will always stay at the same position, and will never look blurry, but the scroll will appear more jagged. `(default=true)`

`true`|`false`
---|---
![](https://github.com/atom-minimap/minimap/blob/master/resources/smooth-scroll.png?raw=true)|![](https://github.com/atom-minimap/minimap/blob/master/resources/no-smooth-scroll.png?raw=true)

#### Scroll Animation

Enable animations when scrolling the editor by clicking on the Minimap. `(default=false)`

#### Scroll Animation Duration

Duration of the scroll animation when clicking on the Minimap. `(default=300)`

#### Independent Minimap Scroll On Mouse Wheel Events

When enabled, using the mouse wheel over the Minimap will make it scroll independently of the text editor. The Minimap will still sync with the editor whenever the editor is scrolled, but it will no longer relay the mouse wheel events to the editor. `(default=false)`

![](https://github.com/atom-minimap/minimap/blob/master/resources/independent-scroll.gif?raw=true)

#### Scroll Sensitivity

The scrolling speed when the `Independent Minimap Scroll On Mouse Wheel Events` setting is enabled. `(default=0.5)`

#### Use Hardware Acceleration

If checked the Minimap scroll is done using a `translate3d` transform, otherwise the `translate` transform is used. `(default=true)`

#### Adjust Minimap Width To Soft Wrap

If this option is enabled and Soft Wrap is checked then the Minimap max width is set to the Preferred Line Length value. `(default=true)`

#### Adjust Minimap Width Only When Smaller

If this option and `adjustMinimapWidthToSoftWrap` are enabled the minimap width will never go past the limit sets by CSS. On the other hand, when disabled the minimap will expand to honor the preferred line width. `(default=true)`

#### Absolute Mode

When enabled the Minimap uses an absolute positioning, letting the editor's content flow below the Minimap. `(default=false)`

Note that this setting will do nothing if `Display Minimap On Left` is also enabled.

`false`|`true`
---|---
![](https://github.com/atom-minimap/minimap/blob/master/resources/normal-mode.png?raw=true)|![](https://github.com/atom-minimap/minimap/blob/master/resources/absolute-mode.png?raw=true)

#### Adjust Absolute Mode Height

When enabled and `Absolute Mode` is also enabled, the minimap height will be adjusted to only take the space required by the text editor content, leaving the space below triggering mouse events on the text editor. `(default=false)`

**Be aware this can have some impact on performances as the minimap canvases will be resized every time a change in the editor make its height change.**

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
atom-text-editor[with-minimap] .vertical-scrollbar {
  opacity: 0;
  width: 0;
}
```

#### Changing the Minimap's background

![minimap-custom-background](https://github.com/atom-minimap/minimap/blob/master/resources/minimap-custom-background.png?raw=true)

```css
atom-text-editor atom-text-editor-minimap {
  background: green;
}
```

#### Changing the color of the Minimap's `visible-area`

![minimap-custom-background](https://github.com/atom-minimap/minimap/blob/master/resources/minimap-custom-visible-area.png?raw=true)

```css
atom-text-editor atom-text-editor-minimap .minimap-visible-area::after {
  background-color: rgba(0, 255, 0, 0.5);
}
```

#### Changing the color of the Minimap's `scroll-indicator`

![minimap-custom-background](https://github.com/atom-minimap/minimap/blob/master/resources/minimap-custom-scroll-indicator.png?raw=true)

```css
atom-text-editor atom-text-editor-minimap .minimap-scroll-indicator {
  background-color: green;
}
```

#### Adding an opaque background to the minimap in absolute mode with adjusted height

With both `absoluteMode` and `adjustAbsoluteModeHeight` settings are enabled, the canvases in the minimap won't necessarily takes the whole editor's height.

```css
atom-text-editor, html {
  atom-text-editor-minimap canvas:first-child {
    background: @syntax-background-color;
  }
}
```

#### Disabling mouse interactions when in absolute mode

If you want to prevent to catch the mouse pointer when the `absoluteMode` setting is enabled you can use the following snippet to do so:

```css
atom-text-editor atom-text-editor-minimap {
  pointer-events: none;
}

atom-text-editor atom-text-editor-minimap .minimap-visible-area {
  pointer-events: auto;
}
```

The visible area will still allow interaction but the Minimap track won't.

#### Making Minimap visible only in the focused pane

You can put the following code in your user stylesheet to achieve this effect:

```css
atom-text-editor {
  atom-text-editor-minimap {
    display: none;
  }

  &.is-focused {
    atom-text-editor-minimap {
      display: block;
    }
  }
}
```

#### Make Minimap Visible area display like Sublime Text

Put the following code in your user stylesheet to make your minimap look like Sublime text.
It's more easy to view when you have code hightlight in minimap.

`Default State (Hidden)`|`Hover`|`Only display Visible area when hover or click/drag event.`
---|---|:---:
![](https://github.com/machinavn/minimap/blob/master/resources/on-default-minimap.png?raw=true)|![](https://github.com/machinavn/minimap/blob/master/resources/on-hover-minimap.png?raw=true)|![](https://github.com/machinavn/minimap/blob/master/resources/on-scroll-minimap.png?raw=true)

```css
atom-text-editor,
html {
    atom-text-editor-minimap {
        .minimap-visible-area {
            background-color: #7c7c7c;
            // Color of Visible area.
            opacity: 0;
            // Default 0 when you not working with minimap
            cursor: default;
            // Change cursor style to pointer.
            transition: 0.5s opacity;
            // Better UI.
            &:hover {
                opacity: 0.2;
            } // Only display Minimap visible area when working.
            &:active {
                cursor: default;
            } // Change cursor when dragging.
        }
        &:hover {
            .minimap-visible-area {
                opacity: 0.2;
                transition: opacity 1s;
            } // When Hover to all minimap area, visible area will display.
        }

        &:active {
            .minimap-visible-area {
                opacity: 0.2;
                transition: opacity 0.5s;
            } // Display Minimap visible area when dragging.
        }
    }
}

```



### ASCII Art Comments

One neat trick is to use ASCII art to create huge comments visible in the minimap. This is really efficient when navigating huge files.

![ASCII Art Comments](https://github.com/atom-minimap/minimap/blob/master/resources/ascii-comments.png?raw=true)

To generate these comments you can use on these useful Atom packages:

- [Figlet](https://atom.io/packages/figlet)
- [Figletify](https://atom.io/packages/figletify)
- [Minimap Titles](https://atom.io/packages/minimap-titles)
- [Draw Package](https://atom.io/packages/draw-package)

### Developers Documentation

- [Developers Documentation](http://github.com/atom-minimap/minimap/docs/Developers Documentation.md)
- [Minimap API Documentation](http://atom-minimap.github.io/minimap/)

### License

[MIT](./LICENSE)
