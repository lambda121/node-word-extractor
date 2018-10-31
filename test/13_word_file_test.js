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

describe('Word file test03.doc', () => {
  const filePath = path.resolve(__dirname, 'data/test03.doc'),
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
  expect(body).to.match(new RegExp('Can You Release Commercial Works\\?'))
  expect(body).to.match(new RegExp('Apache v2\\.0'))
  expect(body).to.match(new RegExp('you want your protections to be\\.'))
}
