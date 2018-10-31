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

describe('Word file test04.doc', () => {
  const filePath = path.resolve(__dirname, 'data/test04.doc'),
    buffer = fs.readFileSync(filePath)

  it('fromFile - should match the expected body', () => {
    return extract.fromFile(filePath).then(testBody)
  })

  it('fromFile - should have headers and footers', () => {
    return extract.fromFile(filePath).then(testHeaderAndFooter)
  })

  it('fromBuffer - should match the expected body', () => {
    return extract.fromBuffer(buffer).then(testBody)
  })

  it('fromBuffer - should have headers and footers', () => {
    return extract.fromBuffer(buffer).then(testHeaderAndFooter)
  })
})

//
//------------------//
// Helper Functions //
//------------------//

function testBody(doc) {
  const body = doc.getBody()
  expect(body).to.match(new RegExp('Moli\\u00e8re'))
}

function testHeaderAndFooter(doc) {
  const body = doc.getHeaders()
  expect(body).to.match(new RegExp('The footer'))
  expect(body).to.match(new RegExp('Moli\\u00e8re'))
}
