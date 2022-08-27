import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

/**
 * For backwards compatibility and utility as a polyfill,
 * intl-pluralrules is transpiled to work in old browsers
 * which do not support e.g. classes, such as IE 11.
 *
 * For test262 we should not check the validity of that transpilation,
 * so the current environment is used as a target instead.
 */

export default {
  input: 'src/test262-prelude.mjs',
  context: 'this',
  output: { file: 'test262-prelude.js', format: 'iife' },
  plugins: [
    resolve({ extensions: ['.js'] }),
    commonjs(),
    babel({ babelHelpers: 'bundled', targets: 'current node' })
  ]
}
