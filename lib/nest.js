'use strict'

module.exports = match

var zwitch = require('zwitch')

var own = {}.hasOwnProperty
var slice = [].slice

var handle = zwitch('nestingOperator')
var handlers = handle.handlers

handle.unknown = unknownNesting
handle.invalid = topScan // `undefined` is the top query selector.
handlers.null = descendant // `null` is the descendant combinator.
handlers['>'] = child
handlers['+'] = adjacentSibling
handlers['~'] = generalSibling

function match(query, node, index, parent, state) {
  return handle(query, node, index, parent, state)
}

/* istanbul ignore next - Shouldn’t be invoked, parser gives correct data. */
function unknownNesting(query) {
  throw new Error('Unexpected nesting `' + query.nestingOperator + '`')
}

function topScan(query, node, index, parent, state) {
  /* istanbul ignore if - Shouldn’t happen. */
  if (parent) {
    throw new Error('topScan is supposed to be called from the root node')
  }

  state.iterator.apply(null, arguments)

  if (!state.shallow) {
    descendant.apply(this, arguments)
  }
}

function descendant(query, node, index, parent, state) {
  var prev = state.iterator

  state.iterator = iterator

  child.apply(this, arguments)

  function iterator() {
    state.iterator = prev
    prev.apply(this, arguments)
    state.iterator = iterator

    if (state.one && state.found) {
      return
    }

    child.apply(this, [query].concat(slice.call(arguments, 1)))
  }
}

function child(query, node, index, parent, state) {
  if (!node.children || node.children.length === 0) {
    return
  }

  walkIterator(query, node, state)
    .each()
    .done()
}

function adjacentSibling(query, node, index, parent, state) {
  /* istanbul ignore if - Shouldn’t happen. */
  if (!parent) {
    return
  }

  walkIterator(query, parent, state)
    .prefillTypeIndex(0, ++index)
    .each(index, ++index)
    .prefillTypeIndex(index)
    .done()
}

function generalSibling(query, node, index, parent, state) {
  /* istanbul ignore if - Shouldn’t happen. */
  if (!parent) {
    return
  }

  walkIterator(query, parent, state)
    .prefillTypeIndex(0, ++index)
    .each(index)
    .done()
}

// Handles typeIndex and typeCount properties for every walker.
function walkIterator(query, parent, state) {
  var nodes = parent.children
  var typeIndex = state.index ? createTypeIndex() : null
  var delayed = []

  return {
    prefillTypeIndex: rangeDefaults(prefillTypeIndex),
    each: rangeDefaults(each),
    done: done
  }

  function done() {
    var length = delayed.length
    var index = -1

    while (++index < length) {
      delayed[index]()

      if (state.one && state.found) {
        break
      }
    }

    return this
  }

  function prefillTypeIndex(start, end) {
    if (typeIndex) {
      while (start < end) {
        typeIndex(nodes[start])
        start++
      }
    }

    return this
  }

  function each(start, end) {
    var child = nodes[start]
    var index
    var nodeIndex

    if (start >= end) {
      return this
    }

    if (typeIndex) {
      nodeIndex = typeIndex.nodes
      index = typeIndex(child)
      delayed.push(delay)
    } else {
      pushNode()
    }

    // Stop if we’re looking for one node and it’s already found.
    if (state.one && state.found) {
      return this
    }

    return each.call(this, start + 1, end)

    function delay() {
      state.typeIndex = index
      state.nodeIndex = nodeIndex
      state.typeCount = typeIndex.count(child)
      state.nodeCount = typeIndex.nodes
      pushNode()
    }

    function pushNode() {
      state.iterator(query, child, start, parent, state)
    }
  }

  function rangeDefaults(iterator) {
    return rangeDefault

    function rangeDefault(start, end) {
      if (start === null || start === undefined || start < 0) {
        start = 0
      }

      if (end === null || end === undefined || end > nodes.length) {
        end = nodes.length
      }

      return iterator.call(this, start, end)
    }
  }
}

function createTypeIndex() {
  var counts = {}

  index.count = count
  index.nodes = 0

  return index

  function index(node) {
    var type = node.type

    index.nodes++

    if (!own.call(counts, type)) {
      counts[type] = 0
    }

    // Note: ++ is intended to be postfixed!
    return counts[type]++
  }

  function count(node) {
    return counts[node.type]
  }
}
