
mouseEvent = (type, px, py, cx, cy) ->
  evt = undefined

  bubbles = true
  cancelable = (type isnt "mousemove")
  view = window
  detail = 0
  pageX = px
  pageY = py
  clientX = cx
  clientY = cy
  ctrlKey = false
  altKey = false
  shiftKey = false
  metaKey = false
  button = 0
  relatedTarget = `undefined`

  evt = document.createEvent("MouseEvents")
  evt.initMouseEvent type, bubbles, cancelable, view, detail, pageX, pageY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, document.body.parentNode

  evt

objectCenterCoordinates = (obj) ->
  {top, left, width, height} = obj.getBoundingClientRect()
  {x: left + width / 2, y: top + height / 2}

module.exports = {objectCenterCoordinates, mouseEvent}

['mousedown', 'mousemove', 'mouseup', 'click'].forEach (key) ->
  module.exports[key] = (obj, x, y, cx, cy) ->
    {x,y} = objectCenterCoordinates(obj) unless x? and y?

    unless cx? and cy?
      cx = x
      cy = y

    obj.dispatchEvent(mouseEvent key, x, y, cx, cy)
