import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from "rollup-plugin-terser"

module.exports = [
  {
    input: 'src/factory.js',
    output: { file: 'dist/factory.js', format: 'iife', plugins: [terser()] },
    plugins: [resolve()]
  },
  {
    input: 'src/polyfill.js',
    output: { file: 'dist/polyfill.js', format: 'iife', plugins: [terser()] },
    plugins: [commonjs()]
  },
  {
    input: 'src/ponyfill.js',
    output: { file: 'dist/ponyfill.js', format: 'iife', plugins: [terser()] },
    plugins: [commonjs()]
  }
]
