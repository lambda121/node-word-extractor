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

describe('Word file test10.doc', () => {
  const filePath = path.resolve(__dirname, 'data/test10.doc'),
    buffer = fs.readFileSync(filePath)

  it('fromFile - should match the expected body', () => {
    return extract.fromFile(filePath).then(testBody)
  })

  it('fromFile - should retrieve the annotations', () => {
    return extract.fromFile(filePath).then(testAnnotations)
  })

  it('fromBuffer - should match the expected body', () => {
    return extract.fromBuffer(buffer).then(testBody)
  })

  it('fromBuffer - should retrieve the annotations', () => {
    return extract.fromBuffer(buffer).then(testAnnotations)
  })
})

//
//------------------//
// Helper Functions //
//------------------//

function testBody(doc) {
  const body = doc.getBody()
  expect(body).to.match(new RegExp('Second paragraph'))
}

function testAnnotations(doc) {
  const annotations = doc.getAnnotations()
  expect(annotations).to.match(new RegExp('Second paragraph comment'))
  expect(annotations).to.match(new RegExp('Third paragraph comment'))
  expect(annotations).to.match(
    new RegExp('this is all I have to say on the matter')
  )
}
