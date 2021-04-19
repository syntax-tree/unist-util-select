export function name(query, node) {
  return query.tagName === '*' || query.tagName === node.type
}
