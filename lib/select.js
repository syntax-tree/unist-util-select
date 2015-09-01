'use strict';


var select = exports;


select.ruleSet = function (selector, ast) {
  return select.rule(selector.rule, ast);
};


select.rule = function (selector, ast) {
  var result = [];

  (function walk (node) {
    if (node.type == selector.tagName) {
      if (!selector.rule) {
        return result.push(node);
      }
      if (!node.children) {
        return;
      }

      node.children.forEach(function (childNode) {
        [].push.apply(result, select.rule(selector.rule, childNode));
      });
    }

    if (!selector.nestingOperator && node.children) {
      node.children.forEach(walk);
    }
  }(ast));

  return result;
};
