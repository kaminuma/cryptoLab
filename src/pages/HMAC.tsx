import { useState } from 'react'
import StepLesson, { type LessonStep } from '../components/ui/StepLesson'
import '../components/ui/StepLesson.css'
import { usePageMeta } from '../hooks/usePageMeta'

/* =========================================
   ユーティリティ
   ========================================= */
const toHex = (buf: ArrayBuffer) =>
  [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')

const computeHMAC = async (key: string, message: string, hash: string = 'SHA-256') => {
  const enc = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(message))
  return toHex(sig)
}

const computeHash = async (message: string) => {
  const enc = new TextEncoder()
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(message))
  return toHex(hash)
}

/* =========================================
   Step 1: HMACとは — 封蝋のたとえ
   ========================================= */
function WhatIsHMAC() {
  return (
    <>
      <p>
        中世ヨーロッパでは、手紙を送るときに<strong>封蝋（シーリングワックス）</strong>を使いました。
        差出人だけが持つ印章で蝋に刻印を押すと、受取人は「この手紙は確かにあの人が送ったもので、
        途中で開封されていない」と確認できます。
      </p>
      <p>
        HMAC（Hash-based Message Authentication Code）は、
        デジタルの世界における<strong>封蝋</strong>です。
        秘密鍵を使ってメッセージに「印」を付けることで、
        <strong>誰が送ったか（認証）</strong>と<strong>途中で書き換えられていないか（完全性）</strong>を
        同時に保証します。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: HMAC（Hash-based Message Authentication Code）</strong><br />
        ハッシュ関数と秘密鍵を組み合わせて、メッセージの完全性と送信者の真正性を
        同時に保証する仕組み。RFC 2104で標準化されています。
      </div>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div>送信者: メッセージ + 秘密鍵 → HMAC値を計算</div>
          <div>送信:   メッセージ + HMAC値 をセットで送る</div>
          <div>受信者: メッセージ + 同じ秘密鍵 → HMAC値を再計算</div>
          <div>検証:   受信したHMAC値 と 再計算したHMAC値 を比較</div>
          <div style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-text-subtle)' }}>
            → 一致すれば「正しい送信者から、改ざんなしで届いた」と確認できる
          </div>
        </div>
      </div>

      <p>
        暗号化がメッセージを「読めなくする」のに対して、
        HMACはメッセージを「信頼できるようにする」技術です。
        暗号化とHMACは目的が違うため、多くのプロトコルでは<strong>両方を組み合わせて</strong>使います。
      </p>
    </>
  )
}

/* =========================================
   Step 2: なぜハッシュだけでは不十分か
   ========================================= */
function WhyNotJustHash() {
  return (
    <>
      <p>
        「ハッシュ関数でメッセージの指紋を作れば改ざん検出できるのでは？」
        — 半分正解ですが、致命的な穴があります。
      </p>
      <p>
        ハッシュ関数は<strong>誰でも計算できる</strong>ため、
        攻撃者はメッセージを改ざんした上で、新しいハッシュ値も計算して差し替えられます。
        レストランのたとえなら、注文メモと指紋カードを両方偽造されるようなものです。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>ハッシュのみ</h3>
          <ul>
            <li>誰でも計算できる</li>
            <li>改ざん検出: メッセージ単体なら可能</li>
            <li><strong>認証なし</strong> — 送信者を証明できない</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>HMAC（鍵付きハッシュ）</h3>
          <ul>
            <li>秘密鍵を知る人だけが計算できる</li>
            <li>改ざん検出: 可能</li>
            <li><strong>認証あり</strong> — 送信者を証明できる</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>用語: MAC（メッセージ認証コード）</strong> — メッセージの完全性と送信者の真正性を
        同時に保証する仕組みの総称。HMACはハッシュ関数を使ったMACの代表的な方式です。
      </div>
    </>
  )
}

/* =========================================
   Step 2: HMACの内部構造
   ========================================= */
function HMACStructure() {
  return (
    <>
      <p>
        HMACは「ハッシュ関数を2回使う」ことで安全性を確保します。
        単純に <code>Hash(key + message)</code> とするだけでは、
        <strong>Length Extension Attack</strong>（長さ拡張攻撃）に脆弱です。
      </p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>HMAC(K, M) =</strong></div>
          <div>&nbsp;&nbsp;Hash( (K ⊕ opad) || Hash( (K ⊕ ipad) || M ) )</div>
          <div style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-text-subtle)' }}>
            <div>ipad = 0x36 を繰り返した64バイト</div>
            <div>opad = 0x5C を繰り返した64バイト</div>
            <div>K = 鍵（ブロックサイズに合わせてパディング or ハッシュ）</div>
          </div>
        </div>
      </div>

      <h3>なぜ2重ハッシュなのか</h3>
      <ol>
        <li>
          <strong>内側ハッシュ:</strong> <code>Hash((K ⊕ ipad) || M)</code>
          — メッセージと鍵を混ぜた中間ハッシュを生成
        </li>
        <li>
          <strong>外側ハッシュ:</strong> <code>Hash((K ⊕ opad) || inner)</code>
          — 中間ハッシュをさらに鍵で保護。Length Extension Attackを防ぐ
        </li>
      </ol>

      <div className="step-lesson__callout">
        <strong>なぜ Hash(key || message) ではダメなのか？</strong><br />
        Merkle-Damgård構造のハッシュ（SHA-256等）では、ハッシュ値を知っていれば
        元のメッセージを知らなくても<strong>末尾にデータを追加した新しいハッシュを計算</strong>できます。
        これがLength Extension Attackです。HMACの2重構造はこれを根本的に防ぎます。
      </div>
    </>
  )
}

/* =========================================
   Step 3: HMACデモ — 実際に計算してみよう
   ========================================= */
function HMACDemo() {
  const [key, setKey] = useState('my-secret-key')
  const [message, setMessage] = useState('Hello, HMAC!')
  const [hmacResult, setHmacResult] = useState('')
  const [hashResult, setHashResult] = useState('')
  const [error, setError] = useState('')

  const handleCompute = async () => {
    setError('')
    if (!key.trim()) {
      setError('鍵を入力してください。')
      return
    }
    if (!message.trim()) {
      setError('メッセージを入力してください。')
      return
    }
    try {
      const [hmac, hash] = await Promise.all([
        computeHMAC(key, message),
        computeHash(message),
      ])
      setHmacResult(hmac)
      setHashResult(hash)
    } catch (e) {
      setError(e instanceof Error ? e.message : '計算に失敗しました')
    }
  }

  return (
    <>
      <p>
        WebCrypto APIを使ってHMAC-SHA256を計算します。
        同じメッセージでも、<strong>鍵が変わるとHMAC値は完全に変わる</strong>ことを確認してください。
      </p>

      <div className="step-lesson__demo">
        <div className="step-lesson__demo-row">
          <label>秘密鍵:</label>
          <input
            type="text"
            value={key}
            onChange={e => setKey(e.target.value)}
            placeholder="秘密鍵を入力"
          />
        </div>
        <div className="step-lesson__demo-row">
          <label>メッセージ:</label>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="メッセージを入力"
          />
        </div>
        <button className="step-lesson__demo-btn" onClick={handleCompute}>計算する</button>

        {error && <p style={{ color: 'var(--color-error, #e74c3c)' }}>{error}</p>}

        {hmacResult && (
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <div style={{ marginBottom: 'var(--spacing-sm)' }}>
              <strong>HMAC-SHA256:</strong>
              <div className="step-lesson__mono-box">{hmacResult}</div>
            </div>
            <div>
              <strong>SHA-256（鍵なし）:</strong>
              <div className="step-lesson__mono-box">{hashResult}</div>
            </div>
            <p style={{ color: 'var(--color-text-subtle)', marginTop: 'var(--spacing-sm)' }}>
              ↑ 同じメッセージでもHMACとハッシュは全く異なる値になります。
              鍵を1文字変えてみてください。
            </p>
          </div>
        )}
      </div>
    </>
  )
}

/* =========================================
   Step 4: 改ざん検出デモ
   ========================================= */
function TamperDetectionDemo() {
  const [key] = useState('shared-secret')
  const [phase, setPhase] = useState<'send' | 'tamper' | 'verify'>('send')
  const [message, setMessage] = useState('振込先: 口座A, 金額: 10000')
  const [sentMAC, setSentMAC] = useState('')
  const [receivedMessage, setReceivedMessage] = useState('')
  const [recalcMAC, setRecalcMAC] = useState('')
  const [verified, setVerified] = useState<boolean | null>(null)

  const handleSend = async () => {
    const mac = await computeHMAC(key, message)
    setSentMAC(mac)
    setReceivedMessage(message)
    setRecalcMAC('')
    setVerified(null)
    setPhase('tamper')
  }

  const handleVerify = async () => {
    const mac = await computeHMAC(key, receivedMessage)
    setRecalcMAC(mac)
    setVerified(sentMAC === mac)
    setPhase('verify')
  }

  const handleReset = () => {
    setPhase('send')
    setMessage('振込先: 口座A, 金額: 10000')
    setSentMAC('')
    setReceivedMessage('')
    setRecalcMAC('')
    setVerified(null)
  }

  return (
    <>
      <p>
        3つのステップで改ざん検出を体験します。
        送信者がメッセージを送り、途中で攻撃者が書き換え、受信者が検証する流れです。
      </p>

      <div className="step-lesson__demo">
        {/* Phase 1: 送信者 */}
        <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-border, #ddd)', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>Step 1: 送信者 — メッセージを送る</h4>
          <div className="step-lesson__demo-row">
            <label>メッセージ:</label>
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              disabled={phase !== 'send'}
            />
          </div>
          <button
            className="step-lesson__demo-btn"
            onClick={handleSend}
            disabled={phase !== 'send'}
          >
            HMACを付けて送信
          </button>
          {sentMAC && (
            <div style={{ marginTop: 'var(--spacing-sm)' }}>
              <strong>送信時のHMAC:</strong>
              <div className="step-lesson__mono-box">{sentMAC}</div>
            </div>
          )}
        </div>

        {/* Phase 2: 攻撃者 */}
        {phase !== 'send' && (
          <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-sm)', border: '1px solid var(--color-error, #e74c3c)', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--color-error, #e74c3c)' }}>
              Step 2: 攻撃者 — メッセージを書き換える
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-subtle)' }}>
              通信経路上で攻撃者がメッセージを傍受しました。自由に書き換えてみてください。
            </p>
            <div className="step-lesson__demo-row">
              <label>受信メッセージ:</label>
              <input
                type="text"
                value={receivedMessage}
                onChange={e => { setReceivedMessage(e.target.value); setVerified(null); setRecalcMAC(''); setPhase('tamper') }}
                disabled={phase === 'verify'}
              />
            </div>
            {phase === 'tamper' && (
              <button className="step-lesson__demo-btn" onClick={handleVerify}>
                受信者として検証する
              </button>
            )}
          </div>
        )}

        {/* Phase 3: 受信者 */}
        {phase === 'verify' && (
          <div style={{ marginBottom: 'var(--spacing-md)', padding: 'var(--spacing-sm)', border: `1px solid ${verified ? 'var(--color-success, #27ae60)' : 'var(--color-error, #e74c3c)'}`, borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>Step 3: 受信者 — HMACを再計算して検証</h4>
            <div style={{ marginBottom: 'var(--spacing-sm)' }}>
              <strong>送信時のHMAC（受信済み）:</strong>
              <div className="step-lesson__mono-box">{sentMAC}</div>
            </div>
            <div style={{ marginBottom: 'var(--spacing-sm)' }}>
              <strong>受信メッセージから再計算したHMAC:</strong>
              <div className="step-lesson__mono-box">{recalcMAC}</div>
            </div>
            <div className="step-lesson__callout" style={{
              borderColor: verified ? 'var(--color-success, #27ae60)' : 'var(--color-error, #e74c3c)',
            }}>
              {verified
                ? '✓ MAC一致 — メッセージは改ざんされていません'
                : '✗ MAC不一致 — メッセージが改ざんされています！攻撃者は秘密鍵を知らないため、正しいHMACを再生成できません。'}
            </div>
          </div>
        )}

        {phase === 'verify' && (
          <button className="step-lesson__demo-btn step-lesson__demo-btn--secondary" onClick={handleReset}>
            最初からやり直す
          </button>
        )}
      </div>
    </>
  )
}

/* =========================================
   Step 5: HMACの安全性要件
   ========================================= */
function SecurityRequirements() {
  return (
    <>
      <p>
        HMACは非常に堅牢な構造ですが、正しく使わなければ安全性を発揮できません。
        以下の要件を理解しておきましょう。
      </p>

      <h3>鍵の要件</h3>
      <ol>
        <li>
          <strong>十分な長さ:</strong> 鍵はハッシュ関数の出力長以上が推奨（SHA-256なら32バイト以上）。
          短すぎる鍵はブルートフォースに弱くなります。
        </li>
        <li>
          <strong>ランダム性:</strong> 鍵は暗号学的に安全な乱数生成器で生成すること。
          パスワードをそのまま鍵にするのは危険です（PBKDF2等で導出する）。
        </li>
        <li>
          <strong>秘密性:</strong> 鍵が漏洩したら、攻撃者は任意のメッセージに対して有効なMACを生成できます。
        </li>
      </ol>

      <h3>既知の攻撃と耐性</h3>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>防げる攻撃</h3>
          <ul>
            <li><strong>Length Extension Attack</strong> — 2重ハッシュ構造で防御</li>
            <li><strong>メッセージ改ざん</strong> — 鍵なしでは有効なMACを生成不可</li>
            <li><strong>リプレイ攻撃</strong> — タイムスタンプやカウンタを含めることで対策可能</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>防げない攻撃</h3>
          <ul>
            <li><strong>鍵漏洩</strong> — 鍵管理は別の問題</li>
            <li><strong>否認防止</strong> — 共有鍵なので送信者を特定できない（デジタル署名が必要）</li>
            <li><strong>暗号化</strong> — MACは機密性を提供しない</li>
          </ul>
        </div>
      </div>
    </>
  )
}

/* =========================================
   Step 6: HMACの実用例
   ========================================= */
function RealWorldUsage() {
  return (
    <>
      <p>
        HMACは現代のインターネットインフラの至るところで使われています。
        普段意識しませんが、ウェブを安全に使えるのはHMACのおかげでもあります。
      </p>

      <h3>主な利用箇所</h3>
      <ol>
        <li>
          <strong>TLS/SSL:</strong> ハンドシェイク完了後の通信で、
          各メッセージにHMACを付与して完全性を保証します。
          TLS 1.2ではHMAC-SHA256が標準です。
        </li>
        <li>
          <strong>JWT（JSON Web Token）:</strong> HS256アルゴリズムは
          HMAC-SHA256そのもの。APIの認証トークンに広く使われています。
        </li>
        <li>
          <strong>HKDF（鍵導出）:</strong> HMAC を基盤としてマスター鍵から
          複数の用途別鍵を導出します。TLS 1.3の鍵スケジュールで使用。
        </li>
        <li>
          <strong>TOTP（ワンタイムパスワード）:</strong> Google Authenticator等の
          2要素認証はHMACベースのOTP（HOTP/TOTP）です。
        </li>
        <li>
          <strong>APIリクエスト署名:</strong> AWS Signature V4など、
          APIリクエストの認証にHMACが使われています。
        </li>
      </ol>

      <div className="step-lesson__callout">
        <strong>HMAC vs デジタル署名:</strong> HMACは共有秘密鍵を使うため、
        通信の両端が同じ鍵を持つ必要があります。第三者に対する証明（否認防止）が
        必要な場合はRSAやECDSAなどのデジタル署名を使います。
      </div>
    </>
  )
}

/* =========================================
   Step 7: タイミング攻撃と安全な比較
   ========================================= */
function TimingAttack() {
  const [mode, setMode] = useState<'unsafe' | 'safe'>('unsafe')

  return (
    <>
      <p>
        暗号の安全性は「アルゴリズムが正しいか」だけでは決まりません。
        <strong>実装の仕方</strong>から秘密情報が漏れることがあり、
        これを<strong>サイドチャネル攻撃</strong>と呼びます。
        処理時間、消費電力、電磁波など、暗号の「外側」から情報を盗む手法の総称です。
      </p>
      <p>
        タイミング攻撃はサイドチャネル攻撃の代表例で、HMAC検証でも注意が必要です。
        通常の <code>===</code> 比較は<strong>先頭から1文字ずつ比較して不一致で即終了</strong>するため、
        処理時間の差から正しいMACの先頭部分が推測されてしまいます。
      </p>

      <div className="step-lesson__demo">
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
          <button
            className={`step-lesson__demo-btn ${mode === 'unsafe' ? '' : 'step-lesson__demo-btn--secondary'}`}
            onClick={() => setMode('unsafe')}
          >
            危険な比較
          </button>
          <button
            className={`step-lesson__demo-btn ${mode === 'safe' ? '' : 'step-lesson__demo-btn--secondary'}`}
            onClick={() => setMode('safe')}
          >
            安全な比較
          </button>
        </div>

        {mode === 'unsafe' ? (
          <div className="step-lesson__visual">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: '2', textAlign: 'left', display: 'inline-block' }}>
              <div style={{ color: 'var(--color-error, #e74c3c)' }}>// 危険: タイミング攻撃に脆弱</div>
              <div>function verify(expected, actual) {'{'}</div>
              <div>&nbsp;&nbsp;return expected === actual</div>
              <div>{'}'}</div>
              <div style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-text-subtle)' }}>
                → 不一致の位置によって処理時間が変わる
              </div>
            </div>
          </div>
        ) : (
          <div className="step-lesson__visual">
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: '2', textAlign: 'left', display: 'inline-block' }}>
              <div style={{ color: 'var(--color-success, #27ae60)' }}>// 安全: 定数時間比較</div>
              <div>function verify(expected, actual) {'{'}</div>
              <div>&nbsp;&nbsp;if (expected.length !== actual.length)</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;return false</div>
              <div>&nbsp;&nbsp;let result = 0</div>
              <div>&nbsp;&nbsp;for (let i = 0; i {'<'} expected.length; i++)</div>
              <div>&nbsp;&nbsp;&nbsp;&nbsp;result |= expected[i] ^ actual[i]</div>
              <div>&nbsp;&nbsp;return result === 0</div>
              <div>{'}'}</div>
              <div style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-text-subtle)' }}>
                → 常に全バイトを比較するため処理時間が一定
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="step-lesson__callout">
        <strong>実務での対策:</strong> Node.jsでは <code>crypto.timingSafeEqual()</code>、
        Pythonでは <code>hmac.compare_digest()</code> を使います。
        自前で比較関数を書かず、言語が提供する定数時間比較を利用しましょう。
      </div>

      <div className="step-lesson__callout">
        <strong>サイドチャネル攻撃の他の例:</strong> 電力解析攻撃（消費電力の変動から鍵を推測）、
        キャッシュタイミング攻撃（CPUキャッシュのヒット/ミスから情報を推測）など。
        タイミング攻撃はソフトウェアで対策しやすい部類ですが、
        サイドチャネル攻撃全体は暗号実装における重要なテーマです。
      </div>
    </>
  )
}

/* =========================================
   Step 8: HMAC vs CMAC vs Poly1305
   ========================================= */
function MACComparison() {
  return (
    <>
      <p>
        HMACはMAC（メッセージ認証コード）の一種ですが、他にも重要なMACアルゴリズムがあります。
        それぞれの特性を理解しましょう。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>HMAC</h3>
          <ul>
            <li><strong>基盤:</strong> ハッシュ関数（SHA-256等）</li>
            <li><strong>用途:</strong> TLS, JWT, API署名</li>
            <li><strong>特徴:</strong> 汎用的で広く使われている</li>
            <li><strong>速度:</strong> ハッシュ関数に依存</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>CMAC</h3>
          <ul>
            <li><strong>基盤:</strong> ブロック暗号（AES等）</li>
            <li><strong>用途:</strong> 金融系プロトコル</li>
            <li><strong>特徴:</strong> AESハードウェアがあれば高速</li>
            <li><strong>速度:</strong> AES-NIで高速</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__comparison" style={{ marginTop: 'var(--spacing-md)' }}>
        <div className="step-lesson__comparison-item">
          <h3>Poly1305</h3>
          <ul>
            <li><strong>基盤:</strong> 多項式評価（数学的MAC）</li>
            <li><strong>用途:</strong> ChaCha20-Poly1305（TLS 1.3）</li>
            <li><strong>特徴:</strong> ワンタイム鍵で使用、非常に高速</li>
            <li><strong>速度:</strong> ソフトウェア実装で最速クラス</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>GMAC</h3>
          <ul>
            <li><strong>基盤:</strong> Galois体の乗算</li>
            <li><strong>用途:</strong> AES-GCMの認証部分</li>
            <li><strong>特徴:</strong> AES-GCMに統合済み</li>
            <li><strong>速度:</strong> ハードウェア支援で高速</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>選び方の指針:</strong> 汎用的にはHMAC-SHA256が安牌。
        パフォーマンスが重要ならChaCha20-Poly1305（TLS 1.3で採用）。
        AESハードウェアがある環境ならAES-GCM（GMAC）。
        新規設計でCMACを選ぶ理由は少ないです。
      </div>
    </>
  )
}

/* =========================================
   ページ本体
   ========================================= */
export default function HMACPage() {
  usePageMeta({
    title: 'HMAC — メッセージ認証コード',
    description: 'HMACの仕組みと実装をインタラクティブに学ぶ。WebCrypto APIを使った実演付き。',
  })

  const steps: LessonStep[] = [
    {
      title: 'HMACとは — 封蝋のたとえ',
      content: <WhatIsHMAC />,
      quiz: {
        question: 'HMACが保証する2つの性質はどれ？',
        options: [
          { label: '機密性と可用性' },
          { label: '完全性と認証', correct: true },
          { label: '暗号化と復号' },
          { label: '圧縮と展開' },
        ],
        explanation: 'HMACはメッセージの完全性（改ざんされていないこと）と認証（正しい送信者からであること）を保証します。機密性（暗号化）は提供しません。',
      },
    },
    {
      title: 'なぜハッシュだけでは不十分か',
      content: <WhyNotJustHash />,
      quiz: {
        question: 'ハッシュ関数だけでメッセージ認証ができない理由は？',
        options: [
          { label: 'ハッシュ値が長すぎるから' },
          { label: '攻撃者もハッシュを再計算できるから', correct: true },
          { label: 'ハッシュ関数は遅いから' },
          { label: 'ハッシュ値は復号できるから' },
        ],
        explanation: '攻撃者がメッセージを改ざんした場合、そのメッセージの正しいハッシュ値も計算できるため、ハッシュ値ごと差し替えられてしまいます。秘密鍵が必要なHMACならこれを防げます。',
      },
    },
    {
      title: 'HMACの内部構造',
      content: <HMACStructure />,
      quiz: {
        question: 'HMACが単純なHash(key || message)ではなく2重ハッシュ構造を採用している理由は？',
        options: [
          { label: '計算速度を上げるため' },
          { label: 'ハッシュ値を短くするため' },
          { label: 'Length Extension Attackを防ぐため', correct: true },
          { label: '複数の鍵を使えるようにするため' },
        ],
        explanation: 'Merkle-Damgård構造のハッシュ関数では、Hash(key || message)の値から、元のメッセージを知らなくてもHash(key || message || extension)を計算できてしまいます。HMACの外側ハッシュがこれを防ぎます。',
      },
    },
    {
      title: 'HMAC計算デモ',
      content: <HMACDemo />,
    },
    {
      title: '改ざん検出デモ',
      content: <TamperDetectionDemo />,
      quiz: {
        question: 'HMAC検証で改ざんが検出されるのはなぜ？',
        options: [
          { label: 'メッセージが暗号化されているから' },
          { label: '攻撃者が秘密鍵を持っていないから', correct: true },
          { label: 'ハッシュ関数が不可逆だから' },
          { label: 'MACの長さが変わるから' },
        ],
        explanation: '攻撃者は改ざんしたメッセージに対する正しいHMACを計算できません（秘密鍵を知らないため）。受信者が再計算したHMACと比較すると不一致になり、改ざんが検出されます。',
      },
    },
    {
      title: 'HMACの安全性要件',
      content: <SecurityRequirements />,
    },
    {
      title: 'HMACの実用例',
      content: <RealWorldUsage />,
      quiz: {
        question: 'JWTのHS256アルゴリズムで使われているのは？',
        options: [
          { label: 'AES-256暗号化' },
          { label: 'RSA-256署名' },
          { label: 'HMAC-SHA256', correct: true },
          { label: 'SHA-256ハッシュ' },
        ],
        explanation: 'HS256は「HMAC using SHA-256」の略です。JWTのヘッダーとペイロードに対してHMAC-SHA256を計算し、署名として付与します。',
      },
    },
    {
      title: 'タイミング攻撃と安全な比較',
      content: <TimingAttack />,
      quiz: {
        question: 'HMAC検証時にタイミング攻撃を防ぐには？',
        options: [
          { label: '比較を高速化する' },
          { label: 'ハッシュ値を短くする' },
          { label: '定数時間で比較する', correct: true },
          { label: 'MACを二重に計算する' },
        ],
        explanation: '定数時間比較は、結果に関わらず常に全バイトを比較するため、処理時間から正しいMACを推測されるリスクがなくなります。',
      },
    },
    {
      title: 'HMAC vs 他のMAC',
      content: <MACComparison />,
    },
  ]

  return <StepLesson title="HMAC — メッセージ認証コード" steps={steps} lessonId="hmac" />
}
