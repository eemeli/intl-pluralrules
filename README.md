[![ISC License](https://img.shields.io/npm/l/make-plural.svg)](http://en.wikipedia.org/wiki/ISC_license)
[![Build Status](https://travis-ci.org/eemeli/IntlPluralRules.svg?branch=master)](https://travis-ci.org/eemeli/IntlPluralRules)


Intl.PluralRules
================

A polyfill for [Intl.PluralRules](https://github.com/caridy/intl-plural-rules-spec)



## Installation

```
npm install intl-pluralrules
```


## Usage

The package's `polyfill.js` contains an UMD wrapper, so you can include or
require it pretty much anywhere. When included, it'll set `Intl.PluralRules`
according to the spec.

This version mostly follows the published spec, with these difference:
- The `prototype.select()` input is not forced to `number`, so for locales like
  English the correct plural rule is returned for `'1.0'`.
- The `localeMatcher` option is not supported.
- The `type` option is supported for `supportedLocalesOf()`, as ordinal rules
  are not available for all locales for which cardinal rules are available.
