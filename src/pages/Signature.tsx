import { useState } from 'react'
import StepLesson, { type LessonStep } from '../components/ui/StepLesson'
import '../components/ui/StepLesson.css'
import { usePageMeta } from '../hooks/usePageMeta'

/* =========================================
   ユーティリティ
   ========================================= */
const toHex = (buf: ArrayBuffer) =>
  [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')

const truncateHex = (hex: string, len = 32) =>
  hex.length > len ? hex.slice(0, len) + '…' : hex

/* =========================================
   Step 1: デジタル署名とは — 「実印」のたとえ
   ========================================= */
function WhatIsSignature() {
  return (
    <>
      <p>
        契約書に署名するとき、あなたは自分だけの筆跡やハンコで
        「この契約に同意した」という意思を示します。
        他人はあなたの署名を<strong>確認</strong>できますが、
        <strong>偽造</strong>はできません。
      </p>
      <p>
        デジタル署名は、この仕組みを数学的に実現したものです。
        秘密鍵で「署名」を生成し、対応する公開鍵で誰でも「検証」できます。
        署名は<strong>メッセージの内容と紐づく</strong>ため、
        1文字でも改ざんされると検証に失敗します。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: デジタル署名（Digital Signature）</strong><br />
        秘密鍵を使ってメッセージに数学的な「印」を付ける技術。
        公開鍵を持つ誰もが署名を検証できるが、署名の生成は秘密鍵の所有者にしかできない。
        <strong>認証</strong>（誰が作ったか）、<strong>完全性</strong>（改ざんされていないか）、
        <strong>否認防止</strong>（後から「やっていない」と言えない）を同時に保証する。
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>手書き署名</h3>
          <ul>
            <li>筆跡で本人を特定</li>
            <li>目視で検証（主観的）</li>
            <li>署名はどの書類でも同じ</li>
            <li>高度な偽造は可能</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>デジタル署名</h3>
          <ul>
            <li>秘密鍵で本人を特定</li>
            <li>数学的に検証（客観的）</li>
            <li>署名はメッセージごとに異なる</li>
            <li>秘密鍵なしでは偽造不可能</li>
          </ul>
        </div>
      </div>
    </>
  )
}

/* =========================================
   Step 2: 署名と暗号化の違い
   ========================================= */
function SignatureVsEncryption() {
  return (
    <>
      <p>
        公開鍵暗号は「南京錠」でメッセージを<strong>隠す</strong>技術でした。
        デジタル署名は鍵の使い方が<strong>逆</strong>になります。
      </p>

      <div className="step-lesson__table-wrap">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>暗号化</th>
              <th>署名</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>目的</strong></td>
              <td>秘密を守る（機密性）</td>
              <td>本人を証明する（認証・完全性）</td>
            </tr>
            <tr>
              <td><strong>秘密鍵で</strong></td>
              <td>復号する</td>
              <td>署名を生成する</td>
            </tr>
            <tr>
              <td><strong>公開鍵で</strong></td>
              <td>暗号化する</td>
              <td>署名を検証する</td>
            </tr>
            <tr>
              <td><strong>誰でもできる操作</strong></td>
              <td>暗号化（公開鍵は公開）</td>
              <td>検証（公開鍵は公開）</td>
            </tr>
            <tr>
              <td><strong>本人だけの操作</strong></td>
              <td>復号（秘密鍵が必要）</td>
              <td>署名生成（秘密鍵が必要）</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        暗号化は「送信者→受信者」の一方向で秘密を守りますが、
        署名は「作成者→全員」の方向で<strong>信頼</strong>を提供します。
        実際のTLS通信では、暗号化と署名の両方を組み合わせて使います。
      </p>

      <div className="step-lesson__callout">
        <strong>HMACとの違い:</strong> HMACも認証と完全性を提供しますが、
        検証にも同じ秘密鍵が必要です（共有秘密）。デジタル署名は公開鍵で
        誰でも検証できるため、<strong>否認防止</strong>が可能です。
        「その署名を作れるのは秘密鍵の持ち主だけ」と証明できます。
      </div>
    </>
  )
}

/* =========================================
   Step 3: 署名の仕組み — ハッシュ→署名
   ========================================= */
function HowSignatureWorks() {
  return (
    <>
      <p>
        デジタル署名は、メッセージそのものに直接署名するのではなく、
        <strong>ハッシュ値</strong>に対して署名します。
        これにより、巨大なファイルでも高速に署名できます。
      </p>

      <div className="step-lesson__visual">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <div style={{ padding: '0.75rem 1.5rem', background: 'var(--sl-color-surface)', borderRadius: '8px', border: '1px solid var(--sl-color-border)' }}>
            <strong>1. ハッシュ化</strong><br />
            メッセージ → SHA-256 → 固定長ハッシュ値（32バイト）
          </div>
          <div style={{ fontSize: '1.5rem' }}>↓</div>
          <div style={{ padding: '0.75rem 1.5rem', background: 'var(--sl-color-surface)', borderRadius: '8px', border: '1px solid var(--sl-color-border)' }}>
            <strong>2. 署名生成</strong><br />
            ハッシュ値 + 秘密鍵 → 署名アルゴリズム → 署名値
          </div>
          <div style={{ fontSize: '1.5rem' }}>↓</div>
          <div style={{ padding: '0.75rem 1.5rem', background: 'var(--sl-color-surface)', borderRadius: '8px', border: '1px solid var(--sl-color-border)' }}>
            <strong>3. 検証</strong><br />
            メッセージ + 署名値 + 公開鍵 → 検証アルゴリズム → OK / NG
          </div>
        </div>
      </div>

      <p>
        検証者はメッセージから同じハッシュ値を計算し、
        署名値と公開鍵を使って「この署名は正しい秘密鍵で作られたか」を確認します。
        メッセージが1ビットでも変わればハッシュ値が変わるため、署名は無効になります。
      </p>

      <div className="step-lesson__callout">
        <strong>なぜハッシュ化するのか？</strong><br />
        RSA署名では、署名対象のデータサイズが鍵サイズ以下でなければなりません。
        SHA-256でハッシュ化すれば、どんなサイズのメッセージも32バイトに圧縮できます。
        ECDSAでも、楕円曲線の点のサイズに合わせるためにハッシュ化が必要です。
      </div>
    </>
  )
}

/* =========================================
   Step 4: ECDSA — 楕円曲線デジタル署名
   ========================================= */
function ECDSAExplain() {
  return (
    <>
      <p>
        ECDSA（Elliptic Curve Digital Signature Algorithm）は、
        楕円曲線暗号を使ったデジタル署名方式です。
        RSA署名と比べて<strong>短い鍵長で同等の安全性</strong>を実現します。
      </p>

      <div className="step-lesson__table-wrap">
        <table>
          <thead>
            <tr>
              <th>安全性レベル</th>
              <th>RSA鍵長</th>
              <th>ECDSA鍵長</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>128ビット</td>
              <td>3072ビット</td>
              <td>256ビット（P-256）</td>
            </tr>
            <tr>
              <td>192ビット</td>
              <td>7680ビット</td>
              <td>384ビット（P-384）</td>
            </tr>
            <tr>
              <td>256ビット</td>
              <td>15360ビット</td>
              <td>521ビット（P-521）</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        ECDSAの署名は<strong>(r, s)</strong>という2つの整数のペアです。
        署名生成には毎回異なるランダムな値<strong>k</strong>（ノンス）が使われるため、
        同じメッセージに同じ鍵で署名しても、毎回異なる署名値が生成されます。
      </p>

      <div className="step-lesson__callout">
        <strong>ノンスの重要性:</strong> もしノンスkが漏洩したり、
        2回同じ値が使われると、秘密鍵を逆算できてしまいます。
        2010年にあるゲーム機の署名実装でノンスが固定されていたことが発覚し、
        秘密鍵が公開される事態になりました。
      </div>
    </>
  )
}

/* =========================================
   Step 5: RSA-PSS — RSA署名の現代的方式
   ========================================= */
function RSAPSSExplain() {
  return (
    <>
      <p>
        RSA-PSS（Probabilistic Signature Scheme）は、
        RSA署名の<strong>現代的で安全な</strong>方式です。
        古い方式（PKCS#1 v1.5）に比べて数学的な安全性証明があります。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>PKCS#1 v1.5（旧方式）</h3>
          <ul>
            <li>パディングが決定的</li>
            <li>同じ入力→同じ署名</li>
            <li>いくつかの攻撃手法が存在</li>
            <li>後方互換性のため今も使用</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>RSA-PSS（推奨方式）</h3>
          <ul>
            <li>ランダムなソルトを含む</li>
            <li>同じ入力→毎回異なる署名</li>
            <li>安全性の数学的証明あり</li>
            <li>TLS 1.3で必須</li>
          </ul>
        </div>
      </div>

      <p>
        RSA-PSSでは署名のたびにランダムな<strong>ソルト</strong>が加わるため、
        同じメッセージに何度署名しても毎回異なる値が生成されます。
        この特性はECDSAのノンスと同様に、署名の安全性を高めています。
      </p>

      <div className="step-lesson__callout">
        <strong>使い分けの目安:</strong><br />
        新規のシステムでは<strong>ECDSA（P-256）</strong>を推奨します。
        鍵と署名が短く、性能も良いためです。
        既存のRSA鍵基盤がある場合は<strong>RSA-PSS</strong>を選びましょう。
        PKCS#1 v1.5は後方互換のためだけに使い、新規採用は避けてください。
      </div>
    </>
  )
}

/* =========================================
   Step 6: 署名生成・検証デモ（ECDSA）
   ========================================= */
function ECDSADemo() {
  const [message, setMessage] = useState('CryptoLabで学ぶデジタル署名')
  const [keyPair, setKeyPair] = useState<CryptoKeyPair | null>(null)
  const [pubKeyHex, setPubKeyHex] = useState('')
  const [signature, setSignature] = useState('')
  const [status, setStatus] = useState<'idle' | 'signing' | 'signed'>('idle')
  const [error, setError] = useState('')

  const generateKeyAndSign = async () => {
    setError('')
    setStatus('signing')
    try {
      const kp = await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign', 'verify']
      )
      setKeyPair(kp)

      const pubRaw = await crypto.subtle.exportKey('raw', kp.publicKey)
      setPubKeyHex(toHex(pubRaw))

      const enc = new TextEncoder()
      const sig = await crypto.subtle.sign(
        { name: 'ECDSA', hash: 'SHA-256' },
        kp.privateKey,
        enc.encode(message)
      )
      setSignature(toHex(sig))
      setStatus('signed')
    } catch (e) {
      setError(e instanceof Error ? e.message : '署名に失敗しました')
      setStatus('idle')
    }
  }

  return (
    <>
      <p>
        ECDSA（P-256）を使って実際にメッセージに署名してみましょう。
        ボタンを押すと鍵ペアの生成→署名生成が行われます。
      </p>

      <div className="step-lesson__demo-box">
        <label className="step-lesson__label">メッセージ</label>
        <input
          type="text"
          className="step-lesson__input"
          value={message}
          onChange={e => { setMessage(e.target.value); setStatus('idle') }}
        />

        <button
          className="step-lesson__btn"
          onClick={generateKeyAndSign}
          disabled={!message || status === 'signing'}
        >
          {status === 'signing' ? '署名中…' : '鍵を生成して署名する'}
        </button>

        {error && <p style={{ color: 'var(--sl-color-danger, #e53e3e)' }}>{error}</p>}

        {status === 'signed' && (
          <div style={{ marginTop: '1rem' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <strong>公開鍵（P-256, 65バイト）:</strong>
              <div className="step-lesson__mono" style={{ wordBreak: 'break-all', fontSize: '0.8rem' }}>
                {pubKeyHex}
              </div>
            </div>
            <div>
              <strong>署名値（r || s, 64バイト）:</strong>
              <div className="step-lesson__mono" style={{ wordBreak: 'break-all', fontSize: '0.8rem' }}>
                {signature}
              </div>
            </div>
            <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--sl-color-muted)' }}>
              同じメッセージでもう一度署名すると、ノンスが異なるため署名値が変わります。試してみてください。
            </p>
          </div>
        )}
      </div>
    </>
  )
}

/* =========================================
   Step 7: 改ざん検出デモ
   ========================================= */
function TamperDemo() {
  const [phase, setPhase] = useState<'sign' | 'tamper' | 'verify'>('sign')
  const [originalMsg, setOriginalMsg] = useState('振込先: CryptoLab銀行 口座: 1234567 金額: 50,000円')
  const [tamperedMsg, setTamperedMsg] = useState('')
  const [keyPair, setKeyPair] = useState<CryptoKeyPair | null>(null)
  const [signature, setSignature] = useState<ArrayBuffer | null>(null)
  const [signatureHex, setSignatureHex] = useState('')
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null)
  const [error, setError] = useState('')

  const handleSign = async () => {
    setError('')
    try {
      const kp = await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        false,
        ['sign', 'verify']
      )
      setKeyPair(kp)
      const enc = new TextEncoder()
      const sig = await crypto.subtle.sign(
        { name: 'ECDSA', hash: 'SHA-256' },
        kp.privateKey,
        enc.encode(originalMsg)
      )
      setSignature(sig)
      setSignatureHex(toHex(sig))
      setTamperedMsg(originalMsg)
      setPhase('tamper')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました')
    }
  }

  const handleVerify = async () => {
    if (!keyPair || !signature) return
    setError('')
    try {
      const enc = new TextEncoder()
      const valid = await crypto.subtle.verify(
        { name: 'ECDSA', hash: 'SHA-256' },
        keyPair.publicKey,
        signature,
        enc.encode(tamperedMsg)
      )
      setVerifyResult(valid)
      setPhase('verify')
    } catch (e) {
      setError(e instanceof Error ? e.message : '検証エラー')
    }
  }

  const handleReset = () => {
    setPhase('sign')
    setKeyPair(null)
    setSignature(null)
    setSignatureHex('')
    setVerifyResult(null)
    setTamperedMsg('')
  }

  return (
    <>
      <p>
        デジタル署名がどのように改ざんを検出するか体験しましょう。
        3ステップで進みます。
      </p>

      <div className="step-lesson__demo-box">
        {phase === 'sign' && (
          <>
            <label className="step-lesson__label">Phase 1: メッセージに署名する</label>
            <input
              type="text"
              className="step-lesson__input"
              value={originalMsg}
              onChange={e => setOriginalMsg(e.target.value)}
            />
            <button className="step-lesson__btn" onClick={handleSign}>
              署名する
            </button>
          </>
        )}

        {phase === 'tamper' && (
          <>
            <label className="step-lesson__label">Phase 2: 送信されたメッセージを改ざんしてみる</label>
            <p style={{ fontSize: '0.85rem', color: 'var(--sl-color-muted)' }}>
              署名済み。下のメッセージを書き換えてから検証してみましょう。
              （そのまま検証すれば成功します）
            </p>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>署名値:</strong>
              <div className="step-lesson__mono" style={{ wordBreak: 'break-all', fontSize: '0.75rem' }}>
                {truncateHex(signatureHex, 64)}
              </div>
            </div>
            <textarea
              className="step-lesson__input"
              rows={2}
              value={tamperedMsg}
              onChange={e => setTamperedMsg(e.target.value)}
              style={{ fontFamily: 'inherit' }}
            />
            <button className="step-lesson__btn" onClick={handleVerify}>
              署名を検証する
            </button>
          </>
        )}

        {phase === 'verify' && (
          <>
            <label className="step-lesson__label">Phase 3: 検証結果</label>
            <div
              style={{
                padding: '1rem',
                borderRadius: '8px',
                background: verifyResult
                  ? 'var(--sl-color-success-bg, #c6f6d5)'
                  : 'var(--sl-color-danger-bg, #fed7d7)',
                color: verifyResult
                  ? 'var(--sl-color-success, #22543d)'
                  : 'var(--sl-color-danger, #822727)',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                textAlign: 'center',
                marginBottom: '0.75rem',
              }}
            >
              {verifyResult ? '検証成功 — 署名は有効です' : '検証失敗 — 改ざんが検出されました'}
            </div>
            {!verifyResult && (
              <div style={{ fontSize: '0.85rem' }}>
                <strong>元のメッセージ:</strong>
                <div className="step-lesson__mono" style={{ fontSize: '0.8rem' }}>{originalMsg}</div>
                <strong>検証時のメッセージ:</strong>
                <div className="step-lesson__mono" style={{ fontSize: '0.8rem' }}>{tamperedMsg}</div>
                <p style={{ marginTop: '0.5rem' }}>
                  メッセージが変更されたため、ハッシュ値が変わり、署名の検証に失敗しました。
                </p>
              </div>
            )}
            <button className="step-lesson__btn" onClick={handleReset} style={{ marginTop: '0.5rem' }}>
              もう一度試す
            </button>
          </>
        )}

        {error && <p style={{ color: 'var(--sl-color-danger, #e53e3e)' }}>{error}</p>}
      </div>
    </>
  )
}

/* =========================================
   Step 8: ECDSA vs RSA-PSS ベンチマーク
   ========================================= */
type BenchResult = {
  pubKeySize: number
  sigSize: number
  elapsed: number
}

function BenchmarkDemo() {
  const [message, setMessage] = useState('ベンチマーク用メッセージ')
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle')
  const [ecdsa, setEcdsa] = useState<BenchResult | null>(null)
  const [rsa2048, setRsa2048] = useState<BenchResult | null>(null)
  const [rsa4096, setRsa4096] = useState<BenchResult | null>(null)
  const [error, setError] = useState('')

  const runBench = async () => {
    setError('')
    setStatus('running')
    setEcdsa(null)
    setRsa2048(null)
    setRsa4096(null)
    const enc = new TextEncoder()
    const msgBuf = enc.encode(message)

    try {
      // ECDSA P-256
      const t1 = performance.now()
      const ecKp = await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']
      )
      const ecPub = await crypto.subtle.exportKey('raw', ecKp.publicKey)
      const ecSig = await crypto.subtle.sign(
        { name: 'ECDSA', hash: 'SHA-256' }, ecKp.privateKey, msgBuf
      )
      setEcdsa({ pubKeySize: ecPub.byteLength, sigSize: ecSig.byteLength, elapsed: Math.round(performance.now() - t1) })

      // RSA-PSS 2048
      const t2 = performance.now()
      const rsa2Kp = await crypto.subtle.generateKey(
        { name: 'RSA-PSS', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
        true, ['sign', 'verify']
      )
      const rsa2Pub = await crypto.subtle.exportKey('spki', rsa2Kp.publicKey)
      const rsa2Sig = await crypto.subtle.sign(
        { name: 'RSA-PSS', saltLength: 32 }, rsa2Kp.privateKey, msgBuf
      )
      setRsa2048({ pubKeySize: rsa2Pub.byteLength, sigSize: rsa2Sig.byteLength, elapsed: Math.round(performance.now() - t2) })

      // RSA-PSS 4096
      const t3 = performance.now()
      const rsa4Kp = await crypto.subtle.generateKey(
        { name: 'RSA-PSS', modulusLength: 4096, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
        true, ['sign', 'verify']
      )
      const rsa4Pub = await crypto.subtle.exportKey('spki', rsa4Kp.publicKey)
      const rsa4Sig = await crypto.subtle.sign(
        { name: 'RSA-PSS', saltLength: 32 }, rsa4Kp.privateKey, msgBuf
      )
      setRsa4096({ pubKeySize: rsa4Pub.byteLength, sigSize: rsa4Sig.byteLength, elapsed: Math.round(performance.now() - t3) })

      setStatus('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ベンチマークに失敗しました')
      setStatus('idle')
    }
  }

  return (
    <>
      <p>
        同じメッセージに対して<strong>ECDSA P-256</strong>、<strong>RSA-PSS 2048</strong>、
        <strong>RSA-PSS 4096</strong>の3つで署名を行い、性能を比較します。
      </p>
      <p>
        なぜ差が出るのか？ RSAは巨大な整数（2048〜4096ビット）のべき乗剰余を計算するため、
        鍵生成に大きな素数探索が必要です。一方ECDSAは256ビットの楕円曲線上の点の演算で済むため、
        桁違いに高速です。鍵と署名のサイズにも同じ理由で大きな差が出ます。
      </p>

      <div className="step-lesson__demo-box">
        <label className="step-lesson__label">メッセージ</label>
        <input
          type="text"
          className="step-lesson__input"
          value={message}
          onChange={e => { setMessage(e.target.value); setStatus('idle') }}
        />

        <button
          className="step-lesson__btn"
          onClick={runBench}
          disabled={!message || status === 'running'}
        >
          {status === 'running' ? '計測中…（RSA鍵生成に数秒かかります）' : '3つのアルゴリズムで署名して比較する'}
        </button>

        {error && <p style={{ color: 'var(--sl-color-danger, #e53e3e)' }}>{error}</p>}

        {ecdsa && (
          <div style={{ marginTop: '1rem' }}>
            <div className="step-lesson__table-wrap">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>ECDSA P-256{status === 'running' ? '' : ''}</th>
                    <th>RSA-PSS 2048{!rsa2048 && status === 'running' ? '（計測中…）' : ''}</th>
                    <th>RSA-PSS 4096{!rsa4096 && status === 'running' ? '（計測中…）' : ''}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>公開鍵</strong></td>
                    <td>{ecdsa.pubKeySize} バイト</td>
                    <td>{rsa2048 ? `${rsa2048.pubKeySize} バイト` : '—'}</td>
                    <td>{rsa4096 ? `${rsa4096.pubKeySize} バイト` : '—'}</td>
                  </tr>
                  <tr>
                    <td><strong>署名</strong></td>
                    <td>{ecdsa.sigSize} バイト</td>
                    <td>{rsa2048 ? `${rsa2048.sigSize} バイト` : '—'}</td>
                    <td>{rsa4096 ? `${rsa4096.sigSize} バイト` : '—'}</td>
                  </tr>
                  <tr>
                    <td><strong>処理時間</strong></td>
                    <td>{ecdsa.elapsed} ms</td>
                    <td>{rsa2048 ? `${rsa2048.elapsed} ms` : '—'}</td>
                    <td>{rsa4096 ? `${rsa4096.elapsed} ms` : '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {status === 'done' && rsa4096 && (
              <div className="step-lesson__callout" style={{ marginTop: '0.75rem' }}>
                <strong>結果の読み方:</strong> ECDSAの署名は{ecdsa.sigSize}バイトですが、
                RSA-4096は{rsa4096.sigSize}バイトと<strong>{Math.round(rsa4096.sigSize / ecdsa.sigSize)}倍</strong>のサイズです。
                処理時間も{rsa4096.elapsed > ecdsa.elapsed
                  ? `ECDSAの約${Math.max(2, Math.round(rsa4096.elapsed / Math.max(1, ecdsa.elapsed)))}倍`
                  : 'ほぼ同等'}かかっています。
                TLSハンドシェイクのように署名を大量にやり取りする場面では、この差が通信速度に直結します。
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

/* =========================================
   Step 9: 実世界での応用
   ========================================= */
function RealWorldApplications() {
  return (
    <>
      <p>
        デジタル署名は、インターネットの信頼基盤としてあらゆるところで使われています。
      </p>

      <div className="step-lesson__table-wrap">
        <table>
          <thead>
            <tr>
              <th>応用</th>
              <th>署名の役割</th>
              <th>主なアルゴリズム</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>TLS/SSL証明書</strong></td>
              <td>サーバーの身元を証明</td>
              <td>ECDSA, RSA-PSS</td>
            </tr>
            <tr>
              <td><strong>コード署名</strong></td>
              <td>ソフトウェアが改ざんされていないことを保証</td>
              <td>RSA, ECDSA</td>
            </tr>
            <tr>
              <td><strong>Git コミット署名</strong></td>
              <td>コミットが本人によるものと証明</td>
              <td>RSA, Ed25519</td>
            </tr>
            <tr>
              <td><strong>JWT (JSON Web Token)</strong></td>
              <td>トークンの発行者と完全性を検証</td>
              <td>RS256, ES256</td>
            </tr>
            <tr>
              <td><strong>電子契約・電子署名</strong></td>
              <td>法的効力のある署名</td>
              <td>RSA-PSS, ECDSA</td>
            </tr>
            <tr>
              <td><strong>ファームウェア更新</strong></td>
              <td>メーカー正規の更新であることを検証</td>
              <td>ECDSA, Ed25519</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="step-lesson__callout">
        <strong>GitHubの「Verified」バッジ:</strong><br />
        GitHubでコミットに「Verified」と表示されるのは、
        コミットにデジタル署名が付いていることを意味します。
        GPGキーやSSHキーで署名すると、そのコミットが
        本当にアカウント所有者によるものだと証明できます。
      </div>
    </>
  )
}

/* =========================================
   Step 10: アルゴリズムの比較
   ========================================= */
function AlgorithmComparison() {
  return (
    <>
      <p>
        デジタル署名にはさまざまなアルゴリズムがあります。
        それぞれの特徴を比較しましょう。
      </p>

      <div className="step-lesson__table-wrap">
        <table>
          <thead>
            <tr>
              <th>アルゴリズム</th>
              <th>鍵長</th>
              <th>署名サイズ</th>
              <th>速度</th>
              <th>特徴</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>ECDSA (P-256)</strong></td>
              <td>256ビット</td>
              <td>64バイト</td>
              <td>速い</td>
              <td>TLS, JWT で広く使用</td>
            </tr>
            <tr>
              <td><strong>RSA-PSS</strong></td>
              <td>2048+ビット</td>
              <td>256バイト〜</td>
              <td>遅い（特に鍵生成）</td>
              <td>レガシー互換性が高い</td>
            </tr>
            <tr>
              <td><strong>Ed25519</strong></td>
              <td>256ビット</td>
              <td>64バイト</td>
              <td>非常に速い</td>
              <td>SSH, WireGuard で使用</td>
            </tr>
            <tr>
              <td><strong>ML-DSA (Dilithium)</strong></td>
              <td>大きい</td>
              <td>2〜4KB</td>
              <td>速い</td>
              <td>耐量子。NIST標準化済み</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="step-lesson__callout">
        <strong>Ed25519について:</strong><br />
        Ed25519はECDSAの改良版とも言える署名方式で、
        決定的な署名生成（ノンスの乱数依存なし）、高速な計算、
        簡潔な実装が特徴です。SSHの鍵として <code>ssh-keygen -t ed25519</code> で
        生成できます。WebCrypto APIでは未対応ですが、
        Node.js 18+では <code>crypto.subtle</code> で利用可能です。
      </div>

      <p>
        <strong>選び方の指針:</strong>{' '}
        新規システムでは<strong>Ed25519</strong>（利用可能なら）か<strong>ECDSA P-256</strong>を推奨します。
        耐量子性が求められる場合は<strong>ML-DSA</strong>を検討してください。
        RSA-PSSは既存のRSA鍵基盤がある場合に使いましょう。
      </p>
    </>
  )
}

/* =========================================
   ステップ定義
   ========================================= */
export default function SignaturePage() {
  usePageMeta({
    title: 'デジタル署名 | CryptoLab',
    description: 'ECDSA・RSA-PSSのデジタル署名を対話的に学ぶ。署名生成・検証・改ざん検出デモ付き。',
  })

  const steps: LessonStep[] = [
    {
      title: 'デジタル署名とは — 「実印」のたとえ',
      content: <WhatIsSignature />,
      quiz: {
        question: 'デジタル署名が手書き署名より優れている点は？',
        options: [
          { label: '署名が美しく見える' },
          { label: 'メッセージごとに異なる署名が生成され、数学的に検証できる', correct: true },
          { label: '紙が不要になる' },
          { label: '署名にかかる時間が短い' },
        ],
        explanation: 'デジタル署名はメッセージの内容と紐づくため、メッセージごとに異なる署名が生成されます。また、検証は主観的な目視ではなく数学的アルゴリズムで行われるため、客観的で確実です。',
      },
    },
    {
      title: '署名と暗号化の違い',
      content: <SignatureVsEncryption />,
      quiz: {
        question: 'デジタル署名とHMACの最大の違いは？',
        options: [
          { label: '署名のほうが計算が速い' },
          { label: '署名は暗号化もできる' },
          { label: '署名は公開鍵で検証でき、否認防止が可能', correct: true },
          { label: '署名はハッシュ関数を使わない' },
        ],
        explanation: 'HMACは共有秘密鍵で認証するため、送信者と受信者の区別がつきません。デジタル署名は秘密鍵で署名・公開鍵で検証するため、「署名者以外には作れない」ことが証明でき、否認防止が実現されます。',
      },
    },
    {
      title: '署名の仕組み — ハッシュ→署名',
      content: <HowSignatureWorks />,
      quiz: {
        question: 'デジタル署名でメッセージをハッシュ化する理由は？',
        options: [
          { label: 'ハッシュ化すると暗号化も同時にできるから' },
          { label: 'どんなサイズのメッセージも固定長に圧縮でき、署名アルゴリズムに入力できるから', correct: true },
          { label: 'ハッシュ値のほうが人間が読みやすいから' },
          { label: 'ハッシュ化しないと秘密鍵が漏洩するから' },
        ],
        explanation: 'RSAやECDSAの署名アルゴリズムは入力サイズに制限があります。SHA-256でハッシュ化すれば、1GBのファイルでも32バイトに圧縮でき、高速に署名できます。',
      },
    },
    {
      title: 'ECDSA — 楕円曲線デジタル署名',
      content: <ECDSAExplain />,
      quiz: {
        question: 'ECDSAのノンス（ランダム値k）の取り扱いで正しいのは？',
        options: [
          { label: 'ノンスは公開鍵と一緒に公開してよい' },
          { label: '同じノンスを使い回すと効率が良い' },
          { label: 'ノンスが漏洩・再利用されると秘密鍵が逆算される危険がある', correct: true },
          { label: 'ノンスは省略可能なオプション値' },
        ],
        explanation: 'ECDSAでノンスkが2回使われると、2つの署名から連立方程式が作れ、秘密鍵を逆算できてしまいます。ノンスの安全な生成は署名の安全性に直結します。',
      },
    },
    {
      title: 'RSA-PSS — RSA署名の現代的方式',
      content: <RSAPSSExplain />,
      quiz: {
        question: 'RSA-PSSがPKCS#1 v1.5より安全とされる理由は？',
        options: [
          { label: '鍵長がより長いから' },
          { label: '署名にランダムなソルトが含まれ、安全性の数学的証明があるから', correct: true },
          { label: '暗号化も同時に行えるから' },
          { label: 'ハッシュ関数を使わないから' },
        ],
        explanation: 'RSA-PSSはランダムなソルトにより同じメッセージでも毎回異なる署名が生成され、さらにRSA問題の困難性に基づく安全性の証明（provable security）があります。',
      },
    },
    {
      title: '署名生成デモ（ECDSA P-256）',
      content: <ECDSADemo />,
    },
    {
      title: '改ざん検出デモ',
      content: <TamperDemo />,
    },
    {
      title: 'ECDSA vs RSA-PSS — 性能比較ベンチマーク',
      content: <BenchmarkDemo />,
      quiz: {
        question: 'ECDSAがRSAより鍵と署名が小さい理由は？',
        options: [
          { label: 'ECDSAはハッシュ関数を使わないから' },
          { label: 'ECDSAは256ビットの楕円曲線演算で十分な安全性を達成でき、RSAのような巨大な整数が不要だから', correct: true },
          { label: 'ECDSAは圧縮アルゴリズムを内蔵しているから' },
          { label: 'RSAのほうが古い技術だから' },
        ],
        explanation: 'RSAの安全性は巨大な整数の素因数分解の困難性に依存するため、2048ビット以上の鍵が必要です。ECDSAは楕円曲線の離散対数問題に基づいており、256ビットで同等の安全性（128ビットセキュリティ）を実現できます。',
      },
    },
    {
      title: '実世界での応用',
      content: <RealWorldApplications />,
      quiz: {
        question: 'GitHubのコミットに「Verified」バッジが表示される条件は？',
        options: [
          { label: 'コミットがmainブランチにあること' },
          { label: 'コミットにデジタル署名が付与されていること', correct: true },
          { label: 'PRレビューが承認されていること' },
          { label: '2要素認証が有効なアカウントからのコミット' },
        ],
        explanation: 'GitHubの「Verified」バッジは、GPGキーやSSHキーによるデジタル署名が付いたコミットに表示されます。これにより、コミットが本当にそのアカウント所有者によるものだと証明されます。',
      },
    },
    {
      title: 'アルゴリズムの比較と選び方',
      content: <AlgorithmComparison />,
      quiz: {
        question: '新規システムでデジタル署名アルゴリズムを選ぶとき、最も推奨されるのは？',
        options: [
          { label: 'PKCS#1 v1.5（実績が最も長い）' },
          { label: 'Ed25519 または ECDSA P-256（短い鍵・署名で高速）', correct: true },
          { label: 'RSA-16384（鍵が長いほど安全）' },
          { label: 'MD5 + RSA（軽量で高速）' },
        ],
        explanation: 'Ed25519やECDSA P-256は、短い鍵長で十分な安全性を提供し、署名サイズも小さく高速です。PKCS#1 v1.5は既知の攻撃があり新規採用は推奨されません。MD5は衝突攻撃が実用化されており論外です。',
      },
    },
  ]

  return <StepLesson title="デジタル署名" steps={steps} lessonId="signature" />
}
