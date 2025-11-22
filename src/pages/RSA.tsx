import { useState, useEffect } from 'react'
import {
  generateSimpleRSAKey,
  rsaEncrypt,
  rsaDecrypt,
  SMALL_PRIMES,
  type RSAKeyPair
} from '@/lib/rsa'
import { generatePrime, gcd, modInverse } from '@/utils/bigint'

type Status = 'idle' | 'generating' | 'completed' | 'error'

const formatBigInt = (value: bigint, group = 64) => {
  const text = value.toString(16).toUpperCase()
  return text.replace(new RegExp(`.{1,${group}}`, 'g'), '$&\n').trim()
}

export default function RSAPage() {
  // 小さい数でのデモ用
  const [selectedP, setSelectedP] = useState<bigint>(61n)
  const [selectedQ, setSelectedQ] = useState<bigint>(53n)
  const [simpleKeys, setSimpleKeys] = useState<RSAKeyPair | null>(null)
  const [message, setMessage] = useState<bigint>(65n) // 'A'のASCIIコード
  const [encrypted, setEncrypted] = useState<bigint | null>(null)
  const [decrypted, setDecrypted] = useState<bigint | null>(null)

  // 2048ビット鍵生成用
  const [status, setStatus] = useState<Status>('idle')
  const [statusMessage, setStatusMessage] = useState('「2048ビット鍵を生成」を押すと、ブラウザ内で素数を探索します。')
  const [bits] = useState(2048)
  const [largeP, setLargeP] = useState<bigint | null>(null)
  const [largeQ, setLargeQ] = useState<bigint | null>(null)
  const [largeN, setLargeN] = useState<bigint | null>(null)
  const [largeD, setLargeD] = useState<bigint | null>(null)
  const [eValue] = useState(65537n)

  useEffect(() => {
    document.title = 'RSA - CryptoLab'
  }, [])

  // 小さい数での鍵生成
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

  // 2048ビット鍵生成
  const generateLargeRSA = async () => {
    try {
      setStatus('generating')
      setStatusMessage('素数 p を探索中...')
      const half = bits / 2
      let primeP = await generatePrime(half)
      setStatusMessage('素数 q を探索中...')
      let primeQ = await generatePrime(half)
      while (primeP === primeQ) {
        primeQ = await generatePrime(half)
      }

      const modulus = primeP * primeQ
      const phi = (primeP - 1n) * (primeQ - 1n)

      if (gcd(eValue, phi) !== 1n) {
        setStatusMessage('再生成します（e と φ(N) が互いに素ではありませんでした）...')
        return generateLargeRSA()
      }

      const dValue = modInverse(eValue, phi)

      setLargeP(primeP)
      setLargeQ(primeQ)
      setLargeN(modulus)
      setLargeD(dValue)
      setStatus('completed')
      setStatusMessage('生成完了。以下の p, q, N, d は学習用サンプルです。')
    } catch (error) {
      setStatus('error')
      setStatusMessage(error instanceof Error ? error.message : 'RSA キー生成中にエラーが発生しました。')
    }
  }

  // 暗号化
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

  // 復号
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
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '8px', color: '#0f172a' }}>RSA暗号</h1>
      <p style={{ color: '#64748b', marginBottom: '32px' }}>
        公開鍵暗号方式の代表格 - 数学的な美しさと実用性を兼ね備えた暗号システム
      </p>

      {/* 公開鍵暗号とは */}
      <section style={{
        background: 'rgba(37, 99, 235, 0.05)',
        padding: '24px',
        borderRadius: '8px',
        marginBottom: '32px',
        border: '1px solid #cbd5e1'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#0f172a' }}>公開鍵暗号とは</h2>

        <div style={{ color: '#475569', lineHeight: '1.8', marginBottom: '20px' }}>
          <p style={{ marginBottom: '12px' }}>
            従来の暗号（共通鍵暗号）では、暗号化と復号に<strong>同じ鍵</strong>を使います。
            これは「鍵をどうやって安全に共有するか」という問題（鍵配送問題）を抱えていました。
          </p>
          <p style={{ marginBottom: '12px' }}>
            1977年、Ron Rivest、Adi Shamir、Leonard Adlemanの3人が発明したRSAは、
            <strong>異なる鍵</strong>を使う画期的な暗号方式です：
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div style={{
            background: '#fff',
            padding: '16px',
            borderRadius: '4px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ color: '#2563eb', marginBottom: '8px' }}>公開鍵（Public Key）</h3>
            <ul style={{ paddingLeft: '20px', color: '#475569', lineHeight: '1.8' }}>
              <li>誰でも知ってOK</li>
              <li>暗号化に使用</li>
              <li>メッセージの検証に使用</li>
              <li>公開ディレクトリに登録可能</li>
            </ul>
          </div>

          <div style={{
            background: '#fff',
            padding: '16px',
            borderRadius: '4px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>秘密鍵（Private Key）</h3>
            <ul style={{ paddingLeft: '20px', color: '#475569', lineHeight: '1.8' }}>
              <li>本人だけが知っている</li>
              <li>復号に使用</li>
              <li>署名の生成に使用</li>
              <li>絶対に秘密にする</li>
            </ul>
          </div>
        </div>

        <div style={{
          padding: '16px',
          background: 'rgba(37, 99, 235, 0.05)',
          borderRadius: '4px',
          border: '1px solid #cbd5e1'
        }}>
          <strong style={{ color: '#2563eb' }}>RSAの革新性：</strong>
          <p style={{ marginTop: '8px', color: '#475569', lineHeight: '1.8' }}>
            公開鍵で暗号化したデータは、対応する秘密鍵でしか復号できません。
            つまり、鍵を安全に配送する必要がなくなりました。公開鍵は自由に配布でき、
            秘密鍵は各自が厳重に保管すればよいのです。
          </p>
        </div>
      </section>

      {/* 数学的基礎 */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#0f172a' }}>数学的基礎</h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>
          RSAの安全性は、いくつかの数学的概念に基づいています。順番に見ていきましょう。
        </p>

        {/* 素数 */}
        <div style={{
          marginBottom: '24px',
          padding: '20px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '18px', color: '#2563eb', marginBottom: '12px' }}>1. 素数（Prime Number）</h3>
          <div style={{ color: '#475569', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '12px' }}>
              素数とは、<strong>1とその数自身以外に約数を持たない自然数</strong>のことです。
            </p>
            <div style={{
              padding: '12px',
              background: '#fff',
              borderRadius: '4px',
              fontFamily: 'monospace',
              marginBottom: '12px'
            }}>
              例: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, ...
            </div>
            <p style={{ marginBottom: '8px' }}><strong>RSAにおける素数の重要性：</strong></p>
            <ul style={{ paddingLeft: '20px' }}>
              <li>2つの大きな素数p, qを選ぶ</li>
              <li>その積 n = p × q が公開鍵の一部になる</li>
              <li>nは公開されるが、pとqは秘密にする</li>
              <li><strong>nからp, qを求める（素因数分解）のが非常に困難</strong>であることがRSAの安全性の根拠</li>
            </ul>
          </div>
        </div>

        {/* モジュラ演算 */}
        <div style={{
          marginBottom: '24px',
          padding: '20px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '18px', color: '#2563eb', marginBottom: '12px' }}>2. モジュラ演算（剰余演算）</h3>
          <div style={{ color: '#475569', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '12px' }}>
              モジュラ演算は、割り算の<strong>余り</strong>を扱う演算です。
              「a mod n」は「aをnで割った余り」を意味します。
            </p>
            <div style={{
              padding: '12px',
              background: '#fff',
              borderRadius: '4px',
              fontFamily: 'monospace',
              marginBottom: '12px'
            }}>
              <div>17 mod 5 = 2 （17 ÷ 5 = 3 余り 2）</div>
              <div>23 mod 7 = 2 （23 ÷ 7 = 3 余り 2）</div>
              <div>100 mod 12 = 4 （100 ÷ 12 = 8 余り 4）</div>
            </div>
            <p style={{ marginBottom: '8px' }}><strong>合同式の表記：</strong></p>
            <div style={{
              padding: '12px',
              background: '#fff',
              borderRadius: '4px',
              fontFamily: 'monospace',
              marginBottom: '12px'
            }}>
              17 ≡ 2 (mod 5)
            </div>
            <p>
              これは「17と2は、5を法として合同である」と読みます。
              つまり、17と2をそれぞれ5で割った余りが等しいという意味です。
            </p>
          </div>
        </div>

        {/* オイラーのφ関数 */}
        <div style={{
          marginBottom: '24px',
          padding: '20px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '18px', color: '#2563eb', marginBottom: '12px' }}>3. オイラーのφ関数</h3>
          <div style={{ color: '#475569', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '12px' }}>
              φ(n)（ファイn）は、<strong>n以下の正の整数のうち、nと互いに素であるものの個数</strong>を表します。
            </p>
            <div style={{
              padding: '12px',
              background: '#fff',
              borderRadius: '4px',
              marginBottom: '12px'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>例1：</strong> φ(12) = 4
              </div>
              <div style={{ paddingLeft: '20px', fontSize: '14px', color: '#64748b' }}>
                12と互いに素な数: 1, 5, 7, 11（4個）
              </div>
            </div>
            <p style={{ marginBottom: '8px' }}><strong>重要な性質：</strong></p>
            <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
              <li>pが素数のとき: φ(p) = p - 1</li>
              <li>p, qが異なる素数のとき: <strong>φ(p × q) = (p - 1) × (q - 1)</strong></li>
            </ul>
            <div style={{
              padding: '12px',
              background: 'rgba(37, 99, 235, 0.1)',
              borderRadius: '4px',
              border: '1px solid #2563eb'
            }}>
              <strong style={{ color: '#2563eb' }}>RSAでの使用：</strong>
              <p style={{ marginTop: '8px' }}>
                n = p × q のとき、φ(n) = (p - 1)(q - 1) を計算します。
                この値は秘密鍵の計算に使われますが、pとqを知らないとφ(n)も計算できません。
              </p>
            </div>
          </div>
        </div>

        {/* 互いに素とGCD */}
        <div style={{
          marginBottom: '24px',
          padding: '20px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '18px', color: '#2563eb', marginBottom: '12px' }}>4. 互いに素と最大公約数（GCD）</h3>
          <div style={{ color: '#475569', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '12px' }}>
              2つの整数が<strong>互いに素</strong>であるとは、それらの<strong>最大公約数が1</strong>であることを意味します。
            </p>
            <div style={{
              padding: '12px',
              background: '#fff',
              borderRadius: '4px',
              fontFamily: 'monospace',
              marginBottom: '12px'
            }}>
              <div>gcd(15, 28) = 1 → 15と28は互いに素</div>
              <div>gcd(12, 18) = 6 → 12と18は互いに素ではない</div>
            </div>
            <p style={{ marginBottom: '8px' }}><strong>ユークリッドの互除法：</strong></p>
            <p style={{ marginBottom: '12px' }}>
              GCDを効率的に計算するアルゴリズムです。
            </p>
            <div style={{
              padding: '12px',
              background: '#fff',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '14px',
              marginBottom: '12px'
            }}>
              <div>gcd(48, 18):</div>
              <div style={{ paddingLeft: '20px' }}>48 = 18 × 2 + 12</div>
              <div style={{ paddingLeft: '20px' }}>18 = 12 × 1 + 6</div>
              <div style={{ paddingLeft: '20px' }}>12 = 6 × 2 + 0</div>
              <div style={{ paddingLeft: '20px', marginTop: '8px' }}>答え: gcd(48, 18) = 6</div>
            </div>
            <div style={{
              padding: '12px',
              background: 'rgba(37, 99, 235, 0.1)',
              borderRadius: '4px',
              border: '1px solid #2563eb'
            }}>
              <strong style={{ color: '#2563eb' }}>RSAでの使用：</strong>
              <p style={{ marginTop: '8px' }}>
                公開指数eは、φ(n)と互いに素である必要があります。
                つまり gcd(e, φ(n)) = 1 でなければなりません。
              </p>
            </div>
          </div>
        </div>

        {/* モジュラ逆元 */}
        <div style={{
          marginBottom: '24px',
          padding: '20px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '18px', color: '#2563eb', marginBottom: '12px' }}>5. モジュラ逆元</h3>
          <div style={{ color: '#475569', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '12px' }}>
              aのモジュラ逆元とは、<strong>a × d ≡ 1 (mod n)</strong> を満たす数dのことです。
            </p>
            <div style={{
              padding: '12px',
              background: '#fff',
              borderRadius: '4px',
              fontFamily: 'monospace',
              marginBottom: '12px'
            }}>
              <div>例: 3 × 7 ≡ 21 ≡ 1 (mod 10)</div>
              <div style={{ paddingLeft: '20px', fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                → 7は3のmod 10における逆元
              </div>
            </div>
            <p style={{ marginBottom: '8px' }}><strong>拡張ユークリッドの互除法：</strong></p>
            <p style={{ marginBottom: '12px' }}>
              モジュラ逆元を効率的に計算するアルゴリズムです。
              ユークリッドの互除法を拡張したもので、GCDだけでなく、
              ax + by = gcd(a,b) を満たすx, yも求められます。
            </p>
            <div style={{
              padding: '12px',
              background: 'rgba(37, 99, 235, 0.1)',
              borderRadius: '4px',
              border: '1px solid #2563eb'
            }}>
              <strong style={{ color: '#2563eb' }}>RSAでの使用：</strong>
              <p style={{ marginTop: '8px' }}>
                秘密指数dは、公開指数eのmod φ(n)における逆元です。<br />
                つまり: <strong>e × d ≡ 1 (mod φ(n))</strong><br />
                これがRSAの暗号化と復号が正しく動作する数学的な根拠です。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RSAアルゴリズムの流れ */}
      <section style={{
        marginBottom: '32px',
        background: 'rgba(16, 185, 129, 0.05)',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#0f172a' }}>RSAアルゴリズムの流れ</h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>
          RSAは鍵生成、暗号化、復号の3つのステップから成り立っています。
        </p>

        {/* 鍵生成 */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', color: '#10b981', marginBottom: '12px' }}>
            ステップ1: 鍵生成（Key Generation）
          </h3>
          <div style={{
            padding: '20px',
            background: '#fff',
            borderRadius: '4px',
            border: '1px solid #e2e8f0'
          }}>
            <ol style={{ paddingLeft: '20px', color: '#475569', lineHeight: '2' }}>
              <li>
                <strong>2つの大きな素数p, qを選ぶ</strong>
                <div style={{ paddingLeft: '20px', fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                  実用的には1024ビット以上（現在は2048ビット以上が推奨）
                </div>
              </li>
              <li>
                <strong>n = p × q を計算</strong>
                <div style={{ paddingLeft: '20px', fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                  これが公開鍵・秘密鍵の両方で使われる「法（modulus）」
                </div>
              </li>
              <li>
                <strong>φ(n) = (p - 1) × (q - 1) を計算</strong>
                <div style={{ paddingLeft: '20px', fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                  オイラーのφ関数の値。秘密の値として扱う
                </div>
              </li>
              <li>
                <strong>公開指数eを選ぶ</strong>
                <div style={{ paddingLeft: '20px', fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                  1 &lt; e &lt; φ(n) かつ gcd(e, φ(n)) = 1 を満たす数<br />
                  慣例的に e = 65537 がよく使われる
                </div>
              </li>
              <li>
                <strong>秘密指数dを計算</strong>
                <div style={{ paddingLeft: '20px', fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                  e × d ≡ 1 (mod φ(n)) を満たすd（eのモジュラ逆元）<br />
                  拡張ユークリッドの互除法で計算
                </div>
              </li>
            </ol>
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '4px',
              border: '1px solid #cbd5e1'
            }}>
              <strong>結果：</strong><br />
              公開鍵: (e, n)<br />
              秘密鍵: (d, n)<br />
              <span style={{ fontSize: '14px', color: '#64748b' }}>※ p, q, φ(n) は秘密にして破棄</span>
            </div>
          </div>
        </div>

        {/* 暗号化 */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', color: '#10b981', marginBottom: '12px' }}>
            ステップ2: 暗号化（Encryption）
          </h3>
          <div style={{
            padding: '20px',
            background: '#fff',
            borderRadius: '4px',
            border: '1px solid #e2e8f0'
          }}>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '12px' }}>
              送信者は受信者の<strong>公開鍵 (e, n)</strong> を使って平文mを暗号化します。
            </p>
            <div style={{
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '18px',
              textAlign: 'center',
              marginBottom: '12px',
              border: '1px solid #cbd5e1'
            }}>
              c = m<sup>e</sup> mod n
            </div>
            <ul style={{ paddingLeft: '20px', color: '#475569', lineHeight: '1.8' }}>
              <li>m: 平文（メッセージ）。0 ≤ m &lt; n の整数</li>
              <li>c: 暗号文</li>
              <li>モジュラ累乗を使って計算</li>
            </ul>
          </div>
        </div>

        {/* 復号 */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', color: '#10b981', marginBottom: '12px' }}>
            ステップ3: 復号（Decryption）
          </h3>
          <div style={{
            padding: '20px',
            background: '#fff',
            borderRadius: '4px',
            border: '1px solid #e2e8f0'
          }}>
            <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '12px' }}>
              受信者は自分の<strong>秘密鍵 (d, n)</strong> を使って暗号文cを復号します。
            </p>
            <div style={{
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '18px',
              textAlign: 'center',
              marginBottom: '12px',
              border: '1px solid #cbd5e1'
            }}>
              m = c<sup>d</sup> mod n
            </div>
            <p style={{ color: '#475569', lineHeight: '1.8' }}>
              この計算により、元の平文mが復元されます。
            </p>
          </div>
        </div>

        {/* なぜ復号できるか */}
        <div style={{
          padding: '20px',
          background: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '4px',
          border: '1px solid #10b981'
        }}>
          <h4 style={{ color: '#10b981', marginBottom: '12px' }}>なぜ正しく復号できるのか？</h4>
          <p style={{ color: '#475569', lineHeight: '1.8', marginBottom: '12px' }}>
            暗号化してから復号すると：
          </p>
          <div style={{
            padding: '12px',
            background: '#fff',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '14px',
            marginBottom: '12px'
          }}>
            c<sup>d</sup> = (m<sup>e</sup>)<sup>d</sup> = m<sup>ed</sup> ≡ m (mod n)
          </div>
          <p style={{ color: '#475569', lineHeight: '1.8' }}>
            これが成り立つのは、<strong>e × d ≡ 1 (mod φ(n))</strong> という関係と、
            <strong>フェルマーの小定理・オイラーの定理</strong>によります。
            数学的な証明は深いですが、要するに「eで累乗してdで累乗すると元に戻る」という性質があるのです。
          </p>
        </div>
      </section>

      {/* なぜ安全なのか */}
      <section style={{
        marginBottom: '32px',
        background: 'rgba(245, 158, 11, 0.05)',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#0f172a' }}>なぜ安全なのか？</h2>

        <div style={{ color: '#475569', lineHeight: '1.8', marginBottom: '20px' }}>
          <p style={{ marginBottom: '12px' }}>
            RSAの安全性は、<strong>「大きな合成数の素因数分解が非常に困難である」</strong>という
            計算量的困難性に基づいています。
          </p>
        </div>

        <div style={{
          padding: '20px',
          background: '#fff',
          borderRadius: '4px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '18px', color: '#f59e0b', marginBottom: '12px' }}>
            攻撃者の視点
          </h3>
          <ul style={{ paddingLeft: '20px', color: '#475569', lineHeight: '1.8' }}>
            <li>
              <strong>公開されている情報：</strong>
              <div style={{ paddingLeft: '20px', fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                公開鍵 (e, n)、暗号文 c
              </div>
            </li>
            <li>
              <strong>攻撃者の目的：</strong>
              <div style={{ paddingLeft: '20px', fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                秘密鍵 d を求めて暗号文を復号したい
              </div>
            </li>
            <li>
              <strong>問題：</strong>
              <div style={{ paddingLeft: '20px', fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
                d を計算するには φ(n) が必要<br />
                φ(n) を計算するには p と q が必要<br />
                しかし、<strong>n から p, q を求める（素因数分解）のが非常に難しい</strong>
              </div>
            </li>
          </ul>
        </div>

        <div style={{
          padding: '20px',
          background: '#fff',
          borderRadius: '4px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '18px', color: '#f59e0b', marginBottom: '12px' }}>
            素因数分解の困難性
          </h3>
          <div style={{ color: '#475569', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '12px' }}>
              小さい数の場合は簡単です：
            </p>
            <div style={{
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '14px',
              marginBottom: '12px'
            }}>
              15 = 3 × 5<br />
              143 = 11 × 13<br />
              3233 = 53 × 61
            </div>
            <p style={{ marginBottom: '12px' }}>
              しかし、数が大きくなると指数関数的に困難になります：
            </p>
            <div style={{
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '4px',
              fontSize: '14px',
              marginBottom: '12px'
            }}>
              <strong>2048ビットの数（約617桁）の素因数分解：</strong><br />
              現在のコンピュータでは実質的に不可能（数千年～数百万年かかる）
            </div>
            <p>
              これがRSAの安全性の根拠です。公開鍵は誰でも知ることができますが、
              そこから秘密鍵を計算することは現実的には不可能なのです。
            </p>
          </div>
        </div>

        <div style={{
          padding: '16px',
          background: 'rgba(220, 38, 38, 0.1)',
          borderRadius: '4px',
          border: '1px solid #dc2626'
        }}>
          <strong style={{ color: '#dc2626' }}>⚠️ 注意：</strong>
          <p style={{ marginTop: '8px', color: '#475569', lineHeight: '1.8' }}>
            量子コンピュータが実用化されると、Shorのアルゴリズムにより
            素因数分解が多項式時間で解けるようになります。
            そのため、量子耐性暗号（Post-Quantum Cryptography）への移行が進められています。
          </p>
        </div>
      </section>

      {/* 小さい数での体験デモ */}
      <section style={{
        marginBottom: '32px',
        background: 'rgba(139, 92, 246, 0.05)',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#0f172a' }}>
          小さい数で体験してみよう
        </h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>
          実際にRSAの計算を確認できるよう、小さい素数を使って鍵を生成してみましょう。
        </p>

        <div style={{
          padding: '20px',
          background: '#fff',
          borderRadius: '4px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#8b5cf6' }}>素数の選択</h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>
              素数 p を選択:
            </label>
            <select
              value={selectedP.toString()}
              onChange={(e) => setSelectedP(BigInt(e.target.value))}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              {SMALL_PRIMES.map(p => (
                <option key={p.toString()} value={p.toString()}>{p.toString()}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>
              素数 q を選択:
            </label>
            <select
              value={selectedQ.toString()}
              onChange={(e) => setSelectedQ(BigInt(e.target.value))}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              {SMALL_PRIMES.map(q => (
                <option key={q.toString()} value={q.toString()}>{q.toString()}</option>
              ))}
            </select>
          </div>

          <button
            onClick={generateKeys}
            style={{
              width: '100%',
              padding: '12px',
              background: '#8b5cf6',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            鍵を生成
          </button>
        </div>

        {simpleKeys && (
          <div style={{
            padding: '20px',
            background: '#fff',
            borderRadius: '4px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#8b5cf6' }}>生成結果</h3>

            <div style={{
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: '2',
              marginBottom: '16px'
            }}>
              <div><strong>選択した素数:</strong></div>
              <div>p = {simpleKeys.p.toString()}</div>
              <div>q = {simpleKeys.q.toString()}</div>
              <div style={{ marginTop: '8px' }}><strong>計算結果:</strong></div>
              <div>n = p × q = {simpleKeys.publicKey.n.toString()}</div>
              <div>φ(n) = (p-1) × (q-1) = {simpleKeys.phi.toString()}</div>
              <div style={{ marginTop: '8px' }}><strong>鍵:</strong></div>
              <div style={{ color: '#2563eb' }}>
                公開鍵: (e = {simpleKeys.publicKey.e.toString()}, n = {simpleKeys.publicKey.n.toString()})
              </div>
              <div style={{ color: '#dc2626' }}>
                秘密鍵: (d = {simpleKeys.privateKey.d.toString()}, n = {simpleKeys.privateKey.n.toString()})
              </div>
            </div>

            <div style={{
              padding: '12px',
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '4px',
              border: '1px solid #8b5cf6'
            }}>
              <strong style={{ color: '#8b5cf6' }}>検証:</strong>
              <div style={{ marginTop: '8px', fontFamily: 'monospace', fontSize: '14px', color: '#475569' }}>
                e × d mod φ(n) = {simpleKeys.publicKey.e.toString()} × {simpleKeys.privateKey.d.toString()} mod {simpleKeys.phi.toString()}
                {' = '}
                {((simpleKeys.publicKey.e * simpleKeys.privateKey.d) % simpleKeys.phi).toString()}
                {' ≡ 1 ✓'}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 暗号化・復号デモ */}
      {simpleKeys && (
        <section style={{
          marginBottom: '32px',
          background: 'rgba(236, 72, 153, 0.05)',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #cbd5e1'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#0f172a' }}>
            暗号化・復号を試してみよう
          </h2>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>
            生成した鍵を使って、実際に暗号化と復号を体験できます。
          </p>

          <div style={{
            padding: '20px',
            background: '#fff',
            borderRadius: '4px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#ec4899' }}>平文の入力</h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontWeight: '500' }}>
                メッセージ（数値）:
              </label>
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
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                0 から {(simpleKeys.publicKey.n - 1n).toString()} までの整数を入力
              </div>
            </div>

            <button
              onClick={encrypt}
              style={{
                width: '100%',
                padding: '12px',
                background: '#ec4899',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                marginBottom: '16px'
              }}
            >
              暗号化（公開鍵で暗号化）
            </button>

            {encrypted !== null && (
              <>
                <div style={{
                  padding: '12px',
                  background: '#f8fafc',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  marginBottom: '16px'
                }}>
                  <strong>暗号化の計算:</strong><br />
                  c = m<sup>e</sup> mod n<br />
                  c = {message.toString()}<sup>{simpleKeys.publicKey.e.toString()}</sup> mod {simpleKeys.publicKey.n.toString()}<br />
                  <strong style={{ color: '#ec4899' }}>c = {encrypted.toString()}</strong>
                </div>

                <button
                  onClick={decrypt}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#8b5cf6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  復号（秘密鍵で復号）
                </button>

                {decrypted !== null && (
                  <div style={{
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    marginTop: '16px',
                    border: '2px solid #10b981'
                  }}>
                    <strong>復号の計算:</strong><br />
                    m = c<sup>d</sup> mod n<br />
                    m = {encrypted.toString()}<sup>{simpleKeys.privateKey.d.toString()}</sup> mod {simpleKeys.privateKey.n.toString()}<br />
                    <strong style={{ color: '#10b981' }}>m = {decrypted.toString()}</strong>
                    <div style={{ marginTop: '8px', color: '#10b981' }}>
                      ✓ 元のメッセージ {message.toString()} が正しく復元されました！
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div style={{
            padding: '16px',
            background: 'rgba(236, 72, 153, 0.1)',
            borderRadius: '4px',
            border: '1px solid #ec4899'
          }}>
            <strong style={{ color: '#ec4899' }}>理解のポイント：</strong>
            <ul style={{ paddingLeft: '20px', color: '#475569', lineHeight: '1.8', marginTop: '8px' }}>
              <li>公開鍵(e, n)で暗号化したものは、秘密鍵(d, n)でしか復号できない</li>
              <li>同じメッセージでも毎回同じ暗号文になる（決定的暗号化）</li>
              <li>実用では、パディングスキーム（OAEP等）を使って安全性を高める</li>
            </ul>
          </div>
        </section>
      )}

      {/* 実装コード */}
      <section style={{
        marginBottom: '32px',
        background: '#f8fafc',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#0f172a' }}>
          実装コード
        </h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>
          このデモで使用している主要な関数の実装です。
        </p>

        <details style={{ marginBottom: '16px' }}>
          <summary style={{
            padding: '12px',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
            color: '#475569'
          }}>
            モジュラ累乗（Modular Exponentiation）
          </summary>
          <div style={{
            padding: '16px',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px'
          }}>
            <pre style={{
              background: '#1e293b',
              color: '#e2e8f0',
              padding: '16px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '13px',
              lineHeight: '1.6'
            }}>
              {`export function modPow(base: bigint, exp: bigint, modulus: bigint): bigint {
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
}`}
            </pre>
            <p style={{ marginTop: '12px', color: '#64748b', fontSize: '14px', lineHeight: '1.8' }}>
              base<sup>exp</sup> mod modulus を効率的に計算します。
              指数を2進数展開して、平方を繰り返すことで計算量を O(log exp) に抑えています。
            </p>
          </div>
        </details>

        <details style={{ marginBottom: '16px' }}>
          <summary style={{
            padding: '12px',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
            color: '#475569'
          }}>
            モジュラ逆元（Modular Inverse）
          </summary>
          <div style={{
            padding: '16px',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px'
          }}>
            <pre style={{
              background: '#1e293b',
              color: '#e2e8f0',
              padding: '16px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '13px',
              lineHeight: '1.6'
            }}>
              {`function modInverse(a: bigint, m: bigint): bigint {
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
}`}
            </pre>
            <p style={{ marginTop: '12px', color: '#64748b', fontSize: '14px', lineHeight: '1.8' }}>
              拡張ユークリッドの互除法を使って、a × x ≡ 1 (mod m) を満たす x を計算します。
              RSAでは、秘密指数 d の計算に使用されます。
            </p>
          </div>
        </details>

        <details style={{ marginBottom: '16px' }}>
          <summary style={{
            padding: '12px',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
            color: '#475569'
          }}>
            鍵生成（Key Generation）
          </summary>
          <div style={{
            padding: '16px',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px'
          }}>
            <pre style={{
              background: '#1e293b',
              color: '#e2e8f0',
              padding: '16px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '13px',
              lineHeight: '1.6'
            }}>
              {`export function generateSimpleRSAKey(
  p: bigint,
  q: bigint,
  e: bigint = 65537n
): RSAKeyPair {
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
}`}
            </pre>
            <p style={{ marginTop: '12px', color: '#64748b', fontSize: '14px', lineHeight: '1.8' }}>
              素数 p, q から RSA 鍵ペアを生成します。
              公開指数 e のデフォルト値として 65537 を使用しています（2<sup>16</sup> + 1 で、暗号化が高速）。
            </p>
          </div>
        </details>

        <details>
          <summary style={{
            padding: '12px',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
            color: '#475569'
          }}>
            暗号化・復号（Encrypt / Decrypt）
          </summary>
          <div style={{
            padding: '16px',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px'
          }}>
            <pre style={{
              background: '#1e293b',
              color: '#e2e8f0',
              padding: '16px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '13px',
              lineHeight: '1.6'
            }}>
              {`// RSA暗号化: c = m^e mod n
export function rsaEncrypt(
  message: bigint,
  publicKey: { e: bigint, n: bigint }
): bigint {
  if (message >= publicKey.n) {
    throw new Error('Message must be smaller than n')
  }
  return modPow(message, publicKey.e, publicKey.n)
}

// RSA復号: m = c^d mod n
export function rsaDecrypt(
  ciphertext: bigint,
  privateKey: { d: bigint, n: bigint }
): bigint {
  return modPow(ciphertext, privateKey.d, privateKey.n)
}`}
            </pre>
            <p style={{ marginTop: '12px', color: '#64748b', fontSize: '14px', lineHeight: '1.8' }}>
              暗号化は公開鍵を使い、復号は秘密鍵を使います。
              どちらもモジュラ累乗により計算されます。
            </p>
          </div>
        </details>
      </section>

      {/* 現代における課題 */}
      <section style={{
        marginBottom: '32px',
        background: 'rgba(220, 38, 38, 0.05)',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#0f172a' }}>
          現代における課題と移行
        </h2>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', color: '#dc2626', marginBottom: '12px' }}>
            量子コンピュータの脅威
          </h3>
          <div style={{
            padding: '16px',
            background: '#fff',
            borderRadius: '4px',
            border: '1px solid #e2e8f0',
            color: '#475569',
            lineHeight: '1.8'
          }}>
            <p style={{ marginBottom: '12px' }}>
              1994年、Peter Shorが<strong>Shorのアルゴリズム</strong>を発表しました。
              これは量子コンピュータ上で素因数分解を<strong>多項式時間</strong>で解くアルゴリズムです。
            </p>
            <p style={{ marginBottom: '12px' }}>
              十分に大きな量子コンピュータが実現すれば、RSAの安全性は崩壊します。
              現在の暗号通信の多くがRSAや楕円曲線暗号（ECDSA等）に依存しているため、
              これは深刻な問題です。
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', color: '#dc2626', marginBottom: '12px' }}>
            Post-Quantum Cryptography（耐量子計算機暗号）
          </h3>
          <div style={{
            padding: '16px',
            background: '#fff',
            borderRadius: '4px',
            border: '1px solid #e2e8f0',
            color: '#475569',
            lineHeight: '1.8'
          }}>
            <p style={{ marginBottom: '12px' }}>
              NISTは2024年に、量子コンピュータに耐性のある暗号アルゴリズムの標準化を発表しました：
            </p>
            <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
              <li><strong>CRYSTALS-Kyber</strong>（鍵カプセル化）</li>
              <li><strong>CRYSTALS-Dilithium</strong>（デジタル署名）</li>
              <li><strong>FALCON</strong>（デジタル署名）</li>
              <li><strong>SPHINCS+</strong>（デジタル署名）</li>
            </ul>
            <p>
              これらは格子暗号やハッシュベース署名など、
              量子コンピュータでも解くことが困難と考えられる数学的問題に基づいています。
            </p>
          </div>
        </div>

        <div style={{
          padding: '16px',
          background: 'rgba(220, 38, 38, 0.1)',
          borderRadius: '4px',
          border: '1px solid #dc2626'
        }}>
          <strong style={{ color: '#dc2626' }}>今後の展望：</strong>
          <p style={{ marginTop: '8px', color: '#475569', lineHeight: '1.8' }}>
            RSAは40年以上にわたり活躍してきましたが、今後数年～数十年で
            耐量子計算機暗号への移行が進むと考えられています。
            しかし、RSAから学んだ公開鍵暗号の概念や数学的基礎は、
            現代暗号を理解する上で今も非常に重要です。
          </p>
        </div>
      </section>

      {/* 2048ビット鍵生成 */}
      <section style={{
        marginBottom: '32px',
        background: 'rgba(99, 102, 241, 0.05)',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#0f172a' }}>
          実用的な2048ビット鍵生成
        </h2>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>
          ここまで小さい数でRSAの仕組みを学びました。最後に、実際に使われる規模の2048ビット鍵を生成してみましょう。
          ブラウザ内で素数を探索するため、数十秒かかる場合があります。
        </p>

        <div style={{
          padding: '20px',
          background: '#fff',
          borderRadius: '4px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '18px', marginBottom: '12px', color: '#6366f1' }}>
            パラメータ
          </h3>
          <div style={{
            padding: '12px',
            background: '#f8fafc',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            公開指数 e = 65537<br />
            素数 p, q = それぞれ {bits / 2} ビット<br />
            法 N = p × q = {bits} ビット
          </div>

          <p style={{ color: '#64748b', marginBottom: '16px' }}>{statusMessage}</p>

          <button
            onClick={generateLargeRSA}
            disabled={status === 'generating'}
            style={{
              width: '100%',
              padding: '12px',
              background: status === 'generating' ? '#94a3b8' : '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: status === 'generating' ? 'not-allowed' : 'pointer'
            }}
          >
            {status === 'generating' ? '生成中...' : '2048ビット鍵を生成'}
          </button>

          {status === 'generating' && (
            <p style={{ marginTop: '12px', fontSize: '14px', color: '#64748b', textAlign: 'center' }}>
              ※ 数十秒かかる場合があります（ブラウザで素数を探索中）
            </p>
          )}
        </div>

        {(largeP !== null || largeQ !== null || largeN !== null || largeD !== null) && (
          <div style={{
            padding: '20px',
            background: '#fff',
            borderRadius: '4px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#6366f1' }}>
              生成結果（16進数）
            </h3>
            <p style={{ fontSize: '14px', color: '#dc2626', marginBottom: '16px' }}>
              ⚠️ 学習用途のみ。実運用では使用しないでください。
            </p>

            {largeP !== null && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#475569',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  p（1024-bit prime）
                </label>
                <textarea
                  readOnly
                  value={formatBigInt(largeP)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    lineHeight: '1.6',
                    resize: 'vertical',
                    minHeight: '120px'
                  }}
                />
              </div>
            )}

            {largeQ !== null && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#475569',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  q（1024-bit prime）
                </label>
                <textarea
                  readOnly
                  value={formatBigInt(largeQ)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    lineHeight: '1.6',
                    resize: 'vertical',
                    minHeight: '120px'
                  }}
                />
              </div>
            )}

            {largeN !== null && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#475569',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  N = p × q（2048-bit modulus）
                </label>
                <textarea
                  readOnly
                  value={formatBigInt(largeN)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    lineHeight: '1.6',
                    resize: 'vertical',
                    minHeight: '160px'
                  }}
                />
              </div>
            )}

            {largeD !== null && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#475569',
                  fontWeight: '500',
                  fontSize: '14px'
                }}>
                  d（秘密指数）
                </label>
                <textarea
                  readOnly
                  value={formatBigInt(largeD)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    lineHeight: '1.6',
                    resize: 'vertical',
                    minHeight: '160px'
                  }}
                />
              </div>
            )}

            <div style={{
              padding: '16px',
              background: 'rgba(220, 38, 38, 0.1)',
              borderRadius: '4px',
              border: '1px solid #dc2626',
              marginTop: '16px'
            }}>
              <strong style={{ color: '#dc2626' }}>注意事項：</strong>
              <ul style={{ paddingLeft: '20px', color: '#475569', lineHeight: '1.8', marginTop: '8px' }}>
                <li>このデモは学習・検証用途に限定されています</li>
                <li>実運用の鍵生成には必ず信頼できるライブラリと安全な乱数源を使用してください</li>
                <li>ブラウザで生成した p, q を第三者へ送ると秘密鍵が再現できます</li>
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* まとめ */}
      <section style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(139, 92, 246, 0.05))',
        borderRadius: '8px',
        border: '1px solid #cbd5e1'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#0f172a' }}>まとめ</h2>
        <div style={{ color: '#475569', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '12px' }}>
            RSA暗号は、数学の美しさと実用性を兼ね備えた画期的な発明でした。
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
            <li>素数、モジュラ演算、オイラーのφ関数といった数学的基礎</li>
            <li>公開鍵と秘密鍵という非対称な鍵ペア</li>
            <li>素因数分解の困難性に基づく安全性</li>
            <li>TLS、SSH、S/MIME、コード署名など幅広い応用</li>
          </ul>
          <p style={{ marginBottom: '12px' }}>
            量子コンピュータの脅威により、今後は新しい暗号方式への移行が進みますが、
            RSAから学ぶことは今も多く残されています。
          </p>
          <p>
            このページで、RSAの仕組みと背景にある数学を少しでも理解していただければ幸いです。
          </p>
        </div>
      </section>
    </div>
  )
}
