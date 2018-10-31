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

describe('Word file test01.doc', () => {
  const filePath = path.resolve(__dirname, 'data/test01.doc'),
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
  expect(body).to.match(new RegExp('Welcome to BlogCFC'))
  expect(body).to.match(new RegExp('http://lyla\\.maestropublishing\\.com/'))
  expect(body).to.match(new RegExp('You must use the IDs\\.'))
}
