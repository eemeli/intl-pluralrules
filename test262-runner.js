const { spawnSync } = require('child_process');
const { resolve } = require ('path');
const { cpus } = require('os');

const args = [
  '--reporter-keys',
  'file,attrs,result',
  '-t',
  String(cpus().length),
  '--prelude',
  './polyfill.js',
  '-r',
  'json',
  'test262/test/intl402/PluralRules/**/*.js'
];
console.log(`Running "test262-harness ${args.join(' ')}"`);
const result = spawnSync('test262-harness', args, {
  env: process.env,
  encoding: 'utf-8'
});
if (result.status || result.stderr || result.error) {
    console.error(result.stderr)
    console.error(result.error)
    process.exit(result.status || 1)
}

const json = JSON.parse(result.stdout);
const failedTests = json.filter(r => !r.result.pass);
json.forEach(t => {
  if (t.result.pass) {
    console.log(`✓ ${t.attrs.description}`);
  } else {
    console.log('\n\n');
    console.log(`🗴 ${t.attrs.description}`);
    console.log(`\t ${t.result.message}`);
    console.log('\t', resolve(__dirname, '..', t.file));
    console.log('\n\n');
  }
});
if (failedTests.length) {
  console.log(
    `Tests: ${failedTests.length} failed, ${json.length -
      failedTests.length} passed, ${json.length} total`
  );
  process.exit(1);
}
console.log(
  `Tests: ${json.length - failedTests.length} passed, ${json.length} total`
);
