import { expect } from 'chai'
import * as Plurals from 'make-plural/plurals'
import * as Categories from 'make-plural/pluralCategories'
import * as RangePlurals from 'make-plural/ranges'

import getPluralRules from '../src/factory.mjs'
import PseudoNumberFormat from '../src/pseudo-number-format.mjs'

import { suite } from './test-suite.mjs'

describe('With PseudoNumberFormat', () => {
  const id = lc => (lc === 'pt-PT' ? 'pt_PT' : lc)
  const getSelector = lc => Plurals[id(lc)]
  const getCategories = (lc, ord) =>
    Categories[id(lc)][ord ? 'ordinal' : 'cardinal']
  const getRangeSelector = lc => RangePlurals[id(lc)]
  const PluralRules = getPluralRules(
    PseudoNumberFormat,
    getSelector,
    getCategories,
    getRangeSelector
  )
  suite(PluralRules)

  describe('default locale', () => {
    it('should use same default locale as other Intl formatters', () => {
      const Intl_ = global.Intl
      try {
        class MockFormat {
          resolvedOptions = () => ({ locale: 'fi-FI' })
        }
        global.Intl = { DateTimeFormat: MockFormat, NumberFormat: MockFormat }
        const p = new PluralRules()
        const opt = p.resolvedOptions()
        expect(opt.locale).to.match(/^fi\b/)
      } finally {
        global.Intl = Intl_
      }
    })
    it('should use navigator.language as fallback', () => {
      const Intl_ = global.Intl
      const navigator_ = global.navigator
      try {
        delete global.Intl
        delete global.navigator
        global.navigator = { language: 'fi-FI' }
        const pr = new PluralRules()
        const opt = pr.resolvedOptions()
        expect(opt.locale).to.match(/^fi\b/)
      } finally {
        global.Intl = Intl_
        global.navigator = navigator_
      }
    })
    it('should use "en-US" as ultimate fallback', () => {
      const Intl_ = global.Intl
      const navigator_ = global.navigator
      try {
        delete global.Intl
        delete global.navigator
        const pr0 = new PluralRules()
        const opt0 = pr0.resolvedOptions()
        expect(opt0.locale).to.match(/^en\b/)

        global.navigator = { language: undefined }
        const pr1 = new PluralRules()
        const opt1 = pr1.resolvedOptions()
        expect(opt1.locale).to.match(/^en\b/)
      } finally {
        global.Intl = Intl_
        global.navigator = navigator_
      }
    })
  })
})
