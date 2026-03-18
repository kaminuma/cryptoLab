import { useState, useEffect, useRef } from 'react'
import StepLesson, { type LessonStep } from '../components/ui/StepLesson'
import '../components/ui/StepLesson.css'
import { usePageMeta } from '../hooks/usePageMeta'
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
   Step 1: 公開鍵暗号とは — 「南京錠」のたとえ
   ========================================= */
function PublicKeyCryptography() {
  return (
    <>
      <p>
        あなたが友人に秘密の手紙を送りたいとしましょう。
        従来の暗号（共通鍵暗号）は「二人だけが知っている合言葉」で手紙を封印するようなものです。
        しかし、合言葉をどうやって安全に伝えますか？
      </p>
      <p>
        RSAの発想は全く違います。友人が<strong>開いた南京錠</strong>をあなたに郵送します。
        あなたはその南京錠で箱を施錠して送り返す。鍵は友人だけが持っているので、
        友人だけが箱を開けられます。南京錠（公開鍵）はいくつでも配れますが、
        鍵（秘密鍵）を渡す必要は一切ありません。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: 公開鍵暗号（Public-Key Cryptography）</strong><br />
        暗号化と復号に異なる鍵を使う暗号方式。暗号化用の鍵（公開鍵）は公開し、
        復号用の鍵（秘密鍵）は所有者だけが保持する。1977年にRon Rivest、Adi Shamir、
        Leonard Adlemanが発明したRSAが最初の実用的な公開鍵暗号方式。
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>公開鍵（Public Key）</h3>
          <ul>
            <li><strong>誰でも知ってOK</strong>（南京錠そのもの）</li>
            <li>暗号化に使用</li>
            <li>メッセージの検証に使用</li>
            <li>公開ディレクトリに登録可能</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>秘密鍵（Private Key）</h3>
          <ul>
            <li><strong>本人だけが知っている</strong>（南京錠の鍵）</li>
            <li>復号に使用</li>
            <li>署名の生成に使用</li>
            <li>絶対に秘密にする</li>
          </ul>
        </div>
      </div>

      <p>
        <strong>ここがポイント:</strong>{' '}
        公開鍵で暗号化したデータは、対応する秘密鍵でしか復号できません。
        「南京錠」を配るだけなので、鍵を安全に配送する必要がなくなりました。
        これがRSAの革新性です。
      </p>
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

      <div className="step-lesson__callout">
        <strong>用語: 素因数分解（Prime Factorization）</strong><br />
        合成数をその素数の積に分解すること。例: 15 = 3 x 5。
        小さい数では簡単だが、数百桁の数では現在のコンピュータでも実質的に不可能。
        RSAはこの困難性を安全性の根拠にしている。
      </div>

      <ol>
        <li>
          <strong>素数（Prime Number）</strong> — 1とその数自身以外に約数を持たない自然数。
          RSAでは2つの大きな素数p, qを選び、その積 n = p x q を公開鍵の一部にします。
        </li>
        <li>
          <strong>モジュラ演算（剰余演算）</strong> — 割り算の余りを扱う演算。
          <code>17 mod 5 = 2</code> のように表記します。時計の計算（13時 = 1時）と同じ概念です。
        </li>
        <li>
          <strong>オイラーのトーシェント関数 φ(n)</strong> — n以下の正の整数のうちnと互いに素であるものの個数。
          p, qが異なる素数のとき <strong>φ(p x q) = (p - 1) x (q - 1)</strong> です。
        </li>
        <li>
          <strong>モジュラ逆元</strong> — a x d ≡ 1 (mod n) を満たす数dのこと。
          RSAでは秘密指数dがこれにあたります。次のステップで具体的な計算方法を示します。
        </li>
      </ol>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2', textAlign: 'left', display: 'inline-block' }}>
          <div>例: p = 61, q = 53</div>
          <div>n = 61 x 53 = 3233</div>
          <div>φ(n) = 60 x 52 = 3120</div>
          <div>e = 17 (gcd(17, 3120) = 1 ← 互いに素)</div>
          <div>d = 2753 (17 x 2753 mod 3120 = 1)</div>
        </div>
      </div>

      <p>
        <strong>ここがポイント:</strong>{' '}
        nからp, qを求める（素因数分解）のが非常に困難であることが、RSAの安全性の根拠です。
        n = 3233 なら暗算でも分解できますが、617桁の数では人類の計算力をもってしても不可能です。
      </p>
    </>
  )
}

/* =========================================
   Step 3: 拡張ユークリッド互除法 — dの計算
   ========================================= */
function ExtendedEuclidean() {
  return (
    <>
      <p>
        RSA鍵生成で最も重要なステップは、秘密指数dの計算です。
        d は <code>e x d ≡ 1 (mod φ(n))</code> を満たす値、
        すなわち「eのモジュラ逆元」です。これを求めるのが<strong>拡張ユークリッド互除法</strong>です。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: 拡張ユークリッド互除法（Extended Euclidean Algorithm）</strong><br />
        gcd(a, b) = ax + by を満たす整数x, yを求めるアルゴリズム。
        通常のユークリッド互除法が「最大公約数を求める」だけなのに対し、
        拡張版は「その最大公約数を元の数の線形結合で表す係数」も同時に求める。
      </div>

      <p>
        具体例で追ってみましょう。<strong>e = 17, φ(n) = 3120</strong> のとき d を求めます。
      </p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>目標: 17 x d ≡ 1 (mod 3120)</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>Step 1: ユークリッド互除法（下向き）</div>
          <div>  3120 = 183 x 17 + 9</div>
          <div>    17 =   1 x  9 + 8</div>
          <div>     9 =   1 x  8 + <strong>1</strong> ← gcd = 1（逆元が存在する）</div>
          <div>     8 =   8 x  1 + 0</div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>Step 2: 逆代入（上向き）</div>
          <div>  1 = 9 - 1 x 8</div>
          <div>    = 9 - 1 x (17 - 1 x 9) = 2 x 9 - 17</div>
          <div>    = 2 x (3120 - 183 x 17) - 17</div>
          <div>    = 2 x 3120 - 367 x 17</div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>Step 3: mod 3120 で整理</div>
          <div>  17 x (-367) ≡ 1 (mod 3120)</div>
          <div>  -367 mod 3120 = <strong>2753</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>
            検証: 17 x 2753 = 46801 = 15 x 3120 + 1 ≡ 1 (mod 3120) ✓
          </div>
        </div>
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>通常のユークリッド互除法</h3>
          <ul>
            <li>gcd(a, b) を求める</li>
            <li>「eとφ(n)が互いに素か」の判定に使う</li>
            <li>計算量: O(log(min(a,b)))</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>拡張ユークリッド互除法</h3>
          <ul>
            <li>gcd に加えて係数 x, y も求める</li>
            <li>モジュラ逆元 d の計算に使う</li>
            <li>追加コストはほぼゼロ</li>
          </ul>
        </div>
      </div>

      <p>
        <strong>ここがポイント:</strong>{' '}
        dの計算自体は高速（対数オーダー）です。
        しかし、dを求めるにはφ(n)が必要で、φ(n)を知るにはnの素因数p, qが必要です。
        p, qを知っている鍵の持ち主だけがdを計算できる — これがRSAの安全性の仕組みです。
      </p>
    </>
  )
}

/* =========================================
   Step 4: RSA鍵生成アルゴリズム
   ========================================= */
function KeyGenAlgorithm() {
  return (
    <>
      <p>
        ここまでの数学をまとめると、RSAは鍵生成、暗号化、復号の3つのアルゴリズムから成り立っています。
        冒頭の南京錠のたとえに戻ると、このステップは「南京錠と鍵を鋳造する工程」にあたります。
      </p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>鍵生成アルゴリズム KeyGen(k):</strong></div>
          <div>1. 大きな素数 p, q をランダムに選ぶ（各 k/2 ビット）</div>
          <div>2. n = p x q を計算（k ビットの法）</div>
          <div>3. φ(n) = (p-1)(q-1) を計算</div>
          <div>4. gcd(e, φ(n)) = 1 となる e を選ぶ（通常 65537）</div>
          <div>5. 拡張ユークリッド互除法で d = e⁻¹ mod φ(n) を計算</div>
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <span style={{ color: 'var(--color-primary)' }}>公開鍵: (e, n)</span> /{' '}
            <span style={{ color: 'var(--color-accent)' }}>秘密鍵: (d, n)</span>
          </div>
        </div>
      </div>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>暗号化 Enc(m, pk):</strong> c = m<sup>e</sup> mod n</div>
          <div><strong>復号 Dec(c, sk):</strong> m = c<sup>d</sup> mod n</div>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>なぜ正しく復号できるのか？</strong>{' '}
        e x d ≡ 1 (mod φ(n)) という関係と、オイラーの定理（m<sup>φ(n)</sup> ≡ 1 (mod n)）により、
        (m<sup>e</sup>)<sup>d</sup> = m<sup>ed</sup> = m<sup>1 + kφ(n)</sup> = m x (m<sup>φ(n)</sup>)<sup>k</sup> ≡ m x 1 ≡ m (mod n)。
        つまり「eで累乗してdで累乗すると元に戻る」のです。
      </div>

      <p>
        公開指数eには慣例的に <strong>65537</strong>（2<sup>16</sup> + 1）がよく使われます。
        バイナリ表現でビットが2つしか立たない（10000000000000001）ため、
        繰り返し二乗法での暗号化が高速になります。
      </p>

      <p>
        <strong>ここがポイント:</strong>{' '}
        鍵生成の最も重要な制約は「p, qは十分に大きく、かつランダムに選ぶ」こと。
        p ≈ q や、p - q が小さすぎると、フェルマーの因数分解法で容易にnが分解されてしまいます。
      </p>
    </>
  )
}

/* =========================================
   Step 5: 小さい数でのインタラクティブデモ
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
      <p>
        南京錠のたとえを数学で実現してみましょう。
        小さい素数を使って鍵を生成し、暗号化・復号の計算を一つ一つ追えるようにしています。
      </p>

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
          <button onClick={generateKeys} className="step-lesson__demo-btn step-lesson__demo-btn--primary" style={{ width: '100%' }}>
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
              <button onClick={encrypt} className="step-lesson__demo-btn step-lesson__demo-btn--primary" style={{ width: '100%' }}>
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
                  <button onClick={decrypt} className="step-lesson__demo-btn step-lesson__demo-btn--primary" style={{ width: '100%' }}>
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

      <p>
        <strong>ここがポイント:</strong>{' '}
        公開鍵(e, n)で暗号化したものは、秘密鍵(d, n)でしか復号できません。
        ただし、このデモは「教科書RSA（Textbook RSA）」と呼ばれる素朴な方式です。
        実はこのままでは深刻な脆弱性があります。次のステップで詳しく見ていきましょう。
      </p>
    </>
  )
}

/* =========================================
   Step 6: テキストRSA vs 実用RSA
   ========================================= */
function TextbookVsPractical() {
  return (
    <>
      <p>
        前のステップで体験した <code>c = m<sup>e</sup> mod n</code> は「教科書RSA」と呼ばれます。
        教科書としては正しいのですが、そのまま使うと<strong>複数の深刻な攻撃</strong>が可能です。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: 教科書RSA（Textbook RSA）</strong><br />
        パディングなしで平文を直接 m<sup>e</sup> mod n で暗号化する方式。
        学習用には有益だが、実用には<strong>絶対に使ってはならない</strong>。
      </div>

      <h3 style={{ marginTop: 'var(--spacing-lg)' }}>教科書RSAの脆弱性</h3>

      <ol>
        <li>
          <strong>決定的暗号化（Deterministic Encryption）</strong><br />
          同じ平文は常に同じ暗号文になる。攻撃者は「YES」と「NO」の暗号文を事前計算しておけば、
          暗号文を見ただけで内容が判別できてしまう。
        </li>
        <li style={{ marginTop: 'var(--spacing-sm)' }}>
          <strong>乗法性攻撃（Multiplicative Property）</strong><br />
          Enc(m₁) x Enc(m₂) mod n = Enc(m₁ x m₂ mod n) が成り立つ。
          攻撃者は暗号文を「加工」して、平文の関係を操作できる。
          例: オークションの入札額を2倍にする、電子署名を偽造するなど。
        </li>
        <li style={{ marginTop: 'var(--spacing-sm)' }}>
          <strong>小さい平文への攻撃</strong><br />
          m が小さい場合（例: m = 2）、m<sup>e</sup> {'<'} n となることがあり、
          暗号文 c = m<sup>e</sup> がmod nの影響を受けない。
          この場合、cのe乗根を計算するだけで平文が復元できる。
        </li>
      </ol>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>Before: 教科書RSA</h3>
          <ul>
            <li>同じ平文 → 同じ暗号文</li>
            <li>暗号文の加工が可能（乗法性）</li>
            <li>小さい平文は即座に解読</li>
            <li>選択暗号文攻撃に脆弱</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>After: パディング付きRSA</h3>
          <ul>
            <li>同じ平文でも毎回異なる暗号文</li>
            <li>暗号文の加工が検出される</li>
            <li>ランダムパディングで平文を拡張</li>
            <li>IND-CCA2安全性を達成</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: '2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>乗法性攻撃の具体例:</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            攻撃者は暗号文 c = Enc(m) を知っている
          </div>
          <div>c' = c x 2<sup>e</sup> mod n を計算</div>
          <div>Dec(c') = Dec(c x 2<sup>e</sup>) = m x 2 mod n</div>
          <div style={{ color: 'var(--color-accent)' }}>
            → 暗号文を「加工」するだけで、平文を2倍にできてしまう!
          </div>
        </div>
      </div>

      <p>
        <strong>ここがポイント:</strong>{' '}
        教科書RSAは「数学的に正しい」だけであり、暗号学的に安全ではありません。
        実用RSAには必ずパディングスキーム（OAEP等）を適用し、
        確率的暗号化（Probabilistic Encryption）に変換する必要があります。
      </p>
    </>
  )
}

/* =========================================
   Step 7: OAEP — 実用RSA暗号化のパディング
   ========================================= */
function OAEPExplanation() {
  return (
    <>
      <p>
        教科書RSAの欠陥を解決するのが<strong>OAEP（Optimal Asymmetric Encryption Padding）</strong>です。
        1994年にBellareとRogawayが提案し、PKCS#1 v2.xとして標準化されました。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: OAEP（Optimal Asymmetric Encryption Padding）</strong><br />
        RSA暗号化の前に平文にランダムな「種（seed）」を混ぜ込むパディング方式。
        毎回異なる暗号文を生成し（確率的暗号化）、ランダムオラクルモデルにおいて
        IND-CCA2安全性（選択暗号文攻撃に対する安全性）を達成する。
      </div>

      <h3 style={{ marginTop: 'var(--spacing-lg)' }}>OAEPの仕組み（2段階マスク生成）</h3>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>入力:</strong> 平文 M, ランダムシード r</div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            Step 1: maskedDB = DB xor MGF(r)
          </div>
          <div>  DB = lHash || PS || 0x01 || M（ラベルハッシュ + パディング + 平文）</div>
          <div>  MGF = マスク生成関数（SHA-256ベース）</div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            Step 2: maskedSeed = r xor MGF(maskedDB)
          </div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            Step 3: EM = 0x00 || maskedSeed || maskedDB
          </div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            Step 4: c = EM<sup>e</sup> mod n（通常のRSA暗号化）
          </div>
        </div>
      </div>

      <p>
        復号時はこの逆を辿ります。まずc<sup>d</sup> mod nでEMを復元し、
        maskedSeedからrを取り出し、rからDBを復元して平文Mを得ます。
        パディングの構造が崩れていれば復号エラーとなり、改ざんが検出されます。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>なぜランダムシードが重要か</h3>
          <ul>
            <li>同じ平文でも毎回異なるrが選ばれる</li>
            <li>→ 毎回異なるEMが生成される</li>
            <li>→ 毎回異なる暗号文cになる</li>
            <li>→ 決定的暗号化の問題を解消</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>なぜ2段階マスクか</h3>
          <ul>
            <li>rでDBをマスク → 平文を隠す</li>
            <li>maskedDBでrをマスク → rも隠す</li>
            <li>「全か無か」変換（AONT）の効果</li>
            <li>部分的な情報漏洩を防ぐ</li>
          </ul>
        </div>
      </div>

      <p>
        <strong>ここがポイント:</strong>{' '}
        OAEPの核心は「ランダムシードによる確率的暗号化」です。
        暗号文から平文の情報が一切漏れないという、教科書RSAにはなかった強力な安全性保証を実現します。
        現代のRSA暗号化には必ずOAEPを使いましょう。
      </p>
    </>
  )
}

/* =========================================
   Step 8: RSA署名 — Hash-then-Sign と PSS
   ========================================= */
function RSASignature() {
  return (
    <>
      <p>
        南京錠のたとえをもう一度思い出してください。
        暗号化は「南京錠で箱を閉じる」行為でしたが、
        署名は逆に「自分だけが持つ鍵で封蝋を押す」行為です。
        誰でも南京錠（公開鍵）で封蝋の真正性を確認できますが、
        封蝋を押せるのは鍵（秘密鍵）の持ち主だけです。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: デジタル署名（Digital Signature）</strong><br />
        秘密鍵でメッセージの「指紋（ハッシュ）」に署名し、
        公開鍵で検証する仕組み。改ざん検知・認証・否認防止の3つを同時に実現する。
      </div>

      <h3 style={{ marginTop: 'var(--spacing-lg)' }}>RSA署名の基本原理</h3>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>署名生成 Sign(m, sk):</strong></div>
          <div>  1. h = Hash(m)　　　← メッセージのハッシュを計算</div>
          <div>  2. s = h<sup>d</sup> mod n　← 秘密鍵で「署名」</div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}><strong>署名検証 Verify(m, s, pk):</strong></div>
          <div>  1. h = Hash(m)　　　← 同じハッシュを計算</div>
          <div>  2. h' = s<sup>e</sup> mod n　← 公開鍵で「復元」</div>
          <div>  3. h == h' なら有効　← 一致を確認</div>
        </div>
      </div>

      <p>
        なぜ直接 m<sup>d</sup> ではなく Hash(m)<sup>d</sup> なのでしょうか？
        それは<strong>Hash-then-Sign</strong>パラダイムが不可欠だからです。
      </p>

      <ol>
        <li>
          <strong>効率性</strong> — mが巨大でも、ハッシュは固定長（256ビット等）なので計算が高速
        </li>
        <li>
          <strong>安全性</strong> — 直接署名すると乗法性攻撃で偽造が可能。
          Sign(m₁) x Sign(m₂) = Sign(m₁ x m₂) となってしまう。
          ハッシュを挟むことで、この代数的構造を破壊する
        </li>
      </ol>

      <h3 style={{ marginTop: 'var(--spacing-lg)' }}>PSS（Probabilistic Signature Scheme）</h3>

      <p>
        OAEPが暗号化のパディングなら、<strong>PSS</strong>は署名のパディングです。
        OAEPと同様にランダムなソルトを混ぜることで、同じメッセージへの署名が毎回異なる値になります。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>Before: PKCS#1 v1.5 署名</h3>
          <ul>
            <li>決定的（同じメッセージ → 同じ署名）</li>
            <li>パディングが固定構造</li>
            <li>Bleichenbacher攻撃の変種に脆弱</li>
            <li>安全性証明が不完全</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>After: RSA-PSS 署名</h3>
          <ul>
            <li>確率的（ランダムソルトで毎回異なる署名）</li>
            <li>ランダムオラクルモデルで安全性証明あり</li>
            <li>TLS 1.3 で必須</li>
            <li>NIST推奨の標準方式</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>RSA-PSS 署名の流れ:</strong></div>
          <div>1. mHash = Hash(M)</div>
          <div>2. M' = 0x00...00 || mHash || salt（ランダムソルトを付加）</div>
          <div>3. H = Hash(M')</div>
          <div>4. DB = PS || 0x01 || salt</div>
          <div>5. maskedDB = DB xor MGF(H)</div>
          <div>6. EM = maskedDB || H || 0xbc</div>
          <div>7. s = EM<sup>d</sup> mod n</div>
        </div>
      </div>

      <p>
        <strong>ここがポイント:</strong>{' '}
        RSA署名は暗号化の「逆操作」（秘密鍵で処理 → 公開鍵で検証）ですが、
        単純な逆操作では安全ではありません。
        Hash-then-Signで代数的構造を壊し、PSSでランダム化することで、
        初めて安全なデジタル署名が実現します。
      </p>
    </>
  )
}

/* =========================================
   Step 9: なぜRSAは安全なのか + 2048ビット鍵デモ
   ========================================= */
function SecurityAndLargeKeyDemo() {
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
          <h3>攻撃者の目標</h3>
          <ul>
            <li>秘密鍵 d を求めたい</li>
            <li>d にはφ(n) が必要</li>
            <li>φ(n) には p, q が必要</li>
            <li>→ nの素因数分解が必要</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2', textAlign: 'left', display: 'inline-block' }}>
          <div>小さい数: 簡単</div>
          <div>  15 = 3 x 5（暗算で可能）</div>
          <div>  3233 = 53 x 61（電卓で数秒）</div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>大きい数: 非常に困難</div>
          <div>  RSA-2048（617桁）の素因数分解:</div>
          <div>  現在の最速アルゴリズム（一般数体篩法）でも</div>
          <div>  数千年～数百万年の計算が必要</div>
        </div>
      </div>

      <p>
        では、実際に2048ビットの鍵を生成してみましょう。
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
            className="step-lesson__demo-btn step-lesson__demo-btn--primary"
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
        実運用の鍵生成には必ず信頼できるライブラリ（OpenSSL、Web Crypto API等）と
        安全な乱数源を使用してください。
      </div>

      <p>
        <strong>ここがポイント:</strong>{' '}
        2048ビットのnは約617桁の数です。この巨大な数を素因数分解することは、
        現在知られている最良のアルゴリズム（一般数体篩法）を使っても、
        地球上の全コンピュータを動員して数千年以上かかると推定されています。
      </p>
    </>
  )
}

/* =========================================
   Step 10: RSAの課題と限界 — 量子時代を見据えて
   ========================================= */
function ChallengesAndLimitations() {
  return (
    <>
      <p>
        RSAは約50年にわたり公開鍵暗号の代名詞として活躍してきましたが、
        いくつかの課題に直面しています。
      </p>

      <ol>
        <li>
          <strong>量子コンピュータの脅威</strong> — 1994年、Peter Shorが発表した
          Shorのアルゴリズムは、量子コンピュータ上で素因数分解を多項式時間で解きます。
          十分に大きな量子コンピュータが実現すれば、どんな鍵長のRSAも破られます。
        </li>
        <li>
          <strong>鍵サイズの増大</strong> — 安全性を保つため、鍵サイズは年々大きくなっています。
          現在は2048ビット以上が推奨され、3072ビットへの移行も議論されています。
          鍵が大きくなるほど処理コストも増加します。
        </li>
        <li>
          <strong>パフォーマンス</strong> — RSAは共通鍵暗号（AES等）と比べて桁違いに遅いため、
          実用ではハイブリッド暗号（RSAで鍵交換 → AESでデータ暗号化）が使われます。
          RSA-2048の暗号化はAES-256の約1000倍遅い。
        </li>
        <li>
          <strong>前方秘匿性の欠如</strong> — RSA鍵交換では秘密鍵が漏洩すると、
          過去の通信もすべて復号されてしまいます。
          TLS 1.3ではこの理由からRSA鍵交換が廃止され、ECDHE（前方秘匿性あり）のみが使われます。
        </li>
      </ol>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>Post-Quantum 暗号</h3>
          <ul>
            <li><strong>ML-KEM（旧Kyber）</strong> — 鍵カプセル化</li>
            <li><strong>ML-DSA（旧Dilithium）</strong> — 署名</li>
            <li><strong>SLH-DSA（旧SPHINCS+）</strong> — 署名</li>
            <li><strong>FN-DSA（旧FALCON）</strong> — 署名</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>基盤となる数学</h3>
          <ul>
            <li><strong>格子暗号</strong> — LWE/MLWE問題</li>
            <li><strong>ハッシュベース署名</strong> — ハッシュ関数のみに依存</li>
            <li><strong>符号ベース暗号</strong> — 誤り訂正符号</li>
            <li><strong>同種写像</strong> — 楕円曲線の同種写像</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>用語: 前方秘匿性（Forward Secrecy）</strong><br />
        長期的な秘密鍵が漏洩しても、過去のセッション鍵が安全であるという性質。
        ECDHE鍵交換では、各セッションで使い捨ての一時鍵を使うため、
        秘密鍵が漏洩しても過去の通信は保護される。RSA鍵交換にはこの性質がない。
      </div>

      <p>
        <strong>ここがポイント:</strong>{' '}
        RSAの数学的基礎と公開鍵暗号の概念は、量子時代の暗号を理解する上でも不可欠です。
        NISTは2024年にポスト量子暗号の標準を発表し、「暗号の大移行」が始まっています。
        RSAを学ぶことは、次世代暗号への架け橋になります。
      </p>
    </>
  )
}

/* =========================================
   Main Page Component
   ========================================= */
export default function RSAPage() {
  usePageMeta({ title: 'RSA暗号', description: 'RSA暗号の数学的基礎からOAEP、電子署名まで学ぶ' })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const steps: LessonStep[] = [
    {
      title: '公開鍵暗号とは — 南京錠のたとえ',
      content: <PublicKeyCryptography />,
      quiz: {
        question: '公開鍵暗号の最大の利点は何か？',
        options: [
          { label: '暗号化の処理速度が速い' },
          { label: '鍵を安全に配送する必要がない', correct: true },
          { label: '暗号文のサイズが小さくなる' },
          { label: '量子コンピュータに耐性がある' },
        ],
        explanation: '正解！ 公開鍵暗号では、公開鍵（南京錠）は自由に配布でき、秘密鍵（鍵）は各自が保管すればよいため、鍵配送問題が解決されます。RSAはむしろAES等より遅く、量子耐性もありません。',
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
        explanation: '正解！ 秘密指数dは e x d ≡ 1 (mod φ(n)) を満たす値として計算されます。φ(n)を知らないとdを求めることができません。攻撃者がφ(n)を知るにはnの素因数分解が必要であり、これが安全性の根拠です。',
      },
    },
    {
      title: '拡張ユークリッド互除法 — dの計算',
      content: <ExtendedEuclidean />,
      quiz: {
        question: '拡張ユークリッド互除法で求められるものは？',
        options: [
          { label: '2つの数の最大公約数のみ' },
          { label: '2つの数の最小公倍数' },
          { label: '最大公約数と、それを元の数の線形結合で表す係数', correct: true },
          { label: '2つの数の素因数分解' },
        ],
        explanation: '正解！ 拡張ユークリッド互除法は gcd(a, b) = ax + by を満たす係数 x, y を求めます。RSAではこの性質を使って e x d ≡ 1 (mod φ(n)) を満たす d を効率的に計算します。',
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
      title: '教科書RSA vs 実用RSA',
      content: <TextbookVsPractical />,
      quiz: {
        question: '教科書RSA（パディングなし）の最大の問題点は？',
        options: [
          { label: '計算速度が遅い' },
          { label: '鍵サイズが大きくなる' },
          { label: '同じ平文が常に同じ暗号文になり、暗号文の加工も可能', correct: true },
          { label: '素因数分解が容易になる' },
        ],
        explanation: '正解！ 教科書RSAは決定的暗号化であり、同じ平文は常に同じ暗号文になります。さらに乗法性（Enc(m1) x Enc(m2) = Enc(m1 x m2)）があり、暗号文を加工して平文を操作できてしまいます。OAEPパディングでこれらの問題を解決します。',
      },
    },
    {
      title: 'OAEP — 実用RSA暗号化のパディング',
      content: <OAEPExplanation />,
      quiz: {
        question: 'RSA-OAEPがランダムシード（r）を使う主な理由は？',
        options: [
          { label: '暗号化の処理速度を上げるため' },
          { label: '鍵のビット長を短くするため' },
          { label: '同じ平文でも毎回異なる暗号文を生成するため（確率的暗号化）', correct: true },
          { label: '復号時のエラー訂正のため' },
        ],
        explanation: '正解！ OAEPのランダムシードにより、同じ平文を同じ公開鍵で暗号化しても毎回異なる暗号文が生成されます。これにより教科書RSAの「決定的暗号化」の問題が解消され、IND-CCA2安全性を達成します。',
      },
    },
    {
      title: 'RSA署名 — Hash-then-Sign と PSS',
      content: <RSASignature />,
      quiz: {
        question: 'RSA署名でメッセージを直接署名せず、ハッシュしてから署名する理由は？',
        options: [
          { label: 'ハッシュ値の方が見た目がきれいだから' },
          { label: '効率性と安全性の両方。固定長にして高速化し、乗法性攻撃を防ぐため', correct: true },
          { label: 'ハッシュ関数がないと秘密鍵を計算できないから' },
          { label: '法律で義務付けられているから' },
        ],
        explanation: '正解！ Hash-then-Signは2つの利点があります。(1) 任意長のメッセージを固定長に圧縮して計算を高速化。(2) ハッシュを挟むことで、直接署名の場合に生じる乗法性（Sign(m1) x Sign(m2) = Sign(m1 x m2)）による偽造攻撃を防ぎます。',
      },
    },
    {
      title: 'RSAの安全性と2048ビット鍵生成',
      content: <SecurityAndLargeKeyDemo />,
    },
    {
      title: 'RSAの課題と限界 — 量子時代を見据えて',
      content: <ChallengesAndLimitations />,
      quiz: {
        question: 'TLS 1.3でRSA鍵交換が廃止された主な理由は？',
        options: [
          { label: 'RSAの計算が遅すぎるから' },
          { label: 'RSAの鍵サイズが大きすぎるから' },
          { label: 'RSA鍵交換には前方秘匿性がなく、秘密鍵の漏洩で過去の通信も解読されるから', correct: true },
          { label: 'RSAは量子コンピュータに弱いから' },
        ],
        explanation: '正解！ RSA鍵交換では、サーバーの秘密鍵が1つでも漏洩すると、その鍵で保護されたすべての過去の通信が復号されてしまいます（前方秘匿性の欠如）。TLS 1.3ではECDHE（各セッションで一時鍵を生成）のみが許可され、前方秘匿性が保証されています。',
      },
    },
  ]

  return (
    <main className="page rsa">
      <StepLesson
        lessonId="rsa"
        title="RSA暗号"
        steps={steps}
      />
    </main>
  )
}
