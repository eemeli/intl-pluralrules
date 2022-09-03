import PluralRules from '../src/plural-rules.mjs'

import { suite } from './test-suite.mjs'

describe('With native Intl.NumberFormat', () => suite(PluralRules))
