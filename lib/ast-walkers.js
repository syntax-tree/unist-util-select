'use strict';

var walkers = exports;


walkers.topScan = function (node, nodeIndex, parent, iterator) {
  iterator(node, nodeIndex, parent);
  walkers.descendant.apply(this, arguments);
};


walkers.descendant = function (node, nodeIndex, parent, iterator) {
  if (node.children) {
    node.children.forEach(function (child, childIndex) {
      iterator(child, childIndex, node);
      walkers.descendant(child, childIndex, node, iterator);
    });
  }
};


walkers.child = function (node, nodeIndex, parent, iterator) {
  if (node.children) {
    node.children.forEach(function (child, childIndex) {
      iterator(child, childIndex, node);
    });
  }
};


walkers.adjacentSibling = function (node, nodeIndex, parent, iterator) {
  if (parent && ++nodeIndex < parent.children.length) {
    iterator(parent.children[nodeIndex], nodeIndex, parent);
  }
};


walkers.generalSibling = function (node, nodeIndex, parent, iterator) {
  if (parent) {
    while (++nodeIndex < parent.children.length) {
      iterator(parent.children[nodeIndex], nodeIndex, parent);
    }
  }
};
