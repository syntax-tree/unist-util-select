/**
 * @typedef {import('css-selector-parser').AstAttribute} AstAttribute
 * @typedef {import('css-selector-parser').AstRule} AstRule
 * @typedef {import('./types.js').Node} Node
 */

import {unreachable} from 'devlop'
import {zwitch} from 'zwitch'
import {indexable} from './util.js'

/** @type {(query: AstAttribute, node: Node) => boolean} */
const handle = zwitch('operator', {
  unknown: unknownOperator,
  // @ts-expect-error: hush.
  invalid: exists,
  handlers: {
    '=': exact,
    '^=': begins,
    '$=': ends,
    '*=': containsString,
    '~=': containsArray
  }
})

/**
 * @param {AstRule} query
 * @param {Node} node
 * @returns {boolean}
 */
export function attribute(query, node) {
  let index = -1

  if (query.attributes) {
    while (++index < query.attributes.length) {
      if (!handle(query.attributes[index], node)) return false
    }
  }

  return true
}

/**
 * Check whether an attribute exists.
 *
 * `[attr]`
 *
 * @param {AstAttribute} query
 * @param {Node} node
 * @returns {boolean}
 */
function exists(query, node) {
  indexable(node)
  return node[query.name] !== null && node[query.name] !== undefined
}

/**
 * Check whether an attribute has an exact value.
 *
 * `[attr=value]`
 *
 * @param {AstAttribute} query
 * @param {Node} node
 * @returns {boolean}
 */
function exact(query, node) {
  const queryValue = attributeValue(query)
  indexable(node)
  return exists(query, node) && String(node[query.name]) === queryValue
}

/**
 * Check whether an attribute, as a list, contains a value.
 *
 * When the attribute value is not a list, checks that the serialized value
 * is the queried one.
 *
 * `[attr~=value]`
 *
 * @param {AstAttribute} query
 * @param {Node} node
 * @returns {boolean}
 */
function containsArray(query, node) {
  indexable(node)
  const value = node[query.name]

  if (value === null || value === undefined) return false

  const queryValue = attributeValue(query)

  // If this is an array, and the query is contained in it, return `true`.
  // Coverage comment in place because TS turns `Array.isArray(unknown)`
  // into `Array<any>` instead of `Array<unknown>`.
  // type-coverage:ignore-next-line
  if (Array.isArray(value) && value.includes(queryValue)) {
    return true
  }

  // For all other values, return whether this is an exact match.
  return String(value) === queryValue
}

/**
 * Check whether an attribute has a substring as its start.
 *
 * `[attr^=value]`
 *
 * @param {AstAttribute} query
 * @param {Node} node
 * @returns {boolean}
 */
function begins(query, node) {
  indexable(node)
  const value = node[query.name]
  const queryValue = attributeValue(query)

  return Boolean(
    query.value &&
      typeof value === 'string' &&
      value.slice(0, queryValue.length) === queryValue
  )
}

/**
 * Check whether an attribute has a substring as its end.
 *
 * `[attr$=value]`
 *
 * @param {AstAttribute} query
 * @param {Node} node
 * @returns {boolean}
 */
function ends(query, node) {
  indexable(node)
  const value = node[query.name]
  const queryValue = attributeValue(query)

  return Boolean(
    query.value &&
      typeof value === 'string' &&
      value.slice(-queryValue.length) === queryValue
  )
}

/**
 * Check whether an attribute contains a substring.
 *
 * `[attr*=value]`
 *
 * @param {AstAttribute} query
 * @param {Node} node
 * @returns {boolean}
 */
function containsString(query, node) {
  indexable(node)
  const value = node[query.name]
  const queryValue = attributeValue(query)

  return Boolean(
    typeof value === 'string' && queryValue && value.includes(queryValue)
  )
}

// Shouldn’t be called, parser throws an error instead.
/**
 * @param {unknown} query
 * @returns {never}
 */
/* c8 ignore next 4 */
function unknownOperator(query) {
  // @ts-expect-error: `operator` guaranteed.
  throw new Error('Unknown operator `' + query.operator + '`')
}

/**
 * @param {AstAttribute} query
 * @returns {string}
 */
function attributeValue(query) {
  const queryValue = query.value

  /* c8 ignore next 4 -- never happens with our config */
  if (!queryValue) unreachable('Attribute values should be defined')
  if (queryValue.type === 'Substitution') {
    unreachable('Substitutions are not enabled')
  }

  return queryValue.value
}
