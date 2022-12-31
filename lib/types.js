/**
 * @typedef {import('unist').Node} Node
 *   Any node.
 * @typedef {import('unist').Parent} Parent
 *   Node with children.
 *
 * @typedef {import('css-selector-parser').Selector} Selector
 *   One selector.
 * @typedef {import('css-selector-parser').Selectors} Selectors
 *   Multiple selectors.
 * @typedef {import('css-selector-parser').Rule} Rule
 *   One rule.
 * @typedef {import('css-selector-parser').RuleSet} RuleSet
 *   Multiple rules.
 * @typedef {import('css-selector-parser').RulePseudo} RulePseudo
 *   Pseudo rule.
 * @typedef {import('css-selector-parser').AttrValueType} AttrValueType
 *   Attribute value type.
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
 * @typedef SelectState
 *   Current state.
 * @property {Array<Node>} results
 *   Matches.
 * @property {(query: Selectors | RuleSet | Rule, node: Node | undefined, state: SelectState) => void} any
 *   To do: Remove.
 * @property {SelectIterator | undefined} iterator
 *   Current iterator.
 *   To do: Remove.
 * @property {Array<Node>} scopeNodes
 *   Nodes in scope.
 * @property {boolean} one
 *   Whether we can stop looking after we found one node.
 * @property {boolean} shallow
 *   Whether we only allow selectors without nesting.
 * @property {boolean} index
 *   Whether we need to index siblings.
 * @property {boolean} found
 *   Whether we found at least one match.
 * @property {number | undefined} typeIndex
 *   Track siblings: this current node has `n` nodes with its type before it.
 * @property {number | undefined} nodeIndex
 *   Track siblings: this current node has `n` nodes before it.
 * @property {number | undefined} typeCount
 *   Track siblings: there are `n` siblings with this node’s type.
 * @property {number | undefined} nodeCount
 *   Track siblings: there are `n` siblings.
 *
 * @callback SelectIterator
 *   An iterator.
 * @param {Rule} query
 *   Current rule.
 * @param {Node} node
 *   Current node.
 * @param {number} index
 *   Index of `node` in `parent.
 * @param {Parent | undefined} parent
 *   Parent of `node`.
 * @param {SelectState} state
 *   Current state.
 */

export {}
