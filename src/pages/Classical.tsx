import { useEffect, useMemo, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { classicalCiphers } from '@/data/classical'
import { caesarEncrypt, caesarDecrypt } from '@/lib/classical/caesar'
import { vigenereEncrypt, vigenereDecrypt } from '@/lib/classical/vigenere'
import { atbashTransform } from '@/lib/classical/atbash'

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
  }, [])
  const selectedCipher = classicalCiphers.find((cipher) => cipher.id === selectedId) ?? classicalCiphers[0]
  const interactiveType = selectedCipher.interactive ?? null

  const [inputText, setInputText] = useState('Meet me at the CryptoLab booth at noon.')
  const [resultText, setResultText] = useState('')
  const [shift, setShift] = useState(3)
  const [keyword, setKeyword] = useState('CRYPTO')
  const [showChart, setShowChart] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState<'info' | 'error'>('info')

  const keywordValid = useMemo(
    () => (interactiveType === 'vigenere' ? /[a-z]/i.test(keyword) : true),
    [keyword, interactiveType],
  )

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
    if (!interactiveType) {
      setResultText('')
      setShowChart(false)
    }
    setFeedback('')
  }, [interactiveType, selectedId])

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
        <p className="eyebrow">Classical Archive</p>
        <h1>時代ごとの暗号を選び、背景と挙動を同時に学ぶ。</h1>
        <p className="lede">換字式・転置式・ローター式などをカタログ化し、Demo 対応のものはその場で暗号化フローを確認できます。</p>
      </header>

      <section className="card">
        <div className="card-header">
          <h2>古典暗号カタログ</h2>
          <p>気になる暗号を選ぶと、下に詳細とデモ（対応している場合）が表示されます。</p>
        </div>
        <div className="catalog-grid">
          {classicalCiphers.map((cipher) => (
            <button
              key={cipher.id}
              type="button"
              className={`catalog-card${cipher.id === selectedCipher.id ? ' active' : ''}`}
              onClick={() => setSelectedId(cipher.id)}
            >
              <div className="catalog-card-header">
                <span className="catalog-name">{cipher.name}</span>
                {cipher.interactive && <span className="catalog-badge">Demo</span>}
              </div>
              <p className="catalog-type">{cipher.type}</p>
              <p className="catalog-era">{cipher.era}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <h2>{selectedCipher.name}</h2>
          <p>{selectedCipher.era} / {selectedCipher.type}</p>
        </div>
        <p className="details">{selectedCipher.description}</p>
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

      {interactiveType && (
        <>
          <section className="card">
            <div className="card-header">
              <h2>入力とパラメータ</h2>
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

            {interactiveType === 'atbash' && (
              <div className="control-group">
                <label>Atbash はキー不要</label>
                <p className="hint">A↔Z, B↔Y のようにアルファベットを逆順に置き換えます。</p>
              </div>
            )}
          </section>

          <section className="card">
            <div className="card-header">
              <h2>テキストと結果</h2>
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
              <button className="ghost" type="button" onClick={() => setShowChart((prev) => !prev)}>
                {showChart ? '頻度グラフを閉じる' : '頻度表示'}
              </button>
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
