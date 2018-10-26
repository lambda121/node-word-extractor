const { expect } = require('chai');
const path = require('path');

const WordExtractor = require('../src/word');

describe('Word file test06.doc', function() {

  const extractor = new WordExtractor();

  return it('should match the expected body', function(done) {
    const extract = extractor.extract(path.resolve(__dirname, "data/test06.doc"));
    expect(extract).to.be.fulfilled;
    return extract
      .then(function(result) {
        const body = result.getBody();
        expect(body).to.match(new RegExp('Insert interface name here'));
        expect(body).to.match(new RegExp('M\\u00e9thodes appel\\u00e9es'));
        return done();
    });
  });
});
