import { useEffect, useMemo, useState } from 'react'
import { ecdhDeriveSecret } from '@/lib/crypto/ecdh'
import { aesGcmDecrypt, aesGcmEncrypt, hkdf } from '@/lib/crypto/webcrypto'
import { base64ToBytes, bytesToBase64, bytesToUtf8, utf8ToBytes } from '@/utils/encoding'

type MatchState = 'unknown' | 'matched' | 'mismatch'

const description = {
  title: 'ECDH → HKDF → AES とは？',
  summary:
    '楕円曲線 Diffie-Hellman (ECDH) で共有秘密を作り、HKDF で AES-GCM 用の対称キーへ導き、短文を暗号化するデモです。',
  details:
    'P-256 曲線で Alice/Bob の鍵ペアを生成し、互いの公開鍵から同じ共有秘密 Z を求めます。その Z とソルト・info を HKDF に通すことで 256bit キーを得ます。これを使って AES-GCM でメッセージを暗号化します。秘密一致フラグや Base64 表示で状態が確認できます。',
  points: [
    'ソルト (salt) は共有秘密から独立したランダム値。毎回変えるのが理想。',
    'info は用途ラベル。文字列を自由に設定可能。',
    'HKDF で鍵導出すれば、どちらの側でも同じ AES-GCM 結果が得られる。',
  ],
}

const defaultMessage = 'ECDH → HKDF → AES-GCM をまとめて体験しましょう。'

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

export default function PublicKeyPage() {
  const [message, setMessage] = useState(defaultMessage)

  useEffect(() => {
    document.title = '公開鍵暗号 - CryptoLab'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])
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
        return '共有秘密が一致しています ✅'
      case 'mismatch':
        return '共有秘密が不一致 ⚠️'
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
    <main className="page public-key">
      <header className="page-header">
        <p className="eyebrow" style={{ color: 'var(--color-secondary)', textShadow: '0 0 10px var(--color-secondary)' }}>[ PROTOCOL: KEY_EXCHANGE ]</p>
        <h1 style={{ letterSpacing: '-0.05em' }}>公開鍵暗号 & 鍵交換</h1>
        <p className="lede">
          非対称鍵による信頼の構築。
          ECDH による秘密の共有から、デジタル署名による身元証明まで、現代の信頼基盤を解剖する。
        </p>
      </header>

      <section className="card">
        <div className="card-header">
          <h2>共有鍵の生成</h2>
          <p>ソルト (salt) と info を決め、EC 鍵共有→HKDF で鍵導出を実行します。</p>
        </div>

        <label htmlFor="salt">ソルト (Base64)</label>
        <div className="row-with-button">
          <input
            id="salt"
            className="text-input"
            type="text"
            value={saltBase64}
            onChange={(event) => setSaltBase64(event.target.value)}
          />
          <button
            type="button"
            className="ghost small"
            onClick={() => setSaltBase64(randomSalt())}
            disabled={isProcessing}
          >
            ソルトを再生成
          </button>
        </div>

        <label htmlFor="info">info（用途ラベル）</label>
        <input
          id="info"
          className="text-input"
          type="text"
          value={infoString}
          onChange={(event) => setInfoString(event.target.value)}
        />

        <div className="actions">
          <button className="primary" type="button" onClick={handleKeyExchange} disabled={isProcessing}>
            鍵共有を実行
          </button>
        </div>

        {feedback && <p className={`feedback ${feedbackType}`}>{feedback}</p>}

        <div className="info-panel">
          <h3>{description.title}</h3>
          <p>{description.summary}</p>
          <p className="details">{description.details}</p>
          <ul>
            {description.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <p className={`status-badge ${sharedMatch}`}>
          {matchLabel}
        </p>

        <label htmlFor="alice-pub">Alice 公開鍵（Base64 raw）</label>
        <textarea id="alice-pub" rows={3} value={alicePub} readOnly />

        <label htmlFor="bob-pub">Bob 公開鍵（Base64 raw）</label>
        <textarea id="bob-pub" rows={3} value={bobPub} readOnly />

        <label htmlFor="shared-a">Alice の共有秘密 (hash)</label>
        <textarea id="shared-a" rows={2} value={sharedA} readOnly />

        <label htmlFor="shared-b">Bob の共有秘密 (hash)</label>
        <textarea id="shared-b" rows={2} value={sharedB} readOnly />
      </section>

      <section className="card">
        <div className="card-header">
          <h2>メッセージ暗号化</h2>
          <p>派生済みのキーで短文を暗号化し、IV / Ciphertext を貼り付けて復号します。</p>
        </div>

        <label htmlFor="public-message">暗号化するメッセージ</label>
        <textarea
          id="public-message"
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="ここに短いメッセージを入力"
        />

        <div className="actions">
          <button className="primary" type="button" onClick={handleEncrypt} disabled={isProcessing || !derivedKey}>
            暗号化
          </button>
          <button className="secondary" type="button" onClick={handleDecrypt} disabled={isProcessing || !derivedKey}>
            復号
          </button>
        </div>

        <label htmlFor="public-iv">IV（Base64）</label>
        <textarea
          id="public-iv"
          rows={2}
          value={ivBase64}
          onChange={(event) => setIvBase64(event.target.value)}
          placeholder="暗号化で得た IV を貼り付け"
        />

        <label htmlFor="public-cipher">暗号文（Base64）</label>
        <textarea
          id="public-cipher"
          rows={4}
          value={cipherBase64}
          onChange={(event) => setCipherBase64(event.target.value)}
          placeholder="暗号化で得た Base64 を貼り付け"
        />

        <label htmlFor="public-plaintext">復号結果</label>
        <textarea
          id="public-plaintext"
          rows={4}
          value={decryptedText}
          placeholder="復号結果がここに表示されます"
          readOnly
        />
      </section>

      <section className="card caution">
        <h2>注意</h2>
        <ul>
          <li>ECDH から得た共有秘密は必ず HKDF などで鍵導出し、直接 AES に使わないのが原則です。</li>
          <li>公開鍵は証明書や署名で真正性を確認する必要があります。本デモでは省略しています。</li>
          <li>ここでの暗号化は短文向け。大きなファイルやストリームを扱う場合は追加の鍵管理やチャンク処理が必要です。</li>
        </ul>
      </section>
    </main>
  )
}
