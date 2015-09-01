'use strict';

var select = require('..'),
    ast = require('./ast');

var test = require('tape');


test('type selector', function (t) {
  t.equal(select(ast, 'root').length, 1);
  t.equal(select(ast, 'root')[0], ast);
  t.equal(select(ast, 'text').length, 39);
  t.equal(select(ast, 'text')[1], ast.children[1].children[0]);
  t.equal(select(ast, 'tableRow').length, 2);
  t.end();
});
