import * as Plurals from 'make-plural/plurals'
import * as Categories from 'make-plural/pluralCategories'
import * as RangePlurals from 'make-plural/ranges'

import getPluralRules, {
  Category,
  type PluralRulesConstructor
} from './factory.ts'

// make-plural exports are cast with safe-identifier to be valid JS identifiers
const id = (lc: string) => (lc === 'pt-PT' ? 'pt_PT' : lc)

const getSelector = (lc: string) =>
  Plurals[id(lc) as keyof typeof Plurals] as (
    n: number | string,
    ord?: boolean
  ) => Category
const getCategories = (lc: string, ord?: boolean) =>
  (
    Categories[id(lc) as keyof typeof Categories] as {
      cardinal: Category[]
      ordinal: Category[]
    }
  )[ord ? 'ordinal' : 'cardinal']
const getRangeSelector = (lc: string) =>
  RangePlurals[id(lc) as keyof typeof RangePlurals] as (
    start: Category,
    end: Category
  ) => Category

const PluralRules_: PluralRulesConstructor = getPluralRules(
  Intl.NumberFormat,
  getSelector,
  getCategories,
  getRangeSelector
)
export default PluralRules_
