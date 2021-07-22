/**
 * @typedef {import('./types.js').Selector} Selector
 * @typedef {import('./types.js').Selectors} Selectors
 * @typedef {import('./types.js').RuleSet} RuleSet
 * @typedef {import('./types.js').Rule} Rule
 * @typedef {import('./types.js').RulePseudo} RulePseudo
 * @typedef {import('./types.js').RulePseudoNth} RulePseudoNth
 */

import {CssSelectorParser} from 'css-selector-parser'
import fauxEsmNthCheck from 'nth-check'
import {zwitch} from 'zwitch'

/** @type {import('nth-check').default} */
// @ts-expect-error
const nthCheck = fauxEsmNthCheck.default

const nth = new Set([
  'nth-child',
  'nth-last-child',
  'nth-of-type',
  'nth-last-of-type'
])

const parser = new CssSelectorParser()

parser.registerAttrEqualityMods('~', '^', '$', '*')
parser.registerSelectorPseudos('any', 'matches', 'not', 'has')
parser.registerNestingOperators('>', '+', '~')

// @ts-expect-error: hush.
const compile = zwitch('type', {handlers: {selectors, ruleSet, rule}})

/**
 * @param {string} selector
 * @returns {Selector}
 */
export function parse(selector) {
  if (typeof selector !== 'string') {
    throw new TypeError('Expected `string` as selector, not `' + selector + '`')
  }

  // @ts-expect-error types are wrong.
  return compile(parser.parse(selector))
}

/**
 * @param {Selectors} query
 */
function selectors(query) {
  const selectors = query.selectors
  let index = -1

  while (++index < selectors.length) {
    compile(selectors[index])
  }

  return query
}

/**
 * @param {RuleSet} query
 */
function ruleSet(query) {
  return rule(query.rule)
}

/**
 * @param {Rule} query
 */
function rule(query) {
  const pseudos = query.pseudos || []
  let index = -1
  /** @type {RulePseudo|RulePseudoNth} */
  let pseudo

  while (++index < pseudos.length) {
    pseudo = pseudos[index]

    if (nth.has(pseudo.name)) {
      // @ts-expect-error Patch a non-primitive type.
      pseudo.value = nthCheck(pseudo.value)
      // @ts-expect-error Patch a non-primitive type.
      pseudo.valueType = 'function'
    }
  }

  compile(query.rule)

  return query
}
