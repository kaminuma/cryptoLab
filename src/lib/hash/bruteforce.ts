/**
 * SHA-1 ブルートフォース攻撃ツール（教育用）
 *
 * ⚠️ 倫理的使用について：
 * このツールは以下の目的でのみ使用してください：
 * - CTF競技の問題解決
 * - 承認されたペネトレーションテスト
 * - 自分自身のシステムのセキュリティ検証
 * - セキュリティ研究・教育
 *
 * 他人のシステムへの不正アクセスは犯罪です。
 */

export type BruteForceProgress = {
  checked: number
  current: string
  found: boolean
  result?: string
  elapsed: number
}

export type BruteForceOptions = {
  target: string
  charset: string
  maxLength: number
  onProgress?: (progress: BruteForceProgress) => void
  progressInterval?: number
  signal?: AbortSignal
}

/**
 * SHA-1ハッシュを計算（Web Crypto API使用）
 */
async function sha1(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * 文字列の組み合わせを生成するジェネレータ
 */
function* generateCombinations(charset: string, length: number): Generator<string> {
  const chars = charset.split('')
  const total = Math.pow(chars.length, length)

  for (let i = 0; i < total; i++) {
    let num = i
    let combination = ''

    for (let j = 0; j < length; j++) {
      combination = chars[num % chars.length] + combination
      num = Math.floor(num / chars.length)
    }

    yield combination
  }
}

/**
 * イベントループに制御を返すヘルパー関数
 */
function sleep(ms: number = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * SHA-1ブルートフォース攻撃を実行
 */
export async function bruteForceSHA1(options: BruteForceOptions): Promise<string | null> {
  const {
    target,
    charset,
    maxLength,
    onProgress,
    progressInterval = 100000,
    signal
  } = options

  const startTime = Date.now()
  let checked = 0
  let current = ''

  try {
    for (let length = 1; length <= maxLength; length++) {
      for (const candidate of generateCombinations(charset, length)) {
        // 中断シグナルをチェック
        if (signal?.aborted) {
          throw new DOMException('Aborted', 'AbortError')
        }

        current = candidate
        const hash = await sha1(candidate)
        checked++

        // 進捗報告とUIの更新（イベントループに制御を返す）
        if (onProgress && checked % progressInterval === 0) {
          const elapsed = Date.now() - startTime
          onProgress({
            checked,
            current,
            found: false,
            elapsed
          })
          // UIをブロックしないよう、定期的に制御を返す
          await sleep(0)
        }

        // ハッシュが一致したら結果を返す
        if (hash === target.toLowerCase()) {
          const elapsed = Date.now() - startTime
          if (onProgress) {
            onProgress({
              checked,
              current: candidate,
              found: true,
              result: candidate,
              elapsed
            })
          }
          return candidate
        }
      }
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.log('Brute force attack aborted')
      return null
    }
    throw error
  }

  // 見つからなかった
  const elapsed = Date.now() - startTime
  if (onProgress) {
    onProgress({
      checked,
      current,
      found: false,
      elapsed
    })
  }

  return null
}

/**
 * 推定時間を計算（参考値）
 */
export function estimateTime(charset: string, maxLength: number, hashesPerSecond: number = 10000): {
  totalCombinations: number
  estimatedSeconds: number
  estimatedMinutes: number
  estimatedHours: number
} {
  const charsetSize = charset.length
  let totalCombinations = 0

  for (let length = 1; length <= maxLength; length++) {
    totalCombinations += Math.pow(charsetSize, length)
  }

  const estimatedSeconds = totalCombinations / hashesPerSecond

  return {
    totalCombinations,
    estimatedSeconds,
    estimatedMinutes: estimatedSeconds / 60,
    estimatedHours: estimatedSeconds / 3600
  }
}

/**
 * 事前定義された文字セット
 */
export const CHARSETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  alphanumeric: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  alphanumericLower: 'abcdefghijklmnopqrstuvwxyz0123456789',
  printable: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'
}
