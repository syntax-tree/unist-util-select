'use strict';

module.exports = matchNode;


// Match node against a simple selector.
function matchNode (rule, node, parent) {
  return matchType(rule, node) &&
    matchAttrs(rule, node) &&
    matchPseudos(rule, node, parent);
}


function matchType (rule, node) {
  return !rule.tagName || rule.tagName == '*' || rule.tagName == node.type;
}


function matchAttrs (rule, node) {
  return !rule.attrs || rule.attrs.every(function (attr) {
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


function matchPseudos (rule, node, parent) {
  return !rule.pseudos || rule.pseudos.every(function (pseudo) {
    switch (pseudo.name) {
      case 'root':
        return parent == null;

      case 'not':
        return !matchNode(pseudo.value.rule, node, parent);

      default:
        throw Error('Undefined pseudo-class: ' + pseudo.name);
    }
  });
}
