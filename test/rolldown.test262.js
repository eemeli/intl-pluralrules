/** @type {import('rolldown').RolldownOptions} */
export default {
  input: 'test/test262-prelude.js',
  context: 'this',
  output: { file: 'test/dist/test262-prelude.js', format: 'iife' }
}
