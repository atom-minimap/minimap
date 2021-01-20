const isDev = process.env.NODE_ENV !== "production"
const isTest = process.env.NODE_ENV === "test"
const isReadable = process.env.READABLE_BUILD || isDev || isTest

export default {
  // "module": false, // controlled by Parcel
  compress: {
    global_defs: {
      // remove spec specific code for production
      "@atom.inSpecMode": !isTest ? "() => false" : "() => true",
    },
    ecma: "2018", // Change based on the target
    toplevel: false,
    hoist_vars: false,
    hoist_funs: true,
    pure_getters: true,
    unsafe: true,
    unsafe_arrows: true,
    unsafe_comps: true,
    unsafe_Function: true,
    unsafe_math: true,
    unsafe_symbols: true,
    unsafe_methods: true,
    unsafe_proto: true,
    unsafe_regexp: true,
    unsafe_undefined: true,
    passes: isDev ? 0 : 2,
  },
  parse: {
    ecma: 2020,
  },
  mangle: isReadable ? false : true,
  format: {
    beautify: isReadable,
  },
}
