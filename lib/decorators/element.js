"use strict"

import { registerOrUpdateElement } from "atom-utils-plus"

/**
 * Generates a decorator function to convert a class into a custom element through the `registerOrUpdateElement` method
 * from `atom-utils-plus`.
 *
 * The decorator will take care to return the generated element class so that you can just export it directly as
 * demonstrated below.
 *
 * As supported by the `registerOrUpdateElement` method, static member will be available on the new class.
 *
 * **Note: As there's some limitations when modifying the prototype of a custom element, if you need to inject element
 * callbacks (like `createdCallback`) through a mixin, the mixins should be included before converting the class as a
 * custom element. You'll be able to achieve that by placing the `include` decorator after the `element` one as shown in
 * the second example.**
 *
 * @param {string} elementName The node name of the element to register
 * @returns {Function} The element class as returned by `document.registerElement`
 * @element('dummy-element-name') export default class SomeClass {
 *   // ...
 * }
 * @element('dummy-element-with-mixin')
 * @include(SomeMixin) export default class SomeClass {
 *   // ...
 * }
 */
export default function element(cls, elementName) {
  return registerOrUpdateElement(elementName, { class: cls })
}
