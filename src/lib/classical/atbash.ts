const A = 'A'.charCodeAt(0)
const Z = 'Z'.charCodeAt(0)
const a = 'a'.charCodeAt(0)
const z = 'z'.charCodeAt(0)

const transformChar = (charCode: number, low: number, high: number) =>
  String.fromCharCode(high - (charCode - low))

export const atbashTransform = (text: string) =>
  text
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0)
      if (code >= A && code <= Z) return transformChar(code, A, Z)
      if (code >= a && code <= z) return transformChar(code, a, z)
      return ch
    })
    .join('')
