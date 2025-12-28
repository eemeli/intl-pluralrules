import PluralRules from './plural-rules.ts'

declare const global: any
declare const window: any

if (typeof Intl === 'undefined') {
  if (typeof global !== 'undefined') {
    global.Intl = { PluralRules }
  } else if (typeof window !== 'undefined') {
    window.Intl = { PluralRules }
  } else {
    // @ts-expect-error
    this.Intl = { PluralRules }
  }
  PluralRules.polyfill = true
} else if (!Intl.PluralRules || !Intl.PluralRules.prototype.selectRange) {
  // @ts-expect-error
  Intl.PluralRules = PluralRules
  PluralRules.polyfill = true
} else {
  const test = ['en', 'es', 'ru', 'zh']
  const supported = Intl.PluralRules.supportedLocalesOf(test)
  if (supported.length < test.length) {
    // @ts-expect-error
    Intl.PluralRules = PluralRules
    PluralRules.polyfill = true
  }
}
