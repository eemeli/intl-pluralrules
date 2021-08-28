#!/bin/sh
set -e

node dist/factory.js | grep -q "factory { one: 'one', other: 'other', range: 'other' }" && echo "factory ok" || (echo "factory failed" && false)
node dist/ponyfill.js | grep -q "ponyfill { one: 'one', other: 'other' }" && echo "ponyfill ok" || (echo "ponyfill failed" && false)
node dist/polyfill.js | grep -q "{ one: 'one', other: 'other' }" && echo "polyfill ok" || (echo "polyfill failed" && false)
