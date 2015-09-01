'use strict';

var parseSelector = require('./lib/selector')(),
    select = require('./lib/select');


module.exports = function (ast, selector) {
  selector = parseSelector(selector);
  return selector ? select[selector.type](selector, ast) : [];
};
