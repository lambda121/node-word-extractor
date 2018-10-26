const path = require('path');

const WordExtractor = require('../src/index');

describe('Checking block from files', function() {
  const extractor = new WordExtractor();

  it('should extract a .doc document successfully', done =>
    extractor.extract(path.resolve(__dirname, "data/test01.doc"))
      .then(() => done())
  );

  return it('should extract a .docx document successfully', done =>
    extractor.extract(path.resolve(__dirname, "data/test13.docx"))
      .then(() => done())
  );
});
