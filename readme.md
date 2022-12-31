# unist-util-select

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[unist][] utility with equivalents for `querySelector`, `querySelectorAll`,
and `matches`.

## Contents

*   [What is this?](#what-is-this)
*   [When should I use this?](#when-should-i-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`matches(selector, node)`](#matchesselector-node)
    *   [`select(selector, tree)`](#selectselector-tree)
    *   [`selectAll(selector, tree)`](#selectallselector-tree)
*   [Support](#support)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package lets you find nodes in a tree, similar to how `querySelector`,
`querySelectorAll`, and `matches` work with the DOM.

One notable difference between DOM and hast is that DOM nodes have references
to their parents, meaning that `document.body.matches(':last-child')` can
be evaluated to check whether the body is the last child of its parent.
This information is not stored in hast, so selectors like that don’t work.

## When should I use this?

This utility works on any unist syntax tree and you can select all node types.
If you are working with [hast][], and only want to select elements, use
[`hast-util-select`][hast-util-select] instead.

This is a small utility that is quite useful, but is rather slow if you use it a
lot.
For each call, it has to walk the entire tree.
In some cases, walking the tree once with [`unist-util-visit`][unist-util-visit]
is smarter, such as when you want to change certain nodes.
On the other hand, this is quite powerful and fast enough for many other cases.

## Install

This package is [ESM only][esm].
In Node.js (version 14.14+, 16.0+), install with [npm][]:

```sh
npm install unist-util-select
```

In Deno with [`esm.sh`][esmsh]:

```js
import {matches, select, selectAll} from "https://esm.sh/unist-util-select@4"
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {matches, select, selectAll} from "https://esm.sh/unist-util-select@4?bundle"
</script>
```

## Use

```js
import {u} from 'unist-builder'
import {matches, select, selectAll} from 'unist-util-select'

const tree = u('blockquote', [
  u('paragraph', [u('text', 'Alpha')]),
  u('paragraph', [u('text', 'Bravo')]),
  u('code', 'Charlie'),
  u('paragraph', [u('text', 'Delta')]),
  u('paragraph', [u('text', 'Echo')]),
  u('paragraph', [u('text', 'Foxtrot')]),
  u('paragraph', [u('text', 'Golf')])
])

matches('blockquote, list', tree) // => true

console.log(select('code ~ :nth-child(even)', tree))
// The paragraph with `Delta`

console.log(selectAll('code ~ :nth-child(even)', tree))
// The paragraphs with `Delta` and `Foxtrot`
```

## API

This package exports the identifiers `matches`, `select`, and `selectAll`.
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

*   \* — not supported in `matches`

## Types

This package is fully typed with [TypeScript][].
It exports no additional types.

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 14.14+ and 16.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

## Related

*   [`unist-util-is`](https://github.com/syntax-tree/unist-util-is)
    — check if a node passes a test
*   [`unist-util-visit`](https://github.com/syntax-tree/unist-util-visit)
    — recursively walk over nodes
*   [`unist-util-visit-parents`](https://github.com/syntax-tree/unist-util-visit-parents)
    — like `visit`, but with a stack of parents
*   [`unist-builder`](https://github.com/syntax-tree/unist-builder)
    — create unist trees

## Contribute

See [`contributing.md`][contributing] in [`syntax-tree/.github`][health] for
ways to get started.
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

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[license]: license

[health]: https://github.com/syntax-tree/.github

[contributing]: https://github.com/syntax-tree/.github/blob/main/contributing.md

[help]: https://github.com/syntax-tree/.github/blob/main/support.md

[coc]: https://github.com/syntax-tree/.github/blob/main/code-of-conduct.md

[unist]: https://github.com/syntax-tree/unist

[node]: https://github.com/syntax-tree/unist#node

[preorder]: https://github.com/syntax-tree/unist#preorder

[unist-util-visit]: https://github.com/syntax-tree/unist-util-visit

[hast]: https://github.com/syntax-tree/hast

[hast-util-select]: https://github.com/syntax-tree/hast-util-select
