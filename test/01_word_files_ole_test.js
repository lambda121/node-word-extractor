//---------//
// Imports //
//---------//

const { expect } = require('chai')
const fs = require('fs')
const path = require('path')
const { Buffer } = require('buffer')

const createOleCompoundDoc = require('../src/create-ole-compound-doc')

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
    it('fromFile - can be opened correctly', done => {
      const doc = createOleCompoundDoc.fromFile(filePath)

      testDocOpen(doc, done)
    })

    it('fromFile - generates a valid Word stream', done => {
      const doc = createOleCompoundDoc.fromFile(filePath)

      testDocWordStream(doc, done)
    })

    it('fromBuffer - can be opened correctly', done => {
      const doc = createOleCompoundDoc.fromBuffer(buffer)

      testDocOpen(doc, done)
    })

    it('fromBuffer - generates a valid Word stream', done => {
      const doc = createOleCompoundDoc.fromBuffer(buffer)

      testDocWordStream(doc, done)
    })
  })
}

function testDocOpen(doc, done) {
  doc.on('err', err => done(err))
  doc.on('ready', () => done())

  return doc.read()
}

function testDocWordStream(doc, done) {
  doc.on('err', err => done(err))
  doc.on('ready', () => {
    const chunks = []
    const stream = doc.stream('WordDocument')
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('error', error => done(error))
    return stream.on('end', function() {
      const buffer = Buffer.concat(chunks)
      const magicNumber = buffer.readUInt16LE(0)
      expect(magicNumber.toString(16)).to.equal('a5ec')
      return done()
    })
  })

  return doc.read()
}
