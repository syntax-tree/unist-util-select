/**
 * @typedef {import('./types.js').Rule} Rule
 * @typedef {import('./types.js').Node} Node
 * @typedef {import('./types.js').Parent} Parent
 * @typedef {import('./types.js').SelectState} SelectState
 * @typedef {import('./types.js').SelectIterator} SelectIterator
 */

import {zwitch} from 'zwitch'
import {parent} from './util.js'

const own = {}.hasOwnProperty

/** @type {(query: Rule, node: Node, index: number | undefined, parent: Parent | undefined, state: SelectState) => void} */
const handle = zwitch('nestingOperator', {
  unknown: unknownNesting,
  // @ts-expect-error: hush.
  invalid: topScan, // `undefined` is the top query selector.
  handlers: {
    null: descendant, // `null` is the descendant combinator.
    '>': child,
    '+': adjacentSibling,
    '~': generalSibling
  }
})

/**
 * @param {Rule} query
 * @param {Node} node
 * @param {number | undefined} index
 * @param {Parent | undefined} parent
 * @param {SelectState} state
 */
export function nest(query, node, index, parent, state) {
  handle(query, node, index, parent, state)
}

// Shouldn’t be called, parser gives correct data.
/**
 * @param {unknown} query
 * @returns {never}
 */
/* c8 ignore next 4 */
function unknownNesting(query) {
  // @ts-expect-error: `nestingOperator` guaranteed.
  throw new Error('Unexpected nesting `' + query.nestingOperator + '`')
}

/**
 * @param {Rule} query
 * @param {Node} node
 * @param {number | undefined} index
 * @param {Parent | undefined} parent
 * @param {SelectState} state
 */
function topScan(query, node, index, parent, state) {
  // Shouldn’t happen.
  /* c8 ignore next 7 */
  if (parent) {
    throw new Error('topScan is supposed to be called from the root node')
  }

  if (!state.iterator) {
    throw new Error('Expected `iterator` to be defined')
  }

  // Shouldn’t happen.
  /* c8 ignore next 3 */
  if (typeof index !== 'number') {
    throw new TypeError('Expected `index` to be defined')
  }

  state.iterator(query, node, index, parent, state)
  if (!state.shallow) descendant(query, node, index, parent, state)
}

/**
 * @param {Rule} query
 * @param {Node} node
 * @param {number | undefined} index
 * @param {Parent | undefined} parent
 * @param {SelectState} state
 */
function descendant(query, node, index, parent, state) {
  // Shouldn’t happen.
  /* c8 ignore next 3 */
  if (!state.iterator) {
    throw new Error('Expected `iterator` to be defined')
  }

  const previous = state.iterator

  state.iterator = iterator
  child(query, node, index, parent, state)

  /** @type {SelectIterator} */
  function iterator(query, node, index, parent, state) {
    state.iterator = previous
    previous(query, node, index, parent, state)
    state.iterator = iterator

    if (state.one && state.found) return

    child(query, node, index, parent, state)
  }
}

/**
 * @param {Rule} query
 * @param {Node} node
 * @param {number | undefined} _1
 * @param {Parent | undefined} _2
 * @param {SelectState} state
 */
function child(query, node, _1, _2, state) {
  if (!parent(node)) return
  if (node.children.length === 0) return

  new WalkIterator(query, node, state).each(undefined, undefined).done()
}

/**
 * @param {Rule} query
 * @param {Node} _
 * @param {number | undefined} index
 * @param {Parent | undefined} parent
 * @param {SelectState} state
 */
function adjacentSibling(query, _, index, parent, state) {
  // Shouldn’t happen.
  /* c8 ignore next 3 */
  if (typeof index !== 'number') {
    throw new TypeError('Expected `index` to be defined')
  }

  // Shouldn’t happen.
  /* c8 ignore next */
  if (!parent) return

  new WalkIterator(query, parent, state)
    .prefillTypeIndex(0, ++index)
    .each(index, ++index)
    .prefillTypeIndex(index, undefined)
    .done()
}

/**
 * @param {Rule} query
 * @param {Node} _
 * @param {number | undefined} index
 * @param {Parent | undefined} parent
 * @param {SelectState} state
 */
function generalSibling(query, _, index, parent, state) {
  // Shouldn’t happen.
  /* c8 ignore next 3 */
  if (typeof index !== 'number') {
    throw new TypeError('Expected `index` to be defined')
  }

  // Shouldn’t happen.
  /* c8 ignore next */
  if (!parent) return

  new WalkIterator(query, parent, state)
    .prefillTypeIndex(0, ++index)
    .each(index, undefined)
    .done()
}

class WalkIterator {
  /**
   * Handles typeIndex and typeCount properties for every walker.
   *
   * @param {Rule} query
   * @param {Parent} parent
   * @param {SelectState} state
   */
  constructor(query, parent, state) {
    /** @type {Rule} */
    this.query = query
    /** @type {Parent} */
    this.parent = parent
    /** @type {SelectState} */
    this.state = state
    /** @type {TypeIndex | undefined} */
    this.typeIndex = state.index ? new TypeIndex() : undefined
    /** @type {Array<Function>} */
    this.delayed = []
  }

  /**
   * @param {number | undefined} x
   * @param {number | undefined} y
   * @returns {this}
   */
  prefillTypeIndex(x, y) {
    let [start, end] = this.defaults(x, y)

    if (this.typeIndex) {
      while (start < end) {
        this.typeIndex.index(this.parent.children[start])
        start++
      }
    }

    return this
  }

  /**
   * @param {number | undefined} x
   * @param {number | undefined} y
   * @returns {this}
   */
  each(x, y) {
    const [start, end] = this.defaults(x, y)
    const child = this.parent.children[start]
    /** @type {number} */
    let index
    /** @type {number} */
    let nodeIndex

    if (start >= end) return this

    if (this.typeIndex) {
      nodeIndex = this.typeIndex.nodes
      index = this.typeIndex.index(child)
      this.delayed.push(delay)
    } else {
      // Shouldn’t happen.
      /* c8 ignore next 3 */
      if (!this.state.iterator) {
        throw new Error('Expected `iterator` to be defined')
      }

      this.state.iterator(this.query, child, start, this.parent, this.state)
    }

    // Stop if we’re looking for one node and it’s already found.
    if (this.state.one && this.state.found) return this

    return this.each(start + 1, end)

    /**
     * @this {WalkIterator}
     */
    function delay() {
      // Shouldn’t happen.
      /* c8 ignore next 3 */
      if (!this.typeIndex) {
        throw new TypeError('Expected `typeIndex` to be defined')
      }

      // Shouldn’t happen.
      /* c8 ignore next 3 */
      if (!this.state.iterator) {
        throw new Error('Expected `iterator` to be defined')
      }

      this.state.typeIndex = index
      this.state.nodeIndex = nodeIndex
      this.state.typeCount = this.typeIndex.count(child)
      this.state.nodeCount = this.typeIndex.nodes
      this.state.iterator(this.query, child, start, this.parent, this.state)
    }
  }

  /**
   * Done!
   * @returns {this}
   */
  done() {
    let index = -1

    while (++index < this.delayed.length) {
      this.delayed[index].call(this)
      if (this.state.one && this.state.found) break
    }

    return this
  }

  /**
   * @param {number | undefined} start
   * @param {number | undefined} end
   * @returns {[number, number]}
   */
  defaults(start, end) {
    if (start === undefined || start < 0) start = 0
    if (end === undefined || end > this.parent.children.length)
      end = this.parent.children.length
    return [start, end]
  }
}

class TypeIndex {
  constructor() {
    /** @type {Record<string, number>} */
    this.counts = {}
    /** @type {number} */
    this.nodes = 0
  }

  /**
   * @param {Node} node
   * @returns {number}
   */
  index(node) {
    const type = node.type

    this.nodes++

    if (!own.call(this.counts, type)) this.counts[type] = 0

    // Note: `++` is intended to be postfixed!
    return this.counts[type]++
  }

  /**
   * @param {Node} node
   * @returns {number | undefined}
   */
  count(node) {
    return this.counts[node.type]
  }
}
