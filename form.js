var resolveElement = require('./element')

module.exports = function(form, values, numberings, headings) {
  form.content = form.content
    // resolve content
    .map(function(element, index) {
      var numbering = (
        ( numberings &&
          numberings.hasOwnProperty('content') &&
          numberings.content.hasOwnProperty(index) ) ?
        numberings.content[index] : null )
      return resolveElement(element, values, numbering, headings) })

    // Concatenate contiguous strings.
    .reduce(
      function(content, element, index) {
        var count = content.length
        var last = content[count - 1]
        if (
          index > 0 &&
          typeof element === 'string' &&
          typeof last === 'string')
        { content[count - 1] = last + element }
        else {
          content.push(element) }
        return content },
      [])

  return form }
