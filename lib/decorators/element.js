"use strict"

if (global.__CUSTOM_HTML_ELEMENTS_CLASSES__ != null) {
  global.__ATOM_UTILS_CUSTOM_ELEMENT_CLASSES__ = global.__CUSTOM_HTML_ELEMENTS_CLASSES__;
  delete global.__CUSTOM_HTML_ELEMENTS_CLASSES__;
} else {
  if (global.__ATOM_UTILS_CUSTOM_ELEMENT_CLASSES__ == null) {
    global.__ATOM_UTILS_CUSTOM_ELEMENT_CLASSES__ = {};
  }
}

const callbackProperties = ['createdCallback', 'attachedCallback', 'detachedCallback', 'attributeChangedCallback'];

function decorateElementPrototype(target, source) {
  callbackProperties.forEach(function(k) {
    return Object.defineProperty(target, k, {
      value() {
        let ref;
        return (ref = this[`__${k}`]) != null ? ref.apply(this, arguments) : void 0;
      },
      writable: true,
      enumerable: true,
      configurable: true
    });
  });
  return Object.getOwnPropertyNames(source).forEach(function(k) {
    if (k === 'constructor') {
      return;
    }
    const descriptor = Object.getOwnPropertyDescriptor(source, k);
    if (callbackProperties.indexOf(k) > -1) {
      return Object.defineProperty(target, `__${k}`, descriptor);
    } else {
      return Object.defineProperty(target, k, descriptor);
    }
  });
};

function decorateElementClass(target, source) {
  return Object.getOwnPropertyNames(source).forEach(function(k) {
    if (k === 'length' || k === 'name' || k === 'arguments' || k === 'caller' || k === 'prototype') {
      return;
    }
    const descriptor = Object.getOwnPropertyDescriptor(source, k);
    return Object.defineProperty(target, k, descriptor);
  });
};

export default function element(cls, nodeName) {
  let elementClass, elementPrototype;
  const klass = cls
  const proto = klass.prototype;
  if (__ATOM_UTILS_CUSTOM_ELEMENT_CLASSES__[nodeName]) {
    elementClass = __ATOM_UTILS_CUSTOM_ELEMENT_CLASSES__[nodeName];
    decorateElementPrototype(elementClass.prototype, proto);
    if (klass != null) {
      decorateElementClass(elementClass, klass);
    }
    return elementClass;
  } else {
    elementPrototype = Object.create(HTMLElement.prototype);
    decorateElementPrototype(elementPrototype, proto);
    // elementClass = document.registerElement(nodeName, {
    //   prototype: Object.create(elementPrototype)
    // });
    if (klass != null) {
      decorateElementClass(elementClass, klass);
    }
    return __ATOM_UTILS_CUSTOM_ELEMENT_CLASSES__[nodeName] = elementClass;
  }
}
