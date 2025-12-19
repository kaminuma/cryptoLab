import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import * as echarts from 'echarts'
import { classicalCiphers } from '@/data/classical'
import { caesarEncrypt, caesarDecrypt } from '@/lib/classical/caesar'
import { vigenereEncrypt, vigenereDecrypt } from '@/lib/classical/vigenere'
import { atbashTransform } from '@/lib/classical/atbash'
import { autokeyEncrypt, autokeyDecrypt } from '@/lib/classical/autokey'
import { otpEncrypt, otpDecrypt, generateOTPKey } from '@/lib/classical/otp'

type Direction = 'encrypt' | 'decrypt'

const alphabet = Array.from({ length: 26 }, (_, idx) => String.fromCharCode(65 + idx))

const normalizeShift = (value: number) => {
  if (Number.isNaN(value)) return 0
  return Math.min(25, Math.max(-25, Math.round(value)))
}

const validateText = (text: string) => {
  if (!text.trim()) {
    throw new Error('テキストを入力してください。')
  }
  return text
}

export default function ClassicalPage() {
  const [selectedId, setSelectedId] = useState(classicalCiphers[0].id)

  useEffect(() => {
    document.title = '古典暗号 - CryptoLab'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])
  const selectedCipher = classicalCiphers.find((cipher) => cipher.id === selectedId) ?? classicalCiphers[0]
  const interactiveType = selectedCipher.interactive ?? null

  const [inputText, setInputText] = useState('Meet me at the CryptoLab booth at noon.')
  const [resultText, setResultText] = useState('')
  const [shift, setShift] = useState(3)
  const [keyword, setKeyword] = useState('CRYPTO')
  const [otpKey, setOtpKey] = useState('')
  const [showChart, setShowChart] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState<'info' | 'error'>('info')

  const keywordValid = useMemo(() => {
    if (interactiveType === 'vigenere' || interactiveType === 'autokey') {
      return /[a-z]/i.test(keyword)
    }
    if (interactiveType === 'otp') {
      return /[a-z]/i.test(otpKey)
    }
    return true
  }, [keyword, otpKey, interactiveType])

  const chartRef = useRef<HTMLDivElement | null>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  const frequencyData = useMemo(() => {
    const counts = alphabet.map(() => 0)
    for (const ch of resultText.toUpperCase()) {
      const index = ch.charCodeAt(0) - 65
      if (index >= 0 && index < alphabet.length) {
        counts[index] += 1
      }
    }
    return counts
  }, [resultText])

  useEffect(() => {
    // 暗号切り替え時に状態をリセット
    setResultText('')
    setShowChart(false)
    setFeedback('')
  }, [selectedId])

  useEffect(() => {
    if (!showChart || !chartRef.current) {
      return undefined
    }
    chartInstance.current = echarts.init(chartRef.current)
    const handleResize = () => chartInstance.current?.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.dispose()
      chartInstance.current = null
    }
  }, [showChart])

  useEffect(() => {
    if (!showChart || !chartInstance.current) return
    chartInstance.current.setOption({
      grid: { left: 24, right: 16, top: 24, bottom: 32 },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: alphabet, axisLabel: { fontSize: 12 } },
      yAxis: { type: 'value', minInterval: 1 },
      series: [
        {
          name: '頻度',
          type: 'bar',
          data: frequencyData,
          color: '#42b883',
        },
      ],
    })
  }, [showChart, frequencyData])

  const runCipher = (direction: Direction, text: string) => {
    const safeText = validateText(text)

    switch (interactiveType) {
      case 'caesar': {
        const amount = normalizeShift(shift ?? 0)
        return direction === 'encrypt'
          ? caesarEncrypt(safeText, amount)
          : caesarDecrypt(safeText, amount)
      }
      case 'vigenere': {
        if (!keywordValid) throw new Error('英字のキーワードを入力してください。')
        return direction === 'encrypt'
          ? vigenereEncrypt(safeText, keyword)
          : vigenereDecrypt(safeText, keyword)
      }
      case 'autokey': {
        if (!keywordValid) throw new Error('英字のキーワードを入力してください。')
        return direction === 'encrypt'
          ? autokeyEncrypt(safeText, keyword)
          : autokeyDecrypt(safeText, keyword)
      }
      case 'otp': {
        if (!keywordValid) throw new Error('英字の鍵を入力してください。')
        return direction === 'encrypt'
          ? otpEncrypt(safeText, otpKey)
          : otpDecrypt(safeText, otpKey)
      }
      case 'atbash':
        return atbashTransform(safeText)
      default:
        return safeText
    }
  }

  const handleAction = (direction: Direction) => {
    try {
      const source =
        direction === 'encrypt'
          ? inputText ?? ''
          : resultText.trim()
            ? resultText
            : inputText ?? ''
      setResultText(runCipher(direction, source))
      setFeedback(direction === 'encrypt' ? '暗号化が完了しました。' : '復号が完了しました。')
      setFeedbackType('info')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : '処理に失敗しました。')
      setFeedbackType('error')
    }
  }

  return (
    <main className="page classical">
      <header className="page-header">
        <p className="eyebrow" style={{ fontStyle: 'italic', letterSpacing: '0.2em' }}>— Classified Archive —</p>
        <h1 style={{ fontFamily: 'var(--font-classic)', fontWeight: 800 }}>古典暗号の解読と歴史</h1>
        <p className="lede">
          シーザー暗号からヴィジュネル暗号まで。
          数世紀にわたり情報を守り続けた「知の遺産」を、当時の息吹を感じるインターフェースで体験します。
        </p>
      </header>

      <section className="card">
        <div className="card-header">
          <h2>ハンズオン付き古典暗号</h2>
          <p>実際に暗号化・復号を試せる暗号です。選択すると下にデモが表示されます。</p>
        </div>
        <div className="catalog-grid">
          {classicalCiphers
            .filter((cipher) => cipher.interactive)
            .map((cipher) => (
              <button
                key={cipher.id}
                type="button"
                className={`catalog-card${cipher.id === selectedCipher.id ? ' active' : ''}`}
                onClick={() => setSelectedId(cipher.id)}
              >
                <div className="catalog-card-header">
                  <span className="catalog-name">{cipher.name}</span>
                </div>
                <p className="catalog-type">{cipher.type}</p>
                <p className="catalog-era">{cipher.era}</p>
              </button>
            ))}
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h2>古典暗号カタログ</h2>
          <p>解説のみの暗号です。歴史的背景と暗号方式を学べます。</p>
        </div>
        <div className="catalog-grid">
          {classicalCiphers
            .filter((cipher) => !cipher.interactive)
            .map((cipher) => (
              <button
                key={cipher.id}
                type="button"
                className={`catalog-card${cipher.id === selectedCipher.id ? ' active' : ''}`}
                onClick={() => setSelectedId(cipher.id)}
              >
                <div className="catalog-card-header">
                  <span className="catalog-name">{cipher.name}</span>
                </div>
                <p className="catalog-type">{cipher.type}</p>
                <p className="catalog-era">{cipher.era}</p>
              </button>
            ))}
        </div>
      </section>

      <div
        style={{
          textAlign: 'center',
          margin: '2rem 0 1rem',
          color: 'var(--color-primary)',
          fontWeight: 'bold',
          fontSize: '0.9rem',
        }}
      >
        選択中の暗号
      </div>

      <div
        className="selected-cipher-container"
        style={{
          background: 'rgba(79, 70, 229, 0.05)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-lg)',
          border: '1px solid var(--color-primary)',
        }}
      >
        <div
          className="selected-header"
          style={{
            textAlign: 'center',
            marginBottom: 'var(--spacing-lg)',
          }}
        >
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{selectedCipher.name}</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            {selectedCipher.era} / {selectedCipher.type}
          </p>
        </div>

        <section className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div className="card-header">
            <h3>概要と仕組み</h3>
          </div>
          <p className="details">{selectedCipher.description}</p>

          <h4>暗号化の仕組み</h4>
          <p className="details">{selectedCipher.algorithm}</p>

          <h4>特徴</h4>
          <ul>
            {selectedCipher.highlights.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          {selectedCipher.references && (
            <div className="reference-links">
              {selectedCipher.references.map((ref) => (
                <a key={ref.url} href={ref.url} target="_blank" rel="noreferrer">
                  {ref.label}
                </a>
              ))}
            </div>
          )}
        </section>

        {interactiveType && interactiveType !== 'enigma' && (
          <>
            <section className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <div className="card-header">
                <h3>🧪 実験: 入力とパラメータ</h3>
                <p>選択した暗号のルールに合わせてパラメータを設定します。</p>
              </div>

              {interactiveType === 'caesar' && (
                <div className="control-group">
                  <label htmlFor="shift">シフト量 (−25〜25)</label>
                  <div className="shift-controls">
                    <input
                      id="shift"
                      type="range"
                      min="-25"
                      max="25"
                      step="1"
                      value={shift}
                      onChange={(event) => setShift(Number(event.target.value))}
                    />
                    <input
                      className="number-input"
                      type="number"
                      min="-25"
                      max="25"
                      step="1"
                      value={shift}
                      onChange={(event) => setShift(Number(event.target.value))}
                    />
                  </div>
                </div>
              )}

              {interactiveType === 'vigenere' && (
                <div className="control-group">
                  <label htmlFor="keyword">キーワード（英字のみ）</label>
                  <input
                    id="keyword"
                    className="text-input"
                    type="text"
                    placeholder="CRYPTO"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                  />
                  <p className={`hint${keywordValid ? '' : ' error'}`}>
                    {keywordValid ? '英字のみ利用できます。' : '英字のキーワードを入力してください。'}
                  </p>
                </div>
              )}

              {interactiveType === 'autokey' && (
                <div className="control-group">
                  <label htmlFor="keyword">初期キーワード（英字のみ）</label>
                  <input
                    id="keyword"
                    className="text-input"
                    type="text"
                    placeholder="SECRET"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                  />
                  <p className={`hint${keywordValid ? '' : ' error'}`}>
                    {keywordValid
                      ? 'キーワードの後に平文自体を連結して鍵ストリームを作ります。'
                      : '英字のキーワードを入力してください。'}
                  </p>
                </div>
              )}

              {interactiveType === 'otp' && (
                <div className="control-group">
                  <label htmlFor="otp-key">ワンタイムキー（英字のみ）</label>
                  <div
                    className="row-with-button"
                    style={{ display: 'flex', gap: 'var(--spacing-sm)' }}
                  >
                    <input
                      id="otp-key"
                      className="text-input"
                      type="text"
                      placeholder="RANDOMKEY"
                      value={otpKey}
                      onChange={(event) => setOtpKey(event.target.value)}
                    />
                    <button
                      type="button"
                      className="ghost small"
                      onClick={() => {
                        const alphaCount = inputText.replace(/[^a-z]/gi, '').length
                        const generatedKey = generateOTPKey(Math.max(alphaCount, 20))
                        setOtpKey(generatedKey)
                        setFeedback(`${generatedKey.length} 文字のランダムキーを生成しました。`)
                        setFeedbackType('info')
                      }}
                    >
                      ランダム生成
                    </button>
                  </div>
                  <p className={`hint${keywordValid ? '' : ' error'}`}>
                    {keywordValid
                      ? '鍵は平文の英字数以上の長さが必要です。真にランダムで一度きり使用が原則。'
                      : '英字の鍵を入力してください。'}
                  </p>
                </div>
              )}

              {interactiveType === 'atbash' && (
                <div className="control-group">
                  <label>Atbash はキー不要</label>
                  <p className="hint">A↔Z, B↔Y のようにアルファベットを逆順に置き換えます。</p>
                </div>
              )}
            </section>

            <section className="card">
              <div className="card-header">
                <h3>テキストと結果</h3>
                <p>暗号化／復号を行い、必要であれば文字頻度グラフも確認しましょう。</p>
              </div>

              <label htmlFor="input-text">入力テキスト</label>
              <textarea
                id="input-text"
                rows={4}
                placeholder="ここに平文または暗号文を入力"
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
              />

              <div className="actions">
                <button className="primary" type="button" onClick={() => handleAction('encrypt')}>
                  暗号化
                </button>
                <button className="secondary" type="button" onClick={() => handleAction('decrypt')}>
                  復号
                </button>
                {interactiveType !== 'otp' && (
                  <button className="ghost" type="button" onClick={() => setShowChart((prev) => !prev)}>
                    {showChart ? '頻度グラフを閉じる' : '頻度表示'}
                  </button>
                )}
              </div>

              {feedback && <p className={`feedback ${feedbackType}`}>{feedback}</p>}

              <label htmlFor="result-text">結果テキスト</label>
              <textarea
                id="result-text"
                rows={4}
                placeholder="ここに結果が表示されます"
                value={resultText}
                readOnly
              />

              {showChart && (
                <div className="chart-container">
                  <p className="chart-title">文字頻度（A〜Z）</p>
                  <div ref={chartRef} className="chart" />
                </div>
              )}
            </section>
          </>
        )}

      </div>

      {interactiveType === 'enigma' && (
        <section className="card" style={{ marginBottom: 'var(--spacing-lg)', textAlign: 'center', padding: '3rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>エニグマ シミュレータ</h3>
          <p style={{ marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
            実機に近い操作感でエニグマ（I, M3, M4, Commercial, G, T）を体験できる<br />
            高忠実度シミュレータを用意しました。
          </p>
          <Link
            to="/enigma"
            className="primary"
            style={{
              display: 'inline-block',
              textDecoration: 'none',
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              borderRadius: '8px',
              background: 'var(--color-primary)',
              color: '#fff'
            }}
          >
            シミュレータを起動する
          </Link>
        </section>
      )}


      <section className="card caution">
        <h2>注意</h2>
        <ul>
          <li>ここで扱う暗号は教育・研究用です。機密データにはモダン暗号を使用してください。</li>
          <li>換字／転置／ローターという分類を意識すると、現代暗号への橋渡しが理解しやすくなります。</li>
          <li>掲載してほしい古典暗号があれば Issue へどうぞ。順次デモと解説を拡張します。</li>
        </ul>
      </section>
    </main>
  )
}
