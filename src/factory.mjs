// does not check for duplicate subtags
const isStructurallyValidLanguageTag = locale =>
  locale.split('-').every(subtag => /[a-z0-9]+/i.test(subtag))

const canonicalizeLocaleList = locales => {
  if (!locales) return []
  if (!Array.isArray(locales)) locales = [locales]
  const res = {}
  for (let i = 0; i < locales.length; ++i) {
    let tag = locales[i]
    if (tag && typeof tag === 'object') tag = String(tag)
    if (typeof tag !== 'string') {
      // Requiring tag to be a String or Object means that the Number value
      // NaN will not be interpreted as the language tag "nan", which stands
      // for Min Nan Chinese.
      const msg = `Locales should be strings, ${JSON.stringify(tag)} isn't.`
      throw new TypeError(msg)
    }
    if (tag[0] === '*') continue
    if (!isStructurallyValidLanguageTag(tag)) {
      const strTag = JSON.stringify(tag)
      const msg = `The locale ${strTag} is not a structurally valid BCP 47 language tag.`
      throw new RangeError(msg)
    }
    res[tag] = true
  }
  return Object.keys(res)
}

const defaultLocale = () =>
  /* istanbul ignore next */
  (typeof navigator !== 'undefined' &&
    navigator &&
    (navigator.userLanguage || navigator.language)) ||
  'en-US'

const getType = opt => {
  const type = Object.prototype.hasOwnProperty.call(opt, 'type') && opt.type
  if (!type) return 'cardinal'
  if (type === 'cardinal' || type === 'ordinal') return type
  throw new RangeError('Not a valid plural type: ' + JSON.stringify(type))
}

export default function getPluralRules(
  NumberFormat,
  getSelector,
  getCategories,
  getRangeSelector
) {
  const findLocale = locale => {
    do {
      if (getSelector(locale)) return locale
      locale = locale.replace(/-?[^-]*$/, '')
    } while (locale)
    return null
  }

  const resolveLocale = locales => {
    const canonicalLocales = canonicalizeLocaleList(locales)
    for (let i = 0; i < canonicalLocales.length; ++i) {
      const lc = findLocale(canonicalLocales[i])
      if (lc) return lc
    }
    return findLocale(defaultLocale())
  }

  class PluralRules {
    static supportedLocalesOf(locales) {
      return canonicalizeLocaleList(locales).filter(findLocale)
    }

    constructor(locales = [], opt = {}) {
      this._locale = resolveLocale(locales)
      this._select = getSelector(this._locale)
      this._range = getRangeSelector(this._locale)
      this._type = getType(opt)
      this._nf = new NumberFormat('en', opt) // make-plural expects latin digits with . decimal separator
    }

    resolvedOptions() {
      const {
        minimumIntegerDigits,
        minimumFractionDigits,
        maximumFractionDigits,
        minimumSignificantDigits,
        maximumSignificantDigits,
        roundingPriority
      } = this._nf.resolvedOptions()
      const opt = {
        locale: this._locale,
        minimumIntegerDigits,
        minimumFractionDigits,
        maximumFractionDigits,
        pluralCategories: getCategories(this._locale, this._type === 'ordinal'),
        roundingPriority: roundingPriority || 'auto',
        type: this._type
      }
      if (typeof minimumSignificantDigits === 'number') {
        opt.minimumSignificantDigits = minimumSignificantDigits
        opt.maximumSignificantDigits = maximumSignificantDigits
      }
      return opt
    }

    select(number) {
      if (!(this instanceof PluralRules))
        throw new TypeError(`select() called on incompatible ${this}`)
      if (typeof number !== 'number') number = Number(number)
      if (!isFinite(number)) return 'other'
      const fmt = this._nf.format(Math.abs(number))
      return this._select(fmt, this._type === 'ordinal')
    }

    selectRange(start, end) {
      if (!(this instanceof PluralRules))
        throw new TypeError(`selectRange() called on incompatible ${this}`)
      if (typeof start !== 'number') start = Number(start)
      if (typeof end !== 'number') end = Number(end)
      if (!isFinite(start) || !isFinite(end) || start > end)
        throw new RangeError('start and end must be finite, with end >= start')
      return this._range(this.select(start), this.select(end))
    }
  }

  Object.defineProperty(PluralRules, 'prototype', { writable: false })

  return PluralRules
}
