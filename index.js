var validation = require('commonform-validation');

var isString = function(argument) {
  return typeof argument === 'string';
};

var isSubForm = function(argument) {
  return argument.hasOwnProperty('form');
};

var compileContent;

var compileElement = function(element, values, summaryNumberings) {
  /* istanbul ignore else */

  // String
  if (typeof element === 'string') {
    return element;

  // Term use
  } else if (validation.isUse(element)) {
    return element.use;

  // Sub-form
  } else if (isSubForm(element)) {
    element.form.content = compileContent(element.form.content);
    return element;

  // Definition
  } else if (validation.isDefinition(element)) {
    return element;

  // Reference
  } else if (validation.isReference(element)) {
    var summary = element.reference;

    // Resolvable
    if (summaryNumberings.hasOwnProperty(summary)) {
      var numberings = summaryNumberings[summary];

      // Unambiguous
      if (numberings.length === 1) {
        return {
          reference: summaryNumberings[summary][0]
        };

      // Ambiguous
      } else {
        return {
          ambiguous: true,
          numberings: numberings,
          reference: summary
        };
      }

    // Broken
    } else {
      element.broken = true;
      return element;
    }

  // Field
  } else if (validation.isField(element)) {
    var field = element.field;
    if (values.hasOwnProperty(field)) {
      return values[field];
    } else {
      return {
        blank: field
      };
    }
  } else {
    throw new Error('Invalid content: ' + JSON.stringify(element));
  }
};

compileContent = function(content, values, summaryNumberings) {
  return content
    // Compile content
    .reduce(function(content, e) {
      var compiled = compileElement(e, values, summaryNumberings);
      return content.concat(compiled);
    }, [])

    // Concatenate contiguous strings.
    .reduce(function(content, element, index) {
      var length = content.length;
      var last = content[length - 1];
      if (index > 0 && isString(element) && isString(last)) {
        content[length - 1] = last + element;
        return content;
      } else {
        return content.concat(element);
      }
    }, []);
};

var number = function(content, summaryNumberings, numbering) {
  var seriesNumber = 0;
  var elementCounts = [null];

  content.forEach(function(element, index, array) {
    if (isSubForm(element)) {
      var newNumbering;

      // Part of a previously started series
      if (index > 0 && isSubForm(array[index - 1])) {
        ++elementCounts[seriesNumber];
        newNumbering = numbering.concat({
          series: {number: seriesNumber},
          element: {number: elementCounts[seriesNumber]}
        });

      // New series
      } else {
        elementCounts.push(1);
        seriesNumber++;
        newNumbering = numbering.concat({
          series: {number: seriesNumber},
          element: {number: 1}
        });
      }

      element.numbering = newNumbering;

      // Save summary-to-numbering mapping
      if (element.hasOwnProperty('summary')) {
        var summary = element.summary;
        if (!summaryNumberings.hasOwnProperty(summary)) {
          summaryNumberings[summary] = [newNumbering];
        } else {
          summaryNumberings[summary].push(newNumbering);
        }
      }
    }
  });

  // Add .of to .series and .element
  content.forEach(function(element) {
    if (element.hasOwnProperty('numbering')) {
      var numbering = element.numbering;
      var last = numbering[numbering.length - 1];
      var series = last.series.number;
      last.series.of = seriesNumber;
      last.element.of = elementCounts[series];
    }
  });

  return summaryNumberings;
};

module.exports = function(project) {
  if (!validation.isProject(project)) {
    throw new Error('Invalid project');
  }

  var values = project.values;
  var topContent = project.form.content;

  // Number sub-forms and compile a map from summary to numbering.
  var numberings = number(topContent, {}, []);

  // Compile content.
  project.form.content = compileContent(topContent, values, numberings);

  return project;
};
