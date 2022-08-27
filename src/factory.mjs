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

    #locale
    #range
    #select
    #type
    #nf

    constructor(locales = [], opt = {}) {
      this.#locale = resolveLocale(locales)
      this.#select = getSelector(this.#locale)
      this.#range = getRangeSelector(this.#locale)
      this.#type = getType(opt)
      this.#nf = new NumberFormat('en', opt) // make-plural expects latin digits with . decimal separator
    }

    resolvedOptions() {
      const {
        minimumIntegerDigits,
        minimumFractionDigits,
        maximumFractionDigits,
        minimumSignificantDigits,
        maximumSignificantDigits,
        roundingPriority
      } = this.#nf.resolvedOptions()
      const opt = {
        locale: this.#locale,
        type: this.#type,
        minimumIntegerDigits,
        minimumFractionDigits,
        maximumFractionDigits
      }
      if (typeof minimumSignificantDigits === 'number') {
        opt.minimumSignificantDigits = minimumSignificantDigits
        opt.maximumSignificantDigits = maximumSignificantDigits
      }
      opt.pluralCategories = getCategories(
        this.#locale,
        this.#type === 'ordinal'
      ).slice(0)
      opt.roundingPriority = roundingPriority || 'auto'
      return opt
    }

    select(number) {
      if (!(this instanceof PluralRules))
        throw new TypeError(`select() called on incompatible ${this}`)
      if (typeof number !== 'number') number = Number(number)
      if (!isFinite(number)) return 'other'
      const fmt = this.#nf.format(Math.abs(number))
      return this.#select(fmt, this.#type === 'ordinal')
    }

    selectRange(start, end) {
      if (!(this instanceof PluralRules))
        throw new TypeError(`selectRange() called on incompatible ${this}`)
      if (typeof start !== 'number') start = Number(start)
      if (typeof end !== 'number') end = Number(end)
      if (!isFinite(start) || !isFinite(end) || start > end)
        throw new RangeError('start and end must be finite, with end >= start')
      return this.#range(this.select(start), this.select(end))
    }
  }

  Object.defineProperty(PluralRules, 'prototype', { writable: false })

  return PluralRules
}
