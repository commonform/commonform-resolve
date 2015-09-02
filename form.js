var resolveElement = require('./element')

module.exports = function(form, values, numberings, headings) {
  form.content = form.content
    .map(function(element, index) {
      var numbering = (
        ( numberings &&
          numberings.hasOwnProperty('content') &&
          numberings.content.hasOwnProperty(index) ) ?
        numberings.content[index] : null )
      return resolveElement(element, values, numbering, headings) })

  return form }
