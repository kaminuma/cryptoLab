import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import * as echarts from 'echarts'
import StepLesson, { type LessonStep } from '../components/ui/StepLesson'
import '../components/ui/StepLesson.css'
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

/* ------------------------------------------------------------------ */
/* Step 1: What are classical ciphers?                                 */
/* ------------------------------------------------------------------ */
function HistoryOverview() {
  return (
    <>
      <p>
        古典暗号とは、コンピュータ以前の時代に使われていた暗号方式の総称です。
        紀元前のシーザー暗号から 20 世紀のエニグマまで、数千年にわたる「秘密通信」の歴史があります。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>換字式暗号</h3>
          <ul>
            <li><strong>原理:</strong> 文字を別の文字に置き換える</li>
            <li><strong>例:</strong> シーザー暗号、ヴィジュネル暗号</li>
            <li><strong>弱点:</strong> 頻度分析で解読される</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>転置式暗号</h3>
          <ul>
            <li><strong>原理:</strong> 文字の並び順を入れ替える</li>
            <li><strong>例:</strong> スキュタレー、レール・フェンス</li>
            <li><strong>弱点:</strong> 文字の出現頻度は変わらない</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        古典暗号は現代の基準では安全ではありませんが、暗号理論の基礎概念（鍵空間・頻度分析・完全秘匿）を理解するうえで最高の教材です。
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Step 2: Caesar cipher                                               */
/* ------------------------------------------------------------------ */
function CaesarDemo() {
  const [inputText, setInputText] = useState('Meet me at the CryptoLab booth at noon.')
  const [resultText, setResultText] = useState('')
  const [shift, setShift] = useState(3)
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState<'info' | 'error'>('info')

  const handleAction = (direction: Direction) => {
    try {
      const text = inputText.trim()
      if (!text) throw new Error('テキストを入力してください。')
      const amount = normalizeShift(shift)
      const source = direction === 'encrypt'
        ? text
        : resultText.trim() ? resultText : text
      const result = direction === 'encrypt'
        ? caesarEncrypt(source, amount)
        : caesarDecrypt(source, amount)
      setResultText(result)
      setFeedback(direction === 'encrypt' ? '暗号化が完了しました。' : '復号が完了しました。')
      setFeedbackType('info')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : '処理に失敗しました。')
      setFeedbackType('error')
    }
  }

  return (
    <>
      <p>
        シーザー暗号は、紀元前 1 世紀にユリウス・シーザーが使ったとされる最も有名な暗号です。
        各文字を一定量ずらすだけのシンプルな仕組みですが、鍵空間はわずか <strong>26 通り</strong> しかなく、総当たりで簡単に破れます。
      </p>
      <p>
        数式: 暗号化 C = (P + shift) mod 26、復号 P = (C - shift) mod 26
      </p>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>

        <div className="control-group">
          <label htmlFor="caesar-shift">シフト量 (-25 ~ 25)</label>
          <div className="shift-controls">
            <input
              id="caesar-shift"
              type="range"
              min="-25"
              max="25"
              step="1"
              value={shift}
              onChange={(e) => setShift(Number(e.target.value))}
            />
            <input
              className="number-input"
              type="number"
              min="-25"
              max="25"
              step="1"
              value={shift}
              onChange={(e) => setShift(Number(e.target.value))}
            />
          </div>
        </div>

        <label htmlFor="caesar-input">入力テキスト</label>
        <textarea
          id="caesar-input"
          rows={3}
          placeholder="ここに平文または暗号文を入力"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        <div className="actions">
          <button className="primary" type="button" onClick={() => handleAction('encrypt')}>暗号化</button>
          <button className="secondary" type="button" onClick={() => handleAction('decrypt')}>復号</button>
        </div>

        {feedback && <p className={`feedback ${feedbackType}`}>{feedback}</p>}

        <label htmlFor="caesar-result">結果テキスト</label>
        <textarea
          id="caesar-result"
          rows={3}
          placeholder="ここに結果が表示されます"
          value={resultText}
          readOnly
        />
      </div>

      <div className="step-lesson__callout">
        シフト量を変えて暗号文がどう変化するか観察しましょう。鍵空間が 26 しかないことの意味が体感できます。
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Step 3: Vigenere cipher                                             */
/* ------------------------------------------------------------------ */
function VigenereDemo() {
  const [inputText, setInputText] = useState('Meet me at the CryptoLab booth at noon.')
  const [resultText, setResultText] = useState('')
  const [keyword, setKeyword] = useState('CRYPTO')
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState<'info' | 'error'>('info')

  const keywordValid = useMemo(() => /[a-z]/i.test(keyword), [keyword])

  const handleAction = (direction: Direction) => {
    try {
      const text = inputText.trim()
      if (!text) throw new Error('テキストを入力してください。')
      if (!keywordValid) throw new Error('英字のキーワードを入力してください。')
      const source = direction === 'encrypt'
        ? text
        : resultText.trim() ? resultText : text
      const result = direction === 'encrypt'
        ? vigenereEncrypt(source, keyword)
        : vigenereDecrypt(source, keyword)
      setResultText(result)
      setFeedback(direction === 'encrypt' ? '暗号化が完了しました。' : '復号が完了しました。')
      setFeedbackType('info')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : '処理に失敗しました。')
      setFeedbackType('error')
    }
  }

  return (
    <>
      <p>
        ヴィジュネル暗号は 16 世紀に登場した<strong>多表式換字暗号</strong>です。
        キーワードの各文字を数値化し、平文の各文字に対して異なるシフト量を適用します。
        単純な頻度分析では破れないため、長い間「解読不可能な暗号」と呼ばれました。
      </p>
      <p>
        数式: C[i] = (P[i] + K[i mod keyLen]) mod 26
      </p>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>

        <div className="control-group">
          <label htmlFor="vigenere-keyword">キーワード（英字のみ）</label>
          <input
            id="vigenere-keyword"
            className="text-input"
            type="text"
            placeholder="CRYPTO"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <p className={`hint${keywordValid ? '' : ' error'}`}>
            {keywordValid ? '英字のみ利用できます。' : '英字のキーワードを入力してください。'}
          </p>
        </div>

        <label htmlFor="vigenere-input">入力テキスト</label>
        <textarea
          id="vigenere-input"
          rows={3}
          placeholder="ここに平文または暗号文を入力"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        <div className="actions">
          <button className="primary" type="button" onClick={() => handleAction('encrypt')}>暗号化</button>
          <button className="secondary" type="button" onClick={() => handleAction('decrypt')}>復号</button>
        </div>

        {feedback && <p className={`feedback ${feedbackType}`}>{feedback}</p>}

        <label htmlFor="vigenere-result">結果テキスト</label>
        <textarea
          id="vigenere-result"
          rows={3}
          placeholder="ここに結果が表示されます"
          value={resultText}
          readOnly
        />
      </div>

      <div className="step-lesson__callout">
        キーが短いと周期性が生まれます。カシスキーテストで鍵長を推定し、各位置ごとに頻度分析すれば解読可能です。
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Step 4: Atbash & Autokey                                            */
/* ------------------------------------------------------------------ */
function OtherCiphersDemo() {
  const [cipherType, setCipherType] = useState<'atbash' | 'autokey'>('atbash')
  const [inputText, setInputText] = useState('Meet me at the CryptoLab booth at noon.')
  const [resultText, setResultText] = useState('')
  const [keyword, setKeyword] = useState('SECRET')
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState<'info' | 'error'>('info')

  const keywordValid = useMemo(
    () => cipherType === 'atbash' || /[a-z]/i.test(keyword),
    [keyword, cipherType],
  )

  const handleAction = (direction: Direction) => {
    try {
      const text = inputText.trim()
      if (!text) throw new Error('テキストを入力してください。')
      const source = direction === 'encrypt'
        ? text
        : resultText.trim() ? resultText : text

      let result: string
      if (cipherType === 'atbash') {
        result = atbashTransform(source)
      } else {
        if (!keywordValid) throw new Error('英字のキーワードを入力してください。')
        result = direction === 'encrypt'
          ? autokeyEncrypt(source, keyword)
          : autokeyDecrypt(source, keyword)
      }

      setResultText(result)
      setFeedback(direction === 'encrypt' ? '暗号化が完了しました。' : '復号が完了しました。')
      setFeedbackType('info')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : '処理に失敗しました。')
      setFeedbackType('error')
    }
  }

  return (
    <>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>アトバッシュ暗号</h3>
          <ul>
            <li><strong>時代:</strong> 古代ヘブライ</li>
            <li><strong>原理:</strong> A&#8596;Z, B&#8596;Y のように逆順置換</li>
            <li><strong>特徴:</strong> 鍵不要、暗号化 = 復号</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>オートキー暗号</h3>
          <ul>
            <li><strong>時代:</strong> 16 世紀</li>
            <li><strong>原理:</strong> 初期キーの後に平文自体を鍵として連結</li>
            <li><strong>特徴:</strong> ヴィジュネルの周期性を改善</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>

        <div className="actions">
          <button
            className={cipherType === 'atbash' ? 'primary' : 'ghost'}
            type="button"
            onClick={() => { setCipherType('atbash'); setResultText(''); setFeedback('') }}
          >
            アトバッシュ
          </button>
          <button
            className={cipherType === 'autokey' ? 'primary' : 'ghost'}
            type="button"
            onClick={() => { setCipherType('autokey'); setResultText(''); setFeedback('') }}
          >
            オートキー
          </button>
        </div>

        {cipherType === 'autokey' && (
          <div className="control-group">
            <label htmlFor="autokey-keyword">初期キーワード（英字のみ）</label>
            <input
              id="autokey-keyword"
              className="text-input"
              type="text"
              placeholder="SECRET"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <p className={`hint${keywordValid ? '' : ' error'}`}>
              {keywordValid
                ? 'キーワードの後に平文自体を連結して鍵ストリームを作ります。'
                : '英字のキーワードを入力してください。'}
            </p>
          </div>
        )}

        {cipherType === 'atbash' && (
          <div className="control-group">
            <label>Atbash はキー不要</label>
            <p className="hint">A&#8596;Z, B&#8596;Y のようにアルファベットを逆順に置き換えます。</p>
          </div>
        )}

        <label htmlFor="other-input">入力テキスト</label>
        <textarea
          id="other-input"
          rows={3}
          placeholder="ここに平文または暗号文を入力"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        <div className="actions">
          <button className="primary" type="button" onClick={() => handleAction('encrypt')}>暗号化</button>
          {cipherType !== 'atbash' && (
            <button className="secondary" type="button" onClick={() => handleAction('decrypt')}>復号</button>
          )}
        </div>

        {feedback && <p className={`feedback ${feedbackType}`}>{feedback}</p>}

        <label htmlFor="other-result">結果テキスト</label>
        <textarea
          id="other-result"
          rows={3}
          placeholder="ここに結果が表示されます"
          value={resultText}
          readOnly
        />
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Step 5: One-Time Pad                                                */
/* ------------------------------------------------------------------ */
function OTPDemo() {
  const [inputText, setInputText] = useState('Meet me at the CryptoLab booth at noon.')
  const [resultText, setResultText] = useState('')
  const [otpKey, setOtpKey] = useState('')
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState<'info' | 'error'>('info')

  const keyValid = useMemo(() => /[a-z]/i.test(otpKey), [otpKey])

  const handleAction = (direction: Direction) => {
    try {
      const text = inputText.trim()
      if (!text) throw new Error('テキストを入力してください。')
      if (!keyValid) throw new Error('英字の鍵を入力してください。')
      const source = direction === 'encrypt'
        ? text
        : resultText.trim() ? resultText : text
      const result = direction === 'encrypt'
        ? otpEncrypt(source, otpKey)
        : otpDecrypt(source, otpKey)
      setResultText(result)
      setFeedback(direction === 'encrypt' ? '暗号化が完了しました。' : '復号が完了しました。')
      setFeedbackType('info')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : '処理に失敗しました。')
      setFeedbackType('error')
    }
  }

  return (
    <>
      <p>
        ワンタイムパッド (OTP) は、Shannon の完全秘匿定理により<strong>理論上解読不可能</strong>であることが証明された唯一の暗号方式です。
        以下の条件がすべて満たされれば、暗号文から平文についての情報は一切得られません。
      </p>
      <ol>
        <li>鍵が<strong>真にランダム</strong>であること</li>
        <li>鍵長が<strong>平文以上</strong>であること</li>
        <li>鍵を<strong>一度きり</strong>しか使わないこと</li>
        <li>鍵を<strong>完全に秘匿</strong>すること</li>
      </ol>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>

        <div className="control-group">
          <label htmlFor="otp-key">ワンタイムキー（英字のみ）</label>
          <div className="row-with-button">
            <input
              id="otp-key"
              className="text-input"
              type="text"
              placeholder="RANDOMKEY"
              value={otpKey}
              onChange={(e) => setOtpKey(e.target.value)}
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
          <p className={`hint${keyValid ? '' : ' error'}`}>
            {keyValid
              ? '鍵は平文の英字数以上の長さが必要です。真にランダムで一度きり使用が原則。'
              : '英字の鍵を入力してください。'}
          </p>
        </div>

        <label htmlFor="otp-input">入力テキスト</label>
        <textarea
          id="otp-input"
          rows={3}
          placeholder="ここに平文または暗号文を入力"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        <div className="actions">
          <button className="primary" type="button" onClick={() => handleAction('encrypt')}>暗号化</button>
          <button className="secondary" type="button" onClick={() => handleAction('decrypt')}>復号</button>
        </div>

        {feedback && <p className={`feedback ${feedbackType}`}>{feedback}</p>}

        <label htmlFor="otp-result">結果テキスト</label>
        <textarea
          id="otp-result"
          rows={3}
          placeholder="ここに結果が表示されます"
          value={resultText}
          readOnly
        />
      </div>

      <div className="step-lesson__callout">
        実用上の最大の課題は「平文と同じ長さの鍵を安全に配送・管理する必要がある」ことです。米ソ冷戦期のホットラインでも使用されました。
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Step 6: Frequency analysis                                          */
/* ------------------------------------------------------------------ */
function FrequencyAnalysisDemo() {
  const [inputText, setInputText] = useState('Meet me at the CryptoLab booth at noon.')
  const [resultText, setResultText] = useState('')
  const [shift, setShift] = useState(3)
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState<'info' | 'error'>('info')

  const chartRef = useRef<HTMLDivElement | null>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)
  const [showChart, setShowChart] = useState(false)

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
    if (!showChart || !chartRef.current) return undefined
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

  const handleEncrypt = () => {
    try {
      const text = inputText.trim()
      if (!text) throw new Error('テキストを入力してください。')
      const result = caesarEncrypt(text, normalizeShift(shift))
      setResultText(result)
      setShowChart(true)
      setFeedback('暗号化しました。頻度グラフを確認しましょう。')
      setFeedbackType('info')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : '処理に失敗しました。')
      setFeedbackType('error')
    }
  }

  return (
    <>
      <p>
        古典的な換字式暗号の多くは<strong>頻度分析</strong>で破られます。
        英語では E, T, A, O, I, N などが高頻度で出現するため、暗号文の文字頻度を調べれば対応関係を推測できます。
      </p>
      <p>
        シーザー暗号の場合、頻度分布の「形」はそのまま保たれ、シフト分だけ横にずれるだけです。
        下のデモで実際にグラフを確認してみましょう。
      </p>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>

        <div className="control-group">
          <label htmlFor="freq-shift">シーザー暗号のシフト量</label>
          <div className="shift-controls">
            <input
              id="freq-shift"
              type="range"
              min="1"
              max="25"
              step="1"
              value={shift}
              onChange={(e) => setShift(Number(e.target.value))}
            />
            <input
              className="number-input"
              type="number"
              min="1"
              max="25"
              step="1"
              value={shift}
              onChange={(e) => setShift(Number(e.target.value))}
            />
          </div>
        </div>

        <label htmlFor="freq-input">平文を入力</label>
        <textarea
          id="freq-input"
          rows={3}
          placeholder="英語の文章を入力すると頻度分析が分かりやすくなります"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        <div className="actions">
          <button className="primary" type="button" onClick={handleEncrypt}>
            暗号化して頻度を表示
          </button>
        </div>

        {feedback && <p className={`feedback ${feedbackType}`}>{feedback}</p>}

        {resultText && (
          <>
            <label htmlFor="freq-result">暗号文</label>
            <textarea
              id="freq-result"
              rows={3}
              value={resultText}
              readOnly
            />
          </>
        )}

        {showChart && (
          <div className="chart-container">
            <p className="chart-title">文字頻度（A ~ Z）</p>
            <div ref={chartRef} className="chart" />
          </div>
        )}
      </div>

      <div className="step-lesson__callout">
        多表式暗号（ヴィジュネル等）は単純な頻度分析に耐えますが、カシスキーテストで鍵長を推定すれば結局は破られます。
        古典暗号で「完全に安全」なのはワンタイムパッドだけです。
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Step 7: Link to Enigma                                              */
/* ------------------------------------------------------------------ */
function EnigmaLink() {
  return (
    <>
      <p>
        古典暗号の集大成ともいえるのが<strong>エニグマ</strong>です。
        複数の回転ローター・反射板・プラグボードを組み合わせた電気機械式暗号機で、第二次世界大戦においてドイツ軍が使用しました。
      </p>
      <ul>
        <li>ローターが回転するため、同じ文字を押しても毎回異なる暗号文字が出力される</li>
        <li>反射板の構造上、ある文字が自分自身に暗号化されることはない（構造的弱点）</li>
        <li>ブレッチリーパークの Alan Turing らが Bombe マシンで解読に成功し、連合国の勝利に貢献した</li>
      </ul>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">SIMULATOR</span>
        <p>
          実機に近い操作感でエニグマ（I, M3, M4, Commercial, G, T）を体験できる高忠実度シミュレータを用意しています。
        </p>
        <div className="actions">
          <Link
            to="/enigma"
            className="primary"
          >
            エニグマ シミュレータを起動する
          </Link>
        </div>
      </div>

      <div className="step-lesson__callout">
        換字・転置・ローターという分類を意識すると、現代暗号への橋渡しが理解しやすくなります。
        ここで扱う暗号は教育・研究用です。機密データにはモダン暗号を使用してください。
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Main page component                                                 */
/* ------------------------------------------------------------------ */
export default function ClassicalPage() {
  useEffect(() => {
    document.title = '古典暗号 - CryptoLab'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const steps: LessonStep[] = [
    {
      title: '古典暗号とは？ — 歴史の概観',
      content: <HistoryOverview />,
      quiz: {
        question: '古典暗号の 2 大分類はどれ？',
        options: [
          { label: '公開鍵暗号と共通鍵暗号' },
          { label: '換字式暗号と転置式暗号', correct: true },
          { label: 'ブロック暗号とストリーム暗号' },
          { label: 'ハッシュ関数とデジタル署名' },
        ],
        explanation:
          '正解！古典暗号は「文字を別の文字に置き換える換字式」と「文字の並び順を入れ替える転置式」に大別されます。現代暗号の公開鍵/共通鍵やブロック/ストリームとは異なる分類です。',
      },
    },
    {
      title: 'シーザー暗号 — 最古の換字式暗号',
      content: <CaesarDemo />,
      quiz: {
        question: 'シーザー暗号の鍵空間（可能なシフト量）はいくつ？',
        options: [
          { label: '10 通り' },
          { label: '26 通り', correct: true },
          { label: '256 通り' },
          { label: '無限' },
        ],
        explanation:
          '正解！シフト量は 0 ~ 25 の 26 通りしかないため、すべてのパターンを試す総当たり攻撃で簡単に破れます。',
      },
    },
    {
      title: 'ヴィジュネル暗号 — 多表式換字',
      content: <VigenereDemo />,
      quiz: {
        question: 'ヴィジュネル暗号が単純な頻度分析に強い理由は？',
        options: [
          { label: '鍵が非常に長いから' },
          { label: '文字ごとに異なるシフト量を使うから', correct: true },
          { label: '転置式暗号だから' },
          { label: '鍵が秘密だから' },
        ],
        explanation:
          '正解！キーワードの各文字が異なるシフト量を与えるため、同じ平文の文字でも異なる暗号文になります。ただしキーワードが繰り返されるため、鍵長を推定されると位置ごとに頻度分析が可能です。',
      },
    },
    {
      title: 'アトバッシュ暗号 & オートキー暗号',
      content: <OtherCiphersDemo />,
    },
    {
      title: 'ワンタイムパッド — 完全秘匿',
      content: <OTPDemo />,
      quiz: {
        question: 'ワンタイムパッドが「完全に安全」であるための条件でないものは？',
        options: [
          { label: '鍵が真にランダムであること' },
          { label: '鍵長が平文以上であること' },
          { label: '鍵を複数回使用すること', correct: true },
          { label: '鍵を完全に秘匿すること' },
        ],
        explanation:
          '正解！鍵を複数回使用すると完全秘匿性が破れます。「一度きり（One-Time）」がこの暗号の名前の由来であり、最も重要な条件の一つです。',
      },
    },
    {
      title: '頻度分析 — なぜ古典暗号は破られるのか',
      content: <FrequencyAnalysisDemo />,
      quiz: {
        question: '頻度分析による攻撃が成立する根本的な理由は？',
        options: [
          { label: '暗号アルゴリズムが公開されているから' },
          { label: '自然言語の文字出現頻度に偏りがあるから', correct: true },
          { label: 'コンピュータの計算速度が速いから' },
          { label: '鍵が短いから' },
        ],
        explanation:
          '正解！英語では E が約 13% を占めるなど、自然言語の文字頻度には大きな偏りがあります。換字式暗号はこの統計的特徴を保存してしまうため、十分な量の暗号文があれば対応関係を推測できます。',
      },
    },
    {
      title: 'エニグマへ — 古典暗号の集大成',
      content: <EnigmaLink />,
    },
  ]

  return (
    <main className="page classical">
      <StepLesson
        title="古典暗号の解読と歴史"
        steps={steps}
      />
    </main>
  )
}
