/**
 * @typedef {import('./types.js').Node} Node
 * @typedef {import('./types.js').Parent} Parent
 */

/**
 * @param {Node} node
 * @returns {node is Parent}
 */
export function parent(node) {
  // @ts-expect-error: looks like a record.
  return Array.isArray(node.children)
}
