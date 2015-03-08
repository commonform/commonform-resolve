var resolveForm = require('./form');

module.exports = function(form, values, numberings) {
  return resolveForm(
    form,
    values,
    numberings.get('form'),
    numberings.get('headings')
  );
};

module.exports.version = '0.2.1';
