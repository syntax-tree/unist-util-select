/**
 * @typedef {import('css-selector-parser').AstRule} AstRule
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 * @typedef {import('./types.js').SelectState} SelectState
 */

import {attribute} from './attribute.js'
import {pseudo} from './pseudo.js'

/**
 * @param {AstRule} query
 * @param {Node} node
 * @param {number | undefined} index
 * @param {Parent | undefined} parent
 * @param {SelectState} state
 * @returns {boolean}
 */
export function test(query, node, index, parent, state) {
  for (const item of query.items) {
    // eslint-disable-next-line unicorn/prefer-switch
    if (item.type === 'Attribute') {
      if (!attribute(item, node)) return false
    } else if (item.type === 'Id') {
      throw new Error('Invalid selector: id')
    } else if (item.type === 'ClassName') {
      throw new Error('Invalid selector: class')
    } else if (item.type === 'PseudoClass') {
      if (!pseudo(item, node, index, parent, state)) return false
    } else if (item.type === 'PseudoElement') {
      throw new Error('Invalid selector: `::' + item.name + '`')
    } else if (item.type === 'TagName') {
      if (item.name !== node.type) return false
    } else {
      // Otherwise `item.type` is `WildcardTag`, which matches.
    }
  }

  return true
}
