import { expect } from 'chai'

export function suite(PluralRules) {
  it('should exist', () => {
    expect(PluralRules).to.be.instanceOf(Function)
  })

  describe('.supportedLocalesOf()', () => {
    it('should be executable', () => {
      expect(() => PluralRules.supportedLocalesOf).not.to.throw()
    })
    it('should return an empty array when called with no args', () => {
      const res = PluralRules.supportedLocalesOf()
      expect(res).to.eql([])
    })
    it('should return a valid array', () => {
      const locales = ['en', 'fi-FI']
      const res = PluralRules.supportedLocalesOf(locales)
      expect(res).to.eql(locales)
    })
    it('should accept String objects', () => {
      const res = PluralRules.supportedLocalesOf(new String('en'))
      expect(res).to.eql(['en'])
    })
    it('should complain about non-strings', () => {
      expect(() => PluralRules.supportedLocalesOf(['en', 3])).to.throw(
        TypeError
      )
      expect(() => PluralRules.supportedLocalesOf([null])).to.throw(TypeError)
    })
    it('should complain about bad tags', () => {
      expect(() => PluralRules.supportedLocalesOf('en-')).to.throw(RangeError)
      expect(() => PluralRules.supportedLocalesOf('-en')).to.throw(RangeError)
      expect(() => PluralRules.supportedLocalesOf('*-en')).to.throw(RangeError)
    })
  })

  describe('constructor', () => {
    it('should require `new`', () => {
      expect(() => PluralRules()).to.throw(TypeError)
      expect(() => new PluralRules()).not.to.throw()
    })
    it('should select a default type & locale', () => {
      const p = new PluralRules()
      expect(p).to.be.instanceOf(Object)
      expect(p.select).to.be.instanceOf(Function)
      const opt = p.resolvedOptions()
      expect(opt.type).to.equal('cardinal')
      expect(typeof opt.locale).to.equal('string')
      expect(opt.locale).to.have.lengthOf.above(1)
    })
    it('should handle valid simple arguments correctly', () => {
      const p = new PluralRules('PT-PT', { type: 'ordinal' })
      expect(p).to.be.instanceOf(Object)
      expect(p.select).to.be.instanceOf(Function)
      const opt = p.resolvedOptions()
      expect(opt.type).to.equal('ordinal')
      expect(opt.locale).to.match(/^pt\b/)
    })
    it('should choose a locale correctly from multiple choices', () => {
      const p = new PluralRules(['tlh', 'IN', 'en'])
      expect(p).to.be.instanceOf(Object)
      expect(p.select).to.be.instanceOf(Function)
      const opt = p.resolvedOptions()
      expect(opt.type).to.equal('cardinal')
      expect(opt.locale).to.equal('id')
    })
    it('should complain about invalid types', () => {
      const fn = () => new PluralRules('en', { type: 'invalid' })
      expect(fn).to.throw(RangeError)
    })
  })

  describe('#resolvedOptions()', () => {
    it('should exist', () => {
      const p = new PluralRules()
      expect(p.resolvedOptions).to.be.instanceOf(Function)
    })

    // https://crbug.com/v8/10832
    const test_ = process.version > 'v16' ? it : it.skip
    test_('should return expected values', () => {
      const res = new PluralRules('fi-FI', {
        minimumIntegerDigits: 2,
        minimumSignificantDigits: 3
      }).resolvedOptions()
      expect(res).to.deep.include({
        minimumIntegerDigits: 2,
        minimumSignificantDigits: 3,
        maximumSignificantDigits: 21,
        pluralCategories: ['one', 'other'],
        roundingPriority: 'auto',
        type: 'cardinal'
      })
      expect(res.locale).to.match(/^fi\b/)
    })
  })

  describe('#select()', () => {
    it('should return a string', () => {
      const res = new PluralRules().select()
      expect(res).to.equal('other')
    })
    it('should complain if bound', () => {
      const p = new PluralRules()
      expect(p.select.bind(null)).to.throw(TypeError)
    })
    it('should work for English cardinals', () => {
      const p = new PluralRules('en', { type: 'cardinal' })
      expect(p.select(1)).to.equal('one')
      expect(p.select('1.0')).to.equal('one')
      expect(p.select(-1)).to.equal('one')
      expect(p.select(2)).to.equal('other')
      expect(p.select('-2.0')).to.equal('other')
    })
    it('should work for English ordinals', () => {
      const p = new PluralRules('en', { type: 'ordinal' })
      expect(p.select(1)).to.equal('one')
      expect(p.select('22')).to.equal('two')
      expect(p.select('3.0')).to.equal('few')
      expect(p.select(11)).to.equal('other')
    })
    it('should work for Arabic', () => {
      const p = new PluralRules('ar-SA')
      expect(p.select(0)).to.equal('zero')
      expect(p.select(1)).to.equal('one')
    })
    it('should work with minimumFractionDigits: 1', () => {
      const p = new PluralRules('en', { minimumFractionDigits: 1 })
      expect(p.select(1)).to.equal('other')
      expect(p.select('1.0')).to.equal('other')
      expect(p.select(2)).to.equal('other')
      expect(p.select('-2.0')).to.equal('other')
    })
    it('should work with maximumFractionDigits: 0', () => {
      const p = new PluralRules('en', { maximumFractionDigits: 0 })
      expect(p.select(1)).to.equal('one')
      expect(p.select('1.1')).to.equal('one')
      expect(p.select(2)).to.equal('other')
      expect(p.select('-2.0')).to.equal('other')
    })
    it('should work with minimumSignificantDigits: 2', () => {
      const p = new PluralRules('en', { minimumSignificantDigits: 2 })
      expect(p.select(1)).to.equal('other')
      expect(p.select('1.0')).to.equal('other')
      expect(p.select(2)).to.equal('other')
      expect(p.select('-2.0')).to.equal('other')
    })
    it('should work with maximumSignificantDigits: 1', () => {
      const p = new PluralRules('en', { maximumSignificantDigits: 1 })
      expect(p.select(1)).to.equal('one')
      expect(p.select('1.1')).to.equal('one')
      expect(p.select(2)).to.equal('other')
      expect(p.select('-2.0')).to.equal('other')
    })
    it('should work with "," as decimal separator', () => {
      const p0 = new PluralRules('cs', { minimumFractionDigits: 0 })
      const p1 = new PluralRules('cs', { minimumFractionDigits: 1 })
      expect(p0.select(1)).to.equal('one')
      expect(p1.select(1)).to.equal('many')
      expect(p0.select(10)).to.equal('other')
      expect(p1.select(10)).to.equal('many')
    })
  })

  describe('#selectRange()', () => {
    it('should return a string', () => {
      const res = new PluralRules().selectRange(0, 1)
      expect(res).to.equal('other')
    })
    it('should complain if bound', () => {
      const p = new PluralRules()
      expect(p.selectRange.bind(null)).to.throw(TypeError)
    })
    it('should work for English', () => {
      const p = new PluralRules('en')
      expect(p.selectRange(0, 1)).to.equal('other')
      expect(p.selectRange('0.0', '1.0')).to.equal('other')
      expect(p.selectRange(1, 2)).to.equal('other')
    })
    it('should work for French', () => {
      const p = new PluralRules('fr')
      expect(p.selectRange(0, 1)).to.equal('one')
      expect(p.selectRange('0.0', '1.0')).to.equal('one')
      expect(p.selectRange(1, 2)).to.equal('other')
    })
    it('should work with minimumFractionDigits: 1', () => {
      const p = new PluralRules('fr', { minimumFractionDigits: 1 })
      expect(p.selectRange(0, 1)).to.equal('one')
      expect(p.selectRange('0.0', '1.0')).to.equal('one')
      expect(p.selectRange(1, 2)).to.equal('other')
    })
    it('should work with maximumFractionDigits: 0', () => {
      const p = new PluralRules('fr', { maximumFractionDigits: 0 })
      expect(p.selectRange(0, 1)).to.equal('one')
      expect(p.selectRange('1.0', '1.1')).to.equal('one')
      expect(p.selectRange(1, 2)).to.equal('other')
    })
    it('should complain about undefined values', () => {
      const p = new PluralRules('en')
      expect(() => p.selectRange(undefined, 2)).to.throw(TypeError)
      expect(() => p.selectRange(2, undefined)).to.throw(TypeError)
    })
    it('should complain about BigInt values', () => {
      const p = new PluralRules('en')
      expect(() => p.selectRange(2, 1n)).to.throw(TypeError)
      expect(() => p.selectRange(2n, 1)).to.throw(TypeError)
    })
    it('should complain about non-numeric values', () => {
      const p = new PluralRules('en')
      expect(() => p.selectRange('x', 2)).to.throw(RangeError)
      expect(() => p.selectRange(2, 'x')).to.throw(RangeError)
    })
  })
}
