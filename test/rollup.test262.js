import resolve from '@rollup/plugin-node-resolve'

export default {
  input: 'test/test262-prelude.js',
  context: 'this',
  output: { file: 'test/dist/test262-prelude.js', format: 'iife' },
  plugins: [resolve({ extensions: ['.js'] })]
}
