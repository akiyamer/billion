import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import babel from "@rollup/plugin-babel"
import typescript from "@rollup/plugin-typescript"

export default {
  input: ["src/index.ts"],
  output: {
    file: "./dist/bundle.js",
    format: "umd",
    name: "experience",
  },
  plugins: [
    resolve(), 
    commonjs(), 
    typescript(),
    babel({
      exclude: "node_modules/**",
      runtimeHelpers: true,
    })
  ]
}