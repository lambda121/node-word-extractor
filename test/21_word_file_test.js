const { expect } = require('chai');
const path = require('path');

const WordExtractor = require('../src/word');

describe('Word file test11.doc', function() {
  const extractor = new WordExtractor();

  return it('should match the expected body', function(done) {
    const extract = extractor.extract(
      path.resolve(__dirname, 'data/test11.doc')
    );
    expect(extract).to.be.fulfilled;
    return extract
      .then(function(result) {
        const body = result.getBody();
        expect(body).to.match(
          /This is a test for parsing the Word file in node/
        );
        return done();
      })
      .catch(err => done(err));
  });
});
