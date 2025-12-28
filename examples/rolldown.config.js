/** @type {import('rolldown').RolldownOptions[]} */
export default [
  {
    input: 'src/factory.js',
    output: { file: 'dist/factory.js', format: 'iife', minify: true }
  },
  {
    input: 'src/polyfill.js',
    output: { file: 'dist/polyfill.js', format: 'iife', minify: true }
  },
  {
    input: 'src/ponyfill.js',
    output: { file: 'dist/ponyfill.js', format: 'iife', minify: true }
  }
]
