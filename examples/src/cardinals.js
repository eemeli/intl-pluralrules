// By default, intl-pluralrules includes support for ordinal plurals. Leaving
// those out is possible by getting the plural functions from
// `make-plural/cardinals` rather than `make-plural/plurals`, but it's probably
// not worth it.

import * as Cardinals from 'make-plural/cardinals'
import * as Categories from 'make-plural/pluralCategories'
import getPluralRules from '../../factory'

// make-plural exports are cast with safe-identifier to be valid JS identifiers
const id = lc => (lc === 'in' ? '_in' : lc === 'pt-PT' ? 'pt_PT' : lc)

const getSelector = lc => Cardinals[id(lc)]
const getCategories = (lc, ord) =>
  Categories[id(lc)][ord ? 'ordinal' : 'cardinal']

const PluralRules = getPluralRules(
  Intl.NumberFormat, // Not available in IE 10
  getSelector,
  getCategories
)

const one = new PluralRules('en').select(1)
const other = new PluralRules('en', { minimumSignificantDigits: 3 }).select(1)
console.log({ one, other })
