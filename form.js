var resolveElement = require('./element')

module.exports = function(form, path, values, numberings, headings) {
  form.content = form.content
    .map(function(element, index) {
      var numbering = (
        ( numberings &&
          numberings.hasOwnProperty('content') &&
          numberings.content.hasOwnProperty(index) ) ?
        numberings.content[index] : null )
      var childPath = path.concat('content', index)
      return resolveElement(
        element, childPath,
        values, numbering, headings) })

  return form }
