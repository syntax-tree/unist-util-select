/**
 * @typedef {import('unist').Position} Position
 * @typedef {import('unist').Node} Node
 * @typedef {import('./lib/types.js').SelectState} SelectState
 * @typedef {Record<string, unknown> & {type: string, position?: Position | undefined}} NodeLike
 */

import {any} from './lib/any.js'
import {parse} from './lib/parse.js'
import {root} from './lib/util.js'

/**
 * Check that the given `node` matches `selector`.
 *
 * This only checks the node itself, not the surrounding tree.
 * Thus, nesting in selectors is not supported (`paragraph strong`,
 * `paragraph > strong`), neither are selectors like `:first-child`, etc.
 * This only checks that the given node matches the selector.
 *
 * @param {string} selector
 *   CSS selector, such as (`heading`, `link, linkReference`).
 * @param {Node | NodeLike | null | undefined} [node]
 *   Node that might match `selector`.
 * @returns {boolean}
 *   Whether `node` matches `selector`.
 */
export function matches(selector, node) {
  const state = createState(node)
  state.one = true
  state.shallow = true
  any(parse(selector), node || undefined, state)
  return state.results.length > 0
}

/**
 * Select the first node that matches `selector` in the given `tree`.
 *
 * Searches the tree in *preorder*.
 *
 * @param {string} selector
 *   CSS selector, such as (`heading`, `link, linkReference`).
 * @param {Node | NodeLike | null | undefined} [tree]
 *   Tree to search.
 * @returns {Node | null}
 *   First node in `tree` that matches `selector` or `null` if nothing is
 *   found.
 *
 *   This could be `tree` itself.
 */
export function select(selector, tree) {
  const state = createState(tree)
  state.one = true
  any(parse(selector), tree || undefined, state)
  // To do next major: return `undefined`.
  return state.results[0] || null
}

/**
 * Select all nodes that match `selector` in the given `tree`.
 *
 * Searches the tree in *preorder*.
 *
 * @param {string} selector
 *   CSS selector, such as (`heading`, `link, linkReference`).
 * @param {Node | NodeLike | null | undefined} [tree]
 *   Tree to search.
 * @returns {Array<Node>}
 *   Nodes in `tree` that match `selector`.
 *
 *   This could include `tree` itself.
 */
export function selectAll(selector, tree) {
  const state = createState(tree)
  any(parse(selector), tree || undefined, state)
  return state.results
}

/**
 * @param {Node | null | undefined} tree
 * @returns {SelectState}
 */
function createState(tree) {
  return {
    results: [],
    any,
    iterator: undefined,
    scopeNodes: tree ? (root(tree) ? tree.children : [tree]) : [],
    one: false,
    shallow: false,
    index: false,
    found: false,
    typeIndex: undefined,
    nodeIndex: undefined,
    typeCount: undefined,
    nodeCount: undefined
  }
}
