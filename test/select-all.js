import assert from 'node:assert/strict'
import test from 'node:test'
import {u} from 'unist-builder'
import {selectAll} from '../index.js'

test('select.selectAll()', async (t) => {
  await t.test('invalid selectors', () => {
    assert.throws(
      () => {
        // @ts-expect-error runtime.
        selectAll()
      },
      /Error: Expected `string` as selector, not `undefined`/,
      'should throw without selector'
    )

    assert.throws(
      () => {
        // @ts-expect-error runtime.
        selectAll([], u('a'))
      },
      /Error: Expected `string` as selector, not ``/,
      'should throw w/ invalid selector (1)'
    )

    assert.throws(
      () => {
        selectAll('@supports (transform-origin: 5% 5%) {}', u('a'))
      },
      /Error: Rule expected but "@" found./,
      'should throw w/ invalid selector (2)'
    )

    assert.throws(
      () => {
        selectAll('[foo%=bar]', u('a'))
      },
      /Error: Expected "=" but "%" found./,
      'should throw on invalid attribute operators'
    )

    assert.throws(
      () => {
        selectAll(':active', u('a'))
      },
      /Error: Unknown pseudo-selector `active`/,
      'should throw on invalid pseudo classes'
    )

    assert.throws(
      () => {
        selectAll(':nth-foo(2n+1)', u('a'))
      },
      /Error: Unknown pseudo-selector `nth-foo`/,
      'should throw on invalid pseudo class “functions”'
    )

    assert.throws(
      () => {
        selectAll('::before', u('a'))
      },
      /Error: Unexpected pseudo-element or empty pseudo-class/,
      'should throw on invalid pseudo elements'
    )
  })

  await t.test('general', () => {
    assert.deepEqual(
      selectAll('', u('a')),
      [],
      'nothing for the empty string as selector'
    )
    assert.deepEqual(
      selectAll(' ', u('a')),
      [],
      'nothing for a white-space only selector'
    )
    assert.deepEqual(selectAll('*'), [], 'nothing if not given a node')
    assert.deepEqual(
      selectAll('*', u('a')),
      [u('a')],
      'the node if given a node'
    )
  })

  await t.test('descendant selector', () => {
    assert.deepEqual(
      selectAll(
        'b',
        u('a', [
          u('b', 'Alpha'),
          u('c', [u('b', 'Bravo'), u('d', u('b', 'Charlie'))])
        ])
      ),
      [u('b', 'Alpha'), u('b', 'Bravo'), u('b', 'Charlie')],
      'should return descendant nodes'
    )

    assert.deepEqual(
      selectAll('a', u('a', 'Alpha')),
      [u('a', 'Alpha')],
      'should return the given node if it matches'
    )

    assert.deepEqual(
      selectAll(
        'b',
        u('a', [
          u('b', {x: 1}, [u('b', {x: 2}), u('b', {x: 3}, [u('b', {x: 4})])])
        ])
      ),
      [
        u('b', {x: 1}, [u('b', {x: 2}), u('b', {x: 3}, [u('b', {x: 4})])]),
        u('b', {x: 2}),
        u('b', {x: 3}, [u('b', {x: 4})]),
        u('b', {x: 4})
      ],
      'should return matches with nested matches'
    )

    assert.deepEqual(
      selectAll('b c d', u('a', [u('b', [u('c', [u('d', [u('d')])])])])),
      [u('d', [u('d')]), u('d')],
      'should return deep matches'
    )

    assert.deepEqual(
      selectAll('b c', u('a', [u('b', [u('c', '1')]), u('d', [u('c', '2')])])),
      [u('c', '1')],
      'should not match outside other matches'
    )
  })

  await t.test('child selector', () => {
    assert.deepEqual(
      selectAll(
        'c > d',
        u('a', [
          u('b', {x: 1}),
          u('c', [u('b', {x: 2}), u('d', [u('b', {x: 3})])])
        ])
      ),
      [u('d', [u('b', {x: 3})])],
      'should return child nodes'
    )

    assert.deepEqual(
      selectAll(
        'b > b',
        u('a', [
          u('b', {x: 1}, [u('b', {x: 2}), u('b', {x: 3}, [u('b', {x: 4})])])
        ])
      ),
      [u('b', {x: 2}), u('b', {x: 3}, [u('b', {x: 4})]), u('b', {x: 4})],
      'should return matches with nested matches'
    )

    assert.deepEqual(
      selectAll('b > c > d', u('a', [u('b', [u('c', [u('d', [u('d')])])])])),
      [u('d', [u('d')])],
      'should return deep matches'
    )
  })

  await t.test('adjacent sibling selector', () => {
    assert.deepEqual(
      selectAll(
        'c + b',
        u('a', [
          u('b', 'Alpha'),
          u('c', 'Bravo'),
          u('b', 'Charlie'),
          u('b', 'Delta'),
          u('d', [u('b', 'Echo')])
        ])
      ),
      [u('b', 'Charlie')],
      'should return adjacent sibling'
    )

    assert.deepEqual(
      selectAll(
        'c + b',
        u('a', [
          u('b', 'Alpha'),
          u('c', 'Bravo'),
          u('d', 'Charlie'),
          u('b', 'Delta')
        ])
      ),
      [],
      'should return nothing without matches'
    )
  })

  await t.test('general sibling selector', () => {
    assert.deepEqual(
      selectAll(
        'c ~ b',
        u('a', [
          u('b', 'Alpha'),
          u('c', 'Bravo'),
          u('b', 'Charlie'),
          u('b', 'Delta'),
          u('d', [u('b', 'Echo')])
        ])
      ),
      [u('b', 'Charlie'), u('b', 'Delta')],
      'should return adjacent sibling'
    )

    assert.deepEqual(
      selectAll(
        'c ~ b',
        u('a', [
          u('b', 'Alpha'),
          u('c', 'Bravo'),
          u('d', 'Charlie'),
          u('b', 'Delta')
        ])
      ),
      [u('b', 'Delta')],
      'should return future siblings'
    )

    assert.deepEqual(
      selectAll(
        'c ~ b',
        u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('d', 'Charlie')])
      ),
      [],
      'should return nothing without matches'
    )
  })

  await t.test('parent-sensitive pseudo-selectors', async (t) => {
    await t.test(':first-child', () => {
      assert.deepEqual(
        selectAll(
          ':first-child',
          u('a', [
            u('b', 'Alpha'),
            u('c', 'Bravo'),
            u('b', 'Charlie'),
            u('b', 'Delta'),
            u('d', [u('b', 'Echo')])
          ])
        ),
        [u('b', 'Alpha'), u('b', 'Echo')],
        'should return all `:first-child`s (1)'
      )

      assert.deepEqual(
        selectAll(
          'b:first-child',
          u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('b', 'Charlie')])
        ),
        [u('b', 'Alpha')],
        'should return all `:first-child`s (2)'
      )

      assert.deepEqual(
        selectAll(
          'h1:first-child',
          u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('b', 'Charlie')])
        ),
        [],
        'should return nothing if nothing matches'
      )
    })

    await t.test(':last-child', () => {
      assert.deepEqual(
        selectAll(
          ':last-child',
          u('a', [
            u('b', 'Alpha'),
            u('c', 'Bravo'),
            u('b', 'Charlie'),
            u('b', 'Delta'),
            u('d', [u('b', 'Echo')])
          ])
        ),
        [u('d', [u('b', 'Echo')]), u('b', 'Echo')],
        'should return all `:last-child`s (1)'
      )

      assert.deepEqual(
        selectAll(
          'b:last-child',
          u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('b', 'Charlie')])
        ),
        [u('b', 'Charlie')],
        'should return all `:last-child`s (2)'
      )

      assert.deepEqual(
        selectAll(
          'h1:last-child',
          u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('b', 'Charlie')])
        ),
        [],
        'should return nothing if nothing matches'
      )
    })

    await t.test(':only-child', () => {
      assert.deepEqual(
        selectAll(
          ':only-child',
          u('a', [
            u('b', 'Alpha'),
            u('c', 'Bravo'),
            u('b', 'Charlie'),
            u('b', 'Delta'),
            u('d', [u('b', 'Echo')])
          ])
        ),
        [u('b', 'Echo')],
        'should return all `:only-child`s'
      )

      assert.deepEqual(
        selectAll(
          'c:only-child',
          u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('b', 'Charlie')])
        ),
        [],
        'should return nothing if nothing matches'
      )
    })

    await t.test(':nth-child', () => {
      assert.deepEqual(
        selectAll(
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
        [u('b', 'Alpha'), u('b', 'Charlie'), u('b', 'Echo')],
        'should return all `:nth-child(odd)`s'
      )

      assert.deepEqual(
        selectAll(
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
        [u('b', 'Alpha'), u('b', 'Charlie'), u('b', 'Echo')],
        'should return all `:nth-child(2n+1)`s'
      )

      assert.deepEqual(
        selectAll(
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
        [u('b', 'Bravo'), u('b', 'Delta'), u('b', 'Foxtrot')],
        'should return all `:nth-child(even)`s'
      )

      assert.deepEqual(
        selectAll(
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
        [u('b', 'Bravo'), u('b', 'Delta'), u('b', 'Foxtrot')],
        'should return all `:nth-child(2n+0)`s'
      )
    })

    await t.test(':nth-last-child', () => {
      assert.deepEqual(
        selectAll(
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
        [u('b', 'Bravo'), u('b', 'Delta'), u('b', 'Foxtrot')],
        'should return all `:nth-last-child(odd)`s'
      )

      assert.deepEqual(
        selectAll(
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
        [u('b', 'Bravo'), u('b', 'Delta'), u('b', 'Foxtrot')],
        'should return all `:nth-last-child(2n+1)`s'
      )

      assert.deepEqual(
        selectAll(
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
        [u('b', 'Alpha'), u('b', 'Charlie'), u('b', 'Echo')],
        'should return all `:nth-last-child(even)`s'
      )

      assert.deepEqual(
        selectAll(
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
        [u('b', 'Alpha'), u('b', 'Charlie'), u('b', 'Echo')],
        'should return all `:nth-last-child(2n+0)`s'
      )
    })

    await t.test(':nth-of-type', () => {
      assert.deepEqual(
        selectAll(
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
        [u('b', 'Alpha'), u('b', 'Echo')],
        'should return all `:nth-of-type(odd)`s'
      )

      assert.deepEqual(
        selectAll(
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
        [u('b', 'Alpha'), u('b', 'Echo')],
        'should return all `:nth-of-type(2n+1)`s'
      )

      assert.deepEqual(
        selectAll(
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
        [u('b', 'Charlie')],
        'should return all `:nth-of-type(even)`s'
      )

      assert.deepEqual(
        selectAll(
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
        [u('b', 'Charlie')],
        'should return all `:nth-of-type(2n+0)`s'
      )
    })

    await t.test(':nth-last-of-type', () => {
      assert.deepEqual(
        selectAll(
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
        [u('b', 'Alpha'), u('b', 'Echo')],
        'should return all `:nth-last-of-type(odd)`s'
      )

      assert.deepEqual(
        selectAll(
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
        [u('b', 'Alpha'), u('b', 'Echo')],
        'should return all `:nth-last-of-type(2n+1)`s'
      )

      assert.deepEqual(
        selectAll(
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
        [u('b', 'Charlie')],
        'should return all `:nth-last-of-type(even)`s'
      )

      assert.deepEqual(
        selectAll(
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
        [u('b', 'Charlie')],
        'should return all `:nth-last-of-type(2n+0)`s'
      )
    })

    await t.test(':first-of-type', () => {
      assert.deepEqual(
        selectAll(
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
        [u('b', 'Alpha')],
        'should return all `:first-of-type`s'
      )

      assert.deepEqual(
        selectAll('b:first-of-type', u('a', [])),
        [],
        'should return nothing without matches'
      )
    })

    await t.test(':last-of-type', () => {
      assert.deepEqual(
        selectAll(
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
        [u('b', 'Echo')],
        'should return all `:last-of-type`s'
      )

      assert.deepEqual(
        selectAll('b:last-of-type', u('a', [])),
        [],
        'should return nothing without matches'
      )
    })

    await t.test(':only-of-type', () => {
      assert.deepEqual(
        selectAll(
          'c:only-of-type',
          u('a', [
            u('b', 'Alpha'),
            u('b', 'Bravo'),
            u('c', 'Charlie'),
            u('b', 'Delta')
          ])
        ),
        [u('c', 'Charlie')],
        'should return the only type'
      )

      assert.deepEqual(
        selectAll(
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
        [],
        'should return nothing with too many matches'
      )

      assert.deepEqual(
        selectAll('b:only-of-type', u('a', [])),
        [],
        'should return nothing without matches'
      )
    })

    await t.test(':root', () => {
      assert.deepEqual(
        selectAll(':root', u('a', [u('b'), u('c', [u('d')])])),
        [u('a', [u('b'), u('c', [u('d')])])],
        'should return the given node'
      )
    })

    await t.test(':scope', () => {
      assert.deepEqual(
        selectAll(':scope', u('a', [u('b'), u('c', [u('d')])])),
        [u('a', [u('b'), u('c', [u('d')])])],
        'should return the given node'
      )
    })

    await t.test(':has', () => {
      assert.deepEqual(
        selectAll('c:has(:first-child)', u('a', [u('b'), u('c', [u('d')])])),
        [u('c', [u('d')])],
        'should select a node'
      )
    })
  })

  await t.test(':any', () => {
    assert.deepEqual(
      selectAll('y:any(:first-child)', u('x', [u('y', 'a'), u('y', 'b')])),
      [u('y', 'a')],
      'should support parent-sensitive `:any`'
    )
  })

  await t.test(':matches', () => {
    assert.deepEqual(
      selectAll('y:matches(:first-child)', u('x', [u('y', 'a'), u('y', 'b')])),
      [u('y', 'a')],
      'should support parent-sensitive `:matches`'
    )
  })

  await t.test(':not', () => {
    assert.deepEqual(
      selectAll('y:not(:first-child)', u('x', [u('y', 'a'), u('y', 'b')])),
      [u('y', 'b')],
      'should support parent-sensitive `:not`'
    )
  })
})
