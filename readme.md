# unist-util-select [![Build][build-badge]][build] [![Coverage][coverage-badge]][coverage] [![Downloads][downloads-badge]][downloads] [![Chat][chat-badge]][chat]

Select [unist][] nodes with CSS-like selectors.

[View the list of supported selectors »][support]

## Installation

[npm][]:

```bash
npm install unist-util-select
```

## API

### `select.one(tree, selector)`

### `select.one(tree)(selector)`

Select the first node matching `selector` in the given `tree` (could be the
tree itself).
Returns the found [node][], if any.
Throws an error if node is not found or not unique.

##### Usage

Say we have the following file, `example.md`:

```markdown
1.  Step 1.
2.  TODO Step 2.
3.  Step 3.

    1. TODO Step 3.1.
    2. Step 3.2.
    3. TODO Step 3.3.
```

And our script, `example.js`, looks as follows:

```javascript
var fs = require('fs')
var remark = require('remark')
var select = require('unist-util-select')

var tree = remark().parse(fs.readFileSync('example.md'))

var step = select.one(tree, 'list text[value*=3.2]')

console.log(step)
```

Now, running `node example` yields:

```javascript
{ type: 'text', value: 'Step 3.2.' }
```

### `select(tree, selector)`

### `select(tree)(selector)`

Select all nodes matching `selector` in the given `tree` (could include the
tree itself).
Returns the found [node][]s, if any.

##### Usage

Say we have the following file, `example.md`:

```markdown
1.  Step 1.
2.  TODO Step 2.
3.  Step 3.

    1. TODO Step 3.1.
    2. Step 3.2.
    3. TODO Step 3.3.
```

And our script, `example.js`, looks as follows:

```javascript
var fs = require('fs')
var remark = require('remark')
var select = require('unist-util-select')

var tree = remark().parse(fs.readFileSync('example.md'))

var todos = select(tree, 'list text[value*=TODO]')

console.log(todos)
```

Now, running `node example` yields:

```javascript
[ { type: 'text',
    value: 'TODO Step 2.' },
  { type: 'text',
    value: 'TODO Step 3.1.' },
  { type: 'text',
    value: 'TODO Step 3.3.' } ]
```

## Support

## Contribute

See [`contributing.md` in `syntax-tree/unist`][contributing] for ways to get
started.

This organisation has a [Code of Conduct][coc].  By interacting with this
repository, organisation, or community you agree to abide by its terms.

## License

[MIT][license] © Eugene Sharygin

<!-- Definitions -->

[build-badge]: https://img.shields.io/travis/syntax-tree/unist-util-select.svg

[build]: https://travis-ci.org/syntax-tree/unist-util-select

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/unist-util-select.svg

[coverage]: https://codecov.io/github/syntax-tree/unist-util-select

[downloads-badge]: https://img.shields.io/npm/dm/unist-util-select.svg

[downloads]: https://www.npmjs.com/package/unist-util-select

[chat-badge]: https://img.shields.io/badge/join%20the%20community-on%20spectrum-7b16ff.svg

[chat]: https://spectrum.chat/unified/syntax-tree

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[unist]: https://github.com/syntax-tree/unist

[node]: https://github.com/syntax-tree/unist#node

[support]: #support

[contributing]: https://github.com/syntax-tree/unist/blob/master/contributing.md

[coc]: https://github.com/syntax-tree/unist/blob/master/code-of-conduct.md
