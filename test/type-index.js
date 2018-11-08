'use strict'

var test = require('tape')
var TypeIndex = require('../lib/type-index')

test('TypeIndex', function(t) {
  var typeIndex = new TypeIndex()

  t.equal(typeIndex.count({type: 'foo'}), 0)
  t.equal(typeIndex({type: 'foo'}), 0)
  t.equal(typeIndex.count({type: 'foo'}), 1)
  t.equal(typeIndex({type: 'bar'}), 0)
  t.equal(typeIndex({type: 'foo'}), 1)
  t.equal(typeIndex({type: 'foo'}), 2)
  t.equal(typeIndex({type: 'bar'}), 1)
  t.equal(typeIndex({type: 'baz'}), 0)
  t.equal(typeIndex.count({type: 'foo'}), 3)

  typeIndex = new TypeIndex()
  t.equal(typeIndex.count({type: 'foo'}), 0)
  t.equal(typeIndex({type: 'foo'}), 0)
  t.equal(typeIndex.count({type: 'foo'}), 1)

  t.end()
})
