//---------//
// Imports //
//---------//

const _ = require('lodash')

//
//------//
// Main //
//------//

class DirectoryTree {
  constructor(doc) {
    this._doc = doc
  }

  loadFromBuffer(secIds) {
    this._loadBuffer(this._doc._readSectorsFromBuffer(secIds))
  }

  loadFromFile(secIds, callback) {
    this._doc._readSectorsFromFile(secIds, buffer => {
      this._loadBuffer(buffer)
      callback()
    })
  }

  _loadBuffer(buffer) {
    const count = buffer.length / 128
    this._entries = new Array(count)
    let i = 0
    for (i = 0; i < count; i++) {
      const offset = i * 128

      const nameLength = Math.max(buffer.readInt16LE(64 + offset) - 1, 0)

      const entry = {
        name: buffer.toString('utf16le', 0 + offset, nameLength + offset),
        type: buffer.readInt8(66 + offset),
        nodeColor: buffer.readInt8(67 + offset),
        left: buffer.readInt32LE(68 + offset),
        right: buffer.readInt32LE(72 + offset),
        storageDirId: buffer.readInt32LE(76 + offset),
        secId: buffer.readInt32LE(116 + offset),
        size: buffer.readInt32LE(120 + offset),
      }

      this._entries[i] = entry
    }

    this.root = _.find(this._entries, entry => {
      return entry.type === DirectoryTree.EntryTypeRoot
    })

    this._buildHierarchy(this.root)
  }

  _buildHierarchy(storageEntry) {
    const childIds = this._getChildIds(storageEntry)

    storageEntry.storages = {}
    storageEntry.streams = {}

    _.each(childIds, childId => {
      const childEntry = this._entries[childId]
      const name = childEntry.name
      if (childEntry.type === DirectoryTree.EntryTypeStorage) {
        storageEntry.storages[name] = childEntry
      }
      if (childEntry.type === DirectoryTree.EntryTypeStream) {
        storageEntry.streams[name] = childEntry
      }
    })

    _.each(storageEntry.storages, childStorageEntry => {
      this._buildHierarchy(childStorageEntry)
    })
  }

  _getChildIds(storageEntry) {
    const myself = this
    const childIds = []

    if (storageEntry.storageDirId > -1) {
      childIds.push(storageEntry.storageDirId)
      const rootChildEntry = myself._entries[storageEntry.storageDirId]
      visit(rootChildEntry)
    }

    return childIds

    // scoped helper functions

    function visit(visitEntry) {
      if (visitEntry.left !== DirectoryTree.Leaf) {
        childIds.push(visitEntry.left)
        visit(myself._entries[visitEntry.left])
      }
      if (visitEntry.right !== DirectoryTree.Leaf) {
        childIds.push(visitEntry.right)
        visit(myself._entries[visitEntry.right])
      }
    }
  }
}

Object.assign(DirectoryTree, {
  EntryTypeEmpty: 0,
  EntryTypeStorage: 1,
  EntryTypeStream: 2,
  EntryTypeRoot: 5,

  NodeColorRed: 0,
  NodeColorBlack: 1,

  Leaf: -1,
})

//
//---------//
// Exports //
//---------//

module.exports = DirectoryTree
