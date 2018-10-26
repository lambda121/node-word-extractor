const { expect } = require('chai');
const path = require('path');

const WordExtractor = require('../src/word');

describe('Word file test09.doc', function() {
  const extractor = new WordExtractor();

  return it('should match the expected body', function(done) {
    const extract = extractor.extract(path.resolve(__dirname, "data/test09.doc"));
    expect(extract).to.be.fulfilled;
    return extract
      .then(function(result) {
        const body = result.getBody();
        expect(body).to.match(new RegExp('This line gets read fine'));
        expect(body).to.match(new RegExp('Ooops, where are the \\( opening \\( brackets\\?'));
        return done();
    });
  });
});
