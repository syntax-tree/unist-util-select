'use strict'

var test = require('tape')
var ast = require('./lib/ast')()
var select = require('..')

var one = select.one

test('select.one', function(t) {
  t.equal(one(ast, 'root'), ast)
  t.equal(one(ast, 'blockquote'), select(ast, 'blockquote')[0])
  t.equal(one(ast, 'table'), select(ast, 'table')[0])
  t.throws(one.bind(null, ast, 'math'), 'throws when node is not found')
  t.throws(one.bind(null, ast, 'text'), 'throws when node is not unique')
  t.end()
})
