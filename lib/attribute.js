'use strict'

module.exports = match

var zwitch = require('zwitch')

var handle = zwitch('operator')
var handlers = handle.handlers

handle.unknown = unknownOperator
handle.invalid = exists
handlers['='] = exact
handlers['^='] = begins
handlers['$='] = ends
handlers['*='] = containsString
handlers['~='] = containsArray

function match(query, node) {
  var attrs = query.attrs
  var length = attrs.length
  var index = -1
  var attr

  while (++index < length) {
    attr = attrs[index]

    if (!handle(attr, node)) {
      return false
    }
  }

  return true
}

// [attr]
function exists(query, node) {
  return has(node, query.name)
}

// [attr=value]
function exact(query, node) {
  return has(node, query.name) && String(node[query.name]) === query.value
}

// [attr~=value]
function containsArray(query, node) {
  var value

  if (has(node, query.name)) {
    value = node[query.name]

    // If this is an array, and the query is contained in it, return true.
    if (
      typeof value === 'object' &&
      'length' in value &&
      value.indexOf(query.value) !== -1
    ) {
      return true
    }

    // For all other values, return whether this is an exact match.
    return String(value) === query.value
  }

  return false
}

// [attr^=value]
function begins(query, node) {
  var value = node[query.name]

  return (
    typeof value === 'string' &&
    value.slice(0, query.value.length) === query.value
  )
}

// [attr$=value]
function ends(query, node) {
  var value = node[query.name]

  return (
    typeof value === 'string' &&
    value.slice(-query.value.length) === query.value
  )
}

// [attr*=value]
function containsString(query, node) {
  var value = node[query.name]
  return typeof value === 'string' && value.indexOf(query.value) !== -1
}

/* istanbul ignore next - Shouldn’t be invoked, Parser throws an error instead. */
function unknownOperator(query) {
  throw new Error('Unknown operator `' + query.operator + '`')
}

function has(node, name) {
  return node[name] !== null && node[name] !== undefined
}
