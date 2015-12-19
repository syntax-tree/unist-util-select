[![npm](https://nodei.co/npm/unist-util-select.png)](https://npmjs.com/package/unist-util-select)

# unist-util-select

[![Build Status][travis-badge]][travis] [![Dependency Status][david-badge]][david]

Select unist nodes using css-like selectors.

[travis]: https://travis-ci.org/eush77/unist-util-select
[travis-badge]: https://travis-ci.org/eush77/unist-util-select.svg?branch=master
[david]: https://david-dm.org/eush77/unist-util-select
[david-badge]: https://david-dm.org/eush77/unist-util-select.png

## Example

`example.md`:

```
Get all TODO items from this list:

1. Step 1.
2. TODO Step 2.
3. Step 3.
  1. TODO Step 3.1.
  2. Step 3.2.
  3. TODO Step 3.3.
```

[`mdast`][mdast] takes this Markdown as an input and returns unist syntax tree. After that, we use `unist-util-select` to extract the required parts:

```js
var select = require('unist-util-select');

var markdown = fs.readFileSync('example.md', 'utf8');
var ast = mdast.parse(markdown);

select(ast, 'list text[value*=TODO]')
//=> [ { type: 'text', value: 'TODO Step 2.' },
//     { type: 'text', value: 'TODO Step 3.1.' },
//     { type: 'text', value: 'TODO Step 3.3.' } ]
```

That's it!

[mdast]: https://github.com/wooorm/mdast

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
- [x] Negation pseudo-class: `*:not(paragraph)`

## API

#### `select(ast, selector)`

Applies `selector` to `ast`, returns array of matching nodes.

## Install

```
npm install unist-util-select
```

## License

MIT
