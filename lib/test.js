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
  if (query.ids) throw new Error('Invalid selector: id')
  if (query.classNames) throw new Error('Invalid selector: class')
  if (query.pseudoElement) {
    throw new Error('Invalid selector: `::' + query.pseudoElement + '`')
  }

  return Boolean(
    node &&
      (!query.tag ||
        query.tag.type === 'WildcardTag' ||
        query.tag.name === node.type) &&
      (!query.attributes || attribute(query, node)) &&
      (!query.pseudoClasses || pseudo(query, node, index, parent, state))
  )
}
