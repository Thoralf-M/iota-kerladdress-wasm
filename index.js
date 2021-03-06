//wasm.generateAddress('9'.repeat(81), 0, 2, true)
async function generateAddress(seed, index, security, checksum) {
  try {
    let wasm = await import('./pkg')
    let address = wasm.new_address(seed, index, security, checksum)
    console.log(address);
  } catch (err) {
    console.error(err)
  }
}
let wasmmodule = import('./pkg')
// export default { generateAddress, wasmmodule }
export default { wasmmodule }