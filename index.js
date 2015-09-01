'use strict';


function select (ast, selector) {
  var result = [];

  (function walk (node) {
    if (node.type == selector[0]) {
      if (selector.length == 1) {
        result.push(node);
      }
      else if (node.children) {
        node.children.forEach(function (child) {
          [].push.apply(result, select(child, selector.slice(1)));
        });
      }
    }
    if (node.children) {
      node.children.forEach(walk);
    }
  }(ast));

  return result;
}


module.exports = function (ast, selector) {
  return select(ast, selector.split(/\s+/g));
};
