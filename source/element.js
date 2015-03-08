var Immutable = require('immutable');
var predicate = require('commonform-predicate');
var resolve;

module.exports = function(element, values, numbering, headings) {
  resolve = resolve || require('./form');
  if (predicate.text(element)) {
    return element;
  } else if (predicate.use(element)) {
    return element.get('use');
  } else if (predicate.inclusion(element)) {
    return element.withMutations(function(element) {
      element.set('numbering', numbering.get('numbering'));
      element.set(
        'inclusion',
        resolve(
          element.get('inclusion'),
          values,
          numbering.get('inclusion', null),
          headings
        )
      );
    });
  } else if (predicate.definition(element)) {
    return element;
  } else if (predicate.reference(element)) {
    var heading = element.get('reference');
    // Resolvable
    if (headings.has(heading)) {
      var matches = headings.get(heading);
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
          reference: heading
        });
      }
    // Broken
    } else {
      return element.merge({broken: true});
    }
  } else if (predicate.insertion(element)) {
    var value = element.get('insertion');
    if (values.has(value)) {
      return values.get(value);
    } else {
      return Immutable.Map({
        blank: value
      });
    }
  } else {
    throw new Error('Invalid content: ' + JSON.stringify(element));
  }
};
