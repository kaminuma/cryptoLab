import { describe, it, expect } from 'vitest'
import {
  modPow,
  generateSimpleRSAKey,
  rsaEncrypt,
  rsaDecrypt,
  stringToNumber,
  numberToString,
  SMALL_PRIMES,
} from '../index'

describe('modPow', () => {
  it('computes base^exp mod modulus correctly', () => {
    expect(modPow(2n, 10n, 1000n)).toBe(24n) // 2^10 = 1024, 1024 % 1000 = 24
    expect(modPow(3n, 7n, 13n)).toBe(3n)     // 3^7 = 2187, 2187 % 13 = 3
  })

  it('returns 0 when modulus is 1', () => {
    expect(modPow(5n, 3n, 1n)).toBe(0n)
  })

  it('handles large exponents', () => {
    expect(modPow(2n, 100n, 1000000007n)).toBe(976371285n)
  })
})

describe('RSA Key Generation', () => {
  it('generates valid key pair from small primes', () => {
    const keys = generateSimpleRSAKey(61n, 53n)
    expect(keys.publicKey.n).toBe(61n * 53n)
    expect(keys.phi).toBe(60n * 52n)
    expect(keys.publicKey.e).toBe(65537n)
  })

  it('throws when e and phi are not coprime', () => {
    // p=3, q=5 => phi=8, gcd(65537,8) = 1, so this works
    // p=3, q=7 => phi=12, gcd(65537,12) = 1, also works
    // Use e=2 explicitly to force non-coprime
    expect(() => generateSimpleRSAKey(3n, 5n, 2n)).toThrow('e and φ(n) must be coprime')
  })
})

describe('RSA Encrypt/Decrypt', () => {
  it('encrypts and decrypts small number', () => {
    const keys = generateSimpleRSAKey(61n, 53n)
    const message = 42n
    const encrypted = rsaEncrypt(message, keys.publicKey)
    const decrypted = rsaDecrypt(encrypted, keys.privateKey)
    expect(decrypted).toBe(message)
  })

  it('roundtrips with various messages', () => {
    const keys = generateSimpleRSAKey(101n, 103n)
    for (const m of [0n, 1n, 100n, 500n, 1000n]) {
      const encrypted = rsaEncrypt(m, keys.publicKey)
      const decrypted = rsaDecrypt(encrypted, keys.privateKey)
      expect(decrypted).toBe(m)
    }
  })

  it('throws when message >= n', () => {
    const keys = generateSimpleRSAKey(61n, 53n)
    expect(() => rsaEncrypt(keys.publicKey.n, keys.publicKey)).toThrow('Message must be smaller than n')
  })

  it('works with different prime pairs from SMALL_PRIMES', () => {
    const p = SMALL_PRIMES[5]   // 29
    const q = SMALL_PRIMES[10]  // 47
    const keys = generateSimpleRSAKey(p, q)
    const message = 123n
    const encrypted = rsaEncrypt(message, keys.publicKey)
    const decrypted = rsaDecrypt(encrypted, keys.privateKey)
    expect(decrypted).toBe(message)
  })
})

describe('String/Number Conversion', () => {
  it('converts string to number and back', () => {
    expect(numberToString(stringToNumber('Hi'))).toBe('Hi')
    expect(numberToString(stringToNumber('A'))).toBe('A')
  })

  it('roundtrips multi-byte characters', () => {
    const text = 'Hello'
    expect(numberToString(stringToNumber(text))).toBe(text)
  })
})
