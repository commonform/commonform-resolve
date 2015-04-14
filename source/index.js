var clone = require('clone');
var resolveForm = require('./form');

module.exports = function(form, values, numberings) {
  return resolveForm(
    clone(form),
    values,
    numberings.form,
    numberings.headings
  );
};

module.exports.version = '1.0.0-rc1';
