/**
 * @typedef {import('./types.js').Rule} Rule
 * @typedef {import('./types.js').Node} Node
 */

/**
 * @param {Rule} query
 * @param {Node} node
 */
export function name(query, node) {
  return query.tagName === '*' || query.tagName === node.type
}
