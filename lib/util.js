/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 */

/**
 * @param {Node} node
 * @returns {node is Parent}
 */
export function parent(node) {
  // @ts-expect-error: looks like a record.
  return Array.isArray(node.children)
}
