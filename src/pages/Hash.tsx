import { useState, useEffect } from 'react'
import StepLesson, { type LessonStep } from '../components/ui/StepLesson'
import '../components/ui/StepLesson.css'
import { sha256WithSteps, sha256WebCrypto, calculateAvalanche, type SHA256Result } from '../lib/hash/sha256'

function HashVsEncryption() {
  return (
    <>
      <p>
        まず最も大事な区別から。ハッシュ関数と暗号化は<strong>まったく違うもの</strong>です。
      </p>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>暗号化 (Encryption)</h3>
          <ul>
            <li><strong>目的:</strong> データを秘密にする</li>
            <li><strong>特徴:</strong> 鍵があれば元に戻せる</li>
            <li><strong>例:</strong> AES, RSA</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>ハッシュ関数 (Hash)</h3>
          <ul>
            <li><strong>目的:</strong> データの「指紋」を作る</li>
            <li><strong>特徴:</strong> 元に戻せない（一方向）</li>
            <li><strong>例:</strong> SHA-256, SHA-3</li>
          </ul>
        </div>
      </div>
      <div className="step-lesson__callout">
        ハッシュ関数は「データの要約」を作ります。どんなに長い入力でも、出力は常に<strong>固定長（SHA-256なら256ビット）</strong>です。
      </div>
    </>
  )
}

function ThreeProperties() {
  return (
    <>
      <p>良いハッシュ関数には3つの重要な性質があります。</p>
      <ol>
        <li>
          <strong>決定性</strong> — 同じ入力は常に同じハッシュ値になる。
          「abc」を何回ハッシュしても、結果は毎回同じです。
        </li>
        <li>
          <strong>一方向性</strong> — ハッシュ値から元のデータを復元できない。
          ハッシュ値を見ても、何を入力したかは分かりません。
        </li>
        <li>
          <strong>衝突耐性</strong> — 同じハッシュ値を持つ異なる入力を見つけるのが極めて困難。
        </li>
      </ol>
      <div className="step-lesson__callout">
        SHA-256の場合、衝突を見つけるのに必要な計算量は約 2<sup>128</sup> 回。現在のコンピュータでは事実上不可能です。
      </div>
    </>
  )
}

function AlgorithmOverview() {
  return (
    <>
      <p>
        SHA-256はメッセージを<strong>4つのステップ</strong>で処理します。
      </p>
      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div>入力: <code>&quot;abc&quot;</code></div>
          <div>　↓ <span style={{ color: 'var(--color-text-subtle)' }}>1. パディング（512bitの倍数に調整）</span></div>
          <div>　↓ <span style={{ color: 'var(--color-text-subtle)' }}>2. メッセージスケジュール（64ワード生成）</span></div>
          <div>　↓ <span style={{ color: 'var(--color-text-subtle)' }}>3. 圧縮関数（64ラウンド処理）</span></div>
          <div>　↓ <span style={{ color: 'var(--color-text-subtle)' }}>4. ハッシュ値連結</span></div>
          <div>出力: <code>ba7816bf...f20015ad</code></div>
        </div>
      </div>
      <p>
        各ステップで何が起きているか、次のスライドで実際に触って確認してみましょう。
      </p>
    </>
  )
}

function InteractiveDemo() {
  const [input, setInput] = useState('abc')
  const [result, setResult] = useState<SHA256Result | null>(null)
  const [webCryptoHash, setWebCryptoHash] = useState('')
  const [isMatch, setIsMatch] = useState(false)

  useEffect(() => {
    const r = sha256WithSteps(input)
    setResult(r)
    sha256WebCrypto(input).then(hash => {
      setWebCryptoHash(hash)
      setIsMatch(hash === r.hash)
    })
  }, [input])

  return (
    <>
      <p>実際にSHA-256を動かしてみましょう。入力を変えると、ハッシュ値がどう変わるか観察してください。</p>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>
        <label>入力テキスト:</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ハッシュ化したいテキストを入力..."
        />

        {result && (
          <>
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <label>自作 SHA-256:</label>
              <div className="step-lesson__demo-result">{result.hash}</div>
            </div>
            <div style={{ marginTop: 'var(--spacing-sm)' }}>
              <label>Web Crypto API（検証）:</label>
              <div className="step-lesson__demo-result">{webCryptoHash}</div>
            </div>
            <div style={{
              marginTop: 'var(--spacing-md)',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: isMatch ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: isMatch ? '#22c55e' : '#ef4444',
            }}>
              {isMatch ? '✓ 一致！自作実装は正しいです' : '✗ 不一致（実装エラー）'}
            </div>
          </>
        )}
      </div>

      <div className="step-lesson__callout">
        <strong>注目:</strong> 1文字変えるだけで、ハッシュ値が完全に変わることに気付きましたか？
        これが「アバランシェ効果」です。次のステップで詳しく見てみましょう。
      </div>
    </>
  )
}

function AvalancheDemo() {
  const [input1, setInput1] = useState('abc')
  const [input2, setInput2] = useState('abd')
  const [avalanche, setAvalanche] = useState<ReturnType<typeof calculateAvalanche> | null>(null)

  useEffect(() => {
    const r1 = sha256WithSteps(input1)
    const r2 = sha256WithSteps(input2)
    setAvalanche(calculateAvalanche(r1.hash, r2.hash))
  }, [input1, input2])

  return (
    <>
      <p>
        良いハッシュ関数は、入力が1ビットでも変わると、出力のビットの<strong>約50%</strong>が変化します。
        これを<strong>アバランシェ効果</strong>といいます。
      </p>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <div>
            <label>入力1:</label>
            <input type="text" value={input1} onChange={(e) => setInput1(e.target.value)} />
          </div>
          <div>
            <label>入力2:</label>
            <input type="text" value={input2} onChange={(e) => setInput2(e.target.value)} />
          </div>
        </div>

        {avalanche && (
          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            <div className="step-lesson__big-number">
              {avalanche.percentage.toFixed(1)}%
            </div>
            <div className="step-lesson__big-label">
              256ビット中 {avalanche.differentBits} ビットが異なる
            </div>

            <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} style={{ display: 'flex', gap: '2px' }}>
                  {avalanche.bitDifferences.slice(i * 32, (i + 1) * 32).map((isDiff: boolean, j: number) => (
                    <div
                      key={j}
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '2px',
                        background: isDiff ? 'var(--color-accent)' : 'var(--color-border)',
                      }}
                      title={`Bit ${i * 32 + j}`}
                    />
                  ))}
                </div>
              ))}
              <div style={{ marginTop: 'var(--spacing-sm)', fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>
                紫 = 異なるビット、灰 = 同じビット
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function RealWorldUses() {
  return (
    <>
      <p>ハッシュ関数は暗号の世界でどこにでも使われています。</p>
      <ul>
        <li>
          <strong>パスワード保管</strong> — パスワードそのものではなく、ハッシュ値を保存。
          万が一データベースが漏洩しても、元のパスワードは分からない。
        </li>
        <li>
          <strong>ファイルの完全性検証</strong> — ダウンロードしたファイルのハッシュ値を比較して、
          改ざんされていないか確認。
        </li>
        <li>
          <strong>デジタル署名</strong> — 文書全体ではなく、ハッシュ値に署名することで高速化。
        </li>
        <li>
          <strong>ブロックチェーン</strong> — 各ブロックが前のブロックのハッシュ値を含み、
          改ざん不可能なチェーンを形成。
        </li>
      </ul>
      <div className="step-lesson__callout">
        <strong>豆知識:</strong> Gitのコミットも実はSHA-1ハッシュで管理されています。
        <code>git log --oneline</code> で見えるのがそのハッシュ値です。
      </div>
    </>
  )
}

export default function Hash() {
  useEffect(() => {
    document.title = 'ハッシュ関数 - CryptoLab'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const steps: LessonStep[] = [
    {
      title: 'ハッシュ関数 ≠ 暗号化',
      content: <HashVsEncryption />,
      quiz: {
        question: 'ハッシュ関数と暗号化の最大の違いは？',
        options: [
          { label: 'ハッシュ関数のほうが処理速度が速い' },
          { label: 'ハッシュ関数は一方向で、元に戻せない', correct: true },
          { label: 'ハッシュ関数は鍵が必要ない' },
          { label: '暗号化は出力が固定長にならない' },
        ],
        explanation: '正解！ハッシュ関数は一方向関数です。暗号化は鍵があれば復号（元に戻す）できますが、ハッシュ値から元のデータを復元する方法はありません。',
      },
    },
    {
      title: 'ハッシュ関数の3つの性質',
      content: <ThreeProperties />,
      quiz: {
        question: '「衝突耐性」とは何を意味する？',
        options: [
          { label: 'ハッシュ値が他のデータとぶつかっても壊れないこと' },
          { label: '同じハッシュ値になる別の入力を見つけるのが困難なこと', correct: true },
          { label: 'ハッシュ計算が失敗しないこと' },
          { label: 'ネットワーク通信中にデータが衝突しないこと' },
        ],
        explanation: '正解！衝突耐性は「異なる入力A, Bに対して H(A) = H(B) となるペアを見つけることが計算上困難」という性質です。',
      },
    },
    {
      title: 'SHA-256のしくみ',
      content: <AlgorithmOverview />,
    },
    {
      title: '実際に試してみよう',
      content: <InteractiveDemo />,
    },
    {
      title: 'アバランシェ効果',
      content: <AvalancheDemo />,
      quiz: {
        question: '理想的なハッシュ関数で1ビット入力を変えた場合、出力の何%が変化する？',
        options: [
          { label: '約1%' },
          { label: '約25%' },
          { label: '約50%', correct: true },
          { label: '約100%' },
        ],
        explanation: '正解！理想的なアバランシェ効果では、入力を1ビット変えると出力ビットの約50%が反転します。これにより、入力の微小な変化が予測不可能な出力の変化を引き起こします。',
      },
    },
    {
      title: 'ハッシュ関数の実用例',
      content: <RealWorldUses />,
      quiz: {
        question: 'パスワードをハッシュ化して保存する理由は？',
        options: [
          { label: 'パスワードを圧縮してストレージを節約するため' },
          { label: 'データベースが漏洩しても元のパスワードが分からないようにするため', correct: true },
          { label: 'パスワードの入力ミスを検出するため' },
          { label: 'パスワードを高速に比較するため' },
        ],
        explanation: '正解！ハッシュ化されたパスワードは元に戻せないため、データベースが漏洩しても攻撃者は元のパスワードを直接知ることができません。ログイン時は入力されたパスワードをハッシュ化して保存値と比較します。',
      },
    },
  ]

  return (
    <main className="page hash">
      <StepLesson
        title="SHA-256 ハッシュ関数"
        steps={steps}
      />
    </main>
  )
}
