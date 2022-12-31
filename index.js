/**
 * @typedef {import('unist').Position} Position
 * @typedef {import('unist').Node} Node
 * @typedef {Record<string, unknown> & {type: string, position?: Position|undefined}} NodeLike
 */

import {any} from './lib/any.js'
import {parse} from './lib/parse.js'

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
 * @param {Node | NodeLike | undefined} [node]
 *   Node that might match `selector`.
 * @returns {boolean}
 *   Whether `node` matches `selector`.
 */
export function matches(selector, node) {
  return Boolean(any(parse(selector), node, {one: true, shallow: true, any})[0])
}

/**
 * Select the first node that matches `selector` in the given `tree`.
 *
 * Searches the tree in *preorder*.
 *
 * @param {string} selector
 *   CSS selector, such as (`heading`, `link, linkReference`).
 * @param {Node | NodeLike | undefined} [tree]
 *   Tree to search.
 * @returns {Node | null}
 *   First node in `tree` that matches `selector` or `null` if nothing is
 *   found.
 *
 *   This could be `tree` itself.
 */
export function select(selector, tree) {
  return any(parse(selector), tree, {one: true, any})[0] || null
}

/**
 * Select all nodes that match `selector` in the given `tree`.
 *
 * Searches the tree in *preorder*.
 *
 * @param {string} selector
 *   CSS selector, such as (`heading`, `link, linkReference`).
 * @param {Node | NodeLike | undefined} [tree]
 *   Tree to search.
 * @returns {Array<Node>}
 *   Nodes in `tree` that match `selector`.
 *
 *   This could include `tree` itself.
 */
export function selectAll(selector, tree) {
  return any(parse(selector), tree, {any})
}
