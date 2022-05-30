var deepEqual = require('deep-equal')
var has = require('has')
var number = require('commonform-number')
var predicate = require('commonform-predicate')

module.exports = function commonformResolve (form, values) {
  var numberings = number(form)
  return resolveForm(
    form,
    [],
    values,
    numberings.form,
    numberings.headings
  )
}

function resolveForm (form, path, values, numberings, headings) {
  form.content = form.content

    // resolve content
    .map(function (element, index) {
      var numbering = (
        (
          numberings &&
          has(numberings, 'content') &&
          has(numberings.content, index)
        )
          ? numberings.content[index]
          : null
      )
      var childPath = path.concat('content', index)
      return resolveElement(
        element,
        childPath,
        values,
        numbering,
        headings
      )
    })

    // Concatenate contiguous strings.
    .reduce(function (content, element, index) {
      var count = content.length
      var last = content[count - 1]
      if (
        index > 0 &&
        typeof element === 'string' &&
        typeof last === 'string'
      ) {
        content[count - 1] = last + element
      } else {
        content.push(element)
      }
      return content
    }, [])

  return form
}

function resolveElement (element, path, values, numbering, headings) {
  if (predicate.text(element)) {
    return element
  } else if (predicate.use(element)) {
    return element
  } else if (predicate.child(element)) {
    element.numbering = numbering.numbering
    element.form = resolveForm(
      element.form,
      path.concat('form'),
      values,
      numbering.form || null,
      headings
    )
    return element
  } else if (predicate.component(element)) {
    element.numbering = numbering.numbering
    return element
  } else if (predicate.definition(element)) {
    return element
  } else if (predicate.reference(element)) {
    var heading = element.reference
    // Resolvable
    if (has(headings, heading)) {
      var matches = headings[heading]
      // Unambiguous
      if (matches.length === 1) {
        return {
          heading: heading,
          numbering: matches[0]
        }
      // Ambiguous
      } else {
        return {
          ambiguous: true,
          heading: heading,
          numberings: matches
        }
      }
    // Broken
    } else {
      delete element.reference
      element.heading = heading
      element.broken = true
      return element
    }
  } else if (predicate.blank(element)) {
    var text = value(path, values)
    // Filled
    if (text) {
      return { blank: text }
    // Empty
    } else {
      return { blank: undefined }
    }
  } else {
    throw new Error('Invalid content: ' + JSON.stringify(element))
  }
}

function value (path, values) {
  var length = values.length
  for (var index = 0; index < length; index++) {
    var element = values[index]
    if (deepEqual(element.blank, path)) {
      return element.value
    }
  }
}
