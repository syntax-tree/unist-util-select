/**
 * @typedef {import('./types.js').Rule} Rule
 * @typedef {import('./types.js').RuleAttr} RuleAttr
 * @typedef {import('./types.js').Node} Node
 */

import {zwitch} from 'zwitch'

const handle = zwitch('operator', {
  // @ts-expect-error: hush.
  unknown: unknownOperator,
  // @ts-expect-error: hush.
  invalid: exists,
  handlers: {
    // @ts-expect-error: hush.
    '=': exact,
    // @ts-expect-error: hush.
    '^=': begins,
    // @ts-expect-error: hush.
    '$=': ends,
    // @ts-expect-error: hush.
    '*=': containsString,
    // @ts-expect-error: hush.
    '~=': containsArray
  }
})

/**
 * @param {Rule} query
 * @param {Node} node
 */
export function attribute(query, node) {
  let index = -1

  while (++index < query.attrs.length) {
    if (!handle(query.attrs[index], node)) return false
  }

  return true
}

/**
 * `[attr]`
 *
 * @param {RuleAttr} query
 * @param {Node} node
 */
function exists(query, node) {
  // @ts-expect-error: Looks like a record.
  return node[query.name] !== null && node[query.name] !== undefined
}

/**
 * `[attr=value]`
 *
 * @param {RuleAttr} query
 * @param {Node} node
 */
function exact(query, node) {
  // @ts-expect-error: Looks like a record.
  return exists(query, node) && String(node[query.name]) === query.value
}

/**
 * `[attr~=value]`
 *
 * @param {RuleAttr} query
 * @param {Node} node
 */
function containsArray(query, node) {
  /** @type {unknown} */
  // @ts-expect-error: Looks like a record.
  const value = node[query.name]

  if (value === null || value === undefined) return false

  // If this is an array, and the query is contained in it, return true.
  // Coverage comment in place because TS turns `Array.isArray(unknown)`
  // into `Array.<any>` instead of `Array.<unknown>`.
  // type-coverage:ignore-next-line
  if (Array.isArray(value) && value.includes(query.value)) {
    return true
  }

  // For all other values, return whether this is an exact match.
  return String(value) === query.value
}

/**
 * `[attr^=value]`
 *
 * @param {RuleAttr} query
 * @param {Node} node
 */
function begins(query, node) {
  /** @type {unknown} */
  // @ts-expect-error: Looks like a record.
  const value = node[query.name]

  return (
    query.value &&
    typeof value === 'string' &&
    value.slice(0, query.value.length) === query.value
  )
}

/**
 * `[attr$=value]`
 *
 * @param {RuleAttr} query
 * @param {Node} node
 */
function ends(query, node) {
  /** @type {unknown} */
  // @ts-expect-error: Looks like a record.
  const value = node[query.name]

  return (
    query.value &&
    typeof value === 'string' &&
    value.slice(-query.value.length) === query.value
  )
}

/**
 * `[attr*=value]`
 *
 * @param {RuleAttr} query
 * @param {Node} node
 */
function containsString(query, node) {
  /** @type {unknown} */
  // @ts-expect-error: Looks like a record.
  const value = node[query.name]
  return query.value && typeof value === 'string' && value.includes(query.value)
}

// Shouldn’t be invoked, Parser throws an error instead.
/* c8 ignore next 6 */
/**
 * @param {{[x: string]: unknown, type: string}} query
 */
function unknownOperator(query) {
  throw new Error('Unknown operator `' + query.operator + '`')
}
