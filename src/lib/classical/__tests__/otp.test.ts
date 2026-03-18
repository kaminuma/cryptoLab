import { describe, it, expect } from 'vitest'
import { otpEncrypt, otpDecrypt, generateOTPKey } from '../otp'

describe('One-Time Pad', () => {
  it('encrypts and decrypts correctly', () => {
    const plain = 'HELLO'
    const key = 'XMCKL'
    const encrypted = otpEncrypt(plain, key)
    const decrypted = otpDecrypt(encrypted, key)
    expect(decrypted).toBe(plain)
  })

  it('preserves non-alphabetic characters', () => {
    const plain = 'HELLO WORLD'
    const key = 'XMCKLXMCKL'
    const encrypted = otpEncrypt(plain, key)
    expect(encrypted).toContain(' ')
    const decrypted = otpDecrypt(encrypted, key)
    expect(decrypted).toBe(plain)
  })

  it('throws when key is too short', () => {
    expect(() => otpEncrypt('HELLO', 'AB')).toThrow()
  })

  it('throws on empty key', () => {
    expect(() => otpEncrypt('HELLO', '')).toThrow()
  })

  it('handles empty plaintext', () => {
    expect(otpEncrypt('', 'KEY')).toBe('')
  })

  it('generates random key of correct length', () => {
    const key = generateOTPKey(10)
    expect(key).toHaveLength(10)
    expect(key).toMatch(/^[A-Z]+$/)
  })

  it('generated key works for encryption roundtrip', () => {
    const plain = 'TESTMESSAGE'
    const key = generateOTPKey(plain.length)
    const encrypted = otpEncrypt(plain, key)
    const decrypted = otpDecrypt(encrypted, key)
    expect(decrypted).toBe(plain)
  })
})
