import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import * as echarts from 'echarts'
import StepLesson, { type LessonStep } from '../components/ui/StepLesson'
import '../components/ui/StepLesson.css'
import { usePageMeta } from '../hooks/usePageMeta'
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

/* ================================================================== */
/* Helper: Rail Fence cipher (pure function)                           */
/* ================================================================== */
function railFenceEncrypt(text: string, rails: number): string {
  if (rails < 2) return text
  const fence: string[][] = Array.from({ length: rails }, () => [])
  let rail = 0
  let direction = 1
  for (const ch of text) {
    fence[rail].push(ch)
    if (rail === 0) direction = 1
    else if (rail === rails - 1) direction = -1
    rail += direction
  }
  return fence.flat().join('')
}

function railFenceDecrypt(cipher: string, rails: number): string {
  if (rails < 2) return cipher
  const n = cipher.length
  // Build the zigzag pattern to determine lengths per rail
  const pattern: number[] = new Array(n)
  let rail = 0
  let direction = 1
  for (let i = 0; i < n; i++) {
    pattern[i] = rail
    if (rail === 0) direction = 1
    else if (rail === rails - 1) direction = -1
    rail += direction
  }
  // Fill the fence
  const fence: string[] = new Array(n)
  let idx = 0
  for (let r = 0; r < rails; r++) {
    for (let i = 0; i < n; i++) {
      if (pattern[i] === r) {
        fence[i] = cipher[idx++]
      }
    }
  }
  return fence.join('')
}

/* ================================================================== */
/* Helper: Kasiski test (find repeated trigrams & compute GCD)         */
/* ================================================================== */
function findRepeatedTrigrams(text: string): { trigram: string; positions: number[]; distances: number[] }[] {
  const upper = text.toUpperCase().replace(/[^A-Z]/g, '')
  const map = new Map<string, number[]>()
  for (let i = 0; i <= upper.length - 3; i++) {
    const tri = upper.substring(i, i + 3)
    const arr = map.get(tri) ?? []
    arr.push(i)
    map.set(tri, arr)
  }
  const results: { trigram: string; positions: number[]; distances: number[] }[] = []
  for (const [trigram, positions] of map) {
    if (positions.length >= 2) {
      const distances: number[] = []
      for (let i = 1; i < positions.length; i++) {
        distances.push(positions[i] - positions[0])
      }
      results.push({ trigram, positions, distances })
    }
  }
  // Sort by most occurrences
  results.sort((a, b) => b.positions.length - a.positions.length)
  return results.slice(0, 8)
}

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    ;[a, b] = [b, a % b]
  }
  return a
}

function gcdOfArray(arr: number[]): number {
  return arr.reduce((acc, val) => gcd(acc, val), 0)
}

/* ================================================================== */
/* Step 1: 古典暗号とは？ — 歴史の概観                                   */
/* たとえ話 → 用語定義 → Before/After → ここがポイント                     */
/* ================================================================== */
function HistoryOverview() {
  return (
    <>
      <p>
        あなたが戦場の将軍だとしましょう。前線の味方に「明朝、東の丘から攻める」と伝えたい。
        しかし伝令が敵に捕まれば作戦は筒抜けです。
        そこで<strong>メッセージを読めなくする工夫</strong> — すなわち暗号が生まれました。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: 古典暗号（Classical Cipher）</strong><br />
        コンピュータ以前の時代に、手作業や簡単な機械で行われていた暗号方式の総称。
        紀元前のシーザー暗号から 20 世紀のエニグマまで、数千年にわたる「秘密通信」の歴史がある。
        現代暗号との根本的な違いは、<strong>数学的な安全性証明を持たない</strong>点にある。
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>Before: 暗号なし</h3>
          <ul>
            <li>メッセージは平文のまま送信</li>
            <li>伝令が捕まれば内容が漏洩</li>
            <li>通信路の安全性にすべて依存</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>After: 暗号あり</h3>
          <ul>
            <li>メッセージは暗号化されて送信</li>
            <li>伝令が捕まっても内容は保護</li>
            <li>安全性は<strong>鍵の秘密性</strong>に依存</li>
          </ul>
        </div>
      </div>

      <p>
        古典暗号は現代の基準では安全ではありませんが、暗号理論の基礎概念
        （鍵空間・頻度分析・完全秘匿）を理解するうえで最高の教材です。
        このレッスンでは、暗号の分類体系から始めて、具体的な暗号方式を手を動かしながら学び、
        最終的に「なぜ古典暗号では不十分なのか」を理解するところまで進みます。
      </p>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong>
        古典暗号を学ぶ真の価値は「なぜ破られたか」を理解することにあります。
        すべての失敗パターンが、現代暗号の設計原則を生み出す礎になりました。
      </div>
    </>
  )
}

/* ================================================================== */
/* Step 2: 換字式暗号と転置式暗号の分類体系                                */
/* ================================================================== */
function CipherClassification() {
  return (
    <>
      <p>
        図書館の本を隠す方法を考えてみてください。
        方法 A は「本のカバーを別の本のカバーに付け替える」こと。
        方法 B は「本の置き場所をバラバラに入れ替える」こと。
        暗号の世界でも、この 2 つのアプローチがそのまま基本分類になります。
      </p>

      <div className="step-lesson__callout">
        <strong>用語の整理</strong><br />
        <strong>換字式暗号（Substitution Cipher）:</strong> 文字を別の文字に「置き換える」暗号。文字の位置は変わらないが、文字そのものが変わる。<br />
        <strong>転置式暗号（Transposition Cipher）:</strong> 文字の「並び順を入れ替える」暗号。文字そのものは変わらないが、出現位置が変わる。
      </div>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: '2.4', textAlign: 'left', display: 'inline-block' }}>
          <div style={{ marginBottom: 'var(--spacing-md)' }}>
            <strong>暗号の分類体系</strong>
          </div>
          <div>古典暗号</div>
          <div>&ensp;├─ 換字式暗号（Substitution）</div>
          <div>&ensp;│&ensp;&ensp;├─ 単一換字式（Monoalphabetic）</div>
          <div>&ensp;│&ensp;&ensp;│&ensp;&ensp;├─ シーザー暗号（シフト暗号）</div>
          <div>&ensp;│&ensp;&ensp;│&ensp;&ensp;├─ アトバッシュ暗号</div>
          <div>&ensp;│&ensp;&ensp;│&ensp;&ensp;└─ 一般単一換字暗号</div>
          <div>&ensp;│&ensp;&ensp;└─ 多表式（Polyalphabetic）</div>
          <div>&ensp;│&ensp;&ensp;&ensp;&ensp;&ensp;├─ ヴィジュネル暗号</div>
          <div>&ensp;│&ensp;&ensp;&ensp;&ensp;&ensp;├─ オートキー暗号</div>
          <div>&ensp;│&ensp;&ensp;&ensp;&ensp;&ensp;└─ エニグマ</div>
          <div>&ensp;├─ 転置式暗号（Transposition）</div>
          <div>&ensp;│&ensp;&ensp;├─ スキュタレー暗号</div>
          <div>&ensp;│&ensp;&ensp;├─ レール・フェンス暗号</div>
          <div>&ensp;│&ensp;&ensp;└─ カラム転置暗号</div>
          <div>&ensp;└─ 特殊</div>
          <div>&ensp;&ensp;&ensp;&ensp;└─ ワンタイムパッド（完全秘匿）</div>
        </div>
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>換字式の暗号学的特性</h3>
          <ul>
            <li><strong>不変量:</strong> 文字の出現位置は保存される</li>
            <li><strong>変化:</strong> 文字の「種類」が変わる</li>
            <li><strong>弱点:</strong> 頻度分析で統計的パターンが漏洩</li>
            <li><strong>鍵空間:</strong> 一般単一換字なら 26! ≈ 4 x 10^26</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>転置式の暗号学的特性</h3>
          <ul>
            <li><strong>不変量:</strong> 文字の出現頻度は保存される</li>
            <li><strong>変化:</strong> 文字の「位置」が変わる</li>
            <li><strong>弱点:</strong> 頻度分布がそのまま残る</li>
            <li><strong>鍵空間:</strong> 順列の総数（ブロック長 n なら n!）</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong>
        換字式と転置式にはそれぞれ固有の弱点があります。これは暗号解読者にとっての「手がかり」です。
        現代暗号（AES など）は、この 2 つを巧みに組み合わせることで両方の弱点を打ち消しています。
        Shannon はこれを<strong>混乱（Confusion）</strong>と<strong>拡散（Diffusion）</strong>と名付けました
         — レッスンの最後で再び登場します。
      </div>
    </>
  )
}

/* ================================================================== */
/* Step 3: シーザー暗号 — 最古の換字式暗号                                 */
/* ================================================================== */
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
        紀元前 1 世紀、ユリウス・シーザーは軍事通信で「各文字を 3 つずらす」という単純な暗号を使いました。
        たとえば A は D に、B は E に置き換わります。
        これは<strong>単一換字式暗号</strong>の最もシンプルな形です。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: 鍵空間（Key Space）</strong><br />
        暗号で使いうる鍵のすべてのパターンの集合。
        シーザー暗号ではシフト量 0〜25 の <strong>26 通り</strong>しかなく、
        これは総当たり攻撃（Brute-force attack）に対してまったく無力であることを意味する。
      </div>

      <p>
        数式で表すと、暗号化は <code>C = (P + shift) mod 26</code>、
        復号は <code>P = (C - shift) mod 26</code> です。
        下のデモでシフト量を変えて、暗号文がどう変化するか観察しましょう。
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
          <button className="step-lesson__demo-btn step-lesson__demo-btn--primary" type="button" onClick={() => handleAction('encrypt')}>暗号化</button>
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
        <strong>ここがポイント:</strong>
        シーザー暗号の教訓は「鍵空間が小さすぎる暗号は安全ではない」ということです。
        たった 26 回試すだけですべてのパターンを網羅できます。
        これは暗号設計における最も基本的な要件 — <strong>十分な鍵空間</strong> — を示す好例です。
      </div>
    </>
  )
}

/* ================================================================== */
/* Step 4: 転置式暗号 — レール・フェンスのインタラクティブデモ              */
/* ================================================================== */
function TranspositionDemo() {
  const [inputText, setInputText] = useState('WEAREDISCOVEREDRUNATONCE')
  const [rails, setRails] = useState(3)
  const [resultText, setResultText] = useState('')
  const [decryptedText, setDecryptedText] = useState('')
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState<'info' | 'error'>('info')

  // Build the zigzag visualization
  const zigzagRows = useMemo(() => {
    const text = inputText.toUpperCase().replace(/[^A-Z]/g, '')
    if (!text || rails < 2) return []
    const rows: string[][] = Array.from({ length: rails }, () =>
      Array.from({ length: text.length }, () => '.')
    )
    let rail = 0
    let direction = 1
    for (let i = 0; i < text.length; i++) {
      rows[rail][i] = text[i]
      if (rail === 0) direction = 1
      else if (rail === rails - 1) direction = -1
      rail += direction
    }
    return rows
  }, [inputText, rails])

  const handleEncrypt = () => {
    try {
      const text = inputText.toUpperCase().replace(/[^A-Z]/g, '')
      if (!text) throw new Error('英字を入力してください。')
      const encrypted = railFenceEncrypt(text, rails)
      setResultText(encrypted)
      setDecryptedText('')
      setFeedback(`${rails} 段のレール・フェンスで暗号化しました。`)
      setFeedbackType('info')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : '処理に失敗しました。')
      setFeedbackType('error')
    }
  }

  const handleDecrypt = () => {
    try {
      if (!resultText) throw new Error('先に暗号化を実行してください。')
      const decrypted = railFenceDecrypt(resultText, rails)
      setDecryptedText(decrypted)
      setFeedback('復号しました。元の平文と一致していることを確認できます。')
      setFeedbackType('info')
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : '処理に失敗しました。')
      setFeedbackType('error')
    }
  }

  return (
    <>
      <p>
        古代ギリシャのスパルタ人は、棒（スキュタレー）に革帯を巻きつけて文字を書くことで暗号通信を行いました。
        同じ太さの棒に巻き直さなければ文字が並ばず、読めないという仕組みです。
        これが<strong>転置式暗号</strong>の最古の例です。
      </p>

      <p>
        レール・フェンス暗号はこの転置式の代表例で、文字をジグザグに並べてから行ごとに読み出します。
        文字自体は変わらず、<strong>並び順だけが変わる</strong>点が換字式との根本的な違いです。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: 転置式暗号（Transposition Cipher）</strong><br />
        平文の文字の出現順序を一定の規則で並べ替える暗号。文字の種類（頻度）は保存されるため、
        頻度分析だけでは換字式か転置式かを判別する手がかりになる。
      </div>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>

        <div className="control-group">
          <label htmlFor="rail-count">レールの段数 (2 ~ 8)</label>
          <div className="shift-controls">
            <input
              id="rail-count"
              type="range"
              min="2"
              max="8"
              step="1"
              value={rails}
              onChange={(e) => { setRails(Number(e.target.value)); setResultText(''); setDecryptedText('') }}
            />
            <input
              className="number-input"
              type="number"
              min="2"
              max="8"
              step="1"
              value={rails}
              onChange={(e) => { setRails(Number(e.target.value)); setResultText(''); setDecryptedText('') }}
            />
          </div>
        </div>

        <label htmlFor="rail-input">平文（英字のみ使用）</label>
        <textarea
          id="rail-input"
          rows={2}
          placeholder="英字を入力してください"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />

        {/* Zigzag visualization */}
        {zigzagRows.length > 0 && (
          <div style={{ margin: 'var(--spacing-md) 0', overflowX: 'auto' }}>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 'var(--spacing-xs)' }}>
              ジグザグ配置 ({rails} 段):
            </p>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: '1.6', whiteSpace: 'pre' }}>
              {zigzagRows.map((row, r) => (
                <div key={r}>
                  {row.map((ch, c) => (
                    <span
                      key={c}
                      style={{
                        display: 'inline-block',
                        width: '1.4em',
                        textAlign: 'center',
                        color: ch === '.' ? 'var(--color-text-subtle)' : 'var(--color-primary)',
                        fontWeight: ch === '.' ? 400 : 700,
                      }}
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="actions">
          <button className="step-lesson__demo-btn step-lesson__demo-btn--primary" type="button" onClick={handleEncrypt}>暗号化</button>
          <button className="secondary" type="button" onClick={handleDecrypt}>復号</button>
        </div>

        {feedback && <p className={`feedback ${feedbackType}`}>{feedback}</p>}

        {resultText && (
          <>
            <label>暗号文（各レールを左から右へ読み出し）</label>
            <div className="step-lesson__demo-result">{resultText}</div>
          </>
        )}

        {decryptedText && (
          <>
            <label>復号結果</label>
            <div className="step-lesson__demo-result">{decryptedText}</div>
          </>
        )}
      </div>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong>
        段数を変えてジグザグのパターンが変わる様子を観察してください。
        転置式暗号は「文字の頻度がそのまま残る」ため、暗号文の頻度分布が自然言語のまま
        であれば「これは転置式だ」と見破れます。換字式と異なる攻撃手法が必要になります。
      </div>
    </>
  )
}

/* ================================================================== */
/* Step 5: ヴィジュネル暗号 — 多表式換字                                  */
/* ================================================================== */
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
        シーザー暗号が「一つのシフト量で全文字を置き換える」のに対し、
        ヴィジュネル暗号は<strong>キーワードの各文字</strong>を数値化し、平文の各文字に対して
        <strong>異なるシフト量</strong>を適用します。
        16 世紀に登場し、約 300 年間「解読不可能な暗号 (le chiffre indéchiffrable)」と呼ばれました。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: 多表式換字暗号（Polyalphabetic Substitution）</strong><br />
        平文の位置ごとに異なる換字表を使う暗号方式。
        単一換字式の弱点（頻度分布がそのまま残る）を克服しようとする設計。
        ただしキーワードが繰り返される限り、<strong>周期性</strong>という新たな弱点が生まれる。
      </div>

      <p>
        数式: <code>C[i] = (P[i] + K[i mod keyLen]) mod 26</code>
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
          <button className="step-lesson__demo-btn step-lesson__demo-btn--primary" type="button" onClick={() => handleAction('encrypt')}>暗号化</button>
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
        <strong>ここがポイント:</strong>
        キーワード「CRYPTO」（6 文字）を使うと、平文は 6 文字ごとに同じシフトパターンで暗号化されます。
        この<strong>周期性</strong>こそがヴィジュネル暗号の致命的な弱点です。
        次のステップでは、この周期を検出する「カシスキーテスト」を詳しく見ていきます。
      </div>
    </>
  )
}

/* ================================================================== */
/* Step 6: カシスキーテスト — 鍵長を推定する手順                           */
/* ================================================================== */
function KasiskiTestDemo() {
  const defaultCipher = 'OIIAWEVCHQCEWHRGPQSXDQVXIQQCEMHQOILRGULRVQHRTOHVHYOJTVRMIQOIIAWEVCHXS'
  const [cipherText, setCipherText] = useState(defaultCipher)
  const [analysisResult, setAnalysisResult] = useState<{
    trigrams: { trigram: string; positions: number[]; distances: number[] }[]
    allDistances: number[]
    estimatedKeyLength: number
  } | null>(null)

  const handleAnalyze = () => {
    const text = cipherText.toUpperCase().replace(/[^A-Z]/g, '')
    if (text.length < 10) {
      setAnalysisResult(null)
      return
    }
    const trigrams = findRepeatedTrigrams(text)
    const allDistances = trigrams.flatMap(t => t.distances)
    const estimatedKeyLength = allDistances.length > 0 ? gcdOfArray(allDistances) : 0
    setAnalysisResult({ trigrams, allDistances, estimatedKeyLength })
  }

  return (
    <>
      <p>
        ヴィジュネル暗号は長い間「解読不可能」と信じられていましたが、
        1863 年にフリードリヒ・カシスキーが周期性を突く手法を発表しました。
        カシスキーテストの手順は、以下の 3 ステップで構成されます。
      </p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: '2.4', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>カシスキーテストの 3 ステップ</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            <strong>Step A:</strong> 暗号文中で繰り返し出現する文字列（3 文字以上）を探す
          </div>
          <div>
            <strong>Step B:</strong> 各繰り返しの出現位置間の「距離」を計算する
          </div>
          <div>
            <strong>Step C:</strong> すべての距離の最大公約数（GCD）を求める → これが鍵長の候補
          </div>
        </div>
      </div>

      <p>
        <strong>なぜこれが機能するのか？</strong>
        同じ平文の部分列が、キーワードの同じ位置に重なると、暗号文でも同じ文字列が現れます。
        その「距離」はキーワード長の倍数になるはずなので、距離の GCD がキーワード長を示唆します。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>Before: 鍵長が不明</h3>
          <ul>
            <li>暗号文は一見ランダム</li>
            <li>頻度分析が効かない</li>
            <li>「解読不可能」と信じられていた</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>After: 鍵長を推定</h3>
          <ul>
            <li>鍵長 n がわかれば n 個のグループに分割</li>
            <li>各グループは単一換字暗号と同じ</li>
            <li>各グループに頻度分析を適用して解読</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>

        <label htmlFor="kasiski-input">暗号文を入力（ヴィジュネル暗号文を貼り付け）</label>
        <textarea
          id="kasiski-input"
          rows={4}
          placeholder="ヴィジュネル暗号文を入力してください"
          value={cipherText}
          onChange={(e) => setCipherText(e.target.value)}
        />

        <div className="actions">
          <button className="step-lesson__demo-btn step-lesson__demo-btn--primary" type="button" onClick={handleAnalyze}>
            カシスキーテストを実行
          </button>
        </div>

        {analysisResult && (
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <p style={{ fontWeight: 700, marginBottom: 'var(--spacing-sm)' }}>
              繰り返しトリグラム:
            </p>
            {analysisResult.trigrams.length === 0 ? (
              <p style={{ color: 'var(--color-text-subtle)' }}>
                繰り返しパターンが見つかりませんでした。より長い暗号文を試してください。
              </p>
            ) : (
              <>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  lineHeight: '1.8',
                  overflowX: 'auto',
                }}>
                  {analysisResult.trigrams.slice(0, 6).map((t, i) => (
                    <div key={i}>
                      <strong>{t.trigram}</strong>: 位置 [{t.positions.join(', ')}] → 距離 [{t.distances.join(', ')}]
                    </div>
                  ))}
                </div>

                <div style={{
                  marginTop: 'var(--spacing-md)',
                  padding: 'var(--spacing-md)',
                  background: 'color-mix(in srgb, var(--color-success) 8%, transparent)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                }}>
                  <div>全距離: [{analysisResult.allDistances.join(', ')}]</div>
                  <div style={{ marginTop: 'var(--spacing-xs)' }}>
                    <strong>GCD = {analysisResult.estimatedKeyLength}</strong>
                    {analysisResult.estimatedKeyLength > 0 && (
                      <span> → 推定鍵長: <strong>{analysisResult.estimatedKeyLength}</strong></span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong>
        カシスキーテストは「繰り返しは鍵長の周期と一致する」という洞察に基づいています。
        鍵長さえわかれば、多表式暗号は実質的に複数の単一換字暗号に分解され、
        各グループごとに頻度分析で個別に解読できます。
        300 年間「解読不可能」と呼ばれた暗号が、わずか 3 ステップで攻略可能になったのです。
      </div>
    </>
  )
}

/* ================================================================== */
/* Step 7: アトバッシュ暗号 & オートキー暗号                               */
/* ================================================================== */
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
      <p>
        換字式暗号にはさまざまなバリエーションがあります。
        ここでは 2 つの重要な暗号を比較します。
        アトバッシュは「鍵のない暗号」の極端な例、オートキーは「周期性をなくす試み」の先駆けです。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>アトバッシュ暗号</h3>
          <ul>
            <li><strong>時代:</strong> 古代ヘブライ（旧約聖書に登場）</li>
            <li><strong>原理:</strong> A&#8596;Z, B&#8596;Y のように逆順置換</li>
            <li><strong>特徴:</strong> 鍵不要、暗号化 = 復号（対合写像）</li>
            <li><strong>弱点:</strong> 鍵空間が 1 — 手法が判明すれば即座に解読</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>オートキー暗号</h3>
          <ul>
            <li><strong>時代:</strong> 16 世紀（Vigenere 自身が考案）</li>
            <li><strong>原理:</strong> 初期キーの後に平文自体を鍵として連結</li>
            <li><strong>特徴:</strong> ヴィジュネルの周期性を改善</li>
            <li><strong>弱点:</strong> 鍵ストリームに平文が含まれるため統計的攻撃に弱い</li>
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
          <button className="step-lesson__demo-btn step-lesson__demo-btn--primary" type="button" onClick={() => handleAction('encrypt')}>暗号化</button>
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

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong>
        アトバッシュは「鍵空間 = 1」という極端な例で、暗号方式が知られた瞬間に安全性が崩壊します。
        オートキーは周期性の排除を試みましたが、鍵ストリームに平文が含まれるため完全な解決には至りませんでした。
        「キーワードの周期性」と「鍵の独立性」が古典暗号の本質的な課題であることが見えてきます。
      </div>
    </>
  )
}

/* ================================================================== */
/* Step 8: ワンタイムパッド — 完全秘匿とその限界                           */
/* ================================================================== */
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
        もしキーワードを「平文と同じ長さ」にし、かつ「完全にランダム」で「一度きり」しか使わなかったら？
        — それがワンタイムパッド（OTP）です。
        1949 年に Claude Shannon が情報理論を用いて<strong>完全秘匿性（Perfect Secrecy）</strong>
        を証明した、理論上唯一の「絶対に解読できない」暗号方式です。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: 完全秘匿性（Perfect Secrecy）</strong><br />
        暗号文を観察しても、平文について<strong>一切の情報が得られない</strong>性質。
        数学的には、任意の平文 m と暗号文 c に対して P(M=m | C=c) = P(M=m) が成立する。
        つまり「暗号文を見ても見なくても、平文の確率分布は変わらない」。
      </div>

      <p>
        完全秘匿性が成立するための 4 つの条件:
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
          <button className="step-lesson__demo-btn step-lesson__demo-btn--primary" type="button" onClick={() => handleAction('encrypt')}>暗号化</button>
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
        <strong>ここがポイント:</strong>
        OTP は理論上「完璧」ですが、実用上は「平文と同じ長さの鍵を安全に配送・管理する」
        というほぼ不可能な課題を伴います。米ソ冷戦期のホットラインでは実際に使用されましたが、
        日常の暗号通信には適しません。
        この「理論と実用のギャップ」が、現代暗号（計算量的安全性に基づく暗号）を必要とする理由です。
      </div>
    </>
  )
}

/* ================================================================== */
/* Step 9: 頻度分析 — なぜ古典暗号は破られるのか                           */
/* ================================================================== */
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
          color: 'var(--color-success)',
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
        図書館の蔵書を「別の棚に隠す」のはカモフラージュですが、
        各ジャンルの本の冊数を数えれば元の配置を推測できます。
        暗号における頻度分析はまさにこれと同じ原理です。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: 頻度分析（Frequency Analysis）</strong><br />
        自然言語の文字出現頻度の偏り（英語では E ≈ 13%, T ≈ 9%, A ≈ 8% など）を利用して、
        換字暗号の対応関係を推測する暗号解読法。
        9 世紀のアラブの学者アル・キンディが最初に体系化した。
      </div>

      <p>
        シーザー暗号の場合、頻度分布の「形」はそのまま保たれ、シフト分だけ横にずれるだけです。
        つまり暗号文中で最も多い文字が E に対応すると推測できます。
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
          <button className="step-lesson__demo-btn step-lesson__demo-btn--primary" type="button" onClick={handleEncrypt}>
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
        <strong>ここがポイント:</strong>
        頻度分析が効く根本原因は、自然言語の統計的特性を暗号が保存してしまうことです。
        多表式暗号（ヴィジュネル等）は単純な頻度分析に耐えますが、カシスキーテストで鍵長を推定すれば
        結局は破られます。古典暗号で「完全に安全」なのはワンタイムパッドだけです。
      </div>
    </>
  )
}

/* ================================================================== */
/* Step 10: ケルクホフスの原則とエニグマ — 古典暗号から現代暗号への橋渡し     */
/* ================================================================== */
function BridgeToModern() {
  return (
    <>
      <p>
        ここまでの学習を振り返ると、古典暗号のほとんどは「手法がバレたら終わり」でした。
        19 世紀、オランダの暗号学者 Auguste Kerckhoffs はこの問題を正面から取り上げ、
        暗号設計の大原則を提唱しました。
      </p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', lineHeight: '2', textAlign: 'center' }}>
          <strong>ケルクホフスの原則</strong><br />
          「暗号システムの安全性は、<br />
          鍵の秘密性<strong>のみ</strong>に依存すべきである」
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>用語: ケルクホフスの原則（Kerckhoffs's Principle）</strong><br />
        暗号アルゴリズムは公開されても安全でなければならない。
        安全性を「手法の秘密性」に頼る設計（Security by Obscurity）は脆弱である。
        現代暗号（AES、RSA 等）はすべてこの原則に従い、アルゴリズムを完全公開している。
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>古典暗号の限界</h3>
          <ul>
            <li>シーザー: 鍵空間が小さすぎる（26 通り）</li>
            <li>ヴィジュネル: 鍵の周期性が弱点</li>
            <li>アトバッシュ: 手法がバレたら終わり</li>
            <li>OTP: 鍵配送が非現実的</li>
            <li>共通の問題: <strong>数学的な安全性証明がない</strong></li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>現代暗号が解決したこと</h3>
          <ul>
            <li>十分に広い鍵空間（AES-128: 2^128 通り）</li>
            <li>Shannon の混乱と拡散を両立</li>
            <li>アルゴリズム公開でも安全</li>
            <li>公開鍵暗号で鍵配送問題を解決</li>
            <li>計算量的安全性に基づく設計</li>
          </ul>
        </div>
      </div>

      <p>
        Claude Shannon は 1949 年の論文 "Communication Theory of Secrecy Systems" で、
        安全な暗号の設計に必要な 2 つの性質を定義しました。
      </p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: '2.4', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>Shannon の 2 原則</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            <strong>混乱（Confusion）:</strong> 暗号文と鍵の関係を複雑にする
          </div>
          <div>&ensp;→ 換字式暗号はこれを（不完全ながら）実現</div>
          <div style={{ marginTop: 'var(--spacing-xs)' }}>
            <strong>拡散（Diffusion）:</strong> 平文の統計的特性を暗号文全体に分散させる
          </div>
          <div>&ensp;→ 転置式暗号はこれを（不完全ながら）実現</div>
          <div style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-text-subtle)' }}>
            現代暗号（例: AES）は、換字（S-Box）と転置（ShiftRows, MixColumns）を
          </div>
          <div style={{ color: 'var(--color-text-subtle)' }}>
            複数ラウンド繰り返すことで、混乱と拡散を高度に実現している。
          </div>
        </div>
      </div>

      <p>
        古典暗号の集大成ともいえるのが<strong>エニグマ</strong>です。
        複数の回転ローター・反射板・プラグボードを組み合わせた電気機械式暗号機で、
        第二次世界大戦においてドイツ軍が使用しました。
      </p>
      <ul>
        <li>ローターが回転するため、同じ文字を押しても毎回異なる暗号文字が出力される（多表式の極致）</li>
        <li>反射板の構造上、ある文字が自分自身に暗号化されることはない（ケルクホフスの原則に反する構造的弱点）</li>
        <li>ブレッチリーパークの Alan Turing らが Bombe マシンで解読に成功し、連合国の勝利に貢献した</li>
        <li>エニグマの解読は「アルゴリズムは知られていた」状態で実現された — ケルクホフスの原則の実例</li>
      </ul>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">SIMULATOR</span>
        <p>
          実機に近い操作感でエニグマ（I, M3, M4, Commercial, G, T）を体験できる高忠実度シミュレータを用意しています。
        </p>
        <div className="actions">
          <Link
            to="/enigma"
            className="step-lesson__demo-btn step-lesson__demo-btn--primary"
          >
            エニグマ シミュレータを起動する
          </Link>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong>
        古典暗号の歴史は「作る側と壊す側のいたちごっこ」でした。
        そのいたちごっこを終わらせるために、Shannon は情報理論を、現代の暗号学者は計算量理論を持ち込みました。
        古典暗号で学んだ「換字（混乱）」と「転置（拡散）」は、AES の S-Box や ShiftRows として
        現代暗号の中で今も生き続けています。
      </div>
    </>
  )
}

/* ================================================================== */
/* Main page component                                                 */
/* ================================================================== */
export default function ClassicalPage() {
  usePageMeta({ title: '古典暗号', description: 'シーザー暗号からヴィジュネル暗号まで、古典暗号の仕組みと解読法を学ぶ' })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const steps: LessonStep[] = [
    {
      title: '古典暗号とは？ — 歴史の概観',
      content: <HistoryOverview />,
      quiz: {
        question: '古典暗号と現代暗号の根本的な違いは何か？',
        options: [
          { label: '古典暗号はコンピュータを使わないこと' },
          { label: '古典暗号は数学的な安全性証明を持たないこと', correct: true },
          { label: '古典暗号は文字を扱い、現代暗号はビットを扱うこと' },
          { label: '古典暗号は鍵を使わないこと' },
        ],
        explanation:
          '正解！古典暗号の最も本質的な弱点は、安全性が経験的・直感的な判断に基づいており、数学的に証明されていない点です。現代暗号は計算量理論に基づいた安全性証明を持ちます。',
      },
    },
    {
      title: '暗号の分類体系 — 換字式と転置式',
      content: <CipherClassification />,
      quiz: {
        question: '換字式暗号と転置式暗号の違いとして正しいものは？',
        options: [
          { label: '換字式は文字を置き換え、転置式は文字の並び順を入れ替える', correct: true },
          { label: '換字式は安全で、転置式は安全でない' },
          { label: '換字式は鍵を使い、転置式は鍵を使わない' },
          { label: '換字式は古代の暗号で、転置式は近代の暗号である' },
        ],
        explanation:
          '正解！換字式は「文字を別の文字に置き換える」操作、転置式は「文字の出現順序を入れ替える」操作です。換字式は頻度分布を変化させますが位置を保存し、転置式は位置を変化させますが頻度分布を保存します。',
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
          '正解！シフト量は 0 ~ 25 の 26 通りしかないため、すべてのパターンを試す総当たり攻撃で簡単に破れます。これは「十分な鍵空間」が暗号の最低条件であることを示しています。',
      },
    },
    {
      title: '転置式暗号 — レール・フェンスのデモ',
      content: <TranspositionDemo />,
      quiz: {
        question: '転置式暗号の特徴として正しいものは？',
        options: [
          { label: '文字の出現頻度が変化する' },
          { label: '文字の出現頻度はそのまま保存される', correct: true },
          { label: '頻度分析で直接解読できる' },
          { label: '鍵空間が換字式より常に大きい' },
        ],
        explanation:
          '正解！転置式暗号は文字の並び順を変えるだけなので、各文字の出現回数（頻度）はまったく変わりません。暗号文の頻度分布が自然言語そのままであれば、「これは転置式暗号だ」と判断する手がかりになります。',
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
      title: 'カシスキーテスト — 鍵長を推定する',
      content: <KasiskiTestDemo />,
      quiz: {
        question: 'カシスキーテストで鍵長を推定する手順として正しいものは？',
        options: [
          { label: '暗号文の文字頻度を数え、最も多い文字を E と仮定する' },
          { label: 'すべてのシフト量を総当たりで試す' },
          { label: '繰り返しパターンの距離の最大公約数を求める', correct: true },
          { label: '暗号文をランダムなグループに分割して頻度分析する' },
        ],
        explanation:
          '正解！カシスキーテストは (1) 暗号文中の繰り返しパターンを検出し、(2) その出現位置間の距離を計算し、(3) 距離の最大公約数（GCD）を鍵長の候補として推定します。鍵長がわかれば、各位置ごとに頻度分析を適用して解読できます。',
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
      title: 'ケルクホフスの原則 — 古典暗号から現代暗号へ',
      content: <BridgeToModern />,
      quiz: {
        question: 'ケルクホフスの原則が主張する内容として正しいものは？',
        options: [
          { label: '暗号アルゴリズムは秘密にすべきである' },
          { label: '安全性はアルゴリズムが公開されても鍵の秘密性のみで保たれるべき', correct: true },
          { label: '鍵は公開してもよい' },
          { label: '暗号は数学者だけが設計すべきである' },
        ],
        explanation:
          '正解！ケルクホフスの原則は「暗号システムの安全性は鍵の秘密性のみに依存すべきである」と主張します。アルゴリズムを秘密にして安全性を担保する設計（Security by Obscurity）は脆弱であり、現代暗号（AES, RSA 等）はすべてアルゴリズムを完全公開しています。',
      },
    },
  ]

  return (
    <main className="page classical">
      <StepLesson
        lessonId="classical"
        title="古典暗号の解読と歴史"
        steps={steps}
      />
    </main>
  )
}
