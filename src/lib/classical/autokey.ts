/**
 * Autokey cipher implementation
 *
 * The Autokey cipher is a polyalphabetic substitution cipher.
 * It uses a keyword to start, then appends the plaintext itself to create the full key stream.
 * This prevents the key repetition weakness of the Vigenère cipher.
 *
 * Encryption: C[i] = (P[i] + K[i]) mod 26
 * Decryption: P[i] = (C[i] - K[i] + 26) mod 26
 *
 * Where K[0..n] is the keyword, and K[n+1..] is the plaintext itself.
 */

const ALPHABET_SIZE = 26
const A_CODE = 65 // 'A'
const a_CODE = 97 // 'a'

/**
 * Normalize a character to uppercase A-Z and get its position (0-25)
 */
function charToIndex(char: string): number {
  const code = char.charCodeAt(0)
  if (code >= A_CODE && code < A_CODE + ALPHABET_SIZE) {
    return code - A_CODE
  }
  if (code >= a_CODE && code < a_CODE + ALPHABET_SIZE) {
    return code - a_CODE
  }
  return -1
}

/**
 * Convert index (0-25) back to uppercase character
 */
function indexToChar(index: number): string {
  return String.fromCharCode(A_CODE + index)
}

/**
 * Encrypt plaintext using Autokey cipher
 * @param plaintext - The text to encrypt
 * @param keyword - The initial keyword (must contain at least one alphabetic character)
 * @returns Encrypted ciphertext
 */
export function autokeyEncrypt(plaintext: string, keyword: string): string {
  if (!plaintext) return ''

  // Extract only alphabetic characters from keyword
  const keyChars = keyword.toUpperCase().replace(/[^A-Z]/g, '')
  if (keyChars.length === 0) {
    throw new Error('キーワードには少なくとも1文字の英字が必要です。')
  }

  let result = ''
  let keyIndex = 0

  // Build the key stream: keyword + plaintext letters
  const keyStream: number[] = []
  for (const char of keyChars) {
    keyStream.push(charToIndex(char))
  }

  for (let i = 0; i < plaintext.length; i++) {
    const char = plaintext[i]
    const pIndex = charToIndex(char)

    if (pIndex === -1) {
      // Non-alphabetic character, keep as-is
      result += char
      continue
    }

    // Get key value from stream
    const kIndex = keyStream[keyIndex]

    // Encrypt: (P + K) mod 26
    const cIndex = (pIndex + kIndex) % ALPHABET_SIZE
    const cipherChar = indexToChar(cIndex)
    result += cipherChar

    // Append plaintext character to key stream for autokey
    keyStream.push(pIndex)
    keyIndex++
  }

  return result
}

/**
 * Decrypt ciphertext using Autokey cipher
 * @param ciphertext - The text to decrypt
 * @param keyword - The initial keyword (must match the one used for encryption)
 * @returns Decrypted plaintext
 */
export function autokeyDecrypt(ciphertext: string, keyword: string): string {
  if (!ciphertext) return ''

  // Extract only alphabetic characters from keyword
  const keyChars = keyword.toUpperCase().replace(/[^A-Z]/g, '')
  if (keyChars.length === 0) {
    throw new Error('キーワードには少なくとも1文字の英字が必要です。')
  }

  let result = ''
  let keyIndex = 0

  // Build the key stream: keyword + plaintext letters (we'll add as we decrypt)
  const keyStream: number[] = []
  for (const char of keyChars) {
    keyStream.push(charToIndex(char))
  }

  for (let i = 0; i < ciphertext.length; i++) {
    const char = ciphertext[i]
    const cIndex = charToIndex(char)

    if (cIndex === -1) {
      // Non-alphabetic character, keep as-is
      result += char
      continue
    }

    // Get key value from stream
    const kIndex = keyStream[keyIndex]

    // Decrypt: (C - K + 26) mod 26
    const pIndex = (cIndex - kIndex + ALPHABET_SIZE) % ALPHABET_SIZE
    const plainChar = indexToChar(pIndex)
    result += plainChar

    // Append decrypted plaintext character to key stream for autokey
    keyStream.push(pIndex)
    keyIndex++
  }

  return result
}
