import { describe, it, expect } from 'vitest'
import { EnigmaMachine } from '../core/enigmaEngine'

describe('Enigma Machine', () => {
  it('encrypts HELLOWORLD with standard settings', () => {
    const machine = new EnigmaMachine(
      'Enigma-I',
      ['I', 'II', 'III'],
      'B',
      ['A', 'A', 'A'],
      ['A', 'A', 'A'],
      { A: 'B', B: 'A' }
    )

    let output = ''
    for (const char of 'HELLOWORLD') {
      output += machine.encodeChar(char)
    }
    expect(output).toBe('ILADBBMTBZ')
  })

  it('is symmetric (encrypt then decrypt with same settings)', () => {
    const plaintext = 'THEQUICKBROWNFOX'

    // Encrypt
    const machine1 = new EnigmaMachine(
      'Enigma-I',
      ['I', 'II', 'III'],
      'B',
      ['A', 'A', 'A'],
      ['A', 'A', 'A'],
      {}
    )
    let ciphertext = ''
    for (const char of plaintext) {
      ciphertext += machine1.encodeChar(char)
    }

    // Decrypt (same settings)
    const machine2 = new EnigmaMachine(
      'Enigma-I',
      ['I', 'II', 'III'],
      'B',
      ['A', 'A', 'A'],
      ['A', 'A', 'A'],
      {}
    )
    let decrypted = ''
    for (const char of ciphertext) {
      decrypted += machine2.encodeChar(char)
    }

    expect(decrypted).toBe(plaintext)
  })

  it('never encodes a letter to itself', () => {
    for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      const m = new EnigmaMachine(
        'Enigma-I',
        ['I', 'II', 'III'],
        'B',
        ['A', 'A', 'A'],
        ['A', 'A', 'A'],
        {}
      )
      const encoded = m.encodeChar(ch)
      expect(encoded).not.toBe(ch)
    }
  })

  it('produces different output with different ring settings', () => {
    const encrypt = (rings: string[]) => {
      const m = new EnigmaMachine(
        'Enigma-I', ['I', 'II', 'III'], 'B', rings, ['A', 'A', 'A'], {}
      )
      let out = ''
      for (const ch of 'HELLO') out += m.encodeChar(ch)
      return out
    }

    const out1 = encrypt(['A', 'A', 'A'])
    const out2 = encrypt(['B', 'C', 'D'])
    expect(out1).not.toBe(out2)
  })

  it('produces different output with different plugboard', () => {
    const encrypt = (plug: Record<string, string>) => {
      const m = new EnigmaMachine(
        'Enigma-I', ['I', 'II', 'III'], 'B', ['A', 'A', 'A'], ['A', 'A', 'A'], plug
      )
      let out = ''
      for (const ch of 'HELLO') out += m.encodeChar(ch)
      return out
    }

    const out1 = encrypt({})
    const out2 = encrypt({ A: 'B', B: 'A', C: 'D', D: 'C' })
    expect(out1).not.toBe(out2)
  })
})
