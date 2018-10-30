const fs = require('fs')
const path = require('path')

const DOCXExtractor = require('../src/docx')

const testWordFile = file =>
  describe(`Word file ${file}`, () =>
    it('can be opened correctly', function() {
      const filename = path.resolve(__dirname, `data/${file}`)
      const doc = new DOCXExtractor()
      return (
        doc
          .extract(filename)
          // eslint-disable-next-line no-console
          .then(result => console.log(result))
      )
    }))

const files = fs.readdirSync(path.resolve(__dirname, 'data'))
files.filter(function(file) {
  if (/\.docx$/i.test(file)) {
    return testWordFile(file)
  }
})
