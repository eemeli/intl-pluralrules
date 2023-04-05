import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

/**
 * For backwards compatibility and utility as a polyfill,
 * intl-pluralrules is transpiled to work in older browsers.
 *
 * For test262 we should not check the validity of that transpilation,
 * so the current environment is used as a target instead.
 */

export default {
  input: 'test/test262-prelude.mjs',
  context: 'this',
  output: { file: 'test/dist/test262-prelude.js', format: 'iife' },
  plugins: [
    resolve({ extensions: ['.js'] }),
    commonjs(),
    babel({ babelHelpers: 'bundled', targets: 'current node' })
  ]
}
