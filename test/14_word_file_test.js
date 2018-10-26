const { expect } = require('chai');
const path = require('path');

const WordExtractor = require('../src/word');

describe('Word file test04.doc', function() {

  const extractor = new WordExtractor();

  it('should match the expected body', function(done) {
    const extract = extractor.extract(path.resolve(__dirname, "data/test04.doc"));
    expect(extract).to.be.fulfilled;
    return extract
      .then(function(result) {
        const body = result.getBody();
        expect(body).to.match(new RegExp('Moli\\u00e8re'));
        return done();
    });
  });

  return it('should have headers and footers', function(done) {
    const extract = extractor.extract(path.resolve(__dirname, "data/test04.doc"));
    expect(extract).to.be.fulfilled;
    return extract
      .then(function(result) {
        const body = result.getHeaders();
        expect(body).to.match(new RegExp('The footer'));
        expect(body).to.match(new RegExp('Moli\\u00e8re'));
        return done();
    });
  });
});
