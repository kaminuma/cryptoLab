const SMALL_PRIMES = [
  3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n, 43n, 47n, 53n, 59n, 61n, 67n, 71n, 73n, 79n, 83n, 89n, 97n,
]

const powMod = (base: bigint, exponent: bigint, modulus: bigint): bigint => {
  let result = 1n
  let b = base % modulus
  let e = exponent
  while (e > 0n) {
    if (e & 1n) {
      result = (result * b) % modulus
    }
    e >>= 1n
    if (e > 0n) {
      b = (b * b) % modulus
    }
  }
  return result
}

const randomBigInt = (bits: number) => {
  const byteLength = Math.ceil(bits / 8)
  const buffer = new Uint8Array(byteLength)
  crypto.getRandomValues(buffer)
  // Ensure highest bit is set for required bit length
  const highestBit = (bits - 1) % 8
  buffer[0] |= 1 << highestBit
  buffer[byteLength - 1] |= 1
  return buffer.reduce((acc, byte) => (acc << 8n) | BigInt(byte), 0n)
}

const millerRabin = (n: bigint, rounds = 12): boolean => {
  if (n < 2n) return false
  for (const p of SMALL_PRIMES) {
    if (n === p) return true
    if (n % p === 0n) return false
  }

  let d = n - 1n
  let s = 0n
  while ((d & 1n) === 0n) {
    d >>= 1n
    s += 1n
  }

  for (let i = 0; i < rounds; i += 1) {
    const a = 2n + (randomBigInt(64) % (n - 3n))
    let x = powMod(a, d, n)
    if (x === 1n || x === n - 1n) continue
    let continueLoop = false
    for (let r = 1n; r < s; r += 1n) {
      x = (x * x) % n
      if (x === n - 1n) {
        continueLoop = true
        break
      }
    }
    if (continueLoop) continue
    return false
  }

  return true
}

const pause = () => new Promise((resolve) => setTimeout(resolve, 0))

export const generatePrime = async (bits: number): Promise<bigint> => {
  let attempts = 0
  while (true) {
    attempts += 1
    const candidate = randomBigInt(bits)
    if (candidate % 2n === 0n) continue
    if (SMALL_PRIMES.some((p) => candidate % p === 0n)) continue
    if (millerRabin(candidate)) return candidate
    if (attempts % 10 === 0) await pause()
  }
}

export const gcd = (a: bigint, b: bigint): bigint => {
  let x = a
  let y = b
  while (y !== 0n) {
    const temp = x % y
    x = y
    y = temp
  }
  return x
}

export const modInverse = (a: bigint, m: bigint): bigint => {
  let m0 = m
  let x0 = 0n
  let x1 = 1n
  let aa = a
  if (m === 1n) return 0n
  while (aa > 1n) {
    const q = aa / m
    const t = m
    m = aa % m
    aa = t
    const t2 = x0
    x0 = x1 - q * x0
    x1 = t2
  }
  if (x1 < 0n) {
    x1 += m0
  }
  return x1
}
