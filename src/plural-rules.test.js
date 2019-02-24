const PluralRules = require('../plural-rules').default

describe('Intl.PluralRules polyfill', function() {
  it('should exist', function() {
    expect(PluralRules).toBeInstanceOf(Function)
  })
  describe('.supportedLocalesOf()', function() {
    it('should be executable', function() {
      expect(() => PluralRules.supportedLocalesOf).not.toThrow()
    })
    it('should return an empty array when called with no args', function() {
      const res = PluralRules.supportedLocalesOf()
      expect(res).toMatchObject([])
    })
    it('should return a valid array', function() {
      const locales = ['en', 'fi-FI']
      const res = PluralRules.supportedLocalesOf(locales)
      expect(res).toMatchObject(locales)
    })
  })

  describe('constructor', function() {
    it('should require `new`', function() {
      expect(() => PluralRules()).toThrow(TypeError)
      expect(() => new PluralRules()).not.toThrow()
    })
    it('should select a default type & locale', function() {
      const p = new PluralRules()
      expect(p).toBeInstanceOf(Object)
      expect(p.select).toBeInstanceOf(Function)
      const opt = p.resolvedOptions()
      expect(opt.type).toBe('cardinal')
      expect(typeof opt.locale).toBe('string')
      expect(opt.locale.length).toBeGreaterThan(1)
    })
    it('should handle valid simple arguments correctly', function() {
      const p = new PluralRules('fi-FI', { type: 'ordinal' })
      expect(p).toBeInstanceOf(Object)
      expect(p.select).toBeInstanceOf(Function)
      const opt = p.resolvedOptions()
      expect(opt.type).toBe('ordinal')
      expect(opt.locale).toMatch(/^fi\b/)
    })
    it('should choose a locale correctly from multiple choices', function() {
      const p = new PluralRules(['i-klingon', 'ak', 'en'])
      expect(p).toBeInstanceOf(Object)
      expect(p.select).toBeInstanceOf(Function)
      const opt = p.resolvedOptions()
      expect(opt.type).toBe('cardinal')
      expect(opt.locale).toBe('ak')
    })
    it('should complain about invalid types', function() {
      const fn = () => new PluralRules('en', { type: 'invalid' })
      expect(fn).toThrow(RangeError)
    })
  })

  describe('#resolvedOptions()', function() {
    it('should exist', function() {
      const p = new PluralRules()
      expect(p.resolvedOptions).toBeInstanceOf(Function)
    })
    it('should return expected values', function() {
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

  describe('#select()', function() {
    it('should return a string', function() {
      const res = new PluralRules().select()
      expect(res).toBe('other')
    })
    it('should work for English cardinals', function() {
      const p = new PluralRules('en', { type: 'cardinal' })
      expect(p.select(1)).toBe('one')
      expect(p.select('1.0')).toBe('one')
      expect(p.select(2)).toBe('other')
      expect(p.select('-2.0')).toBe('other')
    })
    it('should work for English ordinals', function() {
      const p = new PluralRules('en', { type: 'ordinal' })
      expect(p.select(1)).toBe('one')
      expect(p.select('22')).toBe('two')
      expect(p.select('3.0')).toBe('few')
      expect(p.select(11)).toBe('other')
    })
    it('should work with minimumFractionDigits: 1', function() {
      const p = new PluralRules('en', { minimumFractionDigits: 1 })
      expect(p.select(1)).toBe('other')
      expect(p.select('1.0')).toBe('other')
      expect(p.select(2)).toBe('other')
      expect(p.select('-2.0')).toBe('other')
    })
    it('should work with maximumFractionDigits: 0', function() {
      const p = new PluralRules('en', { maximumFractionDigits: 0 })
      expect(p.select(1)).toBe('one')
      expect(p.select('1.1')).toBe('one')
      expect(p.select(2)).toBe('other')
      expect(p.select('-2.0')).toBe('other')
    })
    it('should work with minimumSignificantDigits: 2', function() {
      const p = new PluralRules('en', { minimumSignificantDigits: 2 })
      expect(p.select(1)).toBe('other')
      expect(p.select('1.0')).toBe('other')
      expect(p.select(2)).toBe('other')
      expect(p.select('-2.0')).toBe('other')
    })
    it('should work with maximumSignificantDigits: 1', function() {
      const p = new PluralRules('en', { maximumSignificantDigits: 1 })
      expect(p.select(1)).toBe('one')
      expect(p.select('1.1')).toBe('one')
      expect(p.select(2)).toBe('other')
      expect(p.select('-2.0')).toBe('other')
    })
  })
})
