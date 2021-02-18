const regexEscape = /[-/\\^$*+?.()|[\]{}]/g
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

export function debounce(func, wait, immediate) {
  var timeout, result;

  var later = function(context, args) {
    timeout = null;
    if (args) result = func.apply(context, args);
  };

  var debounced = function(...args) {
    if (timeout) clearTimeout(timeout);
    if (immediate) {
      var callNow = !timeout;
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(this, args);
    } else {
      timeout = setTimeout(function() {
        func(...args);
      }, wait);
    }

    return result;
  };

  debounced.cancel = function() {
    clearTimeout(timeout);
    timeout = null;
  };

  return debounced;
}
