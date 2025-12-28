Examples for `intl-pluralrules`. To build these:

```sh
git clone https://github.com/eemeli/intl-pluralrules.git

cd intl-pluralrules
npm install   # The examples use make-plural from the root

cd examples
npm run build

open index.html

gzip -k dist/*js
stat -f "%z %N" dist/*gz
  # 1473 dist/factory.js.gz
  # 7289 dist/polyfill.js.gz
  # 7165 dist/ponyfill.js.gz
```
