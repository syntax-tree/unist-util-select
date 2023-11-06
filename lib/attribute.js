/**
 * @typedef {import('css-selector-parser').AstAttribute} AstAttribute
 * @typedef {import('css-selector-parser').AstRule} AstRule
 * @typedef {import('./types.js').Node} Node
 */

import {ok as assert} from 'devlop'
import {indexable} from './util.js'

/**
 * @param {AstAttribute} query
 *   Query.
 * @param {Node} node
 *   Node.
 * @returns {boolean}
 *   Whether `node` matches `query`.
 */

export function attribute(query, node) {
  indexable(node)
  const value = node[query.name]

  // Exists.
  if (!query.value) {
    return value !== null && value !== undefined
  }

  assert(query.value.type === 'String', 'expected plain string')
  let key = query.value.value
  let normal = value === null || value === undefined ? undefined : String(value)

  // Case-sensitivity.
  if (query.caseSensitivityModifier === 'i') {
    key = key.toLowerCase()

    if (normal) {
      normal = normal.toLowerCase()
    }
  }

  if (value !== undefined) {
    switch (query.operator) {
      // Exact.
      case '=': {
        return typeof normal === 'string' && key === normal
      }

      // Ends.
      case '$=': {
        return typeof value === 'string' && value.slice(-key.length) === key
      }

      // Contains.
      case '*=': {
        return typeof value === 'string' && value.includes(key)
      }

      // Begins.
      case '^=': {
        return typeof value === 'string' && key === value.slice(0, key.length)
      }

      // Space-separated list.
      case '~=': {
        // type-coverage:ignore-next-line -- some bug with TS.
        return (Array.isArray(value) && value.includes(key)) || normal === key
      }
      // Other values are not yet supported by CSS.
      // No default
    }
  }

  return false
}
