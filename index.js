import {any} from './lib/any.js'
import {parse} from './lib/parse.js'

export function matches(selector, node) {
  return Boolean(any(parse(selector), node, {one: true, shallow: true, any})[0])
}

export function select(selector, node) {
  return any(parse(selector), node, {one: true, any})[0] || null
}

export function selectAll(selector, node) {
  return any(parse(selector), node, {any})
}
