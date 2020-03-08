// About as simple as the polyfill, but without the global namespace pollution.

import PluralRules from '../../plural-rules'

const one = new PluralRules('en').select(1)
const other = new PluralRules('en', { minimumSignificantDigits: 3 }).select(1)
console.log('ponyfill', { one, other })
