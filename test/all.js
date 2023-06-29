import assert from 'node:assert/strict'
import test from 'node:test'
import {u} from 'unist-builder'
import {selectAll} from '../index.js'

test('all together now', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('../index.js')).sort(), [
      'matches',
      'select',
      'selectAll'
    ])
  })

  await t.test('#1', async function () {
    assert.deepEqual(
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
  })

  await t.test('#2', async function () {
    assert.deepEqual(
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
  })

  await t.test('#3', async function () {
    assert.deepEqual(
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
  })

  await t.test('#4', async function () {
    assert.deepEqual(
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
        u('b', {e: 3}, 'Alpha'),
        u('b', {d: 1}, 'Charlie'),
        u('c', 'Delta'),
        u('c', {d: 2, e: 4}, 'Foxtrot'),
        u('b', 'Golf'),
        u('c', 'Hotel')
      ]
    )
  })

  await t.test('#5', async function () {
    assert.deepEqual(
      selectAll(
        'a:not([b])',
        u('root', [
          u('a', {id: 'w', b: 'a'}),
          u('a', {id: 'x'}),
          u('a', {id: 'y', b: 'a'}),
          u('a', {id: 'z'})
        ])
      ),
      [u('a', {id: 'x'}), u('a', {id: 'z'})]
    )
  })
})
