import { useEffect, useState } from 'react'
import { aesGcmDecrypt, aesGcmEncrypt } from '@/lib/crypto/webcrypto'
import { base64ToBytes, bytesToBase64, bytesToUtf8, utf8ToBytes } from '@/utils/encoding'

const info = {
  title: 'AES-GCM とは？',
  summary:
    '共通鍵暗号 AES (Advanced Encryption Standard) の認証付き暗号モード。暗号化と同時に改ざん検知タグを生成します。',
  details:
    'GCM (Galois/Counter Mode) は高速かつ並列性が高く、TLS や WebCrypto で標準的に利用されるモードです。安全性を保つには「IV を絶対に再利用しない」ことが重要です。本デモでは暗号化実行時に 96bit のランダム IV を自動生成し、Base64 で表示・コピーできるようにしています。',
  points: [
    'Passphrase から SHA-256 で 256bit のキーを作成（デモ用簡易 PBKDF）。',
    '暗号結果は Base64 の IV + Ciphertext として保存。',
    '復号時は同じ Passphrase と IV/Ciphertext を入力すると平文が復元できます。',
  ],
}

const defaultText = 'AES-GCM は IV の再利用が禁止。毎回ランダム生成しましょう。'

const deriveKey = async (passphrase: string) => {
  const material = utf8ToBytes(passphrase)
  const digest = await crypto.subtle.digest('SHA-256', material)
  return new Uint8Array(digest)
}

const validatePassphrase = (value: string) => {
  if (!value.trim()) {
    throw new Error('パスフレーズを入力してください。')
  }
}

export default function SymmetricPage() {
  const [plaintext, setPlaintext] = useState(defaultText)

  useEffect(() => {
    document.title = '共通鍵暗号 - CryptoLab'
  }, [])
  const [passphrase, setPassphrase] = useState('cryptolab-demo')
  const [ivBase64, setIvBase64] = useState('')
  const [cipherBase64, setCipherBase64] = useState('')
  const [decryptedText, setDecryptedText] = useState('')
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState<'info' | 'error'>('info')
  const [isProcessing, setIsProcessing] = useState(false)

  const setStatus = (message: string, type: 'info' | 'error' = 'info') => {
    setFeedback(message)
    setFeedbackType(type)
  }

  const handleEncrypt = async () => {
    try {
      validatePassphrase(passphrase)
      if (!plaintext.trim()) {
        throw new Error('暗号化するテキストを入力してください。')
      }
      setIsProcessing(true)
      const key = await deriveKey(passphrase)
      const data = utf8ToBytes(plaintext)
      const result = await aesGcmEncrypt(key, data)
      const iv64 = bytesToBase64(result.iv)
      const ct64 = bytesToBase64(result.ct)
      setIvBase64(iv64)
      setCipherBase64(ct64)
      setDecryptedText('')
      setStatus('暗号化に成功。IV と暗号文を保存してください。')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '暗号化に失敗しました。', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDecrypt = async () => {
    try {
      validatePassphrase(passphrase)
      if (!ivBase64.trim() || !cipherBase64.trim()) {
        throw new Error('IV と暗号文（Base64）を入力してください。')
      }
      setIsProcessing(true)
      const key = await deriveKey(passphrase)
      const iv = base64ToBytes(ivBase64)
      const ct = base64ToBytes(cipherBase64)
      const result = await aesGcmDecrypt(key, iv, ct)
      setDecryptedText(bytesToUtf8(result))
      setStatus('復号に成功しました。', 'info')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '復号に失敗しました。', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <main className="page symmetric">
      <header className="page-header">
        <p className="eyebrow">共通鍵暗号ラボ</p>
        <h1>AES-GCM で短文を暗号化・復号する。</h1>
        <p className="lede">パスフレーズから 256bit キーを派生し、暗号化と復号のワークフローを WebCrypto 上で安全に確認できます。</p>
      </header>

      <section className="card">
        <div className="card-header">
          <h2>入力とパラメータ</h2>
          <p>Passphrase と平文を準備し、暗号化条件を決めます。</p>
        </div>

        <label htmlFor="passphrase">パスフレーズ</label>
        <input
          id="passphrase"
          className="text-input"
          type="text"
          placeholder="cryptolab-demo"
          value={passphrase}
          onChange={(event) => setPassphrase(event.target.value)}
        />
        <p className="hint">※ デモのため SHA-256 でそのままキー化しています。</p>

        <label htmlFor="plaintext">平文テキスト</label>
        <textarea
          id="plaintext"
          rows={4}
          value={plaintext}
          onChange={(event) => setPlaintext(event.target.value)}
          placeholder="ここに暗号化したいテキストを入力"
        />

        <div className="info-panel">
          <h3>{info.title}</h3>
          <p>{info.summary}</p>
          <p className="details">{info.details}</p>
          <ul>
            {info.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h2>暗号化と復号</h2>
          <p>IV は毎回ランダム生成し、暗号文とセットで管理します。</p>
        </div>

        <div className="actions">
          <button className="primary" type="button" onClick={handleEncrypt} disabled={isProcessing}>
            暗号化
          </button>
          <button className="secondary" type="button" onClick={handleDecrypt} disabled={isProcessing}>
            復号
          </button>
        </div>

        {feedback && <p className={`feedback ${feedbackType}`}>{feedback}</p>}

        <label htmlFor="iv">IV（Base64）</label>
        <textarea
          id="iv"
          rows={2}
          value={ivBase64}
          onChange={(event) => setIvBase64(event.target.value)}
          placeholder="暗号化で生成された IV を貼り付け"
        />

        <label htmlFor="cipher">暗号文（Base64）</label>
        <textarea
          id="cipher"
          rows={4}
          value={cipherBase64}
          onChange={(event) => setCipherBase64(event.target.value)}
          placeholder="暗号化で生成された Base64 を貼り付け"
        />

        <label htmlFor="plaintext-result">復号結果</label>
        <textarea
          id="plaintext-result"
          rows={4}
          value={decryptedText}
          placeholder="復号結果がここに表示されます"
          readOnly
        />
      </section>

      <section className="card caution">
        <h2>注意</h2>
        <ul>
          <li>この画面は学習用です。実運用では PBKDF2/Argon2 など正式な KDF と鍵保護を併用してください。</li>
          <li>IV を再利用すると AES-GCM の安全性が失われます。毎回生成し、暗号文とセットで伝達してください。</li>
          <li>デモで入力したテキストはブラウザ内に留まり、外部サーバーへは送信されません。</li>
        </ul>
      </section>
    </main>
  )
}
