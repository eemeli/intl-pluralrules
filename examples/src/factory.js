// This is effectively as skinny as you can make it. Note in particular that the
// imports are named, rather than using the * wildcard; that's required for
// tree-shaking. If you run the Webpack build, you'll see that this compresses
// to a much smaller size than the other examples.

import { en, fr } from 'make-plural/cardinals'
import { en as enCat, fr as frCat } from 'make-plural/pluralCategories'
import getPluralRules from '../../factory'

const sel = { en, fr }
const getSelector = lc => sel[lc]

const cat = { en: enCat, fr: frCat }
const getCategories = (lc, ord) => cat[lc][ord ? 'ordinal' : 'cardinal']

const PluralRules = getPluralRules(
  Intl.NumberFormat, // Not available in IE 10
  getSelector,
  getCategories
)

const one = new PluralRules('en').select(1)
const other = new PluralRules('en', { minimumSignificantDigits: 3 }).select(1)
console.log({ one, other })
