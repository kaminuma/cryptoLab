import { useMemo, useState } from 'react'

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

export default function ToolsPage() {
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
    <main className="page tools">
      <section className="page-header">
        <p className="eyebrow">Tools</p>
        <h1>暗号解読で頻出の変換ツール</h1>
        <p className="lede">CTF でよく使う表記揺れの解消・Base64/Hex/ASCII 変換を 1 つの画面でまとめて扱えます。</p>
      </section>

      <section className="card">
        <div className="card-header">
          <h2>数列 → ASCII コンバータ</h2>
          <p>スペースやカンマ区切りの数値を張り付けるだけで文字列に復元できます。表記の自動判定にも対応。</p>
        </div>

        <div className="control-group">
          <label htmlFor="number-base">入力の基数</label>
          <select
            id="number-base"
            className="text-input"
            value={numberBase}
            onChange={(event) => setNumberBase(event.target.value as NumberBase)}
          >
            {numberBaseOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <label htmlFor="ascii-number-input">数列を貼り付け</label>
        <textarea
          id="ascii-number-input"
          rows={4}
          placeholder="72 101 108 108 111 / 0x46 0x4C 0x41 0x47"
          value={numberInput}
          onChange={(event) => setNumberInput(event.target.value)}
        />

        {numberConversion.error && <p className="feedback error">{numberConversion.error}</p>}

        <label htmlFor="ascii-number-output">復元テキスト</label>
        <textarea id="ascii-number-output" rows={3} value={numberConversion.text} readOnly placeholder="結果がここに表示されます" />

        {numberConversion.codes.length > 0 ? (
          <div style={{ overflowX: 'auto', marginTop: '16px' }}>
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
        ) : (
          <p className="hint">数列を入力すると 10/16/2 進の対応表も表示されます。</p>
        )}
      </section>

      <section className="card">
        <div className="card-header">
          <h2>文字コードインスペクタ</h2>
          <p>平文を入力すると、各文字の 10 進 / 16 進 / 2 進表現を確認できます。</p>
        </div>

        <label htmlFor="ascii-text-input">平文を入力</label>
        <textarea
          id="ascii-text-input"
          rows={3}
          value={textInput}
          onChange={(event) => setTextInput(event.target.value)}
          placeholder="FLAG{EXAMPLE}"
        />

        {asciiBreakdown.length > 0 ? (
          <div style={{ overflowX: 'auto', marginTop: '16px' }}>
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
        ) : (
          <p className="hint">ASCII 文字列を入力するとコードポイントの一覧を表示します。</p>
        )}
      </section>

      <section className="card">
        <div className="card-header">
          <h2>Base64 / Hex ツール</h2>
          <p>よく使うエンコード・デコード処理を並列に表示し、試した値をそのまま共有できます。</p>
        </div>

        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <div>
            <h3>テキスト → Base64</h3>
            <textarea
              rows={3}
              value={base64Plain}
              onChange={(event) => setBase64Plain(event.target.value)}
              placeholder="flag{sample}"
            />
            <label htmlFor="base64-encode-output">Base64</label>
            <textarea id="base64-encode-output" rows={3} value={base64EncodeResult.value} readOnly placeholder="自動でエンコードされます" />
            {base64EncodeResult.error && <p className="feedback error">{base64EncodeResult.error}</p>}
          </div>

          <div>
            <h3>Base64 → テキスト</h3>
            <textarea
              rows={3}
              value={base64Cipher}
              onChange={(event) => setBase64Cipher(event.target.value)}
              placeholder="RkxBR3tjeWVAdHR9"
            />
            <label htmlFor="base64-decode-output">結果</label>
            <textarea id="base64-decode-output" rows={3} value={base64DecodeResult.value} readOnly placeholder="有効な Base64 を入力してください" />
            {base64DecodeResult.error && <p className="feedback error">{base64DecodeResult.error}</p>}
          </div>
        </div>

        <hr />

        <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <div>
            <h3>テキスト → 16 進</h3>
            <textarea rows={3} value={hexPlain} onChange={(event) => setHexPlain(event.target.value)} placeholder="cryptolab" />
            <label htmlFor="hex-encode-output">16 進</label>
            <textarea id="hex-encode-output" rows={3} value={hexFromPlain.value} readOnly placeholder="自動で 16 進表記に変換されます" />
            {hexFromPlain.error && <p className="feedback error">{hexFromPlain.error}</p>}
          </div>

          <div>
            <h3>16 進 → テキスト</h3>
            <textarea
              rows={3}
              value={hexInput}
              onChange={(event) => setHexInput(event.target.value)}
              placeholder="666c6167203f"
            />
            <label htmlFor="hex-decode-output">結果</label>
            <textarea id="hex-decode-output" rows={3} value={hexDecoded.value} readOnly placeholder="有効な 16 進を入力してください" />
            {hexDecoded.error && <p className="feedback error">{hexDecoded.error}</p>}
          </div>
        </div>
      </section>
    </main>
  )
}
