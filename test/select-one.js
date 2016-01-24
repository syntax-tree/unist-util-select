'use strict';

var select = require('..'),
    select1 = select.one,
    ast = require('./lib/ast')(),
    path = require('./lib/path');

var test = require('tape');


test('select.one', function (t) {
  t.equal(select1(ast, 'root'), ast);
  t.equal(select1(ast, 'blockquote'), select(ast, 'blockquote')[0]);
  t.equal(select1(ast, 'table'), select(ast, 'table')[0]);
  t.throws(select1.bind(null, ast, 'math'), 'throws when node is not found');
  t.throws(select1.bind(null, ast, 'text'), 'throws when node is not unique');
  t.end();
});
