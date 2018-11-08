'use strict'

var test = require('tape')
var Collector = require('../lib/collector')

test('Collector', function(t) {
  var collect = new Collector()
  collect('foo')
  collect(['foo', 'bar', 'baz', 'bar'])
  collect('foo')
  t.deepEqual(collect.result, ['foo', 'bar', 'baz'])
  t.end()
})
