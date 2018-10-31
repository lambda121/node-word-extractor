//------//
// Main //
//------//

class AllocationTable {
  constructor(doc) {
    this._doc = doc
  }

  loadFromBuffer(secIds) {
    const doc = this._doc
    const header = doc._header

    this._table = new Array(secIds.length * (header.secSize / 4))

    const buffer = doc._readSectorsFromBuffer(secIds)
    for (let i = 0; i < buffer.length / 4; i++) {
      this._table[i] = buffer.readInt32LE(i * 4)
    }
  }

  loadFromFile(secIds, callback) {
    const doc = this._doc
    const header = doc._header

    this._table = new Array(secIds.length * (header.secSize / 4))

    doc._readSectorsFromFile(secIds, buffer => {
      for (let i = 0; i < buffer.length / 4; i++) {
        this._table[i] = buffer.readInt32LE(i * 4)
      }
      callback()
    })
  }

  getSecIdChain(startSecId) {
    let secId = startSecId
    const secIds = []
    while (secId != AllocationTable.SecIdEndOfChain) {
      secIds.push(secId)
      secId = this._table[secId]
    }

    return secIds
  }
}

Object.assign(AllocationTable, {
  SecIdFree: -1,
  SecIdEndOfChain: -2,
  SecIdSAT: -3,
  SecIdMSAT: -4,
})

//
//---------//
// Exports //
//---------//

module.exports = AllocationTable
