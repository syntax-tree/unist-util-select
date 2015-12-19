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

  t.deepEqual(select(ast, 'list'), [
    path(ast, [4]),
    path(ast, [4, 1, 1]),
    path(ast, [4, 1, 1, 0, 1]),
    path(ast, [6])
  ]);

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


test('siblings', function (t) {
  t.deepEqual(select(ast, 'root ~ heading'), []);
  t.deepEqual(select(ast, 'heading ~ heading'), [
    path(ast, [1]),
    path(ast, [7]),
    path(ast, [12]),
    path(ast, [16])
  ]);
  t.deepEqual(select(ast, 'heading + heading'), [
    path(ast, [1])
  ]);
  t.end();
});


test('grouping', function (t) {
  t.deepEqual(select(ast, 'list, heading + heading'), [
    path(ast, [4]),
    path(ast, [4, 1, 1]),
    path(ast, [4, 1, 1, 0, 1]),
    path(ast, [6]),
    path(ast, [1])
  ]);
  t.end();
});


test('universal selector', function (t) {
  t.equal(select(ast, '*').length, totalNodes(ast));
  t.deepEqual(select(ast, '* ~ heading'), select(ast, 'heading ~ heading'));
  t.true(select(ast, 'list > *').every(function (listItem) {
    return listItem.type == 'listItem';
  }));
  t.end();

  function totalNodes (ast) {
    return 1 + (ast.children || []).map(totalNodes).reduce(function (a, b) {
      return a + b;
    }, 0);
  }
});


test('attribute selectors', function (t) {
  t.comment('existence');
  t.deepEqual(select(ast, '[depth]'), select(ast, 'heading'));
  t.deepEqual(select(ast, '[start][ordered]'), select(ast, 'list'));

  t.comment('equality');
  t.deepEqual(select(ast, 'heading[depth=1], [depth=3]'), [
    path(ast, [0]),
    path(ast, [7])
  ]);
  t.deepEqual(select(ast, 'paragraph [type="text"]'),
              select(ast, 'paragraph text'));
  t.deepEqual(select(ast, '[start=null]'), select(ast, 'list').slice(0, 3));
  t.deepEqual(select(ast, '[ordered=true]'), [ast.children[6]]);
  t.deepEqual(select(ast, 'list[loose=false]'), select(ast, 'list'));

  t.comment('string operators');
  t.deepEqual(select(ast, '[link^="http://"]'), select(ast, 'definition'));
  t.deepEqual(select(ast, '[value*=reduce]'),
              select(ast, 'root > code[lang=js]'));
  t.deepEqual(select(ast, '[type$=Cell]'), select(ast, 'tableCell'));

  t.end();
});


test('negation pseudo-class', function (t) {
  t.deepEqual(select(ast, 'list:not([nonexistent])'), select(ast, 'list'));
  t.deepEqual(select(ast, 'list:not([start=null])'),
              select(ast, 'list[start=1]'));
  t.deepEqual(select(ast, 'heading text:not([value*=" "])')
              .map(function (node) { return node.value }),
              ['Vitae', 'References', 'License']);
  t.deepEqual(select(ast, [
    'list:not([ordered=true])',
    '*:not(listItem):not(paragraph)[children]:not(list)'
  ].join(' ')), [
    path(ast, [4, 1, 1, 1, 0, 0]),
    path(ast, [4, 1, 1, 1, 0, 0, 1])
  ]);
  t.end();
});
