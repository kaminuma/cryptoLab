/**
 * RSA鍵生成用Web Worker
 * メインスレッドのUIフリーズを防ぐため、素数探索をWorkerで実行
 */

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

const generatePrime = (bits: number): bigint => {
  while (true) {
    const candidate = randomBigInt(bits)
    if (candidate % 2n === 0n) continue
    if (SMALL_PRIMES.some((p) => candidate % p === 0n)) continue
    if (millerRabin(candidate)) return candidate
  }
}

const gcd = (a: bigint, b: bigint): bigint => {
  let x = a
  let y = b
  while (y !== 0n) {
    const temp = x % y
    x = y
    y = temp
  }
  return x
}

const modInverse = (a: bigint, m: bigint): bigint => {
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

export type RSAWorkerRequest = {
  type: 'generate'
  bits: number
  e: string // bigint as string
}

export type RSAWorkerResponse =
  | { type: 'progress'; message: string }
  | { type: 'result'; p: string; q: string; n: string; d: string; e: string }
  | { type: 'error'; message: string }

self.onmessage = (event: MessageEvent<RSAWorkerRequest>) => {
  const { bits, e: eStr } = event.data
  const e = BigInt(eStr)

  try {
    const half = bits / 2

    self.postMessage({ type: 'progress', message: '素数 p を探索中...' } satisfies RSAWorkerResponse)
    const p = generatePrime(half)

    self.postMessage({ type: 'progress', message: '素数 q を探索中...' } satisfies RSAWorkerResponse)
    let q = generatePrime(half)
    while (p === q) {
      q = generatePrime(half)
    }

    const n = p * q
    const phi = (p - 1n) * (q - 1n)

    if (gcd(e, phi) !== 1n) {
      // Retry (extremely rare with e=65537)
      self.postMessage({ type: 'progress', message: '再生成中（e と φ(N) が互いに素ではありませんでした）...' } satisfies RSAWorkerResponse)
      // Re-trigger by posting error to let main thread retry
      self.postMessage({ type: 'error', message: 'retry' } satisfies RSAWorkerResponse)
      return
    }

    const d = modInverse(e, phi)

    self.postMessage({
      type: 'result',
      p: p.toString(),
      q: q.toString(),
      n: n.toString(),
      d: d.toString(),
      e: e.toString(),
    } satisfies RSAWorkerResponse)
  } catch (error) {
    self.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'RSA鍵生成中にエラーが発生しました。',
    } satisfies RSAWorkerResponse)
  }
}
