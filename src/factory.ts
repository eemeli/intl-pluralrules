function canonicalizeLocaleList(
  locales: string | readonly string[] | undefined
) {
  if (!locales) return []
  const locales_ = Array.isArray(locales) ? locales : [locales]
  const res: Record<string, true> = {}
  for (let i = 0; i < locales_.length; ++i) {
    let tag = locales_[i]
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

function toNumber(value: unknown) {
  switch (typeof value) {
    case 'number':
      return value
    case 'bigint':
      throw new TypeError('Cannot convert a BigInt value to a number')
    default:
      return Number(value)
  }
}

export type Category = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'
export type Selector = (n: number | string, ord?: boolean) => Category
export type RangeSelector = (start: Category, end: Category) => Category
export type PluralRuleType = 'cardinal' | 'ordinal'

export interface ResolvedPluralRulesOptions {
  compactDisplay?: 'short' | 'long'
  locale: string
  pluralCategories: Category[]
  type: PluralRuleType
  minimumIntegerDigits: number
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  minimumSignificantDigits?: number
  maximumSignificantDigits?: number
  notation: 'standard' | 'scientific' | 'engineering' | 'compact'
  roundingIncrement:
    | 1
    | 2
    | 5
    | 10
    | 20
    | 25
    | 50
    | 100
    | 200
    | 250
    | 500
    | 1000
    | 2000
    | 2500
    | 5000
  roundingMode:
    | 'ceil'
    | 'floor'
    | 'expand'
    | 'trunc'
    | 'halfCeil'
    | 'halfFloor'
    | 'halfExpand'
    | 'halfTrunc'
    | 'halfEven'
  roundingPriority: 'auto' | 'morePrecision' | 'lessPrecision'
  trailingZeroDisplay: 'auto' | 'stripIfInteger'
}

export type PluralRulesOptions = Partial<
  Omit<ResolvedPluralRulesOptions, 'pluralCategories'>
>

function readOptions(opt: PluralRulesOptions | undefined) {
  if (!opt)
    return {
      type: 'cardinal',
      compactDisplay: 'short',
      nfOpt: undefined
    } as const

  const get = <T extends string>(name: string, values: T[]): T => {
    const val = Object.prototype.hasOwnProperty.call(opt, name)
      ? (opt as Record<string, unknown>)[name]
      : undefined
    if (val === undefined) return values[0]
    if (typeof val === 'symbol')
      throw new TypeError(`Unsupported symbol as ${name} option value`)
    const strval = String(val) as T
    if (!values || values.includes(strval)) return strval
    throw new RangeError(`Unsupported ${name} option value: ${strval}`)
  }

  const localeMatcher = get('localeMatcher', ['best fit', 'lookup'])
  const type = get('type', ['cardinal', 'ordinal'])
  const notation = get('notation', [
    'standard',
    'scientific',
    'engineering',
    'compact'
  ])
  const compactDisplay = get('compactDisplay', ['short', 'long'])
  const {
    minimumIntegerDigits,
    minimumFractionDigits,
    maximumFractionDigits,
    minimumSignificantDigits,
    maximumSignificantDigits,
    roundingIncrement
  } = opt
  const roundingMode = get('roundingMode', [
    'halfExpand',
    'ceil',
    'floor',
    'expand',
    'trunc',
    'halfCeil',
    'halfFloor',
    'halfTrunc',
    'halfEven'
  ])
  const roundingPriority = get('roundingPriority', [
    'auto',
    'morePrecision',
    'lessPrecision'
  ])
  const trailingZeroDisplay = get('trailingZeroDisplay', [
    'auto',
    'stripIfInteger'
  ])

  return {
    type,
    compactDisplay,
    nfOpt: {
      localeMatcher,
      notation,
      compactDisplay: 'short',
      minimumIntegerDigits,
      minimumFractionDigits,
      maximumFractionDigits,
      minimumSignificantDigits,
      maximumSignificantDigits,
      roundingIncrement,
      roundingMode,
      roundingPriority,
      trailingZeroDisplay
    }
  } as const
}

export interface PluralRules {
  resolvedOptions(): ResolvedPluralRulesOptions
  select(n: number | string): Category
  selectRange(start: number | string, end: number | string): Category
}

export interface PluralRulesConstructor {
  new (
    locales?: string | readonly string[],
    options?: PluralRulesOptions
  ): PluralRules
  polyfill?: true
  supportedLocalesOf(
    locales: string | readonly string[],
    options?: { localeMatcher?: 'lookup' | 'best fit' }
  ): string[]
}

export default function getPluralRules(
  NumberFormat: Intl.NumberFormatConstructor,
  getSelector: (lc: string) => Selector | undefined,
  getCategories: (lc: string, ord?: boolean) => Category[],
  getRangeSelector: (lc: string) => RangeSelector
): PluralRulesConstructor {
  const findLocale = (locale: string) => {
    do {
      if (getSelector(locale)) return locale
      locale = locale.replace(/-?[^-]*$/, '')
    } while (locale)
    return null
  }

  const resolveLocale = (locales: string | readonly string[] | undefined) => {
    const canonicalLocales = canonicalizeLocaleList(locales)
    for (let i = 0; i < canonicalLocales.length; ++i) {
      const lc = findLocale(canonicalLocales[i])
      if (lc) return lc
    }
    // fallback to default locale
    const lc = new NumberFormat().resolvedOptions().locale
    return findLocale(lc)!
  }

  class PluralRules {
    static supportedLocalesOf(locales: string | string[]) {
      return canonicalizeLocaleList(locales).filter(findLocale)
    }

    #locale: string
    #range: RangeSelector
    #select: Selector
    #type: 'cardinal' | 'ordinal'
    #compactDisplay: 'short' | 'long'
    #nf: Intl.NumberFormat

    constructor(
      locales: string | readonly string[] | undefined = undefined,
      opt: PluralRulesOptions | undefined = undefined
    ) {
      this.#locale = resolveLocale(locales)
      this.#select = getSelector(this.#locale)!
      if (!this.#select)
        throw new Error(`Selector not found for locale: ${this.#locale}`)
      this.#range = getRangeSelector(this.#locale)
      const res = readOptions(opt)
      this.#nf = new NumberFormat('en', res.nfOpt) // make-plural expects latin digits with . decimal separator
      this.#type = res.type
      this.#compactDisplay = res.compactDisplay
    }

    resolvedOptions(): ResolvedPluralRulesOptions {
      const {
        minimumIntegerDigits,
        minimumFractionDigits,
        maximumFractionDigits,
        minimumSignificantDigits,
        maximumSignificantDigits,
        notation,
        roundingIncrement,
        roundingMode,
        roundingPriority,
        trailingZeroDisplay
      } = this.#nf.resolvedOptions()
      const locale = this.#locale
      const type = this.#type
      return Object.assign(
        { locale, type, notation },
        notation === 'compact' && { compactDisplay: this.#compactDisplay },
        { minimumIntegerDigits },
        typeof minimumSignificantDigits === 'number'
          ? { minimumSignificantDigits, maximumSignificantDigits }
          : { minimumFractionDigits, maximumFractionDigits },
        {
          pluralCategories: getCategories(locale, type === 'ordinal').slice(0),
          roundingIncrement: roundingIncrement ?? 1,
          roundingMode: roundingMode ?? 'halfExpand',
          roundingPriority: roundingPriority ?? 'auto',
          trailingZeroDisplay: trailingZeroDisplay ?? 'auto'
        }
      )
    }

    select(number: number | string): Category {
      if (!(this instanceof PluralRules))
        throw new TypeError(`select() called on incompatible ${this}`)
      if (typeof number !== 'number') number = Number(number)
      if (!isFinite(number)) return 'other'
      let fmt = ''
      for (const part of this.#nf.formatToParts(Math.abs(number))) {
        fmt += part.value
      }
      return this.#select(fmt, this.#type === 'ordinal')
    }

    selectRange(start: number | string, end: number | string): Category {
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
