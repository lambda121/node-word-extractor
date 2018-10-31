//---------//
// Imports //
//---------//

const fs = require('fs')
const { expect } = require('chai')
const path = require('path')

const extract = require('../src/extract')

//
//------//
// Main //
//------//

describe('Word file test06.doc', () => {
  const filePath = path.resolve(__dirname, 'data/test06.doc'),
    buffer = fs.readFileSync(filePath)

  it('fromFile - should match the expected body', () => {
    return extract.fromFile(filePath).then(testDoc)
  })

  it('fromBuffer - should match the expected body', () => {
    return extract.fromBuffer(buffer).then(testDoc)
  })
})

//
//------------------//
// Helper Functions //
//------------------//

function testDoc(doc) {
  const body = doc.getBody()
  expect(body).to.match(new RegExp('Insert interface name here'))
  expect(body).to.match(new RegExp('M\\u00e9thodes appel\\u00e9es'))
}
