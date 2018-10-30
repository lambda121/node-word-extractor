const { expect } = require('chai')
const path = require('path')

const WordExtractor = require('../src/word')

describe('Word file test05.doc', function() {
  const extractor = new WordExtractor()

  return it('should match the expected body', function(done) {
    const extract = extractor.extract(
      path.resolve(__dirname, 'data/test05.doc')
    )
    expect(extract).to.be.fulfilled
    return extract.then(function(result) {
      const body = result.getBody()
      expect(body).to.match(
        new RegExp('This is a simple file created with Word 97-SR2')
      )
      return done()
    })
  })
})
