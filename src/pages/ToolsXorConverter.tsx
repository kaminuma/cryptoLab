import { useState, useMemo, useEffect } from 'react'
import StepLesson, { type LessonStep } from '../components/ui/StepLesson'
import '../components/ui/StepLesson.css'
import { usePageMeta } from '../hooks/usePageMeta'

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

function WhatIsXor() {
  return (
    <>
      <p>
        XOR（排他的論理和）は、2つのビットを比較して<strong>異なれば1、同じなら0</strong>を返す論理演算です。
        暗号の世界では最も基本的な演算のひとつです。
      </p>

      <div className="step-lesson__visual">
        <table>
          <thead>
            <tr>
              <th>A</th>
              <th>B</th>
              <th>A XOR B</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>0</td><td>0</td><td>0</td></tr>
            <tr><td>0</td><td>1</td><td>1</td></tr>
            <tr><td>1</td><td>0</td><td>1</td></tr>
            <tr><td>1</td><td>1</td><td>0</td></tr>
          </tbody>
        </table>
      </div>

      <p>XOR の最も重要な性質は<strong>対称性</strong>です:</p>
      <ul>
        <li><code>A XOR K = C</code> （暗号化）</li>
        <li><code>C XOR K = A</code> （復号）</li>
      </ul>

      <div className="step-lesson__callout">
        つまり、同じ鍵で暗号化と復号ができます。これがXOR暗号の最大の特徴です。
      </div>
    </>
  )
}

function InteractiveXorDemo() {
  const [dataInput, setDataInput] = useState('Hello, World!')
  const [dataFormat, setDataFormat] = useState<InputFormat>('text')
  const [keyInput, setKeyInput] = useState('KEY')
  const [keyFormat, setKeyFormat] = useState<InputFormat>('text')
  const [outputFormat, setOutputFormat] = useState<InputFormat>('hex')

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

  const [copyFeedback, setCopyFeedback] = useState<string | null>(null)

  const copyToClipboard = async () => {
    if (!result.output) return
    try {
      await navigator.clipboard.writeText(result.output)
      setCopyFeedback('コピーしました')
      setTimeout(() => setCopyFeedback(null), 2000)
    } catch {
      setCopyFeedback('コピーに失敗しました（HTTPS環境が必要です）')
      setTimeout(() => setCopyFeedback(null), 3000)
    }
  }

  return (
    <>
      <p>データと鍵を XOR 演算します。同じ操作で暗号化も復号もできます。</p>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>

        <div className="step-lesson__comparison">
          <div className="step-lesson__comparison-item">
            <label htmlFor="data-format">データの形式</label>
            <select
              id="data-format"
              value={dataFormat}
              onChange={(e) => setDataFormat(e.target.value as InputFormat)}
            >
              {formatOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <label htmlFor="data-input">データ（平文 or 暗号文）</label>
            <textarea
              id="data-input"
              rows={3}
              value={dataInput}
              onChange={(e) => setDataInput(e.target.value)}
              placeholder="暗号化または復号したいデータ"
            />
          </div>

          <div className="step-lesson__comparison-item">
            <label htmlFor="key-format">鍵の形式</label>
            <select
              id="key-format"
              value={keyFormat}
              onChange={(e) => setKeyFormat(e.target.value as InputFormat)}
            >
              {formatOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <label htmlFor="key-input">鍵（Key）</label>
            <textarea
              id="key-input"
              rows={3}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="XOR に使う鍵"
            />
          </div>
        </div>

        <label htmlFor="output-format">出力形式</label>
        <select
          id="output-format"
          value={outputFormat}
          onChange={(e) => setOutputFormat(e.target.value as InputFormat)}
        >
          {formatOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <label htmlFor="xor-output">XOR 結果</label>
        <textarea
          id="xor-output"
          rows={3}
          value={result.output}
          readOnly
          placeholder="結果がここに表示されます"
        />
        {result.error && <p className="step-lesson__demo-result">{result.error}</p>}

        <div>
          <button
            onClick={copyToClipboard}
            disabled={!result.output}
            className="step-lesson__demo-btn step-lesson__demo-btn--secondary"
          >
            結果をコピー
          </button>
          {copyFeedback && <span className="step-lesson__demo-result">{copyFeedback}</span>}
        </div>
      </div>

      {result.breakdown.length > 0 && (
        <div className="step-lesson__demo">
          <span className="step-lesson__demo-label">XOR 演算の内訳</span>
          <p>各バイトがどのように XOR されたかを確認できます。</p>

          <div className="step-lesson__table-wrap">
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
                      ({row.dataByte})
                    </td>
                    <td><code>{row.dataByte.toString(2).padStart(8, '0')}</code></td>
                    <td>
                      <code>{row.keyChar}</code>{' '}
                      ({row.keyByte})
                    </td>
                    <td><code>{row.keyByte.toString(2).padStart(8, '0')}</code></td>
                    <td>
                      <code>{row.resultChar}</code>{' '}
                      ({row.resultByte})
                    </td>
                    <td><code>{row.resultByte.toString(2).padStart(8, '0')}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {result.breakdown.length > 50 && (
              <p>最初の 50 バイトのみ表示しています。</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function XorInCryptography() {
  return (
    <>
      <p>XOR は現代の暗号技術のあらゆる場所で使われています。</p>
      <ul>
        <li>
          <strong>ワンタイムパッド (OTP):</strong> 鍵がデータと同じ長さで、完全にランダムで、一度しか使わない場合、
          XOR暗号は<strong>理論上解読不可能</strong>です（シャノンの定理）。
        </li>
        <li>
          <strong>ストリーム暗号:</strong> RC4やChaCha20などは、擬似乱数ストリームとデータをXORします。
        </li>
        <li>
          <strong>ブロック暗号のモード:</strong> AESのCBCモードやCTRモードでは、XORが中核的な役割を果たします。
        </li>
        <li>
          <strong>ハッシュ関数:</strong> SHA-256の圧縮関数でもXOR演算が多用されています。
        </li>
      </ul>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>XOR暗号の強み</h3>
          <ul>
            <li>実装が極めてシンプル</li>
            <li>暗号化と復号が同一操作</li>
            <li>OTPなら情報理論的に安全</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>XOR暗号の弱点</h3>
          <ul>
            <li>鍵の再利用は致命的（<code>C1 XOR C2 = P1 XOR P2</code>）</li>
            <li>短い鍵の繰り返しは統計的攻撃に脆弱</li>
            <li>鍵配送問題が残る</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>CTFでのポイント:</strong> XOR暗号の問題では、既知平文攻撃（Known Plaintext Attack）が有効です。
        平文の一部が分かっていれば、<code>P XOR C = K</code> で鍵を特定できます。
      </div>
    </>
  )
}

export default function ToolsXorConverterPage() {
  usePageMeta({ title: 'XOR 暗号化ツール', description: 'XOR演算でデータを暗号化・復号するインタラクティブツール' })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const steps: LessonStep[] = [
    {
      title: 'XOR（排他的論理和）とは？',
      content: <WhatIsXor />,
      quiz: {
        question: 'XOR の最も重要な性質は？',
        options: [
          { label: '計算が高速であること' },
          { label: '出力が常に入力より大きくなること' },
          { label: '同じ鍵で暗号化と復号ができる（対称性）', correct: true },
          { label: '出力が固定長になること' },
        ],
        explanation: '正解！A XOR K = C のとき、C XOR K = A が成り立ちます。この対称性により、同じ鍵と同じ操作で暗号化と復号の両方が可能になります。',
      },
    },
    {
      title: 'XOR 暗号化ツール',
      content: <InteractiveXorDemo />,
    },
    {
      title: '暗号技術におけるXOR',
      content: <XorInCryptography />,
      quiz: {
        question: 'ワンタイムパッド（OTP）が解読不可能になる条件は？',
        options: [
          { label: '鍵を3回以上繰り返し使用すること' },
          { label: 'AES暗号と組み合わせること' },
          { label: '鍵がデータと同じ長さで、完全にランダムで、一度しか使わないこと', correct: true },
          { label: '鍵をハッシュ化してから使用すること' },
        ],
        explanation: '正解！この3つの条件（同じ長さ、完全ランダム、使い捨て）を全て満たすとき、ワンタイムパッドは情報理論的に安全、つまり理論上解読不可能になります。',
      },
    },
  ]

  return (
    <main className="page tools xor-converter">
      <StepLesson
        lessonId="tools-xor"
        title="XOR 暗号化ツール"
        steps={steps}
      />
    </main>
  )
}
