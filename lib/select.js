'use strict';

var walkers = require('./ast-walkers'),
    matchNode = require('./match-node'),
    Collector = require('./collector');

var select = exports;


select.selectors = function (selectors, ast) {
  var collect = Collector();
  selectors.selectors.forEach(function (ruleSet) {
    collect(select.ruleSet(ruleSet, ast));
  });
  return collect.result;
};


select.ruleSet = function (ruleSet, ast) {
  return select.rule(ruleSet.rule, ast);
};


select.rule = function (rule, ast) {
  var collect = Collector();
  search(rule, ast, 0, null);
  return collect.result;

  function search (rule, node, nodeIndex, parent) {
    ({
      // `undefined` is the operator on the top rule selector.
      undefined: walkers.topScan,
      // `null` stands for the descendant combinator.
      null: walkers.descendant,
      '>': walkers.child,
      '+': walkers.adjacentSibling,
      '~': walkers.generalSibling
    })[rule.nestingOperator](
      node, nodeIndex, parent, match.bind(null, rule)
    );
  }

  function match (rule, node, nodeIndex, parent) {
    if (matchNode(rule, node, parent)) {
      if (rule.rule) {
        search(rule.rule, node, nodeIndex, parent);
      }
      else {
        collect(node);
      }
    }
  }
};
