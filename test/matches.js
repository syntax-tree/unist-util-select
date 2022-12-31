/**
 * @typedef {import('unist').Literal} Literal
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {u} from 'unist-builder'
import {matches} from '../index.js'

test('select.matches()', async (t) => {
  assert.equal(matches('*', u('root', [])), true, 'should work (1)')
  assert.equal(matches('*', {type: 'a', children: []}), true, 'should work (2)')

  await t.test('invalid selector', () => {
    assert.throws(
      () => {
        // @ts-expect-error runtime.
        matches()
      },
      /Error: Expected `string` as selector, not `undefined`/,
      'should throw without selector'
    )

    assert.throws(
      () => {
        // @ts-expect-error runtime.
        matches([], u('root', []))
      },
      /Error: Expected `string` as selector, not ``/,
      'should throw w/ invalid selector (1)'
    )

    assert.throws(
      () => {
        matches('@supports (transform-origin: 5% 5%) {}', u('root', []))
      },
      /Error: Rule expected but "@" found./,
      'should throw w/ invalid selector (2)'
    )

    assert.throws(
      () => {
        matches('[foo%=bar]', u('root', []))
      },
      /Error: Expected "=" but "%" found./,
      'should throw on invalid attribute operators'
    )

    assert.throws(
      () => {
        matches(':active', u('root', []))
      },
      /Error: Unknown pseudo-selector `active`/,
      'should throw on invalid pseudo classes'
    )

    assert.throws(
      () => {
        matches(':nth-foo(2n+1)', u('root', []))
      },
      /Error: Unknown pseudo-selector `nth-foo`/,
      'should throw on invalid pseudo class “functions”'
    )

    assert.throws(
      () => {
        matches('::before', u('root', []))
      },
      /Error: Unexpected pseudo-element or empty pseudo-class/,
      'should throw on invalid pseudo elements'
    )

    assert.throws(
      () => {
        matches('foo bar', u('root', []))
      },
      /Error: Expected selector without nesting/,
      'should throw on nested selectors (descendant)'
    )

    assert.throws(
      () => {
        matches('foo > bar', u('root', []))
      },
      /Error: Expected selector without nesting/,
      'should throw on nested selectors (direct child)'
    )
  })

  await t.test('parent-sensitive pseudo-selectors', () => {
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

      assert.throws(
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

      assert.throws(
        () => {
          matches(':' + pseudo + '()', u('root', []))
        },
        /n-th rule couldn't be parsed/,
        'should throw on `' + pseudo + '()`'
      )
    }
  })

  await t.test('general', () => {
    assert.ok(
      !matches('', u('root', [])),
      'false for the empty string as selector'
    )
    assert.ok(
      !matches(' ', u('root', [])),
      'false for a white-space only selector'
    )
    assert.ok(!matches('*'), 'false if not given a node')
    assert.ok(
      matches('*', /** @type {Literal} */ ({type: 'text', value: 'a'})),
      'true if given an node'
    )
  })

  await t.test('multiple selectors', () => {
    assert.ok(matches('a, b', u('a')), 'true')
    assert.ok(!matches('b, c', u('a')), 'false')
  })

  await t.test('tag-names: `div`, `*`', () => {
    assert.ok(matches('*', u('a')), 'true for `*`')
    assert.ok(matches('b', u('b')), 'true if types matches')
    assert.ok(!matches('b', u('a')), 'false if types don’t matches')
  })

  await t.test('id: `#id`', () => {
    assert.throws(
      () => {
        matches('#one', u('a'))
      },
      /Error: Invalid selector: id/,
      'should throw with id selector'
    )
  })

  await t.test('class: `.class`', () => {
    assert.throws(
      () => {
        matches('.one', u('a'))
      },
      /Error: Invalid selector: class/,
      'should throw with class selector'
    )
  })

  await t.test('attributes, existence: `[attr]`', () => {
    assert.ok(
      matches('[foo]', u('a', {foo: 'alpha'})),
      'true if attribute exists (string)'
    )
    assert.ok(
      matches('[foo]', u('a', {foo: 0})),
      'true if attribute exists (number)'
    )
    assert.ok(
      matches('[foo]', u('a', {foo: []})),
      'true if attribute exists (array)'
    )
    assert.ok(
      matches('[foo]', u('a', {foo: {}})),
      'true if attribute exists (object)'
    )
    assert.ok(
      !matches('[foo]', u('a', {bar: 'bravo'})),
      'false if attribute does not exists'
    )
    assert.ok(
      !matches('[foo]', u('a', {foo: null})),
      'false if attribute does not exists (null)'
    )
    assert.ok(
      !matches('[foo]', u('a', {foo: undefined})),
      'false if attribute does not exists (undefined)'
    )
  })

  await t.test('attributes, equality: `[attr=value]`', () => {
    assert.ok(
      matches('[foo=alpha]', u('a', {foo: 'alpha'})),
      'true if attribute matches (string)'
    )
    assert.ok(
      matches('[foo=1]', u('a', {foo: 1})),
      'true if attribute matches (number)'
    )
    assert.ok(
      matches('[foo=alpha]', u('a', {foo: ['alpha']})),
      'true if attribute matches (array)'
    )
    assert.ok(
      matches('[foo=alpha,bravo]', u('a', {foo: ['alpha', 'bravo']})),
      'true if attribute matches (array, 2)'
    )
    assert.ok(
      matches('[foo=true]', u('a', {foo: true})),
      'true if attribute matches (boolean, true)'
    )
    assert.ok(
      matches('[foo=false]', u('a', {foo: false})),
      'true if attribute matches (boolean, false)'
    )
    assert.ok(
      !matches('[foo=null]', u('a', {foo: null})),
      'false if attribute is missing (null)'
    )
    assert.ok(
      !matches('[foo=undefined]', u('a', {foo: undefined})),
      'false if attribute is missing (undefined)'
    )

    assert.ok(
      !matches('[foo=alpha]', u('a', {foo: 'bravo'})),
      'false if not matches (string)'
    )
    assert.ok(
      !matches('[foo=1]', u('a', {foo: 2})),
      'false if not matches (number)'
    )
    assert.ok(
      !matches('[foo=alpha]', u('a', {foo: ['bravo']})),
      'false if not matches (array)'
    )
    assert.ok(
      !matches('[foo=alpha,bravo]', u('a', {foo: ['charlie', 'delta']})),
      'false if not matches (array, 2)'
    )
    assert.ok(
      !matches('[foo=true]', u('a', {foo: false})),
      'false if not matches (boolean, true)'
    )
    assert.ok(
      !matches('[foo=false]', u('a', {foo: true})),
      'false if not matches (boolean, false)'
    )
  })

  await t.test('attributes, begins: `[attr^=value]`', () => {
    assert.ok(
      matches('[foo^=al]', u('a', {foo: 'alpha'})),
      'true if attribute matches (string)'
    )
    assert.ok(
      !matches('[foo^=al]', u('a', {foo: 'bravo'})),
      'false if not matches (string)'
    )

    assert.ok(
      !matches('[foo^=1]', u('a', {foo: 1})),
      'false if not string (number)'
    )
    assert.ok(
      !matches('[foo^=alpha]', u('a', {foo: ['alpha']})),
      'false if not string (array)'
    )
    assert.ok(
      !matches('[foo^=true]', u('a', {foo: true})),
      'false if not string (boolean, true)'
    )
    assert.ok(
      !matches('[foo^=false]', u('a', {foo: false})),
      'false if not string (boolean, false)'
    )
  })

  await t.test('attributes, ends: `[attr$=value]`', () => {
    assert.ok(
      matches('[foo$=ha]', u('a', {foo: 'alpha'})),
      'true if attribute matches (string)'
    )
    assert.ok(
      !matches('[foo$=ha]', u('a', {foo: 'bravo'})),
      'false if not matches (string)'
    )

    assert.ok(
      !matches('[foo$=1]', u('a', {foo: 1})),
      'false if not string (number)'
    )
    assert.ok(
      !matches('[foo$=alpha]', u('a', {foo: ['alpha']})),
      'false if not string (array)'
    )
    assert.ok(
      !matches('[foo$=true]', u('a', {foo: true})),
      'false if not string (boolean, true)'
    )
    assert.ok(
      !matches('[foo$=false]', u('a', {foo: false})),
      'false if not string (boolean, false)'
    )
  })

  await t.test('attributes, contains: `[attr*=value]`', () => {
    assert.ok(
      matches('[foo*=ph]', u('a', {foo: 'alpha'})),
      'true if attribute matches (string)'
    )
    assert.ok(
      !matches('[foo*=ph]', u('a', {foo: 'bravo'})),
      'false if not matches (string)'
    )
    assert.ok(
      !matches('[foo*=1]', u('a', {foo: 1})),
      'false if not string (number)'
    )
    assert.ok(
      !matches('[foo*=alpha]', u('a', {foo: ['alpha']})),
      'false if not string (array)'
    )
    assert.ok(
      !matches('[foo*=true]', u('a', {foo: true})),
      'false if not string (boolean, true)'
    )
    assert.ok(
      !matches('[foo*=false]', u('a', {foo: false})),
      'false if not string (boolean, false)'
    )
  })

  await t.test('attributes, contains in a list: `[attr~=value]`', () => {
    assert.ok(
      matches('[foo~=alpha]', u('a', {foo: 'alpha'})),
      'true if attribute matches (string)'
    )
    assert.ok(
      matches('[foo~=1]', u('a', {foo: 1})),
      'true if attribute matches (number)'
    )
    assert.ok(
      matches('[foo~=alpha]', u('a', {foo: ['alpha']})),
      'true if attribute matches (array)'
    )
    assert.ok(
      matches('[foo~=alpha,bravo]', u('a', {foo: ['alpha', 'bravo']})),
      'true if attribute matches (array, 2)'
    )
    assert.ok(
      matches('[foo~=true]', u('a', {foo: true})),
      'true if attribute matches (boolean, true)'
    )
    assert.ok(
      matches('[foo~=false]', u('a', {foo: false})),
      'true if attribute matches (boolean, false)'
    )
    assert.ok(
      !matches('[foo~=null]', u('a', {foo: null})),
      'false if attribute is missing (null)'
    )
    assert.ok(
      !matches('[foo~=undefined]', u('a', {foo: undefined})),
      'false if attribute is missing (undefined)'
    )
    assert.ok(
      !matches('[foo~=alpha]', u('a', {foo: 'bravo'})),
      'false if not matches (string)'
    )
    assert.ok(
      !matches('[foo~=1]', u('a', {foo: 2})),
      'false if not matches (number)'
    )
    assert.ok(
      !matches('[foo~=alpha]', u('a', {foo: ['bravo']})),
      'false if not matches (array)'
    )
    assert.ok(
      !matches('[foo~=alpha,bravo]', u('a', {foo: ['charlie', 'delta']})),
      'false if not matches (array, 2)'
    )
    assert.ok(
      !matches('[foo~=true]', u('a', {foo: false})),
      'false if not matches (boolean, true)'
    )
    assert.ok(
      !matches('[foo=false]', u('a', {foo: true})),
      'false if not matches (boolean, false)'
    )

    assert.ok(
      matches('[foo~=bravo]', u('a', {foo: ['alpha', 'bravo', 'charlie']})),
      'true if attribute is contained (array of strings)'
    )
    assert.ok(
      matches('[foo~=bravo]', u('a', {foo: ['alpha', 'bravo', 'charlie']})),
      'true if attribute is contained (array of strings)'
    )
    assert.ok(
      !matches('[foo~=delta]', u('a', {foo: ['alpha', 'bravo', 'charlie']})),
      'false if attribute is not contained (array of strings)'
    )
    assert.ok(
      !matches('[foo~=delta]', u('a', {foo: ['alpha', 'bravo', 'charlie']})),
      'false if attribute is not contained (array of strings)'
    )
  })

  await t.test('pseudo-classes', async (t) => {
    const anyMatchesPseudos = [':any', ':matches']
    let index = -1

    while (++index < anyMatchesPseudos.length) {
      const pseudo = anyMatchesPseudos[index]

      await t.test(pseudo, () => {
        assert.ok(
          matches(pseudo + '(a, [b])', u('a')),
          'true if any matches (type)'
        )
        assert.ok(
          matches(pseudo + '(a, [b])', u('c', {b: 1})),
          'true if any matches (attribute)'
        )
        assert.ok(
          !matches(pseudo + '(a, [b])', u('c')),
          'false if nothing matches'
        )
        assert.ok(
          !matches(pseudo + '(a, [b])', u('c', [u('a')])),
          'false if children match'
        )
      })
    }

    await t.test(':not()', () => {
      assert.ok(!matches(':not(a, [b])', u('a')), 'false if any matches (type)')
      assert.ok(
        !matches(':not(a, [b])', u('c', {b: 1})),
        'false if any matches (attribute)'
      )
      assert.ok(matches(':not(a, [b])', u('c')), 'true if nothing matches')
      assert.ok(
        matches(':not(a, [b])', u('c', [u('a')])),
        'true if children match'
      )
    })

    await t.test(':has', () => {
      assert.doesNotThrow(() => {
        matches('a:not(:has())', u('b'))
      }, 'should not throw on empty selectors')

      assert.doesNotThrow(() => {
        matches('a:has()', u('b'))
      }, 'should not throw on empty selectors')

      assert.ok(
        !matches('a:has(b)', u('a', [u('c')])),
        'should not match the scope element (#1)'
      )
      assert.ok(
        matches('a:has(b)', u('a', [u('b')])),
        'should not match the scope element (#2)'
      )
      assert.ok(
        matches('a:has(b)', u('a', [u('b')])),
        'true if children match the descendant selector'
      )
      assert.ok(
        !matches('a:has(b)', u('a', [u('c')])),
        'false if no children match the descendant selector'
      )
      assert.ok(
        matches('a:has(c)', u('a', [u('b'), u('c')])),
        'true if descendants match the descendant selector'
      )
      assert.ok(
        !matches('a:has(d)', u('a', [u('b', [u('c')])])),
        'false if no descendants match the descendant selector'
      )

      assert.ok(
        matches('a:has(b + c)', u('a', [u('b'), u('c')])),
        'should support a nested next-sibling selector (#1)'
      )

      assert.ok(
        !matches('a:has(b + a)', u('a', [u('b'), u('b')])),
        'should support a nested next-sibling selector (#2)'
      )

      assert.ok(
        matches('a:has([c])', u('a', [u('b', {c: 'd'})])),
        'should add `:scope` to sub-selectors (#1)'
      )
      assert.ok(
        !matches('a:has([b])', u('a', {b: 'c'}, [u('d')])),
        'should add `:scope` to sub-selectors (#2)'
      )
      assert.ok(
        !matches('a:has(a, :scope c)', u('a', u('b'))),
        'should add `:scope` to all sub-selectors (#2)'
      )

      assert.ok(
        matches('a:not(:has(b, c, d))', u('a', [])),
        'should add `:scope` to all sub-selectors (#3)'
      )

      assert.ok(
        matches('a:not(:has(d, e, f))', u('a', [u('b', 'c')])),
        'should add `:scope` to all sub-selectors (#4)'
      )

      assert.ok(
        !matches('a:has(:matches(c, d))', u('a', [u('b')])),
        'should ignore commas in parens (#1)'
      )
      assert.ok(
        matches('a:has(:matches(b, c))', u('a', [u('b')])),
        'should ignore commas in parens (#2)'
      )

      assert.ok(
        !matches('a:has(:matches(c), :matches(d))', u('a', [u('b')])),
        'should support multiple relative selectors (#1)'
      )
      assert.ok(
        matches('a:has(:matches(c), :matches(b))', u('a', [u('b')])),
        'should support multiple relative selectors (#2)'
      )

      // This checks white-space.
      assert.ok(matches('a:has( b)', u('a', [u('b')])), 'assertion (#1)')
      assert.ok(matches('a:has( b  )', u('a', [u('b')])), 'assertion (#2)')
      assert.ok(matches('a:has(b )', u('a', [u('b')])), 'assertion (#3)')
      assert.ok(
        matches('a:has( b  ,\t p )', u('a', [u('b')])),
        'assertion (#4)'
      )

      // Note: These should not be uncommented, but that’s not supported by the CSS parser.
      // assert.ok(
      //   matches('a:has(> b)', u('a', [u('b')])),
      //   'true for relative direct child selector'
      // )
      // assert.ok(!
      //   matches('a:has(> c)', u('a', [u('b', [u('c')])])),
      //   'false for relative direct child selectors'
      // )
      // assert.ok(
      //   matches('a:has(> c, > b)', u('a', [u('b', [u('b')])])),
      //   'should support a list of relative selectors'
      // )
    })

    const emptyBlankPseudos = [':empty', ':blank']

    index = -1

    while (++index < emptyBlankPseudos.length) {
      const pseudo = emptyBlankPseudos[index]

      await t.test(pseudo, () => {
        assert.ok(matches(pseudo, u('a')), 'true for void node')
        assert.ok(
          matches(pseudo, u('a', [])),
          'true for parent without children'
        )
        assert.ok(!matches(pseudo, u('a', '')), 'false for falsey literal')
        assert.ok(!matches(pseudo, u('a', [u('b')])), 'false if w/ nodes')
        assert.ok(!matches(pseudo, u('a', 'b')), 'false if w/ literal')
      })
    }

    await t.test(':root', () => {
      assert.ok(matches(':root', u('a')), 'true')
    })

    await t.test(':scope', () => {
      assert.ok(matches(':scope', u('a')), 'true')
    })
  })
})
