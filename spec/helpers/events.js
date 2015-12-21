'use babel'

function mouseEvent (type, properties) {
  let defaults = {
    bubbles: true,
    cancelable: (type !== 'mousemove'),
    view: window,
    detail: 0,
    pageX: 0,
    pageY: 0,
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0,
    relatedTarget: undefined
  }

  for (let k in defaults) {
    let v = defaults[k]
    if (!(properties[k] != null)) {
      properties[k] = v
    }
  }

  return new MouseEvent(type, properties)
}

function touchEvent (type, touches) {
  let event = new Event(type, {
    bubbles: true,
    cancelable: true,
    view: window,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    relatedTarget: undefined
  })
  event.touches = event.changedTouches = event.targetTouches = touches

  return event
}

function objectCenterCoordinates (obj) {
  let {top, left, width, height} = obj.getBoundingClientRect()
  return {x: left + width / 2, y: top + height / 2}
}

function exists (value) {
  return (typeof value !== 'undefined' && value !== null)
}

module.exports = {objectCenterCoordinates, mouseEvent}

;['mousedown', 'mousemove', 'mouseup', 'click'].forEach((key) => {
  module.exports[key] = function (obj, {x, y, cx, cy, btn} = {}) {
    if (!((typeof x !== 'undefined' && x !== null) && (typeof y !== 'undefined' && y !== null))) {
      let o = objectCenterCoordinates(obj)
      x = o.x
      y = o.y
    }

    if (!((typeof cx !== 'undefined' && cx !== null) && (typeof cy !== 'undefined' && cy !== null))) {
      cx = x
      cy = y
    }

    obj.dispatchEvent(mouseEvent(key, {
      pageX: x, pageY: y, clientX: cx, clientY: cy, button: btn
    }))
  }
})

module.exports.mousewheel = function (obj, deltaX = 0, deltaY = 0) {
  obj.dispatchEvent(mouseEvent('mousewheel', {deltaX, deltaY}))
}

;['touchstart', 'touchmove', 'touchend'].forEach((key) => {
  module.exports[key] = function (obj, touches) {
    if (!Array.isArray(touches)) {
      touches = [touches]
    }

    touches.forEach((touch) => {
      if (!exists(touch.target)) {
        touch.target = obj
      }

      if (!(exists(touch.pageX) && exists(touch.pageY))) {
        let o = objectCenterCoordinates(obj)
        touch.pageX = exists(touch.x) ? touch.x : o.x
        touch.pageY = exists(touch.y) ? touch.y : o.y
      }

      if (!(exists(touch.clientX) && exists(touch.clientY))) {
        touch.clientX = touch.pageX
        touch.clientY = touch.pageY
      }
    })

    obj.dispatchEvent(touchEvent(key, touches))
  }
})
