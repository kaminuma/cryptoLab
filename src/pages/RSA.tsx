import { useState, useEffect, useRef } from 'react'
import StepLesson, { type LessonStep } from '../components/ui/StepLesson'
import '../components/ui/StepLesson.css'
import {
  generateSimpleRSAKey,
  rsaEncrypt,
  rsaDecrypt,
  SMALL_PRIMES,
  type RSAKeyPair
} from '@/lib/rsa'
import type { RSAWorkerResponse } from '@/workers/rsaKeyGen.worker'
import RSAKeyGenWorker from '@/workers/rsaKeyGen.worker?worker'

type Status = 'idle' | 'generating' | 'completed' | 'error'

const formatBigInt = (value: bigint, group = 64) => {
  const text = value.toString(16).toUpperCase()
  return text.replace(new RegExp(`.{1,${group}}`, 'g'), '$&\n').trim()
}

/* =========================================
   Step 1: 公開鍵暗号とは
   ========================================= */
function PublicKeyCryptography() {
  return (
    <>
      <p>
        従来の暗号（共通鍵暗号）では、暗号化と復号に<strong>同じ鍵</strong>を使います。
        これは「鍵をどうやって安全に共有するか」という問題（鍵配送問題）を抱えていました。
      </p>
      <p>
        1977年、Ron Rivest、Adi Shamir、Leonard Adlemanの3人が発明したRSAは、
        <strong>異なる鍵</strong>を使う画期的な暗号方式です。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>公開鍵（Public Key）</h3>
          <ul>
            <li><strong>誰でも知ってOK</strong></li>
            <li>暗号化に使用</li>
            <li>メッセージの検証に使用</li>
            <li>公開ディレクトリに登録可能</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>秘密鍵（Private Key）</h3>
          <ul>
            <li><strong>本人だけが知っている</strong></li>
            <li>復号に使用</li>
            <li>署名の生成に使用</li>
            <li>絶対に秘密にする</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>RSAの革新性：</strong>
        公開鍵で暗号化したデータは、対応する秘密鍵でしか復号できません。
        つまり、鍵を安全に配送する必要がなくなりました。
      </div>
    </>
  )
}

/* =========================================
   Step 2: RSAの数学的基礎
   ========================================= */
function MathFoundations() {
  return (
    <>
      <p>RSAの安全性は、いくつかの数学的概念に基づいています。</p>

      <ol>
        <li>
          <strong>素数（Prime Number）</strong> — 1とその数自身以外に約数を持たない自然数。
          RSAでは2つの大きな素数p, qを選び、その積 n = p x q を公開鍵の一部にします。
        </li>
        <li>
          <strong>モジュラ演算（剰余演算）</strong> — 割り算の余りを扱う演算。
          <code>17 mod 5 = 2</code> のように表記します。
        </li>
        <li>
          <strong>オイラーのφ関数</strong> — φ(n)は、n以下の正の整数のうちnと互いに素であるものの個数。
          p, qが異なる素数のとき <strong>φ(p x q) = (p - 1) x (q - 1)</strong> です。
        </li>
        <li>
          <strong>モジュラ逆元</strong> — a x d ≡ 1 (mod n) を満たす数dのこと。
          RSAでは秘密指数dがこれにあたります。
        </li>
      </ol>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2', textAlign: 'left', display: 'inline-block' }}>
          <div>例: p = 61, q = 53</div>
          <div>n = 61 x 53 = 3233</div>
          <div>φ(n) = 60 x 52 = 3120</div>
          <div>e = 17 (gcd(17, 3120) = 1)</div>
          <div>d = 2753 (17 x 2753 mod 3120 = 1)</div>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>nからp, qを求める（素因数分解）のが非常に困難</strong>であることが、RSAの安全性の根拠です。
      </div>
    </>
  )
}

/* =========================================
   Step 3: RSA鍵生成アルゴリズム
   ========================================= */
function KeyGenAlgorithm() {
  return (
    <>
      <p>RSAは鍵生成、暗号化、復号の3つのステップから成り立っています。</p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div>1. 大きな素数 p, q を選ぶ</div>
          <div>2. n = p x q を計算</div>
          <div>3. φ(n) = (p-1)(q-1) を計算</div>
          <div>4. gcd(e, φ(n)) = 1 となる e を選ぶ</div>
          <div>5. e x d ≡ 1 (mod φ(n)) となる d を計算</div>
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            公開鍵: (e, n) / 秘密鍵: (d, n)
          </div>
        </div>
      </div>

      <p>
        暗号化は <code>c = m^e mod n</code>、復号は <code>m = c^d mod n</code> で行います。
      </p>

      <div className="step-lesson__callout">
        <strong>なぜ正しく復号できるのか？</strong>{' '}
        e x d ≡ 1 (mod φ(n)) という関係と、オイラーの定理により、
        (m<sup>e</sup>)<sup>d</sup> = m<sup>ed</sup> ≡ m (mod n) が成り立ちます。
        つまり「eで累乗してdで累乗すると元に戻る」のです。
      </div>

      <p>
        公開指数eには慣例的に <strong>65537</strong>（2<sup>16</sup> + 1）がよく使われます。
        バイナリ表現でビットが2つしか立たないため、暗号化の計算が高速です。
      </p>
    </>
  )
}

/* =========================================
   Step 4: 小さい数でのインタラクティブデモ
   ========================================= */
function SmallNumberDemo() {
  const [selectedP, setSelectedP] = useState<bigint>(61n)
  const [selectedQ, setSelectedQ] = useState<bigint>(53n)
  const [simpleKeys, setSimpleKeys] = useState<RSAKeyPair | null>(null)
  const [message, setMessage] = useState<bigint>(65n)
  const [encrypted, setEncrypted] = useState<bigint | null>(null)
  const [decrypted, setDecrypted] = useState<bigint | null>(null)

  const generateKeys = () => {
    try {
      const keys = generateSimpleRSAKey(selectedP, selectedQ)
      setSimpleKeys(keys)
      setEncrypted(null)
      setDecrypted(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : '鍵生成エラー')
    }
  }

  const encrypt = () => {
    if (!simpleKeys) return
    try {
      const c = rsaEncrypt(message, simpleKeys.publicKey)
      setEncrypted(c)
      setDecrypted(null)
    } catch (error) {
      alert(error instanceof Error ? error.message : '暗号化エラー')
    }
  }

  const decrypt = () => {
    if (!simpleKeys || encrypted === null) return
    try {
      const m = rsaDecrypt(encrypted, simpleKeys.privateKey)
      setDecrypted(m)
    } catch (error) {
      alert(error instanceof Error ? error.message : '復号エラー')
    }
  }

  return (
    <>
      <p>実際にRSAの計算を確認できるよう、小さい素数を使って鍵を生成してみましょう。</p>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>

        <label>素数 p を選択:</label>
        <select
          value={selectedP.toString()}
          onChange={(e) => { setSelectedP(BigInt(e.target.value)); setSimpleKeys(null); setEncrypted(null); setDecrypted(null) }}
        >
          {SMALL_PRIMES.map(p => (
            <option key={p.toString()} value={p.toString()}>{p.toString()}</option>
          ))}
        </select>

        <div style={{ marginTop: 'var(--spacing-md)' }}>
          <label>素数 q を選択:</label>
          <select
            value={selectedQ.toString()}
            onChange={(e) => { setSelectedQ(BigInt(e.target.value)); setSimpleKeys(null); setEncrypted(null); setDecrypted(null) }}
          >
            {SMALL_PRIMES.map(q => (
              <option key={q.toString()} value={q.toString()}>{q.toString()}</option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 'var(--spacing-lg)' }}>
          <button onClick={generateKeys} className="primary" style={{ width: '100%' }}>
            鍵を生成
          </button>
        </div>

        {simpleKeys && (
          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            <div className="step-lesson__demo-result">
              <div>p = {simpleKeys.p.toString()}, q = {simpleKeys.q.toString()}</div>
              <div>n = p x q = {simpleKeys.publicKey.n.toString()}</div>
              <div>φ(n) = (p-1)(q-1) = {simpleKeys.phi.toString()}</div>
              <div style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>
                公開鍵: (e = {simpleKeys.publicKey.e.toString()}, n = {simpleKeys.publicKey.n.toString()})
              </div>
              <div style={{ color: 'var(--color-accent)' }}>
                秘密鍵: (d = {simpleKeys.privateKey.d.toString()}, n = {simpleKeys.privateKey.n.toString()})
              </div>
              <div style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>
                検証: e x d mod φ(n) = {((simpleKeys.publicKey.e * simpleKeys.privateKey.d) % simpleKeys.phi).toString()} ≡ 1
              </div>
            </div>

            <div style={{ marginTop: 'var(--spacing-lg)' }}>
              <label>メッセージ（数値）:</label>
              <input
                type="number"
                value={message.toString()}
                onChange={(e) => {
                  const val = BigInt(e.target.value || '0')
                  if (val < simpleKeys.publicKey.n) {
                    setMessage(val)
                  } else {
                    alert(`メッセージは n (${simpleKeys.publicKey.n}) より小さい値にしてください`)
                  }
                }}
              />
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
                0 から {(simpleKeys.publicKey.n - 1n).toString()} までの整数を入力
              </div>
            </div>

            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <button onClick={encrypt} className="primary" style={{ width: '100%' }}>
                暗号化（公開鍵で暗号化）
              </button>
            </div>

            {encrypted !== null && (
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <div className="step-lesson__demo-result">
                  c = m<sup>e</sup> mod n
                  = {message.toString()}<sup>{simpleKeys.publicKey.e.toString()}</sup> mod {simpleKeys.publicKey.n.toString()}
                  = <strong>{encrypted.toString()}</strong>
                </div>

                <div style={{ marginTop: 'var(--spacing-md)' }}>
                  <button onClick={decrypt} className="primary" style={{ width: '100%' }}>
                    復号（秘密鍵で復号）
                  </button>
                </div>

                {decrypted !== null && (
                  <div className="step-lesson__demo-result" style={{ marginTop: 'var(--spacing-md)' }}>
                    m = c<sup>d</sup> mod n
                    = {encrypted.toString()}<sup>{simpleKeys.privateKey.d.toString()}</sup> mod {simpleKeys.privateKey.n.toString()}
                    = <strong>{decrypted.toString()}</strong>
                    <div style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>
                      元のメッセージ {message.toString()} が正しく復元されました
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="step-lesson__callout">
        <strong>理解のポイント：</strong>
        公開鍵(e, n)で暗号化したものは、秘密鍵(d, n)でしか復号できません。
        実用では、パディングスキーム（OAEP等）を使って安全性を高めます。
      </div>
    </>
  )
}

/* =========================================
   Step 5: なぜRSAは安全なのか
   ========================================= */
function WhySecure() {
  return (
    <>
      <p>
        RSAの安全性は、<strong>「大きな合成数の素因数分解が非常に困難である」</strong>という
        計算量的困難性に基づいています。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>攻撃者が知っている情報</h3>
          <ul>
            <li>公開鍵 (e, n)</li>
            <li>暗号文 c</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>攻撃者の目的</h3>
          <ul>
            <li>秘密鍵 d を求めたい</li>
            <li>d にはφ(n) が必要</li>
            <li>φ(n) には p, q が必要</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2', textAlign: 'left', display: 'inline-block' }}>
          <div>小さい数: 簡単</div>
          <div>  15 = 3 x 5</div>
          <div>  3233 = 53 x 61</div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>大きい数: 非常に困難</div>
          <div>  2048ビット（約617桁）の素因数分解:</div>
          <div>  現在のコンピュータでは数千年~数百万年</div>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>注意：</strong>
        量子コンピュータが実用化されると、Shorのアルゴリズムにより素因数分解が多項式時間で解けるようになります。
        そのため、量子耐性暗号（Post-Quantum Cryptography）への移行が進められています。
      </div>
    </>
  )
}

/* =========================================
   Step 6: 実用的な2048ビット鍵生成
   ========================================= */
function LargeKeyGenDemo() {
  const [status, setStatus] = useState<Status>('idle')
  const [statusMessage, setStatusMessage] = useState('「2048ビット鍵を生成」を押すと、ブラウザ内で素数を探索します。')
  const [bits] = useState(2048)
  const [largeP, setLargeP] = useState<bigint | null>(null)
  const [largeQ, setLargeQ] = useState<bigint | null>(null)
  const [largeN, setLargeN] = useState<bigint | null>(null)
  const [largeD, setLargeD] = useState<bigint | null>(null)
  const [eValue] = useState(65537n)
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  const generateLargeRSA = () => {
    workerRef.current?.terminate()

    setStatus('generating')
    setStatusMessage('素数 p を探索中...')

    const worker = new RSAKeyGenWorker()
    workerRef.current = worker

    let retryCount = 0
    const MAX_RETRIES = 5

    worker.onmessage = (event: MessageEvent<RSAWorkerResponse>) => {
      const data = event.data
      switch (data.type) {
        case 'progress':
          setStatusMessage(data.message)
          break
        case 'result':
          setLargeP(BigInt(data.p))
          setLargeQ(BigInt(data.q))
          setLargeN(BigInt(data.n))
          setLargeD(BigInt(data.d))
          setStatus('completed')
          setStatusMessage('生成完了。以下の p, q, N, d は学習用サンプルです。')
          worker.terminate()
          workerRef.current = null
          break
        case 'error':
          if (data.message === 'retry' && retryCount < MAX_RETRIES) {
            retryCount++
            worker.postMessage({ type: 'generate', bits, e: eValue.toString() })
          } else {
            setStatus('error')
            setStatusMessage(data.message === 'retry'
              ? '鍵生成に失敗しました。再度お試しください。'
              : data.message)
            worker.terminate()
            workerRef.current = null
          }
          break
      }
    }

    worker.onerror = () => {
      setStatus('error')
      setStatusMessage('鍵生成中に予期しないエラーが発生しました。')
      worker.terminate()
      workerRef.current = null
    }

    worker.postMessage({ type: 'generate', bits, e: eValue.toString() })
  }

  return (
    <>
      <p>
        ここまで小さい数でRSAの仕組みを学びました。
        実際に使われる規模の2048ビット鍵を生成してみましょう。
        ブラウザ内で素数を探索するため、数十秒かかる場合があります。
      </p>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>

        <div className="step-lesson__demo-result">
          公開指数 e = 65537{'\n'}
          素数 p, q = それぞれ {bits / 2} ビット{'\n'}
          法 N = p x q = {bits} ビット
        </div>

        <div style={{ marginTop: 'var(--spacing-md)', fontSize: '0.9rem', color: 'var(--color-text-subtle)' }}>
          {statusMessage}
        </div>

        <div style={{ marginTop: 'var(--spacing-md)' }}>
          <button
            onClick={generateLargeRSA}
            disabled={status === 'generating'}
            className="primary"
            style={{ width: '100%' }}
          >
            {status === 'generating' ? '生成中...' : '2048ビット鍵を生成'}
          </button>
        </div>

        {status === 'generating' && (
          <div style={{ marginTop: 'var(--spacing-sm)', fontSize: '0.85rem', color: 'var(--color-text-subtle)', textAlign: 'center' }}>
            数十秒かかる場合があります（ブラウザで素数を探索中）
          </div>
        )}

        {(largeP !== null || largeQ !== null || largeN !== null || largeD !== null) && (
          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            {largeP !== null && (
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label>p（1024-bit prime）</label>
                <textarea
                  readOnly
                  value={formatBigInt(largeP)}
                  rows={5}
                  style={{ resize: 'vertical' }}
                />
              </div>
            )}

            {largeQ !== null && (
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label>q（1024-bit prime）</label>
                <textarea
                  readOnly
                  value={formatBigInt(largeQ)}
                  rows={5}
                  style={{ resize: 'vertical' }}
                />
              </div>
            )}

            {largeN !== null && (
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label>N = p x q（2048-bit modulus）</label>
                <textarea
                  readOnly
                  value={formatBigInt(largeN)}
                  rows={7}
                  style={{ resize: 'vertical' }}
                />
              </div>
            )}

            {largeD !== null && (
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label>d（秘密指数）</label>
                <textarea
                  readOnly
                  value={formatBigInt(largeD)}
                  rows={7}
                  style={{ resize: 'vertical' }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="step-lesson__callout">
        <strong>注意事項：</strong>
        このデモは学習・検証用途に限定されています。
        実運用の鍵生成には必ず信頼できるライブラリと安全な乱数源を使用してください。
      </div>
    </>
  )
}

/* =========================================
   Step 7: RSAの課題と限界
   ========================================= */
function ChallengesAndLimitations() {
  return (
    <>
      <p>RSAは40年以上にわたり活躍してきましたが、いくつかの課題を抱えています。</p>

      <ol>
        <li>
          <strong>量子コンピュータの脅威</strong> — 1994年、Peter Shorが発表した
          Shorのアルゴリズムは、量子コンピュータ上で素因数分解を多項式時間で解きます。
          十分に大きな量子コンピュータが実現すれば、RSAの安全性は崩壊します。
        </li>
        <li>
          <strong>鍵サイズの増大</strong> — 安全性を保つため、鍵サイズは年々大きくなっています。
          現在は2048ビット以上が推奨され、処理コストも増加しています。
        </li>
        <li>
          <strong>パフォーマンス</strong> — RSAは共通鍵暗号（AES等）と比べて非常に遅いため、
          実用ではハイブリッド暗号（RSAで鍵交換、AESでデータ暗号化）が使われます。
        </li>
      </ol>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>Post-Quantum 暗号</h3>
          <ul>
            <li><strong>CRYSTALS-Kyber</strong>（鍵カプセル化）</li>
            <li><strong>CRYSTALS-Dilithium</strong>（署名）</li>
            <li><strong>FALCON</strong>（署名）</li>
            <li><strong>SPHINCS+</strong>（署名）</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>基盤となる数学</h3>
          <ul>
            <li>格子暗号</li>
            <li>ハッシュベース署名</li>
            <li>符号ベース暗号</li>
            <li>多変量暗号</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>今後の展望：</strong>
        RSAから学んだ公開鍵暗号の概念や数学的基礎は、現代暗号を理解する上で今も非常に重要です。
        NISTは2024年に量子耐性暗号の標準化を発表し、移行が本格的に進んでいます。
      </div>
    </>
  )
}

/* =========================================
   Main Page Component
   ========================================= */
export default function RSAPage() {
  useEffect(() => {
    document.title = 'RSA - CryptoLab'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const steps: LessonStep[] = [
    {
      title: '公開鍵暗号とは',
      content: <PublicKeyCryptography />,
      quiz: {
        question: '公開鍵暗号の最大の利点は何か？',
        options: [
          { label: '暗号化の処理速度が速い' },
          { label: '鍵を安全に配送する必要がない', correct: true },
          { label: '暗号文のサイズが小さくなる' },
          { label: '量子コンピュータに耐性がある' },
        ],
        explanation: '正解！公開鍵暗号では、公開鍵は自由に配布でき、秘密鍵は各自が保管すればよいため、鍵配送問題が解決されます。',
      },
    },
    {
      title: 'RSAの数学的基礎',
      content: <MathFoundations />,
      quiz: {
        question: 'RSAにおいてφ(n) = (p-1)(q-1) が重要な理由は？',
        options: [
          { label: '暗号文のサイズを決定するため' },
          { label: '素因数分解の難易度を上げるため' },
          { label: '秘密指数dの計算に必要だから', correct: true },
          { label: '公開鍵のビット数を決めるため' },
        ],
        explanation: '正解！秘密指数dは e x d ≡ 1 (mod φ(n)) を満たす値として計算されます。φ(n)を知らないとdを求めることができません。',
      },
    },
    {
      title: 'RSA鍵生成アルゴリズム',
      content: <KeyGenAlgorithm />,
    },
    {
      title: '小さい数で体験してみよう',
      content: <SmallNumberDemo />,
    },
    {
      title: 'なぜRSAは安全なのか',
      content: <WhySecure />,
      quiz: {
        question: 'RSAの安全性を破るために攻撃者がまず行うべきことは？',
        options: [
          { label: '公開指数eを推測する' },
          { label: 'nを素因数分解してp, qを求める', correct: true },
          { label: '暗号文cを大量に収集する' },
          { label: '公開鍵を変更する' },
        ],
        explanation: '正解！秘密鍵dを求めるにはφ(n)が必要で、φ(n)を計算するにはnの素因数p, qを知る必要があります。2048ビットのnの素因数分解は現在のコンピュータでは実質的に不可能です。',
      },
    },
    {
      title: '実用的な2048ビット鍵生成',
      content: <LargeKeyGenDemo />,
    },
    {
      title: 'RSAの課題と限界',
      content: <ChallengesAndLimitations />,
      quiz: {
        question: '量子コンピュータがRSAにとって脅威となる理由は？',
        options: [
          { label: '量子コンピュータは暗号化の処理が速いから' },
          { label: '量子コンピュータは乱数を予測できるから' },
          { label: 'Shorのアルゴリズムで素因数分解が効率的に解けるようになるから', correct: true },
          { label: '量子コンピュータは秘密鍵を直接読み取れるから' },
        ],
        explanation: '正解！Shorのアルゴリズムは量子コンピュータ上で素因数分解を多項式時間で解くことができます。RSAの安全性は素因数分解の困難性に依存しているため、これが破られるとRSAは安全ではなくなります。',
      },
    },
  ]

  return (
    <main className="page rsa">
      <StepLesson
        title="RSA暗号"
        steps={steps}
      />
    </main>
  )
}
