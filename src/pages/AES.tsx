import { useState, useEffect } from 'react'
import {
  encrypt,
  decrypt,
  generateRandomKey,
  generateRandomIV,
  bytesToHex,
  hexToBytes,
  stringToBytes,
  type AESMode
} from '@/lib/aes'

export default function AESPage() {
  const [plaintext, setPlaintext] = useState('Hello, AES!')
  const [key, setKey] = useState<Uint8Array>(generateRandomKey(128))
  const [keySize, setKeySize] = useState<128 | 192 | 256>(128)
  const [mode, setMode] = useState<AESMode>('CBC')
  const [ciphertext, setCiphertext] = useState<Uint8Array | null>(null)
  const [iv, setIv] = useState<Uint8Array | null>(null)
  const [decrypted, setDecrypted] = useState<string>('')

  // モード比較用の状態
  const [compareText, setCompareText] = useState('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
  const [ecbResult, setEcbResult] = useState<string>('')
  const [cbcResult, setCbcResult] = useState<string>('')
  const [ctrResult, setCtrResult] = useState<string>('')

  useEffect(() => {
    document.title = 'AES - CryptoLab'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

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

  const handleCompare = () => {
    try {
      const compareKey = generateRandomKey(128)

      // ECB
      const ecbEncrypted = encrypt(compareText, compareKey, 'ECB')
      setEcbResult(bytesToHex(ecbEncrypted.ciphertext))

      // CBC
      const cbcEncrypted = encrypt(compareText, compareKey, 'CBC')
      setCbcResult(bytesToHex(cbcEncrypted.ciphertext))

      // CTR
      const ctrEncrypted = encrypt(compareText, compareKey, 'CTR')
      setCtrResult(bytesToHex(ctrEncrypted.ciphertext))
    } catch (error) {
      alert(`エラー: ${error}`)
    }
  }

  return (
    <main className="page aes">
      <header className="page-header">
        <p className="eyebrow" style={{ color: 'var(--color-primary)', textShadow: '0 0 10px var(--color-primary)' }}>[ SYSTEM_CORE: AES_ENGINE ]</p>
        <h1 style={{ letterSpacing: '-0.05em' }}>対称鍵暗号: AES の深淵</h1>
        <p className="lede">
          2001年にNISTが標準化した共通鍵暗号の本命。
          SPN構造による攪乱と拡散のメカニズム、そして現代の通信を支える「モード」の重要性を解き明かす。
        </p>
      </header>

      <section className="card">
        <div className="card-header">
          <h2>1. AESの基本情報</h2>
          <p>Advanced Encryption Standard（AES）はDESの後継として採用されたブロック暗号。16バイト単位でデータを処理し、IoTからクラウドまであらゆる現場で使われています。</p>
        </div>
        <ul>
          <li><strong>標準化:</strong> 2001年にRijndaelがAESとして採択。設計者はJoan DaemenとVincent Rijmen。</li>
          <li><strong>ブロックサイズ:</strong> 常に128ビット。サイズが固定されているので「モード」で複数ブロックへ拡張します。</li>
          <li><strong>鍵長:</strong> 128/192/256bit（それぞれ10/12/14ラウンド）。鍵長で安全性と処理コストを調整。</li>
          <li><strong>用途:</strong> TLS/SSH、VPN、ディスク暗号化、モバイルアプリのデータ保護など「高速に大量データを守る」場面の主役。</li>
        </ul>
        <div className="info-panel">
          <h3>AES = 置換・転置ネットワーク</h3>
          <p>
            各ラウンドで<em>SubBytes / ShiftRows / MixColumns / AddRoundKey</em>の4操作を繰り返し、非線形性と拡散性を確保します。S-BoxはGF(2⁸)上の逆数演算とアフィン変換で構成され、ハードウェア実装もしやすい作りです。
          </p>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h2>2. 共通鍵暗号としての立ち位置</h2>
          <p>AESは「同じ鍵」で暗号化/復号する対称方式。鍵配送問題がある代わりに圧倒的な速度を誇り、公開鍵暗号と組み合わせてハイブリッド構成を作ります。</p>
        </div>
        <div className="card-grid">
          <div className="card">
            <h3>AES（共通鍵）</h3>
            <ul>
              <li>暗号化/復号で同じ鍵を使用</li>
              <li>CPU/ASICで高速（AES-NI対応ならGbps級）</li>
              <li>鍵配送は別の仕組みで解決する必要あり</li>
              <li>AES-GCM, ChaCha20-Poly1305 などAEADモードで改ざん検知も実現</li>
            </ul>
          </div>
          <div className="card">
            <h3>RSA / ECDH（公開鍵）</h3>
            <ul>
              <li>公開鍵で暗号化、秘密鍵で復号</li>
              <li>鍵配送問題を解決できるが計算は重い</li>
              <li>ECDHは鍵交換、RSAは暗号化と署名、ECDSA/Ed25519は署名専用</li>
              <li>Shorのアルゴリズム（量子攻撃）の脅威を受ける</li>
            </ul>
          </div>
        </div>
        <p>現代のWeb/TLSでは公開鍵暗号でセッション鍵を共有し、共有済みの鍵でAES-GCMを回すハイブリッド構成が常識です。</p>
        <ol>
          <li>サーバー証明書（公開鍵）とECDHで「共通鍵」を共有</li>
          <li>共有鍵からHKDFでAES-GCM用の鍵を導出</li>
          <li>AESでWebページやAPIレスポンスを高速に暗号化</li>
        </ol>
        <p className="hint">ハイブリッド構成にすることで「公開鍵で安全に鍵を届ける」「AESで高速にデータを守る」を同時に満たせます。</p>
      </section>

      <section className="card">
        <div className="card-header">
          <h2>3. AESの内部構造と安全性メモ</h2>
          <p>ブロック暗号のラウンド設計と鍵スケジュール、そして攻撃面をまとめておくと実装時のチェックリストになります。</p>
        </div>
        <div className="card-grid">
          <div className="card">
            <h3>ラウンド処理</h3>
            <ol>
              <li><strong>SubBytes:</strong> S-Boxで非線形変換。</li>
              <li><strong>ShiftRows:</strong> 各行を左シフトして拡散。</li>
              <li><strong>MixColumns:</strong> 列をGF(2⁸)で混合し、隣接バイトへ影響を伝播。</li>
              <li><strong>AddRoundKey:</strong> そのラウンド専用の鍵とXOR。</li>
            </ol>
          </div>
          <div className="card">
            <h3>鍵スケジュール</h3>
            <ul>
              <li>マスター鍵からラウンド鍵を生成</li>
              <li>Rcon（Round Constant）で各ラウンドを分岐</li>
              <li>鍵長ごとに異なる回数の展開が必要</li>
            </ul>
            <p>鍵派生が硬いので、ラウンド鍵の使い回しで弱点が出にくい設計です。</p>
          </div>
        </div>
        <div className="info-panel">
          <h3>安全性の現在地</h3>
          <ul>
            <li><strong>総当たり:</strong> AES-128でも2¹²⁸通り。現実的に不可能。</li>
            <li><strong>差分/線形解読:</strong> 十分なラウンド数で防御済み。</li>
            <li><strong>関連鍵攻撃:</strong> AES-256は鍵スケジュールが複雑なぶん差分攻撃の研究がされており理論上の弱点が報告されているが、実用上は問題なし。</li>
            <li><strong>量子計算:</strong> Groverアルゴリズムで探索が√NになるためAES-128は64bit安全性と見積もられる。長期用途はAES-256が無難。</li>
            <li><strong>サイドチャネル:</strong> タイミング/電力解析を避けるためAES-NIなど定数時間実装を使う。</li>
          </ul>
        </div>
        <p className="hint">
          AES-NIのようなCPU命令セットを使うと、S-Boxをテーブル参照ではなく命令レベルで処理できるため、キャッシュ観測によるサイドチャネルを抑えつつ高速化できます。
        </p>
      </section>

      <section className="card">
        <div className="card-header">
          <h2>4. ハンズオン: 鍵を選び AES を実行</h2>
          <p>鍵長とブロックモードを選んで暗号化/復号を動かしながら、IVやNonceがどのように扱われるかを確認します。</p>
        </div>

        <label>鍵長</label>
        <div>
          {[128, 192, 256].map((size) => (
            <label key={size}>
              <input
                type="radio"
                name="keySize"
                value={size}
                checked={keySize === size}
                onChange={(event) => setKeySize(Number(event.target.value) as 128 | 192 | 256)}
              />
              AES-{size}
            </label>
          ))}
        </div>
        <button type="button" className="btn btn-secondary" onClick={handleGenerateKey}>
          ランダム鍵を再生成
        </button>
        <label htmlFor="aes-key">現在の鍵（16進表記）</label>
        <textarea id="aes-key" rows={3} readOnly value={bytesToHex(key)} />

        <label htmlFor="aes-mode">ブロックモード</label>
        <select
          id="aes-mode"
          value={mode}
          onChange={(event) => setMode(event.target.value as AESMode)}
        >
          <option value="CBC">CBC</option>
          <option value="CTR">CTR</option>
          <option value="ECB">ECB</option>
        </select>
        {mode === 'ECB' && (
          <p className="hint">⚠️ ECBはパターンがそのまま漏れるので学習用途以外では使用禁止です。</p>
        )}

        <label htmlFor="aes-plaintext">平文</label>
        <textarea
          id="aes-plaintext"
          rows={4}
          value={plaintext}
          onChange={(event) => setPlaintext(event.target.value)}
          placeholder="Hello, AES!"
        />

        <div className="actions">
          <button type="button" className="btn btn-primary" onClick={handleEncrypt}>
            暗号化
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleDecrypt}
            disabled={!ciphertext}
          >
            復号
          </button>
        </div>

        {ciphertext && (
          <>
            <label htmlFor="aes-ciphertext">暗号文（16進数）</label>
            <textarea
              id="aes-ciphertext"
              rows={3}
              value={bytesToHex(ciphertext)}
              readOnly
            />
            {iv && (
              <>
                <label htmlFor="aes-iv">{mode === 'CTR' ? 'Nonce' : 'IV'}</label>
                <textarea id="aes-iv" rows={2} value={bytesToHex(iv)} readOnly />
              </>
            )}
          </>
        )}

        {decrypted && (
          <>
            <label htmlFor="aes-decrypted">復号結果</label>
            <textarea id="aes-decrypted" rows={3} value={decrypted} readOnly />
            {decrypted === plaintext && <p className="hint">✅ 入力と一致しました。</p>}
          </>
        )}
      </section>

      <section className="card">
        <div className="card-header">
          <h2>5. ブロックモードの違いを可視化</h2>
          <p>128ビットごとに暗号化するAESは、そのままだと長いメッセージを守れません。モードをどう選ぶかで安全性が激変します。</p>
        </div>
        <ul>
          <li><strong>ECB:</strong> ブロックごとに独立。パターンがそのまま露出するため禁止。</li>
          <li><strong>CBC:</strong> 前の暗号文とXORしてから暗号化。IVを確実にランダム生成するのが鍵。パディングエラーをそのまま返すと「パディング・オラクル攻撃」の温床になるので、AEADかEncrypt-then-MACで保護するのが実務の定石。</li>
          <li><strong>CTR:</strong> カウンタを暗号化してストリーム化。高速だがNonce再利用と認証欠如に注意。</li>
          <li><strong>GCM:</strong> CTR + GMACで認証付き暗号 (AEAD)。GMACではGHASH（GF(2¹²⁸)上の多項式演算）を使ってタグを生成し、TLS 1.3などの標準構成になっている。</li>
        </ul>

        <label htmlFor="compare-text">同じ文字列を各モードで暗号化</label>
        <input
          id="compare-text"
          type="text"
          value={compareText}
          onChange={(event) => setCompareText(event.target.value)}
          placeholder="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
        />
        <button type="button" className="btn btn-secondary" onClick={handleCompare}>
          各モードで暗号化
        </button>

        {ecbResult && (
          <div className="card-grid">
            <div className="card">
              <h3>ECB</h3>
              <p className="hint">同じブロックが同じ暗号文になる。</p>
              <textarea rows={3} value={ecbResult} readOnly />
            </div>
            <div className="card">
              <h3>CBC</h3>
              <p className="hint">パターンが崩れ、チェインによって各ブロックが変化。</p>
              <textarea rows={3} value={cbcResult} readOnly />
            </div>
            <div className="card">
              <h3>CTR</h3>
              <p className="hint">疑似ストリーム暗号。Nonceの再利用だけは厳禁。</p>
              <textarea rows={3} value={ctrResult} readOnly />
            </div>
          </div>
        )}
      </section>

      <section className="card">
        <div className="card-header">
          <h2>6. まとめと次の一歩</h2>
        </div>
        <ul>
          <li>AESは共通鍵暗号の標準であり、公開鍵暗号と組み合わせて初めて実用になる。</li>
          <li>内部構造はSPN方式。SubBytes/ShiftRows/MixColumns/AddRoundKeyを理解すると攻撃面のニュースが読みやすくなる。</li>
          <li>ECBは歴史資料。CBC/CTR/GCMなどモードの選び方が安全性を左右する。</li>
          <li>量子時代を見据えるならAES-256 + AEAD（GCMやChaCha20-Poly1305）を基準にする。</li>
        </ul>
        <p>次は共通鍵暗号ラボ（AES-GCMデモ）や公開鍵ラボ（ECDH→HKDF→AES）を触って、ハイブリッド構成全体を見るのがおすすめです。</p>
      </section>
    </main>
  )
}
