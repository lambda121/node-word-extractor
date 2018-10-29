const chai = require('chai');
const { expect } = chai;

const path = require('path');

const WordExtractor = require('../src/word');

describe('Word file test03.doc', function() {
  const extractor = new WordExtractor();

  return it('should match the expected body', function(done) {
    const extract = extractor.extract(
      path.resolve(__dirname, 'data/test03.doc')
    );
    expect(extract).to.be.fulfilled;
    return extract.then(function(result) {
      const body = result.getBody();
      expect(body).to.match(new RegExp('Can You Release Commercial Works\\?'));
      expect(body).to.match(new RegExp('Apache v2\\.0'));
      expect(body).to.match(new RegExp('you want your protections to be\\.'));
      return done();
    });
  });
});
