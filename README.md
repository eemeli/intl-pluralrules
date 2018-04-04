# intl-pluralrules

A polyfill for [Intl.PluralRules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/PluralRules)


## Installation

```
npm install intl-pluralrules
```


## Usage

To use the polyfill, just import it to make sure that `Intl.PluralRules` is
available in your environment:

```js
import 'intl-polyfill'
```

If `Intl.PluralRules` already exists, the polyfill will not be loaded. The
implementation is itself available as `intl-polyfill/plural-rules`, if e.g.
you'd prefer using it without polyfilling your `Intl` object.

This version mostly follows the published spec, with these difference:
- The `prototype.select()` input is not forced to `number`, so for locales like
  English the correct plural rule is returned for `'1.0'` input. On the other
  hand, the minimum/mamximum digits options are ignored.
- Only a `"best-fit"` locale matcher is supported.
