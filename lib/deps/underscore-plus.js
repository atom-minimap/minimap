export function escapeRegExp (string) {
  if (string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  } else {
    return ''
  }
}

export function dasherize (string) {
  if (!string) { return '' }

  string = string[0].toLowerCase() + string.slice(1)
  return string.replace(/([A-Z])|(_)/g, function (m, letter) {
    if (letter) {
      return '-' + letter.toLowerCase()
    } else {
      return '-'
    }
  })
}
