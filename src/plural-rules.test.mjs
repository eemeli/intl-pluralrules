/** @jest-environment jsdom */

import * as Plurals from 'make-plural/plurals'
import * as Categories from 'make-plural/pluralCategories'
import * as RangePlurals from 'make-plural/ranges'
import getPluralRules from './factory'
import ActualPluralRules from './plural-rules'
import PseudoNumberFormat from './pseudo-number-format'

function suite(PluralRules) {
  test('should exist', () => {
    expect(PluralRules).toBeInstanceOf(Function)
  })

  describe('.supportedLocalesOf()', () => {
    test('should be executable', () => {
      expect(() => PluralRules.supportedLocalesOf).not.toThrow()
    })
    test('should return an empty array when called with no args', () => {
      const res = PluralRules.supportedLocalesOf()
      expect(res).toMatchObject([])
    })
    test('should return a valid array', () => {
      const locales = ['en', 'fi-FI']
      const res = PluralRules.supportedLocalesOf(locales)
      expect(res).toMatchObject(locales)
    })
    test('should ignore wildcards', () => {
      const locales = ['en', '*', '*-foo', 'fi-FI']
      const res = PluralRules.supportedLocalesOf(locales)
      expect(res).toMatchObject(['en', 'fi-FI'])
    })
    test('should accept String objects', () => {
      const res = PluralRules.supportedLocalesOf(new String('en'))
      expect(res).toMatchObject(['en'])
    })
    test('should complain about non-strings', () => {
      expect(() => PluralRules.supportedLocalesOf(['en', 3])).toThrow(TypeError)
      expect(() => PluralRules.supportedLocalesOf([null])).toThrow(TypeError)
    })
    test('should complain about bad tags', () => {
      expect(() => PluralRules.supportedLocalesOf('en-')).toThrow(RangeError)
      expect(() => PluralRules.supportedLocalesOf('-en')).toThrow(RangeError)
    })
  })

  describe('constructor', () => {
    test('should require `new`', () => {
      expect(() => PluralRules()).toThrow(TypeError)
      expect(() => new PluralRules()).not.toThrow()
    })
    test('should select a default type & locale', () => {
      const p = new PluralRules()
      expect(p).toBeInstanceOf(Object)
      expect(p.select).toBeInstanceOf(Function)
      const opt = p.resolvedOptions()
      expect(opt.type).toBe('cardinal')
      expect(typeof opt.locale).toBe('string')
      expect(opt.locale.length).toBeGreaterThan(1)
    })
    test('should use navigator.language for default locale', () => {
      const spy = jest.spyOn(navigator, 'language', 'get')
      try {
        spy.mockReturnValue('fi-FI')
        const p = new PluralRules()
        const opt = p.resolvedOptions()
        expect(opt.locale).toMatch(/^fi\b/)
      } finally {
        spy.mockRestore()
      }
    })
    test('should handle valid simple arguments correctly', () => {
      const p = new PluralRules('pt-PT', { type: 'ordinal' })
      expect(p).toBeInstanceOf(Object)
      expect(p.select).toBeInstanceOf(Function)
      const opt = p.resolvedOptions()
      expect(opt.type).toBe('ordinal')
      expect(opt.locale).toMatch(/^pt\b/)
    })
    test('should choose a locale correctly from multiple choices', () => {
      const p = new PluralRules(['tlh', 'id', 'en'])
      expect(p).toBeInstanceOf(Object)
      expect(p.select).toBeInstanceOf(Function)
      const opt = p.resolvedOptions()
      expect(opt.type).toBe('cardinal')
      expect(opt.locale).toBe('id')
    })
    test('should complain about invalid types', () => {
      const fn = () => new PluralRules('en', { type: 'invalid' })
      expect(fn).toThrow(RangeError)
    })
  })

  describe('#resolvedOptions()', () => {
    test('should exist', () => {
      const p = new PluralRules()
      expect(p.resolvedOptions).toBeInstanceOf(Function)
    })

    // https://crbug.com/v8/10832
    const test_ = process.version > 'v16' ? test : test.skip
    test_('should return expected values', () => {
      const res = new PluralRules('fi-FI', {
        minimumIntegerDigits: 2,
        minimumSignificantDigits: 3
      }).resolvedOptions()
      expect(res).toMatchObject({
        minimumIntegerDigits: 2,
        minimumSignificantDigits: 3,
        maximumSignificantDigits: 21,
        pluralCategories: ['one', 'other'],
        roundingPriority: 'auto',
        type: 'cardinal'
      })
      expect(res.locale).toMatch(/^fi\b/)
    })
  })

  describe('#select()', () => {
    test('should return a string', () => {
      const res = new PluralRules().select()
      expect(res).toBe('other')
    })
    test('should complain if bound', () => {
      const p = new PluralRules()
      expect(p.select.bind(null)).toThrow(TypeError)
    })
    test('should work for English cardinals', () => {
      const p = new PluralRules('en', { type: 'cardinal' })
      expect(p.select(1)).toBe('one')
      expect(p.select('1.0')).toBe('one')
      expect(p.select(-1)).toBe('one')
      expect(p.select(2)).toBe('other')
      expect(p.select('-2.0')).toBe('other')
    })
    test('should work for English ordinals', () => {
      const p = new PluralRules('en', { type: 'ordinal' })
      expect(p.select(1)).toBe('one')
      expect(p.select('22')).toBe('two')
      expect(p.select('3.0')).toBe('few')
      expect(p.select(11)).toBe('other')
    })
    test('should work for Arabic', () => {
      const p = new PluralRules('ar-SA')
      expect(p.select(0)).toBe('zero')
      expect(p.select(1)).toBe('one')
    })
    test('should work with minimumFractionDigits: 1', () => {
      const p = new PluralRules('en', { minimumFractionDigits: 1 })
      expect(p.select(1)).toBe('other')
      expect(p.select('1.0')).toBe('other')
      expect(p.select(2)).toBe('other')
      expect(p.select('-2.0')).toBe('other')
    })
    test('should work with maximumFractionDigits: 0', () => {
      const p = new PluralRules('en', { maximumFractionDigits: 0 })
      expect(p.select(1)).toBe('one')
      expect(p.select('1.1')).toBe('one')
      expect(p.select(2)).toBe('other')
      expect(p.select('-2.0')).toBe('other')
    })
    test('should work with minimumSignificantDigits: 2', () => {
      const p = new PluralRules('en', { minimumSignificantDigits: 2 })
      expect(p.select(1)).toBe('other')
      expect(p.select('1.0')).toBe('other')
      expect(p.select(2)).toBe('other')
      expect(p.select('-2.0')).toBe('other')
    })
    test('should work with maximumSignificantDigits: 1', () => {
      const p = new PluralRules('en', { maximumSignificantDigits: 1 })
      expect(p.select(1)).toBe('one')
      expect(p.select('1.1')).toBe('one')
      expect(p.select(2)).toBe('other')
      expect(p.select('-2.0')).toBe('other')
    })
    test('should work with "," as decimal separator', () => {
      const p0 = new PluralRules('cs', { minimumFractionDigits: 0 })
      const p1 = new PluralRules('cs', { minimumFractionDigits: 1 })
      expect(p0.select(1)).toBe('one')
      expect(p1.select(1)).toBe('many')
      expect(p0.select(10)).toBe('other')
      expect(p1.select(10)).toBe('many')
    })
  })

  describe('#selectRange()', () => {
    test('should return a string', () => {
      const res = new PluralRules().selectRange(0, 1)
      expect(res).toBe('other')
    })
    test('should complain if bound', () => {
      const p = new PluralRules()
      expect(p.selectRange.bind(null)).toThrow(TypeError)
    })
    test('should work for English', () => {
      const p = new PluralRules('en')
      expect(p.selectRange(0, 1)).toBe('other')
      expect(p.selectRange('0.0', '1.0')).toBe('other')
      expect(p.selectRange(1, 2)).toBe('other')
    })
    test('should work for French', () => {
      const p = new PluralRules('fr')
      expect(p.selectRange(0, 1)).toBe('one')
      expect(p.selectRange('0.0', '1.0')).toBe('one')
      expect(p.selectRange(1, 2)).toBe('other')
    })
    test('should work with minimumFractionDigits: 1', () => {
      const p = new PluralRules('fr', { minimumFractionDigits: 1 })
      expect(p.selectRange(0, 1)).toBe('one')
      expect(p.selectRange('0.0', '1.0')).toBe('one')
      expect(p.selectRange(1, 2)).toBe('other')
    })
    test('should work with maximumFractionDigits: 0', () => {
      const p = new PluralRules('fr', { maximumFractionDigits: 0 })
      expect(p.selectRange(0, 1)).toBe('one')
      expect(p.selectRange('1.0', '1.1')).toBe('one')
      expect(p.selectRange(1, 2)).toBe('other')
    })
    test('should complain if start > end', () => {
      const p = new PluralRules('en')
      expect(() => p.selectRange(2, 1)).toThrow(RangeError)
    })
  })
}

describe('With native Intl.NumberFormat', () => suite(ActualPluralRules))

describe('With PseudoNumberFormat', () => {
  const id = lc => (lc === 'in' ? '_in' : lc === 'pt-PT' ? 'pt_PT' : lc)
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
})
