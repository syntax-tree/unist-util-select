/**
 * @typedef {import('./types.js').Node} Node
 * @typedef {import('./types.js').Parent} Parent
 * @typedef {import('./types.js').RuleSet} RuleSet
 * @typedef {import('./types.js').SelectState} SelectState
 * @typedef {import('./types.js').Selectors} Selectors
 *
 * @typedef Nest
 *   Rule sets by nesting.
 * @property {Array<RuleSet> | undefined} descendant
 *   `a b`
 * @property {Array<RuleSet> | undefined} directChild
 *   `a > b`
 * @property {Array<RuleSet> | undefined} adjacentSibling
 *   `a + b`
 * @property {Array<RuleSet> | undefined} generalSibling
 *   `a ~ b`
 *
 * @typedef Counts
 *   Info on nodes in a parent.
 * @property {number} count
 *   Number of nodes.
 * @property {Map<string, number>} types
 *   Number of nodes by type.
 */

import {test} from './test.js'
import {parent} from './util.js'

/** @type {Array<never>} */
const empty = []

/**
 * Turn a query into a uniform object.
 *
 * @param {Selectors | RuleSet | null} query
 * @returns {Selectors}
 */
export function queryToSelectors(query) {
  if (query === null) {
    return {type: 'selectors', selectors: []}
  }

  if (query.type === 'ruleSet') {
    return {type: 'selectors', selectors: [query]}
  }

  return query
}

/**
 * Walk a tree.
 *
 * @param {SelectState} state
 * @param {Node | undefined} tree
 */
export function walk(state, tree) {
  if (tree) {
    one(state, [], tree, undefined, undefined)
  }
}

/**
 * Check a node.
 *
 * @param {SelectState} state
 * @param {Array<RuleSet>} currentRules
 * @param {Node} node
 * @param {number | undefined} index
 * @param {Parent | undefined} parentNode
 * @returns {Nest}
 */
function one(state, currentRules, node, index, parentNode) {
  /** @type {Nest} */
  let nestResult = {
    directChild: undefined,
    descendant: undefined,
    adjacentSibling: undefined,
    generalSibling: undefined
  }

  nestResult = applySelectors(
    state,
    // Try the root rules for this node too.
    combine(currentRules, state.rootQuery.selectors),
    node,
    index,
    parentNode
  )

  // If this is a parent, and we want to delve into them, and we haven’t found
  // our single result yet.
  if (parent(node) && !state.shallow && !(state.one && state.found)) {
    all(state, nestResult, node)
  }

  return nestResult
}

/**
 * Check a node.
 *
 * @param {SelectState} state
 * @param {Nest} nest
 * @param {Parent} node
 * @returns {void}
 */
function all(state, nest, node) {
  const fromParent = combine(nest.descendant, nest.directChild)
  /** @type {Array<RuleSet> | undefined} */
  let fromSibling
  let index = -1
  /**
   * Total counts.
   * @type {Counts}
   */
  const total = {count: 0, types: new Map()}
  /**
   * Counts of previous siblings.
   * @type {Counts}
   */
  const before = {count: 0, types: new Map()}

  while (++index < node.children.length) {
    count(total, node.children[index])
  }

  index = -1

  while (++index < node.children.length) {
    const child = node.children[index]
    // Uppercase to prevent prototype polution, injecting `constructor` or so.
    const name = child.type.toUpperCase()
    // Before counting further nodes:
    state.nodeIndex = before.count
    state.typeIndex = before.types.get(name) || 0
    // After counting all nodes.
    state.nodeCount = total.count
    state.typeCount = total.types.get(name)

    // Only apply if this is a parent.
    const forSibling = combine(fromParent, fromSibling)
    const nest = one(state, forSibling, node.children[index], index, node)
    fromSibling = combine(nest.generalSibling, nest.adjacentSibling)

    // We found one thing, and one is enough.
    if (state.one && state.found) {
      break
    }

    count(before, node.children[index])
  }
}

/**
 * Apply selectors to a node.
 *
 * @param {SelectState} state
 *   Current state.
 * @param {Array<RuleSet>} rules
 *   Rules to apply.
 * @param {Node} node
 *   Node to apply rules to.
 * @param {number | undefined} index
 *   Index of node in parent.
 * @param {Parent | undefined} parent
 *   Parent of node.
 * @returns {Nest}
 *   Further rules.
 */
function applySelectors(state, rules, node, index, parent) {
  /** @type {Nest} */
  const nestResult = {
    directChild: undefined,
    descendant: undefined,
    adjacentSibling: undefined,
    generalSibling: undefined
  }
  let selectorIndex = -1

  while (++selectorIndex < rules.length) {
    const ruleSet = rules[selectorIndex]

    // We found one thing, and one is enough.
    if (state.one && state.found) {
      break
    }

    // When shallow, we don’t allow nested rules.
    // Idea: we could allow a stack of parents?
    // Might get quite complex though.
    if (state.shallow && ruleSet.rule.rule) {
      throw new Error('Expected selector without nesting')
    }

    // If this rule matches:
    if (test(ruleSet.rule, node, index, parent, state)) {
      const nest = ruleSet.rule.rule

      // Are there more?
      if (nest) {
        /** @type {RuleSet} */
        const rule = {type: 'ruleSet', rule: nest}
        /** @type {keyof Nest} */
        const label =
          nest.nestingOperator === '+'
            ? 'adjacentSibling'
            : nest.nestingOperator === '~'
            ? 'generalSibling'
            : nest.nestingOperator === '>'
            ? 'directChild'
            : 'descendant'
        add(nestResult, label, rule)
      } else {
        // We have a match!
        state.found = true

        if (!state.results.includes(node)) {
          state.results.push(node)
        }
      }
    }

    // Descendant.
    if (ruleSet.rule.nestingOperator === null) {
      add(nestResult, 'descendant', ruleSet)
    }
    // Adjacent.
    else if (ruleSet.rule.nestingOperator === '~') {
      add(nestResult, 'generalSibling', ruleSet)
    }
    // Drop top-level nesting (`undefined`), direct child (`>`), adjacent sibling (`+`).
  }

  return nestResult
}

/**
 * Combine two lists, if needed.
 *
 * This is optimized to create as few lists as possible.
 *
 * @param {Array<RuleSet> | undefined} left
 * @param {Array<RuleSet> | undefined} right
 * @returns {Array<RuleSet>}
 */
function combine(left, right) {
  return left && right && left.length > 0 && right.length > 0
    ? [...left, ...right]
    : left && left.length > 0
    ? left
    : right && right.length > 0
    ? right
    : empty
}

/**
 * Add a rule to a nesting map.
 *
 * @param {Nest} nest
 * @param {keyof Nest} field
 * @param {RuleSet} rule
 */
function add(nest, field, rule) {
  const list = nest[field]
  if (list) {
    list.push(rule)
  } else {
    nest[field] = [rule]
  }
}

/**
 * Count a node.
 *
 * @param {Counts} counts
 *   Counts.
 * @param {Node} node
 *   Node.
 * @returns {void}
 *   Nothing.
 */
function count(counts, node) {
  // Uppercase to prevent prototype polution, injecting `constructor` or so.
  // Normalize because HTML is insensitive.
  const name = node.type.toUpperCase()
  const count = (counts.types.get(name) || 0) + 1
  counts.count++
  counts.types.set(name, count)
}