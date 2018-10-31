const OleCompoundDoc = require('./ole-compound-doc')

const fromFile = filePath => new OleCompoundDoc({ filePath })

const fromBuffer = buf => new OleCompoundDoc({ buf })

module.exports = { fromBuffer, fromFile }
