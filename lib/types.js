/**
 * @typedef {import('css-selector-parser').Selector} Selector
 * @typedef {import('css-selector-parser').Selectors} Selectors
 * @typedef {import('css-selector-parser').RuleSet} RuleSet
 * @typedef {import('css-selector-parser').Rule} Rule
 * @typedef {import('css-selector-parser').RulePseudo} RulePseudo
 * @typedef {import('css-selector-parser').AttrValueType} AttrValueType
 * @typedef {Selector|Rule|RulePseudo} Query
 *
 * Fix for types.
 * @typedef {Object} RuleAttr
 * @property {string} name
 * @property {string} [operator]
 * @property {AttrValueType} [valueType]
 * @property {string} [value]
 *
 * More specific type for registered selector pseudos.
 * @typedef {Object} RulePseudoSelector
 * @property {string} name
 * @property {'selector'} valueType
 * @property {Selector} value
 *
 * Overwrite to compile nth-checks once.
 * @typedef {Object} RulePseudoNth
 * @property {string} name
 * @property {'function'} valueType
 * @property {(index: number) => boolean} value
 *
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 *
 * @typedef {Object} SelectState
 * @property {(query: Selectors|RuleSet|Rule, node: Node|undefined, state: SelectState) => Node[]} any
 * @property {Array.<Node>} [scopeNodes]
 * @property {SelectIterator|null|undefined} [iterator]
 * @property {boolean} [one=false]
 * @property {boolean} [shallow=false]
 * @property {boolean} [index=false]
 * @property {boolean} [found=false]
 * @property {number} [typeIndex] Track siblings
 * @property {number} [nodeIndex] Track siblings
 * @property {number} [typeCount] Track siblings
 * @property {number} [nodeCount] Track siblings
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
