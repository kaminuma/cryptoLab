import { useMemo, useState, useEffect } from 'react'
import StepLesson, { type LessonStep } from '../components/ui/StepLesson'
import '../components/ui/StepLesson.css'

type NumberBase = 'auto' | 'decimal' | 'hex' | 'binary' | 'octal'

type NumberConversion = {
  text: string
  codes: number[]
  error: string | null
}

type Base64Result = {
  value: string
  error: string | null
}

type HexResult = {
  value: string
  error: string | null
}

const MAX_ASCII = 255

const numberBaseOptions: Array<{ value: NumberBase; label: string }> = [
  { value: 'auto', label: '自動判定' },
  { value: 'decimal', label: '10 進数' },
  { value: 'hex', label: '16 進数' },
  { value: 'binary', label: '2 進数' },
  { value: 'octal', label: '8 進数' },
]

const describeChar = (code: number) => {
  if (code === 10) return '\\n (LF)'
  if (code === 9) return '\\t (TAB)'
  if (code === 13) return '\\r (CR)'
  if (code === 32) return 'space'
  const char = String.fromCharCode(code)
  return /[ -~]/.test(char) ? char : '非表示'
}

const parseNumberToken = (token: string, base: NumberBase) => {
  const trimmed = token.trim()
  if (!trimmed) {
    throw new Error('空の値が含まれています。')
  }

  const normalized = trimmed.replace(/_/g, '')
  const isNegative = normalized.startsWith('-')
  const unsigned = isNegative ? normalized.slice(1) : normalized
  if (!unsigned) throw new Error('値を入力してください。')

  const detectBodyAndRadix = (): { body: string; radix: number } => {
    const lowered = unsigned.toLowerCase()
    if (lowered.startsWith('0x')) {
      return { body: unsigned.slice(2), radix: 16 }
    }
    if (lowered.startsWith('0b')) {
      return { body: unsigned.slice(2), radix: 2 }
    }
    if (lowered.startsWith('0o')) {
      return { body: unsigned.slice(2), radix: 8 }
    }
    if (/^[01]+$/.test(unsigned)) {
      return { body: unsigned, radix: 2 }
    }
    if (/^[0-7]+$/.test(unsigned)) {
      return { body: unsigned, radix: 8 }
    }
    if (/^[0-9]+$/.test(unsigned)) {
      return { body: unsigned, radix: 10 }
    }
    if (/^[0-9a-f]+$/i.test(unsigned)) {
      return { body: unsigned, radix: 16 }
    }
    throw new Error(`解釈できない値です: ${token}`)
  }

  const validateByBase = (radix: number, value: string) => {
    const regex = {
      2: /^[01]+$/i,
      8: /^[0-7]+$/i,
      10: /^[0-9]+$/,
      16: /^[0-9a-f]+$/i,
    }[radix]

    if (!regex || !regex.test(value)) {
      throw new Error(`この表記は ${radix} 進数として無効です: ${token}`)
    }
  }

  let radix: number
  let body: string

  switch (base) {
    case 'decimal':
      radix = 10
      body = unsigned
      validateByBase(radix, body)
      break
    case 'hex':
      radix = 16
      body = unsigned.replace(/^0x/i, '')
      validateByBase(radix, body)
      break
    case 'binary':
      radix = 2
      body = unsigned.replace(/^0b/i, '')
      validateByBase(radix, body)
      break
    case 'octal':
      radix = 8
      body = unsigned.replace(/^0o/i, '')
      validateByBase(radix, body)
      break
    case 'auto':
    default: {
      const detected = detectBodyAndRadix()
      radix = detected.radix
      body = detected.body
      break
    }
  }

  const parsed = parseInt(body, radix)
  if (Number.isNaN(parsed)) {
    throw new Error(`数値に変換できません: ${token}`)
  }

  const signedValue = isNegative ? -parsed : parsed
  if (signedValue < 0 || signedValue > MAX_ASCII) {
    throw new Error('ASCII (0〜255) の範囲で入力してください。')
  }

  return signedValue
}

const encodeBase64 = (text: string): string => {
  if (!text) return ''
  if (typeof globalThis.btoa !== 'function') {
    throw new Error('この環境は Base64 エンコードをサポートしていません。')
  }
  const encoder = new TextEncoder()
  let binary = ''
  encoder.encode(text).forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return globalThis.btoa(binary)
}

const decodeBase64 = (value: string): string => {
  if (!value.trim()) return ''
  if (typeof globalThis.atob !== 'function') {
    throw new Error('この環境は Base64 デコードをサポートしていません。')
  }
  const binary = globalThis.atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return new TextDecoder().decode(bytes)
}

const textToHex = (text: string) => {
  if (!text) return ''
  const encoder = new TextEncoder()
  return Array.from(encoder.encode(text))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join(' ')
    .toUpperCase()
}

const hexToText = (value: string): string => {
  if (!value.trim()) return ''
  const sanitized = value.replace(/[^0-9a-f]/gi, '')
  if (!sanitized) return ''
  if (sanitized.length % 2 !== 0) {
    throw new Error('16 進表記は 2 桁単位で入力してください。')
  }
  const bytes = new Uint8Array(sanitized.length / 2)
  for (let index = 0; index < sanitized.length; index += 2) {
    bytes[index / 2] = parseInt(sanitized.slice(index, index + 2), 16)
  }
  return new TextDecoder().decode(bytes)
}

function WhatAreEncodings() {
  return (
    <>
      <p>
        エンコーディングとは、データを<strong>別の形式に変換</strong>するルールのことです。
        暗号化とは異なり、秘密の鍵は不要で、誰でも元に戻せます。
      </p>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>暗号化 (Encryption)</h3>
          <ul>
            <li><strong>目的:</strong> データを秘密にする</li>
            <li><strong>特徴:</strong> 鍵がないと元に戻せない</li>
            <li><strong>例:</strong> AES, RSA</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>エンコーディング (Encoding)</h3>
          <ul>
            <li><strong>目的:</strong> データを扱いやすい形式に変換</li>
            <li><strong>特徴:</strong> 誰でも元に戻せる（公開ルール）</li>
            <li><strong>例:</strong> Base64, Hex, ASCII</li>
          </ul>
        </div>
      </div>
      <div className="step-lesson__callout">
        <strong>重要:</strong> Base64やHexは「暗号化」ではありません。
        CTFの問題では、エンコードされた文字列を正しくデコードすることが第一歩になります。
      </div>
    </>
  )
}

function InteractiveConverterDemo() {
  const [numberInput, setNumberInput] = useState('70 76 65 71')
  const [numberBase, setNumberBase] = useState<NumberBase>('auto')
  const [textInput, setTextInput] = useState('FLAG{CRYPTO}')
  const [base64Plain, setBase64Plain] = useState('flag{crypto}')
  const [base64Cipher, setBase64Cipher] = useState('ZmxhZ3tjcnlwdG99')
  const [hexPlain, setHexPlain] = useState('cryptolab')
  const [hexInput, setHexInput] = useState('63727970746f6c6162')

  const numberConversion = useMemo<NumberConversion>(() => {
    if (!numberInput.trim()) {
      return { text: '', codes: [], error: null }
    }
    try {
      const codes = numberInput
        .split(/[\s,]+/)
        .filter(Boolean)
        .map((token) => parseNumberToken(token, numberBase))
      const text = codes.length ? String.fromCharCode(...codes) : ''
      return { text, codes, error: null }
    } catch (error) {
      return {
        text: '',
        codes: [],
        error: error instanceof Error ? error.message : '数列の解析に失敗しました。',
      }
    }
  }, [numberInput, numberBase])

  const asciiBreakdown = useMemo(() => {
    if (!textInput) return []
    return Array.from(textInput).map((char, index) => {
      const code = char.charCodeAt(0)
      return {
        id: `${char}-${index}`,
        char,
        code,
        hex: code.toString(16).toUpperCase().padStart(2, '0'),
        binary: code.toString(2).padStart(8, '0'),
      }
    })
  }, [textInput])

  const base64EncodeResult = useMemo<Base64Result>(() => {
    if (!base64Plain) return { value: '', error: null }
    try {
      return { value: encodeBase64(base64Plain), error: null }
    } catch (error) {
      return { value: '', error: error instanceof Error ? error.message : 'Base64 エンコードに失敗しました。' }
    }
  }, [base64Plain])

  const base64DecodeResult = useMemo<Base64Result>(() => {
    if (!base64Cipher.trim()) return { value: '', error: null }
    try {
      return { value: decodeBase64(base64Cipher.trim()), error: null }
    } catch (error) {
      return { value: '', error: error instanceof Error ? error.message : 'Base64 デコードに失敗しました。' }
    }
  }, [base64Cipher])

  const hexFromPlain = useMemo<HexResult>(() => {
    if (!hexPlain) return { value: '', error: null }
    try {
      return { value: textToHex(hexPlain), error: null }
    } catch (error) {
      return { value: '', error: error instanceof Error ? error.message : '16 進変換に失敗しました。' }
    }
  }, [hexPlain])

  const hexDecoded = useMemo<HexResult>(() => {
    if (!hexInput.trim()) return { value: '', error: null }
    try {
      return { value: hexToText(hexInput.trim()), error: null }
    } catch (error) {
      return { value: '', error: error instanceof Error ? error.message : '16 進デコードに失敗しました。' }
    }
  }, [hexInput])

  return (
    <>
      <p>各種エンコーディングを自在に変換してみましょう。入力を変えて結果を確認してください。</p>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>

        <h3>数列 → ASCII コンバータ</h3>
        <p>スペースやカンマ区切りの数値を張り付けるだけで文字列に復元できます。</p>

        <label htmlFor="number-base">入力の基数</label>
        <select
          id="number-base"
          value={numberBase}
          onChange={(event) => setNumberBase(event.target.value as NumberBase)}
        >
          {numberBaseOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label htmlFor="ascii-number-input">数列を貼り付け</label>
        <textarea
          id="ascii-number-input"
          rows={3}
          placeholder="72 101 108 108 111 / 0x46 0x4C 0x41 0x47"
          value={numberInput}
          onChange={(event) => setNumberInput(event.target.value)}
        />

        {numberConversion.error && <p className="step-lesson__demo-result">{numberConversion.error}</p>}

        <label htmlFor="ascii-number-output">復元テキスト</label>
        <textarea id="ascii-number-output" rows={2} value={numberConversion.text} readOnly placeholder="結果がここに表示されます" />

        {numberConversion.codes.length > 0 && (
          <div className="step-lesson__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>10 進</th>
                  <th>16 進</th>
                  <th>2 進</th>
                  <th>文字</th>
                </tr>
              </thead>
              <tbody>
                {numberConversion.codes.map((code, index) => (
                  <tr key={`${code}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{code}</td>
                    <td>{code.toString(16).toUpperCase().padStart(2, '0')}</td>
                    <td>{code.toString(2).padStart(8, '0')}</td>
                    <td>{describeChar(code)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>

        <h3>文字コードインスペクタ</h3>
        <p>平文を入力すると、各文字の 10 進 / 16 進 / 2 進表現を確認できます。</p>

        <label htmlFor="ascii-text-input">平文を入力</label>
        <textarea
          id="ascii-text-input"
          rows={2}
          value={textInput}
          onChange={(event) => setTextInput(event.target.value)}
          placeholder="FLAG{EXAMPLE}"
        />

        {asciiBreakdown.length > 0 && (
          <div className="step-lesson__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>文字</th>
                  <th>10 進</th>
                  <th>16 進</th>
                  <th>2 進</th>
                </tr>
              </thead>
              <tbody>
                {asciiBreakdown.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.char}</td>
                    <td>{entry.code}</td>
                    <td>{entry.hex}</td>
                    <td>{entry.binary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>

        <h3>Base64 エンコード / デコード</h3>

        <div className="step-lesson__comparison">
          <div className="step-lesson__comparison-item">
            <label>テキスト → Base64</label>
            <textarea
              rows={2}
              value={base64Plain}
              onChange={(event) => setBase64Plain(event.target.value)}
              placeholder="flag{sample}"
            />
            <label>Base64</label>
            <textarea rows={2} value={base64EncodeResult.value} readOnly placeholder="自動でエンコードされます" />
            {base64EncodeResult.error && <p className="step-lesson__demo-result">{base64EncodeResult.error}</p>}
          </div>

          <div className="step-lesson__comparison-item">
            <label>Base64 → テキスト</label>
            <textarea
              rows={2}
              value={base64Cipher}
              onChange={(event) => setBase64Cipher(event.target.value)}
              placeholder="RkxBR3tjeWVAdHR9"
            />
            <label>結果</label>
            <textarea rows={2} value={base64DecodeResult.value} readOnly placeholder="有効な Base64 を入力してください" />
            {base64DecodeResult.error && <p className="step-lesson__demo-result">{base64DecodeResult.error}</p>}
          </div>
        </div>

        <h3>Hex エンコード / デコード</h3>

        <div className="step-lesson__comparison">
          <div className="step-lesson__comparison-item">
            <label>テキスト → 16 進</label>
            <textarea rows={2} value={hexPlain} onChange={(event) => setHexPlain(event.target.value)} placeholder="cryptolab" />
            <label>16 進</label>
            <textarea rows={2} value={hexFromPlain.value} readOnly placeholder="自動で 16 進表記に変換されます" />
            {hexFromPlain.error && <p className="step-lesson__demo-result">{hexFromPlain.error}</p>}
          </div>

          <div className="step-lesson__comparison-item">
            <label>16 進 → テキスト</label>
            <textarea
              rows={2}
              value={hexInput}
              onChange={(event) => setHexInput(event.target.value)}
              placeholder="666c6167203f"
            />
            <label>結果</label>
            <textarea rows={2} value={hexDecoded.value} readOnly placeholder="有効な 16 進を入力してください" />
            {hexDecoded.error && <p className="step-lesson__demo-result">{hexDecoded.error}</p>}
          </div>
        </div>
      </div>
    </>
  )
}

function EncodingComparisonTable() {
  return (
    <>
      <p>主要なエンコーディング方式の特徴を比較してみましょう。</p>

      <div className="step-lesson__visual">
        <table>
          <thead>
            <tr>
              <th>形式</th>
              <th>文字セット</th>
              <th>サイズ効率</th>
              <th>主な用途</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>ASCII</strong></td>
              <td>0〜127（7ビット）</td>
              <td>1バイト/文字</td>
              <td>英数字テキスト</td>
            </tr>
            <tr>
              <td><strong>Base64</strong></td>
              <td>A-Z, a-z, 0-9, +, /</td>
              <td>約133%に増加</td>
              <td>メール添付、JWT、データURI</td>
            </tr>
            <tr>
              <td><strong>Hex</strong></td>
              <td>0-9, A-F</td>
              <td>200%に増加</td>
              <td>ハッシュ値表示、デバッグ</td>
            </tr>
            <tr>
              <td><strong>UTF-8</strong></td>
              <td>全Unicode文字</td>
              <td>1〜4バイト/文字</td>
              <td>Web標準、多言語テキスト</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="step-lesson__callout">
        <strong>CTFでのポイント:</strong> 問題文やフラグがBase64やHexでエンコードされていることは非常に多いです。
        見慣れない文字列を見たら、まずエンコーディングを疑いましょう。
        Base64は末尾の <code>=</code> パディングが目印です。
      </div>

      <ul>
        <li><strong>Base64の見分け方:</strong> 英数字 + <code>/</code> + <code>+</code>、末尾に <code>=</code> が付くことが多い</li>
        <li><strong>Hexの見分け方:</strong> <code>0-9</code> と <code>a-f</code> のみで構成、<code>0x</code> プレフィクスが付くことも</li>
        <li><strong>URLエンコードの見分け方:</strong> <code>%20</code> や <code>%3D</code> のようにパーセント記号が目立つ</li>
      </ul>
    </>
  )
}

export default function ToolsPage() {
  useEffect(() => {
    document.title = '変換ツール - CryptoLab'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const steps: LessonStep[] = [
    {
      title: 'エンコーディングとは？',
      content: <WhatAreEncodings />,
      quiz: {
        question: 'エンコーディングと暗号化の最大の違いは？',
        options: [
          { label: 'エンコーディングのほうが処理速度が速い' },
          { label: 'エンコーディングは鍵なしで誰でも元に戻せる', correct: true },
          { label: 'エンコーディングは出力が固定長になる' },
          { label: '暗号化はバイナリデータを扱えない' },
        ],
        explanation: '正解！エンコーディングは公開されたルールに従ってデータを変換するだけなので、鍵は不要で誰でもデコードできます。暗号化は鍵がなければ元に戻せません。',
      },
    },
    {
      title: 'インタラクティブ変換ツール',
      content: <InteractiveConverterDemo />,
    },
    {
      title: 'エンコーディング比較表',
      content: <EncodingComparisonTable />,
      quiz: {
        question: 'Base64エンコードするとデータサイズはどうなる？',
        options: [
          { label: '元のサイズより小さくなる' },
          { label: '元のサイズと同じ' },
          { label: '元のサイズの約133%に増加する', correct: true },
          { label: '元のサイズの約200%に増加する' },
        ],
        explanation: '正解！Base64は3バイトのデータを4文字（4バイト）に変換するため、約133%（4/3倍）にサイズが増加します。Hexは1バイトを2文字で表現するので200%になります。',
      },
    },
  ]

  return (
    <main className="page tools">
      <StepLesson
        title="データ変換 & 解析ツール"
        steps={steps}
      />
    </main>
  )
}
