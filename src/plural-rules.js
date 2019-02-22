import pluralRules from 'make-plural'
import pluralCategories from 'make-plural/umd/pluralCategories'

// does not check for duplicate subtags
const isStructurallyValidLanguageTag = (locale) => locale.split('-').every(subtag => /[a-z0-9]+/i.test(subtag))

const canonicalizeLocaleList = (locales) => {
    if (!locales) return []
    if (!Array.isArray(locales)) locales = [ locales ]
    return locales.map(tag => {
        // Requiring tag to be a String or Object means that the Number value
        // NaN will not be interpreted as the language tag "nan", which stands
        // for Min Nan Chinese.
        switch (typeof tag) {
            case 'string': break
            case 'object': tag = tag.toString(); break
            default: throw new TypeError('Locales should be strings, ' + JSON.stringify(tag) + " isn't.")
        }
        if (!isStructurallyValidLanguageTag(tag)) {
            throw new RangeError('The locale ' + JSON.stringify(tag) + ' is not a structurally valid BCP 47 language tag.')
        }
        return tag
    }).reduce((seen, tag) => {
        if (seen.indexOf(tag) < 0) seen.push(tag)
        return seen
    }, [])
}

const defaultLocale = () => (
    (typeof navigator !== 'undefined') && navigator && (navigator.userLanguage || navigator.language) ||
    'en-US'
)

const findLocale = (locale) => {
    do {
        if (pluralRules[locale]) return locale
        locale = locale.replace(/-?[^-]*$/, '')
    } while (locale)
    return null
}

const resolveLocale = (locales) => {
    const canonicalLocales = canonicalizeLocaleList(locales)
    for (let i = 0; i < canonicalLocales.length; ++i) {
        const lc = findLocale(canonicalLocales[i])
        if (lc) return lc
    }
    return findLocale(defaultLocale())
}

const getType = (type) => {
    if (!type) return 'cardinal'
    if (type === 'cardinal' || type === 'ordinal') return type
    throw new RangeError('Not a valid plural type: ' + JSON.stringify(type))
}

const handleLocaleMatcher = (localeMatcher) => {
    if (localeMatcher && localeMatcher !== 'best fit' && typeof console !== 'undefined') {
        console.warn('intl-polyfill only supports `best fit` localeMatcher')
    }
}

export default class PluralRules {
    static supportedLocalesOf(locales, { localeMatcher } = {}) {
        handleLocaleMatcher(localeMatcher)
        return canonicalizeLocaleList(locales).filter(findLocale)
    }

    constructor(locales, { localeMatcher, minimumIntegerDigits, minimumFractionDigits, maximumFractionDigits, type } = {}) {
        handleLocaleMatcher(localeMatcher)
        this._locale = resolveLocale(locales)
        this._type = getType(type)
        if (typeof Intl === 'object' && Intl.NumberFormat) {
            this._nf = new Intl.NumberFormat(this._locale, { minimumIntegerDigits, minimumFractionDigits, maximumFractionDigits })
        } else {
            this._minID = typeof minimumIntegerDigits === 'number' ? minimumIntegerDigits : 1
            this._minFD = typeof minimumFractionDigits === 'number' ? minimumFractionDigits : 0
            this._maxFD = typeof maximumFractionDigits === 'number' ? maximumFractionDigits : Math.max(this._minFD, 3)
        }
    }

    resolvedOptions() {
        const opt = this._nf && this._nf.resolvedOptions()
        return {
            locale: this._locale,
            minimumIntegerDigits: opt ? opt.minimumIntegerDigits : this._minID,
            minimumFractionDigits: opt ? opt.minimumFractionDigits : this._minFD,
            maximumFractionDigits: opt ? opt.maximumFractionDigits : this._maxFD,
            pluralCategories: pluralCategories[this._locale][this._type],
            type: this._type
        }
    }

    select(number) {
        if (typeof number !== 'number') number = Number(number)
        if (!isFinite(number)) return 'other'
        const fmt = this._nf ? this._nf.format(number)
            : this._minFD > 0 ? number.toFixed(this._minFD)
            : this._maxFD === 0 ? number.toFixed(0)
            : String(number)
        return pluralRules[this._locale](fmt, this._type === 'ordinal')
    }
}
