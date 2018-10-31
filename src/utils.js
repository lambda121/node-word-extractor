const { isFunction } = require('lodash')

const bindAllFunctions = instance => {
  for (const key of Object.getOwnPropertyNames(
    instance.constructor.prototype
  )) {
    if (key === 'constructor') continue

    const val = instance[key]
    if (isFunction(val)) {
      instance[key] = val.bind(instance)
    }
  }
  return instance
}

module.exports = { bindAllFunctions }
