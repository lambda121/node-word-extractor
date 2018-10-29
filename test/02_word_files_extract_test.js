const chai = require('chai');
const { expect } = chai;

const fs = require('fs');
const path = require('path');

const WordExtractor = require('../src/word');
const Document = require('../src/document');

const testWordFile = file =>
  describe(`Word file ${file}`, function() {
    const extractor = new WordExtractor();

    it('should extract a document successfully', () => {
      const extract = extractor.extract(
        path.resolve(__dirname, `data/${file}`)
      );
      expect(extract).to.be.fulfilled;
      return extract.then(result => {
        expect(result).to.be.an.instanceof(Document);
        expect(result.pieces).to.be.instanceof(Array);
        expect(result.boundaries).to.contain.keys([
          'fcMin',
          'ccpText',
          'ccpFtn',
          'ccpHdd',
          'ccpAtn',
        ]);
      });
    });
  });

const files = fs.readdirSync(path.resolve(__dirname, 'data'));
files.filter(function(file) {
  if (/\.doc$/i.test(file)) {
    return testWordFile(file);
  }
});
