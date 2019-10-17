// The simplest usage pattern. The right thing in most cases.

import '../../polyfill'

const one = new Intl.PluralRules('en').select(1)
const other = new Intl.PluralRules('en', {
  minimumSignificantDigits: 3
}).select(1)
console.log({ one, other })
