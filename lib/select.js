'use strict';


var select = exports;


select.ruleSet = function (selector, ast) {
  return select.rule(selector.rule, ast);
};


select.rule = function (selector, ast) {
  var result = [];

  switch (selector.nestingOperator) {
    case null:
    case undefined:
    case '>':
      walk(ast);
      break;

    case '+':
      if (ast.children && ast.children.length) {
        walk(ast.children[0], ast);
      }
      break;

    case '~':
      (ast.children || []).forEach(function (node) {
        walk(node, ast);
      });
      break;

    default:
      throw Error('Unexpected nesting operator: ' + selector.nestingOperator);
  }

  return result;

  function walk (node, parent) {
    if (node.type == selector.tagName) {
      if (!selector.rule) {
        append(result, [node]);
      }
      else if (!selector.rule.nestingOperator ||
               selector.rule.nestingOperator == '>') {
        if (!node.children) return;
        node.children.forEach(function (childNode) {
          append(result, select.rule(selector.rule, childNode));
        });
      }
      else {
        if (!parent) return;
        append(result, select.rule(selector.rule, {
          children: parent.children.slice(parent.children.indexOf(node) + 1)
        }));
      }
    }

    if (!selector.nestingOperator && node.children) {
      node.children.forEach(function (child) {
        walk(child, node);
      });
    }
  }
};


function append (array, elements) {
  elements.forEach(function (el) {
    if (array.indexOf(el) < 0) {
      array.push(el);
    }
  });
}
