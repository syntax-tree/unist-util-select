'use strict';

var TypeIndex = require('../lib/type-index');

var test = require('tape');


test('TypeIndex', function (t) {
  var typeIndex = TypeIndex();

  t.equal(typeIndex({ type: 'foo' }), 0);
  t.equal(typeIndex({ type: 'bar' }), 0);
  t.equal(typeIndex({ type: 'foo' }), 1);
  t.equal(typeIndex({ type: 'foo' }), 2);
  t.equal(typeIndex({ type: 'bar' }), 1);
  t.equal(typeIndex({ type: 'baz' }), 0);

  typeIndex = TypeIndex();
  t.equal(typeIndex({ type: 'foo' }), 0);

  t.end();
});
