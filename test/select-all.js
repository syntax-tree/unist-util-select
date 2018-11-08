'use strict'

var test = require('tape')
var u = require('unist-builder')
var selectAll = require('..').selectAll

test('select.selectAll()', function(t) {
  t.test('invalid selectors', function(st) {
    st.throws(
      function() {
        selectAll()
      },
      /Error: Expected `string` as selector, not `undefined`/,
      'should throw without selector'
    )

    st.throws(
      function() {
        selectAll([], u('a'))
      },
      /Error: Expected `string` as selector, not ``/,
      'should throw w/ invalid selector (1)'
    )

    st.throws(
      function() {
        selectAll('@supports (transform-origin: 5% 5%) {}', u('a'))
      },
      /Error: Rule expected but "@" found./,
      'should throw w/ invalid selector (2)'
    )

    st.throws(
      function() {
        selectAll('[foo%=bar]', u('a'))
      },
      /Error: Expected "=" but "%" found./,
      'should throw on invalid attribute operators'
    )

    st.throws(
      function() {
        selectAll(':active', u('a'))
      },
      /Error: Unknown pseudo-selector `active`/,
      'should throw on invalid pseudo classes'
    )

    st.throws(
      function() {
        selectAll(':nth-foo(2n+1)', u('a'))
      },
      /Error: Unknown pseudo-selector `nth-foo`/,
      'should throw on invalid pseudo class “functions”'
    )

    st.throws(
      function() {
        selectAll('::before', u('a'))
      },
      /Error: Unexpected pseudo-element or empty pseudo-class/,
      'should throw on invalid pseudo elements'
    )

    st.end()
  })

  t.test('general', function(st) {
    st.deepEqual(
      selectAll('', u('a')),
      [],
      'nothing for the empty string as selector'
    )
    st.deepEqual(
      selectAll(' ', u('a')),
      [],
      'nothing for a white-space only selector'
    )
    st.deepEqual(selectAll('*'), [], 'nothing if not given a node')
    st.deepEqual(selectAll('*', u('a')), [u('a')], 'the node if given a node')

    st.end()
  })

  t.test('descendant selector', function(st) {
    st.deepEqual(
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

    st.deepEqual(
      selectAll('a', u('a', 'Alpha')),
      [u('a', 'Alpha')],
      'should return the given node if it matches'
    )

    st.deepEqual(
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

    st.deepEqual(
      selectAll('b c d', u('a', [u('b', [u('c', [u('d', [u('d')])])])])),
      [u('d', [u('d')]), u('d')],
      'should return deep matches'
    )

    st.deepEqual(
      selectAll('b c', u('a', [u('b', [u('c', '1')]), u('d', [u('c', '2')])])),
      [u('c', '1')],
      'should not match outside other matches'
    )

    st.end()
  })

  t.test('child selector', function(st) {
    st.deepEqual(
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

    st.deepEqual(
      selectAll(
        'b > b',
        u('a', [
          u('b', {x: 1}, [u('b', {x: 2}), u('b', {x: 3}, [u('b', {x: 4})])])
        ])
      ),
      [u('b', {x: 2}), u('b', {x: 3}, [u('b', {x: 4})]), u('b', {x: 4})],
      'should return matches with nested matches'
    )

    st.deepEqual(
      selectAll('b > c > d', u('a', [u('b', [u('c', [u('d', [u('d')])])])])),
      [u('d', [u('d')])],
      'should return deep matches'
    )

    st.end()
  })

  t.test('adjacent sibling selector', function(st) {
    st.deepEqual(
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

    st.deepEqual(
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

    st.end()
  })

  t.test('general sibling selector', function(st) {
    st.deepEqual(
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

    st.deepEqual(
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

    st.deepEqual(
      selectAll(
        'c ~ b',
        u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('d', 'Charlie')])
      ),
      [],
      'should return nothing without matches'
    )

    st.end()
  })

  t.test('parent-sensitive pseudo-selectors', function(st) {
    st.test(':first-child', function(sst) {
      sst.deepEqual(
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

      sst.deepEqual(
        selectAll(
          'b:first-child',
          u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('b', 'Charlie')])
        ),
        [u('b', 'Alpha')],
        'should return all `:first-child`s (2)'
      )

      sst.deepEqual(
        selectAll(
          'h1:first-child',
          u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('b', 'Charlie')])
        ),
        [],
        'should return nothing if nothing matches'
      )

      sst.end()
    })

    st.test(':last-child', function(sst) {
      sst.deepEqual(
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

      sst.deepEqual(
        selectAll(
          'b:last-child',
          u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('b', 'Charlie')])
        ),
        [u('b', 'Charlie')],
        'should return all `:last-child`s (2)'
      )

      sst.deepEqual(
        selectAll(
          'h1:last-child',
          u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('b', 'Charlie')])
        ),
        [],
        'should return nothing if nothing matches'
      )

      sst.end()
    })

    st.test(':only-child', function(sst) {
      sst.deepEqual(
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

      sst.deepEqual(
        selectAll(
          'c:only-child',
          u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('b', 'Charlie')])
        ),
        [],
        'should return nothing if nothing matches'
      )

      sst.end()
    })

    st.test(':nth-child', function(sst) {
      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.end()
    })

    st.test(':nth-last-child', function(sst) {
      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.end()
    })

    st.test(':nth-of-type', function(sst) {
      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.end()
    })

    st.test(':nth-last-of-type', function(sst) {
      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.end()
    })

    st.test(':first-of-type', function(sst) {
      sst.deepEqual(
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

      sst.deepEqual(
        selectAll('b:first-of-type', u('a', [])),
        [],
        'should return nothing without matches'
      )

      sst.end()
    })

    st.test(':last-of-type', function(sst) {
      sst.deepEqual(
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

      sst.deepEqual(
        selectAll('b:last-of-type', u('a', [])),
        [],
        'should return nothing without matches'
      )

      sst.end()
    })

    st.test(':only-of-type', function(sst) {
      sst.deepEqual(
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

      sst.deepEqual(
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

      sst.deepEqual(
        selectAll('b:only-of-type', u('a', [])),
        [],
        'should return nothing without matches'
      )

      sst.end()
    })

    st.test(':root', function(sst) {
      sst.deepEqual(
        selectAll(':root', u('a', [u('b'), u('c', [u('d')])])),
        [u('a', [u('b'), u('c', [u('d')])])],
        'should return the given node'
      )

      sst.end()
    })

    st.test(':scope', function(sst) {
      sst.deepEqual(
        selectAll(':scope', u('a', [u('b'), u('c', [u('d')])])),
        [u('a', [u('b'), u('c', [u('d')])])],
        'should return the given node'
      )

      sst.end()
    })

    st.end()
  })

  t.end()
})
