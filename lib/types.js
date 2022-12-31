/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 *
 * @typedef {import('css-selector-parser').Selector} Selector
 * @typedef {import('css-selector-parser').Selectors} Selectors
 * @typedef {import('css-selector-parser').RuleSet} RuleSet
 * @typedef {import('css-selector-parser').Rule} Rule
 * @typedef {import('css-selector-parser').RulePseudo} RulePseudo
 * @typedef {import('css-selector-parser').AttrValueType} AttrValueType
 * @typedef {Selector|Rule|RulePseudo} Query
 *
 * @typedef RuleAttr
 *   Fix for types from `css-selector-parser`.
 * @property {string} name
 * @property {string} [operator]
 * @property {AttrValueType} [valueType]
 * @property {string} [value]
 *
 * @typedef RulePseudoSelector
 *   More specific type for registered selector pseudos.
 * @property {string} name
 * @property {'selector'} valueType
 * @property {Selector} value
 *
 * @typedef RulePseudoNth
 *   Overwrite to compile nth-checks once.
 * @property {string} name
 * @property {'function'} valueType
 * @property {(index: number) => boolean} value
 *
 * @typedef SelectState
 * @property {(query: Selectors|RuleSet|Rule, node: Node|undefined, state: SelectState) => Node[]} any
 * @property {SelectIterator|null|undefined} [iterator]
 * @property {Array<Node>} [scopeNodes]
 * @property {boolean} [one=false]
 * @property {boolean} [shallow=false]
 * @property {boolean} [index=false]
 * @property {boolean} [found=false]
 * @property {number} [typeIndex]
 *   Track siblings: this current node has `n` nodes with its type before it.
 * @property {number} [nodeIndex]
 *   Track siblings: this current node has `n` nodes before it.
 * @property {number} [typeCount]
 *   Track siblings: there are `n` siblings with this node’s type.
 * @property {number} [nodeCount]
 *   Track siblings: there are `n` siblings.
 */

/**
 * @callback SelectIterator
 * @param {Rule} query
 * @param {Node} node
 * @param {number} index
 * @param {Parent|null} parent
 * @param {SelectState} state
 */

/**
 * @typedef {(
 *  ((query: Rule, node: Node, index: number|null, parent: Parent|null, state: SelectState) => void)
 * )} Handler
 */

export {}
