'use strict';

var TypeIndex = require('./type-index');

var walkers = exports;


walkers.topScan = function (node, nodeIndex, parent, iterator, opts) {
  if (parent) {
    // We would like to avoid spinning an extra loop through the starting
    // node's siblings just to count its typeIndex.
    throw Error('topScan is supposed to be called from the root node');
  }

  iterator(node, nodeIndex, parent);
  walkers.descendant.apply(this, arguments);
};


walkers.descendant = function (node, nodeIndex, parent, iterator, opts) {
  if (!node.children || !node.children.length) {
    return;
  }

  if ((opts = opts || {}).typeIndex) {
    var typeIndex = TypeIndex();
  }

  node.children.forEach(function (child, childIndex) {
    iterator(child, childIndex, node,
             opts.typeIndex ? { typeIndex: typeIndex(child) } : undefined);
    walkers.descendant(child, childIndex, node, iterator, opts);
  });
};


walkers.child = function (node, nodeIndex, parent, iterator, opts) {
  if (!node.children || !node.children.length) {
    return;
  }

  if ((opts = opts || {}).typeIndex) {
    var typeIndex = TypeIndex();
  }

  node.children.forEach(function (child, childIndex) {
    iterator(child, childIndex, node,
             opts.typeIndex ? { typeIndex: typeIndex(child) } : undefined);
  });
};


walkers.adjacentSibling = function (node, nodeIndex, parent, iterator, opts) {
  if (!parent) {
    return;
  }

  if ((opts = opts || {}).typeIndex) {
    var typeIndex = TypeIndex();

    // Prefill type indexes with preceding nodes.
    for (var prevIndex = 0; prevIndex <= nodeIndex; ++prevIndex) {
      typeIndex(parent.children[prevIndex]);
    }
  }

  if (++nodeIndex < parent.children.length) {
    node = parent.children[nodeIndex];
    iterator(node, nodeIndex, parent,
             opts.typeIndex ? { typeIndex: typeIndex(node) } : undefined);
  }
};


walkers.generalSibling = function (node, nodeIndex, parent, iterator, opts) {
  if (!parent) {
    return;
  }

  if ((opts = opts || {}).typeIndex) {
    var typeIndex = TypeIndex();

    // Prefill type indexes with preceding nodes.
    for (var prevIndex = 0; prevIndex <= nodeIndex; ++prevIndex) {
      typeIndex(parent.children[prevIndex]);
    }
  }

  while (++nodeIndex < parent.children.length) {
    node = parent.children[nodeIndex];
    iterator(node, nodeIndex, parent,
             opts.typeIndex ? { typeIndex: typeIndex(node) } : undefined);
  }
};
