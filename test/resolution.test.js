/* jshint mocha: true */
var expect = require('chai').expect;
var compile = require('..');

var A_FORM = {content:['A']};

var xOfy = function(x, y) {
  return {number: x, of: y};
};

var testProject = function(content, values) {
  values = values || {};
  return {
    commonform: '0.0.1',
    form: {content: content},
    metadata: {title:'Test'},
    preferences: {},
    values: values
  };
};

describe('compilation', function() {
  it('requires a valid project', function() {
    expect(function() {
      compile({});
    }).to.throw('Invalid project');
  });

  describe('of strings', function() {
    it('passes them through', function() {
      expect(compile(testProject(['A'])).form.content)
        .to.eql(['A']);
    });
  });

  describe('of term uses', function() {
    it('converts them to text', function() {
      expect(compile(testProject([{use: 'A'}])).form.content)
        .to.eql(['A']);
    });
  });

  describe('of term definitions', function() {
    it('passes them through', function() {
      expect(compile(testProject([{definition: 'A'}])).form.content)
        .to.eql([{definition: 'A'}]);
    });
  });

  describe('of fields', function() {
    it('replaces them with their values', function() {
      expect(compile(testProject([{field: 'A'}], {A:'1'})).form.content)
        .to.eql(['1']);
    });

    describe('without values', function() {
      it('replaces them with a blank', function() {
        expect(compile(testProject([{field: 'A'}])).form.content)
          .to.eql([{blank:'A'}]);
      });
    });
  });

  describe('of references', function() {
    it('replaces summaries with numberings', function() {
      var numbering = [{series: xOfy(1, 1), element: xOfy(1, 1)}];
      expect(compile(testProject([
        {summary: 'A', form: A_FORM},
        {reference: 'A'}
      ])).form.content[1])
        .to.eql({reference: numbering});
    });

    describe('to non-existent provisions', function() {
      it('marks them broken', function() {
        expect(compile(testProject([{reference: 'A'}])).form.content)
          .to.eql([{reference: 'A', broken: true}]);
      });
    });

    describe('to multiple provisions', function() {
      it('flags them ambiguous', function() {
        expect(compile(testProject([
          {summary: 'A', form: A_FORM},
          {summary: 'A', form: A_FORM},
          {reference: 'A'}
        ])).form.content[2])
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
    expect(compile(testProject(['A', {use: 'B'}])).form.content)
      .to.eql(['AB']);
    expect(compile(testProject([{use: 'A'}, 'B'])).form.content)
      .to.eql(['AB']);
  });

  describe('numbers', function() {
    it('sub-forms without summaries', function() {
      expect(compile(testProject([
        {summary: 'A', form: A_FORM},
        {form: A_FORM},
        {summary: 'A', form: A_FORM}
      ])).form.content)
        .to.eql([
          {
            summary: 'A',
            form: A_FORM,
            numbering: [{series: xOfy(1, 1), element: xOfy(1, 3)}]
          },
          {
            form: A_FORM,
            numbering: [{series: xOfy(1, 1), element: xOfy(2, 3)}]
          },
          {
            summary: 'A',
            form: A_FORM,
            numbering: [{series: xOfy(1, 1), element: xOfy(3, 3)}]
          }
        ]);
    });
  });
});
