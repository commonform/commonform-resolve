var resolveForm = require('./form');

module.exports = function(form, values, numberings) {
  return resolveForm(form, values, numberings.get('summaries'));
};

module.exports.version = '0.2.0';
