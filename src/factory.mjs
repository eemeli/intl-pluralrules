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

    const parts = tag.split('-')

    // does not check for duplicate subtags
    if (!parts.every(subtag => /[a-z0-9]+/i.test(subtag))) {
      const strTag = JSON.stringify(tag)
      const msg = `The locale ${strTag} is not a structurally valid BCP 47 language tag.`
      throw new RangeError(msg)
    }

    // always use lower case for primary language subtag
    let lc = parts[0].toLowerCase()
    // replace deprecated codes for Indonesian, Hebrew & Yiddish
    parts[0] = { in: 'id', iw: 'he', ji: 'yi' }[lc] ?? lc

    res[parts.join('-')] = true
  }
  return Object.keys(res)
}

function getType(opt) {
  const type = Object.prototype.hasOwnProperty.call(opt, 'type') && opt.type
  if (!type) return 'cardinal'
  if (type === 'cardinal' || type === 'ordinal') return type
  throw new RangeError('Not a valid plural type: ' + JSON.stringify(type))
}

function toNumber(value) {
  switch (typeof value) {
    case 'number':
      return value
    case 'bigint':
      throw new TypeError('Cannot convert a BigInt value to a number')
    default:
      return Number(value)
  }
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
    const lc = new NumberFormat().resolvedOptions().locale
    return findLocale(lc)
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
      if (start === undefined) throw new TypeError('start is undefined')
      if (end === undefined) throw new TypeError('end is undefined')
      const start_ = toNumber(start)
      const end_ = toNumber(end)
      if (!isFinite(start_)) throw new RangeError('start must be finite')
      if (!isFinite(end_)) throw new RangeError('end must be finite')
      return this.#range(this.select(start_), this.select(end_))
    }
  }

  if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    Object.defineProperty(PluralRules.prototype, Symbol.toStringTag, {
      value: 'Intl.PluralRules',
      writable: false,
      configurable: true
    })
  }
  Object.defineProperty(PluralRules, 'prototype', { writable: false })

  return PluralRules
}
