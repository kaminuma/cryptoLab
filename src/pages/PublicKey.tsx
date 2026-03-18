import { useEffect, useMemo, useState } from 'react'
import StepLesson, { type LessonStep } from '../components/ui/StepLesson'
import '../components/ui/StepLesson.css'
import { ecdhDeriveSecret } from '@/lib/crypto/ecdh'
import { aesGcmDecrypt, aesGcmEncrypt, hkdf } from '@/lib/crypto/webcrypto'
import { base64ToBytes, bytesToBase64, bytesToUtf8, utf8ToBytes } from '@/utils/encoding'

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

function WhatIsPublicKey() {
  return (
    <>
      <p>
        公開鍵暗号（非対称暗号）は、<strong>2つの異なる鍵</strong>を使う暗号方式です。
        一方の鍵で暗号化したものは、もう一方の鍵でしか復号できません。
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
      <div className="step-lesson__callout">
        公開鍵暗号により、事前に秘密を共有しなくても安全な通信が可能になりました。
        これは1970年代の画期的な発明であり、現代のインターネットセキュリティの基盤です。
      </div>
    </>
  )
}

function DiffieHellmanConcept() {
  return (
    <>
      <p>
        Diffie-Hellman鍵交換は、<strong>盗聴されている通信路でも安全に共通の秘密を作れる</strong>プロトコルです。
      </p>
      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div>Alice: 秘密鍵a → 公開値A = g^a mod p</div>
          <div>Bob: 　秘密鍵b → 公開値B = g^b mod p</div>
          <div>　</div>
          <div>Alice → B を受信 → B^a = g^(ab) mod p</div>
          <div>Bob 　→ A を受信 → A^b = g^(ab) mod p</div>
          <div>　</div>
          <div>共有秘密: g^(ab) mod p （両者が同じ値を得る）</div>
        </div>
      </div>
      <p>
        現代ではこの考え方を<strong>楕円曲線</strong>（ECDH）に適用します。
        楕円曲線を使うことで、より短い鍵長で同等のセキュリティを実現できます。
      </p>
      <div className="step-lesson__callout">
        <strong>ポイント:</strong> 盗聴者はA（= g^a）とB（= g^b）を見ることができますが、
        aやbを知らなければ共有秘密 g^(ab) を計算できません。
        これは「離散対数問題」の困難さに基づいています。
      </div>
    </>
  )
}

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

function DigitalSignatures() {
  return (
    <>
      <p>
        公開鍵暗号のもう一つの重要な応用が<strong>デジタル署名</strong>です。
        暗号化とは逆方向に鍵を使います。
      </p>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>署名（秘密鍵で作成）</h3>
          <ul>
            <li><strong>入力:</strong> メッセージ + 秘密鍵</li>
            <li><strong>出力:</strong> デジタル署名</li>
            <li><strong>意味:</strong> 「私が書いた」という証明</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>検証（公開鍵で確認）</h3>
          <ul>
            <li><strong>入力:</strong> メッセージ + 署名 + 公開鍵</li>
            <li><strong>出力:</strong> 有効/無効</li>
            <li><strong>意味:</strong> 改ざんされていないことを確認</li>
          </ul>
        </div>
      </div>
      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div>1. メッセージのハッシュ値を計算</div>
          <div>2. ハッシュ値を秘密鍵で暗号化 → 署名</div>
          <div>3. メッセージ + 署名を送信</div>
          <div>4. 受信者は公開鍵で署名を復号</div>
          <div>5. 復号結果とハッシュ値を比較 → 検証</div>
        </div>
      </div>
      <div className="step-lesson__callout">
        デジタル署名は<strong>認証</strong>（誰が送ったか）、<strong>完全性</strong>（改ざんされていないか）、
        <strong>否認防止</strong>（後から否定できない）の3つの性質を提供します。
      </div>
    </>
  )
}

function PublicKeyInfrastructure() {
  return (
    <>
      <p>
        公開鍵暗号を実用的に使うには、<strong>「この公開鍵は本当にその人のものか？」</strong>を確認する仕組みが必要です。
        これを実現するのが<strong>PKI（Public Key Infrastructure）</strong>です。
      </p>
      <ul>
        <li>
          <strong>認証局（CA）</strong> — 公開鍵の所有者を確認し、デジタル証明書を発行する信頼された機関。
          ブラウザにはルートCAの証明書がプリインストールされています。
        </li>
        <li>
          <strong>デジタル証明書</strong> — 公開鍵と所有者情報をCAの署名で束ねたもの。
          X.509形式が標準。HTTPS接続時にサーバーが提示します。
        </li>
        <li>
          <strong>証明書チェーン</strong> — ルートCA → 中間CA → エンドエンティティ証明書という
          信頼の連鎖で、証明書の正当性を検証します。
        </li>
        <li>
          <strong>Let&apos;s Encrypt</strong> — 無料でTLS証明書を発行する認証局。
          ACMEプロトコルで証明書の取得・更新を自動化しています。
        </li>
      </ul>
      <div className="step-lesson__callout">
        ブラウザのアドレスバーに表示される鍵マークは、サーバーの証明書が信頼されたCAによって
        署名されていることを示しています。PKIはインターネット全体の信頼基盤です。
      </div>
    </>
  )
}

export default function PublicKeyPage() {
  useEffect(() => {
    document.title = '公開鍵暗号 - CryptoLab'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const steps: LessonStep[] = [
    {
      title: '公開鍵暗号とは？',
      content: <WhatIsPublicKey />,
      quiz: {
        question: '公開鍵暗号の特徴は？',
        options: [
          { label: '暗号化と復号に同じ鍵を使う' },
          { label: '鍵を使わずに暗号化できる' },
          { label: '2つの異なる鍵（公開鍵と秘密鍵）を使う', correct: true },
          { label: '暗号化はできるが復号はできない' },
        ],
        explanation: '正解！公開鍵暗号では、公開鍵と秘密鍵という2つの異なる鍵を使います。公開鍵で暗号化したものは秘密鍵でしか復号できず、その逆も同様です。',
      },
    },
    {
      title: 'Diffie-Hellman 鍵交換',
      content: <DiffieHellmanConcept />,
      quiz: {
        question: 'Diffie-Hellman鍵交換が安全な理由は？',
        options: [
          { label: '通信が暗号化されているから' },
          { label: '公開値から秘密鍵を計算する（離散対数問題）のが困難だから', correct: true },
          { label: '鍵を物理的に手渡しするから' },
          { label: '第三者が通信を傍受できないから' },
        ],
        explanation: '正解！Diffie-Hellmanの安全性は離散対数問題の困難さに基づいています。公開値g^aからaを求めることは、十分に大きなパラメータでは計算上不可能です。',
      },
    },
    {
      title: 'ECDH鍵交換デモ',
      content: <InteractiveDHDemo />,
    },
    {
      title: 'デジタル署名',
      content: <DigitalSignatures />,
      quiz: {
        question: 'デジタル署名が提供する3つの性質に含まれないものは？',
        options: [
          { label: '認証（誰が送ったか）' },
          { label: '機密性（内容を秘密にする）', correct: true },
          { label: '完全性（改ざんされていないか）' },
          { label: '否認防止（後から否定できない）' },
        ],
        explanation: '正解！デジタル署名は認証・完全性・否認防止を提供しますが、機密性（暗号化）は提供しません。メッセージの内容を秘密にするには、別途暗号化が必要です。',
      },
    },
    {
      title: '公開鍵基盤（PKI）',
      content: <PublicKeyInfrastructure />,
    },
  ]

  return (
    <main className="page public-key">
      <StepLesson
        title="公開鍵暗号 & 鍵交換"
        steps={steps}
      />
    </main>
  )
}
