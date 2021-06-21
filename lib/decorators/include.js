"use strict"

/**
 * Generates a decorator function to includes many `mixto` mixins into a class.
 *
 * @param {...Mixin} mixins The mixins to include in the class
 * @returns {function(cls:Function):Function} The decorator function that will include the specified mixins
 * @include(SomeMixin) export default class SomeClass {
 *   // ...
 * }
 */
export default function include(cls, ...mixins) {
  mixins.forEach((mixin) => {
    includeMixin(cls, mixin)
  })
}

function includeMixin(target, source) {
  Object.getOwnPropertyNames(source).forEach((k) => {
    if (["length", "name", "arguments", "caller", "prototype", "includeInto"].indexOf(k) >= 0) {
      return
    }

    const descriptor = Object.getOwnPropertyDescriptor(source, k)
    Object.defineProperty(target, k, descriptor)
  })

  Object.getOwnPropertyNames(source.prototype).forEach((k) => {
    if (k === "constructor") {
      return
    }

    const descriptor = Object.getOwnPropertyDescriptor(source.prototype, k)
    Object.defineProperty(target.prototype, k, descriptor)
  })
}
