'use strict'

var Parser = require('css-selector-parser').CssSelectorParser

var nthCheck = require('nth-check')

module.exports = parseSelector

function parseSelector(selector) {
  var parser = new Parser()
  parser.registerNestingOperators('>', '+', '~')
  parser.registerAttrEqualityMods('^', '*', '$')
  parser.registerSelectorPseudos('not')
  return compileNthChecks(parser.parse(selector))
}

function compileNthChecks(ast) {
  if (ast === null || ast === undefined) {
    return ast
  }

  /* istanbul ignore else - shouldn’t happen */
  if (ast.type === 'selectors') {
    ast.selectors.forEach(compileNthChecks)
  } else if (ast.type === 'ruleSet') {
    compileNthChecks(ast.rule)
  } else if (ast.type === 'rule') {
    if (ast.pseudos) {
      ast.pseudos.forEach(function(pseudo) {
        if (
          pseudo.name === 'nth-child' ||
          pseudo.name === 'nth-last-child' ||
          pseudo.name === 'nth-of-type' ||
          pseudo.name === 'nth-last-of-type'
        ) {
          pseudo.value = nthCheck(pseudo.value)
          pseudo.valueType = 'function'
        }
      })
    }

    if (ast.rule) {
      compileNthChecks(ast.rule)
    }
  } else {
    throw new Error('Undefined AST node: ' + ast.type)
  }

  return ast
}
