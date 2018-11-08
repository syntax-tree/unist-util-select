'use strict'

var debug = require('debug')('unist-util-select')
var parseSelector = require('./lib/selector')
var matchSelector = require('./lib/select')

module.exports = select

select.one = selectOne

function select(ast, selector) {
  if (arguments.length === 1) {
    return select.bind(this, ast)
  }

  debug('Selector: %j', selector)
  selector = parseSelector(selector)
  debug(
    'AST: %s',
    JSON.stringify(selector, null, 2).replace(/(^|\n)/g, '\n    ')
  )
  return selector ? matchSelector[selector.type](selector, ast) : []
}

function selectOne(ast, selector) {
  if (arguments.length === 1) {
    return selectOne.bind(this, ast)
  }

  var nodes = select(ast, selector)

  if (nodes.length === 0) {
    throw new Error('Node not found by ' + JSON.stringify(selector))
  }

  if (nodes.length > 1) {
    throw new Error(
      'Node matched by ' + JSON.stringify(selector) + ' is not unique'
    )
  }

  return nodes[0]
}
