'use strict';

var select = require('..'),
    ast = require('./ast'),
    path = require('./lib/path');

var test = require('tape');


test('edge cases', function (t) {
  t.deepEqual(select(ast, ''), []);
  t.deepEqual(select(ast, '\t '), []);
  t.end();
});


test('type selector', function (t) {
  t.equal(select(ast, 'root').length, 1);
  t.equal(select(ast, 'root')[0], ast);
  t.equal(select(ast, 'text').length, 39);
  t.equal(select(ast, 'text')[1], ast.children[1].children[0]);
  t.equal(select(ast, 'tableRow').length, 2);
  t.equal(select(ast, 'heading').length, 5);
  t.end();
});


test('nesting', function (t) {
  t.deepEqual(select(ast, 'root heading'), select(ast, 'heading'));
  t.deepEqual(select(ast, 'paragraph emphasis'), [
    path(ast, [2, 0, 1]),
    path(ast, [3, 1]),
    path(ast, [4, 1, 1, 1, 0, 0, 1])
  ]);
  t.deepEqual(select(ast, 'paragraph > emphasis'), [
    path(ast, [2, 0, 1]),
    path(ast, [3, 1])
  ]);
  t.deepEqual(select(ast, 'paragraph emphasis > text'), [
    path(ast, [2, 0, 1, 0]),
    path(ast, [3, 1, 0]),
    path(ast, [4, 1, 1, 1, 0, 0, 1, 0])
  ]);
  t.deepEqual(select(ast, 'paragraph > emphasis text'), [
    path(ast, [2, 0, 1, 0]),
    path(ast, [3, 1, 0]),
    path(ast, [3, 1, 1, 0])
  ]);
  t.end();
});
