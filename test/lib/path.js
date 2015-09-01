'use strict';


module.exports = function walk (node, path) {
  return path.length
    ? walk(node.children[path[0]], path.slice(1))
    : node;
};
