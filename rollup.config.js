import { createPlugins } from "rollup-plugin-atomic"

const plugins = createPlugins([
  "js",
  "babel",
  "json",
  ["terser", require("./.terserrc.js")],
  // "visualizer",
])

const RollupConfig = [
  {
    input: "lib/main.js",
    output: [
      {
        dir: "dist",
        format: "cjs",
        sourcemap: process.env.NODE_ENV !== "production" ? "inline" : true,
        preferConst: true,
      },
    ],
    // loaded externally
    external: ["atom", "electron"],
    plugins,
  },
]
export default RollupConfig
