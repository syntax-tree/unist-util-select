/**
 * @typedef {import('unist').Node} Node
 */

import {any} from './lib/any.js'
import {parse} from './lib/parse.js'

/**
 * @param {string} selector
 * @param {Node} [node]
 * @returns {boolean}
 */
export function matches(selector, node) {
  return Boolean(any(parse(selector), node, {one: true, shallow: true, any})[0])
}

/**
 * @param {string} selector
 * @param {Node} [node]
 * @returns {Node|null}
 */
export function select(selector, node) {
  return any(parse(selector), node, {one: true, any})[0] || null
}

/**
 * @param {string} selector
 * @param {Node} [node]
 * @returns {Array.<Node>}
 */
export function selectAll(selector, node) {
  return any(parse(selector), node, {any})
}
