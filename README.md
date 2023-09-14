# commonform-resolve

resolve definitions, uses, references, fields, and blanks

```javascript
var resolve = require('commonform-resolve')
```

Passes strings through:

```javascript
var assert = require('assert')

assert.deepStrictEqual(
  resolve(
    { content: [ 'A' ] },
    {}
  ),
  { content: [ 'A' ] }
)
```

Passes term uses through:

```javascript
assert.deepStrictEqual(
  resolve(
    { content: [ { use: 'A' } ] },
    {}
  ),
  { content: [ { use: 'A' } ] }
)
```

Passes definitions through:

```javascript
assert.deepStrictEqual(
  resolve(
    { content: [ { definition: 'A' } ] },
    {}
  ),
  { content: [ { definition: 'A' } ] }
)
```

Provides blank values:

```javascript
assert.deepStrictEqual(
  resolve(
    { content: [ { blank: 'A' } ] },
    [ { blank: [ 'content', 0 ], value: '1' } ]
  ),
  { content: [ { blank: '1' } ] }
)

assert.deepStrictEqual(
  resolve(
    { content: [ { blank: '' } ] },
    []
  ),
  { content: [ { blank: undefined } ] }
)
```

Replaces references with the numberings of target forms:

```javascript
assert.deepStrictEqual(
  resolve(
    {
      content: [
        {
          heading: 'A',
          form: { content: [ 'A' ] }
        },
        { reference: 'A' }
      ]
    },
    {}
  )
  .content[1],
  {
    heading: 'A',
    numbering: [
      {
        series: { number: 1, of: 1 },
        element: { number: 1, of: 1 }
      }
    ]
  }
)
```

Indicates broken references:

```javascript
assert.deepStrictEqual(
  resolve(
    { content: [ { reference: 'A' } ] },
    {}
  ),
  { content: [ { heading: 'A', broken: true } ] }
)
```

Flags ambiguous references with the numberings of all potential target forms:

```javascript
assert.deepStrictEqual(
  resolve(
    {
      content: [
        {
          heading: 'A',
          form: { content: [ 'A' ] }
        },
        {
          heading: 'A',
          form: { content: [ 'A' ] }
        },
        { reference: 'A' }
      ]
    },
    {}
  )
  .content[2],
  {
    heading: 'A',
    ambiguous: true,
    numberings: [
      [
        {
          series: { number: 1, of: 1 },
          element: { number: 1, of: 2 }
        }
      ],
      [
        {
          series: { number: 1, of: 1 },
          element: { number: 2, of: 2 }
        }
      ]
    ]
  }
)
```

Preserves conspicuous formatting flags:

```javascript
assert.deepStrictEqual(
  resolve(
    {
      content: [
        {
          heading: 'First',
          form: {
            content: [ 'test' ],
            conspicuous: 'true'
          }
        }
      ]
    },
    {}
  )
  .content,
  [
    {
      heading: 'First',
      form: {
        content: [ 'test' ],
        conspicuous: 'true'
      },
      numbering: [
        {
          series: { number: 1, of: 1 },
          element: { number: 1, of: 1 }
        }
      ]
    }
  ]
)
```

Attaches numberings to form objects:

```javascript
assert.deepStrictEqual(
  resolve(
    { content: [ { form: { content: [ 'test' ] } } ] },
    {}
  )
  .content,
  [
    {
      numbering: [
        {
          series: { number: 1, of: 1 },
          element: { number: 1, of: 1 }
        }
      ],
      form: { content: [ 'test' ] }
    }
  ]
)
```

Attaches numberings to component objects:

```javascript
assert.deepStrictEqual(
  resolve(
    {
      content: [
        {
          component: 'https://example.com/component',
          version: '1.0.0',
          substitutions: { terms: {}, headings: {} }
        }
      ]
    },
    {}
  )
  .content,
  [
    {
      component: 'https://example.com/component',
      version: '1.0.0',
      substitutions: { terms: {}, headings: {} },
      numbering: [
        {
          series: { number: 1, of: 1 },
          element: { number: 1, of: 1 }
        }
      ]
    }
  ]
)
```
