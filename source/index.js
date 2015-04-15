var clone = require('clone');
var number = require('commonform-number');
var resolveForm = require('./form');

module.exports = function(form, values) {
  var numberings = number(form);
  return resolveForm(
    clone(form),
    values,
    numberings.form,
    numberings.headings
  );
};

module.exports.version = '1.0.0-rc1';
