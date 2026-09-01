import assert from 'node:assert/strict'

const builtModule = await import(new URL('../pkg/srdjankotarlic-protimer/main.js', import.meta.url))

assert.equal(typeof builtModule.default, 'function', 'The packaged Companion entrypoint must export a function')
console.log('PACKAGED_ENTRYPOINT_OK')
