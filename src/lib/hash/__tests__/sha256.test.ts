import { describe, it, expect } from 'vitest'
import { sha256, sha256WithSteps, calculateAvalanche } from '../sha256'

describe('SHA-256', () => {
  // NIST test vectors
  it('hashes empty string correctly', () => {
    expect(sha256('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
  })

  it('hashes "abc" correctly', () => {
    expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  })

  it('hashes 56-byte message correctly (padding boundary)', () => {
    expect(sha256('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq'))
      .toBe('248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1')
  })

  it('hashes 112-byte message correctly (multi-block)', () => {
    expect(sha256('abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu'))
      .toBe('cf5b16a778af8380036ce59e7b0492370b249b11e8f07a51afac45037afee9d1')
  })

  it('sha256WithSteps returns same hash as sha256', () => {
    const input = 'Hello, World!'
    const result = sha256WithSteps(input)
    expect(result.hash).toBe(sha256(input))
  })

  it('sha256WithSteps includes steps', () => {
    const result = sha256WithSteps('test')
    expect(result.steps.length).toBeGreaterThan(0)
    expect(result.steps[0].step).toBe('input')
    expect(result.steps[result.steps.length - 1].step).toBe('final')
  })

  it('produces different hashes for different inputs', () => {
    expect(sha256('hello')).not.toBe(sha256('Hello'))
  })

  it('produces consistent output (deterministic)', () => {
    expect(sha256('test')).toBe(sha256('test'))
  })
})

describe('Avalanche Effect', () => {
  it('calculates bit differences between hashes', () => {
    const hash1 = sha256('hello')
    const hash2 = sha256('hallo')
    const result = calculateAvalanche(hash1, hash2)

    expect(result.totalBits).toBe(256)
    expect(result.differentBits).toBeGreaterThan(0)
    expect(result.percentage).toBeGreaterThan(30) // Should be ~50% for good hash
    expect(result.bitDifferences).toHaveLength(256)
  })

  it('returns 0 differences for identical hashes', () => {
    const hash = sha256('test')
    const result = calculateAvalanche(hash, hash)
    expect(result.differentBits).toBe(0)
    expect(result.percentage).toBe(0)
  })
})
