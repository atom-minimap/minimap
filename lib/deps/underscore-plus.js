const regexEscape = /[$()*+./?[\\\]^{|}-]/g
export function escapeRegExp(string) {
  if (string) {
    return string.replace(regexEscape, "\\$&")
  } else {
    return ""
  }
}

const regexDaherize = /([A-Z])|(_)/g
export function dasherize(string) {
  if (!string) {
    return ""
  }

  string = `${string[0].toLowerCase()}${string.slice(1)}`
  return string.replace(regexDaherize, function (m, letter) {
    if (letter) {
      return `-${letter.toLowerCase()}`
    } else {
      return "-"
    }
  })
}

export function debounce(callback, wait) {
  let timeoutId
  return (...args) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      callback(...args)
    }, wait)
  }
}
