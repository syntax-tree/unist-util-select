import {name} from './name.js'
import {attribute} from './attribute.js'
import {pseudo} from './pseudo.js'

export function test(query, node, index, parent, state) {
  if (query.id) {
    throw new Error('Invalid selector: id')
  }

  if (query.classNames) {
    throw new Error('Invalid selector: class')
  }

  return Boolean(
    node &&
      (!query.tagName || name(query, node)) &&
      (!query.attrs || attribute(query, node)) &&
      (!query.pseudos || pseudo(query, node, index, parent, state))
  )
}
