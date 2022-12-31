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
 * @typedef {Selector | Rule | RulePseudo} Query
 *
 * @typedef RuleAttr
 *   Fix for types from `css-selector-parser`.
 * @property {string} name
 *   Attribute name.
 * @property {string | undefined} [operator]
 *   Operator, such as `'|='`, missing when for example `[x]`.
 * @property {AttrValueType | undefined} [valueType]
 *   Attribute value type.
 * @property {string | undefined} [value]
 *   Attribute value.
 *
 * @typedef RulePseudoSelector
 *   More specific type for registered selector pseudos.
 * @property {string} name
 *   Name of pseudo, such as `'matches'`.
 * @property {'selector'} valueType
 *   Set to `'selector'`, because `value` is a compiled selector.
 * @property {Selectors | RuleSet} value
 *   Selector.
 *
 * @typedef RulePseudoNth
 *   Overwrite to compile nth-checks once.
 * @property {string} name
 * @property {'function'} valueType
 * @property {(index: number) => boolean} value
 *
 * @typedef SelectState
 * @property {(query: Selectors | RuleSet | Rule, node: Node | undefined, state: SelectState) => Array<Node>} any
 * @property {SelectIterator | undefined} iterator
 * @property {Array<Node>} scopeNodes
 * @property {boolean} one
 * @property {boolean} shallow
 * @property {boolean} index
 * @property {boolean} found
 * @property {number | undefined} typeIndex
 *   Track siblings: this current node has `n` nodes with its type before it.
 * @property {number | undefined} nodeIndex
 *   Track siblings: this current node has `n` nodes before it.
 * @property {number | undefined} typeCount
 *   Track siblings: there are `n` siblings with this node’s type.
 * @property {number | undefined} nodeCount
 *   Track siblings: there are `n` siblings.
 */

/**
 * @callback SelectIterator
 * @param {Rule} query
 * @param {Node} node
 * @param {number} index
 * @param {Parent | undefined} parent
 * @param {SelectState} state
 */

/**
 * @typedef {(
 *  ((query: Rule, node: Node, index: number | undefined, parent: Parent | undefined, state: SelectState) => void)
 * )} Handler
 */

export {}
