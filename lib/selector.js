'use strict';

var Parser = require('css-selector-parser').CssSelectorParser;


module.exports = function parseSelector (selector) {
  var parser = new Parser;
  parser.registerNestingOperators('>', '+', '~');
  parser.registerAttrEqualityMods('^', '*', '$');
  parser.registerSelectorPseudos('not');
  return parser.parse(selector);
};
