async function instantiate() {
  const { AsBind } = await import('as-bind')
  const { promises } = await import('fs')
  const { join } = await import('path')
  const data = await promises.readFile(join(__dirname, 'build', 'index_wasm.wasm'))
  const wasmModule = await AsBind.instantiate(data)
  return wasmModule.exports
}

export const wasm = instantiate()
