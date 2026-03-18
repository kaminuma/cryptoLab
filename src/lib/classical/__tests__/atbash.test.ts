import { describe, it, expect } from 'vitest'
import { atbashTransform } from '../atbash'

describe('Atbash Cipher', () => {
  it('transforms uppercase letters', () => {
    expect(atbashTransform('A')).toBe('Z')
    expect(atbashTransform('Z')).toBe('A')
    expect(atbashTransform('B')).toBe('Y')
    expect(atbashTransform('M')).toBe('N')
  })

  it('transforms lowercase letters', () => {
    expect(atbashTransform('a')).toBe('z')
    expect(atbashTransform('z')).toBe('a')
  })

  it('preserves non-alphabetic characters', () => {
    expect(atbashTransform('Hello, World!')).toBe('Svool, Dliow!')
  })

  it('is its own inverse (involution)', () => {
    const text = 'The Quick Brown Fox'
    expect(atbashTransform(atbashTransform(text))).toBe(text)
  })

  it('handles empty string', () => {
    expect(atbashTransform('')).toBe('')
  })

  it('full alphabet transform', () => {
    expect(atbashTransform('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe('ZYXWVUTSRQPONMLKJIHGFEDCBA')
  })
})
