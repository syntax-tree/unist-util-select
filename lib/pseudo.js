/**
 * @typedef {import('css-selector-parser').AstPseudoClass} AstPseudoClass
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 * @typedef {import('./types.js').SelectState} SelectState
 */

import {ok as assert, unreachable} from 'devlop'
import fauxEsmNthCheck from 'nth-check'
import {zwitch} from 'zwitch'
import {parent} from './util.js'
import {walk} from './walk.js'

/** @type {import('nth-check').default} */
// @ts-expect-error: `nth-check` types are wrong.
const nthCheck = fauxEsmNthCheck.default || fauxEsmNthCheck

/** @type {(rule: AstPseudoClass, node: Node, index: number | undefined, parent: Parent | undefined, state: SelectState) => boolean} */
export const pseudo = zwitch('name', {
  // @ts-expect-error: always known.
  unknown: unknownPseudo,
  invalid: invalidPseudo,
  handlers: {
    is,
    blank: empty,
    empty,
    'first-child': firstChild,
    'first-of-type': firstOfType,
    has,
    'last-child': lastChild,
    'last-of-type': lastOfType,
    not,
    'nth-child': nthChild,
    'nth-last-child': nthLastChild,
    'nth-of-type': nthOfType,
    'nth-last-of-type': nthLastOfType,
    'only-child': onlyChild,
    'only-of-type': onlyOfType,
    root,
    scope
  }
})

/**
 * Check whether a node matches an `:empty` pseudo.
 *
 * @param {AstPseudoClass} _1
 * @param {Node} node
 * @returns {boolean}
 */
function empty(_1, node) {
  return parent(node) ? node.children.length === 0 : !('value' in node)
}

/**
 * Check whether a node matches a `:first-child` pseudo.
 *
 * @param {AstPseudoClass} query
 * @param {Node} _1
 * @param {number | undefined} _2
 * @param {Parent | undefined} _3
 * @param {SelectState} state
 * @returns {boolean}
 */
function firstChild(query, _1, _2, _3, state) {
  assertDeep(state, query)
  return state.nodeIndex === 0 // Specifically `0`, not falsey.
}

/**
 * Check whether a node matches a `:first-of-type` pseudo.
 *
 * @param {AstPseudoClass} query
 * @param {Node} _1
 * @param {number | undefined} _2
 * @param {Parent | undefined} _3
 * @param {SelectState} state
 * @returns {boolean}
 */
function firstOfType(query, _1, _2, _3, state) {
  assertDeep(state, query)
  return state.typeIndex === 0
}

/**
 * @param {AstPseudoClass} query
 * @param {Node} node
 * @param {number | undefined} _1
 * @param {Parent | undefined} _2
 * @param {SelectState} state
 * @returns {boolean}
 */
function has(query, node, _1, _2, state) {
  const argument = query.argument

  /* c8 ignore next 3 -- never happens with our config */
  if (!argument || argument.type !== 'Selector') {
    unreachable('`:has` has selectors')
  }

  const fragment = {type: 'root', children: parent(node) ? node.children : []}
  /** @type {SelectState} */
  const childState = {
    ...state,
    // Not found yet.
    found: false,
    // Do walk deep.
    shallow: false,
    // One result is enough.
    one: true,
    scopeNodes: [node],
    results: [],
    rootQuery: argument
  }

  walk(childState, fragment)

  return childState.results.length > 0
}

/**
 * Check whether a node matches a `:last-child` pseudo.
 *
 * @param {AstPseudoClass} query
 * @param {Node} _1
 * @param {number | undefined} _2
 * @param {Parent | undefined} _3
 * @param {SelectState} state
 * @returns {boolean}
 */
function lastChild(query, _1, _2, _3, state) {
  assertDeep(state, query)
  return (
    typeof state.nodeCount === 'number' &&
    state.nodeIndex === state.nodeCount - 1
  )
}

/**
 * Check whether a node matches a `:last-of-type` pseudo.
 *
 * @param {AstPseudoClass} query
 * @param {Node} _1
 * @param {number | undefined} _2
 * @param {Parent | undefined} _3
 * @param {SelectState} state
 * @returns {boolean}
 */
function lastOfType(query, _1, _2, _3, state) {
  assertDeep(state, query)
  return (
    typeof state.typeCount === 'number' &&
    state.typeIndex === state.typeCount - 1
  )
}

/**
 * Check whether a node `:is` further selectors.
 *
 * @param {AstPseudoClass} query
 * @param {Node} node
 * @param {number | undefined} _1
 * @param {Parent | undefined} _2
 * @param {SelectState} state
 * @returns {boolean}
 */
function is(query, node, _1, _2, state) {
  const argument = query.argument

  /* c8 ignore next 3 -- never happens with our config */
  if (!argument || argument.type !== 'Selector') {
    unreachable('`:is` has selectors')
  }

  /** @type {SelectState} */
  const childState = {
    ...state,
    // Not found yet.
    found: false,
    // Do walk deep.
    shallow: false,
    // One result is enough.
    one: true,
    scopeNodes: [node],
    results: [],
    rootQuery: argument
  }

  walk(childState, node)

  return childState.results[0] === node
}

/**
 * Check whether a node does `:not` match further selectors.
 *
 * @param {AstPseudoClass} query
 * @param {Node} node
 * @param {number | undefined} index
 * @param {Parent | undefined} parent
 * @param {SelectState} state
 * @returns {boolean}
 */
function not(query, node, index, parent, state) {
  return !is(query, node, index, parent, state)
}

/**
 * Check whether a node matches an `:nth-child` pseudo.
 *
 * @param {AstPseudoClass} query
 * @param {Node} _1
 * @param {number | undefined} _2
 * @param {Parent | undefined} _3
 * @param {SelectState} state
 * @returns {boolean}
 */
function nthChild(query, _1, _2, _3, state) {
  const fn = getCachedNthCheck(query)
  assertDeep(state, query)
  return typeof state.nodeIndex === 'number' && fn(state.nodeIndex)
}

/**
 * Check whether a node matches an `:nth-last-child` pseudo.
 *
 * @param {AstPseudoClass} query
 * @param {Node} _1
 * @param {number | undefined} _2
 * @param {Parent | undefined} _3
 * @param {SelectState} state
 * @returns {boolean}
 */
function nthLastChild(query, _1, _2, _3, state) {
  const fn = getCachedNthCheck(query)
  assertDeep(state, query)
  return (
    typeof state.nodeCount === 'number' &&
    typeof state.nodeIndex === 'number' &&
    fn(state.nodeCount - state.nodeIndex - 1)
  )
}

/**
 * Check whether a node matches a `:nth-last-of-type` pseudo.
 *
 * @param {AstPseudoClass} query
 * @param {Node} _1
 * @param {number | undefined} _2
 * @param {Parent | undefined} _3
 * @param {SelectState} state
 * @returns {boolean}
 */
function nthLastOfType(query, _1, _2, _3, state) {
  const fn = getCachedNthCheck(query)
  assertDeep(state, query)
  return (
    typeof state.typeIndex === 'number' &&
    typeof state.typeCount === 'number' &&
    fn(state.typeCount - 1 - state.typeIndex)
  )
}

/**
 * Check whether a node matches an `:nth-of-type` pseudo.
 *
 * @param {AstPseudoClass} query
 * @param {Node} _1
 * @param {number | undefined} _2
 * @param {Parent | undefined} _3
 * @param {SelectState} state
 * @returns {boolean}
 */
function nthOfType(query, _1, _2, _3, state) {
  const fn = getCachedNthCheck(query)
  assertDeep(state, query)
  return typeof state.typeIndex === 'number' && fn(state.typeIndex)
}

/**
 * Check whether a node matches an `:only-child` pseudo.
 *
 * @param {AstPseudoClass} query
 * @param {Node} _1
 * @param {number | undefined} _2
 * @param {Parent | undefined} _3
 * @param {SelectState} state
 * @returns {boolean}
 */
function onlyChild(query, _1, _2, _3, state) {
  assertDeep(state, query)
  return state.nodeCount === 1
}

/**
 * Check whether a node matches an `:only-of-type` pseudo.
 *
 * @param {AstPseudoClass} query
 * @param {Node} _1
 * @param {number | undefined} _2
 * @param {Parent | undefined} _3
 * @param {SelectState} state
 * @returns {boolean}
 */
function onlyOfType(query, _1, _2, _3, state) {
  assertDeep(state, query)
  return state.typeCount === 1
}

/**
 * Check whether a node matches a `:root` pseudo.
 *
 * @param {AstPseudoClass} _1
 * @param {Node} node
 * @param {number | undefined} _2
 * @param {Parent | undefined} parent
 * @returns {boolean}
 */
function root(_1, node, _2, parent) {
  return node && !parent
}

/**
 * Check whether a node matches a `:scope` pseudo.
 *
 * @param {AstPseudoClass} _1
 * @param {Node} node
 * @param {number | undefined} _2
 * @param {Parent | undefined} _3
 * @param {SelectState} state
 * @returns {boolean}
 */
function scope(_1, node, _2, _3, state) {
  return node && state.scopeNodes.includes(node)
}

// Shouldn’t be called, parser gives correct data.
/* c8 ignore next 3 */
function invalidPseudo() {
  throw new Error('Invalid pseudo-selector')
}

/**
 * @param {AstPseudoClass} query
 * @returns {never}
 */
function unknownPseudo(query) {
  throw new Error('Unknown pseudo-selector `' + query.name + '`')
}

/**
 * @param {SelectState} state
 * @param {AstPseudoClass} query
 */
function assertDeep(state, query) {
  if (state.shallow) {
    throw new Error('Cannot use `:' + query.name + '` without parent')
  }
}

/**
 * @param {AstPseudoClass} query
 * @returns {(value: number) => boolean}
 */
function getCachedNthCheck(query) {
  /** @type {(value: number) => boolean} */
  // @ts-expect-error: cache.
  let fn = query._cachedFn

  if (!fn) {
    const value = query.argument
    assert(value, 'expected `argument`')

    if (value.type !== 'Formula') {
      throw new Error(
        'Expected `nth` formula, such as `even` or `2n+1` (`of` is not yet supported)'
      )
    }

    fn = nthCheck(value.a + 'n+' + value.b)
    // @ts-expect-error: cache.
    query._cachedFn = fn
  }

  return fn
}
