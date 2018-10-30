const { expect } = require('chai')
const path = require('path')

const WordExtractor = require('../src/word')

describe('Word file test10.doc', function() {
  const extractor = new WordExtractor()

  it('should match the expected body', function(done) {
    const extract = extractor.extract(
      path.resolve(__dirname, 'data/test10.doc')
    )
    expect(extract).to.be.fulfilled
    return extract
      .then(function(result) {
        const body = result.getBody()
        expect(body).to.match(new RegExp('Second paragraph'))
        return done()
      })
      .catch(err => done(err))
  })

  return it('should retrieve the annotations', function(done) {
    const extract = extractor.extract(
      path.resolve(__dirname, 'data/test10.doc')
    )
    expect(extract).to.be.fulfilled
    return extract
      .then(function(result) {
        const annotations = result.getAnnotations()
        expect(annotations).to.match(new RegExp('Second paragraph comment'))
        expect(annotations).to.match(new RegExp('Third paragraph comment'))
        expect(annotations).to.match(
          new RegExp('this is all I have to say on the matter')
        )
        return done()
      })
      .catch(err => done(err))
  })
})
