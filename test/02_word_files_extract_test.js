//---------//
// Imports //
//---------//

const { expect } = require('chai')

const fs = require('fs')
const path = require('path')

const extract = require('../src/extract')
const Document = require('../src/document')

//
//------//
// Main //
//------//

fs.readdirSync(path.resolve(__dirname, 'data'))
  .filter(file => /\.doc$/i.test(file))
  .forEach(file => testWordFile(file))

//
//------------------//
// Helper Functions //
//------------------//

function testWordFile(file) {
  const filePath = path.resolve(__dirname, `data/${file}`),
    buffer = fs.readFileSync(filePath)

  describe(`Word file ${file}`, () => {
    it('fromFile - should extract a document successfully', () => {
      return extract.fromFile(filePath).then(testDoc)
    })

    it('fromBuffer - should extract a document successfully', () => {
      return extract.fromBuffer(buffer).then(testDoc)
    })
  })
}

function testDoc(doc) {
  expect(doc).to.be.an.instanceof(Document)
  expect(doc.pieces).to.be.instanceof(Array)
  expect(doc.boundaries).to.contain.keys([
    'fcMin',
    'ccpText',
    'ccpFtn',
    'ccpHdd',
    'ccpAtn',
  ])
}
