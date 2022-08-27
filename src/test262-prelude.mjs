/** This is used as a prelude script for test262-harness. */

import PluralRules from './plural-rules.mjs'

Intl.PluralRules = PluralRules
