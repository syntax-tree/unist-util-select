/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 */

import {unreachable} from 'devlop'

/**
 * TypeScript helper to check if something is indexable (any object is
 * indexable in JavaScript).
 *
 * @param {unknown} value
 *   Thing to check.
 * @returns {asserts value is Record<string, unknown>}
 *   Nothing.
 * @throws {Error}
 *   When `value` is not an object.
 */
export function indexable(value) {
  // Always called when something is an object, this is just for TS.
  /* c8 ignore next 3 */
  if (!value || typeof value !== 'object') {
    unreachable('Expected object')
  }
}

/**
 * @param {Node} node
 * @returns {node is Parent}
 */
export function parent(node) {
  indexable(node)
  return Array.isArray(node.children)
}
