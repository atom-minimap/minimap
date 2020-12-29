const isDev = process.env.NODE_ENV !== "production"

module.exports = {
  // "module": false, // controlled by Parcel
  "compress": {
    "ecma": "2018", // Change based on the target
    // "toplevel": true, // controlled by Parcel
    "hoist_vars": false,
    "hoist_funs": true,
    "pure_getters": true,
    "unsafe": true,
    "unsafe_arrows": true,
    "unsafe_comps": true,
    "unsafe_Function": true,
    "unsafe_math": true,
    "unsafe_symbols": true,
    "unsafe_methods": true,
    "unsafe_proto": true,
    "unsafe_regexp": true,
    "unsafe_undefined": true,
    "passes": isDev ? 0 : 2,
  },
  "parse": {
    "ecma": 2020
  },
  "mangle": !isDev,
  "format": {
    "beautify": isDev
  },
}
