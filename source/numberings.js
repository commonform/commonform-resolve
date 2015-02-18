var Immutable = require('immutable');
var groupSeries = require('commonform-group-series');

var map = Immutable.Map.bind(Immutable);
var list = Immutable.List.bind(Immutable);

var numberings = function(form, results, keyArray, numbering) {
  var seriesNumber = 0;
  var elementIndex = 0;

  // Group content element into paragraphs and series.
  var groups = groupSeries(form);

  // Count series, to provide X of Y numberings later.
  var seriesCount = groups
    .filter(function(group) {
      return group.get('type') === 'series';
    })
    .count();

  // Generate path-to-numbering and summary-to-numbering mappings.
  return groups.reduce(function(results, group) {
    if (group.get('type') !== 'series') {
      elementIndex += group.get('content').count();
      return results;
    } else {
      seriesNumber = seriesNumber + 1;
      var content = group.get('content');
      return content.reduce(function(results, subForm, subFormIndex) {
        var elementKeyArray = keyArray.push('content', elementIndex++);
        var elementNumbering = numbering.push(map({
          series: map({
            number: seriesNumber,
            of: seriesCount
          }),
          element: map({
            number: subFormIndex + 1,
            of: content.count()
          })
        }));
        // Recurse with the sub-form.
        return numberings(
          subForm.get('form'),
          results.withMutations(function(results) {
            // Store numbering in the form tree.
            results.setIn(elementKeyArray, elementNumbering);
            // If the sub-form has a summary, store its numbering in
            // relation to that summary, too.
            if (subForm.has('summary')) {
              var summary = subForm.get('summary');
              var summaryKeyArray = ['summaries', summary];
              results.updateIn(summaryKeyArray, function(numberings) {
                // The value may be a list, to reflect multiple uses of
                // a single summary.
                return numberings ?
                  numberings.push(elementNumbering) :
                  list([elementNumbering]);
              });
            }
          }),
          elementKeyArray,
          elementNumbering
        );
      }, results);
    }
  }, results);
};

var resultTemplate = map({
  form: map(),
  summaries: map()
});

module.exports = function(form) {
  return numberings(form, resultTemplate, list(['form']), list());
};
