'use strict';


module.exports = function (ast, selector) {
  var result = [];

  (function walk (node) {
    if (node.type == selector) {
      result.push(node);
    }
    if (node.children) {
      node.children.forEach(walk);
    }
  }(ast));

  return result;
};
