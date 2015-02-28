# Quick Personal Hacks

### keymap.cson

You can open this file in an editor from the Atom > Open Your Keymap menu.

```cson
'atom-workspace':
  'cmd-m': 'minimap:toggle'
  'ctrl-alt-cmd-m': 'minimap:generate-plugin'
```


### styles.less

You can open this file in an editor from the Atom > Open Your Stylesheet menu.

#### Hiding the vertical-scrollbar

```css
atom-text-editor .vertical-scrollbar,
atom-text-editor::shadow .vertical-scrollbar {
  opacity: 0;
  width: 0;
}
```

#### Changing the background of the Minimap

```css
atom-text-editor::shadow atom-text-editor-minimap,
atom-text-editor atom-text-editor-minimap {
  background: rgba(255,255,255, 0.1);
}
```

#### Changing the background of the Minimap's `visible-area`

```css
atom-text-editor::shadow atom-text-editor-minimap::shadow .minimap-visible-area,
atom-text-editor atom-text-editor-minimap::shadow .minimap-visible-area {
  background-color: green;
  opacity: .5;
}
```

#### Changing the background of the Minimap's `scroll-indicator`

```css
atom-text-editor::shadow atom-text-editor-minimap::shadow .minimap-scroll-indicator,
atom-text-editor atom-text-editor-minimap::shadow .minimap-scroll-indicator {
  background-color: green;
}
```