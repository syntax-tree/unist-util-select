import assert from 'node:assert/strict'
import test from 'node:test'
import {u} from 'unist-builder'
import {select} from '../index.js'

test('select.select()', async function (t) {
  await t.test('invalid selectors', async function (t) {
    await t.test('should throw without selector', async function () {
      assert.throws(function () {
        // @ts-expect-error check that a runtime error is thrown.
        select()
      }, /Error: Expected `string` as selector, not `undefined`/)
    })

    await t.test('should throw w/ invalid selector (1)', async function () {
      assert.throws(function () {
        // @ts-expect-error check that a runtime error is thrown.
        select([], u('a'))
      }, /Error: Expected `string` as selector, not ``/)
    })

    await t.test('should throw w/ invalid selector (2)', async function () {
      assert.throws(function () {
        select('@supports (transform-origin: 5% 5%) {}', u('a'))
      }, /Expected rule but "@" found/)
    })

    await t.test(
      'should throw on invalid attribute operators',
      async function () {
        assert.throws(function () {
          select('[foo%=bar]', u('a'))
        }, /Expected a valid attribute selector operator/)
      }
    )

    await t.test('should throw on invalid pseudo classes', async function () {
      assert.throws(function () {
        select(':active', u('a'))
      }, /Error: Unknown pseudo-selector `active`/)
    })

    await t.test(
      'should throw on invalid pseudo class “functions”',
      async function () {
        assert.throws(function () {
          select(':nth-foo(2n+1)', u('a'))
        }, /Unknown pseudo-class/)
      }
    )

    await t.test('should throw on invalid pseudo elements', async function () {
      assert.throws(function () {
        select('::before', u('a'))
      }, /Invalid selector: `::before`/)
    })
  })

  await t.test('general', async function (t) {
    await t.test(
      'should throw for the empty string as selector',
      async function () {
        assert.throws(function () {
          select('', u('a'))
        }, /Expected rule but end of input reached/)
      }
    )

    await t.test(
      'should throw for a white-space only selector',
      async function () {
        assert.throws(function () {
          select(' ', u('a'))
        }, /Expected rule but end of input reached/)
      }
    )

    await t.test('should yield nothing if not given a node', async function () {
      assert.equal(select('*'), null)
    })

    await t.test('should yield the node if given a node', async function () {
      assert.deepEqual(select('*', u('a')), u('a'))
    })
  })

  await t.test('descendant selector', async function (t) {
    await t.test('should return the first descendant node', async function () {
      assert.deepEqual(
        select(
          'b',
          u('a', [
            u('b', {x: 1}),
            u('c', [u('b', {x: 2}), u('d', u('b', {x: 3}))])
          ])
        ),
        u('b', {x: 1})
      )
    })

    await t.test(
      'should return the given node if it matches',
      async function () {
        assert.deepEqual(select('a', u('a', {c: 1})), u('a', {c: 1}))
      }
    )

    await t.test('should return the first match', async function () {
      assert.deepEqual(
        select(
          'b',
          u('a', [
            u('b', {x: 1}, [u('b', {x: 2}), u('b', {x: 3}, [u('b', {x: 4})])])
          ])
        ),
        u('b', {x: 1}, [u('b', {x: 2}), u('b', {x: 3}, [u('b', {x: 4})])])
      )
    })

    await t.test('should return deep matches', async function () {
      assert.deepEqual(
        select('a c d', u('a', [u('b', [u('c', [u('d', [u('d')])])])])),
        u('d', [u('d')])
      )
    })
  })

  await t.test('child selector', async function (t) {
    await t.test('should return child nodes', async function () {
      assert.deepEqual(
        select('c > e', u('a', [u('b'), u('c', [u('d'), u('e', [u('f')])])])),
        u('e', [u('f')])
      )
    })

    await t.test(
      'should return matches with nested matches',
      async function () {
        assert.deepEqual(
          select(
            'b > b',
            u('a', [
              u('b', {x: 1}, [u('b', {x: 2}), u('b', {x: 3}, [u('b', {x: 4})])])
            ])
          ),
          u('b', {x: 2})
        )
      }
    )

    await t.test('should return deep matches', async function () {
      assert.deepEqual(
        select('b > c > d', u('a', [u('b', [u('c', [u('d', [u('d')])])])])),
        u('d', [u('d')])
      )
    })
  })

  await t.test('adjacent sibling selector', async function (t) {
    await t.test('should return adjacent sibling', async function () {
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
        u('b', 'Charlie')
      )
    })

    await t.test('should return nothing without matches', async function () {
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
        null
      )
    })
  })

  await t.test('general sibling selector', async function (t) {
    await t.test('should return the first adjacent sibling', async function () {
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
        u('b', 'Charlie')
      )
    })

    await t.test('should return future siblings', async function () {
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
        u('b', 'Delta')
      )
    })

    await t.test('should return nothing without matches', async function () {
      assert.equal(
        select(
          'c ~ b',
          u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('d', 'Charlie')])
        ),
        null
      )
    })
  })

  await t.test('parent-sensitive pseudo-selectors', async function (t) {
    await t.test(':first-child', async function (t) {
      await t.test('should return the first child', async function () {
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
          u('b', 'Alpha')
        )
      })

      await t.test(
        'should return nothing if nothing matches',
        async function () {
          assert.equal(
            select(
              'c:first-child',
              u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('d', 'Charlie')])
            ),
            null
          )
        }
      )
    })

    await t.test(':last-child', async function (t) {
      await t.test('should return the last child', async function () {
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
          u('d', [u('e', 'Echo')])
        )
      })

      await t.test(
        'should return nothing if nothing matches',
        async function () {
          assert.equal(
            select(
              'c:last-child',
              u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('d', 'Charlie')])
            ),
            null
          )
        }
      )
    })

    await t.test(':only-child', async function (t) {
      await t.test('should return an only child', async function () {
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
          u('b', 'Echo')
        )
      })

      await t.test(
        'should return nothing if nothing matches',
        async function () {
          assert.equal(
            select(
              'c:only-child',
              u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('d', 'Charlie')])
            ),
            null
          )
        }
      )
    })

    await t.test(':nth-child', async function (t) {
      await t.test(
        'should return the match for `:nth-child(odd)`',
        async function () {
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
            u('b', 'Alpha')
          )
        }
      )

      await t.test(
        'should return the match for `:nth-child(2n+1)`',
        async function () {
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
            u('b', 'Alpha')
          )
        }
      )

      await t.test(
        'should return the match for `:nth-child(even)`',
        async function () {
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
            u('b', 'Bravo')
          )
        }
      )

      await t.test(
        'should return the match for `:nth-child(2n+0)`',
        async function () {
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
            u('b', 'Bravo')
          )
        }
      )
    })

    await t.test(':nth-last-child', async function (t) {
      await t.test(
        'should return the last match for `:nth-last-child(odd)`',
        async function () {
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
            u('b', 'Bravo')
          )
        }
      )

      await t.test(
        'should return the last match for `:nth-last-child(2n+1)`',
        async function () {
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
            u('b', 'Bravo')
          )
        }
      )

      await t.test(
        'should return the last match for `:nth-last-child(even)`',
        async function () {
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
            u('b', 'Alpha')
          )
        }
      )

      await t.test(
        'should return the last match for `:nth-last-child(2n+0)`',
        async function () {
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
            u('b', 'Alpha')
          )
        }
      )
    })

    await t.test(':nth-of-type', async function (t) {
      await t.test(
        'should return the first match for `:nth-of-type(odd)`',
        async function () {
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
            u('b', 'Alpha')
          )
        }
      )

      await t.test(
        'should return the first match for `:nth-of-type(2n+1)`',
        async function () {
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
            u('b', 'Alpha')
          )
        }
      )

      await t.test(
        'should return the first match for `:nth-of-type(even)`',
        async function () {
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
            u('b', 'Charlie')
          )
        }
      )

      await t.test(
        'should return the first match for `:nth-of-type(2n+0)`',
        async function () {
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
            u('b', 'Charlie')
          )
        }
      )
    })

    await t.test(':nth-last-of-type', async function (t) {
      await t.test(
        'should return the last match for `:nth-last-of-type(odd)`s',
        async function () {
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
            u('b', 'Alpha')
          )
        }
      )

      await t.test(
        'should return the last match for `:nth-last-of-type(2n+1)`',
        async function () {
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
            u('b', 'Alpha')
          )
        }
      )

      await t.test(
        'should return the last match for `:nth-last-of-type(even)`',
        async function () {
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
            u('b', 'Charlie')
          )
        }
      )

      await t.test(
        'should return the last match for `:nth-last-of-type(2n+0)`',
        async function () {
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
            u('b', 'Charlie')
          )
        }
      )
    })

    await t.test(':first-of-type', async function (t) {
      await t.test(
        'should return the first match for `:first-of-type`',
        async function () {
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
            u('b', 'Alpha')
          )
        }
      )

      await t.test('should return nothing without matches', async function () {
        assert.equal(select('b:first-of-type', u('a', [])), null)
      })
    })

    await t.test(':last-of-type', async function (t) {
      await t.test(
        'should return the last match for `:last-of-type`s',
        async function () {
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
            u('b', 'Echo')
          )
        }
      )

      await t.test('should return nothing without matches', async function () {
        assert.equal(select('b:last-of-type', u('a', [])), null)
      })
    })

    await t.test(':only-of-type', async function (t) {
      await t.test('should return the only match', async function () {
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
          u('c', 'Charlie')
        )
      })

      await t.test(
        'should return nothing with too many matches',
        async function () {
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
            null
          )
        }
      )

      await t.test('should return nothing without matches', async function () {
        assert.equal(select('b:only-of-type', u('a', [])), null)
      })
    })

    await t.test(':root', async function (t) {
      await t.test('should return the given node', async function () {
        assert.deepEqual(
          select(':root', u('a', [u('b'), u('c', [u('d')])])),
          u('a', [u('b'), u('c', [u('d')])])
        )
      })
    })

    await t.test(':scope', async function (t) {
      await t.test('should return the given node', async function () {
        assert.deepEqual(
          select(':scope', u('a', [u('b'), u('c', [u('d')])])),
          u('a', [u('b'), u('c', [u('d')])])
        )
      })
    })

    await t.test(':has', async function (t) {
      await t.test('should select a node', async function () {
        assert.deepEqual(
          select('c:has(:first-child)', u('a', [u('b'), u('c', [u('d')])])),
          u('c', [u('d')])
        )
      })
    })
  })

  await t.test(':is', async function (t) {
    await t.test('should support parent-sensitive `:is`', async function () {
      assert.deepEqual(
        select('y:is(:first-child)', u('x', [u('y', 'a'), u('y', 'b')])),
        u('y', 'a')
      )
    })
  })

  await t.test(':not', async function (t) {
    await t.test('should support parent-sensitive `:not`', async function () {
      assert.deepEqual(
        select('y:not(:first-child)', u('x', [u('y', 'a'), u('y', 'b')])),
        u('y', 'b')
      )
    })
  })
})
