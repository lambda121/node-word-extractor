const { expect } = require('chai');
const path = require('path');

const WordExtractor = require('../src/word');

describe('Word file test12.doc', function() {

  const extractor = new WordExtractor();

  return it('should match the expected body', () =>
    extractor.extract(path.resolve(__dirname, "data/test12.doc"))
      .then(function(result) {
        const body = result.getBody();
        return expect(body).to.match(/Row 2, cell 3/);
    })
  );
});
