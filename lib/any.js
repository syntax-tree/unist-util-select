/**
 * @typedef {import('./types.js').Selector} Selector
 * @typedef {import('./types.js').Selectors} Selectors
 * @typedef {import('./types.js').Rule} Rule
 * @typedef {import('./types.js').RuleSet} RuleSet
 * @typedef {import('./types.js').RulePseudo} RulePseudo
 * @typedef {import('./types.js').Query} Query
 * @typedef {import('./types.js').Node} Node
 * @typedef {import('./types.js').Parent} Parent
 * @typedef {import('./types.js').SelectIterator} SelectIterator
 * @typedef {import('./types.js').SelectState} SelectState
 */

import {zwitch} from 'zwitch'
import {nest} from './nest.js'
import {pseudo} from './pseudo.js'
import {test} from './test.js'
import {root} from './util.js'

const type = zwitch('type', {
  // @ts-expect-error: hush.
  unknown: unknownType,
  invalid: invalidType,
  // @ts-expect-error: hush.
  handlers: {selectors, ruleSet, rule}
})

/**
 * @param {Selectors|RuleSet|Rule} query
 * @param {Node|undefined} node
 * @param {SelectState} state
 * @returns {Array.<Node>}
 */
export function any(query, node, state) {
  // @ts-expect-error: fine.
  return query && node ? type(query, node, state) : []
}

/**
 * @param {Selectors} query
 * @param {Node} node
 * @param {SelectState} state
 */
function selectors(query, node, state) {
  const collect = collector(state.one)
  let index = -1

  while (++index < query.selectors.length) {
    collect(ruleSet(query.selectors[index], node, state))
  }

  return collect.result
}

/**
 * @param {RuleSet} query
 * @param {Node} node
 * @param {SelectState} state
 */
function ruleSet(query, node, state) {
  return rule(query.rule, node, state)
}

/**
 * @param {Rule} query
 * @param {Node} tree
 * @param {SelectState} state
 */
function rule(query, tree, state) {
  const collect = collector(state.one)

  if (state.shallow && query.rule) {
    throw new Error('Expected selector without nesting')
  }

  nest(
    query,
    tree,
    0,
    null,
    configure(query, {
      scopeNodes: root(tree) ? tree.children : [tree],
      index: false,
      iterator,
      one: state.one,
      shallow: state.shallow,
      any: state.any
    })
  )

  return collect.result

  /** @type {SelectIterator} */
  function iterator(query, node, index, parent, state) {
    if (test(query, node, index, parent, state)) {
      if (query.rule) {
        nest(query.rule, node, index, parent, configure(query.rule, state))
      } else {
        collect(node)
        state.found = true
      }
    }
  }
}

/**
 * @template {SelectState} S
 * @param {Rule} query
 * @param {S} state
 * @returns {S}
 */
function configure(query, state) {
  const pseudos = query.pseudos || []
  let index = -1

  while (++index < pseudos.length) {
    if (pseudo.needsIndex.includes(pseudos[index].name)) {
      state.index = true
      break
    }
  }

  return state
}

// Shouldn’t be invoked, all data is handled.
/* c8 ignore next 6 */
/**
 * @param {{[x: string]: unknown, type: string}} query
 */
function unknownType(query) {
  throw new Error('Unknown type `' + query.type + '`')
}

// Shouldn’t be invoked, parser gives correct data.
/* c8 ignore next 3 */
function invalidType() {
  throw new Error('Invalid type')
}

/**
 * @param {boolean|undefined} one
 */
function collector(one) {
  /** @type {Array.<Node>} */
  const result = []
  /** @type {boolean} */
  let found

  collect.result = result

  return collect

  /**
   * Append nodes to array, filtering out duplicates.
   *
   * @param {Node|Array.<Node>} node
   */
  function collect(node) {
    let index = -1

    if ('length' in node) {
      while (++index < node.length) {
        collectOne(node[index])
      }
    } else {
      collectOne(node)
    }
  }

  /**
   * @param {Node} node
   */
  function collectOne(node) {
    if (one) {
      /* Shouldn’t happen, safeguards performance problems. */
      /* c8 ignore next */
      if (found) throw new Error('Cannot collect multiple nodes')

      found = true
    }

    if (!result.includes(node)) result.push(node)
  }
}
