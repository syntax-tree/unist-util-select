'use strict'

var test = require('tape')
var ast = require('./lib/ast')()
var select = require('..')

test('curried forms', function(t) {
  t.deepEqual(select(ast)('paragraph'), select(ast, 'paragraph'))
  t.equal(select.one(ast)('table'), select.one(ast, 'table'))
  t.end()
})
