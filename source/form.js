var Immutable = require('immutable');
var emptyList = Immutable.List();

var resolveElement = require('./element');

module.exports = function(form, values, numbering, headings) {
  var out = form.update('content', function(content) {
    return content
      // resolve content
      .map(function(element, index) {
        return resolveElement(
          element,
          values,
          numbering ? numbering.getIn(['content', index], null) : null,
          headings
        );
      })

      // Concatenate contiguous strings.
      .reduce(function(content, element, index) {
        var count = content.count();
        var last = content.last();
        if (
          index > 0 &&
          typeof element === 'string' &&
          typeof last === 'string'
        ) {
          return content.set(count - 1, last + element);
        } else {
          return content.push(element);
        }
      }, emptyList);
  });
  return out;
};
