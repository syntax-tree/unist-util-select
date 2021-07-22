import test from 'tape'
import {u} from 'unist-builder'
import {selectAll} from '../index.js'

test('all together now', (t) => {
  t.deepEqual(
    selectAll(
      'a > b[d]:nth-of-type(odd)',
      u('root', [
        u('a', [
          u('b', {d: 1}, 'Alpha'),
          u('c', 'Bravo'),
          u('b', 'Charlie'),
          u('c', 'Delta'),
          u('b', 'Echo'),
          u('c', 'Foxtrot')
        ])
      ])
    ),
    [u('b', {d: 1}, 'Alpha')]
  )

  t.deepEqual(
    selectAll(
      '[d] ~ c:nth-of-type(even)',
      u('root', [
        u('a', [
          u('b', 'Alpha'),
          u('c', 'Bravo'),
          u('b', {d: 1}, 'Charlie'),
          u('c', 'Delta'),
          u('b', 'Echo'),
          u('c', 'Foxtrot'),
          u('b', 'Golf'),
          u('c', 'Hotel')
        ])
      ])
    ),
    [u('c', 'Delta'), u('c', 'Hotel')]
  )

  t.deepEqual(
    selectAll(
      '[d] + c:nth-of-type(even)',
      u('root', [
        u('a', [
          u('b', 'Alpha'),
          u('c', 'Bravo'),
          u('b', {d: 1}, 'Charlie'),
          u('c', 'Delta'),
          u('b', 'Echo'),
          u('c', 'Foxtrot'),
          u('b', 'Golf'),
          u('c', 'Hotel')
        ])
      ])
    ),
    [u('c', 'Delta')]
  )

  t.deepEqual(
    selectAll(
      '[d], :nth-of-type(even), [e]',
      u('root', [
        u('a', [
          u('b', {e: 3}, 'Alpha'),
          u('c', 'Bravo'),
          u('b', {d: 1}, 'Charlie'),
          u('c', 'Delta'),
          u('b', 'Echo'),
          u('c', {d: 2, e: 4}, 'Foxtrot'),
          u('b', 'Golf'),
          u('c', 'Hotel')
        ])
      ])
    ),
    [
      u('b', {d: 1}, 'Charlie'),
      u('c', {d: 2, e: 4}, 'Foxtrot'),
      u('c', 'Delta'),
      u('b', 'Golf'),
      u('c', 'Hotel'),
      u('b', {e: 3}, 'Alpha')
    ]
  )

  t.end()
})
