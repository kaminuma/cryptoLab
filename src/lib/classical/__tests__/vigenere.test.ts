import { describe, it, expect } from 'vitest'
import { vigenereEncrypt, vigenereDecrypt } from '../vigenere'

describe('Vigenère Cipher', () => {
  it('encrypts with a simple key', () => {
    expect(vigenereEncrypt('ATTACKATDAWN', 'LEMON')).toBe('LXFOPVEFRNHR')
  })

  it('decrypts back to original', () => {
    expect(vigenereDecrypt('LXFOPVEFRNHR', 'LEMON')).toBe('ATTACKATDAWN')
  })

  it('preserves case', () => {
    const encrypted = vigenereEncrypt('Hello', 'KEY')
    const decrypted = vigenereDecrypt(encrypted, 'KEY')
    expect(decrypted).toBe('Hello')
  })

  it('preserves non-alphabetic characters', () => {
    const original = 'Hello, World!'
    const encrypted = vigenereEncrypt(original, 'KEY')
    const decrypted = vigenereDecrypt(encrypted, 'KEY')
    expect(decrypted).toBe(original)
  })

  it('returns text unchanged with empty key', () => {
    expect(vigenereEncrypt('Hello', '')).toBe('Hello')
  })

  it('handles key with non-alpha chars (sanitized)', () => {
    const enc1 = vigenereEncrypt('HELLO', 'K-E-Y')
    const enc2 = vigenereEncrypt('HELLO', 'KEY')
    expect(enc1).toBe(enc2)
  })

  it('roundtrips with mixed case key', () => {
    const original = 'TestMessage'
    const encrypted = vigenereEncrypt(original, 'sEcReT')
    expect(vigenereDecrypt(encrypted, 'sEcReT')).toBe(original)
  })
})
