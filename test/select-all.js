import assert from 'node:assert/strict'
import test from 'node:test'
import {u} from 'unist-builder'
import {selectAll} from 'unist-util-select'

test('select.selectAll()', async function (t) {
  await t.test('invalid selectors', async function (t) {
    await t.test('should throw without selector', async function () {
      assert.throws(function () {
        // @ts-expect-error check that a runtime error is thrown.
        selectAll()
      }, /Error: Expected `string` as selector, not `undefined`/)
    })

    await t.test('should throw w/ invalid selector (1)', async function () {
      assert.throws(function () {
        // @ts-expect-error check that a runtime error is thrown.
        selectAll([], u('a'))
      }, /Error: Expected `string` as selector, not ``/)
    })

    await t.test('should throw w/ invalid selector (2)', async function () {
      assert.throws(function () {
        selectAll('@supports (transform-origin: 5% 5%) {}', u('a'))
      }, /Expected rule but "@" found/)
    })

    await t.test(
      'should throw on invalid attribute operators',
      async function () {
        assert.throws(function () {
          selectAll('[foo%=bar]', u('a'))
        }, /Expected a valid attribute selector operator/)
      }
    )

    await t.test('should throw on invalid pseudo classes', async function () {
      assert.throws(function () {
        selectAll(':active', u('a'))
      }, /Error: Unknown pseudo-selector `active`/)
    })

    await t.test(
      'should throw on invalid pseudo class “functions”',
      async function () {
        assert.throws(function () {
          selectAll(':nth-foo(2n+1)', u('a'))
        }, /Unknown pseudo-class/)
      }
    )

    await t.test('should throw on invalid pseudo elements', async function () {
      assert.throws(function () {
        selectAll('::before', u('a'))
      }, /Invalid selector: `::before`/)
    })
  })

  await t.test('general', async function (t) {
    await t.test(
      'should throw for the empty string as selector',
      async function () {
        assert.throws(function () {
          selectAll('', u('a'))
        }, /Expected rule but end of input reached/)
      }
    )

    await t.test(
      'should throw for a white-space only selector',
      async function () {
        assert.throws(function () {
          selectAll(' ', u('a'))
        }, /Expected rule but end of input reached/)
      }
    )

    await t.test('should yield nothing if not given a node', async function () {
      assert.deepEqual(selectAll('*'), [])
    })

    await t.test('should yield the node if given a node', async function () {
      assert.deepEqual(selectAll('*', u('a')), [u('a')])
    })
  })

  await t.test('descendant selector', async function (t) {
    await t.test('should return descendant nodes', async function () {
      assert.deepEqual(
        selectAll(
          'b',
          u('a', [
            u('b', 'Alpha'),
            u('c', [u('b', 'Bravo'), u('d', u('b', 'Charlie'))])
          ])
        ),
        [u('b', 'Alpha'), u('b', 'Bravo'), u('b', 'Charlie')]
      )
    })

    await t.test(
      'should return the given node if it matches',
      async function () {
        assert.deepEqual(selectAll('a', u('a', 'Alpha')), [u('a', 'Alpha')])
      }
    )

    await t.test(
      'should return matches with nested matches',
      async function () {
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
          ]
        )
      }
    )

    await t.test('should return deep matches', async function () {
      assert.deepEqual(
        selectAll('b c d', u('a', [u('b', [u('c', [u('d', [u('d')])])])])),
        [u('d', [u('d')]), u('d')]
      )
    })

    await t.test('should not match outside other matches', async function () {
      assert.deepEqual(
        selectAll(
          'b c',
          u('a', [u('b', [u('c', '1')]), u('d', [u('c', '2')])])
        ),
        [u('c', '1')]
      )
    })
  })

  await t.test('child selector', async function (t) {
    await t.test('should return child nodes', async function () {
      assert.deepEqual(
        selectAll(
          'c > d',
          u('a', [
            u('b', {x: 1}),
            u('c', [u('b', {x: 2}), u('d', [u('b', {x: 3})])])
          ])
        ),
        [u('d', [u('b', {x: 3})])]
      )
    })

    await t.test(
      'should return matches with nested matches',
      async function () {
        assert.deepEqual(
          selectAll(
            'b > b',
            u('a', [
              u('b', {x: 1}, [u('b', {x: 2}), u('b', {x: 3}, [u('b', {x: 4})])])
            ])
          ),
          [u('b', {x: 2}), u('b', {x: 3}, [u('b', {x: 4})]), u('b', {x: 4})]
        )
      }
    )

    await t.test('should return deep matches', async function () {
      assert.deepEqual(
        selectAll('b > c > d', u('a', [u('b', [u('c', [u('d', [u('d')])])])])),
        [u('d', [u('d')])]
      )
    })
  })

  await t.test('adjacent sibling selector', async function (t) {
    await t.test('should return adjacent sibling', async function () {
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
        [u('b', 'Charlie')]
      )
    })

    await t.test('should return nothing without matches', async function () {
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
        []
      )
    })
  })

  await t.test('general sibling selector', async function (t) {
    await t.test('should return adjacent sibling', async function () {
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
        [u('b', 'Charlie'), u('b', 'Delta')]
      )
    })

    await t.test('should return future siblings', async function () {
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
        [u('b', 'Delta')]
      )
    })

    await t.test('should return nothing without matches', async function () {
      assert.deepEqual(
        selectAll(
          'c ~ b',
          u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('d', 'Charlie')])
        ),
        []
      )
    })
  })

  await t.test('parent-sensitive pseudo-selectors', async function (t) {
    await t.test(':first-child', async function (t) {
      await t.test('should return all `:first-child`s (1)', async function () {
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
          [u('b', 'Alpha'), u('b', 'Echo')]
        )
      })

      await t.test('should return all `:first-child`s (2)', async function () {
        assert.deepEqual(
          selectAll(
            'b:first-child',
            u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('b', 'Charlie')])
          ),
          [u('b', 'Alpha')]
        )
      })

      await t.test(
        'should return nothing if nothing matches',
        async function () {
          assert.deepEqual(
            selectAll(
              'h1:first-child',
              u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('b', 'Charlie')])
            ),
            []
          )
        }
      )
    })

    await t.test(':last-child', async function (t) {
      await t.test('should return all `:last-child`s (1)', async function () {
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
          [u('d', [u('b', 'Echo')]), u('b', 'Echo')]
        )
      })

      await t.test('should return all `:last-child`s (2)', async function () {
        assert.deepEqual(
          selectAll(
            'b:last-child',
            u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('b', 'Charlie')])
          ),
          [u('b', 'Charlie')]
        )
      })

      await t.test(
        'should return nothing if nothing matches',
        async function () {
          assert.deepEqual(
            selectAll(
              'h1:last-child',
              u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('b', 'Charlie')])
            ),
            []
          )
        }
      )
    })

    await t.test(':only-child', async function (t) {
      await t.test('should return all `:only-child`s', async function () {
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
          [u('b', 'Echo')]
        )
      })

      await t.test(
        'should return nothing if nothing matches',
        async function () {
          assert.deepEqual(
            selectAll(
              'c:only-child',
              u('a', [u('b', 'Alpha'), u('c', 'Bravo'), u('b', 'Charlie')])
            ),
            []
          )
        }
      )
    })

    await t.test(':nth-child', async function (t) {
      await t.test('should return all `:nth-child(odd)`s', async function () {
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
          [u('b', 'Alpha'), u('b', 'Charlie'), u('b', 'Echo')]
        )
      })

      await t.test('should return all `:nth-child(2n+1)`s', async function () {
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
          [u('b', 'Alpha'), u('b', 'Charlie'), u('b', 'Echo')]
        )
      })

      await t.test('should return all `:nth-child(even)`s', async function () {
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
          [u('b', 'Bravo'), u('b', 'Delta'), u('b', 'Foxtrot')]
        )
      })

      await t.test('should return all `:nth-child(2n+0)`s', async function () {
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
          [u('b', 'Bravo'), u('b', 'Delta'), u('b', 'Foxtrot')]
        )
      })
    })

    await t.test(':nth-last-child', async function (t) {
      await t.test(
        'should return all `:nth-last-child(odd)`s',
        async function () {
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
            [u('b', 'Bravo'), u('b', 'Delta'), u('b', 'Foxtrot')]
          )
        }
      )

      await t.test(
        'should return all `:nth-last-child(2n+1)`s',
        async function () {
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
            [u('b', 'Bravo'), u('b', 'Delta'), u('b', 'Foxtrot')]
          )
        }
      )

      await t.test(
        'should return all `:nth-last-child(even)`s',
        async function () {
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
            [u('b', 'Alpha'), u('b', 'Charlie'), u('b', 'Echo')]
          )
        }
      )

      await t.test(
        'should return all `:nth-last-child(2n+0)`s',
        async function () {
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
            [u('b', 'Alpha'), u('b', 'Charlie'), u('b', 'Echo')]
          )
        }
      )
    })

    await t.test(':nth-of-type', async function (t) {
      await t.test('should return all `:nth-of-type(odd)`s', async function () {
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
          [u('b', 'Alpha'), u('b', 'Echo')]
        )
      })

      await t.test(
        'should return all `:nth-of-type(2n+1)`s',
        async function () {
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
            [u('b', 'Alpha'), u('b', 'Echo')]
          )
        }
      )

      await t.test(
        'should return all `:nth-of-type(even)`s',
        async function () {
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
            [u('b', 'Charlie')]
          )
        }
      )

      await t.test(
        'should return all `:nth-of-type(2n+0)`s',
        async function () {
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
            [u('b', 'Charlie')]
          )
        }
      )
    })

    await t.test(':nth-last-of-type', async function (t) {
      await t.test(
        'should return all `:nth-last-of-type(odd)`s',
        async function () {
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
            [u('b', 'Alpha'), u('b', 'Echo')]
          )
        }
      )

      await t.test(
        'should return all `:nth-last-of-type(2n+1)`s',
        async function () {
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
            [u('b', 'Alpha'), u('b', 'Echo')]
          )
        }
      )

      await t.test(
        'should return all `:nth-last-of-type(even)`s',
        async function () {
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
            [u('b', 'Charlie')]
          )
        }
      )

      await t.test(
        'should return all `:nth-last-of-type(2n+0)`s',
        async function () {
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
            [u('b', 'Charlie')]
          )
        }
      )
    })

    await t.test(':first-of-type', async function (t) {
      await t.test('should return all `:first-of-type`s', async function () {
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
          [u('b', 'Alpha')]
        )
      })

      await t.test('should return nothing without matches', async function () {
        assert.deepEqual(selectAll('b:first-of-type', u('a', [])), [])
      })
    })

    await t.test(':last-of-type', async function (t) {
      await t.test('should return all `:last-of-type`s', async function () {
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
          [u('b', 'Echo')]
        )
      })

      await t.test('should return nothing without matches', async function () {
        assert.deepEqual(selectAll('b:last-of-type', u('a', [])), [])
      })
    })

    await t.test(':only-of-type', async function (t) {
      await t.test('should return the only type', async function () {
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
          [u('c', 'Charlie')]
        )
      })

      await t.test(
        'should return nothing with too many matches',
        async function () {
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
            []
          )
        }
      )

      await t.test('should return nothing without matches', async function () {
        assert.deepEqual(selectAll('b:only-of-type', u('a', [])), [])
      })
    })

    await t.test(':root', async function (t) {
      await t.test('should return the given node', async function () {
        assert.deepEqual(
          selectAll(':root', u('a', [u('b'), u('c', [u('d')])])),
          [u('a', [u('b'), u('c', [u('d')])])]
        )
      })
    })

    await t.test(':scope', async function (t) {
      await t.test('should return the given node', async function () {
        assert.deepEqual(
          selectAll(':scope', u('a', [u('b'), u('c', [u('d')])])),
          [u('a', [u('b'), u('c', [u('d')])])]
        )
      })
    })

    await t.test(':has', async function (t) {
      await t.test('should select a node', async function () {
        assert.deepEqual(
          selectAll('c:has(:first-child)', u('a', [u('b'), u('c', [u('d')])])),
          [u('c', [u('d')])]
        )
      })
    })
  })

  await t.test(':is', async function (t) {
    await t.test('should support parent-sensitive `:is`', async function () {
      assert.deepEqual(
        selectAll('y:is(:first-child)', u('x', [u('y', 'a'), u('y', 'b')])),
        [u('y', 'a')]
      )
    })
  })

  await t.test(':not', async function (t) {
    await t.test('should support parent-sensitive `:not`', async function () {
      assert.deepEqual(
        selectAll('y:not(:first-child)', u('x', [u('y', 'a'), u('y', 'b')])),
        [u('y', 'b')]
      )
    })
  })
})
