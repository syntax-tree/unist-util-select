import {zwitch} from 'zwitch'

var handle = zwitch('operator', {
  unknown: unknownOperator,
  invalid: exists,
  handlers: {
    '=': exact,
    '^=': begins,
    '$=': ends,
    '*=': containsString,
    '~=': containsArray
  }
})

export function attribute(query, node) {
  var attrs = query.attrs
  var index = -1

  while (++index < attrs.length) {
    if (!handle(attrs[index], node)) return false
  }

  return true
}

// [attr]
function exists(query, node) {
  return node[query.name] !== null && node[query.name] !== undefined
}

// [attr=value]
function exact(query, node) {
  return exists(query, node) && String(node[query.name]) === query.value
}

// [attr~=value]
function containsArray(query, node) {
  var value = node[query.name]

  if (value === null || value === undefined) return false

  // If this is an array, and the query is contained in it, return true.
  if (
    typeof value === 'object' &&
    'length' in value &&
    value.includes(query.value)
  ) {
    return true
  }

  // For all other values, return whether this is an exact match.
  return String(value) === query.value
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
  return typeof value === 'string' && value.includes(query.value)
}

// Shouldn’t be invoked, Parser throws an error instead.
/* c8 ignore next 3 */
function unknownOperator(query) {
  throw new Error('Unknown operator `' + query.operator + '`')
}
