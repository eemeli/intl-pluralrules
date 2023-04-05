# intl-pluralrules

A spec-compliant implementation & polyfill for [Intl.PluralRules],
including the `selectRange(start, end)` method introduced in [Intl.NumberFormat v3].
Also useful if you need proper support for [`minimumFractionDigits`],
which are only supported in Chrome 77 & later.

For a polyfill without `selectRange()` and with IE 11 support, please use `intl-pluralrules@1`.

[intl.pluralrules]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/PluralRules
[intl.numberformat v3]: https://github.com/tc39/proposal-intl-numberformat-v3/
[`minimumfractiondigits`]: https://bugs.chromium.org/p/v8/issues/detail?id=8866

## Installation

```
npm install intl-pluralrules
```

## Polyfill

To use as a polyfill, just import it to ensure that `Intl.PluralRules` is
available in your environment:

```js
import 'intl-pluralrules'
```

If `Intl.PluralRules` already exists,
includes a `selectRange()` method,
and supports [multiple locales](https://nodejs.org/api/intl.html),
the polyfill will not be loaded.

## Ponyfill

A complete implementation of PluralRules is available as
`intl-pluralrules/plural-rules`, if you'd prefer using it without modifying your
`Intl` object, or if you wish to use it rather than your environment's own:

```js
import PluralRules from 'intl-pluralrules/plural-rules'

new PluralRules('en').select(1) // 'one'
new PluralRules('en', { minimumSignificantDigits: 3 }).select(1) // 'other'
new PluralRules('en').selectRange(0, 1) // 'other'
new PluralRules('fr').selectRange(0, 1) // 'one'
```

## Factory

In order to support all available locales, their data needs to be included in
the package. This means that when minified and gzipped, the above-documented
usage adds about 7kB to your application's production size. If this is a
concern, you can use `intl-pluralrules/factory` and [make-plural] to build a
PluralRules class with locale support limited to only what you actually use.

[make-plural]: https://www.npmjs.com/package/make-plural

Thanks to tree-shaking, this example that only supports English and French
minifies & gzips to 1472 bytes. Do note that this size difference is only
apparent with minified production builds.

```js
import getPluralRules from 'intl-pluralrules/factory'
import { en, fr } from 'make-plural/plurals'
import { en as enCat, fr as frCat } from 'make-plural/pluralCategories'
import { en as enRange, fr as frRange } from 'make-plural/ranges'

const sel = { en, fr }
const getSelector = lc => sel[lc]

const cat = { en: enCat, fr: frCat }
const getCategories = (lc, ord) => cat[lc][ord ? 'ordinal' : 'cardinal']

const range = { en: enRange, fr: frRange }
const getRangeSelector = lc => range[lc]

const PluralRules = getPluralRules(
  Intl.NumberFormat, // Not available in IE 10
  getSelector,
  getCategories,
  getRangeSelector
)
export default PluralRules
```

All arguments of
`getPluralRules(NumberFormat, getSelector, getCategories, getRangeSelector)`
are required.

- `NumberFormat` should be `Intl.NumberFormat`, or an implementation which
  supports at least the `"en"` locale and all of the min/max digit count
  options.
- `getSelector(lc)` should return a `function(n, ord)` returning the plural
  category of `n`, using cardinal plural rules (by default), or ordinal rules if
  `ord` is true. `n` may be a number, or the formatted string representation of
  a number. This may be called with any user-provided string `lc`, and should
  return `undefined` for invalid or unsupported locales.
- `getCategories(lc, ord)` should return the set of available plural categories
  for the locale, either for cardinals (by default), or ordinals if `ord` is
  true. This function will be called only with values for which `getSelector`
  returns a function.
- `getRangeSelector(lc)` should return a `function(start, end)` returning the
  plural category of the range. `start` and `end` are the plural categories of
  the corresponding values.
