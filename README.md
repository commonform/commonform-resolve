```javascript
var resolve = require('commonform-resolve')
```

Passes strings through:

```javascript
var assert = require('assert')

assert.deepEqual(
  resolve(
    { content: [ 'A' ] },
    { }),
  { content: [ 'A' ] })
```

Converts term uses to strings:

```javascript
assert.deepEqual(
  resolve(
    { content: [ { use: 'A' } ] },
    { }),
  { content: [ 'A' ] })
```

Passes definitions through:

```javascript
assert.deepEqual(
  resolve(
    { content: [ { definition: 'A' } ] },
    { } ),
  { content: [ { definition: 'A' } ] })
```

Replaces blanks with provided values, or a blank when none are provided:

```javascript
assert.deepEqual(
  resolve(
    { content: [ { blank: 'A' } ] },
    { A: '1' }),
  { content: [ '1' ] })

assert.deepEqual(
  resolve(
    { content: [ { blank: 'A' } ] },
    { }),
  { content: [ { blank: 'A' } ] })
```

Replaces references with the numberings of target forms:

```javascript
assert.deepEqual(
  resolve(
    { content: [
      { heading: 'A',
        form: { content: [ 'A' ] } },
      { reference: 'A' } ] },
    { })
    .content[1],
  { heading: 'A',
    numbering: [
      { series:  { number: 1, of: 1 },
        element: { number: 1, of: 1 } } ] })

```

Indicates broken references:

```javascript
assert.deepEqual(
  resolve(
    { content: [ { reference: 'A' } ] },
    { }),
  { content: [ { heading: 'A', broken: true } ] })

```

Flags ambiguous references with the numberings of all potential target forms:

```javascript
assert.deepEqual(
  resolve(
    { content: [
      { heading: 'A',
        form: { content: [ 'A' ] } },
      { heading: 'A',
        form: { content: [ 'A' ] } },
      { reference: 'A' } ] },
    { })
    .content[2],
    { heading: 'A',
      ambiguous: true,
      numberings: [
        [ { series:  { number: 1, of: 1 },
            element: { number: 1, of: 2 } } ],
        [ { series:  { number: 1, of: 1 },
            element: { number: 2, of: 2 } } ] ] } )

```

Concatenates strings and contiguous objects that are resolved to strings:

```javascript
assert.deepEqual(
  resolve({ content: [ 'A', { use: 'B' } ] }, { }).content,
  [ 'AB' ])

assert.deepEqual(
  resolve({ content: [ { use: 'A' }, 'B' ] }, { }).content,
  [ 'AB' ])

```

Preserves conspicuous formatting flags:

```javascript
assert.deepEqual(
  resolve(
    { content: [
      { heading: 'First',
        form: {
          content: [ 'test' ],
          conspicuous: 'true' } } ] },
    { })
    .content,
  [ { heading: 'First',
      form: {
        content: [ 'test' ],
        conspicuous: 'true'},
      numbering: [
        { series:  { number: 1, of: 1 },
          element: { number: 1, of: 1 } } ] } ])

```

Throws on invalid content:

```javascript
assert.throws(
  function() {
    resolve(
      { content: [ { invalid: 'object' } ] },
      { }) },
  /Invalid content/)
```

Attaches numberings to form objects:

```javascript
assert.deepEqual(
  resolve(
    { content: [ { form: { content: [ 'test' ] } } ] },
    { })
    .content,
    [ { numbering: [
          { series:  { number: 1, of: 1 },
            element: { number: 1, of: 1 } } ],
        form: { content: [ 'test' ] } } ])
```
