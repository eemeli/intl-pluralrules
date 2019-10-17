Examples for `intl-pluralrules`. To build these:

```sh
git clone https://github.com/eemeli/intl-pluralrules.git

cd intl-pluralrules
npm install   # The examples use make-plural from the root
npm run build # The examples use ../.. paths

cd examples
npm install
npm run build

gzip -k dist/*
stat -f "%z %N" dist/*gz
  # 6232 dist/cardinals.js.gz
  # 1657 dist/factory.js.gz
  # 7281 dist/polyfill.js.gz
  # 7172 dist/ponyfill.js.gz
```
