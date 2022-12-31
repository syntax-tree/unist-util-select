/**
 * @typedef {import('./types.js').Rule} Rule
 * @typedef {import('./types.js').Node} Node
 */

/**
 * Check whether an element has a type.
 *
 * @param {Rule} query
 * @param {Node} node
 */
export function name(query, node) {
  return query.tagName === '*' || query.tagName === node.type
}
