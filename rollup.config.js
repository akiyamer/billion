import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import babel from "@rollup/plugin-babel"
import typescript from "@rollup/plugin-typescript"
import strip from "@rollup/plugin-strip"

function unit({file, format, minify}) {
  return {
    file,
    format,
    name: 'Billion',
    plugins: minify ? [] : []
  }
}

async function suite(input, output) {
  return {
    input,
    plugins: [
      resolve(),
      commonjs(),
      typescript(),
      strip({
        functions: ['console.log'],
        include: '**/*.(ts)'
      })
    ],
    output
  }
}

export default suite('./src/index.ts', [
  unit({
    file: './dist/million.umd.js',
    format: 'umd'
  }),
  unit({
    file: './dist/million.cjs.js',
    format: 'cjs'
  }),
  unit({
    file: './dist/million.esm.js',
    format: 'esm'
  })
])