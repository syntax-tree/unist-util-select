'use strict';

var select = require('..'),
    ast = require('./lib/ast')();

var test = require('tape');


test('curried forms', function (t) {
  t.deepEqual(select(ast)('paragraph'), select(ast, 'paragraph'));
  t.equal(select.one(ast)('table'), select.one(ast, 'table'));
  t.end();
});
