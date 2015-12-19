'use strict';

var parseSelector = require('./lib/selector')(),
    select = require('./lib/select');

var debug = require('debug')('unist-util-select');


module.exports = function (ast, selector) {
  debug('Selector: %j', selector);
  selector = parseSelector(selector);
  debug('AST: %s',
        JSON.stringify(selector, null, 2).replace(/(^|\n)/g, '\n    '));
  return selector ? select[selector.type](selector, ast) : [];
};
