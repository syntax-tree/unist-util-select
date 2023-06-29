/**
 * @typedef {import('css-selector-parser').AstSelector} AstSelector
 */

import {createParser} from 'css-selector-parser'

const cssSelectorParse = createParser({syntax: 'selectors-4'})

// .
// const parser = new CssSelectorParser()

// parser.registerAttrEqualityMods('~', '^', '$', '*')
// parser.registerSelectorPseudos('any', 'matches', 'not', 'has')
// parser.registerNestingOperators('>', '+', '~')

/**
 * @param {string} selector
 * @returns {AstSelector}
 */
export function parse(selector) {
  if (typeof selector !== 'string') {
    throw new TypeError('Expected `string` as selector, not `' + selector + '`')
  }

  return cssSelectorParse(selector)
}
