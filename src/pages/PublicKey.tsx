import { useEffect, useMemo, useState } from 'react'
import StepLesson, { type LessonStep } from '../components/ui/StepLesson'
import '../components/ui/StepLesson.css'
import { usePageMeta } from '../hooks/usePageMeta'
import { ecdhDeriveSecret } from '@/lib/crypto/ecdh'
import { aesGcmDecrypt, aesGcmEncrypt, hkdf } from '@/lib/crypto/webcrypto'
import { base64ToBytes, bytesToBase64, bytesToUtf8, utf8ToBytes } from '@/utils/encoding'

/* =========================================
   ユーティリティ（既存のまま維持）
   ========================================= */

type MatchState = 'unknown' | 'matched' | 'mismatch'

const randomSalt = () => {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16))
  return bytesToBase64(saltBytes)
}

const exportPublicKey = async (key: CryptoKey) => {
  const raw = await crypto.subtle.exportKey('raw', key)
  return bytesToBase64(new Uint8Array(raw))
}

const compareBytes = (a: Uint8Array, b: Uint8Array) => {
  if (a.length !== b.length) return false
  return a.every((value, idx) => value === b[idx])
}

/* =========================================
   Step 1: 公開鍵暗号とは？
   たとえ話 → 定義 → 対称暗号との対比
   ========================================= */
function WhatIsPublicKey() {
  return (
    <>
      <p>
        共通鍵暗号では、AliceとBobが<strong>同じ鍵</strong>を持つ必要がありました。
        しかし、二人が一度も会ったことがなければ、どうやって鍵を安全に渡せばよいのでしょうか？
        この「鍵配送問題」を根本的に解決したのが<strong>公開鍵暗号（非対称暗号）</strong>です。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: 公開鍵暗号（非対称暗号）</strong><br />
        暗号化と復号に<strong>2つの異なる鍵</strong>を使う暗号方式。
        一方の鍵（公開鍵）は誰にでも配布でき、もう一方（秘密鍵）は所有者だけが保管する。
        英語では Public-key cryptography / Asymmetric cryptography。
      </div>

      <p>
        たとえ話で理解しましょう。Aliceが<strong>開いた南京錠</strong>を大量に作り、誰にでも配ります。
        Bobは南京錠でメッセージを箱に入れてロックし、Aliceに送ります。
        ロックを解除できるのは、鍵を持つAliceだけです。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>公開鍵 (Public Key)</h3>
          <ul>
            <li><strong>公開:</strong> 誰にでも共有できる</li>
            <li><strong>用途:</strong> 暗号化・署名検証</li>
            <li><strong>例え:</strong> 南京錠（誰でもロックできる）</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>秘密鍵 (Private Key)</h3>
          <ul>
            <li><strong>秘密:</strong> 所有者だけが持つ</li>
            <li><strong>用途:</strong> 復号・署名作成</li>
            <li><strong>例え:</strong> 南京錠の鍵（持ち主だけが開けられる）</li>
          </ul>
        </div>
      </div>

      <p>
        数学的には、公開鍵暗号は<strong>一方向性関数（trapdoor function）</strong>に基づいています。
        公開鍵から秘密鍵を求めることが計算上不可能であることが安全性の根拠です。
      </p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>鍵生成:</strong> Gen() → (pk, sk)（公開鍵と秘密鍵のペアを生成）</div>
          <div><strong>暗号化:</strong> Enc(pk, M) → C（公開鍵pkで平文Mを暗号化）</div>
          <div><strong>復号:</strong> Dec(sk, C) → M（秘密鍵skで暗号文Cを復号）</div>
          <div style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-text-subtle)' }}>
            正しさの条件: Dec(sk, Enc(pk, M)) = M
          </div>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>歴史的背景:</strong> 公開鍵暗号は1976年にWhitfield DiffieとMartin Hellmanが概念を発表し、
        1977年にRivest・Shamir・Adleman（RSA）が最初の実用的なアルゴリズムを構築しました。
        この発明により、事前に秘密を共有しなくても安全な通信が可能になり、
        現代のインターネットセキュリティの基盤となっています。
      </div>
    </>
  )
}

/* =========================================
   Step 2: 楕円曲線の直感的理解
   幾何学的イメージ → 点の加算 → スカラー倍
   ========================================= */
function EllipticCurveIntuition() {
  return (
    <>
      <p>
        現代の公開鍵暗号の多くは<strong>楕円曲線</strong>を使います。
        「楕円曲線」と聞くと難しそうですが、幾何学的には非常に美しい構造を持っています。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: 楕円曲線</strong><br />
        y² = x³ + ax + b という方程式で表される曲線。
        暗号で使うのは有限体上の楕円曲線だが、
        まずは実数上の曲線で直感を掴もう。
      </div>

      <h3>点の加算 — 幾何学的イメージ</h3>
      <p>
        楕円曲線上の2つの点P, Qを結ぶ<strong>直線</strong>を引くと、
        曲線ともう1つの交点R&apos;が見つかります。
        このR&apos;を<strong>x軸に対して反転</strong>（y座標の符号を反転）した点Rを、
        P + Q = R と定義します。
      </p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div>楕円曲線上の点の加算: P + Q = R</div>
          <div>━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          <div>1. 曲線上の2点 P, Q を選ぶ</div>
          <div>2. P と Q を結ぶ直線を引く</div>
          <div>3. 直線と曲線の第3の交点 R&apos; を求める</div>
          <div>4. R&apos; を x軸で反転 → R = P + Q</div>
          <div>━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          <div style={{ color: 'var(--color-text-subtle)' }}>
            特殊ケース: P = Q の場合は、Pでの接線を引く（点の2倍算）
          </div>
        </div>
      </div>

      <h3>スカラー倍 — 公開鍵暗号の核心</h3>
      <p>
        点Gに対して「G + G + G + ... + G」（n回加算）を<strong>スカラー倍</strong>と呼び、
        n・G と書きます。
        ここで重要なのは次の非対称性です。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>簡単な方向（計算可能）</h3>
          <ul>
            <li>n と G が分かっている</li>
            <li>n・G を計算する</li>
            <li>「ダブル・アンド・アド」法で高速に計算可能</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>困難な方向（事実上不可能）</h3>
          <ul>
            <li>G と n・G が分かっている</li>
            <li>n を逆算する（楕円曲線離散対数問題: ECDLP）</li>
            <li>256ビット曲線で約 2¹²⁸ の計算量が必要</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>なぜ楕円曲線が選ばれるのか:</strong> RSAの素因数分解と比較して、
        楕円曲線離散対数問題には準指数時間アルゴリズムが知られていません。
        そのため、<strong>256ビットの楕円曲線鍵は3072ビットのRSA鍵に匹敵するセキュリティ</strong>を持ちます。
        鍵が短いので、通信コストが下がり、モバイルやIoTデバイスにも適しています。
      </div>
    </>
  )
}

/* =========================================
   Step 3: 古典的DH鍵交換デモ（小さい数で体験）
   ========================================= */
function ClassicDHDemo() {
  const [p] = useState(23)
  const [g] = useState(5)
  const [aliceSecret, setAliceSecret] = useState(6)
  const [bobSecret, setBobSecret] = useState(15)

  const modPow = (base: number, exp: number, mod: number): number => {
    let result = 1
    base = base % mod
    while (exp > 0) {
      if (exp % 2 === 1) result = (result * base) % mod
      exp = Math.floor(exp / 2)
      base = (base * base) % mod
    }
    return result
  }

  const alicePub = modPow(g, aliceSecret, p)
  const bobPub = modPow(g, bobSecret, p)
  const sharedAlice = modPow(bobPub, aliceSecret, p)
  const sharedBob = modPow(alicePub, bobSecret, p)

  return (
    <>
      <p>
        Diffie-Hellman鍵交換を<strong>小さい数</strong>で実際に計算してみましょう。
        AliceとBobが、盗聴されている通信路上で共通の秘密を作る過程を追います。
      </p>

      <div className="step-lesson__demo-box">
        <div style={{ marginBottom: '1rem' }}>
          <strong>公開パラメータ（誰でも知っている）:</strong>
          <div className="step-lesson__mono" style={{ fontSize: '0.9rem' }}>
            素数 p = {p}, 生成元 g = {g}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label className="step-lesson__label">Alice の秘密鍵 a</label>
            <input
              type="range"
              min={2}
              max={p - 2}
              value={aliceSecret}
              onChange={e => setAliceSecret(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <div className="step-lesson__mono" style={{ textAlign: 'center' }}>{aliceSecret}</div>
          </div>
          <div>
            <label className="step-lesson__label">Bob の秘密鍵 b</label>
            <input
              type="range"
              min={2}
              max={p - 2}
              value={bobSecret}
              onChange={e => setBobSecret(Number(e.target.value))}
              style={{ width: '100%' }}
            />
            <div className="step-lesson__mono" style={{ textAlign: 'center' }}>{bobSecret}</div>
          </div>
        </div>

        <div className="step-lesson__table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Alice</th>
                <th>Bob</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>1. 秘密鍵を選ぶ</strong></td>
                <td>a = {aliceSecret}</td>
                <td>b = {bobSecret}</td>
              </tr>
              <tr>
                <td><strong>2. 公開値を計算</strong></td>
                <td>A = {g}^{aliceSecret} mod {p} = <strong>{alicePub}</strong></td>
                <td>B = {g}^{bobSecret} mod {p} = <strong>{bobPub}</strong></td>
              </tr>
              <tr>
                <td><strong>3. 公開値を交換</strong></td>
                <td>Bobから B = {bobPub} を受信</td>
                <td>Aliceから A = {alicePub} を受信</td>
              </tr>
              <tr>
                <td><strong>4. 共有秘密を計算</strong></td>
                <td>{bobPub}^{aliceSecret} mod {p} = <strong>{sharedAlice}</strong></td>
                <td>{alicePub}^{bobSecret} mod {p} = <strong>{sharedBob}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          background: sharedAlice === sharedBob
            ? 'var(--sl-color-success-bg, #c6f6d5)'
            : 'var(--sl-color-danger-bg, #fed7d7)',
          color: sharedAlice === sharedBob
            ? 'var(--sl-color-success, #22543d)'
            : 'var(--sl-color-danger, #822727)',
          fontWeight: 'bold',
          textAlign: 'center',
          marginTop: '0.75rem',
        }}>
          共有秘密: {sharedAlice}（両者が同じ値を得た！）
        </div>

        <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--sl-color-muted)' }}>
          盗聴者は p={p}, g={g}, A={alicePub}, B={bobPub} を知っていますが、
          a={aliceSecret} や b={bobSecret} を知らないため共有秘密 {sharedAlice} を計算できません。
          スライダーを動かして、秘密鍵を変えると共有秘密がどう変わるか観察してみましょう。
        </p>
      </div>

      <div className="step-lesson__callout">
        <strong>実際の鍵サイズ:</strong> この例では p=23（5ビット）ですが、
        実用では2048ビット以上の素数を使います。
        離散対数問題（g^a mod p から a を逆算する）の困難性が安全性の根拠です。
      </div>
    </>
  )
}

/* =========================================
   Step 4: DH → ECDH の橋渡し
   古典DH → 楕円曲線への写像 → ECDHプロトコル
   ========================================= */
function DHToECDH() {
  return (
    <>
      <p>
        Diffie-Hellman鍵交換は、<strong>盗聴されている通信路でも安全に共通の秘密を作れる</strong>プロトコルです。
        まず古典的なDHを理解し、次にそれが楕円曲線上でどう変わるかを見ていきましょう。
      </p>

      <h3>古典的 Diffie-Hellman（整数上）</h3>
      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div>公開パラメータ: 素数 p, 生成元 g</div>
          <div>━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          <div>Alice: 秘密鍵 a を選択 → 公開値 A = g^a mod p</div>
          <div>Bob:   秘密鍵 b を選択 → 公開値 B = g^b mod p</div>
          <div>━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          <div>Alice: B を受信 → B^a = g^(ab) mod p</div>
          <div>Bob:   A を受信 → A^b = g^(ab) mod p</div>
          <div>━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          <div>共有秘密: g^(ab) mod p（両者が同じ値を得る）</div>
        </div>
      </div>

      <h3>ECDH — 楕円曲線版への対応</h3>
      <p>
        古典DHの各操作は、楕円曲線上の操作に<strong>1対1で対応</strong>します。
        「累乗」が「スカラー倍」に、「乗算」が「点の加算」に置き換わります。
      </p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div>古典 DH              →  ECDH</div>
          <div>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          <div>群の元: g             →  ベースポイント G</div>
          <div>累乗: g^a mod p       →  スカラー倍: a・G</div>
          <div>乗算: (g^a)^b mod p   →  スカラー倍: b・(a・G) = ab・G</div>
          <div>安全性: 離散対数問題   →  楕円曲線離散対数問題 (ECDLP)</div>
          <div>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            <strong>ECDHプロトコル:</strong>
          </div>
          <div>Alice: 秘密鍵 a → 公開鍵 A = a・G</div>
          <div>Bob:   秘密鍵 b → 公開鍵 B = b・G</div>
          <div>共有秘密: Alice → a・B = a・(b・G) = ab・G</div>
          <div>          Bob   → b・A = b・(a・G) = ab・G  ← 同じ点!</div>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>ポイント:</strong> 盗聴者はA（= a・G）とB（= b・G）を見ることができますが、
        aやbを知らなければ共有秘密 ab・G を計算できません。
        これは楕円曲線離散対数問題（ECDLP）の困難さに基づいています。
        ECDHは古典DHと同等のセキュリティを、はるかに短い鍵長で実現します。
      </div>

      <div className="step-lesson__callout">
        <strong>代表的な楕円曲線:</strong><br />
        <strong>P-256（secp256r1）:</strong> NISTが標準化。TLSで最も広く使われる。256ビット。<br />
        <strong>Curve25519:</strong> Daniel Bernsteinが設計。実装が容易でサイドチャネル攻撃に強い。WireGuard、Signal等で採用。<br />
        <strong>secp256k1:</strong> Bitcoinで使用。係数が単純で検証可能な構造。
      </div>
    </>
  )
}

/* =========================================
   Step 4: ECDH鍵交換デモ（既存のまま維持）
   ========================================= */
function InteractiveDHDemo() {
  const defaultMessage = 'ECDH → HKDF → AES-GCM をまとめて体験しましょう。'
  const [message, setMessage] = useState(defaultMessage)
  const [saltBase64, setSaltBase64] = useState(randomSalt)
  const [infoString, setInfoString] = useState('CryptoLab demo key')
  const [alicePub, setAlicePub] = useState('')
  const [bobPub, setBobPub] = useState('')
  const [sharedA, setSharedA] = useState('')
  const [sharedB, setSharedB] = useState('')
  const [sharedMatch, setSharedMatch] = useState<MatchState>('unknown')
  const [derivedKey, setDerivedKey] = useState<Uint8Array | null>(null)
  const [ivBase64, setIvBase64] = useState('')
  const [cipherBase64, setCipherBase64] = useState('')
  const [decryptedText, setDecryptedText] = useState('')
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState<'info' | 'error'>('info')
  const [isProcessing, setIsProcessing] = useState(false)

  const matchLabel = useMemo(() => {
    switch (sharedMatch) {
      case 'matched':
        return '共有秘密が一致しています'
      case 'mismatch':
        return '共有秘密が不一致'
      default:
        return '共有秘密は未計算'
    }
  }, [sharedMatch])

  const setStatus = (message: string, type: 'info' | 'error' = 'info') => {
    setFeedback(message)
    setFeedbackType(type)
  }

  const handleKeyExchange = async () => {
    try {
      setIsProcessing(true)
      const saltBytes = base64ToBytes(saltBase64)
      const infoBytes = utf8ToBytes(infoString || 'CryptoLab')

      const { za, zb, alice, bob } = await ecdhDeriveSecret()
      const aliceKey = await exportPublicKey(alice.publicKey)
      const bobKey = await exportPublicKey(bob.publicKey)
      const derived = await hkdf(za, saltBytes, infoBytes, 32)

      const match = compareBytes(za, zb)
      setSharedMatch(match ? 'matched' : 'mismatch')

      setAlicePub(aliceKey)
      setBobPub(bobKey)
      setSharedA(bytesToBase64(za))
      setSharedB(bytesToBase64(zb))
      setDerivedKey(derived)
      setDecryptedText('')
      setStatus('鍵共有に成功。導出された鍵を使って暗号化できます。')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '鍵共有に失敗しました。', 'error')
      setSharedMatch('unknown')
    } finally {
      setIsProcessing(false)
    }
  }

  const ensureKeyReady = () => {
    if (!derivedKey) {
      throw new Error('先に「鍵共有を実行」でキーを生成してください。')
    }
  }

  const handleEncrypt = async () => {
    try {
      ensureKeyReady()
      if (!message.trim()) {
        throw new Error('暗号化するメッセージを入力してください。')
      }
      setIsProcessing(true)
      const result = await aesGcmEncrypt(derivedKey!, utf8ToBytes(message))
      setIvBase64(bytesToBase64(result.iv))
      setCipherBase64(bytesToBase64(result.ct))
      setDecryptedText('')
      setStatus('暗号化完了。IV と暗号文を相手に安全に渡してください。')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '暗号化に失敗しました。', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDecrypt = async () => {
    try {
      ensureKeyReady()
      if (!ivBase64.trim() || !cipherBase64.trim()) {
        throw new Error('IV と暗号文（Base64）を入力してください。')
      }
      setIsProcessing(true)
      const iv = base64ToBytes(ivBase64)
      const ct = base64ToBytes(cipherBase64)
      const result = await aesGcmDecrypt(derivedKey!, iv, ct)
      setDecryptedText(bytesToUtf8(result))
      setStatus('復号に成功しました。', 'info')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '復号に失敗しました。', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <p>
        ECDH鍵交換からHKDF鍵導出、そしてAES-GCM暗号化までの一連の流れを体験しましょう。
      </p>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>

        <label htmlFor="dh-salt">ソルト (Base64)</label>
        <div className="step-lesson__demo-row">
          <input
            id="dh-salt"
            type="text"
            value={saltBase64}
            onChange={(e) => setSaltBase64(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={() => setSaltBase64(randomSalt())}
          disabled={isProcessing}
          className="step-lesson__demo-btn step-lesson__demo-btn--secondary"
        >
          ソルトを再生成
        </button>

        <label htmlFor="dh-info">info（用途ラベル）</label>
        <input
          id="dh-info"
          type="text"
          value={infoString}
          onChange={(e) => setInfoString(e.target.value)}
        />

        <div className="step-lesson__demo-actions">
          <button
            type="button"
            onClick={handleKeyExchange}
            disabled={isProcessing}
            className="step-lesson__demo-btn step-lesson__demo-btn--primary"
          >
            鍵共有を実行
          </button>
        </div>

        {feedback && (
          <div className={`step-lesson__quiz-feedback ${
            feedbackType === 'error' ? 'step-lesson__quiz-feedback--wrong' : 'step-lesson__quiz-feedback--correct'
          }`}>
            {feedback}
          </div>
        )}

        <div className={`step-lesson__quiz-feedback ${
          sharedMatch === 'matched' ? 'step-lesson__quiz-feedback--correct' :
          sharedMatch === 'mismatch' ? 'step-lesson__quiz-feedback--wrong' : ''
        }`}>
          {matchLabel}
        </div>

        {alicePub && (
          <>
            <label>Alice 公開鍵（Base64 raw）</label>
            <div className="step-lesson__demo-result">{alicePub}</div>

            <label>Bob 公開鍵（Base64 raw）</label>
            <div className="step-lesson__demo-result">{bobPub}</div>

            <label>Alice の共有秘密</label>
            <div className="step-lesson__demo-result">{sharedA}</div>

            <label>Bob の共有秘密</label>
            <div className="step-lesson__demo-result">{sharedB}</div>
          </>
        )}
      </div>

      {derivedKey && (
        <div className="step-lesson__demo">
          <span className="step-lesson__demo-label">MESSAGE ENCRYPTION</span>

          <label htmlFor="dh-message">暗号化するメッセージ</label>
          <textarea
            id="dh-message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="ここに短いメッセージを入力"
          />

          <div className="step-lesson__demo-actions">
            <button
              type="button"
              onClick={handleEncrypt}
              disabled={isProcessing}
              className="step-lesson__demo-btn step-lesson__demo-btn--primary"
            >
              暗号化
            </button>
            <button
              type="button"
              onClick={handleDecrypt}
              disabled={isProcessing}
              className="step-lesson__demo-btn step-lesson__demo-btn--secondary"
            >
              復号
            </button>
          </div>

          <label>IV（Base64）</label>
          <textarea
            rows={2}
            value={ivBase64}
            onChange={(e) => setIvBase64(e.target.value)}
            placeholder="暗号化で得た IV を貼り付け"
          />

          <label>暗号文（Base64）</label>
          <textarea
            rows={3}
            value={cipherBase64}
            onChange={(e) => setCipherBase64(e.target.value)}
            placeholder="暗号化で得た Base64 を貼り付け"
          />

          <label>復号結果</label>
          <div className="step-lesson__demo-result">
            {decryptedText || '（復号結果がここに表示されます）'}
          </div>
        </div>
      )}

      <div className="step-lesson__callout">
        <strong>注意:</strong> ECDHから得た共有秘密は必ずHKDFなどで鍵導出し、直接AESに使わないのが原則です。
        公開鍵は証明書や署名で真正性を確認する必要があります。
      </div>
    </>
  )
}

/* =========================================
   Step 5: ECDSA — デジタル署名の正確な仕組み
   署名の目的 → 署名生成 → 署名検証
   ========================================= */
function DigitalSignaturesECDSA() {
  return (
    <>
      <p>
        公開鍵暗号のもう一つの重要な応用が<strong>デジタル署名</strong>です。
        「メッセージが改ざんされていないこと」と「確かにその人が作成したこと」を数学的に証明します。
      </p>

      <div className="step-lesson__callout">
        <strong>重要な誤解を正す:</strong> よく「署名 = ハッシュ値を秘密鍵で暗号化したもの」と説明されますが、
        これはRSA署名の簡略化された説明であり、<strong>ECDSAには当てはまりません</strong>。
        ECDSAでは暗号化/復号という操作は一切行わず、
        楕円曲線上の代数的な計算で署名を生成・検証します。
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>署名が提供する性質</h3>
          <ul>
            <li><strong>認証:</strong> 誰が署名したか確認できる</li>
            <li><strong>完全性:</strong> 内容が改ざんされていないことを保証</li>
            <li><strong>否認防止:</strong> 署名者は後から否定できない</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>署名が提供しない性質</h3>
          <ul>
            <li><strong>機密性:</strong> メッセージの内容は暗号化されない</li>
            <li>署名付きメッセージは誰でも読める</li>
            <li>秘密にしたい場合は別途暗号化が必要</li>
          </ul>
        </div>
      </div>

      <h3>ECDSA 署名生成（Sign）</h3>
      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div>前提: 秘密鍵 d, 公開鍵 Q = d・G, 曲線の位数 n</div>
          <div>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          <div>1. メッセージ m のハッシュ値を計算: e = HASH(m)</div>
          <div>2. ランダムな整数 k を選択（1 {'<'} k {'<'} n）</div>
          <div>3. 曲線上の点を計算: R = k・G</div>
          <div>4. r = R の x座標 mod n（r = 0 なら k を再選択）</div>
          <div>5. s = k⁻¹ (e + r・d) mod n（s = 0 なら k を再選択）</div>
          <div>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          <div>署名: (r, s)</div>
        </div>
      </div>

      <h3>ECDSA 署名検証（Verify）</h3>
      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div>入力: メッセージ m, 署名 (r, s), 公開鍵 Q</div>
          <div>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          <div>1. ハッシュ値を計算: e = HASH(m)</div>
          <div>2. u₁ = e・s⁻¹ mod n</div>
          <div>3. u₂ = r・s⁻¹ mod n</div>
          <div>4. 点を計算: R&apos; = u₁・G + u₂・Q</div>
          <div>5. R&apos; の x座標 mod n が r と一致すれば有効</div>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>なぜこれで検証できるのか:</strong>{' '}
        u₁・G + u₂・Q = u₁・G + u₂・(d・G) = (u₁ + u₂・d)・G を展開すると、
        正しい署名の場合、これは元の k・G = R と一致します。
        つまり、秘密鍵 d を知らなくても、公開鍵 Q を使って署名の正当性を数学的に検証できます。
      </div>

      <div className="step-lesson__callout">
        <strong>k の選び方は生死を分ける:</strong>{' '}
        ランダム値 k は署名ごとに必ず異なる値を使わなければなりません。
        2010年、Sony PlayStation 3 のコード署名で同じ k を再利用したため秘密鍵が漏洩するという事件がありました。
        k が分かれば d = (s・k - e) / r mod n で秘密鍵が直ちに計算できてしまいます。
        現代の実装では RFC 6979 に基づく決定的 k 生成が推奨されています。
      </div>
    </>
  )
}

/* =========================================
   Step 6: PKI — 公開鍵基盤の全体像
   証明書 → チェーン → CRL/OCSP → CT
   ========================================= */
function PublicKeyInfrastructure() {
  return (
    <>
      <p>
        公開鍵暗号を実用的に使うには、<strong>「この公開鍵は本当にその人のものか？」</strong>を確認する仕組みが必要です。
        中間者攻撃（MITM）を防ぐために、公開鍵と所有者の対応関係を信頼できる第三者が保証する
        <strong>PKI（Public Key Infrastructure）</strong>が構築されています。
      </p>

      <h3>デジタル証明書（X.509）</h3>
      <p>
        デジタル証明書は、公開鍵と所有者情報を<strong>認証局（CA）の署名</strong>で束ねたものです。
      </p>
      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div>X.509 証明書の主な内容:</div>
          <div>━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          <div>  バージョン: v3</div>
          <div>  シリアル番号: 一意な識別子</div>
          <div>  発行者 (Issuer): CA の識別名</div>
          <div>  有効期間: Not Before / Not After</div>
          <div>  主体者 (Subject): 所有者の識別名</div>
          <div>  公開鍵: アルゴリズム + 鍵データ</div>
          <div>  拡張: SAN, Key Usage, Basic Constraints...</div>
          <div>  署名: CA による署名</div>
        </div>
      </div>

      <h3>証明書チェーン — 信頼の連鎖</h3>
      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div>ルートCA証明書（自己署名 / ブラウザにプリインストール）</div>
          <div>  └─ ルートCAの秘密鍵で署名</div>
          <div>       ↓</div>
          <div>中間CA証明書（ルートCAが署名）</div>
          <div>  └─ 中間CAの秘密鍵で署名</div>
          <div>       ↓</div>
          <div>エンドエンティティ証明書（中間CAが署名）</div>
          <div>  └─ example.com の公開鍵を含む</div>
        </div>
      </div>
      <p>
        ルートCAは厳重に保護されたオフライン環境に置かれ、直接証明書を発行しません。
        中間CAを介すことで、ルート鍵の露出リスクを最小化しています。
      </p>

      <h3>証明書の失効 — CRL と OCSP</h3>
      <p>
        秘密鍵の漏洩や証明書の誤発行が発生した場合、有効期限前でも証明書を<strong>失効</strong>させる必要があります。
      </p>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>CRL（証明書失効リスト）</h3>
          <ul>
            <li>CAが定期的に公開するブラックリスト</li>
            <li>失効した証明書のシリアル番号を列挙</li>
            <li>リストが肥大化するとダウンロードに時間がかかる</li>
            <li>更新間隔（通常数時間〜1日）の遅延がある</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>OCSP（オンライン証明書状態プロトコル）</h3>
          <ul>
            <li>個別の証明書をリアルタイムで問い合わせ</li>
            <li>応答は「有効」「失効」「不明」のいずれか</li>
            <li>OCSP Stapling: サーバーが応答をキャッシュしてTLSに添付</li>
            <li>プライバシー問題: CAにアクセス先が漏れる（Staplingで軽減）</li>
          </ul>
        </div>
      </div>

      <h3>Certificate Transparency（CT）</h3>
      <p>
        2011年のDigiNotar事件（CAがハッキングされ偽の証明書が発行された）を契機に、
        <strong>Certificate Transparency</strong>が導入されました。
      </p>
      <ul>
        <li>
          <strong>CTログ:</strong> 発行された全ての証明書が公開の追記専用ログに記録される
        </li>
        <li>
          <strong>SCT（Signed Certificate Timestamp）:</strong> ログへの記録を証明するトークン。TLS接続時に提示
        </li>
        <li>
          <strong>モニタリング:</strong> ドメイン所有者がログを監視し、不正な証明書の発行を即座に検知
        </li>
      </ul>

      <div className="step-lesson__callout">
        <strong>現代のWebにおけるPKI:</strong>{' '}
        Let&apos;s Encrypt は ACMEプロトコルで証明書の取得・更新を自動化し、
        HTTPSの普及率を劇的に向上させました。
        2024年時点で、Webトラフィックの95%以上がHTTPSで保護されています。
        ブラウザのアドレスバーの鍵マークは、このPKI全体が正しく機能していることの証です。
      </div>
    </>
  )
}

/* =========================================
   Step 7: ECDSA デジタル署名の3つの性質（詳細）
   認証 / 完全性 / 否認防止の深掘り
   ========================================= */
function SignatureApplications() {
  return (
    <>
      <p>
        デジタル署名は現代のインフラのあらゆる場所で使われています。
        具体的な応用例を通じて、その重要性を理解しましょう。
      </p>

      <h3>ソフトウェア配布とコード署名</h3>
      <ul>
        <li>
          <strong>OSのアップデート:</strong> Windows Update、macOS Software Update はすべてコード署名で検証される。
          署名のないコードの実行はOSレベルでブロックされる。
        </li>
        <li>
          <strong>パッケージマネージャ:</strong> npm, PyPI, apt, Homebrew などがパッケージの署名を検証。
          サプライチェーン攻撃への防御層となる。
        </li>
        <li>
          <strong>Gitコミット署名:</strong> GPG/SSH鍵でコミットに署名し、コードの作者を証明。
          GitHubの &quot;Verified&quot; バッジはこの仕組み。
        </li>
      </ul>

      <h3>ブロックチェーンとデジタル署名</h3>
      <p>
        Bitcoinのトランザクションは<strong>ECDSA（secp256k1）</strong>で署名されます。
        秘密鍵でトランザクションに署名することで「このBitcoinの所有者が送金を承認した」ことを証明します。
        Ethereumも同様にECDSAを使用し、スマートコントラクトの実行認可にも署名が必要です。
      </p>

      <h3>TLS / HTTPS における署名の役割</h3>
      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div>TLS 1.3 ハンドシェイクにおける署名:</div>
          <div>━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          <div>1. Client Hello → サポートする暗号スイートを提示</div>
          <div>2. Server Hello → 暗号スイート選択 + 証明書送信</div>
          <div>3. サーバーがハンドシェイクの transcript を秘密鍵で署名</div>
          <div>4. クライアントが証明書の公開鍵で署名を検証</div>
          <div>   → サーバーが秘密鍵を持つことを証明（認証）</div>
          <div>5. ECDHE で共有秘密を導出 → 以降は対称暗号で通信</div>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>署名とハイブリッド暗号:</strong>{' '}
        実用的なシステムでは、公開鍵暗号は「鍵交換」と「署名」にのみ使い、
        実際のデータ暗号化にはAES等の対称暗号を使います。
        これは公開鍵暗号が対称暗号より数百〜数千倍遅いためで、
        このアプローチを<strong>ハイブリッド暗号</strong>と呼びます。
      </div>
    </>
  )
}

/* =========================================
   Step 8: 公開鍵暗号の安全な使い方
   鍵長 → PFS → 鍵管理 → 量子耐性
   ========================================= */
function SecureUsageGuidelines() {
  return (
    <>
      <p>
        公開鍵暗号を安全に運用するには、アルゴリズムの選択だけでなく、
        <strong>鍵長・鍵管理・プロトコル設計</strong>のすべてを正しく構成する必要があります。
      </p>

      <h3>鍵長の選び方</h3>
      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div>セキュリティ   RSA鍵長    ECC鍵長    対称暗号等価</div>
          <div>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          <div> 80 bit      1024 bit    160 bit    2-Key 3DES</div>
          <div>112 bit      2048 bit    224 bit    3DES</div>
          <div>128 bit      3072 bit    256 bit    AES-128</div>
          <div>192 bit      7680 bit    384 bit    AES-192</div>
          <div>256 bit     15360 bit    521 bit    AES-256</div>
          <div>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          <div style={{ color: 'var(--color-text-subtle)' }}>
            2030年以降は128ビットセキュリティ以上が推奨（NIST SP 800-57）
          </div>
        </div>
      </div>

      <h3>Perfect Forward Secrecy（PFS）</h3>
      <p>
        PFSとは、<strong>長期鍵が将来漏洩しても、過去のセッション鍵が安全に保たれる</strong>性質です。
      </p>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>PFSなし（静的RSA鍵交換）</h3>
          <ul>
            <li>サーバーのRSA秘密鍵でセッション鍵を暗号化</li>
            <li>RSA秘密鍵が漏洩 → 過去の全通信が復号可能</li>
            <li>TLS 1.3 では廃止された方式</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>PFSあり（ECDHE）</h3>
          <ul>
            <li>セッションごとに一時的なECDH鍵ペアを生成</li>
            <li>長期鍵が漏洩しても過去のセッション鍵は安全</li>
            <li>TLS 1.3 では ECDHE が必須</li>
          </ul>
        </div>
      </div>

      <h3>鍵の有効期限と鍵管理</h3>
      <ul>
        <li>
          <strong>鍵のローテーション:</strong> 長期間同じ鍵を使い続けると、漏洩リスクが蓄積する。
          TLS証明書は最長398日（現在は90日への短縮が議論中）。
        </li>
        <li>
          <strong>鍵の保管:</strong> 秘密鍵はHSM（Hardware Security Module）やTPMで保護するのが理想。
          ソフトウェアでの保管はOS提供のキーストア（Keychain, DPAPI等）を利用する。
        </li>
        <li>
          <strong>鍵のバックアップ:</strong> 秘密鍵の紛失は証明書の再発行を意味する。
          エスクロー（第三者預託）にはリスクが伴うため、用途に応じた判断が必要。
        </li>
        <li>
          <strong>鍵の破棄:</strong> 不要になった秘密鍵は確実に消去する。
          メモリ上の鍵データはゼロクリアしてからメモリを解放する。
        </li>
      </ul>

      <h3>量子コンピュータへの備え</h3>
      <div className="step-lesson__callout">
        <strong>ポスト量子暗号（PQC）への移行:</strong>{' '}
        Shorのアルゴリズムにより、十分に大規模な量子コンピュータはRSAとECCを破ることができます。
        NISTは2024年にML-KEM（CRYSTALS-Kyber）、ML-DSA（CRYSTALS-Dilithium）等のPQC標準を発表しました。
        現在推奨されるのは、既存のECDHとPQC鍵交換を組み合わせた
        <strong>ハイブリッドアプローチ</strong>（例: X25519 + ML-KEM-768）です。
        「Harvest Now, Decrypt Later」攻撃（今暗号文を収集し、将来量子コンピュータで復号する）への
        対策として、機密性の高いデータは早期にPQC対応を検討すべきです。
      </div>
    </>
  )
}

/* =========================================
   Step 9: まとめ — 公開鍵暗号の全体像
   ========================================= */
function Summary() {
  return (
    <>
      <p>
        このレッスンで学んだ公開鍵暗号の全体像を振り返りましょう。
      </p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div>公開鍵暗号の3つの柱:</div>
          <div>━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          <div>1. 鍵交換（ECDH）  → 共通の秘密を安全に共有</div>
          <div>2. デジタル署名（ECDSA）→ 認証・完全性・否認防止</div>
          <div>3. 公開鍵基盤（PKI） → 公開鍵の信頼性を保証</div>
          <div>━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
          <div>これらが組み合わさってTLS/HTTPSが成立する</div>
        </div>
      </div>

      <h3>学んだ重要な概念</h3>
      <ul>
        <li>
          <strong>楕円曲線の基礎:</strong> 点の加算とスカラー倍の幾何学的直感。
          ECDLPの困難さが安全性の根拠。
        </li>
        <li>
          <strong>DH → ECDH:</strong> 「累乗 → スカラー倍」の対応関係。
          盗聴されても共有秘密は安全。
        </li>
        <li>
          <strong>ECDSA:</strong> 署名は「暗号化」ではなく、楕円曲線上の代数計算。
          k の再利用は致命的。
        </li>
        <li>
          <strong>PKI:</strong> 証明書チェーン、CRL/OCSP による失効管理、CTによる透明性。
        </li>
        <li>
          <strong>安全な運用:</strong> 適切な鍵長、PFS（ECDHE）、鍵のライフサイクル管理、PQCへの備え。
        </li>
      </ul>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>やるべきこと</h3>
          <ul>
            <li>P-256 または Curve25519 を使う</li>
            <li>PFS（ECDHE）を有効にする</li>
            <li>証明書の有効期限を管理する</li>
            <li>RFC 6979 で決定的 k を生成する</li>
            <li>PQCハイブリッドを検討する</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>やってはいけないこと</h3>
          <ul>
            <li>1024ビットRSAを使う（非推奨）</li>
            <li>ECDSA の k を再利用する</li>
            <li>秘密鍵をログや設定ファイルに平文保存する</li>
            <li>証明書の検証をスキップする</li>
            <li>自己署名証明書を本番環境で使う</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>次のステップ:</strong>{' '}
        公開鍵暗号を深く理解するには、実際のTLSハンドシェイクをWiresharkで観察したり、
        OpenSSLで証明書を作成・検証する実習が効果的です。
        また、ポスト量子暗号（PQC）の標準化が進む今、ML-KEM や ML-DSA の仕組みも学んでおくと、
        今後の暗号技術の移行に備えることができます。
      </div>
    </>
  )
}

/* =========================================
   ページ本体
   ========================================= */
export default function PublicKeyPage() {
  usePageMeta({ title: '公開鍵暗号', description: '楕円曲線暗号、ECDH鍵交換、PKIの仕組みを学ぶ' })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const steps: LessonStep[] = [
    {
      title: '公開鍵暗号とは？',
      content: <WhatIsPublicKey />,
      quiz: {
        question: '公開鍵暗号が解決する根本的な問題は？',
        options: [
          { label: '暗号化の速度が遅いという問題' },
          { label: '事前に秘密鍵を共有できない環境での鍵配送問題', correct: true },
          { label: 'ハッシュ関数の衝突耐性の問題' },
          { label: 'ブロック暗号のブロックサイズの問題' },
        ],
        explanation: '正解！公開鍵暗号は「鍵配送問題」を解決しました。事前に秘密を共有しなくても、公開鍵を使って安全に通信を開始できます。',
      },
    },
    {
      title: '楕円曲線の直感的理解',
      content: <EllipticCurveIntuition />,
      quiz: {
        question: '楕円曲線暗号の安全性の根拠は何ですか？',
        options: [
          { label: '素因数分解の困難さ' },
          { label: '楕円曲線上の離散対数問題（ECDLP）の困難さ', correct: true },
          { label: '楕円曲線の方程式が複雑であること' },
          { label: '点の加算が不可能であること' },
        ],
        explanation: '正解！点GとスカラーnからQ = n・Gを計算するのは簡単ですが、GとQからnを逆算すること（ECDLP）は計算上不可能です。この非対称性が安全性の基盤です。',
      },
    },
    {
      title: '古典的DH鍵交換 — 小さい数で体験',
      content: <ClassicDHDemo />,
      quiz: {
        question: 'DH鍵交換で盗聴者が共有秘密を計算できない理由は？',
        options: [
          { label: '通信が暗号化されているから' },
          { label: '公開値A, Bから秘密鍵a, bを逆算する（離散対数問題）が計算上困難だから', correct: true },
          { label: '素数pが秘密だから' },
          { label: '公開値が毎回変わるから' },
        ],
        explanation: '盗聴者はp, g, A=g^a mod p, B=g^b mod p を知っていますが、AからaやBからbを求めるには離散対数問題を解く必要があり、pが十分大きければ計算上不可能です。',
      },
    },
    {
      title: 'DH から ECDH へ',
      content: <DHToECDH />,
      quiz: {
        question: '古典的DHの「g^a mod p」はECDHではどの操作に対応しますか？',
        options: [
          { label: '点の加算 P + Q' },
          { label: '曲線上の点の座標計算' },
          { label: 'スカラー倍 a・G', correct: true },
          { label: 'ハッシュ関数 HASH(a)' },
        ],
        explanation: '正解！古典DHの「累乗（g^a）」はECDHでは「スカラー倍（a・G）」に対応します。群の演算が「乗法」から「加法（点の加算）」に変わるのがポイントです。',
      },
    },
    {
      title: 'ECDH鍵交換デモ',
      content: <InteractiveDHDemo />,
    },
    {
      title: 'ECDSA — デジタル署名の正確な仕組み',
      content: <DigitalSignaturesECDSA />,
      quiz: {
        question: 'ECDSAの署名プロセスで正しいものはどれですか？',
        options: [
          { label: 'ハッシュ値を秘密鍵で暗号化して署名を生成する' },
          { label: 'メッセージを公開鍵で暗号化して署名を生成する' },
          { label: 'ランダムなkを選び、R = k・Gを計算し、s = k⁻¹(e + r・d) mod n で署名を生成する', correct: true },
          { label: '秘密鍵と公開鍵を連結してハッシュしたものが署名になる' },
        ],
        explanation: '正解！ECDSAでは「暗号化」は一切行いません。ランダムなkを選び、楕円曲線上の代数計算で署名(r, s)を生成します。kの再利用は秘密鍵漏洩につながるため、絶対に避ける必要があります。',
      },
    },
    {
      title: '公開鍵基盤（PKI）の全体像',
      content: <PublicKeyInfrastructure />,
      quiz: {
        question: '証明書が有効期限前に失効していないか確認する仕組みとして正しいものは？',
        options: [
          { label: '証明書のハッシュ値を再計算する' },
          { label: 'CRL（証明書失効リスト）またはOCSP（オンライン証明書状態プロトコル）で確認する', correct: true },
          { label: '証明書を再ダウンロードして比較する' },
          { label: '認証局に直接電話して確認する' },
        ],
        explanation: '正解！CRLはCAが定期的に公開する失効リスト、OCSPは個別の証明書をリアルタイムで問い合わせるプロトコルです。OCSP StaplingではサーバーがOCSP応答をキャッシュしてTLSに添付することで効率化しています。',
      },
    },
    {
      title: 'デジタル署名の応用',
      content: <SignatureApplications />,
    },
    {
      title: '公開鍵暗号の安全な使い方',
      content: <SecureUsageGuidelines />,
      quiz: {
        question: 'Perfect Forward Secrecy（PFS）が保証する性質は？',
        options: [
          { label: '暗号化速度が将来も十分であること' },
          { label: '長期鍵が漏洩しても過去のセッション鍵が安全に保たれること', correct: true },
          { label: '量子コンピュータに対して安全であること' },
          { label: '証明書の有効期限が自動的に延長されること' },
        ],
        explanation: '正解！PFS（前方秘匿性）により、たとえサーバーの長期秘密鍵が将来漏洩しても、過去に確立されたセッションの通信内容は安全に保たれます。TLS 1.3ではECDHEが必須となり、PFSが標準で確保されています。',
      },
    },
    {
      title: 'まとめ — 公開鍵暗号の全体像',
      content: <Summary />,
    },
  ]

  return (
    <main className="page public-key">
      <StepLesson
        lessonId="public-key"
        title="公開鍵暗号 & 鍵交換"
        steps={steps}
      />
    </main>
  )
}
