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

    constructor(locales, { localeMatcher, type } = {}) {
        handleLocaleMatcher(localeMatcher)
        this.type = getType(type)
        this.locale = resolveLocale(locales)
    }

    resolvedOptions() {
        return {
            locale: this.locale,
            pluralCategories: pluralCategories[this.locale][this.type],
            type: this.type
        }
    }

    select(number) {
        return pluralRules[this.locale](number, this.type === 'ordinal')
    }
}
