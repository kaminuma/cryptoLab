/**
 * One-Time Pad (OTP) 暗号の実装
 *
 * ワンタイムパッドは、正しく使用すれば理論的に解読不可能な唯一の暗号方式です:
 * 1. 鍵は完全にランダムでなければならない
 * 2. 鍵はメッセージと同じ長さ以上でなければならない
 * 3. 鍵は再利用してはならない
 * 4. 鍵は完全に秘密に保たれなければならない
 *
 * この実装は教育目的であり、アルファベット文字に対して加算・減算による剰余演算（modular arithmetic）を用いています:
 * 暗号化: C[i] = (P[i] + K[i]) mod 26
 * 復号化: P[i] = (C[i] - K[i] + 26) mod 26
 * ※実際のOTPはビット単位でXOR演算を行いますが、本実装は分かりやすさを重視しています。
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
 * Count alphabetic characters in text
 */
function countAlphabeticChars(text: string): number {
  let count = 0
  for (const char of text) {
    if (charToIndex(char) !== -1) {
      count++
    }
  }
  return count
}

/**
 * Generate a random OTP key of specified length (A-Z only)
 * @param length - Number of characters in the key
 * @returns Random uppercase key string
 */
export function generateOTPKey(length: number): string {
  const key: string[] = []
  // バッファを多めに確保。256/234 ~= 1.09 なので2倍あれば十分安全
  const bufferSize = length * 2 + 64
  let randomBytes = crypto.getRandomValues(new Uint8Array(bufferSize))
  let byteIndex = 0

  while (key.length < length) {
    if (byteIndex >= randomBytes.length) {
      // バッファが足りない場合は再生成
      randomBytes = crypto.getRandomValues(new Uint8Array(bufferSize))
      byteIndex = 0
    }

    const randomValue = randomBytes[byteIndex++]
    // 26 * 9 = 234 未満の値のみ受け入れる（バイアスを排除）
    if (randomValue < 234) {
      key.push(indexToChar(randomValue % ALPHABET_SIZE))
    }
  }

  return key.join('')
}

/**
 * Encrypt plaintext using One-Time Pad
 * @param plaintext - The text to encrypt
 * @param key - The one-time key (must be at least as long as the number of alphabetic characters in plaintext)
 * @returns Encrypted ciphertext
 */
export function otpEncrypt(plaintext: string, key: string): string {
  if (!plaintext) return ''

  // Extract only alphabetic characters from key
  const keyChars = key.toUpperCase().replace(/[^A-Z]/g, '')
  if (keyChars.length === 0) {
    throw new Error('鍵には少なくとも1文字の英字が必要です。')
  }

  const plaintextAlphaCount = countAlphabeticChars(plaintext)
  if (keyChars.length < plaintextAlphaCount) {
    throw new Error(
      `鍵の長さが不足しています。平文の英字数 (${plaintextAlphaCount}) 以上の鍵が必要です。現在の鍵の長さ: ${keyChars.length}`,
    )
  }

  let result = ''
  let keyIndex = 0

  for (let i = 0; i < plaintext.length; i++) {
    const char = plaintext[i]
    const pIndex = charToIndex(char)

    if (pIndex === -1) {
      // Non-alphabetic character, keep as-is
      result += char
      continue
    }

    // Get key character
    const kIndex = charToIndex(keyChars[keyIndex])

    // Encrypt: (P + K) mod 26
    const cIndex = (pIndex + kIndex) % ALPHABET_SIZE
    const cipherChar = indexToChar(cIndex)
    result += cipherChar

    keyIndex++
  }

  return result
}

/**
 * Decrypt ciphertext using One-Time Pad
 * @param ciphertext - The text to decrypt
 * @param key - The one-time key (must be the same as used for encryption)
 * @returns Decrypted plaintext
 */
export function otpDecrypt(ciphertext: string, key: string): string {
  if (!ciphertext) return ''

  // Extract only alphabetic characters from key
  const keyChars = key.toUpperCase().replace(/[^A-Z]/g, '')
  if (keyChars.length === 0) {
    throw new Error('鍵には少なくとも1文字の英字が必要です。')
  }

  const ciphertextAlphaCount = countAlphabeticChars(ciphertext)
  if (keyChars.length < ciphertextAlphaCount) {
    throw new Error(
      `鍵の長さが不足しています。暗号文の英字数 (${ciphertextAlphaCount}) 以上の鍵が必要です。現在の鍵の長さ: ${keyChars.length}`,
    )
  }

  let result = ''
  let keyIndex = 0

  for (let i = 0; i < ciphertext.length; i++) {
    const char = ciphertext[i]
    const cIndex = charToIndex(char)

    if (cIndex === -1) {
      // Non-alphabetic character, keep as-is
      result += char
      continue
    }

    // Get key character
    const kIndex = charToIndex(keyChars[keyIndex])

    // Decrypt: (C - K + 26) mod 26
    const pIndex = (cIndex - kIndex + ALPHABET_SIZE) % ALPHABET_SIZE
    const plainChar = indexToChar(pIndex)
    result += plainChar

    keyIndex++
  }

  return result
}
