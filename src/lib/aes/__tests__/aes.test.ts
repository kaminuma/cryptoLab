import { describe, it, expect } from 'vitest'
import {
  encrypt, decrypt,
  encryptECB, decryptECB,
  encryptCBC, decryptCBC,
  encryptCTR, decryptCTR,
  keyExpansion,
  encryptBlock, decryptBlock,
  addPadding, removePadding,
  stringToBytes, bytesToString,
  bytesToHex, hexToBytes,
} from '../index'

// NIST AES-128 test vector
const testKey = hexToBytes('2b7e151628aed2a6abf7158809cf4f3c')
const testPlainBlock = hexToBytes('6bc1bee22e409f96e93d7e117393172a')
const testCipherBlock = hexToBytes('3ad77bb40d7a3660a89ecaf32466ef97')

describe('AES Block Operations', () => {
  it('encrypts a single block correctly (NIST test vector)', () => {
    const roundKeys = keyExpansion(testKey)
    const encrypted = encryptBlock(testPlainBlock, roundKeys)
    expect(bytesToHex(encrypted)).toBe(bytesToHex(testCipherBlock))
  })

  it('decrypts a single block correctly', () => {
    const roundKeys = keyExpansion(testKey)
    const decrypted = decryptBlock(testCipherBlock, roundKeys)
    expect(bytesToHex(decrypted)).toBe(bytesToHex(testPlainBlock))
  })

  it('encrypt then decrypt returns original block', () => {
    const roundKeys = keyExpansion(testKey)
    const encrypted = encryptBlock(testPlainBlock, roundKeys)
    const decrypted = decryptBlock(encrypted, roundKeys)
    expect(bytesToHex(decrypted)).toBe(bytesToHex(testPlainBlock))
  })
})

describe('PKCS#7 Padding', () => {
  it('pads data to block boundary', () => {
    const data = new Uint8Array([1, 2, 3])
    const padded = addPadding(data)
    expect(padded.length).toBe(16)
    expect(padded[15]).toBe(13) // 16 - 3 = 13
  })

  it('adds full block when data is already aligned', () => {
    const data = new Uint8Array(16).fill(0)
    const padded = addPadding(data)
    expect(padded.length).toBe(32)
    expect(padded[31]).toBe(16)
  })

  it('remove padding recovers original data', () => {
    const original = new Uint8Array([1, 2, 3, 4, 5])
    const padded = addPadding(original)
    const unpadded = removePadding(padded)
    expect(Array.from(unpadded)).toEqual(Array.from(original))
  })
})

describe('AES-ECB Mode', () => {
  it('encrypts and decrypts string roundtrip', () => {
    const key = hexToBytes('00112233445566778899aabbccddeeff')
    const plaintext = stringToBytes('Hello AES ECB!!')
    const encrypted = encryptECB(plaintext, key)
    const decrypted = decryptECB(encrypted, key)
    expect(bytesToString(decrypted)).toBe('Hello AES ECB!!')
  })

  it('same plaintext blocks produce same ciphertext blocks', () => {
    const key = hexToBytes('00112233445566778899aabbccddeeff')
    const block = new Uint8Array(32).fill(0x41) // 'AAA...' x 32
    const encrypted = encryptECB(block, key)
    // ECB: first 16 bytes of ciphertext should equal second 16 bytes (before padding block)
    expect(bytesToHex(encrypted.slice(0, 16))).toBe(bytesToHex(encrypted.slice(16, 32)))
  })
})

describe('AES-CBC Mode', () => {
  it('encrypts and decrypts string roundtrip', () => {
    const key = hexToBytes('00112233445566778899aabbccddeeff')
    const iv = hexToBytes('000102030405060708090a0b0c0d0e0f')
    const plaintext = stringToBytes('Hello AES CBC!!')
    const encrypted = encryptCBC(plaintext, key, iv)
    const decrypted = decryptCBC(encrypted, key, iv)
    expect(bytesToString(decrypted)).toBe('Hello AES CBC!!')
  })

  it('same plaintext blocks produce different ciphertext blocks', () => {
    const key = hexToBytes('00112233445566778899aabbccddeeff')
    const iv = hexToBytes('000102030405060708090a0b0c0d0e0f')
    const block = new Uint8Array(32).fill(0x41)
    const encrypted = encryptCBC(block, key, iv)
    // CBC: identical plaintext blocks should produce different ciphertext blocks
    expect(bytesToHex(encrypted.slice(0, 16))).not.toBe(bytesToHex(encrypted.slice(16, 32)))
  })

  it('throws on invalid IV length', () => {
    const key = hexToBytes('00112233445566778899aabbccddeeff')
    const iv = new Uint8Array(8)
    expect(() => encryptCBC(new Uint8Array(16), key, iv)).toThrow('IV must be 16 bytes')
  })
})

describe('AES-CTR Mode', () => {
  it('encrypts and decrypts string roundtrip', () => {
    const key = hexToBytes('00112233445566778899aabbccddeeff')
    const nonce = hexToBytes('000102030405060708090a0b0c0d0e0f')
    const plaintext = stringToBytes('Hello AES CTR Mode!')
    const encrypted = encryptCTR(plaintext, key, nonce)
    const decrypted = decryptCTR(encrypted, key, nonce)
    expect(bytesToString(decrypted)).toBe('Hello AES CTR Mode!')
  })

  it('ciphertext has same length as plaintext (no padding)', () => {
    const key = hexToBytes('00112233445566778899aabbccddeeff')
    const nonce = hexToBytes('000102030405060708090a0b0c0d0e0f')
    const plaintext = stringToBytes('12345')
    const encrypted = encryptCTR(plaintext, key, nonce)
    expect(encrypted.length).toBe(plaintext.length)
  })

  it('throws on invalid nonce length', () => {
    const key = hexToBytes('00112233445566778899aabbccddeeff')
    const nonce = new Uint8Array(8)
    expect(() => encryptCTR(new Uint8Array(16), key, nonce)).toThrow('Nonce must be 16 bytes')
  })
})

describe('AES high-level API', () => {
  const key = hexToBytes('00112233445566778899aabbccddeeff')

  it('ECB mode roundtrip', () => {
    const { ciphertext } = encrypt('Hello World', key, 'ECB')
    expect(decrypt(ciphertext, key, 'ECB')).toBe('Hello World')
  })

  it('CBC mode roundtrip', () => {
    const { ciphertext, iv } = encrypt('Hello World', key, 'CBC')
    expect(decrypt(ciphertext, key, 'CBC', iv)).toBe('Hello World')
  })

  it('CTR mode roundtrip', () => {
    const { ciphertext, iv } = encrypt('Hello World', key, 'CTR')
    expect(decrypt(ciphertext, key, 'CTR', iv)).toBe('Hello World')
  })
})

describe('Helper functions', () => {
  it('bytesToHex and hexToBytes roundtrip', () => {
    const hex = '48656c6c6f'
    expect(bytesToHex(hexToBytes(hex))).toBe(hex)
  })

  it('stringToBytes and bytesToString roundtrip', () => {
    const text = 'Hello World'
    expect(bytesToString(stringToBytes(text))).toBe(text)
  })
})
