# unist-util-select

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[**unist**][unist] utility with equivalents for `querySelector`,
`querySelectorAll`, and `matches`.

Note that the DOM has references to their parent nodes, meaning that
`document.body.matches(':last-child')` can be evaluated.
This information is not stored in unist, so selectors like that don’t work.

[View the list of supported selectors »][support]

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c):
Node 12+ is needed to use it and it must be `import`ed instead of `require`d.

[npm][]:

```sh
npm install unist-util-select
```

## API

This package exports the following identifiers: `matches`, `select`, `selectAll`.
There is no default export.

### `matches(selector, node)`

Check that the given `node` matches `selector`.

This only checks the node itself, not the surrounding tree.
Thus, nesting in selectors is not supported (`paragraph strong`,
`paragraph > strong`), neither are selectors like `:first-child`, etc.
This only checks that the given node matches the selector.

###### Parameters

*   `selector` (`string`)
    — CSS selector, such as (`heading`, `link, linkReference`).
*   `node` ([`Node`][node], optional)
    — node that might match `selector`

###### Returns

Whether `node` matches `selector` (`boolean`).

###### Example

```js
import {u} from 'unist-builder'
import {matches} from 'unist-util-select'

matches('strong, em', u('strong', [u('text', 'important')])) // => true
matches('[lang]', u('code', {lang: 'js'}, 'console.log(1)')) // => true
```

### `select(selector, tree)`

Select the first node that matches `selector` in the given `tree`.

Searches the tree in *[preorder][]*.

###### Parameters

*   `selector` (`string`)
    — CSS selector, such as (`heading`, `link, linkReference`).
*   `tree` ([`Node`][node], optional)
    — tree to search

###### Returns

First node in `tree` that matches `selector` or `null` if nothing is found.

This could be `tree` itself.

###### Example

```js
import {u} from 'unist-builder'
import {select} from 'unist-util-select'

console.log(
  select(
    'code ~ :nth-child(even)',
    u('blockquote', [
      u('paragraph', [u('text', 'Alpha')]),
      u('paragraph', [u('text', 'Bravo')]),
      u('code', 'Charlie'),
      u('paragraph', [u('text', 'Delta')]),
      u('paragraph', [u('text', 'Echo')])
    ])
  )
)
```

Yields:

```js
{type: 'paragraph', children: [{type: 'text', value: 'Delta'}]}
```

### `selectAll(selector, tree)`

Select all nodes that match `selector` in the given `tree`.

Searches the tree in *[preorder][]*.

###### Parameters

*   `selector` (`string`)
    — CSS selector, such as (`heading`, `link, linkReference`).
*   `tree` ([`Node`][node], optional)
    — tree to search

###### Returns

Nodes in `tree` that match `selector`.

This could include `tree` itself.

###### Example

```js
import {u} from 'unist-builder'
import {selectAll} from 'unist-util-select'

console.log(
  selectAll(
    'code ~ :nth-child(even)',
    u('blockquote', [
      u('paragraph', [u('text', 'Alpha')]),
      u('paragraph', [u('text', 'Bravo')]),
      u('code', 'Charlie'),
      u('paragraph', [u('text', 'Delta')]),
      u('paragraph', [u('text', 'Echo')]),
      u('paragraph', [u('text', 'Foxtrot')]),
      u('paragraph', [u('text', 'Golf')])
    ])
  )
)
```

Yields:

```js
[
  {type: 'paragraph', children: [{type: 'text', value: 'Delta'}]},
  {type: 'paragraph', children: [{type: 'text', value: 'Foxtrot'}]}
]
```

## Support

*   [x] `*` (universal selector)
*   [x] `,` (multiple selector)
*   [x] `paragraph` (type selector)
*   [x] `blockquote paragraph` (combinator: descendant selector)
*   [x] `blockquote > paragraph` (combinator: child selector)
*   [x] `code + paragraph` (combinator: adjacent sibling selector)
*   [x] `code ~ paragraph` (combinator: general sibling selector)
*   [x] `[attr]` (attribute existence, checks that the value on the tree is not
    nullish)
*   [x] `[attr=value]` (attribute equality, this stringifies values on the tree)
*   [x] `[attr^=value]` (attribute begins with, only works on strings)
*   [x] `[attr$=value]` (attribute ends with, only works on strings)
*   [x] `[attr*=value]` (attribute contains, only works on strings)
*   [x] `[attr~=value]` (attribute contains, checks if `value` is in the array,
    if there’s an array on the tree, otherwise same as attribute equality)
*   [x] `:any()` (functional pseudo-class, use `:matches` instead)
*   [x] `:has()` (functional pseudo-class)
    Relative selectors (`:has(> img)`) are not supported, but `:scope` is
*   [x] `:matches()` (functional pseudo-class)
*   [x] `:not()` (functional pseudo-class)
*   [x] `:blank` (pseudo-class, blank and empty are the same: a parent without
    children, or a node without value)
*   [x] `:empty` (pseudo-class, blank and empty are the same: a parent without
    children, or a node without value)
*   [x] `:root` (pseudo-class, matches the given node)
*   [x] `:scope` (pseudo-class, matches the given node)
*   [x] \* `:first-child` (pseudo-class)
*   [x] \* `:first-of-type` (pseudo-class)
*   [x] \* `:last-child` (pseudo-class)
*   [x] \* `:last-of-type` (pseudo-class)
*   [x] \* `:only-child` (pseudo-class)
*   [x] \* `:only-of-type` (pseudo-class)
*   [x] \* `:nth-child()` (functional pseudo-class)
*   [x] \* `:nth-last-child()` (functional pseudo-class)
*   [x] \* `:nth-last-of-type()` (functional pseudo-class)
*   [x] \* `:nth-of-type()` (functional pseudo-class)

###### Notes

*   \* — Not supported in `matches`

## Related

*   [`unist-util-filter`](https://github.com/syntax-tree/unist-util-filter)
    — Create a new tree with all nodes that pass a test
*   [`unist-util-map`](https://github.com/syntax-tree/unist-util-map)
    — Create a new tree with all nodes mapped by a given function
*   [`unist-util-flatmap`](https://gitlab.com/staltz/unist-util-flatmap)
    — Create a new tree by mapping (to an array) with the given function
*   [`unist-util-is`](https://github.com/syntax-tree/unist-util-is)
    — Check if a node passes a test
*   [`unist-util-remove`](https://github.com/syntax-tree/unist-util-remove)
    — Remove nodes from trees
*   [`unist-util-remove-position`](https://github.com/syntax-tree/unist-util-remove-position)
    — Remove positional info from trees
*   [`unist-util-visit`](https://github.com/syntax-tree/unist-util-visit)
    — Recursively walk over nodes
*   [`unist-util-visit-parents`](https://github.com/syntax-tree/unist-util-visit-parents)
    — Like `visit`, but with a stack of parents
*   [`unist-builder`](https://github.com/syntax-tree/unist-builder)
    — Helper for creating trees

## Contribute

See [`contributing.md` in `syntax-tree/.github`][contributing] for ways to get
started.
See [`support.md`][help] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © Eugene Sharygin

<!-- Definitions -->

[build-badge]: https://github.com/syntax-tree/unist-util-select/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/unist-util-select/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/unist-util-select.svg

[coverage]: https://codecov.io/github/syntax-tree/unist-util-select

[downloads-badge]: https://img.shields.io/npm/dm/unist-util-select.svg

[downloads]: https://www.npmjs.com/package/unist-util-select

[size-badge]: https://img.shields.io/bundlephobia/minzip/unist-util-select.svg

[size]: https://bundlephobia.com/result?p=unist-util-select

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/syntax-tree/unist/discussions

[npm]: https://docs.npmjs.com/cli/install

[license]: license

[contributing]: https://github.com/syntax-tree/.github/blob/HEAD/contributing.md

[help]: https://github.com/syntax-tree/.github/blob/HEAD/support.md

[coc]: https://github.com/syntax-tree/.github/blob/HEAD/code-of-conduct.md

[preorder]: https://github.com/syntax-tree/unist#preorder

[unist]: https://github.com/syntax-tree/unist

[node]: https://github.com/syntax-tree/unist#node

[support]: #support
