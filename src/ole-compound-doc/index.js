// Copyright (c) 2012 Chris Geiersbach
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
// This component as adapted from node-ole-doc, available at:
// https://github.com/atariman486/node-ole-doc.
//
// WARNING: This embedded component will be removed in a future
// release. It is only included as there are some fixes which
// are not yet pushed into the npm distribution of node-ole-doc.

//---------//
// Imports //
//---------//

const fs = require('fs'),
  EventEmitter = require('events').EventEmitter,
  async = require('async'),
  dedent = require('dedent')

const Header = require('./header'),
  AllocationTable = require('./allocation-table'),
  DirectoryTree = require('./directory-tree'),
  Storage = require('./storage')

const { bindAllFunctions } = require('../utils')

//
//------//
// Main //
//------//

class OleCompoundDoc extends EventEmitter {
  constructor({ buf, filePath }) {
    if (buf && filePath) {
      throw new Error(
        dedent(`
          OleCompoundDoc was passed both 'buf' and 'filePath'.  It only supports
          one or the other.
        `)
      )
    }

    if (!buf && !filePath) {
      throw new Error(
        "OleCompoundDoc must be passed either 'buf' or 'filePath'"
      )
    }

    // valid input woo woo

    super()

    bindAllFunctions(this)

    if (buf) this._buf = buf
    else this._filePath = filePath

    EventEmitter.call(this)
    this._skipBytes = 0
  }

  read() {
    if (this._filePath) this._readFromFile()
    else this._readFromBuffer()
  }

  readWithCustomHeader(size, callback) {
    this._skipBytes = size
    this._customHeaderCallback = callback
    this.read()
  }

  _readFromBuffer() {
    try {
      if (this._skipBytes != 0) {
        const customHeaderCbResult = this._readCustomHeaderFromBuffer()
        if (!customHeaderCbResult) return
      }

      const readHeaderResult = this._readHeaderFromBuffer()
      if (!readHeaderResult) return

      this._readMSATFromBuffer()
      this._readSATFromBuffer()

      const readSSATResult = this._readSSATFromBuffer()
      if (!readSSATResult) return

      this._readDirectoryTreeFromBuffer()
      this.emit('ready')
    } catch (e) {
      this.emit('err', e)
    }
  }

  _readFromFile() {
    const series = [
      this._openFile,
      this._readHeaderFromFile,
      this._readMSATFromFile,
      this._readSATFromFile,
      this._readSSATFromFile,
      this._readDirectoryTreeFromFile,
    ]

    if (this._skipBytes != 0) {
      series.splice(1, 0, this._readCustomHeaderFromFile)
    }

    async.series(series, err => {
      if (err) {
        this.emit('err', err)
        return
      }

      this.emit('ready')
    })
  }

  _openFile(callback) {
    fs.open(this._filePath, 'r', 0o666, (err, fd) => {
      if (err) {
        this.emit('err', err)
        return
      }

      this._fd = fd
      callback()
    })
  }

  _readCustomHeaderFromBuffer() {
    const buffer = new Buffer(this._skipBytes)

    return this._customHeaderCallback(buffer)
  }

  _readCustomHeaderFromFile(callback) {
    const buffer = new Buffer(this._skipBytes)

    fs.read(
      this._fd,
      buffer,
      0,
      this._skipBytes,
      0,
      (err, _bytesRead, buffer) => {
        if (err) {
          this.emit('err', err)
          return
        }

        if (!this._customHeaderCallback(buffer)) return

        callback()
      }
    )
  }

  _readHeaderFromBuffer() {
    const start = this._skipBytes,
      buffer = this._buf.slice(start, start + 512)

    const header = (this._header = new Header())
    if (!header.load(buffer)) {
      this.emit('err', 'Not a valid compound document.')
      return false
    }

    return true
  }

  _readHeaderFromFile(callback) {
    const buffer = new Buffer(512)

    fs.read(
      this._fd,
      buffer,
      0,
      512,
      0 + this._skipBytes,
      (err, _bytesRead, buffer) => {
        if (err) {
          this.emit('err', err)
          return
        }

        const header = (this._header = new Header())
        if (!header.load(buffer)) {
          this.emit('err', 'Not a valid compound document.')
          return
        }

        callback()
      }
    )
  }

  _readMSATFromBuffer() {
    const header = this._header

    this._MSAT = header.partialMSAT.slice(0)
    this._MSAT.length = header.SATSize

    if (header.SATSize <= 109 || header.MSATSize == 0) {
      return
    }

    let currMSATIndex = 109
    let secId = header.MSATSecId

    for (let i = 0; i < header.MSATSize; i += 1) {
      const sectorBuffer = this._readOneSectorFromBuffer(secId)

      for (let s = 0; s < header.secSize - 4; s += 4) {
        if (currMSATIndex >= header.SATSize) break
        else this._MSAT[currMSATIndex] = sectorBuffer.readInt32LE(s)

        currMSATIndex++
      }

      secId = sectorBuffer.readInt32LE(header.secSize - 4)
    }
  }

  _readMSATFromFile(callback) {
    const header = this._header

    this._MSAT = header.partialMSAT.slice(0)
    this._MSAT.length = header.SATSize

    if (header.SATSize <= 109 || header.MSATSize == 0) {
      callback()
      return
    }

    let currMSATIndex = 109
    let i = 0
    let secId = header.MSATSecId

    async.whilst(
      () => {
        return i < header.MSATSize
      },
      whilstCallback => {
        this._readOneSectorFromFile(secId, function(sectorBuffer) {
          let s
          for (s = 0; s < header.secSize - 4; s += 4) {
            if (currMSATIndex >= header.SATSize) break
            else this._MSAT[currMSATIndex] = sectorBuffer.readInt32LE(s)

            currMSATIndex++
          }

          secId = sectorBuffer.readInt32LE(header.secSize - 4)
          i++
          whilstCallback()
        })
      },
      err => {
        if (err) {
          this.emit('err', err)
          return
        }

        callback()
      }
    )
  }

  _readOneSectorFromBuffer(secId) {
    return this._readSectorsFromBuffer([secId])
  }

  _readSectorsFromBuffer(secIds) {
    const header = this._header,
      resultBuffer = new Buffer(secIds.length * header.secSize)

    for (let i = 0; i < secIds.length; i += 1) {
      const targetStart = i * header.secSize,
        sourceStart = this._getFileOffsetForSec(secIds[i]),
        sourceEnd = sourceStart + header.secSize

      this._buf.copy(resultBuffer, targetStart, sourceStart, sourceEnd)
    }

    return resultBuffer
  }

  _readOneSectorFromFile(secId, cb) {
    this._readSectorsFromFile([secId], cb)
  }

  _readSectorsFromFile(secIds, doneCb) {
    const self = this
    const header = self._header
    const buffer = new Buffer(secIds.length * header.secSize)

    let i = 0

    async.whilst(
      () => {
        return i < secIds.length
      },
      whilstCallback => {
        const bufferOffset = i * header.secSize
        const fileOffset = self._getFileOffsetForSec(secIds[i])

        fs.read(
          self._fd,
          buffer,
          bufferOffset,
          header.secSize,
          fileOffset,
          err => {
            if (err) {
              self.emit('err', err)
              return
            }
            i += 1
            whilstCallback()
          }
        )
      },
      err => {
        if (err) {
          self.emit('err', err)
        }
        doneCb(buffer)
      }
    )
  }

  _readOneShortSectorFromBuffer(secId) {
    return this._readShortSectorsFromBuffer([secId])
  }

  _readShortSectorsFromBuffer(secIds) {
    const header = this._header,
      resultBuffer = new Buffer(secIds.length * header.shortSecSize)

    for (let i = 0; i < secIds.length; i += 1) {
      const targetStart = i * header.shortSecSize,
        sourceStart = this._getFileOffsetForShortSec(secIds[i]),
        sourceEnd = sourceStart + header.shortSecSize

      this._buf.copy(resultBuffer, targetStart, sourceStart, sourceEnd)
    }

    return resultBuffer
  }

  _readOneShortSectorFromFile(secId, callback) {
    this._readShortSectorsFromFile([secId], callback)
  }

  _readShortSectorsFromFile(secIds, callback) {
    const header = this._header
    const buffer = new Buffer(secIds.length * header.shortSecSize)

    let i = 0

    async.whilst(
      () => {
        return i < secIds.length
      },
      whilstCallback => {
        const bufferOffset = i * header.shortSecSize
        const fileOffset = this._getFileOffsetForShortSec(secIds[i])
        fs.read(
          this._fd,
          buffer,
          bufferOffset,
          header.shortSecSize,
          fileOffset,
          function(err) {
            if (err) {
              this.emit('err', err)
              return
            }
            i++
            whilstCallback()
          }
        )
      },
      err => {
        if (err) {
          this.emit('err', err)
        }
        callback(buffer)
      }
    )
  }

  _readSATFromBuffer() {
    this._SAT = new AllocationTable(this)

    this._SAT.loadFromBuffer(this._MSAT)
  }

  _readSATFromFile(callback) {
    this._SAT = new AllocationTable(this)

    this._SAT.loadFromFile(this._MSAT, callback)
  }

  _readSSATFromBuffer() {
    const header = this._header
    this._SSAT = new AllocationTable(this)

    const secIds = this._SAT.getSecIdChain(header.SSATSecId)
    if (secIds.length != header.SSATSize) {
      this.emit('err', 'Invalid Short Sector Allocation Table')
      return false
    }

    this._SSAT.loadFromBuffer(secIds)
    return true
  }

  _readSSATFromFile(callback) {
    const header = this._header
    this._SSAT = new AllocationTable(this)

    const secIds = this._SAT.getSecIdChain(header.SSATSecId)
    if (secIds.length != header.SSATSize) {
      this.emit('err', 'Invalid Short Sector Allocation Table')
      return
    }

    this._SSAT.loadFromFile(secIds, callback)
  }

  _readDirectoryTreeFromBuffer() {
    const header = this._header

    this._directoryTree = new DirectoryTree(this)

    const secIds = this._SAT.getSecIdChain(header.dirSecId)
    this._directoryTree.loadFromBuffer(secIds)
    const rootEntry = this._directoryTree.root
    this._rootStorage = new Storage(this, rootEntry)
    this._shortStreamSecIds = this._SAT.getSecIdChain(rootEntry.secId)
  }

  _readDirectoryTreeFromFile(callback) {
    const header = this._header

    this._directoryTree = new DirectoryTree(this)

    const secIds = this._SAT.getSecIdChain(header.dirSecId)
    this._directoryTree.loadFromFile(secIds, () => {
      const rootEntry = this._directoryTree.root
      this._rootStorage = new Storage(this, rootEntry)
      this._shortStreamSecIds = this._SAT.getSecIdChain(rootEntry.secId)

      callback()
    })
  }

  _getFileOffsetForSec(secId) {
    const secSize = this._header.secSize
    return this._skipBytes + (secId + 1) * secSize // Skip past the header sector
  }

  _getFileOffsetForShortSec(shortSecId) {
    const shortSecSize = this._header.shortSecSize
    const shortStreamOffset = shortSecId * shortSecSize

    const secSize = this._header.secSize
    const secIdIndex = Math.floor(shortStreamOffset / secSize)
    const secOffset = shortStreamOffset % secSize
    const secId = this._shortStreamSecIds[secIdIndex]

    return this._getFileOffsetForSec(secId) + secOffset
  }

  storage(storageName) {
    return this._rootStorage.storage(storageName)
  }

  stream(streamName) {
    return this._filePath
      ? this._rootStorage.streamFromFile(streamName)
      : this._rootStorage.streamFromBuffer(streamName)
  }
}

//
//---------//
// Exports //
//---------//

module.exports = OleCompoundDoc
