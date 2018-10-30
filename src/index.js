/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

//
//---------//
// Imports //
//---------//

const fs = require('fs')

//
//------//
// Main //
//------//

class WordExtractor {
  getFirstBlock(doc) {
    return new Promise(function(resolve, reject) {
      return fs.open(doc, 'r', function(err, fd) {
        if (err) {
          return reject(err)
        }
        const buffer = Buffer.alloc(512)
        return fs.read(fd, buffer, 0, 512, 0, (err2, read, buffer) => {
          if (err2) return reject(err2)
          return fs.close(fd, function(err3) {
            if (err3) {
              return reject(err3)
            }
            return resolve(buffer.slice(0, read))
          })
        })
      })
    })
  }

  getFileType(doc) {
    return this.getFirstBlock(doc).then(function(buffer) {
      if (buffer.readUInt16BE(0) === 0x504b) {
        const next = buffer.readUInt16BE(2)
        if (next === 0x0304 || next === 0x0506 || next === 0x0708) {
          return 'DOCX'
        }
      } else if (buffer.readUInt16BE(0) === 0xd0cf) {
        return 'DOC'
      } else {
        return null
      }
    })
  }

  extract(doc) {
    return (
      this.getFileType(doc)
        // eslint-disable-next-line no-console
        .then(result => console.log(result))
    )
  }
}

//
//---------//
// Exports //
//---------//

module.exports = WordExtractor
