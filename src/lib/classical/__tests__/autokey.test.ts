import { describe, it, expect } from 'vitest'
import { autokeyEncrypt, autokeyDecrypt } from '../autokey'

describe('Autokey Cipher', () => {
  it('encrypts and decrypts correctly', () => {
    const plain = 'HELLOWORLD'
    const key = 'KEY'
    const encrypted = autokeyEncrypt(plain, key)
    const decrypted = autokeyDecrypt(encrypted, key)
    expect(decrypted).toBe(plain)
  })

  it('preserves non-alphabetic characters', () => {
    const plain = 'HELLO WORLD'
    const key = 'KEY'
    const encrypted = autokeyEncrypt(plain, key)
    expect(encrypted).toContain(' ')
    const decrypted = autokeyDecrypt(encrypted, key)
    expect(decrypted).toBe(plain)
  })

  it('throws on empty keyword', () => {
    expect(() => autokeyEncrypt('HELLO', '')).toThrow()
    expect(() => autokeyEncrypt('HELLO', '123')).toThrow()
  })

  it('handles empty plaintext', () => {
    expect(autokeyEncrypt('', 'KEY')).toBe('')
    expect(autokeyDecrypt('', 'KEY')).toBe('')
  })

  it('produces different output from vigenere for long messages', () => {
    // Autokey should not repeat the key pattern
    const plain = 'AAAAAAAAAA'
    const encrypted = autokeyEncrypt(plain, 'B')
    // Vigenère with key 'B' would produce all 'B's
    // Autokey uses plaintext as key extension, so after first char it uses 'A'
    expect(encrypted).not.toBe('BBBBBBBBBB')
  })
})
