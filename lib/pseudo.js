/**
 * @typedef {import('./types.js').Rule} Rule
 * @typedef {import('./types.js').RulePseudo} RulePseudo
 * @typedef {import('./types.js').RulePseudoSelector} RulePseudoSelector
 * @typedef {import('./types.js').Parent} Parent
 * @typedef {import('./types.js').SelectState} SelectState
 * @typedef {import('./types.js').Node} Node
 */

import fauxEsmNthCheck from 'nth-check'
import {zwitch} from 'zwitch'
import {parent} from './util.js'
import {queryToSelectors, walk} from './walk.js'

/** @type {import('nth-check').default} */
// @ts-expect-error
const nthCheck = fauxEsmNthCheck.default || fauxEsmNthCheck

/** @type {(rule: Rule | RulePseudo, node: Node, index: number | undefined, parent: Parent | undefined, state: SelectState) => boolean} */
const handle = zwitch('name', {
  unknown: unknownPseudo,
  invalid: invalidPseudo,
  handlers: {
    any: matches,
    blank: empty,
    empty,
    'first-child': firstChild,
    'first-of-type': firstOfType,
    has,
    'last-child': lastChild,
    'last-of-type': lastOfType,
    matches,
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

pseudo.needsIndex = [
  'any',
  'first-child',
  'first-of-type',
  'last-child',
  'last-of-type',
  'matches',
  'not',
  'nth-child',
  'nth-last-child',
  'nth-of-type',
  'nth-last-of-type',
  'only-child',
  'only-of-type'
]

/**
 * Check whether an node matches pseudo selectors.
 *
 * @param {Rule} query
 * @param {Node} node
 * @param {number | undefined} index
 * @param {Parent | undefined} parent
 * @param {SelectState} state
 * @returns {boolean}
 */
export function pseudo(query, node, index, parent, state) {
  const pseudos = query.pseudos
  let offset = -1

  while (++offset < pseudos.length) {
    if (!handle(pseudos[offset], node, index, parent, state)) return false
  }

  return true
}

/**
 * Check whether a node matches an `:empty` pseudo.
 *
 * @param {RulePseudo} _1
 * @param {Node} node
 * @returns {boolean}
 */
function empty(_1, node) {
  return parent(node) ? node.children.length === 0 : !('value' in node)
}

/**
 * Check whether a node matches a `:first-child` pseudo.
 *
 * @param {RulePseudo} query
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
 * @param {RulePseudo} query
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
 * @param {RulePseudoSelector} query
 * @param {Node} node
 * @param {number | undefined} _1
 * @param {Parent | undefined} _2
 * @param {SelectState} state
 * @returns {boolean}
 */
function has(query, node, _1, _2, state) {
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
    rootQuery: queryToSelectors(query.value)
  }

  walk(childState, fragment)

  return childState.results.length > 0
}

/**
 * Check whether a node matches a `:last-child` pseudo.
 *
 * @param {RulePseudo} query
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
 * @param {RulePseudo} query
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
 * Check whether a node `:matches` further selectors.
 *
 * @param {RulePseudoSelector} query
 * @param {Node} node
 * @param {number | undefined} _1
 * @param {Parent | undefined} _2
 * @param {SelectState} state
 * @returns {boolean}
 */
function matches(query, node, _1, _2, state) {
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
    rootQuery: queryToSelectors(query.value)
  }

  walk(childState, node)

  return childState.results[0] === node
}

/**
 * Check whether a node does `:not` match further selectors.
 *
 * @param {RulePseudoSelector} query
 * @param {Node} node
 * @param {number | undefined} index
 * @param {Parent | undefined} parent
 * @param {SelectState} state
 * @returns {boolean}
 */
function not(query, node, index, parent, state) {
  return !matches(query, node, index, parent, state)
}

/**
 * Check whether a node matches an `:nth-child` pseudo.
 *
 * @param {RulePseudo} query
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
 * @param {RulePseudo} query
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
 * @param {RulePseudo} query
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
 * @param {RulePseudo} query
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
 * @param {RulePseudo} query
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
 * @param {RulePseudo} query
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
 * @param {RulePseudo} _1
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
 * @param {RulePseudo} _1
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
 * @param {unknown} query
 * @returns {never}
 */
function unknownPseudo(query) {
  // @ts-expect-error: indexable.
  if (query.name) {
    // @ts-expect-error: indexable.
    throw new Error('Unknown pseudo-selector `' + query.name + '`')
  }

  throw new Error('Unexpected pseudo-element or empty pseudo-class')
}

/**
 * @param {SelectState} state
 * @param {RulePseudo} query
 */
function assertDeep(state, query) {
  if (state.shallow) {
    throw new Error('Cannot use `:' + query.name + '` without parent')
  }
}

/**
 * @param {RulePseudo} query
 * @returns {(value: number) => boolean}
 */
function getCachedNthCheck(query) {
  /** @type {(value: number) => boolean} */
  // @ts-expect-error: cache.
  let fn = query._cachedFn

  if (!fn) {
    // @ts-expect-error: always string.
    fn = nthCheck(query.value)
    // @ts-expect-error: cache.
    query._cachedFn = fn
  }

  return fn
}
