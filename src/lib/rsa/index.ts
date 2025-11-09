/**
 * RSA暗号化アルゴリズムの実装（教育用）
 *
 * RSAは公開鍵暗号方式の一つで、以下の数学的性質に基づいています：
 * - 大きな数の素因数分解が困難であること
 * - モジュラ演算とオイラーのφ関数
 */

/**
 * モジュラ累乗：base^exp mod modulus を計算
 * 大きな数でもオーバーフローしないように工夫
 */
export function modPow(base: bigint, exp: bigint, modulus: bigint): bigint {
  if (modulus === 1n) return 0n

  let result = 1n
  base = base % modulus

  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % modulus
    }
    exp = exp / 2n
    base = (base * base) % modulus
  }

  return result
}

/**
 * RSA鍵ペア
 */
export interface RSAKeyPair {
  publicKey: {
    e: bigint  // 公開指数
    n: bigint  // 法（modulus）
  }
  privateKey: {
    d: bigint  // 秘密指数
    n: bigint  // 法（modulus）
  }
  p: bigint  // 素数p（学習用）
  q: bigint  // 素数q（学習用）
  phi: bigint  // φ(n) = (p-1)(q-1)（学習用）
}

/**
 * 簡易的なRSA鍵生成（小さい数用）
 * 教育目的で実際の計算を確認できるように小さい素数を使用
 */
export function generateSimpleRSAKey(p: bigint, q: bigint, e: bigint = 65537n): RSAKeyPair {
  // n = p × q
  const n = p * q

  // φ(n) = (p-1) × (q-1)
  const phi = (p - 1n) * (q - 1n)

  // eとφ(n)が互いに素かチェック
  if (gcd(e, phi) !== 1n) {
    throw new Error('e and φ(n) must be coprime')
  }

  // 秘密指数d = e^(-1) mod φ(n)
  const d = modInverse(e, phi)

  return {
    publicKey: { e, n },
    privateKey: { d, n },
    p,
    q,
    phi
  }
}

/**
 * RSA暗号化: c = m^e mod n
 */
export function rsaEncrypt(message: bigint, publicKey: { e: bigint, n: bigint }): bigint {
  if (message >= publicKey.n) {
    throw new Error('Message must be smaller than n')
  }
  return modPow(message, publicKey.e, publicKey.n)
}

/**
 * RSA復号: m = c^d mod n
 */
export function rsaDecrypt(ciphertext: bigint, privateKey: { d: bigint, n: bigint }): bigint {
  return modPow(ciphertext, privateKey.d, privateKey.n)
}

/**
 * 文字列を数値に変換（簡易的な実装）
 */
export function stringToNumber(text: string): bigint {
  const bytes = new TextEncoder().encode(text)
  let result = 0n
  for (let i = 0; i < bytes.length; i++) {
    result = result * 256n + BigInt(bytes[i])
  }
  return result
}

/**
 * 数値を文字列に変換
 */
export function numberToString(num: bigint): string {
  const bytes: number[] = []
  let n = num

  while (n > 0n) {
    bytes.unshift(Number(n % 256n))
    n = n / 256n
  }

  return new TextDecoder().decode(new Uint8Array(bytes))
}

/**
 * 最大公約数（ユークリッドの互除法）
 */
function gcd(a: bigint, b: bigint): bigint {
  while (b !== 0n) {
    const temp = b
    b = a % b
    a = temp
  }
  return a
}

/**
 * 拡張ユークリッドの互除法を使ってモジュラ逆元を計算
 */
function modInverse(a: bigint, m: bigint): bigint {
  const m0 = m
  let x0 = 0n
  let x1 = 1n

  if (m === 1n) return 0n

  while (a > 1n) {
    const q = a / m
    let t = m

    m = a % m
    a = t
    t = x0

    x0 = x1 - q * x0
    x1 = t
  }

  if (x1 < 0n) x1 += m0

  return x1
}

/**
 * 簡単な素数リスト（小さい数での体験用）
 */
export const SMALL_PRIMES = [
  11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n, 43n,
  47n, 53n, 59n, 61n, 67n, 71n, 73n, 79n, 83n, 89n, 97n,
  101n, 103n, 107n, 109n, 113n, 127n, 131n, 137n, 139n,
  149n, 151n, 157n, 163n, 167n, 173n, 179n, 181n, 191n,
  193n, 197n, 199n, 211n, 223n, 227n, 229n, 233n, 239n,
  241n, 251n, 257n, 263n, 269n, 271n, 277n, 281n, 283n
]
