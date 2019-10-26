import {matches, select, selectAll} from 'unist-util-select'

matches() // $ExpectError
matches('*') // $ExpectError
matches('*', {type: 'root'}) // $ExpectType boolean

select() // $ExpectError
select('*') // $ExpectError
select('*', {type: 'root'}) // $ExpectType Node

selectAll() // $ExpectError
selectAll('*') // $ExpectError
selectAll('*', {type: 'root'}) // $ExpectType Node[]
