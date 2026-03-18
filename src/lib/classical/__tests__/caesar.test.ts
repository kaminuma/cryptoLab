import { describe, it, expect } from 'vitest'
import { caesarEncrypt, caesarDecrypt } from '../caesar'

describe('Caesar Cipher', () => {
  it('encrypts uppercase text with shift 3', () => {
    expect(caesarEncrypt('ABC', 3)).toBe('DEF')
    expect(caesarEncrypt('XYZ', 3)).toBe('ABC')
  })

  it('encrypts lowercase text', () => {
    expect(caesarEncrypt('abc', 3)).toBe('def')
    expect(caesarEncrypt('xyz', 3)).toBe('abc')
  })

  it('preserves non-alphabetic characters', () => {
    expect(caesarEncrypt('Hello, World!', 13)).toBe('Uryyb, Jbeyq!')
  })

  it('decrypts back to original', () => {
    const original = 'The Quick Brown Fox'
    const encrypted = caesarEncrypt(original, 7)
    expect(caesarDecrypt(encrypted, 7)).toBe(original)
  })

  it('handles shift of 0', () => {
    expect(caesarEncrypt('Hello', 0)).toBe('Hello')
  })

  it('handles negative shifts', () => {
    expect(caesarEncrypt('DEF', -3)).toBe('ABC')
  })

  it('handles shift of 26 (full rotation)', () => {
    expect(caesarEncrypt('Hello', 26)).toBe('Hello')
  })

  it('ROT13 is its own inverse', () => {
    const text = 'Hello World'
    expect(caesarEncrypt(caesarEncrypt(text, 13), 13)).toBe(text)
  })

  it('handles empty string', () => {
    expect(caesarEncrypt('', 5)).toBe('')
  })
})
