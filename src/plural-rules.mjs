import * as P from 'make-plural/plurals'
import * as C from 'make-plural/pluralCategories'
import * as R from 'make-plural/ranges'
import getPluralRules from './factory'
import PseudoNumberFormat from './pseudo-number-format'

// In a .mjs context, CommonJS imports only expose the default endpoint. We're
// using them here because with this many small functions, bundlers produce less
// cruft than for ES module exports.
const Plurals = P.default || P
const Categories = C.default || C
const RangePlurals = R.default || R

/* istanbul ignore next */
const NumberFormat =
  (typeof Intl === 'object' && Intl.NumberFormat) || PseudoNumberFormat

// make-plural exports are cast with safe-identifier to be valid JS identifiers
const id = lc => (lc === 'in' ? '_in' : lc === 'pt-PT' ? 'pt_PT' : lc)

const getSelector = lc => Plurals[id(lc)]
const getCategories = (lc, ord) =>
  Categories[id(lc)][ord ? 'ordinal' : 'cardinal']
const getRangeSelector = lc => RangePlurals[id(lc)]

const PluralRules = getPluralRules(
  NumberFormat,
  getSelector,
  getCategories,
  getRangeSelector
)
export default PluralRules
