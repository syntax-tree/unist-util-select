'use strict'

module.exports = function walk(node, path) {
  return path.length === 0 ? node : walk(node.children[path[0]], path.slice(1))
}
