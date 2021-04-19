import {CssSelectorParser} from 'css-selector-parser'
import nthCheck from 'nth-check'
import {zwitch} from 'zwitch'

var nth = new Set([
  'nth-child',
  'nth-last-child',
  'nth-of-type',
  'nth-last-of-type'
])

var parser = new CssSelectorParser()

var compile = zwitch('type', {
  handlers: {selectors, ruleSet, rule}
})

parser.registerAttrEqualityMods('~', '^', '$', '*')
parser.registerSelectorPseudos('any', 'matches', 'not', 'has')
parser.registerNestingOperators('>', '+', '~')

export function parse(selector) {
  if (typeof selector !== 'string') {
    throw new TypeError('Expected `string` as selector, not `' + selector + '`')
  }

  return compile(parser.parse(selector))
}

function selectors(query) {
  var selectors = query.selectors
  var index = -1

  while (++index < selectors.length) {
    compile(selectors[index])
  }

  return query
}

function ruleSet(query) {
  return rule(query.rule)
}

function rule(query) {
  var pseudos = query.pseudos || []
  var index = -1
  var pseudo

  while (++index < pseudos.length) {
    pseudo = pseudos[index]

    if (nth.has(pseudo.name)) {
      pseudo.value = nthCheck.default(pseudo.value)
      pseudo.valueType = 'function'
    }
  }

  compile(query.rule)

  return query
}
