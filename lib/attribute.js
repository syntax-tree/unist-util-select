/**
 * @typedef {import('./types.js').Rule} Rule
 * @typedef {import('./types.js').RuleAttr} RuleAttr
 * @typedef {import('./types.js').Node} Node
 */

import {zwitch} from 'zwitch'

/** @type {(query: RuleAttr, node: Node) => boolean} */
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
 * @param {Rule} query
 * @param {Node} node
 * @returns {boolean}
 */
export function attribute(query, node) {
  let index = -1

  while (++index < query.attrs.length) {
    if (!handle(query.attrs[index], node)) return false
  }

  return true
}

/**
 * Check whether an attribute exists.
 *
 * `[attr]`
 *
 * @param {RuleAttr} query
 * @param {Node} node
 * @returns {boolean}
 */
function exists(query, node) {
  // @ts-expect-error: Looks like a record.
  return node[query.name] !== null && node[query.name] !== undefined
}

/**
 * Check whether an attribute has an exact value.
 *
 * `[attr=value]`
 *
 * @param {RuleAttr} query
 * @param {Node} node
 * @returns {boolean}
 */
function exact(query, node) {
  // @ts-expect-error: Looks like a record.
  return exists(query, node) && String(node[query.name]) === query.value
}

/**
 * Check whether an attribute, as a list, contains a value.
 *
 * When the attribute value is not a list, checks that the serialized value
 * is the queried one.
 *
 * `[attr~=value]`
 *
 * @param {RuleAttr} query
 * @param {Node} node
 * @returns {boolean}
 */
function containsArray(query, node) {
  /** @type {unknown} */
  // @ts-expect-error: Looks like a record.
  const value = node[query.name]

  if (value === null || value === undefined) return false

  // If this is an array, and the query is contained in it, return true.
  // Coverage comment in place because TS turns `Array.isArray(unknown)`
  // into `Array<any>` instead of `Array<unknown>`.
  // type-coverage:ignore-next-line
  if (Array.isArray(value) && value.includes(query.value)) {
    return true
  }

  // For all other values, return whether this is an exact match.
  return String(value) === query.value
}

/**
 * Check whether an attribute has a substring as its start.
 *
 * `[attr^=value]`
 *
 * @param {RuleAttr} query
 * @param {Node} node
 * @returns {boolean}
 */
function begins(query, node) {
  /** @type {unknown} */
  // @ts-expect-error: Looks like a record.
  const value = node[query.name]

  return Boolean(
    query.value &&
      typeof value === 'string' &&
      value.slice(0, query.value.length) === query.value
  )
}

/**
 * Check whether an attribute has a substring as its end.
 *
 * `[attr$=value]`
 *
 * @param {RuleAttr} query
 * @param {Node} node
 * @returns {boolean}
 */
function ends(query, node) {
  /** @type {unknown} */
  // @ts-expect-error: Looks like a record.
  const value = node[query.name]

  return Boolean(
    query.value &&
      typeof value === 'string' &&
      value.slice(-query.value.length) === query.value
  )
}

/**
 * Check whether an attribute contains a substring.
 *
 * `[attr*=value]`
 *
 * @param {RuleAttr} query
 * @param {Node} node
 * @returns {boolean}
 */
function containsString(query, node) {
  /** @type {unknown} */
  // @ts-expect-error: Looks like a record.
  const value = node[query.name]
  return Boolean(
    query.value && typeof value === 'string' && value.includes(query.value)
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
