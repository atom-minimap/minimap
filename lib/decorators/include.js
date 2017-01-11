'use strict'

/**
 * Generates a decorator function to includes many `mixto` mixins into a class.
 *
 * @param  {...Mixin} mixins the mixins to include in the class
 * @return {function(cls:Function):Function} the decorator function that will
 *                                           include the specified mixins
 * @example
 * @include(SomeMixin)
 * export default class SomeClass {
 *   // ...
 * }
 */
module.exports = function include (cls, ...mixins) {
  mixins.forEach((mixin) => { includeMixin(cls, mixin) })
}

function includeMixin (target, source) {
  Object.getOwnPropertyNames(source).forEach((k) => {
    if (['length', 'name', 'arguments', 'caller', 'prototype', 'includeInto'].indexOf(k) >= 0) { return }

    let descriptor = Object.getOwnPropertyDescriptor(source, k)
    Object.defineProperty(target, k, descriptor)
  })

  Object.getOwnPropertyNames(source.prototype).forEach((k) => {
    if (k === 'constructor') { return }

    let descriptor = Object.getOwnPropertyDescriptor(source.prototype, k)
    Object.defineProperty(target.prototype, k, descriptor)
  })
}
