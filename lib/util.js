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

/**
 * @param {Node} node
 * @returns {node is Parent}
 */
export function root(node) {
  return (
    // Root in nlcst.
    node.type === 'RootNode' ||
    // Rest
    node.type === 'root'
  )
}

/**
 * @param {Node} node
 * @returns {node is Parent}
 */
export function parent(node) {
  // @ts-expect-error: looks like a record.
  return Array.isArray(node.children)
}
