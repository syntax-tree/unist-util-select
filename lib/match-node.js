'use strict'

/* eslint-disable max-params */

module.exports = matchNode

// Match node against a simple selector.
function matchNode(rule, node, nodeIndex, parent, props) {
  return (
    matchType(rule, node) &&
    matchAttrs(rule, node) &&
    matchPseudos(rule, node, nodeIndex, parent, props)
  )
}

function matchType(rule, node) {
  return !rule.tagName || rule.tagName === '*' || rule.tagName === node.type
}

function matchAttrs(rule, node) {
  return !rule.attrs || rule.attrs.every(match)

  function match(attr) {
    if (attr.operator === undefined) {
      return attr.name in node
    }

    if (attr.operator === '=') {
      return String(node[attr.name]) === attr.value
    }

    if (attr.operator === '^=') {
      return (
        typeof node[attr.name] === 'string' &&
        node[attr.name].slice(0, attr.value.length) === attr.value
      )
    }

    if (attr.operator === '*=') {
      return (
        typeof node[attr.name] === 'string' &&
        node[attr.name].indexOf(attr.value) >= 0
      )
    }

    /* istanbul ignore else - shouldn’t happen */
    if (attr.operator === '$=') {
      return (
        typeof node[attr.name] === 'string' &&
        node[attr.name].slice(-attr.value.length) === attr.value
      )
    }

    /* istanbul ignore next */
    throw new Error('Undefined attribute operator: ' + attr.operator)
  }
}

function matchPseudos(rule, node, nodeIndex, parent, props) {
  return !rule.pseudos || rule.pseudos.every(match)

  /* eslint-disable complexity */
  function match(pseudo) {
    if (pseudo.name === 'root') {
      return parent === null
    }

    if (pseudo.name === 'nth-child') {
      return parent && pseudo.value(nodeIndex)
    }

    if (pseudo.name === 'nth-last-child') {
      return parent && pseudo.value(parent.children.length - 1 - nodeIndex)
    }

    if (pseudo.name === 'nth-of-type') {
      return parent && pseudo.value(props.typeIndex)
    }

    if (pseudo.name === 'nth-last-of-type') {
      return parent && pseudo.value(props.typeCount - 1 - props.typeIndex)
    }

    if (pseudo.name === 'first-child') {
      return parent && nodeIndex === 0
    }

    if (pseudo.name === 'last-child') {
      return parent && nodeIndex === parent.children.length - 1
    }

    if (pseudo.name === 'first-of-type') {
      return parent && props.typeIndex === 0
    }

    if (pseudo.name === 'last-of-type') {
      return parent && props.typeIndex === props.typeCount - 1
    }

    if (pseudo.name === 'only-child') {
      return parent && parent.children.length === 1
    }

    if (pseudo.name === 'only-of-type') {
      return parent && props.typeCount === 1
    }

    if (pseudo.name === 'empty') {
      return node.children && !node.children.length
    }

    /* istanbul ignore else - shouldn’t happen */
    if (pseudo.name === 'not') {
      return !matchNode(pseudo.value.rule, node, nodeIndex, parent, props)
    }

    /* istanbul ignore next */
    throw new Error('Undefined pseudo-class: ' + pseudo.name)
  }
}
