/* jshint mocha: true */
var expect = require('chai').expect;
var number = require('commonform-number');
var resolve = require('..');

var A_FORM = {
  content:['A']};

var A_NUMBERINGS = number(A_FORM);

describe('resolution', function() {
  it('returns a map', function() {
    expect(
      resolve(A_FORM, {}, A_NUMBERINGS)
    ).to.be.an('object');
  });

  describe('of strings', function() {
    it('passes them through', function() {
      expect(
        resolve(A_FORM, {}, A_NUMBERINGS).content
      ).to.eql(['A']);
    });
  });

  describe('of term uses', function() {
    it('converts them to text', function() {
      var form = {content: [{use: 'A'}]};
      expect(
        resolve(form, {}, number(form)).content
      ).to.eql(['A']);
    });
  });

  describe('of term definitions', function() {
    it('passes them through', function() {
      var form = {content: [{definition: 'A'}]};
      expect(
        resolve(form, {}, number(form)).content
      ).to.eql([{definition: 'A'}]);
    });
  });

  describe('of blanks', function() {
    it('replaces them with their values', function() {
      var form = {content: [{blank: 'A'}]};
      expect(
        resolve(form, {A: '1'}, number(form)).content
      ).to.eql(['1']);
    });

    describe('without values', function() {
      it('replaces them with a blank', function() {
        var form = {content: [{blank: 'A'}]};
        expect(
          resolve(form, {}, number(form)).content
        ).to.eql([{blank: 'A'}]);
      });
    });
  });

  describe('of references', function() {
    it('replaces headings with numberings', function() {
      var form = {
        content: [
          {
            heading: 'A',
            form: A_FORM
          },
          {reference: 'A'}]};
      var numbering = [{
        series: {number: 1, of: 1},
        element: {number: 1, of: 1}}];
      expect(
        resolve(form, {}, number(form)).content[1]
      ).to.eql({reference: numbering});
    });

    describe('to non-existent provisions', function() {
      it('marks them broken', function() {
        var form = {
          content: [
            {reference: 'A'}]};
        expect(
          resolve(form, {}, number(form)).content
        ).to.eql([
          {
            reference: 'A',
            broken: true}]);
      });
    });

    describe('to multiple provisions', function() {
      it('flags them ambiguous', function() {
        var form = {
          content: [
            {
              heading: 'A',
              form: A_FORM},
            {
              heading: 'A',
              form: A_FORM},
            {reference: 'A'}]
        };
        expect(
          resolve(form, {}, number(form)).content[2]
        ).to.eql({
          reference: 'A',
          ambiguous: true,
          numberings: [
            [
              {
                series: {number: 1, of: 1},
                element: {number: 1, of: 2}}],
            [
              {
                series: {number: 1, of: 1},
                element: {number: 2, of: 2}}]]});
      });
    });
  });

  describe('concatenation', function() {
    it('handles [...string, object...]', function() {
      var form = {
        content: ['A', {use: 'B'}]};
      expect(
        resolve(form, {}, number(form)).content
      ).to.eql(['AB']);
    });

    it('handles [...object, string...]', function() {
      var form = {
        content: [{use: 'A'}, 'B']};
      expect(
        resolve(form, {}, number(form)).content
      ).to.eql(['AB']);
    });
  });

  it('preserves conspicuous flags', function() {
    var form = {
      content: [
        {
          heading: 'First',
          form: {
            content: ['test'],
            conspicuous: 'true'}}]};
    expect(
      resolve(form, {}, number(form)).content
    ).to.eql([{
      heading: 'First',
      form: {
        content: ['test'],
        conspicuous: 'true'},
      numbering: [
        {
          series: {number: 1, of: 1},
          element: {number: 1, of: 1}}]}]);
  });

  it('errors on invalid content', function() {
    var form = {
      content: [
        {invalid: 'object'}]};
    expect(function() {
      resolve(form, {}, number(form));
    }).to.throw(/Invalid content/);
  });

  describe('numberings', function() {
    it('are attached to forms', function() {
      var form = {
        content: [
          {
            form: {
              content: ['test']}}]};
      expect(
        resolve(form, {}, number(form)).content
      ).to.eql([{
        numbering: [
          {
            series: {number: 1, of: 1},
            element: {number: 1, of: 1}}],
        form: {
          content: ['test']}}]);
    });
  });
});
