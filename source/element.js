var Immutable = require('immutable');
var predicate = require('commonform-predicate');
var resolve;

module.exports = function(element, values, numbering, summaries) {
  resolve = resolve || require('./form');
  if (predicate.text(element)) {
    return element;
  } else if (predicate.use(element)) {
    return element.get('use');
  } else if (predicate.subForm(element)) {
    return element.withMutations(function(element) {
      element.set('numbering', numbering.get('numbering'));
      element.set(
        'form',
        resolve(
          element.get('form'),
          values,
          numbering.get('form', null),
          summaries
        )
      );
    });
  } else if (predicate.definition(element)) {
    return element;
  } else if (predicate.reference(element)) {
    var summary = element.get('reference');
    // Resolvable
    if (summaries.has(summary)) {
      var matches = summaries.get(summary);
      // Unambiguous
      if (matches.count() === 1) {
        return Immutable.Map({
          reference: matches.first()
        });
      // Ambiguous
      } else {
        return Immutable.Map({
          ambiguous: true,
          numberings: matches,
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
