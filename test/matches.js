/**
 * @typedef {import('unist').Literal} Literal
 */

import test from 'tape'
import {u} from 'unist-builder'
import {matches} from '../index.js'

test('select.matches()', (t) => {
  t.equal(matches('*', u('root', [])), true, 'should work (1)')
  t.equal(matches('*', {type: 'a', children: []}), true, 'should work (2)')

  t.test('invalid selector', (st) => {
    st.throws(
      () => {
        // @ts-expect-error runtime.
        matches()
      },
      /Error: Expected `string` as selector, not `undefined`/,
      'should throw without selector'
    )

    st.throws(
      () => {
        // @ts-expect-error runtime.
        matches([], u('root', []))
      },
      /Error: Expected `string` as selector, not ``/,
      'should throw w/ invalid selector (1)'
    )

    st.throws(
      () => {
        matches('@supports (transform-origin: 5% 5%) {}', u('root', []))
      },
      /Error: Rule expected but "@" found./,
      'should throw w/ invalid selector (2)'
    )

    st.throws(
      () => {
        matches('[foo%=bar]', u('root', []))
      },
      /Error: Expected "=" but "%" found./,
      'should throw on invalid attribute operators'
    )

    st.throws(
      () => {
        matches(':active', u('root', []))
      },
      /Error: Unknown pseudo-selector `active`/,
      'should throw on invalid pseudo classes'
    )

    st.throws(
      () => {
        matches(':nth-foo(2n+1)', u('root', []))
      },
      /Error: Unknown pseudo-selector `nth-foo`/,
      'should throw on invalid pseudo class “functions”'
    )

    st.throws(
      () => {
        matches('::before', u('root', []))
      },
      /Error: Unexpected pseudo-element or empty pseudo-class/,
      'should throw on invalid pseudo elements'
    )

    st.throws(
      () => {
        matches('foo bar', u('root', []))
      },
      /Error: Expected selector without nesting/,
      'should throw on nested selectors (descendant)'
    )

    st.throws(
      () => {
        matches('foo > bar', u('root', []))
      },
      /Error: Expected selector without nesting/,
      'should throw on nested selectors (direct child)'
    )

    st.end()
  })

  t.test('parent-sensitive pseudo-selectors', (st) => {
    const simplePseudos = [
      'first-child',
      'first-of-type',
      'last-child',
      'last-of-type',
      'only-child',
      'only-of-type'
    ]

    const functionalPseudos = [
      'nth-child',
      'nth-last-child',
      'nth-of-type',
      'nth-last-of-type'
    ]

    let index = -1

    while (++index < simplePseudos.length) {
      const pseudo = simplePseudos[index]

      st.throws(
        () => {
          matches(':' + pseudo, u('root', []))
        },
        new RegExp('Error: Cannot use `:' + pseudo + '` without parent'),
        'should throw on `' + pseudo + '`'
      )
    }

    index = -1

    while (++index < functionalPseudos.length) {
      const pseudo = functionalPseudos[index]

      st.throws(
        () => {
          matches(':' + pseudo + '()', u('root', []))
        },
        /n-th rule couldn't be parsed/,
        'should throw on `' + pseudo + '()`'
      )
    }

    st.end()
  })

  t.test('general', (st) => {
    st.notOk(
      matches('', u('root', [])),
      'false for the empty string as selector'
    )
    st.notOk(
      matches(' ', u('root', [])),
      'false for a white-space only selector'
    )
    st.notOk(matches('*'), 'false if not given a node')
    st.ok(
      matches('*', /** @type {Literal} */ ({type: 'text', value: 'a'})),
      'true if given an node'
    )

    st.end()
  })

  t.test('multiple selectors', (st) => {
    st.ok(matches('a, b', u('a')), 'true')
    st.notOk(matches('b, c', u('a')), 'false')

    st.end()
  })

  t.test('tag-names: `div`, `*`', (st) => {
    st.ok(matches('*', u('a')), 'true for `*`')
    st.ok(matches('b', u('b')), 'true if types matches')
    st.notOk(matches('b', u('a')), 'false if types don’t matches')

    st.end()
  })

  t.test('id: `#id`', (st) => {
    st.throws(
      () => {
        matches('#one', u('a'))
      },
      /Error: Invalid selector: id/,
      'should throw with id selector'
    )

    st.end()
  })

  t.test('class: `.class`', (st) => {
    st.throws(
      () => {
        matches('.one', u('a'))
      },
      /Error: Invalid selector: class/,
      'should throw with class selector'
    )

    st.end()
  })

  t.test('attributes, existence: `[attr]`', (st) => {
    st.ok(
      matches('[foo]', u('a', {foo: 'alpha'})),
      'true if attribute exists (string)'
    )
    st.ok(
      matches('[foo]', u('a', {foo: 0})),
      'true if attribute exists (number)'
    )
    st.ok(
      matches('[foo]', u('a', {foo: []})),
      'true if attribute exists (array)'
    )
    st.ok(
      matches('[foo]', u('a', {foo: {}})),
      'true if attribute exists (object)'
    )
    st.notOk(
      matches('[foo]', u('a', {bar: 'bravo'})),
      'false if attribute does not exists'
    )
    st.notOk(
      matches('[foo]', u('a', {foo: null})),
      'false if attribute does not exists (null)'
    )
    st.notOk(
      matches('[foo]', u('a', {foo: undefined})),
      'false if attribute does not exists (undefined)'
    )

    st.end()
  })

  t.test('attributes, equality: `[attr=value]`', (st) => {
    st.ok(
      matches('[foo=alpha]', u('a', {foo: 'alpha'})),
      'true if attribute matches (string)'
    )
    st.ok(
      matches('[foo=1]', u('a', {foo: 1})),
      'true if attribute matches (number)'
    )
    st.ok(
      matches('[foo=alpha]', u('a', {foo: ['alpha']})),
      'true if attribute matches (array)'
    )
    st.ok(
      matches('[foo=alpha,bravo]', u('a', {foo: ['alpha', 'bravo']})),
      'true if attribute matches (array, 2)'
    )
    st.ok(
      matches('[foo=true]', u('a', {foo: true})),
      'true if attribute matches (boolean, true)'
    )
    st.ok(
      matches('[foo=false]', u('a', {foo: false})),
      'true if attribute matches (boolean, false)'
    )
    st.notOk(
      matches('[foo=null]', u('a', {foo: null})),
      'false if attribute is missing (null)'
    )
    st.notOk(
      matches('[foo=undefined]', u('a', {foo: undefined})),
      'false if attribute is missing (undefined)'
    )

    st.notOk(
      matches('[foo=alpha]', u('a', {foo: 'bravo'})),
      'false if not matches (string)'
    )
    st.notOk(
      matches('[foo=1]', u('a', {foo: 2})),
      'false if not matches (number)'
    )
    st.notOk(
      matches('[foo=alpha]', u('a', {foo: ['bravo']})),
      'false if not matches (array)'
    )
    st.notOk(
      matches('[foo=alpha,bravo]', u('a', {foo: ['charlie', 'delta']})),
      'false if not matches (array, 2)'
    )
    st.notOk(
      matches('[foo=true]', u('a', {foo: false})),
      'false if not matches (boolean, true)'
    )
    st.notOk(
      matches('[foo=false]', u('a', {foo: true})),
      'false if not matches (boolean, false)'
    )

    st.end()
  })

  t.test('attributes, begins: `[attr^=value]`', (st) => {
    st.ok(
      matches('[foo^=al]', u('a', {foo: 'alpha'})),
      'true if attribute matches (string)'
    )
    st.notOk(
      matches('[foo^=al]', u('a', {foo: 'bravo'})),
      'false if not matches (string)'
    )

    st.notOk(
      matches('[foo^=1]', u('a', {foo: 1})),
      'false if not string (number)'
    )
    st.notOk(
      matches('[foo^=alpha]', u('a', {foo: ['alpha']})),
      'false if not string (array)'
    )
    st.notOk(
      matches('[foo^=true]', u('a', {foo: true})),
      'false if not string (boolean, true)'
    )
    st.notOk(
      matches('[foo^=false]', u('a', {foo: false})),
      'false if not string (boolean, false)'
    )

    st.end()
  })

  t.test('attributes, ends: `[attr$=value]`', (st) => {
    st.ok(
      matches('[foo$=ha]', u('a', {foo: 'alpha'})),
      'true if attribute matches (string)'
    )
    st.notOk(
      matches('[foo$=ha]', u('a', {foo: 'bravo'})),
      'false if not matches (string)'
    )

    st.notOk(
      matches('[foo$=1]', u('a', {foo: 1})),
      'false if not string (number)'
    )
    st.notOk(
      matches('[foo$=alpha]', u('a', {foo: ['alpha']})),
      'false if not string (array)'
    )
    st.notOk(
      matches('[foo$=true]', u('a', {foo: true})),
      'false if not string (boolean, true)'
    )
    st.notOk(
      matches('[foo$=false]', u('a', {foo: false})),
      'false if not string (boolean, false)'
    )

    st.end()
  })

  t.test('attributes, contains: `[attr*=value]`', (st) => {
    st.ok(
      matches('[foo*=ph]', u('a', {foo: 'alpha'})),
      'true if attribute matches (string)'
    )
    st.notOk(
      matches('[foo*=ph]', u('a', {foo: 'bravo'})),
      'false if not matches (string)'
    )
    st.notOk(
      matches('[foo*=1]', u('a', {foo: 1})),
      'false if not string (number)'
    )
    st.notOk(
      matches('[foo*=alpha]', u('a', {foo: ['alpha']})),
      'false if not string (array)'
    )
    st.notOk(
      matches('[foo*=true]', u('a', {foo: true})),
      'false if not string (boolean, true)'
    )
    st.notOk(
      matches('[foo*=false]', u('a', {foo: false})),
      'false if not string (boolean, false)'
    )

    st.end()
  })

  t.test('attributes, contains in a list: `[attr~=value]`', (st) => {
    st.ok(
      matches('[foo~=alpha]', u('a', {foo: 'alpha'})),
      'true if attribute matches (string)'
    )
    st.ok(
      matches('[foo~=1]', u('a', {foo: 1})),
      'true if attribute matches (number)'
    )
    st.ok(
      matches('[foo~=alpha]', u('a', {foo: ['alpha']})),
      'true if attribute matches (array)'
    )
    st.ok(
      matches('[foo~=alpha,bravo]', u('a', {foo: ['alpha', 'bravo']})),
      'true if attribute matches (array, 2)'
    )
    st.ok(
      matches('[foo~=true]', u('a', {foo: true})),
      'true if attribute matches (boolean, true)'
    )
    st.ok(
      matches('[foo~=false]', u('a', {foo: false})),
      'true if attribute matches (boolean, false)'
    )
    st.notOk(
      matches('[foo~=null]', u('a', {foo: null})),
      'false if attribute is missing (null)'
    )
    st.notOk(
      matches('[foo~=undefined]', u('a', {foo: undefined})),
      'false if attribute is missing (undefined)'
    )
    st.notOk(
      matches('[foo~=alpha]', u('a', {foo: 'bravo'})),
      'false if not matches (string)'
    )
    st.notOk(
      matches('[foo~=1]', u('a', {foo: 2})),
      'false if not matches (number)'
    )
    st.notOk(
      matches('[foo~=alpha]', u('a', {foo: ['bravo']})),
      'false if not matches (array)'
    )
    st.notOk(
      matches('[foo~=alpha,bravo]', u('a', {foo: ['charlie', 'delta']})),
      'false if not matches (array, 2)'
    )
    st.notOk(
      matches('[foo~=true]', u('a', {foo: false})),
      'false if not matches (boolean, true)'
    )
    st.notOk(
      matches('[foo=false]', u('a', {foo: true})),
      'false if not matches (boolean, false)'
    )

    st.ok(
      matches('[foo~=bravo]', u('a', {foo: ['alpha', 'bravo', 'charlie']})),
      'true if attribute is contained (array of strings)'
    )
    st.ok(
      matches('[foo~=bravo]', u('a', {foo: ['alpha', 'bravo', 'charlie']})),
      'true if attribute is contained (array of strings)'
    )
    st.notOk(
      matches('[foo~=delta]', u('a', {foo: ['alpha', 'bravo', 'charlie']})),
      'false if attribute is not contained (array of strings)'
    )
    st.notOk(
      matches('[foo~=delta]', u('a', {foo: ['alpha', 'bravo', 'charlie']})),
      'false if attribute is not contained (array of strings)'
    )

    st.end()
  })

  t.test('pseudo-classes', (st) => {
    const anyMatchesPseudos = [':any', ':matches']
    let index = -1

    while (++index < anyMatchesPseudos.length) {
      const pseudo = anyMatchesPseudos[index]

      st.test(pseudo, (sst) => {
        sst.ok(
          matches(pseudo + '(a, [b])', u('a')),
          'true if any matches (type)'
        )
        sst.ok(
          matches(pseudo + '(a, [b])', u('c', {b: 1})),
          'true if any matches (attribute)'
        )
        sst.notOk(
          matches(pseudo + '(a, [b])', u('c')),
          'false if nothing matches'
        )
        sst.notOk(
          matches(pseudo + '(a, [b])', u('c', [u('a')])),
          'false if children match'
        )

        sst.end()
      })
    }

    st.test(':not()', (sst) => {
      sst.notOk(matches(':not(a, [b])', u('a')), 'false if any matches (type)')
      sst.notOk(
        matches(':not(a, [b])', u('c', {b: 1})),
        'false if any matches (attribute)'
      )
      sst.ok(matches(':not(a, [b])', u('c')), 'true if nothing matches')
      sst.ok(
        matches(':not(a, [b])', u('c', [u('a')])),
        'true if children match'
      )

      sst.end()
    })

    st.test(':has', (sst) => {
      sst.doesNotThrow(() => {
        matches('a:not(:has())', u('b'))
      }, 'should not throw on empty selectors')

      sst.doesNotThrow(() => {
        matches('a:has()', u('b'))
      }, 'should not throw on empty selectors')

      sst.notOk(
        matches('a:has(b)', u('a', [u('c')])),
        'should not match the scope element (#1)'
      )
      sst.ok(
        matches('a:has(b)', u('a', [u('b')])),
        'should not match the scope element (#2)'
      )
      sst.ok(
        matches('a:has(b)', u('a', [u('b')])),
        'true if children match the descendant selector'
      )
      sst.notOk(
        matches('a:has(b)', u('a', [u('c')])),
        'false if no children match the descendant selector'
      )
      sst.ok(
        matches('a:has(c)', u('a', [u('b'), u('c')])),
        'true if descendants match the descendant selector'
      )
      sst.notOk(
        matches('a:has(d)', u('a', [u('b', [u('c')])])),
        'false if no descendants match the descendant selector'
      )

      sst.ok(
        matches('a:has(b + c)', u('a', [u('b'), u('c')])),
        'should support a nested next-sibling selector (#1)'
      )

      sst.notOk(
        matches('a:has(b + a)', u('a', [u('b'), u('b')])),
        'should support a nested next-sibling selector (#2)'
      )

      sst.ok(
        matches('a:has([c])', u('a', [u('b', {c: 'd'})])),
        'should add `:scope` to sub-selectors (#1)'
      )
      sst.notOk(
        matches('a:has([b])', u('a', {b: 'c'}, [u('d')])),
        'should add `:scope` to sub-selectors (#2)'
      )
      sst.notOk(
        matches('a:has(a, :scope c)', u('a', u('b'))),
        'should add `:scope` to all sub-selectors (#2)'
      )

      sst.ok(
        matches('a:not(:has(b, c, d))', u('a', [])),
        'should add `:scope` to all sub-selectors (#3)'
      )

      sst.ok(
        matches('a:not(:has(d, e, f))', u('a', [u('b', 'c')])),
        'should add `:scope` to all sub-selectors (#4)'
      )

      sst.notOk(
        matches('a:has(:matches(c, d))', u('a', [u('b')])),
        'should ignore commas in parens (#1)'
      )
      sst.ok(
        matches('a:has(:matches(b, c))', u('a', [u('b')])),
        'should ignore commas in parens (#2)'
      )

      sst.notOk(
        matches('a:has(:matches(c), :matches(d))', u('a', [u('b')])),
        'should support multiple relative selectors (#1)'
      )
      sst.ok(
        matches('a:has(:matches(c), :matches(b))', u('a', [u('b')])),
        'should support multiple relative selectors (#2)'
      )

      // This checks white-space.
      sst.ok(matches('a:has( b)', u('a', [u('b')])), 'assertion (#1)')
      sst.ok(matches('a:has( b  )', u('a', [u('b')])), 'assertion (#2)')
      sst.ok(matches('a:has(b )', u('a', [u('b')])), 'assertion (#3)')
      sst.ok(matches('a:has( b  ,\t p )', u('a', [u('b')])), 'assertion (#4)')

      // Sst.ok(
      //   matches('a:has(> b)', u('a', [u('b')])),
      //   'true for relative direct child selector'
      // )
      // sst.notOk(
      //   matches('a:has(> c)', u('a', [u('b', [u('c')])])),
      //   'false for relative direct child selectors'
      // )
      // sst.ok(
      //   matches('a:has(> c, > b)', u('a', [u('b', [u('b')])])),
      //   'should support a list of relative selectors'
      // )
      // // Note: These should not be commented, but that’s not supported by the CSS parser.

      sst.end()
    })

    const emptyBlankPseudos = [':empty', ':blank']

    index = -1

    while (++index < emptyBlankPseudos.length) {
      const pseudo = emptyBlankPseudos[index]

      st.test(pseudo, (sst) => {
        sst.ok(matches(pseudo, u('a')), 'true for void node')
        sst.ok(matches(pseudo, u('a', [])), 'true for parent without children')
        sst.notOk(matches(pseudo, u('a', '')), 'false for falsey literal')
        sst.notOk(matches(pseudo, u('a', [u('b')])), 'false if w/ nodes')
        sst.notOk(matches(pseudo, u('a', 'b')), 'false if w/ literal')

        sst.end()
      })
    }

    st.test(':root', (sst) => {
      sst.ok(matches(':root', u('a')), 'true')
      sst.end()
    })

    st.test(':scope', (sst) => {
      sst.ok(matches(':scope', u('a')), 'true')
      sst.end()
    })

    st.end()
  })

  t.end()
})
