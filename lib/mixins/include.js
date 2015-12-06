'use babel'

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
export default function include (...mixins) {
  return function performInclusion (cls) {
    mixins.forEach((mixin) => { mixin.includeInto(cls) })
    return cls
  }
}
