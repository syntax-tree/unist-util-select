import test from 'tape'
import {u} from 'unist-builder'
import {select} from '../index.js'

test('select.select()', (t) => {
  t.test('invalid selectors', (st) => {
    st.throws(
      () => {
        // @ts-expect-error runtime.
        select()
      },
      /Error: Expected `string` as selector, not `undefined`/,
      'should throw without selector'
    )

    st.throws(
      () => {
        // @ts-expect-error runtime.
        select([], u('a'))
      },
      /Error: Expected `string` as selector, not ``/,
      'should throw w/ invalid selector (1)'
    )

    st.throws(
      () => {
        select('@supports (transform-origin: 5% 5%) {}', u('a'))
      },
      /Error: Rule expected but "@" found./,
      'should throw w/ invalid selector (2)'
    )

    st.throws(
      () => {
        select('[foo%=bar]', u('a'))
      },
      /Error: Expected "=" but "%" found./,
      'should throw on invalid attribute operators'
    )

    st.throws(
      () => {
        select(':active', u('a'))
      },
      /Error: Unknown pseudo-selector `active`/,
      'should throw on invalid pseudo classes'
    )

    st.throws(
      () => {
        select(':nth-foo(2n+1)', u('a'))
      },
      /Error: Unknown pseudo-selector `nth-foo`/,
      'should throw on invalid pseudo class “functions”'
    )

    st.throws(
      () => {
        select('::before', u('a'))
      },
      /Error: Unexpected pseudo-element or empty pseudo-class/,
      'should throw on invalid pseudo elements'
    )

    st.end()
  })

  t.test('general', (st) => {
    st.equal(
      select('', u('a')),
      null,
      'nothing for the empty string as selector'
    )
    st.equal(
      select(' ', u('a')),
      null,
      'nothing for a white-space only selector'
    )
    st.equal(select('*'), null, 'nothing if not given a node')

    st.deepEqual(select('*', u('a')), u('a'), 'the node if given a node')

    st.end()
  })

  t.test('descendant selector', (st) => {
    st.deepEqual(
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

    st.deepEqual(
      select('a', u('a', {c: 1})),
      u('a', {c: 1}),
      'should return the given node if it matches'
    )

    st.deepEqual(
      select(
        'b',
        u('a', [
          u('b', {x: 1}, [u('b', {x: 2}), u('b', {x: 3}, [u('b', {x: 4})])])
        ])
      ),
      u('b', {x: 1}, [u('b', {x: 2}), u('b', {x: 3}, [u('b', {x: 4})])]),
      'should return the first match'
    )

    st.deepEqual(
      select('a c d', u('a', [u('b', [u('c', [u('d', [u('d')])])])])),
      u('d', [u('d')]),
      'should return deep matches'
    )

    st.end()
  })

  t.test('child selector', (st) => {
    st.deepEqual(
      select('c > e', u('a', [u('b'), u('c', [u('d'), u('e', [u('f')])])])),
      u('e', [u('f')]),
      'should return child nodes'
    )

    st.deepEqual(
      select(
        'b > b',
        u('a', [
          u('b', {x: 1}, [u('b', {x: 2}), u('b', {x: 3}, [u('b', {x: 4})])])
        ])
      ),
      u('b', {x: 2}),
      'should return matches with nested matches'
    )

    st.deepEqual(
      select('b > c > d', u('a', [u('b', [u('c', [u('d', [u('d')])])])])),
      u('d', [u('d')]),
      'should return deep matches'
    )

    st.end()
  })

  t.test('adjacent sibling selector', (st) => {
    st.deepEqual(
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

    st.equal(
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

    st.end()
  })

  t.test('general sibling selector', (st) => {
    st.deepEqual(
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

    st.deepEqual(
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

    st.equal(
      select(
        'c ~ b',
        u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('d', 'Charlie')])
      ),
      null,
      'should return nothing without matches'
    )

    st.end()
  })

  t.test('parent-sensitive pseudo-selectors', (st) => {
    st.test(':first-child', (sst) => {
      sst.deepEqual(
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

      sst.equal(
        select(
          'c:first-child',
          u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('d', 'Charlie')])
        ),
        null,
        'should return nothing if nothing matches'
      )

      sst.end()
    })

    st.test(':last-child', (sst) => {
      sst.deepEqual(
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

      sst.equal(
        select(
          'c:last-child',
          u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('d', 'Charlie')])
        ),
        null,
        'should return nothing if nothing matches'
      )

      sst.end()
    })

    st.test(':only-child', (sst) => {
      sst.deepEqual(
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

      sst.equal(
        select(
          'c:only-child',
          u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('d', 'Charlie')])
        ),
        null,
        'should return nothing if nothing matches'
      )

      sst.end()
    })

    st.test(':nth-child', (sst) => {
      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.end()
    })

    st.test(':nth-last-child', (sst) => {
      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.end()
    })

    st.test(':nth-of-type', (sst) => {
      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.end()
    })

    st.test(':nth-last-of-type', (sst) => {
      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.end()
    })

    st.test(':first-of-type', (sst) => {
      sst.deepEqual(
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

      sst.equal(
        select('b:first-of-type', u('a', [])),
        null,
        'should return nothing without matches'
      )

      sst.end()
    })

    st.test(':last-of-type', (sst) => {
      sst.deepEqual(
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

      sst.equal(
        select('b:last-of-type', u('a', [])),
        null,
        'should return nothing without matches'
      )

      sst.end()
    })

    st.test(':only-of-type', (sst) => {
      sst.deepEqual(
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

      sst.equal(
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

      sst.equal(
        select('b:only-of-type', u('a', [])),
        null,
        'should return nothing without matches'
      )

      sst.end()
    })

    st.test(':root', (sst) => {
      sst.deepEqual(
        select(':root', u('a', [u('b'), u('c', [u('d')])])),
        u('a', [u('b'), u('c', [u('d')])]),
        'should return the given node'
      )

      sst.end()
    })

    st.test(':scope', (sst) => {
      sst.deepEqual(
        select(':scope', u('a', [u('b'), u('c', [u('d')])])),
        u('a', [u('b'), u('c', [u('d')])]),
        'should return the given node'
      )

      sst.end()
    })

    st.test(':has', (sst) => {
      sst.deepEqual(
        select('c:has(:first-child)', u('a', [u('b'), u('c', [u('d')])])),
        u('c', [u('d')]),
        'should select a node'
      )

      sst.end()
    })

    st.end()
  })

  t.end()
})
