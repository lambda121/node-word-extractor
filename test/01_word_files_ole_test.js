const chai = require('chai');
const { expect } = chai;

const fs = require('fs');
const path = require('path');
const { Buffer } = require('buffer');

const oleDoc = require('../src/ole-doc').OleCompoundDoc;

const testWordFile = file =>
  describe(`Word file ${file}`, function() {
    it('can be opened correctly', function(done) {
      const filename = path.resolve(__dirname, `data/${file}`);
      const doc = new oleDoc(filename);
      doc.on('err', err => done(err));
      doc.on('ready', () => done());
      return doc.read();
    });

    return it('generates a valid Word stream', function(done) {
      const filename = path.resolve(__dirname, `data/${file}`);
      const doc = new oleDoc(filename);
      doc.on('err', err => done(err));
      doc.on('ready', function() {
        const chunks = [];
        const stream = doc.stream('WordDocument');
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('error', error => done(error));
        return stream.on('end', function() {
          const buffer = Buffer.concat(chunks);
          const magicNumber = buffer.readUInt16LE(0);
          expect(magicNumber.toString(16)).to.equal('a5ec');
          return done();
        });
      });
      return doc.read();
    });
  });

const files = fs.readdirSync(path.resolve(__dirname, 'data'));
files.filter(function(file) {
  if (/\.doc$/i.test(file)) {
    return testWordFile(file);
  }
});
