/* jshint mocha: true */
var Immutable = require('immutable');
var expect = require('chai').expect;
var number = require('../source/numberings');

var A = {form: {content:['A']}};
var B = {form: {content:['A']}};

var xOfy = function(x, y) {
  return {number: x, of: y};
};

var makeForm = function(content) {
  return Immutable.fromJS({
    content: content
  });
};

describe('numberings', function() {
  it('returns an immutable map', function() {
    expect(Immutable.Map.isMap(number(makeForm(['test']))))
      .to.be.true();
  });

  it('numbers sub-forms', function() {
    expect(number(makeForm(['blah', A, B])).toJS())
      .to.eql({
        form: {
          content: {
            1: [{series: xOfy(1, 1), element: xOfy(1, 2)}],
            2: [{series: xOfy(1, 1), element: xOfy(2, 2)}]
          }
        },
        summaries: {}
      });
  });

  it('numbers non-contiguous series', function() {
    expect(number(makeForm([A, 'blah', B])).toJS())
      .to.eql({
        form: {
          content: {
            0: [{series: xOfy(1, 2), element: xOfy(1, 1)}],
            2: [{series: xOfy(2, 2), element: xOfy(1, 1)}]
          }
        },
        summaries: {}
      });
  });

  it('maps summaries to numberings', function() {
    var numbering = [{series: xOfy(1, 1), element: xOfy(1, 1)}];
    expect(number(makeForm([{
      summary: 'A',
      form: {
        content: ['text']
      }
    }])).toJS())
      .to.eql({
        form: {
          content: {
            0: numbering
          }
        },
        summaries: {
          A: [numbering]
        }
      });
  });
});
