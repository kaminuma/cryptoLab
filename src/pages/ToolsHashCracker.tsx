import { useState, useEffect, useRef } from 'react'
import { bruteForceSHA1, estimateTime, CHARSETS, type BruteForceProgress } from '../lib/hash/bruteforce'

export default function ToolsPage() {
  // SHA-1 ブルートフォース用の状態
  const [targetHash, setTargetHash] = useState('e4c6bced9edff99746401bd077afa92860f83de3')
  const [charset, setCharset] = useState('lowercase')
  const [maxLength, setMaxLength] = useState(6)
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState<BruteForceProgress | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 推定時間の計算
  const estimation = estimateTime(CHARSETS[charset as keyof typeof CHARSETS], maxLength)

  const handleStart = async () => {
    setIsRunning(true)
    setResult(null)
    // 初期進捗を表示
    setProgress({
      checked: 0,
      current: '開始中...',
      found: false,
      elapsed: 0
    })

    abortControllerRef.current = new AbortController()

    try {
      const foundResult = await bruteForceSHA1({
        target: targetHash,
        charset: CHARSETS[charset as keyof typeof CHARSETS],
        maxLength,
        onProgress: (p) => setProgress(p),
        progressInterval: 5000, // 5,000回ごとに更新してUIをスムーズに
        signal: abortControllerRef.current.signal
      })

      if (foundResult) {
        setResult(foundResult)
      } else {
        setResult('見つかりませんでした')
      }
    } catch (error) {
      console.error('Brute force error:', error)
    } finally {
      setIsRunning(false)
      abortControllerRef.current = null
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsRunning(false)
  }

  useEffect(() => {
    document.title = 'ハッシュクラッカー - CryptoLab'
    window.scrollTo({ top: 0, behavior: 'instant' })
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const formatNumber = (num: number) => {
    return num.toLocaleString('ja-JP')
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}秒`
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}分`
    if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}時間`
    return `${(seconds / 86400).toFixed(1)}日`
  }

  return (
    <main className="page tools-cracker">
      <header className="page-header">
        <p className="eyebrow">[ SECURITY_RESEARCH: HASH_CRACKER ]</p>
        <h1>ハッシュクラッキング・ラボ</h1>
        <p className="lede">
          ブルートフォース攻撃の理論と実践。
          計算資源と時間のトレードオフを体感し、ハッシュ関数の安全性とパスワードポリシーの重要性を学ぶ。
        </p>
      </header>

      {/* 倫理的使用に関する警告 */}
      <section className="card" style={{ borderLeft: '4px solid var(--color-accent)' }}>
        <h2 style={{ color: 'var(--color-accent)' }}>⚠️ 倫理的使用について</h2>

        <div style={{ lineHeight: '1.8' }}>
          <p style={{ marginBottom: '16px', fontWeight: 'bold' }}>
            このツールは以下の目的でのみ使用してください：
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li>CTF競技の問題解決</li>
            <li>承認されたペネトレーションテスト</li>
            <li>自分自身のシステムのセキュリティ検証</li>
            <li>セキュリティ研究・教育</li>
          </ul>
          <p className="callout callout-warning" style={{ fontWeight: 'bold' }}>
            他人のシステムへの不正アクセスは犯罪です。不正アクセス禁止法により処罰されます。
          </p>
        </div>
      </section>

      {/* ツールの説明 */}
      <section className="card">
        <h2 style={{ color: 'var(--color-primary)' }}>🔍 ブルートフォース攻撃とは</h2>

        <div style={{ lineHeight: '1.8' }}>
          <p style={{ marginBottom: '16px' }}>
            ブルートフォース（総当たり）攻撃は、可能な組み合わせを全て試す手法です。
            短いパスワードや弱い暗号化には有効ですが、計算量が指数関数的に増加します。
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div className="callout">
              <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--color-primary)' }}>攻撃側の視点</h3>
              <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                <li>弱いパスワードを見つける</li>
                <li>計算コストが低い</li>
                <li>自動化が容易</li>
              </ul>
            </div>

            <div className="callout">
              <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--color-success)' }}>防御側の対策</h3>
              <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                <li>長く複雑なパスワード使用</li>
                <li>ソルトの追加（レインボーテーブル対策）</li>
                <li>bcrypt/Argon2など計算コストの高いハッシュ関数</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ブルートフォースツール */}
      <section className="card">
        <h2 style={{ color: 'var(--color-primary)' }}>SHA-1 ブルートフォース</h2>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            ターゲットハッシュ (SHA-1)
          </label>
          <input
            type="text"
            value={targetHash}
            onChange={(e) => setTargetHash(e.target.value)}
            placeholder="e4c6bced9edff99746401bd077afa92860f83de3"
            disabled={isRunning}
            className="text-input"
            style={{
              maxWidth: '600px',
              fontFamily: 'monospace'
            }}
          />
          <p style={{ color: 'var(--color-text-subtle)', fontSize: '13px', marginTop: '4px' }}>
            例: e4c6bced9edff99746401bd077afa92860f83de3 (解答: "Shal")<br />
            <span style={{ fontSize: '11px' }}>
              出典: <a href="https://ctf.cpaw.site/index.php" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-link)' }}>
                CPAW CTF Q12
              </a>
            </span>
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              文字セット
            </label>
            <select
              value={charset}
              onChange={(e) => setCharset(e.target.value)}
              disabled={isRunning}
              className="text-input"
              style={{
                maxWidth: '300px'
              }}
            >
              <option value="lowercase">小文字のみ (a-z)</option>
              <option value="uppercase">大文字のみ (A-Z)</option>
              <option value="digits">数字のみ (0-9)</option>
              <option value="alphanumericLower">小文字+数字 (a-z0-9)</option>
              <option value="alphanumeric">英数字 (a-zA-Z0-9)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              最大文字数
            </label>
            <input
              type="number"
              min="1"
              max="8"
              value={maxLength}
              onChange={(e) => setMaxLength(parseInt(e.target.value))}
              disabled={isRunning}
              className="text-input"
              style={{
                maxWidth: '120px'
              }}
            />
          </div>
        </div>

        {/* 推定情報 */}
        <div className="callout" style={{
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-text-subtle)' }}>
            推定情報
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
            <div>
              <span style={{ color: 'var(--color-text-subtle)' }}>総組み合わせ数:</span>{' '}
              <span style={{ fontWeight: 'bold' }}>{formatNumber(estimation.totalCombinations)}</span>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-subtle)' }}>推定時間:</span>{' '}
              <span style={{ fontWeight: 'bold', color: estimation.estimatedSeconds > 3600 ? 'var(--color-accent)' : 'var(--color-success)' }}>
                {formatTime(estimation.estimatedSeconds)}
              </span>
            </div>
          </div>
          <p style={{ color: 'var(--color-text-subtle)', fontSize: '12px', marginTop: '8px' }}>
            ※ 10,000 hashes/秒で計算した参考値です
          </p>
        </div>

        {/* 実行ボタン */}
        <div style={{ marginBottom: '24px' }}>
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={!targetHash}
              className="primary"
              style={{
                width: 'auto'
              }}
            >
              🚀 攻撃開始
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="primary"
              style={{
                width: 'auto',
                background: 'var(--color-accent)'
              }}
            >
              ⏹ 停止
            </button>
          )}
        </div>

        {/* 進捗表示 */}
        {(progress || isRunning) && (
          <div className={`callout ${isRunning ? 'callout-info' : ''}`} style={{
            animation: isRunning ? 'pulse 2s infinite' : 'none'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {isRunning && <span style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'var(--color-primary)',
                animation: 'blink 1s infinite'
              }} />}
              {isRunning ? '🔄 攻撃実行中...' : '進捗状況'}
            </h3>
            {progress ? (
              <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                <div>
                  <span style={{ color: 'var(--color-text-subtle)' }}>試行回数:</span>{' '}
                  <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {formatNumber(progress.checked)}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-subtle)' }}>現在の候補:</span>{' '}
                  <span style={{ fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--color-primary)' }}>
                    {progress.current}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-subtle)' }}>経過時間:</span>{' '}
                  <span style={{ fontWeight: 'bold' }}>
                    {formatTime(progress.elapsed / 1000)}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-subtle)' }}>速度:</span>{' '}
                  <span style={{ fontWeight: 'bold' }}>
                    {progress.elapsed > 0 ? formatNumber(Math.floor(progress.checked / (progress.elapsed / 1000))) : '0'} hashes/秒
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--color-text-subtle)', fontSize: '14px' }}>
                準備中...
              </div>
            )}
          </div>
        )}

        {/* 結果表示 */}
        {result && (
          <div className={`callout ${result === '見つかりませんでした' ? 'callout-warning' : 'callout-success'}`} style={{
            marginTop: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '8px'
            }}>
              {result === '見つかりませんでした' ? '❌ 見つかりませんでした' : '✅ 発見！'}
            </h3>
            {result !== '見つかりませんでした' && (
              <div>
                <p style={{ color: 'var(--color-text-subtle)', marginBottom: '8px' }}>元の文字列:</p>
                <div className="callout" style={{
                  fontFamily: 'monospace',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: 'var(--color-success)',
                  textAlign: 'center'
                }}>
                  {result}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
