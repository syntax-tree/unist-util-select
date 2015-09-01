'use strict';

var select = require('..'),
    ast = require('./ast');

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
    ast.children[2].children[0].children[1],
    ast.children[3].children[1],
    ast.children[4].children[1].children[1].children[1]
      .children[0].children[0].children[1]
  ]);
  t.deepEqual(select(ast, 'paragraph > emphasis'), [
    ast.children[2].children[0].children[1],
    ast.children[3].children[1]
  ]);
  t.deepEqual(select(ast, 'paragraph emphasis > text'), [
    ast.children[2].children[0].children[1].children[0],
    ast.children[3].children[1].children[0],
    ast.children[4].children[1].children[1].children[1]
      .children[0].children[0].children[1].children[0]
  ]);
  t.deepEqual(select(ast, 'paragraph > emphasis text'), [
    ast.children[2].children[0].children[1].children[0],
    ast.children[3].children[1].children[0],
    ast.children[3].children[1].children[1].children[0]
  ]);
  t.end();
});
