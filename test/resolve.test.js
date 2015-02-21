/* jshint mocha: true */
var Immutable = require('immutable');
var expect = require('chai').expect;
var number = require('commonform-number');
var resolve = require('..');

var xofy = function(x, y) {
  return {number: x, of: y};
};

var immutableForm = function(content) {
  return Immutable.fromJS({content: content});
};

var noValues = Immutable.Map();

var A_FORM = {content:['A']};
var justAForm = immutableForm(['A']);
var justANumberings = number(justAForm);

describe('resolve', function() {
  it('returns an immputable map', function() {
    expect(
      Immutable.Map.isMap(
        resolve(justAForm, noValues, justANumberings)))
      .to.be.true();
  });

  describe('of strings', function() {
    it('passes them through', function() {
      expect(
        resolve(justAForm, noValues, justANumberings)
          .get('content').toJS())
        .to.eql(['A']);
    });
  });

  describe('of term uses', function() {
    it('converts them to text', function() {
      var form = immutableForm([{use: 'A'}]);
      expect(
        resolve(form, noValues, number(form))
          .get('content').toJS())
        .to.eql(['A']);
    });
  });

  describe('of term definitions', function() {
    it('passes them through', function() {
      var form = immutableForm([{definition: 'A'}]);
      expect(
        resolve(form, noValues, number(form))
          .get('content').toJS())
        .to.eql([{definition: 'A'}]);
    });
  });

  describe('of fields', function() {
    it('replaces them with their values', function() {
      var form = immutableForm([{field: 'A'}]);
      expect(
        resolve(form, Immutable.Map({A: '1'}), number(form))
          .get('content').toJS())
        .to.eql(['1']);
    });

    describe('without values', function() {
      it('replaces them with a blank', function() {
        var form = immutableForm([{field: 'A'}]);
        expect(
          resolve(form, noValues, number(form))
            .get('content').toJS())
          .to.eql([{blank: 'A'}]);
      });
    });
  });

  describe('of references', function() {
    it('replaces summaries with numberings', function() {
      var form = immutableForm([
        {summary: 'A', form: A_FORM},
        {reference: 'A'}]);
      var numbering = [{series: xofy(1, 1), element: xofy(1, 1)}];
      expect(
        resolve(form, noValues, number(form))
          .get('content').get(1).toJS())
        .to.eql({reference: numbering});
    });

    describe('to non-existent provisions', function() {
      it('marks them broken', function() {
        var form = immutableForm([{reference: 'A'}]);
        expect(
          resolve(form, noValues, number(form))
            .get('content').toJS())
          .to.eql([{reference: 'A', broken: true}]);
      });
    });

    describe('to multiple provisions', function() {
      it('flags them ambiguous', function() {
        var form = immutableForm([
          {summary: 'A', form: A_FORM},
          {summary: 'A', form: A_FORM},
          {reference: 'A'}]);
        expect(
          resolve(form, noValues, number(form))
            .get('content').get(2).toJS())
          .to.eql({
            reference: 'A',
            ambiguous: true,
            numberings: [
              [{series: xofy(1, 1), element: xofy(1, 2)}],
              [{series: xofy(1, 1), element: xofy(2, 2)}]]});
      });
    });
  });

  describe('concatenation', function() {
    it('handles [...string, object...]', function() {
      var form = immutableForm(['A', {use: 'B'}]);
      expect(
        resolve(form, noValues, number(form))
          .get('content').toJS())
        .to.eql(['AB']);
    });

    it('handles [...object, string...]', function() {
      var form = immutableForm([{use: 'A'}, 'B']);
      expect(
        resolve(form, noValues, number(form))
          .get('content').toJS())
        .to.eql(['AB']);
    });
  });

  it('preserves conspicuous flags', function() {
    var form = immutableForm([{
      summary: 'First',
      form: {content: ['test'],
      conspicuous: 'true'}}]);
    expect(
      resolve(form, noValues, number(form))
        .get('content').toJS())
      .to.eql([{
        summary: 'First',
        form: {
          content: ['test'],
          conspicuous: 'true'},
        numbering: [
          {series: {number: 1, of: 1}, element: {number: 1, of: 1}}]}]);
  });

  it('errors on invalid content', function() {
    var form = immutableForm([{invalid: 'object'}]);
    expect(function() {
      resolve(form, noValues, number(form));
    })
      .to.throw(/Invalid content/);
  });

  describe('numberings', function() {
    it('are attached to forms', function() {
      var form = immutableForm([{form: {content: ['test']}}]);
      expect(
        resolve(form, noValues, number(form))
          .get('content').toJS())
        .to.eql([{
          numbering: [
            {series: {number: 1, of: 1}, element: {number: 1, of: 1}}],
          form: {
            content: ['test']}}]);
    });
  });
});
