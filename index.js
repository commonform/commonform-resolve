var number = require('commonform-number')
var resolveForm = require('./form')

function commonformResolve(form, values) {
  var numberings = number(form)
  return resolveForm(
    form,
    [ ],
    values,
    numberings.form,
    numberings.headings
  ) }

module.exports = commonformResolve
