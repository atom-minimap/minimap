import { createPlugins } from "rollup-plugin-atomic"
import TerserOptions from "./.terserrc.js"

const plugins = createPlugins([
  "js",
  "babel",
  "json",
  ["terser", TerserOptions],
  // "visualizer",
])

const RollupConfig = [
  {
    input: "lib/main.js",
    output: [
      {
        dir: "dist",
        format: "cjs",
        sourcemap: true,
        preferConst: true,
      },
    ],
    // loaded externally
    external: ["atom", "electron"],
    plugins,
  },
]
export default RollupConfig
