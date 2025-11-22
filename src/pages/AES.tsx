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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-4xl font-bold mb-4">AES (Advanced Encryption Standard)</h1>
      <p className="text-lg text-gray-600 mb-8">
        共通鍵暗号方式の標準 - 高速で安全な暗号化
      </p>

      {/* AESとは */}
      <section className="mb-12 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">AESとは？</h2>
        <div className="space-y-4">
          <p>
            <strong>AES（Advanced Encryption Standard）</strong>は、
            現在最も広く使われている<strong>共通鍵暗号方式</strong>です。
            2001年に米国標準技術研究所（NIST）によって標準化されました。
          </p>
          <div className="bg-white p-4 rounded border-l-4 border-blue-500">
            <h3 className="font-bold mb-2">共通鍵暗号の特徴：</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>同じ鍵</strong>で暗号化と復号を行う</li>
              <li><strong>高速</strong>：大量のデータの暗号化に適している</li>
              <li><strong>鍵の配送問題</strong>：安全に鍵を共有する必要がある</li>
            </ul>
          </div>
        </div>
      </section>

      {/* RSAとの比較 */}
      <section className="mb-12 bg-purple-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">RSAとの違い</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
            <thead className="bg-purple-200">
              <tr>
                <th className="border p-3 text-left">項目</th>
                <th className="border p-3 text-left">AES（共通鍵暗号）</th>
                <th className="border p-3 text-left">RSA（公開鍵暗号）</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-3 font-semibold">鍵</td>
                <td className="border p-3">同じ鍵で暗号化・復号</td>
                <td className="border p-3">公開鍵で暗号化、秘密鍵で復号</td>
              </tr>
              <tr className="bg-purple-50">
                <td className="border p-3 font-semibold">速度</td>
                <td className="border p-3">⚡ 非常に高速</td>
                <td className="border p-3">🐌 比較的遅い</td>
              </tr>
              <tr>
                <td className="border p-3 font-semibold">用途</td>
                <td className="border p-3">大量データの暗号化</td>
                <td className="border p-3">鍵交換、デジタル署名</td>
              </tr>
              <tr className="bg-purple-50">
                <td className="border p-3 font-semibold">鍵配送</td>
                <td className="border p-3">⚠️ 事前の安全な共有が必要</td>
                <td className="border p-3">✅ 公開鍵は自由に配布可能</td>
              </tr>
              <tr>
                <td className="border p-3 font-semibold">実例</td>
                <td className="border p-3">HTTPS通信の本文暗号化</td>
                <td className="border p-3">HTTPS通信の鍵交換</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 bg-white p-4 rounded border-l-4 border-purple-500">
          <p className="font-semibold mb-2">💡 実際のHTTPS通信では：</p>
          <ol className="list-decimal list-inside space-y-1">
            <li><strong>RSA</strong>で共通鍵（セッション鍵）を安全に交換</li>
            <li>交換した共通鍵を使って<strong>AES</strong>で本文を高速に暗号化</li>
          </ol>
          <p className="mt-2 text-sm text-gray-600">
            → 両者の長所を組み合わせた「ハイブリッド暗号」を使用
          </p>
        </div>
      </section>

      {/* AESの仕組み */}
      <section className="mb-12 bg-green-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">AESの仕組み</h2>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded">
            <h3 className="font-bold mb-2">📦 ブロック暗号</h3>
            <p>
              AESは<strong>128ビット（16バイト）</strong>単位でデータを処理します。
              これを「ブロック暗号」と呼びます。
            </p>
          </div>

          <div className="bg-white p-4 rounded">
            <h3 className="font-bold mb-2">🔑 鍵長</h3>
            <p>AESは3つの鍵長をサポート：</p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li><strong>AES-128</strong>：128ビット鍵（10ラウンド）</li>
              <li><strong>AES-192</strong>：192ビット鍵（12ラウンド）</li>
              <li><strong>AES-256</strong>：256ビット鍵（14ラウンド）</li>
            </ul>
          </div>

          <div className="bg-white p-4 rounded">
            <h3 className="font-bold mb-2">🔄 4つの基本変換</h3>
            <ol className="list-decimal list-inside ml-4 space-y-2">
              <li>
                <strong>SubBytes</strong>：S-Boxを使った非線形バイト置換
              </li>
              <li>
                <strong>ShiftRows</strong>：行を左にシフト
              </li>
              <li>
                <strong>MixColumns</strong>：列の混合（ガロア体GF(2⁸)での行列演算）
              </li>
              <li>
                <strong>AddRoundKey</strong>：ラウンド鍵とのXOR
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* インタラクティブデモ */}
      <section className="mb-12 bg-yellow-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">🔐 インタラクティブデモ</h2>

        <div className="space-y-4">
          {/* 鍵長選択 */}
          <div className="bg-white p-4 rounded">
            <label className="block font-semibold mb-2">鍵長を選択：</label>
            <div className="flex gap-4">
              {[128, 192, 256].map((size) => (
                <label key={size} className="flex items-center">
                  <input
                    type="radio"
                    name="keySize"
                    value={size}
                    checked={keySize === size}
                    onChange={(e) => setKeySize(Number(e.target.value) as 128 | 192 | 256)}
                    className="mr-2"
                  />
                  AES-{size}
                </label>
              ))}
            </div>
            <button
              onClick={handleGenerateKey}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              新しい鍵を生成
            </button>
            <p className="mt-2 text-sm font-mono bg-gray-100 p-2 rounded break-all">
              鍵: {bytesToHex(key)}
            </p>
          </div>

          {/* モード選択 */}
          <div className="bg-white p-4 rounded">
            <label className="block font-semibold mb-2">暗号化モードを選択：</label>
            <div className="flex gap-4">
              {(['ECB', 'CBC', 'CTR'] as AESMode[]).map((m) => (
                <label key={m} className="flex items-center">
                  <input
                    type="radio"
                    name="mode"
                    value={m}
                    checked={mode === m}
                    onChange={(e) => setMode(e.target.value as AESMode)}
                    className="mr-2"
                  />
                  {m}
                </label>
              ))}
            </div>
            {mode === 'ECB' && (
              <p className="mt-2 text-sm text-red-600">
                ⚠️ ECBモードは安全性が低いため、実際には使用しないでください
              </p>
            )}
          </div>

          {/* 平文入力 */}
          <div className="bg-white p-4 rounded">
            <label className="block font-semibold mb-2">平文：</label>
            <textarea
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              className="w-full border rounded p-2 font-mono"
              rows={3}
            />
          </div>

          {/* 暗号化ボタン */}
          <div className="flex gap-4">
            <button
              onClick={handleEncrypt}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              暗号化
            </button>
            <button
              onClick={handleDecrypt}
              className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
              disabled={!ciphertext}
            >
              復号
            </button>
          </div>

          {/* 結果表示 */}
          {ciphertext && (
            <div className="bg-white p-4 rounded">
              <h3 className="font-semibold mb-2">暗号文（16進数）：</h3>
              <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
                {bytesToHex(ciphertext)}
              </p>
              {iv && (
                <>
                  <h3 className="font-semibold mb-2 mt-4">
                    {mode === 'CTR' ? 'Nonce' : 'IV'}（初期化ベクトル）：
                  </h3>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
                    {bytesToHex(iv)}
                  </p>
                </>
              )}
            </div>
          )}

          {decrypted && (
            <div className="bg-white p-4 rounded border-2 border-green-500">
              <h3 className="font-semibold mb-2">復号結果：</h3>
              <p className="font-mono bg-green-50 p-2 rounded">
                {decrypted}
              </p>
              {decrypted === plaintext && (
                <p className="text-green-600 mt-2">✅ 正しく復号されました！</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ブロック暗号モードの比較 */}
      <section className="mb-12 bg-red-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">🔗 ブロック暗号モードの比較</h2>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded">
            <p className="mb-4">
              ブロック暗号（AES）は128ビット単位でしか処理できません。
              より長いデータを暗号化するには<strong>「モード」</strong>が必要です。
            </p>

            <div className="space-y-3">
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-bold text-red-700">ECB (Electronic Codebook)</h3>
                <p className="text-sm mt-1">
                  各ブロックを独立に暗号化。
                  <strong className="text-red-600">同じ平文ブロック → 同じ暗号文ブロック</strong>
                  になるため、パターンが見えてしまう！
                </p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-bold text-blue-700">CBC (Cipher Block Chaining)</h3>
                <p className="text-sm mt-1">
                  前のブロックの暗号文とXORしてから暗号化。
                  <strong className="text-blue-600">同じ平文でも異なる暗号文</strong>になる。
                  IVが必要。
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-bold text-green-700">CTR (Counter Mode)</h3>
                <p className="text-sm mt-1">
                  カウンターを暗号化してストリームを作り、平文とXOR。
                  <strong className="text-green-600">並列処理可能</strong>で高速。
                  Nonceが必要。
                </p>
              </div>
            </div>
          </div>

          {/* モード比較デモ */}
          <div className="bg-white p-4 rounded">
            <h3 className="font-bold mb-3">実験：同じ文字列を各モードで暗号化</h3>
            <p className="text-sm text-gray-600 mb-3">
              繰り返しパターンのある文字列（例：&quot;AAAA...&quot;）を暗号化すると、
              各モードの違いがわかります。
            </p>

            <label className="block font-semibold mb-2">テスト文字列：</label>
            <input
              type="text"
              value={compareText}
              onChange={(e) => setCompareText(e.target.value)}
              className="w-full border rounded p-2 font-mono mb-3"
              placeholder="繰り返しパターンのある文字列を入力"
            />

            <button
              onClick={handleCompare}
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 mb-4"
            >
              各モードで暗号化
            </button>

            {ecbResult && (
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-red-700">ECB結果：</h4>
                  <p className="font-mono text-xs bg-red-50 p-2 rounded break-all">
                    {ecbResult}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    👀 繰り返しパターンが見えやすい（同じブロックは同じ暗号文）
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-blue-700">CBC結果：</h4>
                  <p className="font-mono text-xs bg-blue-50 p-2 rounded break-all">
                    {cbcResult}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    ✅ パターンが見えにくい（チェイニングにより各ブロックが異なる）
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-green-700">CTR結果：</h4>
                  <p className="font-mono text-xs bg-green-50 p-2 rounded break-all">
                    {ctrResult}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    ✅ パターンが見えにくい（カウンターにより各ブロックが異なる）
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* まとめ */}
      <section className="bg-indigo-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">📚 まとめ</h2>
        <div className="space-y-2">
          <p>✅ AESは<strong>共通鍵暗号</strong>の標準で、高速な暗号化が可能</p>
          <p>✅ RSAとは用途が異なり、<strong>大量データの暗号化</strong>に適している</p>
          <p>✅ <strong>ECBモード</strong>は安全性が低く、実用では避けるべき</p>
          <p>✅ <strong>CBC</strong>や<strong>CTR</strong>モードは安全なパターン隠蔽が可能</p>
          <p>✅ 実際のシステムでは<strong>ハイブリッド暗号</strong>（RSA+AES）を使用</p>
        </div>
      </section>
    </div>
  )
}
