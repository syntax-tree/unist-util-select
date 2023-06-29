import assert from 'node:assert/strict'
import test from 'node:test'
import {u} from 'unist-builder'
import {select} from '../index.js'

test('select.select()', async (t) => {
  await t.test('invalid selectors', () => {
    assert.throws(
      () => {
        // @ts-expect-error runtime.
        select()
      },
      /Error: Expected `string` as selector, not `undefined`/,
      'should throw without selector'
    )

    assert.throws(
      () => {
        // @ts-expect-error runtime.
        select([], u('a'))
      },
      /Error: Expected `string` as selector, not ``/,
      'should throw w/ invalid selector (1)'
    )

    assert.throws(
      () => {
        select('@supports (transform-origin: 5% 5%) {}', u('a'))
      },
      /Expected rule but "@" found/,
      'should throw w/ invalid selector (2)'
    )

    assert.throws(
      () => {
        select('[foo%=bar]', u('a'))
      },
      /Expected a valid attribute selector operator/,
      'should throw on invalid attribute operators'
    )

    assert.throws(
      () => {
        select(':active', u('a'))
      },
      /Error: Unknown pseudo-selector `active`/,
      'should throw on invalid pseudo classes'
    )

    assert.throws(
      () => {
        select(':nth-foo(2n+1)', u('a'))
      },
      /Unknown pseudo-class/,
      'should throw on invalid pseudo class “functions”'
    )

    assert.throws(
      () => {
        select('::before', u('a'))
      },
      /Invalid selector: `::before`/,
      'should throw on invalid pseudo elements'
    )
  })

  await t.test('general', () => {
    assert.throws(
      () => {
        select('', u('a'))
      },
      /Expected rule but end of input reached/,
      'should throw for the empty string as selector'
    )

    assert.throws(
      () => {
        select(' ', u('a'))
      },
      /Expected rule but end of input reached/,
      'should throw for a white-space only selector'
    )

    assert.equal(select('*'), null, 'nothing if not given a node')

    assert.deepEqual(select('*', u('a')), u('a'), 'the node if given a node')
  })

  await t.test('descendant selector', () => {
    assert.deepEqual(
      select(
        'b',
        u('a', [
          u('b', {x: 1}),
          u('c', [u('b', {x: 2}), u('d', u('b', {x: 3}))])
        ])
      ),
      u('b', {x: 1}),
      'should return the first descendant node'
    )

    assert.deepEqual(
      select('a', u('a', {c: 1})),
      u('a', {c: 1}),
      'should return the given node if it matches'
    )

    assert.deepEqual(
      select(
        'b',
        u('a', [
          u('b', {x: 1}, [u('b', {x: 2}), u('b', {x: 3}, [u('b', {x: 4})])])
        ])
      ),
      u('b', {x: 1}, [u('b', {x: 2}), u('b', {x: 3}, [u('b', {x: 4})])]),
      'should return the first match'
    )

    assert.deepEqual(
      select('a c d', u('a', [u('b', [u('c', [u('d', [u('d')])])])])),
      u('d', [u('d')]),
      'should return deep matches'
    )
  })

  await t.test('child selector', () => {
    assert.deepEqual(
      select('c > e', u('a', [u('b'), u('c', [u('d'), u('e', [u('f')])])])),
      u('e', [u('f')]),
      'should return child nodes'
    )

    assert.deepEqual(
      select(
        'b > b',
        u('a', [
          u('b', {x: 1}, [u('b', {x: 2}), u('b', {x: 3}, [u('b', {x: 4})])])
        ])
      ),
      u('b', {x: 2}),
      'should return matches with nested matches'
    )

    assert.deepEqual(
      select('b > c > d', u('a', [u('b', [u('c', [u('d', [u('d')])])])])),
      u('d', [u('d')]),
      'should return deep matches'
    )
  })

  await t.test('adjacent sibling selector', () => {
    assert.deepEqual(
      select(
        'c + b',
        u('a', [
          u('b', 'Alpha'),
          u('c', 'Bravo'),
          u('b', 'Charlie'),
          u('b', 'Delta'),
          u('d', [u('e', 'Echo')])
        ])
      ),
      u('b', 'Charlie'),
      'should return adjacent sibling'
    )

    assert.equal(
      select(
        'c + b',
        u('a', [
          u('b', 'Alpha'),
          u('c', 'Bravo'),
          u('d', 'Charlie'),
          u('b', 'Delta')
        ])
      ),
      null,
      'should return nothing without matches'
    )
  })

  await t.test('general sibling selector', () => {
    assert.deepEqual(
      select(
        'c ~ b',
        u('a', [
          u('b', 'Alpha'),
          u('c', 'Bravo'),
          u('b', 'Charlie'),
          u('b', 'Delta'),
          u('d', [u('e', 'Echo')])
        ])
      ),
      u('b', 'Charlie'),
      'should return the first adjacent sibling'
    )

    assert.deepEqual(
      select(
        'c ~ b',
        u('a', [
          u('b', 'Alpha'),
          u('c', 'Bravo'),
          u('d', 'Charlie'),
          u('b', 'Delta')
        ])
      ),
      u('b', 'Delta'),
      'should return future siblings'
    )

    assert.equal(
      select(
        'c ~ b',
        u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('d', 'Charlie')])
      ),
      null,
      'should return nothing without matches'
    )
  })

  await t.test('parent-sensitive pseudo-selectors', async (t) => {
    await t.test(':first-child', () => {
      assert.deepEqual(
        select(
          ':first-child',
          u('a', [
            u('b', 'Alpha'),
            u('c', 'Bravo'),
            u('b', 'Charlie'),
            u('b', 'Delta'),
            u('d', [u('e', 'Echo')])
          ])
        ),
        u('b', 'Alpha'),
        'should return the first child'
      )

      assert.equal(
        select(
          'c:first-child',
          u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('d', 'Charlie')])
        ),
        null,
        'should return nothing if nothing matches'
      )
    })

    await t.test(':last-child', () => {
      assert.deepEqual(
        select(
          ':last-child',
          u('a', [
            u('b', 'Alpha'),
            u('c', 'Bravo'),
            u('b', 'Charlie'),
            u('b', 'Delta'),
            u('d', [u('e', 'Echo')])
          ])
        ),
        u('d', [u('e', 'Echo')]),
        'should return the last child'
      )

      assert.equal(
        select(
          'c:last-child',
          u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('d', 'Charlie')])
        ),
        null,
        'should return nothing if nothing matches'
      )
    })

    await t.test(':only-child', () => {
      assert.deepEqual(
        select(
          ':only-child',
          u('a', [
            u('b', 'Alpha'),
            u('c', 'Bravo'),
            u('b', 'Charlie'),
            u('b', 'Delta'),
            u('d', [u('b', 'Echo')])
          ])
        ),
        u('b', 'Echo'),
        'should return an only child'
      )

      assert.equal(
        select(
          'c:only-child',
          u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('d', 'Charlie')])
        ),
        null,
        'should return nothing if nothing matches'
      )
    })

    await t.test(':nth-child', () => {
      assert.deepEqual(
        select(
          'b:nth-child(odd)',
          u('a', [
            u('b', 'Alpha'),
            u('b', 'Bravo'),
            u('b', 'Charlie'),
            u('b', 'Delta'),
            u('b', 'Echo'),
            u('b', 'Foxtrot')
          ])
        ),
        u('b', 'Alpha'),
        'should return the match for `:nth-child(odd)`'
      )

      assert.deepEqual(
        select(
          'b:nth-child(2n+1)',
          u('a', [
            u('b', 'Alpha'),
            u('b', 'Bravo'),
            u('b', 'Charlie'),
            u('b', 'Delta'),
            u('b', 'Echo'),
            u('b', 'Foxtrot')
          ])
        ),
        u('b', 'Alpha'),
        'should return the match for `:nth-child(2n+1)`'
      )

      assert.deepEqual(
        select(
          'b:nth-child(even)',
          u('a', [
            u('b', 'Alpha'),
            u('b', 'Bravo'),
            u('b', 'Charlie'),
            u('b', 'Delta'),
            u('b', 'Echo'),
            u('b', 'Foxtrot')
          ])
        ),
        u('b', 'Bravo'),
        'should return the match for `:nth-child(even)`'
      )

      assert.deepEqual(
        select(
          'b:nth-child(2n+0)',
          u('a', [
            u('b', 'Alpha'),
            u('b', 'Bravo'),
            u('b', 'Charlie'),
            u('b', 'Delta'),
            u('b', 'Echo'),
            u('b', 'Foxtrot')
          ])
        ),
        u('b', 'Bravo'),
        'should return the match for `:nth-child(2n+0)`'
      )
    })

    await t.test(':nth-last-child', () => {
      assert.deepEqual(
        select(
          'b:nth-last-child(odd)',
          u('a', [
            u('b', 'Alpha'),
            u('b', 'Bravo'),
            u('b', 'Charlie'),
            u('b', 'Delta'),
            u('b', 'Echo'),
            u('b', 'Foxtrot')
          ])
        ),
        u('b', 'Bravo'),
        'should return the last match for `:nth-last-child(odd)`'
      )

      assert.deepEqual(
        select(
          'b:nth-last-child(2n+1)',
          u('a', [
            u('b', 'Alpha'),
            u('b', 'Bravo'),
            u('b', 'Charlie'),
            u('b', 'Delta'),
            u('b', 'Echo'),
            u('b', 'Foxtrot')
          ])
        ),
        u('b', 'Bravo'),
        'should return the last match for `:nth-last-child(2n+1)`'
      )

      assert.deepEqual(
        select(
          'b:nth-last-child(even)',
          u('a', [
            u('b', 'Alpha'),
            u('b', 'Bravo'),
            u('b', 'Charlie'),
            u('b', 'Delta'),
            u('b', 'Echo'),
            u('b', 'Foxtrot')
          ])
        ),
        u('b', 'Alpha'),
        'should return the last match for `:nth-last-child(even)`'
      )

      assert.deepEqual(
        select(
          'b:nth-last-child(2n+0)',
          u('a', [
            u('b', 'Alpha'),
            u('b', 'Bravo'),
            u('b', 'Charlie'),
            u('b', 'Delta'),
            u('b', 'Echo'),
            u('b', 'Foxtrot')
          ])
        ),
        u('b', 'Alpha'),
        'should return the last match for `:nth-last-child(2n+0)`'
      )
    })

    await t.test(':nth-of-type', () => {
      assert.deepEqual(
        select(
          'b:nth-of-type(odd)',
          u('a', [
            u('b', 'Alpha'),
            u('c', 'Bravo'),
            u('b', 'Charlie'),
            u('c', 'Delta'),
            u('b', 'Echo'),
            u('c', 'Foxtrot')
          ])
        ),
        u('b', 'Alpha'),
        'should return the first match for `:nth-of-type(odd)`'
      )

      assert.deepEqual(
        select(
          'b:nth-of-type(2n+1)',
          u('a', [
            u('b', 'Alpha'),
            u('c', 'Bravo'),
            u('b', 'Charlie'),
            u('c', 'Delta'),
            u('b', 'Echo'),
            u('c', 'Foxtrot')
          ])
        ),
        u('b', 'Alpha'),
        'should return the first match for `:nth-of-type(2n+1)`'
      )

      assert.deepEqual(
        select(
          'b:nth-of-type(even)',
          u('a', [
            u('b', 'Alpha'),
            u('c', 'Bravo'),
            u('b', 'Charlie'),
            u('c', 'Delta'),
            u('b', 'Echo'),
            u('c', 'Foxtrot')
          ])
        ),
        u('b', 'Charlie'),
        'should return the first match for `:nth-of-type(even)`'
      )

      assert.deepEqual(
        select(
          'b:nth-of-type(2n+0)',
          u('a', [
            u('b', 'Alpha'),
            u('c', 'Bravo'),
            u('b', 'Charlie'),
            u('c', 'Delta'),
            u('b', 'Echo'),
            u('c', 'Foxtrot')
          ])
        ),
        u('b', 'Charlie'),
        'should return the first match for `:nth-of-type(2n+0)`'
      )
    })

    await t.test(':nth-last-of-type', () => {
      assert.deepEqual(
        select(
          'b:nth-last-of-type(odd)',
          u('a', [
            u('b', 'Alpha'),
            u('c', 'Bravo'),
            u('b', 'Charlie'),
            u('c', 'Delta'),
            u('b', 'Echo'),
            u('c', 'Foxtrot')
          ])
        ),
        u('b', 'Alpha'),
        'should return the last match for `:nth-last-of-type(odd)`s'
      )

      assert.deepEqual(
        select(
          'b:nth-last-of-type(2n+1)',
          u('a', [
            u('b', 'Alpha'),
            u('c', 'Bravo'),
            u('b', 'Charlie'),
            u('c', 'Delta'),
            u('b', 'Echo'),
            u('c', 'Foxtrot')
          ])
        ),
        u('b', 'Alpha'),
        'should return the last match for `:nth-last-of-type(2n+1)`'
      )

      assert.deepEqual(
        select(
          'b:nth-last-of-type(even)',
          u('a', [
            u('b', 'Alpha'),
            u('c', 'Bravo'),
            u('b', 'Charlie'),
            u('c', 'Delta'),
            u('b', 'Echo'),
            u('c', 'Foxtrot')
          ])
        ),
        u('b', 'Charlie'),
        'should return the last match for `:nth-last-of-type(even)`'
      )

      assert.deepEqual(
        select(
          'b:nth-last-of-type(2n+0)',
          u('a', [
            u('b', 'Alpha'),
            u('c', 'Bravo'),
            u('b', 'Charlie'),
            u('c', 'Delta'),
            u('b', 'Echo'),
            u('c', 'Foxtrot')
          ])
        ),
        u('b', 'Charlie'),
        'should return the last match for `:nth-last-of-type(2n+0)`'
      )
    })

    await t.test(':first-of-type', () => {
      assert.deepEqual(
        select(
          'b:first-of-type',
          u('a', [
            u('b', 'Alpha'),
            u('c', 'Bravo'),
            u('b', 'Charlie'),
            u('c', 'Delta'),
            u('b', 'Echo'),
            u('c', 'Foxtrot')
          ])
        ),
        u('b', 'Alpha'),
        'should return the first match for `:first-of-type`'
      )

      assert.equal(
        select('b:first-of-type', u('a', [])),
        null,
        'should return nothing without matches'
      )
    })

    await t.test(':last-of-type', () => {
      assert.deepEqual(
        select(
          'b:last-of-type',
          u('a', [
            u('b', 'Alpha'),
            u('c', 'Bravo'),
            u('b', 'Charlie'),
            u('c', 'Delta'),
            u('b', 'Echo'),
            u('c', 'Foxtrot')
          ])
        ),
        u('b', 'Echo'),
        'should return the last match for `:last-of-type`s'
      )

      assert.equal(
        select('b:last-of-type', u('a', [])),
        null,
        'should return nothing without matches'
      )
    })

    await t.test(':only-of-type', () => {
      assert.deepEqual(
        select(
          'c:only-of-type',
          u('a', [
            u('b', 'Alpha'),
            u('b', 'Bravo'),
            u('c', 'Charlie'),
            u('b', 'Delta')
          ])
        ),
        u('c', 'Charlie'),
        'should return the only match'
      )

      assert.equal(
        select(
          'b:only-of-type',
          u('a', [
            u('b', 'Alpha'),
            u('c', 'Bravo'),
            u('b', 'Charlie'),
            u('c', 'Delta'),
            u('b', 'Echo'),
            u('c', 'Foxtrot')
          ])
        ),
        null,
        'should return nothing with too many matches'
      )

      assert.equal(
        select('b:only-of-type', u('a', [])),
        null,
        'should return nothing without matches'
      )
    })

    await t.test(':root', () => {
      assert.deepEqual(
        select(':root', u('a', [u('b'), u('c', [u('d')])])),
        u('a', [u('b'), u('c', [u('d')])]),
        'should return the given node'
      )
    })

    await t.test(':scope', () => {
      assert.deepEqual(
        select(':scope', u('a', [u('b'), u('c', [u('d')])])),
        u('a', [u('b'), u('c', [u('d')])]),
        'should return the given node'
      )
    })

    await t.test(':has', () => {
      assert.deepEqual(
        select('c:has(:first-child)', u('a', [u('b'), u('c', [u('d')])])),
        u('c', [u('d')]),
        'should select a node'
      )
    })
  })

  await t.test(':is', () => {
    assert.deepEqual(
      select('y:is(:first-child)', u('x', [u('y', 'a'), u('y', 'b')])),
      u('y', 'a'),
      'should support parent-sensitive `:is`'
    )
  })

  await t.test(':not', () => {
    assert.deepEqual(
      select('y:not(:first-child)', u('x', [u('y', 'a'), u('y', 'b')])),
      u('y', 'b'),
      'should support parent-sensitive `:not`'
    )
  })
})
