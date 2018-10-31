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

describe('Word file test12.doc', () => {
  const filePath = path.resolve(__dirname, 'data/test12.doc'),
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
  expect(body).to.match(/Row 2, cell 3/)
}
