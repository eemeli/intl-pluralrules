import * as Plurals from 'make-plural/plurals'
import * as Categories from 'make-plural/pluralCategories'
import getPluralRules from './factory'
import PseudoNumberFormat from './pseudo-number-format'

const NumberFormat =
  (typeof Intl === 'object' && Intl.NumberFormat) || PseudoNumberFormat

// make-plural exports are cast with safe-identifier to be valid JS identifiers
const id = lc => (lc === 'in' ? '_in' : lc === 'pt-PT' ? 'pt_PT' : lc)

const getSelector = lc => Plurals[id(lc)]
const getCategories = (lc, ord) =>
  Categories[id(lc)][ord ? 'ordinal' : 'cardinal']

const PluralRules = getPluralRules(NumberFormat, getSelector, getCategories)
export default PluralRules
