/**
 * @typedef {import('./types.js').Rule} Rule
 * @typedef {import('./types.js').Node} Node
 * @typedef {import('./types.js').Parent} Parent
 * @typedef {import('./types.js').SelectState} SelectState
 */

import {attribute} from './attribute.js'
import {name} from './name.js'
import {pseudo} from './pseudo.js'

/**
 * @param {Rule} query
 * @param {Node} node
 * @param {number | undefined} index
 * @param {Parent | undefined} parent
 * @param {SelectState} state
 * @returns {boolean}
 */
export function test(query, node, index, parent, state) {
  if (query.id) throw new Error('Invalid selector: id')
  if (query.classNames) throw new Error('Invalid selector: class')

  return Boolean(
    node &&
      (!query.tagName || name(query, node)) &&
      (!query.attrs || attribute(query, node)) &&
      (!query.pseudos || pseudo(query, node, index, parent, state))
  )
}
