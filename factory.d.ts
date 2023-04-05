export type Category = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'
export type Selector = (n: number | string, ord?: boolean) => Category
export type RangeSelector = (start: Category, end: Category) => Category

export default function getPluralRules(
  NumberFormat: Intl.NumberFormat,
  getSelector: (lc: string) => Selector | undefined,
  getCategories: (lc: string, ord?: boolean) => Category[] | undefined,
  getRangeSelector: (lc: string) => RangeSelector
): Intl.PluralRules
