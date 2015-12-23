'use strict';

var Collector = require('../lib/collector');

var test = require('tape');


test('Collector', function (t) {
  var collect = Collector();
  collect('foo');
  collect(['foo', 'bar', 'baz', 'bar']);
  collect('foo');
  t.deepEqual(collect.result, ['foo', 'bar', 'baz']);
  t.end();
});
