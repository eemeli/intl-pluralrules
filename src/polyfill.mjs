import PluralRules from './plural-rules'

if (typeof Intl === 'undefined') {
  if (typeof global !== 'undefined') {
    global.Intl = { PluralRules }
  } else if (typeof window !== 'undefined') {
    window.Intl = { PluralRules }
  } else {
    this.Intl = { PluralRules }
  }
  PluralRules.polyfill = true
} else if (!Intl.PluralRules) {
  Intl.PluralRules = PluralRules
  PluralRules.polyfill = true
} else {
  const test = ['en', 'es', 'ru', 'zh']
  const supported = Intl.PluralRules.supportedLocalesOf(test)
  if (supported.length < test.length) {
    Intl.PluralRules = PluralRules
    PluralRules.polyfill = true
  }
}
