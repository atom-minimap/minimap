import { createPlugins } from "rollup-plugin-atomic"
import terserOptions from "./.terserrc.js"

const plugins = createPlugins([
  "ts",
  "js",
  "json",
  ["terser", terserOptions],
  // "visualizer",
])

export default [
  {
    input: "lib/main.ts",
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
    plugins: plugins,
  },
]
