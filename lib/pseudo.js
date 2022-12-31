/**
 * @typedef {import('./types.js').Rule} Rule
 * @typedef {import('./types.js').RulePseudo} RulePseudo
 * @typedef {import('./types.js').RulePseudoSelector} RulePseudoSelector
 * @typedef {import('./types.js').Parent} Parent
 * @typedef {import('./types.js').Selector} Selector
 * @typedef {import('./types.js').Selectors} Selectors
 * @typedef {import('./types.js').SelectState} SelectState
 * @typedef {import('./types.js').Node} Node
 */

import fauxEsmNthCheck from 'nth-check'
import {convert} from 'unist-util-is'
import {zwitch} from 'zwitch'
import {parent} from './util.js'

/** @type {import('nth-check').default} */
// @ts-expect-error
const nthCheck = fauxEsmNthCheck.default || fauxEsmNthCheck

const is = convert()

/** @type {(rule: Rule | RulePseudo, element: Node, index: number | undefined, parent: Parent | undefined, state: SelectState) => boolean} */
const handle = zwitch('name', {
  unknown: unknownPseudo,
  invalid: invalidPseudo,
  handlers: {
    any: matches,
    blank: empty,
    empty,
    'first-child': firstChild,
    'first-of-type': firstOfType,
    has: hasSelector,
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
 * @param {RulePseudoSelector} query
 * @param {Node} node
 * @param {number | undefined} _1
 * @param {Parent | undefined} _2
 * @param {SelectState} state
 * @returns {boolean}
 */
function matches(query, node, _1, _2, state) {
  const shallow = state.shallow
  const one = state.one

  state.shallow = false
  state.one = true

  const result = state.any(query.value, node, state)[0] === node

  state.shallow = shallow
  state.one = one

  return result
}

/**
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
 * @param {RulePseudo} _1
 * @param {Node} node
 * @param {number | undefined} _2
 * @param {Parent | undefined} parent
 * @returns {boolean}
 */
function root(_1, node, _2, parent) {
  return is(node) && !parent
}

/**
 * @param {RulePseudo} _1
 * @param {Node} node
 * @param {number | undefined} _2
 * @param {Parent | undefined} _3
 * @param {SelectState} state
 * @returns {boolean}
 */
function scope(_1, node, _2, _3, state) {
  return (
    is(node) &&
    state.scopeNodes !== undefined &&
    state.scopeNodes.includes(node)
  )
}

/**
 * @param {RulePseudo} _1
 * @param {Node} node
 * @returns {boolean}
 */
function empty(_1, node) {
  return parent(node) ? node.children.length === 0 : !('value' in node)
}

/**
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
 * @param {RulePseudoSelector} query
 * @param {Node} node
 * @param {number | undefined} _1
 * @param {Parent | undefined} _2
 * @param {SelectState} state
 * @returns {boolean}
 */
function hasSelector(query, node, _1, _2, state) {
  const shallow = state.shallow
  const one = state.one
  const scopeNodes = state.scopeNodes
  const value = appendScope(query.value)
  const anything = state.any

  state.shallow = false
  state.one = true
  state.scopeNodes = [node]

  const result = Boolean(anything(value, node, state)[0])

  state.shallow = shallow
  state.one = one
  state.scopeNodes = scopeNodes

  return result
}

/**
 * @param {Selector} value
 */
function appendScope(value) {
  /** @type {Selectors} */
  const selector =
    value.type === 'ruleSet' ? {type: 'selectors', selectors: [value]} : value
  let index = -1
  /** @type {Rule} */
  let rule

  while (++index < selector.selectors.length) {
    rule = selector.selectors[index].rule
    rule.nestingOperator = null

    // Needed if new pseudo’s are added that accepts commas (such as
    // `:lang(en, nl)`)
    /* c8 ignore else */
    if (
      !rule.pseudos ||
      rule.pseudos.length !== 1 ||
      rule.pseudos[0].name !== 'scope'
    ) {
      selector.selectors[index] = {
        type: 'ruleSet',
        rule: {
          type: 'rule',
          rule,
          // @ts-expect-error pseudos are fine w/ just a name!
          pseudos: [{name: 'scope'}]
        }
      }
    }
  }

  return selector
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
