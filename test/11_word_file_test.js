const chai = require('chai');
const { expect } = chai;

const path = require('path');

const WordExtractor = require('../src/word');

describe('Word file test01.doc', function() {

  const extractor = new WordExtractor();

  return it('should match the expected body', function(done) {
    const extract = extractor.extract(path.resolve(__dirname, "data/test01.doc"));
    expect(extract).to.be.fulfilled;
    return extract
      .then(function(result) {
        const body = result.getBody();
        expect(body).to.match(new RegExp('Welcome to BlogCFC'));
        expect(body).to.match(new RegExp('http://lyla\\.maestropublishing\\.com/'));
        expect(body).to.match(new RegExp('You must use the IDs\\.'));
        return done();
    });
  });
});
