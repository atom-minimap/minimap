# Minimap Decorations

The minimap view mimic the decoration API available on editors so that you can easily add your own decorations on the minimap.

While the interface is the same, some details such as the available decorations types change relatively to the editor's decorations API.

### Scope And Styling

The most important change is that decorations on the minimap doesn't use a `class`, but rather a `scope`

```coffee
minimapView.decorateMarker(marker, type: 'line', scope: '.scope .to .the.marker.style')
```

It's still possible to pass a class parameter to the decoration:


```coffee
minimapView.decorateMarker(marker, type: 'line', class: 'the marker style')
```

In that case, when rendering the decoration a scope will be build that will look like `.minimap .editor .the.marker.style`.

The reason of using a scope rather than a class is that while editor's decorations are part of the dom and benefit of the styles cascading, minimap's decorations, rendered in a canvas, do not. In order to work around that, decoration's styles are defined using a `scope` property containing the selector allowing to retrieve the decoration style.

This allow the minimap decorations to still be stylable using css. For instance, the scope used by the `minimap-selection` package is:

```css
.minimap .editor .selection .region
```

Note that the scope is prefixed with `.minimap` so that you can override the selection style in the minimap without impacting the editor's one.

Also note that only the `background` property will be retrieved to style a decoration.

A last option is to pass a css color directly in a `color` option, such as:

```coffee
minimapView.decorateMarker(marker, type: 'line', color: '#ff0000')
```

In that case neither the scope nor the class will be used.

### Decorations Types

Another non-trivial change is the list of available decoration's type. At the time, the available types on the minimap are:

- `line`: Same as the editor one, it colors the line background with a color extracted from the decoration scope.
- `highlight-under`: Correspond to an editor `highlight` decoration that is rendered before rendering the line content.
- `highlight-over`, `highlight`: Correspond to an editor `highlight` decoration that is rendered after having rendered the line content.
