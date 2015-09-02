'use strict';

var select = exports;


select.selectors = function (selector, ast) {
  var result = [];
  selector.selectors.forEach(function (selector) {
    append(result, select.ruleSet(selector, ast));
  });
  return result;
};


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
    if (matches(selector, node)) {
      if (!selector.rule) {
        append(result, [node]);
      }
      else if (!selector.rule.nestingOperator ||
               selector.rule.nestingOperator == '>') {
        if (node.children) {
          node.children.forEach(function (childNode) {
            append(result, select.rule(selector.rule, childNode));
          });
        }
      }
      else {
        if (parent) {
          append(result, select.rule(selector.rule, {
            children: parent.children.slice(parent.children.indexOf(node) + 1)
          }));
        }
      }
    }

    if (!selector.nestingOperator && node.children) {
      node.children.forEach(function (child) {
        walk(child, node);
      });
    }
  }
};


// True if node matches head of selector rule.
function matches (rule, node) {
  // Match type.
  if (rule.tagName && rule.tagName != '*' && node.type != rule.tagName) {
    return false;
  }

  // Match attributes.
  return (rule.attrs || []).every(function (attr) {
    return attr.name in node;
  });
}


function append (array, elements) {
  elements.forEach(function (el) {
    if (array.indexOf(el) < 0) {
      array.push(el);
    }
  });
}
