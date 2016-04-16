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


#### Decorations Origin

A plugin can and should set the plugin origin on the decorations it creates so that the Minimap can easily know which order to apply on the decorations. When not provided, the plugin origin will be inferred from the path of the function invoking the `decorateMarker` method. If the origin can't be inferred the order value will always be `0` for this decoration.

```js
minimapView.decorateMarker(marker, {type: 'line', color: '#ff0000', plugin: 'my-plugin-name'})
```

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

Type|Description|Example
---|---|---
`line`|Same as the editor one, it colors the line background with a color extracted from the decoration scope.|![](https://github.com/atom-minimap/minimap/blob/master/resources/line-decorations.png?raw=true)
`gutter`|It draws a thin line on the left side of the minimap with a color extracted from the decoration scope.|![](https://github.com/atom-minimap/minimap/blob/master/resources/gutter-decorations.png?raw=true)
`highlight-under`|Correspond to an editor `highlight` decoration that is rendered before rendering the line content.|![](https://github.com/atom-minimap/minimap/blob/master/resources/highlight-under-decorations.png?raw=true)
`highlight-over`, `highlight`|Correspond to an editor `highlight` decoration that is rendered after having rendered the line content.|![](https://github.com/atom-minimap/minimap/blob/master/resources/highlight-over-decorations.png?raw=true)
`highlight-outline`|Correspond to an editor `highlight` decoration that is rendered only as an outline in the Minimap.|![](https://github.com/atom-minimap/minimap/blob/master/resources/outline-decorations.png?raw=true)
`foreground-custom`, `background-custom`|Decorations that are rendered on a per-line basis but for which you have the control over the render routine. A custom decoration must have a `render` function provided when created. This function will receive the `Decoration` object as first argument and a render context object with the following properties: <ul><li>`context`: The canvas context onto which draw the decoration</li><li>`color`: the color for the decoration, either from its properties or from its scope</li><li>`canvasWidth`: the current width of the canvas</li><li>`canvasHeight`: the current height of the canvas</li><li>`lineHeight`: the line height in pixels scaled according to the current device pixel ratio</li><li>`charWidth`: the char width in pixels scaled according to the current device pixel ratio</li><li>`charHeight`: the char height in pixels scaled according to the current device pixel ratio</li><li>`row`: the index of the row being drawn relatively to the first rendered row</li><li>`yRow`: the y position of the row in pixels in the minimap scaled according to the current device pixel ratio</li><li>`screenRow`: the index of the row being drawn</li></ul>|Foreground: ![Foreground](https://github.com/atom-minimap/minimap/blob/master/resources/foreground-custom-decorations.png?raw=true)<br/>Background: ![Background](https://github.com/atom-minimap/minimap/blob/master/resources/background-custom-decorations.png?raw=true)
