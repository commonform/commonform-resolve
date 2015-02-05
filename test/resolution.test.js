/* jshint mocha: true */
var expect = require('chai').expect;
var resolve = require('..');

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
      resolve({});
    }).to.throw('Invalid project');
  });

  describe('of strings', function() {
    it('passes them through', function() {
      expect(resolve(testProject(['A'])).form.content)
        .to.eql(['A']);
    });
  });

  describe('of term uses', function() {
    it('converts them to text', function() {
      expect(resolve(testProject([{use: 'A'}])).form.content)
        .to.eql(['A']);
    });
  });

  describe('of term definitions', function() {
    it('passes them through', function() {
      expect(resolve(testProject([{definition: 'A'}])).form.content)
        .to.eql([{definition: 'A'}]);
    });
  });

  describe('of fields', function() {
    it('replaces them with their values', function() {
      expect(resolve(testProject([{field: 'A'}], {A:'1'})).form.content)
        .to.eql(['1']);
    });

    describe('without values', function() {
      it('replaces them with a blank', function() {
        expect(resolve(testProject([{field: 'A'}])).form.content)
          .to.eql([{blank:'A'}]);
      });
    });
  });

  describe('of references', function() {
    it('replaces summaries with numberings', function() {
      var numbering = [{series: xOfy(1, 1), element: xOfy(1, 1)}];
      expect(resolve(testProject([
        {summary: 'A', form: A_FORM},
        {reference: 'A'}
      ])).form.content[1])
        .to.eql({reference: numbering});
    });

    describe('to non-existent provisions', function() {
      it('marks them broken', function() {
        expect(resolve(testProject([{reference: 'A'}])).form.content)
          .to.eql([{reference: 'A', broken: true}]);
      });
    });

    describe('to multiple provisions', function() {
      it('flags them ambiguous', function() {
        expect(resolve(testProject([
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
    expect(resolve(testProject(['A', {use: 'B'}])).form.content)
      .to.eql(['AB']);
    expect(resolve(testProject([{use: 'A'}, 'B'])).form.content)
      .to.eql(['AB']);
  });

  it('preserves conspicuous flags', function() {
    expect(resolve(testProject([
      {summary: 'First', form: {content: ['test'], conspicuous: 'true'}}
    ])).form.content)
      .to.eql([{
        summary: 'First',
        form: {
          content: ['test'],
          conspicuous: 'true'
        },
        numbering: [{series: xOfy(1, 1), element: xOfy(1, 1)}]
      }]);
  });

  describe('numbers', function() {
    it('sub-forms without summaries', function() {
      expect(resolve(testProject([
        {summary: 'First', form: A_FORM},
        {
          form:{
            content: [
              {summary: 'First Inner', form: A_FORM},
              {summary: 'Last Inner', form: A_FORM}
            ]
          }
        },
        {summary: 'Last', form: A_FORM}
      ])).form.content)
        .to.eql([
          {
            summary: 'First',
            form: A_FORM,
            numbering: [{series: xOfy(1, 1), element: xOfy(1, 3)}]
          },
          {
            numbering: [{series: xOfy(1, 1), element: xOfy(2, 3)}],
            form: {
              content: [
                {
                  summary: 'First Inner',
                  form: A_FORM,
                  numbering: [
                    {series: xOfy(1, 1), element: xOfy(2, 3)},
                    {series: xOfy(1, 1), element: xOfy(1, 2)}
                  ]
                },
                {
                  summary: 'Last Inner',
                  form: A_FORM,
                  numbering: [
                    {series: xOfy(1, 1), element: xOfy(2, 3)},
                    {series: xOfy(1, 1), element: xOfy(2, 2)}
                  ]
                }
              ]
            }
          },
          {
            summary: 'Last',
            form: A_FORM,
            numbering: [{series: xOfy(1, 1), element: xOfy(3, 3)}]
          }
        ]);
    });
  });
});
