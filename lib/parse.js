/**
 * @typedef {import('./types.js').Selectors} Selectors
 */

import {CssSelectorParser} from 'css-selector-parser'

const parser = new CssSelectorParser()

parser.registerAttrEqualityMods('~', '^', '$', '*')
parser.registerSelectorPseudos('any', 'matches', 'not', 'has')
parser.registerNestingOperators('>', '+', '~')

/**
 * @param {string} selector
 * @returns {Selectors}
 */
export function parse(selector) {
  if (typeof selector !== 'string') {
    throw new TypeError('Expected `string` as selector, not `' + selector + '`')
  }

  const query = parser.parse(selector)
  // Empty selectors object doesn’t match anything.
  if (!query) {
    return {type: 'selectors', selectors: []}
  }

  if (query.type === 'selectors') {
    return query
  }

  return {type: 'selectors', selectors: [query]}
}
