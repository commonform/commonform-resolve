var resolveElement = require('./element')

module.exports = function (form, path, values, numberings, headings) {
  form.content = form.content

  // resolve content
    .map(function (element, index) {
      var numbering = (
        (
          numberings &&
          numberings.hasOwnProperty('content') &&
          numberings.content.hasOwnProperty(index)
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
