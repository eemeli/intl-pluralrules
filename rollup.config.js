import babel from '@rollup/plugin-babel'
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
    plugins: [babel({ babelHelpers: 'bundled' })]
  },
  {
    input: 'src/factory.mjs',
    output: { file: 'factory.js', format: 'cjs', exports: 'default' },
    plugins: [babel({ babelHelpers: 'bundled' })]
  },
  {
    input: 'src/plural-rules.mjs',
    context: 'this',
    external: ['./factory.mjs', './pseudo-number-format.mjs'],
    output: {
      file: 'plural-rules.js',
      format: 'cjs',
      exports: 'default',
      paths: id => id.replace(/^.*\/([^/]+)\.mjs$/, './$1.js')
    },
    plugins: [
      resolve({ extensions: ['.js'] }),
      commonjs(),
      babel({ babelHelpers: 'bundled' })
    ]
  },
  {
    input: 'src/polyfill.mjs',
    context: 'this',
    external: ['./plural-rules.mjs'],
    output: {
      file: 'polyfill.js',
      format: 'cjs',
      paths: id => id.replace(/^.*\/([^/]+)\.mjs$/, './$1.js')
    },
    plugins: [babel({ babelHelpers: 'bundled' })]
  },
  {
    input: 'src/pseudo-number-format.mjs',
    output: {
      file: 'pseudo-number-format.js',
      format: 'cjs',
      exports: 'default'
    },
    plugins: [babel({ babelHelpers: 'bundled' })]
  }
]
