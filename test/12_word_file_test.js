const chai = require('chai');
const { expect } = chai;

const path = require('path');

const WordExtractor = require('../src/word');

describe('Word file test02.doc', function() {
  const extractor = new WordExtractor();

  return it('should match the expected body', function(done) {
    const extract = extractor.extract(
      path.resolve(__dirname, 'data/test02.doc')
    );
    expect(extract).to.be.fulfilled;
    return extract.then(function(result) {
      const body = result.getBody();
      expect(body).to.match(new RegExp('My name is Ryan'));
      expect(body).to.match(
        new RegExp('create several FKPs for testing purposes')
      );
      expect(body).to.match(new RegExp('dsadasdasdasd'));
      return done();
    });
  });
});
