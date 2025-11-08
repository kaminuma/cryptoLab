const encoder = new TextEncoder()
const decoder = new TextDecoder()

const chunkSize = 0x8000

export const utf8ToBytes = (text: string) => encoder.encode(text)

export const bytesToUtf8 = (bytes: Uint8Array) => decoder.decode(bytes)

export const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

export const base64ToBytes = (base64: string) => {
  const clean = base64.trim()
  const binary = atob(clean)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}
