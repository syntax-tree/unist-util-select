[![npm](https://nodei.co/npm/unist-util-select.png)](https://npmjs.com/package/unist-util-select)

# unist-util-select

[![Build Status][travis-badge]][travis] [![Dependency Status][david-badge]][david]

Select unist nodes using css-like selectors.

[travis]: https://travis-ci.org/eush77/unist-util-select
[travis-badge]: https://travis-ci.org/eush77/unist-util-select.svg?branch=master
[david]: https://david-dm.org/eush77/unist-util-select
[david-badge]: https://david-dm.org/eush77/unist-util-select.png

## Example

```js
var select = require('unist-util-select');

select(ast, 'paragraph emphasis > text')
//=> array of nodes
```

## Features

- [x] Type selectors: `paragraph`
- [x] Descendant selectors: `paragraph text`
- [x] Child selectors: `paragraph > text`
- [x] Sibling selectors: `paragraph ~ text`
- [x] Adjacent sibling selectors: `paragraph + text`
- [x] Group selectors: `paragraph, text`
- [x] Universal selector: `*`
- [x] Attribute selectors: `text[value*="substr"]`
  - [x] Existence: `[value]`
  - [x] Equality: `[value="foo"]`
  - [x] Begins with: `[value^="prefix"]`
  - [x] Containment: `[value*="substr"]`
  - [x] Ends with: `[value$="suffix"]`

## API

#### `unistUtilSelect(ast, selector)`

Applies `selector` to `ast`, returns array of matching nodes.

## Install

```
npm install unist-util-select
```

## License

MIT
