import { useState, useMemo, useEffect } from 'react'

type InputFormat = 'text' | 'hex' | 'base64'

const textToBytes = (text: string): Uint8Array => {
  return new TextEncoder().encode(text)
}

const hexToBytes = (hex: string): Uint8Array => {
  const sanitized = hex.replace(/[^0-9a-f]/gi, '')
  if (sanitized.length % 2 !== 0) {
    throw new Error('16 進表記は 2 桁単位で入力してください。')
  }
  const bytes = new Uint8Array(sanitized.length / 2)
  for (let i = 0; i < sanitized.length; i += 2) {
    bytes[i / 2] = parseInt(sanitized.slice(i, i + 2), 16)
  }
  return bytes
}

const base64ToBytes = (base64: string): Uint8Array => {
  const binary = globalThis.atob(base64.trim())
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

const bytesToText = (bytes: Uint8Array): string => {
  return new TextDecoder().decode(bytes)
}

const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ')
    .toUpperCase()
}

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return globalThis.btoa(binary)
}

const parseInput = (value: string, format: InputFormat): Uint8Array => {
  if (!value.trim()) return new Uint8Array(0)
  switch (format) {
    case 'hex':
      return hexToBytes(value)
    case 'base64':
      return base64ToBytes(value)
    case 'text':
    default:
      return textToBytes(value)
  }
}

const xorBytes = (data: Uint8Array, key: Uint8Array): Uint8Array => {
  if (key.length === 0) return data
  const result = new Uint8Array(data.length)
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ key[i % key.length]
  }
  return result
}

const formatOptions: Array<{ value: InputFormat; label: string }> = [
  { value: 'text', label: 'テキスト' },
  { value: 'hex', label: '16 進数' },
  { value: 'base64', label: 'Base64' },
]

export default function ToolsXorConverterPage() {
  const [dataInput, setDataInput] = useState('Hello, World!')
  const [dataFormat, setDataFormat] = useState<InputFormat>('text')
  const [keyInput, setKeyInput] = useState('KEY')
  const [keyFormat, setKeyFormat] = useState<InputFormat>('text')
  const [outputFormat, setOutputFormat] = useState<InputFormat>('hex')

  useEffect(() => {
    document.title = 'XOR 暗号化ツール - CryptoLab'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const result = useMemo(() => {
    try {
      const dataBytes = parseInput(dataInput, dataFormat)
      const keyBytes = parseInput(keyInput, keyFormat)

      if (dataBytes.length === 0) {
        return { output: '', error: null, breakdown: [] }
      }
      if (keyBytes.length === 0) {
        return { output: '', error: '鍵を入力してください。', breakdown: [] }
      }

      const xored = xorBytes(dataBytes, keyBytes)

      let output: string
      switch (outputFormat) {
        case 'text':
          output = bytesToText(xored)
          break
        case 'base64':
          output = bytesToBase64(xored)
          break
        case 'hex':
        default:
          output = bytesToHex(xored)
      }

      const breakdown = Array.from(dataBytes).map((dataByte, i) => {
        const keyByte = keyBytes[i % keyBytes.length]
        const resultByte = dataByte ^ keyByte
        return {
          index: i,
          dataChar: dataByte >= 32 && dataByte < 127 ? String.fromCharCode(dataByte) : '·',
          dataByte,
          keyChar: keyByte >= 32 && keyByte < 127 ? String.fromCharCode(keyByte) : '·',
          keyByte,
          resultByte,
          resultChar: resultByte >= 32 && resultByte < 127 ? String.fromCharCode(resultByte) : '·',
        }
      })

      return { output, error: null, breakdown }
    } catch (err) {
      return {
        output: '',
        error: err instanceof Error ? err.message : 'XOR 変換に失敗しました。',
        breakdown: [],
      }
    }
  }, [dataInput, dataFormat, keyInput, keyFormat, outputFormat])

  const copyToClipboard = async () => {
    if (result.output) {
      await navigator.clipboard.writeText(result.output)
    }
  }

  return (
    <main className="page tools xor-converter">
      <header className="page-header">
        <p className="eyebrow" style={{ color: 'var(--color-primary)', textShadow: '0 0 10px var(--color-primary)' }}>
          [ UTILITY: XOR_CIPHER ]
        </p>
        <h1 style={{ letterSpacing: '-0.05em' }}>XOR 暗号化ツール</h1>
        <p className="lede">
          XOR（排他的論理和）は暗号の基本演算。同じ鍵で暗号化と復号が可能な対称暗号の原点を体験する。
        </p>
      </header>

      <section className="card">
        <div className="card-header">
          <h2>XOR 暗号化 / 復号</h2>
          <p>
            データと鍵を XOR 演算します。同じ操作で暗号化も復号もできます。
            鍵はデータより短い場合、繰り返し適用されます。
          </p>
        </div>

        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <div>
            <div className="control-group">
              <label htmlFor="data-format">データの形式</label>
              <select
                id="data-format"
                className="text-input"
                value={dataFormat}
                onChange={(e) => setDataFormat(e.target.value as InputFormat)}
              >
                {formatOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <label htmlFor="data-input">データ（平文 or 暗号文）</label>
            <textarea
              id="data-input"
              rows={4}
              value={dataInput}
              onChange={(e) => setDataInput(e.target.value)}
              placeholder="暗号化または復号したいデータ"
            />
          </div>

          <div>
            <div className="control-group">
              <label htmlFor="key-format">鍵の形式</label>
              <select
                id="key-format"
                className="text-input"
                value={keyFormat}
                onChange={(e) => setKeyFormat(e.target.value as InputFormat)}
              >
                {formatOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <label htmlFor="key-input">鍵（Key）</label>
            <textarea
              id="key-input"
              rows={4}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="XOR に使う鍵"
            />
          </div>
        </div>

        <hr />

        <div className="control-group">
          <label htmlFor="output-format">出力形式</label>
          <select
            id="output-format"
            className="text-input"
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value as InputFormat)}
          >
            {formatOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <label htmlFor="xor-output">XOR 結果</label>
        <textarea
          id="xor-output"
          rows={4}
          value={result.output}
          readOnly
          placeholder="結果がここに表示されます"
        />
        {result.error && <p className="feedback error">{result.error}</p>}

        <div className="actions">
          <button onClick={copyToClipboard} disabled={!result.output}>
            結果をコピー
          </button>
        </div>
      </section>

      {result.breakdown.length > 0 && (
        <section className="card">
          <div className="card-header">
            <h2>XOR 演算の内訳</h2>
            <p>各バイトがどのように XOR されたかを確認できます。</p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>データ</th>
                  <th>データ (bin)</th>
                  <th>鍵</th>
                  <th>鍵 (bin)</th>
                  <th>結果</th>
                  <th>結果 (bin)</th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.slice(0, 50).map((row) => (
                  <tr key={row.index}>
                    <td>{row.index}</td>
                    <td>
                      <code>{row.dataChar}</code>{' '}
                      <span style={{ color: 'var(--color-text-muted)' }}>({row.dataByte})</span>
                    </td>
                    <td><code>{row.dataByte.toString(2).padStart(8, '0')}</code></td>
                    <td>
                      <code>{row.keyChar}</code>{' '}
                      <span style={{ color: 'var(--color-text-muted)' }}>({row.keyByte})</span>
                    </td>
                    <td><code>{row.keyByte.toString(2).padStart(8, '0')}</code></td>
                    <td>
                      <code>{row.resultChar}</code>{' '}
                      <span style={{ color: 'var(--color-text-muted)' }}>({row.resultByte})</span>
                    </td>
                    <td><code>{row.resultByte.toString(2).padStart(8, '0')}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.breakdown.length > 50 && (
              <p className="hint">最初の 50 バイトのみ表示しています。</p>
            )}
          </div>
        </section>
      )}

      <section className="card">
        <div className="card-header">
          <h2>XOR 暗号の特徴</h2>
        </div>
        <ul style={{ lineHeight: 1.8 }}>
          <li><strong>対称性:</strong> 同じ鍵で暗号化と復号ができる（A ⊕ K ⊕ K = A）</li>
          <li><strong>可逆性:</strong> 元のデータを完全に復元可能</li>
          <li><strong>単純さ:</strong> ビット単位の排他的論理和のみで実装可能</li>
          <li><strong>注意点:</strong> 鍵の再利用は危険。OTP（One-Time Pad）でない限り、統計的攻撃に脆弱</li>
        </ul>
      </section>
    </main>
  )
}
