'use strict'

var u = require('unist-builder')

module.exports = function() {
  return u('root', [
    u('heading', {depth: 1}, [u('text', 'Risus pretium quam!')]),
    u('heading', {depth: 2}, [u('text', 'Vitae')]),
    u('blockquote', [
      u('paragraph', [
        u('text', 'Dignissim '),
        u('emphasis', [u('text', 'cras')]),
        u('text', ' tincidunt lobortis feugiat vivamus at augue eget arcu.')
      ])
    ]),
    u('paragraph', [
      u('text', 'At '),
      u('emphasis', [
        u('text', 'risus '),
        u(
          'linkReference',
          {
            identifier: 'viverra',
            referenceType: 'shortcut'
          },
          [u('text', 'viverra')]
        )
      ]),
      u('text', ':')
    ]),
    u(
      'list',
      {
        ordered: false,
        start: null,
        loose: false
      },
      [
        u(
          'listItem',
          {
            loose: false,
            checked: null
          },
          [
            u('paragraph', [
              u('text', 'adipiscing at in tellus '),
              u('inlineCode', 'integer'),
              u('text', ';')
            ])
          ]
        ),
        u(
          'listItem',
          {
            loose: false,
            checked: null
          },
          [
            u('paragraph', [u('text', 'feugiat scelerisque varius morbi;')]),
            u(
              'list',
              {
                ordered: false,
                start: null,
                loose: false
              },
              [
                u(
                  'listItem',
                  {
                    loose: false,
                    checked: null
                  },
                  [
                    u('paragraph', [u('text', 'enim nunc?')]),
                    u(
                      'list',
                      {
                        ordered: false,
                        start: null,
                        loose: false
                      },
                      [
                        u(
                          'listItem',
                          {
                            loose: false,
                            checked: null
                          },
                          [u('paragraph', [u('text', 'yeah, whatever')])]
                        )
                      ]
                    )
                  ]
                ),
                u(
                  'listItem',
                  {
                    loose: false,
                    checked: null
                  },
                  [
                    u('paragraph', [
                      u('strong', [
                        u('text', 'Diam '),
                        u('emphasis', [u('text', 'ut')]),
                        u('text', ' venenatis!')
                      ])
                    ])
                  ]
                )
              ]
            )
          ]
        )
      ]
    ),
    u('paragraph', [u('text', 'Tellus in metus:')]),
    u(
      'list',
      {
        ordered: true,
        start: 1,
        loose: false
      },
      [
        u(
          'listItem',
          {
            loose: false,
            checked: null
          },
          [u('paragraph', [u('text', 'Vulputate eu scelerisque.')])]
        ),
        u(
          'listItem',
          {
            loose: false,
            checked: null
          },
          [
            u('paragraph', [
              u('text', 'Felis imperdiet '),
              u('inlineCode', 'proin'),
              u('text', ', fermentum leo vel orci.')
            ])
          ]
        )
      ]
    ),
    u('heading', {depth: 3}, [
      u('text', 'Et pharetra '),
      u(
        'linkReference',
        {
          identifier: 'pharetra massa',
          referenceType: 'shortcut'
        },
        [u('text', 'pharetra massa')]
      )
    ]),
    u('paragraph', [
      u('image', {
        title: null,
        src: 'http://i.imgur.com/Zp0YZTA.gif',
        alt: 'funny gif'
      })
    ]),
    u(
      'code',
      {lang: 'js'},
      'const truth = [...Array(15).keys()].reduce((x, y) => x + y);'
    ),
    u('table', {align: ['center', 'left', null]}, [
      u('tableHeader', [
        u('tableCell', [u('text', 'massa')]),
        u('tableCell', [u('text', 'ultricies')]),
        u('tableCell', [u('text', 'mi')])
      ]),
      u('tableRow', [
        u('tableCell', [u('text', 'quis hendrerit')]),
        u('tableCell', [
          u('inlineCode', 'sin'),
          u('text', ', '),
          u('inlineCode', 'cos'),
          u('text', ', '),
          u('inlineCode', 'tan')
        ]),
        u('tableCell', [u('text', 'dolor')])
      ]),
      u('tableRow', [
        u('tableCell', [u('text', 'magna eget est')]),
        u('tableCell', [u('text', 'lorem ipsum!')]),
        u('tableCell', [u('text', '15000')])
      ])
    ]),
    u('paragraph', [
      u('text', 'Consequat '),
      u(
        'linkReference',
        {
          identifier: 'interdum',
          referenceType: 'shortcut'
        },
        [u('text', 'interdum')]
      ),
      u(
        'text',
        ' varius sit amet, mattis vulputate enim nulla aliquet porttitor lacus, luctus accumsan tortor?..'
      )
    ]),
    u('heading', {depth: 2}, [u('text', 'References')]),
    u('definition', {
      identifier: 'viverra',
      title: null,
      link: 'http://lmgtfy.com/?q=viverra'
    }),
    u('definition', {
      identifier: 'pharetra mass',
      title: null,
      link: 'http://lmgtfy.com/?q=pharetra+mass'
    }),
    u('definition', {
      identifier: 'interdum',
      title: null,
      link: 'http://lmgtfy.com/?q=interdum'
    }),
    u('heading', {depth: 2}, [u('text', 'License')]),
    u('paragraph', [u('text', 'MIT')]),
    u('div', [u('div', [])])
  ])
}
