import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

/**
 * For our own browser tests, we need an IIFE bundle with no exports,
 * but compiled with the same config as our published code.
 */
export default [
  {
    input: 'src/plural-rules.mjs',
    output: {
      file: 'test/dist/browser-plural-rules.js',
      format: 'iife',
      exports: 'default',
      name: 'PluralRules'
    },
    plugins: [
      resolve({ extensions: ['.js'] }),
      commonjs(),
      babel({ babelHelpers: 'bundled' })
    ]
  },
  {
    input: 'test/test-suite.mjs',
    output: {
      file: 'test/dist/browser-test-suite.js',
      format: 'iife',
      globals: { chai: 'chai' },
      name: 'prTests'
    },
    external: ['chai'],
    plugins: [babel({ babelHelpers: 'bundled' })]
  }
]
