import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

/**
 * The wrapping added by bundlers when importing ~200 small functions ends up
 * being significantly larger when using the `make-plural` ES module endpoint
 * compared to CommonJS. However, importing a CommonJS module from a .mjs
 * context is difficult to get right in all environment at the same time, so
 * we're vendoring that dependency into `plural-rules.js`
 */
export default [
  {
    input: 'src/factory.mjs',
    output: { file: 'factory.mjs', format: 'es' },
    plugins: [babel()]
  },
  {
    input: 'src/factory.mjs',
    output: { file: 'factory.js', format: 'cjs' },
    plugins: [babel()]
  },
  {
    input: 'src/plural-rules.mjs',
    context: 'this',
    external: ['./factory', './pseudo-number-format'],
    output: { file: 'plural-rules.js', format: 'cjs' },
    plugins: [
      resolve({ extensions: ['.js'] }),
      commonjs(),
      babel({ exclude: 'node_modules/**' })
    ]
  },
  {
    input: 'src/polyfill.mjs',
    context: 'this',
    external: ['./plural-rules'],
    output: { file: 'polyfill.js', format: 'cjs' },
    plugins: [babel()]
  },
  {
    input: 'src/pseudo-number-format.mjs',
    output: { file: 'pseudo-number-format.js', format: 'cjs' },
    plugins: [babel()]
  }
]
