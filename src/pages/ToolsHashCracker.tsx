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
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 16px' }}>
      <section style={{ marginBottom: '48px' }}>
        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>CTF Tools</p>
        <h1 style={{ fontSize: '36px', marginBottom: '12px', color: '#0f172a' }}>ハッシュクラッキングツール</h1>
        <p style={{ color: '#64748b', fontSize: '18px', lineHeight: '1.6' }}>
          CTF競技やセキュリティ研究のための教育用ツールです。
        </p>
      </section>

      {/* 倫理的使用に関する警告 */}
      <section style={{
        background: 'rgba(239, 68, 68, 0.05)',
        padding: '24px',
        borderRadius: '8px',
        marginBottom: '32px',
        border: '2px solid #ef4444'
      }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚠️ 倫理的使用について
        </h2>

        <div style={{ color: '#475569', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '16px', fontWeight: 'bold' }}>
            このツールは以下の目的でのみ使用してください：
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li>CTF競技の問題解決</li>
            <li>承認されたペネトレーションテスト</li>
            <li>自分自身のシステムのセキュリティ検証</li>
            <li>セキュリティ研究・教育</li>
          </ul>
          <p style={{
            padding: '12px',
            background: 'rgba(220, 38, 38, 0.1)',
            borderRadius: '4px',
            border: '1px solid #dc2626',
            color: '#dc2626',
            fontWeight: 'bold'
          }}>
            他人のシステムへの不正アクセスは犯罪です。不正アクセス禁止法により処罰されます。
          </p>
        </div>
      </section>

      {/* ツールの説明 */}
      <section style={{
        background: 'rgba(37, 99, 235, 0.05)',
        padding: '24px',
        borderRadius: '8px',
        marginBottom: '32px',
        border: '1px solid #cbd5e1'
      }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', color: '#2563eb' }}>
          🔍 ブルートフォース攻撃とは
        </h2>

        <div style={{ color: '#475569', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '16px' }}>
            ブルートフォース（総当たり）攻撃は、可能な組み合わせを全て試す手法です。
            短いパスワードや弱い暗号化には有効ですが、計算量が指数関数的に増加します。
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
            <div style={{ background: '#fff', padding: '16px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '8px', color: '#2563eb' }}>攻撃側の視点</h3>
              <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                <li>弱いパスワードを見つける</li>
                <li>計算コストが低い</li>
                <li>自動化が容易</li>
              </ul>
            </div>

            <div style={{ background: '#fff', padding: '16px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '8px', color: '#16a34a' }}>防御側の対策</h3>
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
      <section style={{
        background: '#fff',
        padding: '32px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '24px', color: '#0f172a' }}>
          SHA-1 ブルートフォース
        </h2>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#0f172a' }}>
            ターゲットハッシュ (SHA-1)
          </label>
          <input
            type="text"
            value={targetHash}
            onChange={(e) => setTargetHash(e.target.value)}
            placeholder="e4c6bced9edff99746401bd077afa92860f83de3"
            disabled={isRunning}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              fontFamily: 'monospace',
              background: isRunning ? '#f8fafc' : '#fff',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              color: '#0f172a'
            }}
          />
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>
            例: e4c6bced9edff99746401bd077afa92860f83de3 (解答: "Shal")<br />
            <span style={{ fontSize: '11px' }}>
              出典: <a href="https://ctf.cpaw.site/index.php" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
                CPAW CTF Q12
              </a>
            </span>
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#0f172a' }}>
              文字セット
            </label>
            <select
              value={charset}
              onChange={(e) => setCharset(e.target.value)}
              disabled={isRunning}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                background: isRunning ? '#f8fafc' : '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                color: '#0f172a'
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
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#0f172a' }}>
              最大文字数
            </label>
            <input
              type="number"
              min="1"
              max="8"
              value={maxLength}
              onChange={(e) => setMaxLength(parseInt(e.target.value))}
              disabled={isRunning}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                background: isRunning ? '#f8fafc' : '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                color: '#0f172a'
              }}
            />
          </div>
        </div>

        {/* 推定情報 */}
        <div style={{
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '4px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#64748b' }}>
            推定情報
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
            <div>
              <span style={{ color: '#64748b' }}>総組み合わせ数:</span>{' '}
              <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{formatNumber(estimation.totalCombinations)}</span>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>推定時間:</span>{' '}
              <span style={{ fontWeight: 'bold', color: estimation.estimatedSeconds > 3600 ? '#dc2626' : '#16a34a' }}>
                {formatTime(estimation.estimatedSeconds)}
              </span>
            </div>
          </div>
          <p style={{ color: '#64748b', fontSize: '12px', marginTop: '8px' }}>
            ※ 10,000 hashes/秒で計算した参考値です
          </p>
        </div>

        {/* 実行ボタン */}
        <div style={{ marginBottom: '24px' }}>
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={!targetHash}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                background: targetHash ? '#2563eb' : '#cbd5e1',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: targetHash ? 'pointer' : 'not-allowed'
              }}
            >
              🚀 攻撃開始
            </button>
          ) : (
            <button
              onClick={handleStop}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ⏹ 停止
            </button>
          )}
        </div>

        {/* 進捗表示 */}
        {(progress || isRunning) && (
          <div style={{
            background: isRunning ? 'rgba(37, 99, 235, 0.05)' : '#f8fafc',
            padding: '20px',
            borderRadius: '4px',
            border: isRunning ? '2px solid #2563eb' : '1px solid #e2e8f0',
            animation: isRunning ? 'pulse 2s infinite' : 'none'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '12px',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {isRunning && <span style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#2563eb',
                animation: 'blink 1s infinite'
              }} />}
              {isRunning ? '🔄 攻撃実行中...' : '進捗状況'}
            </h3>
            {progress ? (
              <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                <div>
                  <span style={{ color: '#64748b' }}>試行回数:</span>{' '}
                  <span style={{ fontWeight: 'bold', fontFamily: 'monospace', color: '#0f172a' }}>
                    {formatNumber(progress.checked)}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>現在の候補:</span>{' '}
                  <span style={{ fontWeight: 'bold', fontFamily: 'monospace', color: '#2563eb' }}>
                    {progress.current}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>経過時間:</span>{' '}
                  <span style={{ fontWeight: 'bold', color: '#0f172a' }}>
                    {formatTime(progress.elapsed / 1000)}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>速度:</span>{' '}
                  <span style={{ fontWeight: 'bold', color: '#0f172a' }}>
                    {progress.elapsed > 0 ? formatNumber(Math.floor(progress.checked / (progress.elapsed / 1000))) : '0'} hashes/秒
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ color: '#64748b', fontSize: '14px' }}>
                準備中...
              </div>
            )}
          </div>
        )}

        {/* 結果表示 */}
        {result && (
          <div style={{
            marginTop: '24px',
            padding: '20px',
            background: result === '見つかりませんでした' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(34, 197, 94, 0.05)',
            borderRadius: '4px',
            border: `2px solid ${result === '見つかりませんでした' ? '#ef4444' : '#22c55e'}`
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: result === '見つかりませんでした' ? '#dc2626' : '#16a34a'
            }}>
              {result === '見つかりませんでした' ? '❌ 見つかりませんでした' : '✅ 発見！'}
            </h3>
            {result !== '見つかりませんでした' && (
              <div>
                <p style={{ color: '#64748b', marginBottom: '8px' }}>元の文字列:</p>
                <div style={{
                  padding: '12px',
                  background: '#fff',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#16a34a',
                  border: '1px solid #22c55e'
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
