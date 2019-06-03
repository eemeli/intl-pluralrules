import PluralRules from './plural-rules'

describe('Intl.PluralRules polyfill', () => {
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
    test('should handle valid simple arguments correctly', () => {
      const p = new PluralRules('fi-FI', { type: 'ordinal' })
      expect(p).toBeInstanceOf(Object)
      expect(p.select).toBeInstanceOf(Function)
      const opt = p.resolvedOptions()
      expect(opt.type).toBe('ordinal')
      expect(opt.locale).toMatch(/^fi\b/)
    })
    test('should choose a locale correctly from multiple choices', () => {
      const p = new PluralRules(['i-klingon', 'ak', 'en'])
      expect(p).toBeInstanceOf(Object)
      expect(p.select).toBeInstanceOf(Function)
      const opt = p.resolvedOptions()
      expect(opt.type).toBe('cardinal')
      expect(opt.locale).toBe('ak')
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
    test('should return expected values', () => {
      const res = new PluralRules('fi-FI').resolvedOptions()
      expect(res).toMatchObject({
        minimumIntegerDigits: 1,
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
        pluralCategories: ['one', 'other'],
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
})
