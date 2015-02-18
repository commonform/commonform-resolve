/* jshint mocha: true */
var Immutable = require('immutable');
var expect = require('chai').expect;
var resolve = require('..');

var A_FORM = {content:['A']};

var xOfy = function(x, y) {
  return {number: x, of: y};
};

var form = function(content) {
  return Immutable.fromJS({
    content: content
  });
};

var noValues = Immutable.Map();

describe('resolve', function() {
  it('returns an immputable map', function() {
    expect(Immutable.Map.isMap(resolve(form(['A']), noValues)))
      .to.be.true();
  });

  describe('of strings', function() {
    it('passes them through', function() {
      expect(resolve(form(['A']), noValues).get('content').toJS())
        .to.eql(['A']);
    });
  });

  describe('of term uses', function() {
    it('converts them to text', function() {
      expect(resolve(form([{use: 'A'}]), noValues).get('content').toJS())
        .to.eql(['A']);
    });
  });

  describe('of term definitions', function() {
    it('passes them through', function() {
      expect(resolve(
        form([{definition: 'A'}]), noValues
      ).get('content').toJS())
        .to.eql([{definition: 'A'}]);
    });
  });

  describe('of fields', function() {
    it('replaces them with their values', function() {
      expect(resolve(
        form([{field: 'A'}]),
        Immutable.Map({A: '1'})
      ).get('content').toJS())
        .to.eql(['1']);
    });

    describe('without values', function() {
      it('replaces them with a blank', function() {
        expect(resolve(
          form([{field: 'A'}]),
          noValues
        ).get('content').toJS())
          .to.eql([{blank: 'A'}]);
      });
    });
  });

  describe('of references', function() {
    it('replaces summaries with numberings', function() {
      var numbering = [{series: xOfy(1, 1), element: xOfy(1, 1)}];
      expect(resolve(
        form([
          {summary: 'A', form: A_FORM},
          {reference: 'A'}
        ]),
        noValues
      ).get('content').get(1).toJS())
        .to.eql({reference: numbering});
    });

    describe('to non-existent provisions', function() {
      it('marks them broken', function() {
        expect(resolve(
          form([{reference: 'A'}]),
          noValues
        ).get('content').toJS())
          .to.eql([{reference: 'A', broken: true}]);
      });
    });

    describe('to multiple provisions', function() {
      it('flags them ambiguous', function() {
        expect(resolve(
          form([
            {summary: 'A', form: A_FORM},
            {summary: 'A', form: A_FORM},
            {reference: 'A'}
          ]),
          noValues
        ).get('content').get(2).toJS())
          .to.eql({
            reference: 'A',
            ambiguous: true,
            numberings: [
              [{series: xOfy(1, 1), element: xOfy(1, 2)}],
              [{series: xOfy(1, 1), element: xOfy(2, 2)}]
            ]
          });
      });
    });
  });

  it('concatenates strings and objects resolved to string', function() {
    expect(resolve(
      form(['A', {use: 'B'}]),
      noValues
    ).get('content').toJS())
      .to.eql(['AB']);
    expect(resolve(
      form([{use: 'A'}, 'B']),
      noValues
    ).get('content').toJS())
      .to.eql(['AB']);
  });

  it('preserves conspicuous flags', function() {
    expect(resolve(
      form([{
        summary: 'First',
        form: {content: ['test'],
        conspicuous: 'true'}
      }]),
      noValues
    ).get('content').toJS())
      .to.eql([{
        summary: 'First',
        form: {
          content: ['test'],
          conspicuous: 'true'
        }
      }]);
  });

  it('errors on invalid content', function() {
    expect(function() {
      resolve(
        form([{invalid: 'object'}]),
        noValues
      );
    })
      .to.throw(/Invalid content/);
  });
});
