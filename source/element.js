var Immutable = require('immutable');
var predicate = require('commonform-predicate');
var resolve;

module.exports = function(element, values, summaryNumberings) {
  resolve = resolve || require('./resolve');
  if (predicate.text(element)) {
    return element;
  } else if (predicate.use(element)) {
    return element.get('use');
  } else if (predicate.subForm(element)) {
    return element.update('form', function(form) {
      return resolve(form, values, summaryNumberings);
    });
  } else if (predicate.definition(element)) {
    return element;
  } else if (predicate.reference(element)) {
    var summary = element.get('reference');
    // Resolvable
    if (summaryNumberings.has(summary)) {
      var numberings = summaryNumberings.get(summary);
      // Unambiguous
      if (numberings.count() === 1) {
        return Immutable.Map({
          reference: numberings.first()
        });
      // Ambiguous
      } else {
        return Immutable.Map({
          ambiguous: true,
          numberings: numberings,
          reference: summary
        });
      }
    // Broken
    } else {
      return element.merge({broken: true});
    }
  } else if (predicate.field(element)) {
    var field = element.get('field');
    if (values.has(field)) {
      return values.get(field);
    } else {
      return Immutable.Map({
        blank: field
      });
    }
  } else {
    throw new Error('Invalid content: ' + JSON.stringify(element));
  }
};
