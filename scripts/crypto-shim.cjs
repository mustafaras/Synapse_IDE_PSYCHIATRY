const nodeCrypto = require('node:crypto')

if (!globalThis.crypto && nodeCrypto.webcrypto) {
  globalThis.crypto = nodeCrypto.webcrypto
}

if (
  typeof nodeCrypto.getRandomValues !== 'function' &&
  typeof nodeCrypto.webcrypto?.getRandomValues === 'function'
) {
  nodeCrypto.getRandomValues = nodeCrypto.webcrypto.getRandomValues.bind(nodeCrypto.webcrypto)
}
