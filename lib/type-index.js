'use strict';


module.exports = function TypeIndex () {
  var typeLists = Object.create(null);

  return function (node) {
    var type = node.type;

    if (!typeLists[type]) {
      typeLists[type] = [];
    }

    return typeLists[type].push(node) - 1;
  };
};
