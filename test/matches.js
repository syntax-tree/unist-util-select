/**
 * @typedef {import('unist').Literal} Literal
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {u} from 'unist-builder'
import {matches} from 'unist-util-select'

test('select.matches()', async function (t) {
  await t.test('should work (1)', async function () {
    assert.equal(matches('*', u('root', [])), true)
  })

  await t.test('should work (2)', async function () {
    assert.equal(matches('*', {type: 'a', children: []}), true)
  })

  await t.test('invalid selector', async function (t) {
    await t.test('should throw without selector', async function () {
      assert.throws(function () {
        // @ts-expect-error check that a runtime error is thrown.
        matches()
      }, /Error: Expected `string` as selector, not `undefined`/)
    })

    await t.test('should throw w/ invalid selector (1)', async function () {
      assert.throws(function () {
        // @ts-expect-error check that a runtime error is thrown.
        matches([], u('root', []))
      }, /Error: Expected `string` as selector, not ``/)
    })

    await t.test('should throw w/ invalid selector (2)', async function () {
      assert.throws(function () {
        matches('@supports (transform-origin: 5% 5%) {}', u('root', []))
      }, /Expected rule but "@" found/)
    })

    await t.test(
      'should throw on invalid attribute operators',
      async function () {
        assert.throws(function () {
          matches('[foo%=bar]', u('root', []))
        }, /Expected a valid attribute selector operator/)
      }
    )

    await t.test('should throw on invalid pseudo classes', async function () {
      assert.throws(function () {
        matches(':active', u('root', []))
      }, /Error: Unknown pseudo-selector `active`/)
    })

    await t.test(
      'should throw on invalid pseudo class “functions”',
      async function () {
        assert.throws(function () {
          matches(':nth-foo(2n+1)', u('root', []))
        }, /Unknown pseudo-class: "nth-foo"/)
      }
    )

    await t.test('should throw on invalid pseudo elements', async function () {
      assert.throws(function () {
        matches('::before', u('root', []))
      }, /Invalid selector: `::before`/)
    })

    await t.test(
      'should throw on nested selectors (descendant)',
      async function () {
        assert.throws(function () {
          matches('foo bar', u('root', []))
        }, /Error: Expected selector without nesting/)
      }
    )

    await t.test(
      'should throw on nested selectors (direct child)',
      async function () {
        assert.throws(function () {
          matches('foo > bar', u('root', []))
        }, /Error: Expected selector without nesting/)
      }
    )
  })

  await t.test('parent-sensitive pseudo-selectors', async function (t) {
    const simplePseudos = [
      'first-child',
      'first-of-type',
      'last-child',
      'last-of-type',
      'only-child',
      'only-of-type'
    ]

    for (const pseudo of simplePseudos) {
      await t.test('should throw on `' + pseudo + '`', async function () {
        assert.throws(function () {
          matches(':' + pseudo, u('root', []))
        }, new RegExp('Error: Cannot use `:' + pseudo + '` without parent'))
      })
    }

    const functionalPseudos = [
      'nth-child',
      'nth-last-child',
      'nth-of-type',
      'nth-last-of-type'
    ]

    for (const pseudo of functionalPseudos) {
      await t.test('should throw on `' + pseudo + '()`', async function () {
        assert.throws(function () {
          matches(':' + pseudo + '()', u('root', []))
        }, /Formula parse error/)
      })
    }
  })

  await t.test('general', async function (t) {
    await t.test('should throw on empty selectors', async function () {
      assert.throws(function () {
        matches('', u('root', []))
      }, /Expected rule but end of input reached/)
    })

    await t.test(
      'should throw for a white-space only selector',
      async function () {
        assert.throws(function () {
          matches(' ', u('root', []))
        }, /Expected rule but end of input reached/)
      }
    )

    await t.test(
      'should return `false` if not given a node',
      async function () {
        assert.ok(!matches('*'))
      }
    )

    await t.test('should return `true` if given an node', async function () {
      assert.ok(matches('*', {type: 'text', value: 'a'}))
    })
  })

  await t.test('multiple selectors', async function (t) {
    await t.test('should support a matching selector', async function () {
      assert.ok(matches('a, b', u('a')))
    })

    await t.test('should support a non-matching selector', async function () {
      assert.ok(!matches('b, c', u('a')))
    })
  })

  await t.test('tag-names: `div`, `*`', async function (t) {
    await t.test('should yield `true` for `*`', async function () {
      assert.ok(matches('*', u('a')))
    })

    await t.test('should yield `true` if types matches', async function () {
      assert.ok(matches('b', u('b')))
    })

    await t.test(
      'should yield `false` if types don’t matches',
      async function () {
        assert.ok(!matches('b', u('a')))
      }
    )
  })

  await t.test('id: `#id`', async function (t) {
    await t.test('should throw with id selector', async function () {
      assert.throws(function () {
        matches('#one', u('a'))
      }, /Error: Invalid selector: id/)
    })
  })

  await t.test('class: `.class`', async function (t) {
    await t.test('should throw with class selector', async function () {
      assert.throws(function () {
        matches('.one', u('a'))
      }, /Error: Invalid selector: class/)
    })
  })

  await t.test('attributes, existence: `[attr]`', async function (t) {
    await t.test(
      'should yield `true` if attribute exists (string)',
      async function () {
        assert.ok(matches('[foo]', u('a', {foo: 'alpha'})))
      }
    )

    await t.test(
      'should yield `true` if attribute exists (number)',
      async function () {
        assert.ok(matches('[foo]', u('a', {foo: 0})))
      }
    )

    await t.test(
      'should yield `true` if attribute exists (array)',
      async function () {
        assert.ok(matches('[foo]', u('a', {foo: []})))
      }
    )

    await t.test(
      'should yield `true` if attribute exists (object)',
      async function () {
        assert.ok(matches('[foo]', u('a', {foo: {}})))
      }
    )

    await t.test(
      'should yield `false` if attribute does not exists',
      async function () {
        assert.ok(!matches('[foo]', u('a', {bar: 'bravo'})))
      }
    )

    await t.test(
      'should yield `false` if attribute does not exists (null)',
      async function () {
        assert.ok(!matches('[foo]', u('a', {foo: null})))
      }
    )

    await t.test(
      'should yield `false` if attribute does not exists (undefined)',
      async function () {
        assert.ok(!matches('[foo]', u('a', {foo: undefined})))
      }
    )
  })

  await t.test('attributes, equality: `[attr=value]`', async function (t) {
    await t.test(
      'should yield `true` if attribute matches (string)',
      async function () {
        assert.ok(matches('[foo=alpha]', u('a', {foo: 'alpha'})))
      }
    )

    await t.test(
      'should yield `true` if attribute matches (number)',
      async function () {
        assert.ok(matches('[foo=1]', u('a', {foo: 1})))
      }
    )

    await t.test(
      'should yield `true` if attribute matches (array)',
      async function () {
        assert.ok(matches('[foo=alpha]', u('a', {foo: ['alpha']})))
      }
    )

    await t.test(
      'should yield `true` if attribute matches (array, 2)',
      async function () {
        assert.ok(
          matches('[foo="alpha,bravo"]', u('a', {foo: ['alpha', 'bravo']}))
        )
      }
    )

    await t.test(
      'should yield `true` if attribute matches (boolean, true)',
      async function () {
        assert.ok(matches('[foo=true]', u('a', {foo: true})))
      }
    )

    await t.test(
      'should yield `true` if attribute matches (boolean, false)',
      async function () {
        assert.ok(matches('[foo=false]', u('a', {foo: false})))
      }
    )

    await t.test(
      'should yield `false` if attribute is missing (null)',
      async function () {
        assert.ok(!matches('[foo=null]', u('a', {foo: null})))
      }
    )

    await t.test(
      'should yield `false` if attribute is missing (undefined)',
      async function () {
        assert.ok(!matches('[foo=undefined]', u('a', {foo: undefined})))
      }
    )

    await t.test(
      'should yield `false` if not matches (string)',
      async function () {
        assert.ok(!matches('[foo=alpha]', u('a', {foo: 'bravo'})))
      }
    )

    await t.test(
      'should yield `false` if not matches (number)',
      async function () {
        assert.ok(!matches('[foo=1]', u('a', {foo: 2})))
      }
    )

    await t.test(
      'should yield `false` if not matches (array)',
      async function () {
        assert.ok(!matches('[foo=alpha]', u('a', {foo: ['bravo']})))
      }
    )

    await t.test(
      'should yield `false` if not matches (array, 2)',
      async function () {
        assert.ok(
          !matches('[foo="alpha,bravo"]', u('a', {foo: ['charlie', 'delta']}))
        )
      }
    )

    await t.test(
      'should yield `false` if not matches (boolean, true)',
      async function () {
        assert.ok(!matches('[foo=true]', u('a', {foo: false})))
      }
    )

    await t.test(
      'should yield `false` if not matches (boolean, false)',
      async function () {
        assert.ok(!matches('[foo=false]', u('a', {foo: true})))
      }
    )
  })

  await t.test('attributes, begins: `[attr^=value]`', async function (t) {
    await t.test(
      'should yield `true` if attribute matches (string)',
      async function () {
        assert.ok(matches('[foo^=al]', u('a', {foo: 'alpha'})))
      }
    )

    await t.test(
      'should yield `false` if not matches (string)',
      async function () {
        assert.ok(!matches('[foo^=al]', u('a', {foo: 'bravo'})))
      }
    )

    await t.test(
      'should yield `false` if not string (number)',
      async function () {
        assert.ok(!matches('[foo^=1]', u('a', {foo: 1})))
      }
    )

    await t.test(
      'should yield `false` if not string (array)',
      async function () {
        assert.ok(!matches('[foo^=alpha]', u('a', {foo: ['alpha']})))
      }
    )

    await t.test(
      'should yield `false` if not string (boolean, true)',
      async function () {
        assert.ok(!matches('[foo^=true]', u('a', {foo: true})))
      }
    )

    await t.test(
      'should yield `false` if not string (boolean, false)',
      async function () {
        assert.ok(!matches('[foo^=false]', u('a', {foo: false})))
      }
    )
  })

  await t.test('attributes, ends: `[attr$=value]`', async function (t) {
    await t.test(
      'should yield `true` if attribute matches (string)',
      async function () {
        assert.ok(matches('[foo$=ha]', u('a', {foo: 'alpha'})))
      }
    )

    await t.test(
      'should yield `false` if not matches (string)',
      async function () {
        assert.ok(!matches('[foo$=ha]', u('a', {foo: 'bravo'})))
      }
    )

    await t.test(
      'should yield `false` if not string (number)',
      async function () {
        assert.ok(!matches('[foo$=1]', u('a', {foo: 1})))
      }
    )

    await t.test(
      'should yield `false` if not string (array)',
      async function () {
        assert.ok(!matches('[foo$=alpha]', u('a', {foo: ['alpha']})))
      }
    )

    await t.test(
      'should yield `false` if not string (boolean, true)',
      async function () {
        assert.ok(!matches('[foo$=true]', u('a', {foo: true})))
      }
    )

    await t.test(
      'should yield `false` if not string (boolean, false)',
      async function () {
        assert.ok(!matches('[foo$=false]', u('a', {foo: false})))
      }
    )
  })

  await t.test('attributes, contains: `[attr*=value]`', async function (t) {
    await t.test(
      'should yield `true` if attribute matches (string)',
      async function () {
        assert.ok(matches('[foo*=ph]', u('a', {foo: 'alpha'})))
      }
    )

    await t.test(
      'should yield `false` if not matches (string)',
      async function () {
        assert.ok(!matches('[foo*=ph]', u('a', {foo: 'bravo'})))
      }
    )

    await t.test(
      'should yield `false` if not string (number)',
      async function () {
        assert.ok(!matches('[foo*=1]', u('a', {foo: 1})))
      }
    )

    await t.test(
      'should yield `false` if not string (array)',
      async function () {
        assert.ok(!matches('[foo*=alpha]', u('a', {foo: ['alpha']})))
      }
    )

    await t.test(
      'should yield `false` if not string (boolean, true)',
      async function () {
        assert.ok(!matches('[foo*=true]', u('a', {foo: true})))
      }
    )

    await t.test(
      'should yield `false` if not string (boolean, false)',
      async function () {
        assert.ok(!matches('[foo*=false]', u('a', {foo: false})))
      }
    )
  })

  await t.test(
    'attributes, contains in a list: `[attr~=value]`',
    async function (t) {
      await t.test(
        'should yield `true` if attribute matches (string)',
        async function () {
          assert.ok(matches('[foo~=alpha]', u('a', {foo: 'alpha'})))
        }
      )

      await t.test(
        'should yield `true` if attribute matches (number)',
        async function () {
          assert.ok(matches('[foo~=1]', u('a', {foo: 1})))
        }
      )

      await t.test(
        'should yield `true` if attribute matches (array)',
        async function () {
          assert.ok(matches('[foo~=alpha]', u('a', {foo: ['alpha']})))
        }
      )

      await t.test(
        'should yield `true` if attribute matches (array, 2)',
        async function () {
          assert.ok(
            matches('[foo~="alpha,bravo"]', u('a', {foo: ['alpha', 'bravo']}))
          )
        }
      )

      await t.test(
        'should yield `true` if attribute matches (boolean, true)',
        async function () {
          assert.ok(matches('[foo~=true]', u('a', {foo: true})))
        }
      )

      await t.test(
        'should yield `true` if attribute matches (boolean, false)',
        async function () {
          assert.ok(matches('[foo~=false]', u('a', {foo: false})))
        }
      )

      await t.test(
        'should yield `false` if attribute is missing (null)',
        async function () {
          assert.ok(!matches('[foo~=null]', u('a', {foo: null})))
        }
      )

      await t.test(
        'should yield `false` if attribute is missing (undefined)',
        async function () {
          assert.ok(!matches('[foo~=undefined]', u('a', {foo: undefined})))
        }
      )

      await t.test(
        'should yield `false` if not matches (string)',
        async function () {
          assert.ok(!matches('[foo~=alpha]', u('a', {foo: 'bravo'})))
        }
      )

      await t.test(
        'should yield `false` if not matches (number)',
        async function () {
          assert.ok(!matches('[foo~=1]', u('a', {foo: 2})))
        }
      )

      await t.test(
        'should yield `false` if not matches (array)',
        async function () {
          assert.ok(!matches('[foo~=alpha]', u('a', {foo: ['bravo']})))
        }
      )

      await t.test(
        'should yield `false` if not matches (array, 2)',
        async function () {
          assert.ok(
            !matches(
              '[foo~="alpha,bravo"]',
              u('a', {foo: ['charlie', 'delta']})
            )
          )
        }
      )

      await t.test(
        'should yield `false` if not matches (boolean, true)',
        async function () {
          assert.ok(!matches('[foo~=true]', u('a', {foo: false})))
        }
      )

      await t.test(
        'should yield `false` if not matches (boolean, false)',
        async function () {
          assert.ok(!matches('[foo=false]', u('a', {foo: true})))
        }
      )

      await t.test(
        'should yield `true` if attribute is contained (array of strings)',
        async function () {
          assert.ok(
            matches(
              '[foo~=bravo]',
              u('a', {foo: ['alpha', 'bravo', 'charlie']})
            )
          )
        }
      )

      await t.test(
        'should yield `true` if attribute is contained (array of strings)',
        async function () {
          assert.ok(
            matches(
              '[foo~=bravo]',
              u('a', {foo: ['alpha', 'bravo', 'charlie']})
            )
          )
        }
      )

      await t.test(
        'should yield `false` if attribute is not contained (array of strings)',
        async function () {
          assert.ok(
            !matches(
              '[foo~=delta]',
              u('a', {foo: ['alpha', 'bravo', 'charlie']})
            )
          )
        }
      )

      await t.test(
        'should yield `false` if attribute is not contained (array of strings)',
        async function () {
          assert.ok(
            !matches(
              '[foo~=delta]',
              u('a', {foo: ['alpha', 'bravo', 'charlie']})
            )
          )
        }
      )
    }
  )

  await t.test('pseudo-classes', async function (t) {
    await t.test(':is', async function (t) {
      await t.test(
        'should yield `true` if any matches (type)',
        async function () {
          assert.ok(matches(':is(a, [b])', u('a')))
        }
      )

      await t.test(
        'should yield `true` if any matches (attribute)',
        async function () {
          assert.ok(matches(':is(a, [b])', u('c', {b: 1})))
        }
      )

      await t.test(
        'should yield `false` if nothing matches',
        async function () {
          assert.ok(!matches(':is(a, [b])', u('c')))
        }
      )

      await t.test('should yield `false` if children match', async function () {
        assert.ok(!matches(':is(a, [b])', u('c', [u('a')])))
      })
    })

    await t.test(':not()', async function (t) {
      await t.test(
        'should yield `false` if any matches (type)',
        async function () {
          assert.ok(!matches(':not(a, [b])', u('a')))
        }
      )

      await t.test(
        'should yield `false` if any matches (attribute)',
        async function () {
          assert.ok(!matches(':not(a, [b])', u('c', {b: 1})))
        }
      )

      await t.test('should yield `true` if nothing matches', async function () {
        assert.ok(matches(':not(a, [b])', u('c')))
      })

      await t.test('should yield `true` if children match', async function () {
        assert.ok(matches(':not(a, [b])', u('c', [u('a')])))
      })
    })

    await t.test(':has', async function (t) {
      await t.test('should throw on empty selectors', async function () {
        assert.throws(function () {
          matches('a:not(:has())', u('b'))
        }, /Expected rule but "\)" found/)
      })

      await t.test('should throw on empty selectors', async function () {
        assert.throws(function () {
          matches('a:has()', u('b'))
        }, /Expected rule but "\)" found/)
      })

      await t.test(
        'should not match the scope element (#1)',
        async function () {
          assert.ok(!matches('a:has(b)', u('a', [u('c')])))
        }
      )

      await t.test(
        'should not match the scope element (#2)',
        async function () {
          assert.ok(matches('a:has(b)', u('a', [u('b')])))
        }
      )

      await t.test(
        'should yield `true` if children match the descendant selector',
        async function () {
          assert.ok(matches('a:has(b)', u('a', [u('b')])))
        }
      )

      await t.test(
        'should yield `false` if no children match the descendant selector',
        async function () {
          assert.ok(!matches('a:has(b)', u('a', [u('c')])))
        }
      )

      await t.test(
        'should yield `true` if descendants match the descendant selector',
        async function () {
          assert.ok(matches('a:has(c)', u('a', [u('b'), u('c')])))
        }
      )

      await t.test(
        'should yield `false` if no descendants match the descendant selector',
        async function () {
          assert.ok(!matches('a:has(d)', u('a', [u('b', [u('c')])])))
        }
      )

      await t.test(
        'should support a nested next-sibling selector (#1)',
        async function () {
          assert.ok(matches('a:has(b + c)', u('a', [u('b'), u('c')])))
        }
      )

      await t.test(
        'should support a nested next-sibling selector (#2)',
        async function () {
          assert.ok(!matches('a:has(b + a)', u('a', [u('b'), u('b')])))
        }
      )

      await t.test(
        'should add `:scope` to sub-selectors (#1)',
        async function () {
          assert.ok(matches('a:has([c])', u('a', [u('b', {c: 'd'})])))
        }
      )

      await t.test(
        'should add `:scope` to sub-selectors (#2)',
        async function () {
          assert.ok(!matches('a:has([b])', u('a', {b: 'c'}, [u('d')])))
        }
      )

      await t.test(
        'should add `:scope` to all sub-selectors (#2)',
        async function () {
          assert.ok(!matches('a:has(a, :scope c)', u('a', u('b'))))
        }
      )

      await t.test(
        'should add `:scope` to all sub-selectors (#3)',
        async function () {
          assert.ok(matches('a:not(:has(b, c, d))', u('a', [])))
        }
      )

      await t.test(
        'should add `:scope` to all sub-selectors (#4)',
        async function () {
          assert.ok(matches('a:not(:has(d, e, f))', u('a', [u('b', 'c')])))
        }
      )

      await t.test('should ignore commas in parens (#1)', async function () {
        assert.ok(!matches('a:has(:is(c, d))', u('a', [u('b')])))
      })

      await t.test('should ignore commas in parens (#2)', async function () {
        assert.ok(matches('a:has(:is(b, c))', u('a', [u('b')])))
      })

      await t.test(
        'should support multiple relative selectors (#1)',
        async function () {
          assert.ok(!matches('a:has(:is(c), :is(d))', u('a', [u('b')])))
        }
      )

      await t.test(
        'should support multiple relative selectors (#2)',
        async function () {
          assert.ok(matches('a:has(:is(c), :is(b))', u('a', [u('b')])))
        }
      )

      await t.test('assertion (#1)', async function () {
        // This checks white-space.
        assert.ok(matches('a:has( b)', u('a', [u('b')])))
      })

      await t.test('assertion (#2)', async function () {
        assert.ok(matches('a:has( b  )', u('a', [u('b')])))
      })

      await t.test('assertion (#3)', async function () {
        assert.ok(matches('a:has(b )', u('a', [u('b')])))
      })

      await t.test('assertion (#4)', async function () {
        assert.ok(matches('a:has( b  ,\t p )', u('a', [u('b')])))
      })

      assert.ok(
        matches('a:has(> b)', u('a', [u('b')])),
        'should yield `true` for relative direct child selector'
      )
      assert.ok(
        !matches('a:has(> c)', u('a', [u('b', [u('c')])])),
        'should yield `false` for relative direct child selectors'
      )
      assert.ok(
        matches('a:has(> c, > b)', u('a', [u('b', [u('b')])])),
        'should support a list of relative selectors'
      )
    })

    const emptyBlankPseudos = [':empty', ':blank']

    for (const pseudo of emptyBlankPseudos) {
      await t.test(pseudo, async function (t) {
        await t.test('should yield `true` for void node', async function () {
          assert.ok(matches(pseudo, u('a')))
        })

        await t.test(
          'should yield `true` for parent without children',
          async function () {
            assert.ok(matches(pseudo, u('a', [])))
          }
        )

        await t.test(
          'should yield `false` for falsey literal',
          async function () {
            assert.ok(!matches(pseudo, u('a', '')))
          }
        )

        await t.test('should yield `false` if w/ nodes', async function () {
          assert.ok(!matches(pseudo, u('a', [u('b')])))
        })

        await t.test('should yield `false` if w/ literal', async function () {
          assert.ok(!matches(pseudo, u('a', 'b')))
        })
      })
    }

    await t.test(':root', function () {
      assert.ok(matches(':root', u('a')))
    })

    await t.test(':scope', function () {
      assert.ok(matches(':scope', u('a')))
    })
  })
})
