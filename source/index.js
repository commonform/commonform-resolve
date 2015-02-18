var resolve = require('./resolve');
var number = require('./numberings');

module.exports = function(form, values) {
  // Number sub-forms and compile a map from summary to numbering.
  var numberings = number(form);

  // Resolve content.
  return resolve(form, values, numberings.get('summaries'));
};

module.exports.version = '0.1.2';
