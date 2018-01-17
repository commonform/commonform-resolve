var predicate = require('commonform-predicate')
var deepEqual = require('deep-equal')
var resolve

module.exports = function (element, path, values, numbering, headings) {
  resolve = resolve || require('./form')

  if (predicate.text(element)) {
    return element
  } else if (predicate.use(element)) {
    return element
  } else if (predicate.child(element)) {
    element.numbering = numbering.numbering
    element.form = resolve(
      element.form,
      path.concat('form'),
      values,
      numbering.form || {
        ended: true,
        parent: numbering
      },
      headings
    )
    return element
  } else if (predicate.definition(element)) {
    return element
  } else if (predicate.reference(element)) {
    var heading = element.reference
    // Resolvable
    if (headings.hasOwnProperty(heading)) {
      var matches = headings[heading]
      // Unambiguous
      if (matches.length === 1) {
        return {
          heading: heading,
          numbering: matches[0]
        }
      // Ambiguous
      } else {
        var maxNearness = 0
        var closestMatches = matches
          .map(function (match) {
            var nearness = headingNearness(
              numbering.ended
                ? numbering.parent.numbering
                : numbering.content[
                  Object.keys(numbering.content)[0]
                ].numbering.slice(0, -1),
              match
            )
            if (nearness > maxNearness) {
              maxNearness = nearness
            }
            return {
              nearness: nearness,
              match: match
            }
          })
          .filter(function (element) {
            return element.nearness === maxNearness
          })
        if (closestMatches.length === 1) {
          return {
            heading: heading,
            ambiguous: true,
            nearest: closestMatches[0].match,
            numberings: matches
          }
        } else {
          return {
            ambiguous: true,
            heading: heading,
            numberings: matches
          }
        }
      }
    // Broken
    } else {
      delete element.reference
      element.heading = heading
      element.broken = true
      return element
    }
  } else if (predicate.blank(element)) {
    var text = value(path, values)
    // Filled
    if (text) {
      return {blank: text}
    // Empty
    } else {
      return {blank: undefined}
    }
  } else {
    throw new Error('Invalid content: ' + JSON.stringify(element))
  }
}

function value (path, values) {
  var length = values.length
  for (var index = 0; index < length; index++) {
    var element = values[index]
    if (deepEqual(element.blank, path)) {
      return element.value
    }
  }
}

function headingNearness (reference, heading) {
  var returned = 0.0
  var prefixLength = Math.min(reference.length, heading.length)
  for (var index = 0; index < prefixLength; index++) {
    if (deepEqual(reference[index], heading[index])) {
      returned += 1.0
    } else if (
      deepEqual(
        reference[index].series,
        heading[index].series
      )
    ) {
      returned += 0.5
      break
    } else {
      break
    }
  }
  return returned
}
