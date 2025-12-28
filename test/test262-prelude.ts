/** This is used as a prelude script for test262-harness. */

import PluralRules from '../src/plural-rules.ts'

// @ts-expect-error
Intl.PluralRules = PluralRules
