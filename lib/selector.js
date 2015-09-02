'use strict';

var Parser = require('css-selector-parser').CssSelectorParser;


module.exports = function SelectorParser () {
  var parser = new Parser;
  parser.registerNestingOperators('>', '+', '~');
  return parser.parse.bind(parser);
};
