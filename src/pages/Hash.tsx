import { useState, useEffect } from 'react'
import StepLesson, { type LessonStep } from '../components/ui/StepLesson'
import '../components/ui/StepLesson.css'
import { usePageMeta } from '../hooks/usePageMeta'
import { sha256WithSteps, sha256WebCrypto, calculateAvalanche, type SHA256Result } from '../lib/hash/sha256'

/* =========================================
   Step 1: ハッシュ関数とは — 指紋のたとえ
   ========================================= */
function FingerprintAnalogy() {
  return (
    <>
      <p>
        人間の指紋を思い浮かべてください。
        どんなに体格や顔つきが似ていても、<strong>指紋は一人ひとり異なります</strong>。
        しかも指紋から元の人間の姿を「復元」することは不可能です。
      </p>
      <p>
        ハッシュ関数はデータの世界における<strong>「指紋採取装置」</strong>です。
        どんなに巨大なファイルでも、どんなに短い文字列でも、
        固定長の「指紋」（ハッシュ値）を生成します。
      </p>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>暗号化 (Encryption)</h3>
          <ul>
            <li><strong>目的:</strong> データを秘密にする</li>
            <li><strong>特徴:</strong> 鍵があれば元に戻せる（双方向）</li>
            <li><strong>例:</strong> AES, RSA</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>ハッシュ関数 (Hash)</h3>
          <ul>
            <li><strong>目的:</strong> データの「指紋」を作る</li>
            <li><strong>特徴:</strong> 元に戻せない（一方向）</li>
            <li><strong>例:</strong> SHA-256, SHA-3, BLAKE3</li>
          </ul>
        </div>
      </div>
      <div className="step-lesson__callout">
        <strong>用語: ハッシュ値（ダイジェスト）</strong> — ハッシュ関数の出力のこと。
        SHA-256なら常に256ビット（16進数で64文字）。
        入力が1バイトでも1GBでも、出力長は変わりません。
      </div>
      <p>
        <strong>ここがポイント:</strong> ハッシュ関数は「要約」ではなく「指紋」です。
        要約なら元の内容を推測できますが、ハッシュ値からは元のデータを一切推測できません。
        この違いがこの先ずっと重要になります。
      </p>
    </>
  )
}

/* =========================================
   Step 2: ハッシュ関数の5つの性質
   ========================================= */
function FiveProperties() {
  return (
    <>
      <p>
        暗号学的ハッシュ関数には<strong>5つの重要な性質</strong>があります。
        最初の2つは基本性質、後の3つは安全性に関わる性質です。
      </p>

      <h3>基本性質</h3>
      <ol>
        <li>
          <strong>決定性（Determinism）</strong> — 同じ入力には<em>常に</em>同じハッシュ値を返す。
          「abc」を100万回ハッシュしても結果は毎回同じです。
          もし乱数的に変わったら、パスワード検証もファイル検証も成り立ちません。
        </li>
        <li>
          <strong>高速計算性</strong> — 任意の入力に対して、ハッシュ値を効率的に計算できる。
          ただし「速すぎる」のもパスワード用途では問題になります（bcryptが遅い理由）。
        </li>
      </ol>

      <h3>安全性に関わる3つの性質</h3>
      <p>以下の3つは似ているようで<strong>明確に異なります</strong>。混同しやすいので注意してください。</p>
      <ol start={3}>
        <li>
          <strong>原像計算困難性（Preimage Resistance）</strong> —
          ハッシュ値 <code>h</code> が与えられたとき、<code>H(m) = h</code> となる入力 <code>m</code> を見つけることが計算上困難。
          <br />
          <em>たとえ: 指紋だけを渡されて「この指紋の持ち主を作れ」と言われても不可能。</em>
        </li>
        <li>
          <strong>第2原像計算困難性（Second Preimage Resistance）</strong> —
          入力 <code>m1</code> が与えられたとき、<code>H(m1) = H(m2)</code> かつ <code>m1 ≠ m2</code> となる別の入力 <code>m2</code> を見つけることが困難。
          <br />
          <em>たとえ: ある人の指紋を渡されて「同じ指紋を持つ別の人を見つけろ」と言われても不可能。</em>
        </li>
        <li>
          <strong>衝突耐性（Collision Resistance）</strong> —
          <code>H(m1) = H(m2)</code> かつ <code>m1 ≠ m2</code> となる<em>任意の</em>ペア <code>(m1, m2)</code> を見つけることが困難。
          <br />
          <em>たとえ: 「同じ指紋を持つ2人を世界中から探せ」 — 自由度が高い分、第2原像より簡単だが、それでも困難。</em>
        </li>
      </ol>

      <div className="step-lesson__callout">
        <strong>原像 vs 第2原像 vs 衝突 — 何が違う？</strong><br />
        原像: ターゲットのハッシュ値は固定。入力を1つ見つける。<br />
        第2原像: ターゲットの入力が固定。同じハッシュ値の別入力を見つける。<br />
        衝突: ターゲットなし。同じハッシュ値になるペアを<em>なんでもいいから</em>見つける。<br />
        強さの順: 衝突耐性 &lt; 第2原像困難性 &lt; 原像困難性（衝突を破るのが最も「簡単」）。
      </div>

      <p>
        <strong>ここがポイント:</strong> 衝突耐性が破られても、原像困難性は保たれることがあります。
        SHA-1は2017年に衝突が発見されましたが、原像攻撃はいまだに成功していません。
        この区別を理解することで「ハッシュ関数が破られた」というニュースの深刻度を正確に判断できます。
      </p>
    </>
  )
}

/* =========================================
   Step 3: Merkle-Damgard構造
   ========================================= */
function MerkleDamgard() {
  return (
    <>
      <p>
        SHA-256を含むSHA-2ファミリーは<strong>Merkle-Damgard構造</strong>で設計されています。
        この構造は、固定長入力の「圧縮関数」を使って、任意長のメッセージを処理する方法を定義します。
      </p>

      <div className="step-lesson__visual">
        <div className="step-lesson__visual-flow">
          <div><strong>Merkle-Damgard構造の処理フロー</strong></div>
          <div>1. <strong>パディング</strong> — メッセージ末尾に「1」ビット、ゼロ埋め、元の長さ（64bit）を付加し、512bitの倍数にする</div>
          <div>2. <strong>ブロック分割</strong> — パディング済みメッセージを512ビットのブロック M1, M2, ... Mn に分割</div>
          <div>3. <strong>圧縮関数の連鎖</strong> — 初期値(IV) → f(IV, M1) → f(H1, M2) → ... → f(Hn-1, Mn)</div>
          <div>4. <strong>最終ハッシュ値</strong> — 最後の圧縮関数の出力がそのままハッシュ値になる</div>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>用語: 圧縮関数</strong> — 2つの固定長入力（前のハッシュ値256bit + メッセージブロック512bit）を受け取り、
        1つの固定長出力（256bit）を返す関数。名前の通り768bitを256bitに「圧縮」します。
      </div>

      <p>
        この構造の美しさは、圧縮関数が衝突耐性を持てば、<strong>全体のハッシュ関数も衝突耐性を持つ</strong>ことが数学的に証明されている点です
        （Merkle-Damgardの定理）。つまり、安全な「部品」があれば安全な「全体」を構築できます。
      </p>

      <h3>パディングの具体例</h3>
      <p>「abc」（24ビット）をパディングする場合:</p>
      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: '1.8', textAlign: 'left', display: 'inline-block' }}>
          <div>[元データ 24bit] [1bit] [ゼロ埋め 423bit] [長さ 64bit]</div>
          <div> 61 62 63          80      00...00            00...18</div>
          <div style={{ color: 'var(--color-text-subtle)', marginTop: '4px' }}>合計: 24 + 1 + 423 + 64 = 512ビット（1ブロック）</div>
        </div>
      </div>

      <p>
        <strong>ここがポイント:</strong> パディングに「元のメッセージ長」を含めるのは、
        異なる長さのメッセージが同じパディング結果にならないようにするためです。
        これがないと衝突耐性が損なわれます。
      </p>
    </>
  )
}

/* =========================================
   Step 4: SHA-256圧縮関数の内部
   ========================================= */
function CompressionFunction() {
  return (
    <>
      <p>
        Merkle-Damgard構造の心臓部が<strong>圧縮関数</strong>です。
        SHA-256の圧縮関数は<strong>8つの作業変数</strong>（a, b, c, d, e, f, g, h）を持ち、
        <strong>64ラウンド</strong>の処理を行います。
      </p>

      <h3>初期ハッシュ値（IV）</h3>
      <p>
        最初のブロックを処理する前に、8つの作業変数は<strong>最初の8つの素数の平方根の小数部分</strong>から生成された定数で初期化されます。
        恣意的な値ではなく、数学的に決まった値を使うことで「バックドアがない」ことを示しています（Nothing-up-my-sleeve numbers）。
      </p>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', overflowX: 'auto' }}>
        <div>H0 = 6a09e667 (√2)　H1 = bb67ae85 (√3)</div>
        <div>H2 = 3c6ef372 (√5)　H3 = a54ff53a (√7)</div>
        <div>H4 = 510e527f (√11)  H5 = 9b05688c (√13)</div>
        <div>H6 = 1f83d9ab (√17)  H7 = 5be0cd19 (√19)</div>
      </div>

      <h3>64ラウンドの各操作</h3>
      <p>各ラウンドで以下の計算が行われます:</p>
      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', lineHeight: '2', textAlign: 'left', display: 'inline-block' }}>
          <div>T1 = h + Σ1(e) + Ch(e,f,g) + K[i] + W[i]</div>
          <div>T2 = Σ0(a) + Maj(a,b,c)</div>
          <div>h = g</div>
          <div>g = f</div>
          <div>f = e</div>
          <div>e = d + T1</div>
          <div>d = c</div>
          <div>c = b</div>
          <div>b = a</div>
          <div>a = T1 + T2</div>
        </div>
      </div>

      <h3>ビット操作関数</h3>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>Ch（Choose）</h3>
          <p><code>Ch(e,f,g) = (e AND f) XOR (NOT e AND g)</code></p>
          <p>eの各ビットが「fのビットを選ぶか、gのビットを選ぶか」を決める。eが1ならf、0ならgを選択。</p>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>Maj（Majority）</h3>
          <p><code>Maj(a,b,c) = (a AND b) XOR (a AND c) XOR (b AND c)</code></p>
          <p>3つの入力の多数決。各ビット位置で、1が2つ以上なら1、そうでなければ0。</p>
        </div>
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>Σ0（大シグマ0）</h3>
          <p><code>Σ0(a) = ROTR(2,a) XOR ROTR(13,a) XOR ROTR(22,a)</code></p>
          <p>3方向の循環右シフトをXOR。ビットを広範囲に拡散させる。</p>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>Σ1（大シグマ1）</h3>
          <p><code>Σ1(e) = ROTR(6,e) XOR ROTR(11,e) XOR ROTR(25,e)</code></p>
          <p>Σ0と同じ構造だが、シフト量が異なる。非対称性を生み出す。</p>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>なぜこの構造？</strong> Ch, Maj は非線形性を導入し、Σ0, Σ1 はビットの拡散を担当します。
        K[i]はラウンド定数（最初の64個の素数の立方根の小数部分）、W[i]はメッセージスケジュールからのワードです。
        これらが組み合わさることで、入力の微小な変化が64ラウンドを経て全ビットに伝播します。
      </div>

      <p>
        <strong>ここがポイント:</strong> 64ラウンド終了後、作業変数 a〜h を<em>初期値に加算</em>します（Davies-Meyer構成）。
        この加算がなければ、圧縮関数は可逆になってしまい、一方向性が失われます。
      </p>
    </>
  )
}

/* =========================================
   Step 5: メッセージスケジュール
   ========================================= */
function MessageSchedule() {
  return (
    <>
      <p>
        圧縮関数の64ラウンドにはそれぞれ異なる「ワード」W[i]が供給されます。
        しかし1つの512ビットブロックから直接得られるのは<strong>16ワード</strong>（32bit × 16 = 512bit）だけです。
        残りの48ワードは、最初の16ワードから<strong>拡張</strong>して生成します。
      </p>

      <h3>16ワード → 64ワードの拡張</h3>
      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', lineHeight: '2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>W[0]〜W[15]:</strong> メッセージブロックをそのまま使用</div>
          <div><strong>W[16]〜W[63]:</strong> 以下の式で計算</div>
          <div style={{ marginTop: '8px' }}>W[i] = σ1(W[i-2]) + W[i-7] + σ0(W[i-15]) + W[i-16]</div>
        </div>
      </div>

      <h3>小シグマ関数（σ0, σ1）</h3>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>σ0（小シグマ0）</h3>
          <p><code>σ0(x) = ROTR(7,x) XOR ROTR(18,x) XOR SHR(3,x)</code></p>
          <p>循環シフト2つ + 論理シフト1つ。圧縮関数のΣ0とは異なる関数です。</p>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>σ1（小シグマ1）</h3>
          <p><code>σ1(x) = ROTR(17,x) XOR ROTR(19,x) XOR SHR(10,x)</code></p>
          <p>こちらもΣ1とは別物。メッセージスケジュール専用の拡散関数です。</p>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>なぜ拡張が必要？</strong> 16ワードだけだと、64ラウンドのうち48ラウンドで同じワードを再利用することになり、
        差分攻撃に対して脆弱になります。σ0, σ1による拡張で、元のメッセージの影響が全64ラウンドに行き渡るようにしています。
      </div>

      <h3>SHA-256処理の全体像（まとめ）</h3>
      <div className="step-lesson__visual">
        <div className="step-lesson__visual-flow">
          <div>入力: <code>&quot;abc&quot;</code></div>
          <div>↓ <strong>パディング</strong> — 512bitの倍数に調整</div>
          <div>↓ <strong>ブロック分割</strong> — 512bitブロックに分割</div>
          <div>↓ <strong>メッセージスケジュール</strong> — 16ワード → 64ワード拡張</div>
          <div>↓ <strong>圧縮関数</strong> — 8変数 a〜h を64ラウンド処理</div>
          <div>↓ <strong>Davies-Meyer加算</strong> — 結果をIVに加算</div>
          <div>↓ <em>（全ブロック処理するまで繰り返す）</em></div>
          <div>出力: <code>ba7816bf...f20015ad</code> (256bit)</div>
        </div>
      </div>

      <p>
        <strong>ここがポイント:</strong> メッセージスケジュールの拡張は「雪だるま式」です。
        W[16]の計算にはW[0], W[1], W[9], W[14]が使われ、W[17]にはW[1], W[2], W[10], W[15]が使われます。
        元のメッセージの1ビットの変化が、ラウンドを追うごとに指数関数的に拡がっていきます。
      </p>
    </>
  )
}

/* =========================================
   Step 6: 実際に試してみよう（既存デモ維持）
   ========================================= */
function InteractiveDemo() {
  const [input, setInput] = useState('abc')
  const [result, setResult] = useState<SHA256Result | null>(null)
  const [webCryptoHash, setWebCryptoHash] = useState('')
  const [isMatch, setIsMatch] = useState(false)

  useEffect(() => {
    const r = sha256WithSteps(input)
    setResult(r)
    sha256WebCrypto(input).then(hash => {
      setWebCryptoHash(hash)
      setIsMatch(hash === r.hash)
    })
  }, [input])

  return (
    <>
      <p>
        ここまでの理論を実際に確認しましょう。
        下のデモでは、自作のSHA-256実装と、ブラウザ内蔵のWeb Crypto APIの結果を比較できます。
        冒頭の「指紋」のたとえを思い出してください — 同じデータには常に同じ指紋がつきます。
      </p>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>
        <label>入力テキスト:</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ハッシュ化したいテキストを入力..."
        />

        {result && (
          <>
            <div style={{ marginTop: 'var(--spacing-md)' }}>
              <label>自作 SHA-256:</label>
              <div className="step-lesson__demo-result">{result.hash}</div>
            </div>
            <div style={{ marginTop: 'var(--spacing-sm)' }}>
              <label>Web Crypto API（検証）:</label>
              <div className="step-lesson__demo-result">{webCryptoHash}</div>
            </div>
            <div style={{
              marginTop: 'var(--spacing-md)',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: 600,
              background: isMatch ? 'color-mix(in srgb, var(--color-success) 10%, transparent)' : 'color-mix(in srgb, var(--color-danger) 10%, transparent)',
              color: isMatch ? 'var(--color-success)' : 'var(--color-danger)',
            }}>
              {isMatch ? '✓ 一致！自作実装は正しいです' : '✗ 不一致（実装エラー）'}
            </div>
          </>
        )}
      </div>

      <div className="step-lesson__callout">
        <strong>試してみよう:</strong> 「abc」と「abd」を比較してみてください。
        たった1文字の違いで、ハッシュ値の<em>すべての桁</em>が変わります。
        これがStep 4〜5で解説した圧縮関数とメッセージスケジュールの効果です。
      </div>

      <p>
        <strong>ここがポイント:</strong> 2つの独立した実装が同じ結果を返すことで、
        決定性（同じ入力 → 同じ出力）が確認できます。
        これはハッシュ関数の最も基本的な性質です。
      </p>
    </>
  )
}

/* =========================================
   Step 7: アバランシェ効果（既存デモ維持）
   ========================================= */
function AvalancheDemo() {
  const [input1, setInput1] = useState('abc')
  const [input2, setInput2] = useState('abd')
  const [avalanche, setAvalanche] = useState<ReturnType<typeof calculateAvalanche> | null>(null)

  useEffect(() => {
    const r1 = sha256WithSteps(input1)
    const r2 = sha256WithSteps(input2)
    setAvalanche(calculateAvalanche(r1.hash, r2.hash))
  }, [input1, input2])

  return (
    <>
      <p>
        良いハッシュ関数は、入力が1ビットでも変わると、出力のビットの<strong>約50%</strong>が変化します。
        これを<strong>アバランシェ効果</strong>（雪崩効果）といいます。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>Before: 悪いハッシュ関数</h3>
          <ul>
            <li>入力の微小な変化 → 出力も微小な変化</li>
            <li>似た入力から似たハッシュ値が推測可能</li>
            <li>差分攻撃に脆弱</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>After: SHA-256</h3>
          <ul>
            <li>1ビットの変化 → 出力の約50%が反転</li>
            <li>入力の類似性がハッシュ値に反映されない</li>
            <li>64ラウンドの圧縮で完全に拡散</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <div>
            <label>入力1:</label>
            <input type="text" value={input1} onChange={(e) => setInput1(e.target.value)} />
          </div>
          <div>
            <label>入力2:</label>
            <input type="text" value={input2} onChange={(e) => setInput2(e.target.value)} />
          </div>
        </div>

        {avalanche && (
          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            <div className="step-lesson__big-number">
              {avalanche.percentage.toFixed(1)}%
            </div>
            <div className="step-lesson__big-label">
              256ビット中 {avalanche.differentBits} ビットが異なる
            </div>

            <div style={{ marginTop: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} style={{ display: 'flex', gap: '2px' }}>
                  {avalanche.bitDifferences.slice(i * 32, (i + 1) * 32).map((isDiff: boolean, j: number) => (
                    <div
                      key={j}
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '2px',
                        background: isDiff ? 'var(--color-accent)' : 'var(--color-border)',
                      }}
                      title={`Bit ${i * 32 + j}`}
                    />
                  ))}
                </div>
              ))}
              <div style={{ marginTop: 'var(--spacing-sm)', fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>
                紫 = 異なるビット、灰 = 同じビット
              </div>
            </div>
          </div>
        )}
      </div>

      <p>
        <strong>ここがポイント:</strong> アバランシェ効果は偶然ではなく、設計された結果です。
        Ch関数の非線形性、Σ関数のビット拡散、メッセージスケジュールの拡張 — これらすべてが協調して、
        1ビットの変化を256ビット全体に波及させています。
      </p>
    </>
  )
}

/* =========================================
   Step 8: SHA-3/Keccakとの比較
   ========================================= */
function SHA3Comparison() {
  return (
    <>
      <p>
        2012年、NISTはSHA-2とは<strong>まったく異なる設計思想</strong>のSHA-3（Keccak）を標準化しました。
        SHA-2が破られたわけではなく、「設計の多様性」を確保するための保険です。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>SHA-2（Merkle-Damgard構造）</h3>
          <ul>
            <li><strong>構造:</strong> 圧縮関数を連鎖</li>
            <li><strong>内部状態:</strong> 256bit（出力と同じ）</li>
            <li><strong>弱点:</strong> Length Extension Attack に脆弱</li>
            <li><strong>速度:</strong> 汎用CPU上で高速</li>
            <li><strong>採用:</strong> TLS, Bitcoin, Git</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>SHA-3（スポンジ構造）</h3>
          <ul>
            <li><strong>構造:</strong> 吸収（Absorb）と搾取（Squeeze）</li>
            <li><strong>内部状態:</strong> 1600bit（出力よりはるかに大きい）</li>
            <li><strong>強み:</strong> Length Extension Attack に耐性あり</li>
            <li><strong>速度:</strong> ハードウェア実装で有利</li>
            <li><strong>採用:</strong> Ethereum, NIST標準</li>
          </ul>
        </div>
      </div>

      <h3>スポンジ構造とは</h3>
      <div className="step-lesson__visual">
        <div className="step-lesson__visual-flow">
          <div><strong>吸収フェーズ（Absorb）</strong></div>
          <div>1. 内部状態を0で初期化（1600bit = rate + capacity）</div>
          <div>2. メッセージブロックを rate 部分に XOR</div>
          <div>3. 置換関数 f を適用</div>
          <div>4. 全ブロックを吸収するまで 2-3 を繰り返す</div>
          <div style={{ marginTop: '8px' }}><strong>搾取フェーズ（Squeeze）</strong></div>
          <div>5. rate 部分から出力を取り出す</div>
          <div>6. 必要な長さに達するまで f を適用して繰り返す</div>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>用語: Length Extension Attack</strong> — Merkle-Damgard構造では、H(m)を知っていれば、
        mを知らなくても H(m || padding || m') を計算できてしまいます。
        これはMAC構成で深刻な脆弱性になります（HMAC-SHA256はこの問題を回避する設計です）。
        SHA-3のスポンジ構造では、内部状態のcapacity部分が出力に含まれないため、この攻撃が成立しません。
      </div>

      <h3>使い分けの指針</h3>
      <ul>
        <li><strong>互換性重視:</strong> SHA-256（既存システムの大半が対応）</li>
        <li><strong>HMAC不要で直接MACしたい:</strong> SHA-3 or KMAC</li>
        <li><strong>可変長出力が欲しい:</strong> SHAKE128 / SHAKE256（SHA-3の拡張）</li>
        <li><strong>高速性重視:</strong> BLAKE3（SHA-3候補のBLAKEの後継、並列処理に最適化）</li>
      </ul>

      <p>
        <strong>ここがポイント:</strong> SHA-2とSHA-3は「競合」ではなく「補完」の関係です。
        万が一SHA-2に致命的な脆弱性が見つかっても、まったく別の設計のSHA-3にすぐ切り替えられます。
        これが暗号の世界における「アルゴリズムの俊敏性（crypto agility）」です。
      </p>
    </>
  )
}

/* =========================================
   Step 9: ハッシュの危殆化の歴史
   ========================================= */
function HashHistory() {
  return (
    <>
      <p>
        ハッシュ関数の歴史は「破られては新しいものが生まれる」繰り返しです。
        その流れを知ることで、なぜ今SHA-256を使い、なぜSHA-3が生まれたのか理解できます。
      </p>

      <h3>MD5（1991年）— 今は完全に危殆化</h3>
      <ul>
        <li>Ron Rivestが設計。128ビット出力。当時は広く使われた。</li>
        <li><strong>1996年:</strong> 圧縮関数の衝突が発見（Dobbertin）</li>
        <li><strong>2004年:</strong> 王小雲らが実用的な衝突攻撃を発表。ノートPCで数秒で衝突を生成可能に。</li>
        <li><strong>2008年:</strong> 偽のCA証明書が作成され、実世界への攻撃が実証された。</li>
        <li><strong>原因:</strong> 差分攻撃に対する耐性が不十分。ラウンド数（64）に対して内部状態（128bit）が小さすぎた。</li>
      </ul>

      <h3>SHA-1（1995年）— 2017年に衝突が実証</h3>
      <ul>
        <li>NSA設計。160ビット出力。MD5の後継として長年標準。</li>
        <li><strong>2005年:</strong> 王小雲らが理論的な攻撃を発表（2<sup>69</sup>の計算量、本来は2<sup>80</sup>）。</li>
        <li><strong>2017年:</strong> GoogleとCWIがSHAttered攻撃を発表。異なる内容のPDFで同じSHA-1ハッシュを実現。</li>
        <li><strong>2020年:</strong> chosen-prefix collisionが実用的コスト（約$45,000）で可能に。</li>
        <li><strong>原因:</strong> MD5と同じMerkle-Damgard + Davies-Meyer構成で、差分パスの制御が可能だった。</li>
      </ul>

      <h3>SHA-2（2001年〜）— 現在も安全</h3>
      <ul>
        <li>NSA設計。SHA-224/256/384/512のファミリー。</li>
        <li>SHA-1と構造は似ているが、内部状態の拡大と関数の改良で差分攻撃への耐性が大幅に向上。</li>
        <li>2026年現在、<strong>実用的な攻撃は未発見</strong>。ラウンド削減版への攻撃報告はあるが、フルラウンドは健全。</li>
      </ul>

      <div className="step-lesson__visual">
        <div className="step-lesson__visual-flow">
          <div><strong>ハッシュ関数の世代交代</strong></div>
          <div>MD5 (128bit) → 衝突攻撃で危殆化 → 使用禁止</div>
          <div>SHA-1 (160bit) → 衝突攻撃で危殆化 → 非推奨（Git等で残存）</div>
          <div>SHA-2 (256/512bit) → 現在の標準 → 当面は安全</div>
          <div>SHA-3 (可変長) → バックアップ標準 → 設計多様性の確保</div>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>注意: 「衝突が見つかった」≠「完全に破られた」</strong><br />
        SHA-1の衝突が見つかっても、原像攻撃（ハッシュ値から元データを復元）はいまだに成功していません。
        しかし暗号学では「理論的な弱点 → いずれ実用的な攻撃」と考えるのが鉄則です。
        攻撃は改善されることはあっても、弱くなることはありません。
      </div>

      <p>
        <strong>ここがポイント:</strong> 歴史が教えてくれるのは「ハッシュ関数は永遠ではない」ということです。
        だからこそ、プロトコルは特定のハッシュ関数にハードコードせず、
        アルゴリズムを差し替え可能に設計すべきです（TLS 1.3のcipher suite交渉がその好例）。
      </p>
    </>
  )
}

/* =========================================
   Step 10: ハッシュ関数の実用例
   ========================================= */
function RealWorldUses() {
  return (
    <>
      <p>
        最初に「指紋」のたとえを使いました。
        ここでもう一度その視点に立って、実世界でハッシュ関数がどう活躍しているか見てみましょう。
      </p>
      <ul>
        <li>
          <strong>パスワード保管</strong> — パスワードそのものではなくハッシュ値を保存。
          ログイン時は入力をハッシュ化して保存値と比較。データベース漏洩時も元のパスワードは不明。
          実務ではSHA-256単体ではなく、bcryptやArgon2（意図的に遅いハッシュ）を使用。
        </li>
        <li>
          <strong>ファイルの完全性検証</strong> — ダウンロードしたファイルの「指紋」を配布元と照合。
          1ビットでも改ざんされていればハッシュ値が完全に変わる（アバランシェ効果）。
        </li>
        <li>
          <strong>デジタル署名</strong> — 文書全体に署名するのは遅いため、まずハッシュ値を計算し、
          その256ビットの「指紋」に対してRSAやECDSAで署名。検証も高速。
        </li>
        <li>
          <strong>ブロックチェーン</strong> — 各ブロックが前のブロックのハッシュ値を含み、
          1つでも変更すると後続の全ハッシュが連鎖的に変わるため改ざんが事実上不可能。
          Bitcoinのマイニングは「ハッシュ値が特定の条件を満たす入力を探す」原像計算の一種。
        </li>
        <li>
          <strong>HMAC（メッセージ認証）</strong> — ハッシュ関数と秘密鍵を組み合わせて、
          メッセージの改ざんを検出。APIの認証トークンやJWTで広く使用。
        </li>
      </ul>

      <div className="step-lesson__callout">
        <strong>豆知識:</strong> Gitのコミットも内部でSHA-1ハッシュを使っています（SHA-256への移行が進行中）。
        <code>git log --oneline</code> で見える短いIDがハッシュ値の先頭部分です。
        SHAttered攻撃を受けて、Git はSHA-1衝突を検知する対策を実装しました。
      </div>

      <p>
        <strong>ここがポイント:</strong> ハッシュ関数は「暗号の接着剤」です。
        署名、認証、鍵導出、コミットメントスキームなど、あらゆる暗号プロトコルの構成要素として使われます。
        だからこそ、ハッシュ関数が破られると影響範囲が極めて広くなるのです。
      </p>
    </>
  )
}

/* =========================================
   メインコンポーネント
   ========================================= */
export default function Hash() {
  usePageMeta({ title: 'ハッシュ関数', description: 'SHA-256の内部構造からSHA-3まで、ハッシュ関数を深く理解する' })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const steps: LessonStep[] = [
    {
      title: 'ハッシュ関数とは — データの「指紋」',
      content: <FingerprintAnalogy />,
      quiz: {
        question: 'ハッシュ関数と暗号化の最大の違いは？',
        options: [
          { label: 'ハッシュ関数のほうが処理速度が速い' },
          { label: 'ハッシュ関数は一方向で、元に戻せない', correct: true },
          { label: 'ハッシュ関数は鍵が必要ない' },
          { label: '暗号化は出力が固定長にならない' },
        ],
        explanation: '正解！ハッシュ関数は一方向関数です。暗号化は鍵があれば復号（元に戻す）できますが、ハッシュ値から元のデータを復元する方法はありません。「指紋から人間を復元できない」のと同じです。',
      },
    },
    {
      title: 'ハッシュ関数の5つの性質',
      content: <FiveProperties />,
      quiz: {
        question: '「第2原像計算困難性」と「衝突耐性」の違いは？',
        options: [
          { label: '同じものの別名である' },
          { label: '第2原像は特定の入力と同じハッシュ値の別入力を探す。衝突は任意のペアを探す', correct: true },
          { label: '衝突耐性のほうが破るのが難しい' },
          { label: '第2原像は出力に関する性質で、衝突は入力に関する性質' },
        ],
        explanation: '正解！第2原像攻撃は「ターゲットが固定」（特定の入力m1に対してH(m1)=H(m2)となるm2を探す）。衝突攻撃は「自由に選べる」（なんでもいいからH(m1)=H(m2)のペアを探す）。自由度が高い分、衝突攻撃のほうが容易です。',
      },
    },
    {
      title: 'Merkle-Damgard構造',
      content: <MerkleDamgard />,
      quiz: {
        question: 'パディングにメッセージの元の長さを含める理由は？',
        options: [
          { label: '復号時に元のサイズを復元するため' },
          { label: '処理速度を向上させるため' },
          { label: '異なる長さのメッセージが同じパディング結果にならないようにするため', correct: true },
          { label: 'ブロック数を計算するため' },
        ],
        explanation: '正解！長さ情報がないと、例えば「ab」+パディングと「abc」+パディングが同じになるケースが生じ、衝突耐性が損なわれます。これをMerkle-Damgard強化（Merkle-Damgard strengthening）と呼びます。',
      },
    },
    {
      title: 'SHA-256圧縮関数の内部',
      content: <CompressionFunction />,
    },
    {
      title: 'メッセージスケジュール',
      content: <MessageSchedule />,
      quiz: {
        question: 'SHA-256のメッセージスケジュールで、16ワードを64ワードに拡張する主な目的は？',
        options: [
          { label: '出力長を256ビットから512ビットに拡大するため' },
          { label: '元のメッセージの影響を全64ラウンドに行き渡らせ、差分攻撃への耐性を高めるため', correct: true },
          { label: '計算を並列化しやすくするため' },
          { label: 'パディングで追加されたデータを処理するため' },
        ],
        explanation: '正解！16ワードだけでは48ラウンド分のデータが不足し、同じワードを再利用すると差分攻撃のパスが生まれます。σ0, σ1による拡張で、元メッセージの各ビットの影響が全ラウンドに伝播するようにしています。',
      },
    },
    {
      title: '実際に試してみよう',
      content: <InteractiveDemo />,
    },
    {
      title: 'アバランシェ効果',
      content: <AvalancheDemo />,
      quiz: {
        question: '理想的なハッシュ関数で1ビット入力を変えた場合、出力の何%が変化する？',
        options: [
          { label: '約1%' },
          { label: '約25%' },
          { label: '約50%', correct: true },
          { label: '約100%' },
        ],
        explanation: '正解！理想的なアバランシェ効果では、入力を1ビット変えると出力ビットの約50%が反転します。これはCh関数の非線形性、Σ関数のビット拡散、メッセージスケジュールの拡張が協調した結果です。',
      },
    },
    {
      title: 'SHA-3/Keccak vs SHA-2',
      content: <SHA3Comparison />,
      quiz: {
        question: 'SHA-3のスポンジ構造がLength Extension Attackに耐性を持つ理由は？',
        options: [
          { label: 'SHA-3は暗号化も同時に行うから' },
          { label: '内部状態のcapacity部分が出力に含まれず、攻撃者が内部状態を復元できないから', correct: true },
          { label: 'SHA-3はハッシュ値が可変長だから' },
          { label: 'スポンジ構造は圧縮関数を使わないから' },
        ],
        explanation: '正解！スポンジ構造の内部状態（1600bit）はrate部分とcapacity部分に分かれており、出力に使われるのはrate部分だけです。攻撃者はcapacity部分を知ることができないため、Length Extension Attackが成立しません。',
      },
    },
    {
      title: 'ハッシュの危殆化の歴史',
      content: <HashHistory />,
    },
    {
      title: 'ハッシュ関数の実用例',
      content: <RealWorldUses />,
      quiz: {
        question: 'パスワード保管にSHA-256単体ではなくbcryptやArgon2が推奨される理由は？',
        options: [
          { label: 'SHA-256の衝突耐性が不十分だから' },
          { label: 'SHA-256は高速すぎるため、総当たり攻撃（ブルートフォース）に対して脆弱になるから', correct: true },
          { label: 'SHA-256の出力長が短すぎるから' },
          { label: 'SHA-256は可逆だから' },
        ],
        explanation: '正解！SHA-256は高速に設計されているため、攻撃者も高速にハッシュを計算してパスワードを総当たりできます。bcryptやArgon2は意図的に計算を遅く（かつメモリも消費するように）設計されており、総当たり攻撃のコストを大幅に引き上げます。',
      },
    },
  ]

  return (
    <main className="page hash">
      <StepLesson
        lessonId="hash"
        title="SHA-256 ハッシュ関数"
        steps={steps}
      />
    </main>
  )
}
