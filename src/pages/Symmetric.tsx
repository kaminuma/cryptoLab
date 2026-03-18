import { useEffect, useState } from 'react'
import StepLesson, { type LessonStep } from '../components/ui/StepLesson'
import '../components/ui/StepLesson.css'
import { aesGcmDecrypt, aesGcmEncrypt } from '@/lib/crypto/webcrypto'
import { base64ToBytes, bytesToBase64, bytesToUtf8, utf8ToBytes } from '@/utils/encoding'

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

function WhatIsSymmetric() {
  return (
    <>
      <p>
        共通鍵暗号（対称暗号）は、<strong>暗号化と復号に同じ鍵を使う</strong>最も基本的な暗号方式です。
      </p>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>暗号化</h3>
          <ul>
            <li><strong>入力:</strong> 平文 + 共通鍵</li>
            <li><strong>出力:</strong> 暗号文</li>
            <li><strong>目的:</strong> データを読めなくする</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>復号</h3>
          <ul>
            <li><strong>入力:</strong> 暗号文 + 同じ共通鍵</li>
            <li><strong>出力:</strong> 元の平文</li>
            <li><strong>目的:</strong> データを元に戻す</li>
          </ul>
        </div>
      </div>
      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div>Alice: 平文 + 鍵K → 暗号文</div>
          <div>　　　　　↓ （暗号文を送信）</div>
          <div>Bob: 　暗号文 + 鍵K → 平文</div>
        </div>
      </div>
      <div className="step-lesson__callout">
        AES（Advanced Encryption Standard）は現在最も広く使われている共通鍵暗号です。
        2001年にNISTが標準化し、鍵長は128/192/256ビットから選べます。
      </div>
    </>
  )
}

function KeyExchangeProblem() {
  return (
    <>
      <p>
        共通鍵暗号には根本的な課題があります。それは<strong>「鍵をどうやって安全に共有するか」</strong>という問題です。
      </p>
      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div>Alice ────── 鍵K ──────→ Bob</div>
          <div>　　　　　　↑</div>
          <div>　　　　盗聴者Eve</div>
          <div>　　　（鍵Kを傍受！）</div>
        </div>
      </div>
      <p>
        暗号文を送る前に、まず鍵を安全に届ける必要があります。しかし安全な通信路がないからこそ暗号が必要なのです。
        これを<strong>鍵配送問題</strong>（Key Distribution Problem）といいます。
      </p>
      <div className="step-lesson__callout">
        <strong>解決策:</strong> この問題は公開鍵暗号（Diffie-Hellman鍵交換やRSA）の発明により解決されました。
        現代のTLSでは、公開鍵暗号で共通鍵を安全に共有し、実際のデータ暗号化には高速な共通鍵暗号（AES）を使います。
      </div>
    </>
  )
}

function InteractiveDemo() {
  const defaultText = 'AES-GCM は IV の再利用が禁止。毎回ランダム生成しましょう。'
  const [plaintext, setPlaintext] = useState(defaultText)
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
    <>
      <p>
        WebCrypto APIを使ってAES-GCMの暗号化・復号を体験しましょう。
        パスフレーズを変えたり、暗号文を一部変更して復号してみてください。
      </p>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>

        <label htmlFor="sym-passphrase">パスフレーズ</label>
        <input
          id="sym-passphrase"
          type="text"
          placeholder="cryptolab-demo"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
        />

        <label htmlFor="sym-plaintext">平文テキスト</label>
        <textarea
          id="sym-plaintext"
          rows={3}
          value={plaintext}
          onChange={(e) => setPlaintext(e.target.value)}
          placeholder="ここに暗号化したいテキストを入力"
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

        {feedback && (
          <div className={`step-lesson__quiz-feedback ${
            feedbackType === 'error' ? 'step-lesson__quiz-feedback--wrong' : 'step-lesson__quiz-feedback--correct'
          }`}>
            {feedback}
          </div>
        )}

        <label>IV（Base64）</label>
        <textarea
          rows={2}
          value={ivBase64}
          onChange={(e) => setIvBase64(e.target.value)}
          placeholder="暗号化で生成された IV を貼り付け"
        />

        <label>暗号文（Base64）</label>
        <textarea
          rows={3}
          value={cipherBase64}
          onChange={(e) => setCipherBase64(e.target.value)}
          placeholder="暗号化で生成された Base64 を貼り付け"
        />

        <label>復号結果</label>
        <div className="step-lesson__demo-result">
          {decryptedText || '（復号結果がここに表示されます）'}
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>注意:</strong> このデモではSHA-256でパスフレーズから直接鍵を導出しています。
        実運用ではPBKDF2やArgon2などの正式なKDFを使ってください。
      </div>
    </>
  )
}

function SymmetricInPractice() {
  return (
    <>
      <p>共通鍵暗号は現代のセキュリティ基盤のあらゆる場所で使われています。</p>
      <ul>
        <li>
          <strong>HTTPS/TLS通信</strong> — Webブラウザとサーバー間の通信は、
          鍵交換後にAES-GCMで暗号化されます。
        </li>
        <li>
          <strong>ディスク暗号化</strong> — FileVault（macOS）やBitLocker（Windows）は
          AESでストレージ全体を暗号化します。
        </li>
        <li>
          <strong>メッセージアプリ</strong> — Signal、WhatsAppなどのエンドツーエンド暗号化は、
          鍵交換後にAESで各メッセージを暗号化します。
        </li>
        <li>
          <strong>VPN</strong> — WireGuardやIPsecはAESやChaCha20で
          トンネル内のデータを暗号化します。
        </li>
      </ul>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>AES-GCM の利点</h3>
          <ul>
            <li>暗号化と認証を同時に行う</li>
            <li>ハードウェア支援（AES-NI）で高速</li>
            <li>並列処理が可能</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>AES-GCM の注意点</h3>
          <ul>
            <li>IVを絶対に再利用しない</li>
            <li>鍵の安全な管理が必須</li>
            <li>大量データにはチャンク処理が必要</li>
          </ul>
        </div>
      </div>
      <div className="step-lesson__callout">
        <strong>重要:</strong> AES-GCMではIV（初期化ベクトル）を再利用すると、
        暗号文から鍵が復元される致命的な脆弱性が生じます。毎回ランダムに生成し、暗号文とセットで管理しましょう。
      </div>
    </>
  )
}

export default function SymmetricPage() {
  useEffect(() => {
    document.title = '共通鍵暗号 - CryptoLab'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const steps: LessonStep[] = [
    {
      title: '共通鍵暗号とは？',
      content: <WhatIsSymmetric />,
      quiz: {
        question: '共通鍵暗号の最大の特徴は？',
        options: [
          { label: '暗号化と復号に異なる鍵を使う' },
          { label: '暗号化と復号に同じ鍵を使う', correct: true },
          { label: '鍵なしで暗号化できる' },
          { label: '暗号化はできるが復号はできない' },
        ],
        explanation: '正解！共通鍵暗号（対称暗号）は、送信者と受信者が同じ鍵を共有し、その鍵で暗号化と復号の両方を行います。',
      },
    },
    {
      title: '鍵配送問題',
      content: <KeyExchangeProblem />,
      quiz: {
        question: '鍵配送問題とは何か？',
        options: [
          { label: '鍵のサイズが大きすぎて送れない問題' },
          { label: '鍵の生成に時間がかかりすぎる問題' },
          { label: '安全な通信路なしに共通鍵を安全に共有できない問題', correct: true },
          { label: '鍵が一定期間で失効してしまう問題' },
        ],
        explanation: '正解！暗号通信のために鍵が必要だが、鍵を安全に送るための安全な通信路がない — これが鍵配送問題です。公開鍵暗号の発明により解決されました。',
      },
    },
    {
      title: 'AES-GCM を試してみよう',
      content: <InteractiveDemo />,
    },
    {
      title: '共通鍵暗号の実用例',
      content: <SymmetricInPractice />,
      quiz: {
        question: 'AES-GCMでIVを再利用すると何が起きる？',
        options: [
          { label: '暗号化速度が低下する' },
          { label: '暗号文のサイズが大きくなる' },
          { label: '暗号文から鍵が復元される脆弱性が生じる', correct: true },
          { label: '特に問題はない' },
        ],
        explanation: '正解！AES-GCMではIVの再利用は致命的です。同じ鍵とIVの組み合わせを使うと、暗号文のXORから平文の情報が漏洩し、認証タグの偽造も可能になります。',
      },
    },
  ]

  return (
    <main className="page symmetric">
      <StepLesson
        title="共通鍵暗号: AES-GCM"
        steps={steps}
      />
    </main>
  )
}
