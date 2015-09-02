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
      throw Error('Undefined nesting operator: ' + selector.nestingOperator);
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
    switch (attr.operator) {
      case undefined:
        return attr.name in node;

      case '=':
        // First, check for special values.
        switch (attr.value) {
          case 'null':
            if (attr.name in node && node[attr.name] == null) return true;
            break;

          case 'true':
            if (node[attr.name] === true) return true;
            break;

          case 'false':
            if (node[attr.name] === false) return true;
            break;
        }
        return node[attr.name] == attr.value;

      case '^=':
        return typeof node[attr.name] == 'string' &&
          node[attr.name].slice(0, attr.value.length) == attr.value;

      case '*=':
        return typeof node[attr.name] == 'string' &&
          node[attr.name].indexOf(attr.value) >= 0;

      case '$=':
        return typeof node[attr.name] == 'string' &&
          node[attr.name].slice(-attr.value.length) == attr.value;

      default:
        throw Error('Undefined attribute operator: ' + attr.operator);
    }
  });
}


function append (array, elements) {
  elements.forEach(function (el) {
    if (array.indexOf(el) < 0) {
      array.push(el);
    }
  });
}
