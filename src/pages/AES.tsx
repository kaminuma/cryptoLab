import { useState, useEffect } from 'react'
import StepLesson, { type LessonStep } from '../components/ui/StepLesson'
import '../components/ui/StepLesson.css'
import {
  encrypt,
  decrypt,
  generateRandomKey,
  bytesToHex,
  type AESMode
} from '@/lib/aes'

/* =========================================
   Step 1: 対称暗号とAES概要
   ========================================= */
function SymmetricOverview() {
  return (
    <>
      <p>
        AES（Advanced Encryption Standard）は、<strong>同じ鍵</strong>で暗号化と復号を行う
        <strong>対称鍵暗号</strong>の世界標準です。
        2001年にNISTがDESの後継として標準化しました。
      </p>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>AES（共通鍵暗号）</h3>
          <ul>
            <li><strong>方式:</strong> 暗号化/復号で同じ鍵</li>
            <li><strong>速度:</strong> 高速（AES-NI対応ならGbps級）</li>
            <li><strong>課題:</strong> 鍵配送を別の仕組みで解決する必要あり</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>RSA / ECDH（公開鍵暗号）</h3>
          <ul>
            <li><strong>方式:</strong> 公開鍵で暗号化、秘密鍵で復号</li>
            <li><strong>速度:</strong> 計算が重い</li>
            <li><strong>利点:</strong> 鍵配送問題を解決できる</li>
          </ul>
        </div>
      </div>
      <div className="step-lesson__callout">
        <strong>ブロックサイズ:</strong> 常に128ビット。
        <strong>鍵長:</strong> 128 / 192 / 256ビット（それぞれ10 / 12 / 14ラウンド）。
        鍵長で安全性と処理コストを調整します。設計者はJoan DaemenとVincent Rijmen。
      </div>
    </>
  )
}

/* =========================================
   Step 2: AES内部構造
   ========================================= */
function InternalStructure() {
  return (
    <>
      <p>
        AESは<strong>SPN構造</strong>（置換・転置ネットワーク）を採用しています。
        各ラウンドで4つの操作を繰り返し、非線形性と拡散性を確保します。
      </p>
      <div className="step-lesson__visual">
        <div className="step-lesson__visual-flow">
          <div><code>平文ブロック (128bit)</code></div>
          <div>↓ <strong>SubBytes</strong> — S-Boxで各バイトを非線形変換（GF(2&#8312;)上の逆数+アフィン変換）</div>
          <div>↓ <strong>ShiftRows</strong> — 各行を左シフトして拡散</div>
          <div>↓ <strong>MixColumns</strong> — 列をGF(2&#8312;)で混合、隣接バイトへ影響を伝播</div>
          <div>↓ <strong>AddRoundKey</strong> — ラウンド鍵とXOR</div>
          <div>↓ <em>（上記を10〜14ラウンド繰り返す）</em></div>
          <div><code>暗号文ブロック (128bit)</code></div>
        </div>
      </div>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>鍵スケジュール</h3>
          <ul>
            <li>マスター鍵からラウンド鍵を生成</li>
            <li>Rcon（Round Constant）で各ラウンドを分岐</li>
            <li>鍵派生が硬く、使い回しで弱点が出にくい</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>安全性</h3>
          <ul>
            <li>AES-128でも2&#185;&#178;&#8312;通り。総当たりは不可能</li>
            <li>差分/線形解読は十分なラウンド数で防御済み</li>
            <li>量子時代を見据えるならAES-256が無難</li>
          </ul>
        </div>
      </div>
      <div className="step-lesson__callout">
        AES-NIのようなCPU命令セットを使うと、S-Boxをテーブル参照ではなく命令レベルで処理でき、
        キャッシュ観測によるサイドチャネル攻撃を抑えつつ高速化できます。
      </div>
    </>
  )
}

/* =========================================
   Step 3: AESモード
   ========================================= */
function BlockModes() {
  return (
    <>
      <p>
        AESは128ビット単位でデータを処理するブロック暗号です。
        長いメッセージを安全に暗号化するには<strong>モード</strong>の選択が決定的に重要です。
      </p>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>ECB（Electronic Codebook）</h3>
          <ul>
            <li>ブロックごとに独立して暗号化</li>
            <li>同じ平文ブロック → 同じ暗号文</li>
            <li>パターンが露出するため<strong>使用禁止</strong></li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>CBC（Cipher Block Chaining）</h3>
          <ul>
            <li>前の暗号文とXORしてから暗号化</li>
            <li>IVをランダム生成するのが必須</li>
            <li>パディング・オラクル攻撃に注意</li>
          </ul>
        </div>
      </div>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>CTR（Counter）</h3>
          <ul>
            <li>カウンタを暗号化してストリーム化</li>
            <li>高速だがNonce再利用は厳禁</li>
            <li>認証がないため単体では改ざん検知不可</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>GCM（Galois/Counter Mode）</h3>
          <ul>
            <li>CTR + GMAC で認証付き暗号（AEAD）</li>
            <li>GHASHでタグを生成し改ざんを検知</li>
            <li>TLS 1.3 の標準構成</li>
          </ul>
        </div>
      </div>
      <div className="step-lesson__callout">
        実務ではECBは絶対に使わず、AES-GCM や ChaCha20-Poly1305 などの AEAD モードを選びましょう。
        認証なしの CBC/CTR は改ざん攻撃に脆弱です。
      </div>
    </>
  )
}

/* =========================================
   Step 4: 暗号化/復号デモ
   ========================================= */
function EncryptDecryptDemo() {
  const [plaintext, setPlaintext] = useState('Hello, AES!')
  const [key, setKey] = useState<Uint8Array>(generateRandomKey(128))
  const [keySize, setKeySize] = useState<128 | 192 | 256>(128)
  const [mode, setMode] = useState<AESMode>('CBC')
  const [ciphertext, setCiphertext] = useState<Uint8Array | null>(null)
  const [iv, setIv] = useState<Uint8Array | null>(null)
  const [decrypted, setDecrypted] = useState('')

  const handleGenerateKey = () => {
    const newKey = generateRandomKey(keySize)
    setKey(newKey)
    setCiphertext(null)
    setIv(null)
    setDecrypted('')
  }

  const handleEncrypt = () => {
    try {
      const result = encrypt(plaintext, key, mode)
      setCiphertext(result.ciphertext)
      setIv(result.iv || null)
      setDecrypted('')
    } catch (error) {
      alert(`暗号化エラー: ${error}`)
    }
  }

  const handleDecrypt = () => {
    if (!ciphertext) {
      alert('まず暗号化を実行してください')
      return
    }
    try {
      const result = decrypt(ciphertext, key, mode, iv || undefined)
      setDecrypted(result)
    } catch (error) {
      alert(`復号エラー: ${error}`)
    }
  }

  return (
    <>
      <p>鍵長とモードを選んで暗号化/復号を実行し、IVやNonceがどう扱われるか確認しましょう。</p>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>

        <label>鍵長:</label>
        <div className="step-lesson__demo-radio-group">
          {([128, 192, 256] as const).map((size) => (
            <label key={size}>
              <input
                type="radio"
                name="keySize"
                value={size}
                checked={keySize === size}
                onChange={(e) => setKeySize(Number(e.target.value) as 128 | 192 | 256)}
              />
              {' '}AES-{size}
            </label>
          ))}
        </div>

        <button
          type="button"
          className="step-lesson__demo-btn step-lesson__demo-btn--secondary"
          onClick={handleGenerateKey}
        >
          ランダム鍵を再生成
        </button>

        <label>現在の鍵（16進表記）:</label>
        <div className="step-lesson__demo-result">{bytesToHex(key)}</div>

        <label>ブロックモード:</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as AESMode)}
        >
          <option value="CBC">CBC</option>
          <option value="CTR">CTR</option>
          <option value="ECB">ECB</option>
        </select>

        {mode === 'ECB' && (
          <div className="step-lesson__callout">
            ECBはパターンがそのまま漏れるので学習用途以外では使用禁止です。
          </div>
        )}

        <label>平文:</label>
        <textarea
          rows={3}
          value={plaintext}
          onChange={(e) => setPlaintext(e.target.value)}
          placeholder="Hello, AES!"
        />

        <div className="step-lesson__demo-actions">
          <button
            type="button"
            className="step-lesson__demo-btn step-lesson__demo-btn--primary"
            onClick={handleEncrypt}
          >
            暗号化
          </button>
          <button
            type="button"
            className="step-lesson__demo-btn step-lesson__demo-btn--secondary"
            onClick={handleDecrypt}
            disabled={!ciphertext}
          >
            復号
          </button>
        </div>

        {ciphertext && (
          <>
            <label>暗号文（16進数）:</label>
            <div className="step-lesson__demo-result">{bytesToHex(ciphertext)}</div>
            {iv && (
              <>
                <label>{mode === 'CTR' ? 'Nonce' : 'IV'}:</label>
                <div className="step-lesson__demo-result">{bytesToHex(iv)}</div>
              </>
            )}
          </>
        )}

        {decrypted && (
          <>
            <label>復号結果:</label>
            <div className="step-lesson__demo-result">{decrypted}</div>
            {decrypted === plaintext && (
              <div className="step-lesson__callout">入力と一致しました。正しく復号されています。</div>
            )}
          </>
        )}
      </div>
    </>
  )
}

/* =========================================
   Step 5: モード比較（ECBの危険性を可視化）
   ========================================= */
function ModeComparisonDemo() {
  const [compareText, setCompareText] = useState('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
  const [ecbResult, setEcbResult] = useState('')
  const [cbcResult, setCbcResult] = useState('')
  const [ctrResult, setCtrResult] = useState('')

  const handleCompare = () => {
    try {
      const compareKey = generateRandomKey(128)
      const ecbEncrypted = encrypt(compareText, compareKey, 'ECB')
      setEcbResult(bytesToHex(ecbEncrypted.ciphertext))
      const cbcEncrypted = encrypt(compareText, compareKey, 'CBC')
      setCbcResult(bytesToHex(cbcEncrypted.ciphertext))
      const ctrEncrypted = encrypt(compareText, compareKey, 'CTR')
      setCtrResult(bytesToHex(ctrEncrypted.ciphertext))
    } catch (error) {
      alert(`エラー: ${error}`)
    }
  }

  /* Split hex string into 32-char (16-byte = 1 block) chunks for visual comparison */
  const splitBlocks = (hex: string) => {
    const chunks: string[] = []
    for (let i = 0; i < hex.length; i += 32) {
      chunks.push(hex.slice(i, i + 32))
    }
    return chunks
  }

  return (
    <>
      <p>
        同じ繰り返しパターンの平文を各モードで暗号化すると、ECBの弱点が一目瞭然です。
        ECBでは<strong>同じ平文ブロックが同じ暗号文ブロック</strong>になりますが、CBC/CTRではすべてのブロックが異なります。
      </p>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>

        <label>繰り返しパターンの平文:</label>
        <input
          type="text"
          value={compareText}
          onChange={(e) => setCompareText(e.target.value)}
          placeholder="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
        />

        <button
          type="button"
          className="step-lesson__demo-btn step-lesson__demo-btn--primary"
          onClick={handleCompare}
        >
          各モードで暗号化
        </button>

        {ecbResult && (
          <div className="step-lesson__comparison">
            <div className="step-lesson__comparison-item">
              <h3>ECB</h3>
              <p><strong>同じブロックが同じ暗号文になる:</strong></p>
              {splitBlocks(ecbResult).map((block, i) => (
                <div key={i} className="step-lesson__demo-result">{block}</div>
              ))}
            </div>
            <div className="step-lesson__comparison-item">
              <h3>CBC</h3>
              <p><strong>チェインにより各ブロックが変化:</strong></p>
              {splitBlocks(cbcResult).map((block, i) => (
                <div key={i} className="step-lesson__demo-result">{block}</div>
              ))}
            </div>
          </div>
        )}

        {ctrResult && (
          <div className="step-lesson__comparison">
            <div className="step-lesson__comparison-item">
              <h3>CTR</h3>
              <p><strong>疑似ストリーム暗号。Nonce再利用厳禁:</strong></p>
              {splitBlocks(ctrResult).map((block, i) => (
                <div key={i} className="step-lesson__demo-result">{block}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="step-lesson__callout">
        <strong>注目:</strong> ECBの結果を見ると、同じ内容の平文ブロックがまったく同じ暗号文になっていることが分かります。
        これは画像を暗号化した場合に輪郭が見えてしまう「ECBペンギン問題」として有名です。
      </div>
    </>
  )
}

/* =========================================
   Step 6: AESの実世界での利用
   ========================================= */
function RealWorldAES() {
  return (
    <>
      <p>AESは現代のインターネットとデータ保護の基盤として、あらゆる場所で使われています。</p>
      <ul>
        <li>
          <strong>TLS / HTTPS</strong> — Webブラウザとサーバーの通信を保護。
          ECDHで共通鍵を共有 → HKDFでAES-GCM用の鍵を導出 → AESで高速に暗号化、というハイブリッド構成。
        </li>
        <li>
          <strong>ディスク暗号化</strong> — FileVault（macOS）、BitLocker（Windows）、LUKS（Linux）が
          AES-XTSモードでストレージ全体を保護。
        </li>
        <li>
          <strong>VPN / SSH</strong> — トンネリングされた通信の中身をAES-GCMで暗号化。
        </li>
        <li>
          <strong>モバイルアプリ</strong> — iOSのデータ保護API、AndroidのKeyStoreがAES-256を利用。
        </li>
      </ul>

      <div className="step-lesson__visual">
        <div className="step-lesson__visual-flow">
          <div><strong>TLS 1.3 ハンドシェイク</strong></div>
          <div>1. サーバー証明書（公開鍵）+ ECDHで「共通鍵」を共有</div>
          <div>2. HKDFでAES-GCM用の鍵を導出</div>
          <div>3. AES-GCMでWebページやAPIレスポンスを高速に暗号化</div>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>量子時代への備え:</strong> Groverのアルゴリズムにより、AES-128は64ビット安全性に低下する見積もりです。
        長期的な用途ではAES-256 + AEAD（GCM や ChaCha20-Poly1305）を基準にしましょう。
      </div>
    </>
  )
}

/* =========================================
   メインコンポーネント
   ========================================= */
export default function AESPage() {
  useEffect(() => {
    document.title = 'AES - CryptoLab'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const steps: LessonStep[] = [
    {
      title: '対称鍵暗号とAES',
      content: <SymmetricOverview />,
      quiz: {
        question: 'AES（共通鍵暗号）の最大の特徴は？',
        options: [
          { label: '公開鍵と秘密鍵のペアを使う' },
          { label: '暗号化と復号で同じ鍵を使う', correct: true },
          { label: 'ハッシュ関数の一種である' },
          { label: '復号ができない一方向暗号である' },
        ],
        explanation: '正解！AESは共通鍵（対称鍵）暗号であり、暗号化と復号に同じ鍵を使います。公開鍵暗号と組み合わせたハイブリッド構成で鍵配送問題を解決するのが実務の定石です。',
      },
    },
    {
      title: 'AESの内部構造',
      content: <InternalStructure />,
      quiz: {
        question: 'AESの1ラウンドに含まれない操作はどれ？',
        options: [
          { label: 'SubBytes（S-Boxによる非線形変換）' },
          { label: 'ShiftRows（行の左シフト）' },
          { label: 'FeistelNetwork（半分に分割して交差）', correct: true },
          { label: 'AddRoundKey（ラウンド鍵とXOR）' },
        ],
        explanation: '正解！AESはSPN構造であり、Feistelネットワークは使いません。Feistel構造はDESなど別のブロック暗号で採用されている方式です。AESは SubBytes / ShiftRows / MixColumns / AddRoundKey の4操作を繰り返します。',
      },
    },
    {
      title: 'ブロックモード: ECB, CBC, CTR, GCM',
      content: <BlockModes />,
      quiz: {
        question: 'ECBモードが危険な理由は？',
        options: [
          { label: '暗号化速度が遅すぎるから' },
          { label: '鍵長が短くなるから' },
          { label: '同じ平文ブロックが同じ暗号文になり、パターンが漏れるから', correct: true },
          { label: 'IVが必要だが生成が難しいから' },
        ],
        explanation: '正解！ECBは各ブロックを独立に暗号化するため、同じ内容の平文ブロックはすべて同じ暗号文になります。これによりデータのパターン（画像の輪郭など）がそのまま露出してしまいます。',
      },
    },
    {
      title: 'ハンズオン: AES暗号化/復号',
      content: <EncryptDecryptDemo />,
    },
    {
      title: 'モード比較: ECBの弱点を見る',
      content: <ModeComparisonDemo />,
    },
    {
      title: 'AESの実世界での活用',
      content: <RealWorldAES />,
      quiz: {
        question: 'TLS 1.3でAESはどのように使われている？',
        options: [
          { label: 'AESだけで鍵交換と暗号化の両方を行う' },
          { label: 'ECDHで共通鍵を共有し、AES-GCMでデータを暗号化するハイブリッド構成', correct: true },
          { label: 'AES-ECBモードでWebページを暗号化する' },
          { label: 'AESの鍵をそのままパスワードとして送信する' },
        ],
        explanation: '正解！TLS 1.3ではECDH（公開鍵暗号）でセッション鍵を安全に共有し、その鍵からHKDFでAES-GCM用の鍵を導出してデータを暗号化するハイブリッド構成を採用しています。',
      },
    },
  ]

  return (
    <main className="page aes">
      <StepLesson
        title="AES 対称鍵暗号"
        steps={steps}
      />
    </main>
  )
}
