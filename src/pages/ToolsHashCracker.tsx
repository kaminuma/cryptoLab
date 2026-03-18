import { useState, useEffect, useRef } from 'react'
import StepLesson, { type LessonStep } from '../components/ui/StepLesson'
import '../components/ui/StepLesson.css'
import { bruteForceSHA1, estimateTime, CHARSETS, type BruteForceProgress } from '../lib/hash/bruteforce'

function WhatIsHashCracking() {
  return (
    <>
      <p>
        ハッシュクラッキングとは、ハッシュ値から<strong>元の入力データを特定</strong>する試みです。
        ハッシュ関数は一方向関数なので、数学的に「逆算」することはできませんが、
        考えられる入力を片っ端から試すことで元の値を見つけることができます。
      </p>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>ハッシュ関数の性質</h3>
          <ul>
            <li><strong>一方向性:</strong> ハッシュ値から元データを復元できない</li>
            <li><strong>決定性:</strong> 同じ入力は常に同じハッシュ値</li>
            <li><strong>高速:</strong> 計算が速い（これが弱点にもなる）</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>クラッキングの原理</h3>
          <ul>
            <li><strong>総当たり:</strong> 全ての候補を試す</li>
            <li><strong>比較:</strong> 候補のハッシュ値とターゲットを比較</li>
            <li><strong>一致:</strong> 同じハッシュ値が見つかれば成功</li>
          </ul>
        </div>
      </div>
      <div className="step-lesson__callout">
        <strong>注意:</strong> ハッシュクラッキングの知識はセキュリティ防御に不可欠ですが、
        他人のシステムへの不正アクセスは犯罪です。不正アクセス禁止法により処罰されます。
      </div>
    </>
  )
}

function AttackMethods() {
  return (
    <>
      <p>ハッシュクラッキングには主に2つのアプローチがあります。</p>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>辞書攻撃 (Dictionary Attack)</h3>
          <ul>
            <li>よく使われるパスワードのリストを使用</li>
            <li>「password」「123456」「admin」などを試す</li>
            <li>高速だが、リストにない文字列は見つからない</li>
            <li>実際の漏洩データを元にした辞書が存在</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>ブルートフォース (Brute Force)</h3>
          <ul>
            <li>全ての組み合わせを順番に試す</li>
            <li>「a」「b」...「aa」「ab」...と網羅的に探索</li>
            <li>確実だが、文字数が増えると指数関数的に遅くなる</li>
            <li>時間さえあれば必ず見つかる</li>
          </ul>
        </div>
      </div>
      <div className="step-lesson__callout">
        <strong>計算量の爆発:</strong> 小文字26文字で6文字のパスワードを総当たりすると
        26<sup>6</sup> = 約3億通り。大文字+小文字+数字+記号で12文字なら、
        宇宙の年齢をかけても終わりません。
      </div>
    </>
  )
}

function InteractiveHashCrackerDemo() {
  const [targetHash, setTargetHash] = useState('e4c6bced9edff99746401bd077afa92860f83de3')
  const [charset, setCharset] = useState('lowercase')
  const [maxLength, setMaxLength] = useState(6)
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState<BruteForceProgress | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const estimation = estimateTime(CHARSETS[charset as keyof typeof CHARSETS], maxLength)

  const formatNumber = (num: number) => {
    return num.toLocaleString('ja-JP')
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}秒`
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}分`
    if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}時間`
    return `${(seconds / 86400).toFixed(1)}日`
  }

  const handleStart = async () => {
    setIsRunning(true)
    setResult(null)
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
        progressInterval: 5000,
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
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return (
    <>
      <p>実際にSHA-1ハッシュのブルートフォース攻撃を体験してみましょう。</p>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>

        <label htmlFor="target-hash">ターゲットハッシュ (SHA-1)</label>
        <input
          id="target-hash"
          type="text"
          value={targetHash}
          onChange={(e) => setTargetHash(e.target.value)}
          placeholder="e4c6bced9edff99746401bd077afa92860f83de3"
          disabled={isRunning}
        />
        <p className="step-lesson__demo-result">
          例: e4c6bced9edff99746401bd077afa92860f83de3 (解答: &quot;Shal&quot;)
        </p>

        <div className="step-lesson__comparison">
          <div className="step-lesson__comparison-item">
            <label htmlFor="charset-select">文字セット</label>
            <select
              id="charset-select"
              value={charset}
              onChange={(e) => setCharset(e.target.value)}
              disabled={isRunning}
            >
              <option value="lowercase">小文字のみ (a-z)</option>
              <option value="uppercase">大文字のみ (A-Z)</option>
              <option value="digits">数字のみ (0-9)</option>
              <option value="alphanumericLower">小文字+数字 (a-z0-9)</option>
              <option value="alphanumeric">英数字 (a-zA-Z0-9)</option>
            </select>
          </div>

          <div className="step-lesson__comparison-item">
            <label htmlFor="max-length">最大文字数</label>
            <input
              id="max-length"
              type="number"
              min={1}
              max={8}
              value={maxLength}
              onChange={(e) => setMaxLength(parseInt(e.target.value))}
              disabled={isRunning}
            />
          </div>
        </div>

        <div className="step-lesson__callout">
          <strong>推定情報:</strong> 総組み合わせ数: {formatNumber(estimation.totalCombinations)} /
          推定時間: {formatTime(estimation.estimatedSeconds)}
          (10,000 hashes/秒で計算した参考値)
        </div>

        <div>
          {!isRunning ? (
            <button
              onClick={handleStart}
              disabled={!targetHash}
              className="step-lesson__demo-btn step-lesson__demo-btn--primary"
            >
              攻撃開始
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="step-lesson__demo-btn step-lesson__demo-btn--secondary"
            >
              停止
            </button>
          )}
        </div>

        {(progress || isRunning) && (
          <div className="step-lesson__callout">
            <strong>{isRunning ? '攻撃実行中...' : '進捗状況'}</strong>
            {progress && (
              <ul>
                <li>試行回数: <code>{formatNumber(progress.checked)}</code></li>
                <li>現在の候補: <code>{progress.current}</code></li>
                <li>経過時間: {formatTime(progress.elapsed / 1000)}</li>
                <li>速度: {progress.elapsed > 0 ? formatNumber(Math.floor(progress.checked / (progress.elapsed / 1000))) : '0'} hashes/秒</li>
              </ul>
            )}
          </div>
        )}

        {result && (
          <div className="step-lesson__callout">
            {result === '見つかりませんでした' ? (
              <strong>見つかりませんでした</strong>
            ) : (
              <>
                <strong>発見！ 元の文字列:</strong>
                <div className="step-lesson__big-number">{result}</div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}

function DefenseStrategies() {
  return (
    <>
      <p>
        ブルートフォース攻撃からパスワードを守るために、2つの重要な防御技術があります。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>ソルト (Salt)</h3>
          <ul>
            <li>パスワードにランダムな文字列を付加してからハッシュ化</li>
            <li>同じパスワードでも異なるハッシュ値になる</li>
            <li>レインボーテーブル攻撃を無効化</li>
            <li>ソルト自体は秘密にする必要がない</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>キーストレッチング (Key Stretching)</h3>
          <ul>
            <li>ハッシュ計算を意図的に遅くする</li>
            <li>bcrypt, Argon2, PBKDF2 などのアルゴリズム</li>
            <li>1回のログインには問題ない遅さ</li>
            <li>大量の総当たりには致命的に遅くなる</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__visual">
        <div>
          <p><strong>SHA-256 (ソルトなし):</strong></p>
          <p><code>hash(&quot;password&quot;) → 5e884...</code></p>
          <p><code>hash(&quot;password&quot;) → 5e884...</code> (同じ！)</p>
        </div>
        <div>
          <p><strong>SHA-256 + ソルト:</strong></p>
          <p><code>hash(&quot;password&quot; + &quot;x8k2&quot;) → a3f91...</code></p>
          <p><code>hash(&quot;password&quot; + &quot;m7q9&quot;) → 7bc42...</code> (異なる！)</p>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>現代のベストプラクティス:</strong> パスワードの保存には
        bcrypt や Argon2 を使いましょう。これらはソルトの自動生成とキーストレッチングの両方を内蔵しています。
        生のSHA-256やMD5でパスワードを保存するのは危険です。
      </div>
    </>
  )
}

export default function ToolsPage() {
  useEffect(() => {
    document.title = 'ハッシュクラッカー - CryptoLab'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const steps: LessonStep[] = [
    {
      title: 'ハッシュクラッキングとは？',
      content: <WhatIsHashCracking />,
      quiz: {
        question: 'ハッシュクラッキングはなぜ可能なのか？',
        options: [
          { label: 'ハッシュ関数を数学的に逆算できるから' },
          { label: '同じ入力は常に同じハッシュ値になるため、候補を試して比較できるから', correct: true },
          { label: 'ハッシュ関数には必ず脆弱性があるから' },
          { label: 'ハッシュ値に元のデータが含まれているから' },
        ],
        explanation: '正解！ハッシュ関数の「決定性」（同じ入力 → 同じ出力）を利用して、考えられる入力を片っ端からハッシュ化し、ターゲットと比較することでクラッキングが可能になります。',
      },
    },
    {
      title: '辞書攻撃 vs ブルートフォース',
      content: <AttackMethods />,
      quiz: {
        question: 'ブルートフォース攻撃の最大の弱点は？',
        options: [
          { label: '特定のハッシュ関数にしか使えない' },
          { label: 'インターネット接続が必要' },
          { label: '文字数が増えると計算量が指数関数的に増加する', correct: true },
          { label: '辞書ファイルが必要' },
        ],
        explanation: '正解！ブルートフォースは確実ですが、パスワードの長さが1文字増えるだけで計算量が文字セットのサイズ分だけ倍増します。これが長く複雑なパスワードが推奨される理由です。',
      },
    },
    {
      title: 'SHA-1 ブルートフォース体験',
      content: <InteractiveHashCrackerDemo />,
    },
    {
      title: '防御策: ソルトとキーストレッチング',
      content: <DefenseStrategies />,
      quiz: {
        question: 'ソルトの役割として正しいものは？',
        options: [
          { label: 'パスワードを暗号化する' },
          { label: 'ハッシュ計算を遅くする' },
          { label: '同じパスワードでも異なるハッシュ値を生成し、レインボーテーブル攻撃を防ぐ', correct: true },
          { label: 'パスワードの文字数を増やす' },
        ],
        explanation: '正解！ソルトはパスワードにランダムな値を付加することで、同じパスワードでも異なるハッシュ値を生成します。これにより、事前計算されたレインボーテーブルが使えなくなります。',
      },
    },
  ]

  return (
    <main className="page tools-cracker">
      <StepLesson
        title="ハッシュクラッキング・ラボ"
        steps={steps}
      />
    </main>
  )
}
