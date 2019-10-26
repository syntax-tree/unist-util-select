// TypeScript Version: 3.5

import {Node} from 'unist'

declare function matches(selector: string, tree: Node): boolean

declare function select(selector: string, tree: Node): Node

declare function selectAll(selector: string, tree: Node): Node[]

export {matches, select, selectAll}
