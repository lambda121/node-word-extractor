//------//
// Main //
//------//

class Header {
  load(buffer) {
    let i
    for (i = 0; i < 8; i++) {
      if (Header.ole_id[i] != buffer[i]) return false
    }

    Object.assign(this, {
      // Size of sectors
      secSize: 1 << buffer.readInt16LE(30),

      // Size of short sectors
      shortSecSize: 1 << buffer.readInt16LE(32),

      // Number of sectors used for the Sector Allocation Table
      SATSize: buffer.readInt32LE(44),

      // Starting Sec ID of the directory stream
      dirSecId: buffer.readInt32LE(48),

      // Maximum size of a short stream
      shortStreamMax: buffer.readInt32LE(56),

      // Starting Sec ID of the Short Sector Allocation Table
      SSATSecId: buffer.readInt32LE(60),

      // Number of sectors used for the Short Sector Allocation Table
      SSATSize: buffer.readInt32LE(64),

      // Starting Sec ID of the Master Sector Allocation Table
      MSATSecId: buffer.readInt32LE(68),

      // Number of sectors used for the Master Sector Allocation Table
      MSATSize: buffer.readInt32LE(72),
    })

    // The first 109 sectors of the MSAT
    this.partialMSAT = new Array(109)
    for (i = 0; i < 109; i++)
      this.partialMSAT[i] = buffer.readInt32LE(76 + i * 4)

    return true
  }
}

Header.ole_id = new Buffer('D0CF11E0A1B11AE1', 'hex')

//
//---------//
// Exports //
//---------//

module.exports = Header
