import { useEffect, useState } from 'react'
import StepLesson, { type LessonStep } from '../components/ui/StepLesson'
import '../components/ui/StepLesson.css'
import { usePageMeta } from '../hooks/usePageMeta'
import { aesGcmDecrypt, aesGcmEncrypt } from '@/lib/crypto/webcrypto'
import { base64ToBytes, bytesToBase64, bytesToUtf8, utf8ToBytes } from '@/utils/encoding'

/* =========================================
   ユーティリティ
   ========================================= */
const deriveKey = async (passphrase: string) => {
  const material = utf8ToBytes(passphrase)
  const digest = await crypto.subtle.digest('SHA-256', material)
  return new Uint8Array(digest)
}

const validatePassphrase = (value: string) => {
  if (!value.trim()) {
    throw new Error('パスフレーズを入力してください。')
  }
}

/* =========================================
   Step 1: 共通鍵暗号の基本原理
   たとえ話 → 定義 → 数学的定式化
   ========================================= */
function FundamentalPrinciple() {
  return (
    <>
      <p>
        共通鍵暗号を理解するには、まず「鍵付きの金庫」を想像してください。
        AliceとBobが同じ鍵を持つ金庫で手紙をやりとりする — これが共通鍵暗号の本質です。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: 共通鍵暗号（対称暗号）</strong><br />
        暗号化と復号に<strong>同一の鍵</strong>を使う暗号方式。
        送信者と受信者が事前に同じ鍵を共有している必要がある。
        英語では Symmetric-key cryptography。
      </div>

      <p>
        数学的には、共通鍵暗号は3つの関数で構成されます。
      </p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>鍵生成:</strong> Gen() → K（ランダムな鍵を生成）</div>
          <div><strong>暗号化:</strong> Enc(K, M) → C（平文Mを鍵Kで暗号文Cに変換）</div>
          <div><strong>復号:</strong> Dec(K, C) → M（暗号文Cを鍵Kで平文Mに復元）</div>
          <div style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-text-subtle)' }}>
            正しさの条件: 任意の鍵Kと平文Mについて Dec(K, Enc(K, M)) = M
          </div>
        </div>
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>ブロック暗号</h3>
          <ul>
            <li>固定長ブロック単位で処理</li>
            <li>AES（128bit）、DES（64bit）</li>
            <li>「モード」で任意長データに拡張</li>
            <li>並列処理に向くモードあり</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>ストリーム暗号</h3>
          <ul>
            <li>1ビット/1バイト単位で処理</li>
            <li>ChaCha20、RC4（非推奨）</li>
            <li>鍵ストリームとXORで暗号化</li>
            <li>低遅延の通信向き</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong>
        共通鍵暗号は「同じ鍵で暗号化・復号する」というシンプルな原理ですが、
        安全に使うには「鍵の配送」「モードの選択」「IVの管理」といった複数のレイヤーを正しく構成する必要があります。
        以降のステップで一つずつ掘り下げます。
      </div>
    </>
  )
}

/* =========================================
   Step 2: 鍵配送問題とその解決
   問題提起 → 歴史的アプローチ → 現代の解法
   ========================================= */
function KeyDistribution() {
  return (
    <>
      <p>
        Step 1の金庫のたとえを思い出してください。
        金庫で手紙を送れるのは便利ですが、そもそも<strong>合鍵をどうやって相手に渡すか</strong>という根本的な問題があります。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: 鍵配送問題（Key Distribution Problem）</strong><br />
        暗号化のために共通鍵が必要だが、共通鍵を安全に送るためにはすでに安全な通信路が必要 — という鶏と卵の問題。
        1976年以前、暗号技術者にとって最大の課題だった。
      </div>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div>Alice ─── 鍵K ───→ Bob</div>
          <div>　　　　　↑</div>
          <div>　　　盗聴者 Eve</div>
          <div>　　（鍵Kを傍受！）</div>
          <div style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-text-subtle)' }}>
            鍵が傍受されると、以降の全通信が解読される
          </div>
        </div>
      </div>

      <p>歴史的に、いくつかのアプローチが試みられてきました。</p>

      <ol>
        <li>
          <strong>物理的配送</strong> — 暗号鍵を紙やUSBに入れて直接手渡し。
          軍事・外交で長く使われたが、拡張性がない。
        </li>
        <li>
          <strong>信頼できる第三者（KDC）</strong> — Kerberosのように、鍵管理センターがセッション鍵を配布。
          KDCが単一障害点になる問題がある。
        </li>
        <li>
          <strong>公開鍵暗号による鍵交換（現代の解法）</strong> — 1976年、Diffie-Hellmanが
          「安全でない通信路上で安全に共通鍵を共有する」方法を発明。
          RSA、ECDH も同じ原理に基づく。
        </li>
      </ol>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>現代の鍵交換（TLS 1.3）</strong></div>
          <div>1. Alice と Bob が ECDH で共通秘密を共有</div>
          <div>2. HKDF で共通秘密から AES-GCM 用の鍵を導出</div>
          <div>3. AES-GCM でデータを暗号化</div>
          <div style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-text-subtle)' }}>
            Eveは公開鍵しか見えず、共通秘密を計算できない
          </div>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong>
        現代のインターネット通信では、公開鍵暗号は「鍵の配送」に、共通鍵暗号は「データの暗号化」に使います。
        この組み合わせを<strong>ハイブリッド暗号</strong>と呼びます。
        どちらか一方だけでは安全かつ高速な通信は実現できません。
      </div>
    </>
  )
}

/* =========================================
   Step 3: AEAD — 認証付き暗号とは何か
   なぜ暗号化だけでは不十分か → Before/After
   ========================================= */
function WhatIsAEAD() {
  return (
    <>
      <p>
        ここで重要な問いを考えます。「暗号文が第三者に読めなければ安全か？」
        答えは<strong>ノー</strong>です。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: AEAD（Authenticated Encryption with Associated Data）</strong><br />
        暗号化と同時に<strong>改ざん検知</strong>を行う暗号方式。
        暗号文が途中で書き換えられた場合、復号時に必ず失敗する。
        AES-GCM と ChaCha20-Poly1305 が代表的な AEAD。
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>暗号化のみ（AES-CBC等）</h3>
          <ul>
            <li>暗号文は読めない → 機密性 ✓</li>
            <li>暗号文が改ざんされても検知できない → 完全性 ✗</li>
            <li>パディング・オラクル攻撃で復号される危険</li>
            <li>「誰がこの暗号文を作ったか」が検証不可</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>AEAD（AES-GCM等）</h3>
          <ul>
            <li>暗号文は読めない → 機密性 ✓</li>
            <li>暗号文が1ビットでも変わると復号失敗 → 完全性 ✓</li>
            <li>認証タグで改ざんを検知</li>
            <li>AAD（Associated Data）でヘッダーも保護</li>
          </ul>
        </div>
      </div>

      <p>
        <strong>パディング・オラクル攻撃</strong>は暗号化のみの弱さを象徴する攻撃です。
        AES-CBCでは暗号文を少しずつ変えて復号を試み、サーバーのエラーメッセージから平文を1バイトずつ特定できます。
        2010年に発見されたこの攻撃は、ASP.NETやJavaのフレームワークに影響を与えました。
      </p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>AES-GCM の構造</strong></div>
          <div>┌──────────────────────────┐</div>
          <div>│ CTR モード: 平文 → 暗号文 　　│ ← 機密性</div>
          <div>│ GHASH: 暗号文 → 認証タグ 　　 │ ← 完全性</div>
          <div>│ AAD（追加認証データ）も入力 　　│ ← ヘッダー保護</div>
          <div>└──────────────────────────┘</div>
          <div style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-text-subtle)' }}>
            復号時: タグ検証 → 失敗なら平文を一切返さない
          </div>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong>
        2024年現在、新規実装で暗号化のみ（CBC, CTR単体）を使う理由はありません。
        必ず AES-GCM か ChaCha20-Poly1305 などの AEAD を使いましょう。
        「暗号化 = 安全」ではなく、<strong>「認証付き暗号化 = 安全」</strong>です。
      </div>
    </>
  )
}

/* =========================================
   Step 4: GCM の内部 — GHASH と認証タグ
   数学的背景を書籍レベルで解説
   ========================================= */
function GCMInternals() {
  return (
    <>
      <p>
        Step 3で「GCMは暗号化と認証を同時に行う」と学びました。
        ではGHASH（Galois Hash）がどのように認証タグを生成するのか、もう一段踏み込みましょう。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: GF(2<sup>128</sup>)（ガロア体）</strong><br />
        128ビットの値を「多項式」として扱い、加算（XOR）と乗算が定義された数学的構造。
        GCMの「G」はGaloisに由来する。通常の整数演算とは異なるルールで計算する。
      </div>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>GHASH の計算フロー</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            H = AES_K(0<sup>128</sup>)　← 鍵Kでゼロブロックを暗号化
          </div>
          <div style={{ marginTop: 'var(--spacing-xs)' }}>
            X<sub>0</sub> = 0<sup>128</sup>
          </div>
          <div>
            X<sub>i</sub> = (X<sub>i-1</sub> ⊕ A<sub>i</sub>) · H　← AADブロック
          </div>
          <div>
            X<sub>j</sub> = (X<sub>j-1</sub> ⊕ C<sub>j</sub>) · H　← 暗号文ブロック
          </div>
          <div>
            T = X<sub>final</sub> ⊕ AES_K(CTR<sub>0</sub>)　← 認証タグ
          </div>
        </div>
      </div>

      <p>
        ここで「·」はGF(2<sup>128</sup>)上の乗算です。
        核心は<strong>暗号文ブロックがすべてタグ計算に影響する</strong>ことです。
        暗号文を1ビットでも変えるとGHASHの出力が変わり、認証タグが一致しなくなります。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>なぜGF(2<sup>128</sup>)を使うのか</h3>
          <ul>
            <li>加算がXOR → ハードウェアで超高速</li>
            <li>乗算も CLMUL 命令で高速化可能</li>
            <li>体の性質により偽造確率が数学的に証明可能</li>
            <li>偽造成功確率 ≤ 1/2<sup>128</sup>（事実上ゼロ）</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>GCM の前提条件</h3>
          <ul>
            <li><strong>IV（Nonce）は絶対に再利用しない</strong></li>
            <li>推奨IV長は96ビット（12バイト）</li>
            <li>同じ鍵でのIV再利用 → Hが漏洩 → 全タグ偽造可能</li>
            <li>1つの鍵で暗号化するデータ量にも上限あり（2<sup>39</sup>-256 ビット）</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong>
        GCMの安全性は (1) AESブロック暗号の安全性、(2) GF(2<sup>128</sup>)の数学的性質、
        (3) IVの一意性、の3つに依存します。
        このうち<strong>IVの一意性だけが実装者の責任</strong>であり、ここが破られると全体が崩壊します。
      </div>
    </>
  )
}

/* =========================================
   Step 5: IV/Nonce の管理 — なぜ再利用が致命的か
   Before/After + 具体的な攻撃シナリオ
   ========================================= */
function IVManagement() {
  return (
    <>
      <p>
        Step 4で「IVを再利用するとHが漏洩し、全タグが偽造可能になる」と述べました。
        これは抽象的な話ではありません。具体的にどう壊れるか見てみましょう。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: IV / Nonce（初期化ベクトル / ナンス）</strong><br />
        暗号化のたびに使い捨てにするランダムまたは一意な値。
        同じ鍵で複数のメッセージを暗号化しても、IVが異なれば異なる暗号文になる。
        Nonceは "Number used ONCE" の略。
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>危険な実装（Before）</h3>
          <ul>
            <li><code>iv = [0, 0, ..., 0]</code>（固定IV）</li>
            <li><code>iv = counter</code>（予測可能なカウンタ）</li>
            <li>IVを鍵から導出（鍵が同じならIVも同じ）</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>安全な実装（After）</h3>
          <ul>
            <li><code>iv = crypto.getRandomValues(new Uint8Array(12))</code></li>
            <li>96ビットランダム → 2<sup>48</sup>回まで衝突確率無視可能</li>
            <li>暗号文と一緒にIVを保存/送信</li>
          </ul>
        </div>
      </div>

      <p>
        <strong>攻撃シナリオ: AES-GCMでIVを再利用した場合</strong>
      </p>
      <ol>
        <li>同じ鍵K・同じIVで平文M<sub>1</sub>とM<sub>2</sub>を暗号化 → C<sub>1</sub>, C<sub>2</sub></li>
        <li>C<sub>1</sub> ⊕ C<sub>2</sub> = M<sub>1</sub> ⊕ M<sub>2</sub>（鍵ストリームが相殺される）</li>
        <li>片方の平文が既知なら、もう片方が完全に復元される</li>
        <li>さらにGHASH鍵Hも復元でき、任意の認証タグを偽造可能</li>
      </ol>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>IV再利用 → 完全崩壊</strong></div>
          <div>C<sub>1</sub> = M<sub>1</sub> ⊕ AES(K, IV||ctr)</div>
          <div>C<sub>2</sub> = M<sub>2</sub> ⊕ AES(K, IV||ctr)　← 同じIVなので同じ鍵ストリーム</div>
          <div>C<sub>1</sub> ⊕ C<sub>2</sub> = M<sub>1</sub> ⊕ M<sub>2</sub>　← 鍵ストリームが消える!</div>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong>
        IV管理の鉄則は3つ。
        (1) 毎回 <code>crypto.getRandomValues()</code> でランダム生成する。
        (2) IVは秘密にする必要はなく、暗号文の先頭にそのまま付加してよい。
        (3) 同じ鍵で2<sup>32</sup>回（約43億回）以上暗号化する場合は鍵をローテーションする。
      </div>
    </>
  )
}

/* =========================================
   Step 6: AES-GCM インタラクティブデモ
   暗号化 + 改ざん検知を体験
   ========================================= */
function InteractiveDemo() {
  const defaultText = 'AES-GCM は IV の再利用が禁止。毎回ランダム生成しましょう。'
  const [plaintext, setPlaintext] = useState(defaultText)
  const [passphrase, setPassphrase] = useState('cryptolab-demo')
  const [ivBase64, setIvBase64] = useState('')
  const [cipherBase64, setCipherBase64] = useState('')
  const [decryptedText, setDecryptedText] = useState('')
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState<'info' | 'error'>('info')
  const [isProcessing, setIsProcessing] = useState(false)

  const setStatus = (message: string, type: 'info' | 'error' = 'info') => {
    setFeedback(message)
    setFeedbackType(type)
  }

  const handleEncrypt = async () => {
    try {
      validatePassphrase(passphrase)
      if (!plaintext.trim()) {
        throw new Error('暗号化するテキストを入力してください。')
      }
      setIsProcessing(true)
      const key = await deriveKey(passphrase)
      const data = utf8ToBytes(plaintext)
      const result = await aesGcmEncrypt(key, data)
      const iv64 = bytesToBase64(result.iv)
      const ct64 = bytesToBase64(result.ct)
      setIvBase64(iv64)
      setCipherBase64(ct64)
      setDecryptedText('')
      setStatus('暗号化に成功しました。IVは毎回ランダム生成されていることを確認してください。')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '暗号化に失敗しました。', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDecrypt = async () => {
    try {
      validatePassphrase(passphrase)
      if (!ivBase64.trim() || !cipherBase64.trim()) {
        throw new Error('IV と暗号文（Base64）を入力してください。')
      }
      setIsProcessing(true)
      const key = await deriveKey(passphrase)
      const iv = base64ToBytes(ivBase64)
      const ct = base64ToBytes(cipherBase64)
      const result = await aesGcmDecrypt(key, iv, ct)
      setDecryptedText(bytesToUtf8(result))
      setStatus('復号に成功しました。', 'info')
    } catch (error) {
      setStatus(
        error instanceof Error && error.message.includes('operation')
          ? '認証タグの検証に失敗しました。暗号文が改ざんされた可能性があります。'
          : (error instanceof Error ? error.message : '復号に失敗しました。'),
        'error'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTamper = () => {
    if (!cipherBase64) {
      setStatus('先に暗号化を実行してください。', 'error')
      return
    }
    // Flip one character in the Base64 ciphertext
    const chars = cipherBase64.split('')
    const idx = Math.min(10, chars.length - 1)
    chars[idx] = chars[idx] === 'A' ? 'B' : 'A'
    setCipherBase64(chars.join(''))
    setDecryptedText('')
    setStatus('暗号文を1文字改ざんしました。復号ボタンを押して結果を確認してください。', 'info')
  }

  return (
    <>
      <p>
        ここまで学んだ概念を実際に体験しましょう。
        暗号化 → 復号の基本動作に加え、<strong>「改ざん」ボタンで暗号文を壊してから復号</strong>すると、
        AES-GCMの認証機能を体感できます。
      </p>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>

        <label htmlFor="sym-passphrase">パスフレーズ</label>
        <input
          id="sym-passphrase"
          type="text"
          placeholder="cryptolab-demo"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
        />

        <label htmlFor="sym-plaintext">平文テキスト</label>
        <textarea
          id="sym-plaintext"
          rows={3}
          value={plaintext}
          onChange={(e) => setPlaintext(e.target.value)}
          placeholder="ここに暗号化したいテキストを入力"
        />

        <div className="step-lesson__demo-actions">
          <button
            type="button"
            onClick={handleEncrypt}
            disabled={isProcessing}
            className="step-lesson__demo-btn step-lesson__demo-btn--primary"
          >
            暗号化
          </button>
          <button
            type="button"
            onClick={handleTamper}
            disabled={isProcessing || !cipherBase64}
            className="step-lesson__demo-btn step-lesson__demo-btn--secondary"
          >
            改ざん
          </button>
          <button
            type="button"
            onClick={handleDecrypt}
            disabled={isProcessing}
            className="step-lesson__demo-btn step-lesson__demo-btn--secondary"
          >
            復号
          </button>
        </div>

        {feedback && (
          <div className={`step-lesson__quiz-feedback ${
            feedbackType === 'error' ? 'step-lesson__quiz-feedback--wrong' : 'step-lesson__quiz-feedback--correct'
          }`}>
            {feedback}
          </div>
        )}

        <label>IV（Base64）</label>
        <textarea
          rows={2}
          value={ivBase64}
          onChange={(e) => setIvBase64(e.target.value)}
          placeholder="暗号化で生成された IV（毎回異なる値）"
        />

        <label>暗号文（Base64）</label>
        <textarea
          rows={3}
          value={cipherBase64}
          onChange={(e) => setCipherBase64(e.target.value)}
          placeholder="暗号化で生成された暗号文"
        />

        <label>復号結果</label>
        <div className="step-lesson__demo-result">
          {decryptedText || '（復号結果がここに表示されます）'}
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>試してみよう:</strong>
        (1) 暗号化 → 復号で正しく戻ることを確認。
        (2) 「改ざん」→「復号」で認証失敗を確認。
        (3) パスフレーズを変えて復号 → 鍵が違うと復号できないことを確認。
        (4) 同じテキストを2回暗号化 → IVが毎回変わり、暗号文も変わることを確認。
      </div>
    </>
  )
}

/* =========================================
   Step 7: 共通鍵暗号の安全な使い方チェックリスト
   Before/After + 実務のベストプラクティス
   ========================================= */
function SecurityChecklist() {
  return (
    <>
      <p>
        共通鍵暗号を正しく使うには、アルゴリズムの選択だけでなく
        <strong>運用上の注意点</strong>を網羅する必要があります。
        実務で遭遇する典型的な間違いと正しい方法を対比します。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>危険な実装（Before）</h3>
          <ol>
            <li>AES-ECBで暗号化する</li>
            <li>AES-CBCを認証なしで使う</li>
            <li>パスワードをSHA-256で直接鍵にする</li>
            <li>IVを固定値にする</li>
            <li>暗号文の改ざんをチェックしない</li>
            <li>鍵をソースコードにハードコード</li>
          </ol>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>安全な実装（After）</h3>
          <ol>
            <li>AES-GCM か ChaCha20-Poly1305 を使う</li>
            <li>AEADモードを選び認証タグを必ず検証</li>
            <li>PBKDF2/Argon2でソルト+ストレッチング</li>
            <li>毎回 <code>crypto.getRandomValues()</code></li>
            <li>復号前に認証タグを検証（AEADが自動で行う）</li>
            <li>鍵は環境変数やKMS（Key Management Service）で管理</li>
          </ol>
        </div>
      </div>

      <p>
        <strong>鍵のライフサイクル管理</strong>も見落とされがちですが極めて重要です。
      </p>

      <ul>
        <li>
          <strong>鍵の生成</strong> — 必ずCSPRNG（暗号論的擬似乱数生成器）を使う。
          <code>Math.random()</code> は暗号用途には使えない。
        </li>
        <li>
          <strong>鍵のローテーション</strong> — 同じ鍵で暗号化するデータ量・期間に上限を設ける。
          AES-GCMでは1つの鍵で2<sup>32</sup>回を超える暗号化は非推奨。
        </li>
        <li>
          <strong>鍵の破棄</strong> — 使用済みの鍵はメモリから確実にゼロクリアする。
          GCによる自動解放では不十分（メモリ上に残存する可能性）。
        </li>
        <li>
          <strong>Perfect Forward Secrecy（PFS）</strong> — セッションごとに一時鍵（ephemeral key）を使う。
          長期鍵が漏洩しても、過去のセッションは解読されない。TLS 1.3 では PFS が必須。
        </li>
      </ul>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong>
        「正しいアルゴリズムを選ぶ」は半分に過ぎません。
        鍵の生成・保管・ローテーション・破棄まで含めた<strong>ライフサイクル全体</strong>を管理することが、
        実務での暗号セキュリティです。
      </div>
    </>
  )
}

/* =========================================
   Step 8: 共通鍵暗号の全体像と他手法との関係
   まとめ + 次の学習への橋渡し
   ========================================= */
function BigPicture() {
  return (
    <>
      <p>
        最後に、共通鍵暗号が暗号技術の全体像のどこに位置するかを整理しましょう。
      </p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>暗号技術の体系</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            ┌─ 共通鍵暗号（AES, ChaCha20）← このページ
          </div>
          <div>
            │　　├─ ブロック暗号 + モード（GCM, CBC, CTR）
          </div>
          <div>
            │　　└─ ストリーム暗号（ChaCha20）
          </div>
          <div>
            ├─ 公開鍵暗号（RSA, ECDH, ECDSA）
          </div>
          <div>
            │　　├─ 暗号化（RSA-OAEP）
          </div>
          <div>
            │　　├─ 鍵交換（ECDH, DH）
          </div>
          <div>
            │　　└─ デジタル署名（ECDSA, Ed25519）
          </div>
          <div>
            ├─ ハッシュ関数（SHA-256, SHA-3）
          </div>
          <div>
            │　　├─ HMAC（メッセージ認証）
          </div>
          <div>
            │　　└─ KDF（PBKDF2, HKDF, Argon2）
          </div>
          <div>
            └─ ポスト量子暗号（Kyber, Dilithium）
          </div>
        </div>
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>共通鍵暗号の強み</h3>
          <ul>
            <li>高速（AES-NI対応で10 Gbps以上）</li>
            <li>ハードウェア支援が充実</li>
            <li>量子コンピュータへの耐性が比較的高い</li>
            <li>AES-256はGrover攻撃後も128bit安全性</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>共通鍵暗号の限界</h3>
          <ul>
            <li>鍵配送問題（公開鍵暗号で解決）</li>
            <li>署名・否認防止はできない</li>
            <li>N人の通信にN(N-1)/2個の鍵が必要</li>
            <li>「誰が暗号化したか」の証明ができない</li>
          </ul>
        </div>
      </div>

      <p>
        <strong>AES-GCM vs ChaCha20-Poly1305</strong> — どちらも AEAD であり安全性は同等です。
        AES-NI がある環境（ほとんどのPC/サーバー）ではAES-GCMが高速ですが、
        AES-NIがない環境（古いモバイルデバイス等）ではChaCha20-Poly1305のほうが高速かつ
        サイドチャネル攻撃に強いです。TLS 1.3 ではどちらもサポートされています。
      </p>

      <div className="step-lesson__callout">
        <strong>次のステップ:</strong>
        共通鍵暗号を理解したら、以下のページでさらに深掘りできます。
        <strong>AES</strong>ページで内部構造（SubBytes/ShiftRows/MixColumns）の詳細を、
        <strong>ハッシュ関数</strong>ページでSHA-256とその応用（HMAC, KDF）を、
        <strong>公開鍵暗号</strong>ページでECDHによる鍵交換の仕組みを学びましょう。
      </div>
    </>
  )
}

/* =========================================
   メインコンポーネント
   ========================================= */
export default function SymmetricPage() {
  usePageMeta({ title: '共通鍵暗号', description: 'AES-GCMやAEADなど、共通鍵暗号の原理と実践を学ぶ' })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const steps: LessonStep[] = [
    {
      title: '共通鍵暗号の基本原理',
      content: <FundamentalPrinciple />,
      quiz: {
        question: '共通鍵暗号の「正しさの条件」を正しく表しているのはどれ？',
        options: [
          { label: '任意のMについて Enc(K, M) ≠ M であること' },
          { label: '任意のKとMについて Dec(K, Enc(K, M)) = M であること', correct: true },
          { label: '任意のCについて Enc(K, Dec(K, C)) ≠ C であること' },
          { label: '鍵Kなしでも Dec(C) = M が可能であること' },
        ],
        explanation: '正解！正しい鍵Kで暗号化した暗号文を、同じ鍵Kで復号すると元の平文Mに戻る — これが共通鍵暗号の正しさの条件（correctness）です。',
      },
    },
    {
      title: '鍵配送問題とその解決',
      content: <KeyDistribution />,
      quiz: {
        question: '現代のインターネット通信（TLS 1.3）で鍵配送問題はどう解決されているか？',
        options: [
          { label: '共通鍵を物理的に配送する' },
          { label: '鍵管理センター（KDC）が全ユーザーの鍵を管理する' },
          { label: 'ECDHで共通鍵を共有し、AES-GCMでデータを暗号化するハイブリッド構成', correct: true },
          { label: '共通鍵を使わず、全データを公開鍵暗号で暗号化する' },
        ],
        explanation: '正解！TLS 1.3ではECDH（公開鍵暗号）で共通秘密を共有し、HKDFで共通鍵を導出し、AES-GCM（共通鍵暗号）でデータを暗号化するハイブリッド構成を採用しています。公開鍵暗号だけでは遅すぎ、共通鍵暗号だけでは鍵を安全に共有できないためです。',
      },
    },
    {
      title: 'AEAD — 暗号化だけでは不十分',
      content: <WhatIsAEAD />,
      quiz: {
        question: 'AES-CBC（暗号化のみ）に存在し、AES-GCM（AEAD）では防げる攻撃はどれ？',
        options: [
          { label: 'ブルートフォース攻撃（総当たり）' },
          { label: 'パディング・オラクル攻撃', correct: true },
          { label: 'サイドチャネル攻撃' },
          { label: '量子コンピュータによる攻撃' },
        ],
        explanation: '正解！パディング・オラクル攻撃は、暗号文を少しずつ変えて復号を試み、パディングのエラーメッセージから平文を特定する攻撃です。AES-GCMでは認証タグの検証が最初に行われるため、改ざんされた暗号文は一切復号されません。',
      },
    },
    {
      title: 'GCMの内部 — GHASHと認証タグ',
      content: <GCMInternals />,
      quiz: {
        question: 'AES-GCMの認証タグ生成で使われるGHASHの計算基盤は？',
        options: [
          { label: '整数の剰余演算（mod演算）' },
          { label: 'GF(2¹²⁸)（ガロア体）上の多項式演算', correct: true },
          { label: '楕円曲線上の点の加算' },
          { label: 'SHA-256ハッシュ関数' },
        ],
        explanation: '正解！GHASHはGF(2¹²⁸)上の乗算を使って認証タグを計算します。この数学的構造により、加算がXOR、乗算がCLMUL命令で実装でき、高速かつ安全性が数学的に証明可能です。',
      },
    },
    {
      title: 'IV/Nonceの管理 — 再利用は致命的',
      content: <IVManagement />,
      quiz: {
        question: 'AES-GCMで同じ鍵・同じIVを使って2つのメッセージを暗号化すると何が起きる？',
        options: [
          { label: '2つの暗号文が同じになるだけで安全性に影響はない' },
          { label: '暗号化速度が低下する' },
          { label: '鍵ストリームが同じになり、平文のXORが漏洩し、認証タグも偽造可能になる', correct: true },
          { label: '復号時にエラーが発生する' },
        ],
        explanation: '正解！同じ鍵とIVでは同じ鍵ストリームが生成されるため、C₁⊕C₂ = M₁⊕M₂ となり平文の情報が漏洩します。さらにGHASH鍵Hも復元でき、任意の認証タグを偽造できます。これは完全な暗号の崩壊です。',
      },
    },
    {
      title: 'AES-GCM を実際に試す',
      content: <InteractiveDemo />,
    },
    {
      title: '安全な実装チェックリスト',
      content: <SecurityChecklist />,
      quiz: {
        question: '鍵管理で最も危険な行為はどれ？',
        options: [
          { label: '256ビットの鍵を使うこと' },
          { label: '鍵をソースコードにハードコードすること', correct: true },
          { label: 'AES-GCMを選択すること' },
          { label: '鍵を定期的にローテーションすること' },
        ],
        explanation: '正解！鍵のハードコードはソースコードの漏洩=鍵の漏洩を意味します。鍵は環境変数やKMS（AWS KMS, Google Cloud KMS等）で管理し、ソースコードには一切含めないのが鉄則です。',
      },
    },
    {
      title: '共通鍵暗号の全体像',
      content: <BigPicture />,
      quiz: {
        question: 'AES-GCMに対するChaCha20-Poly1305の利点は？',
        options: [
          { label: '鍵長がより長い' },
          { label: '量子コンピュータに耐性がある' },
          { label: 'AES-NI非対応環境でも高速かつサイドチャネル攻撃に強い', correct: true },
          { label: 'ブロック暗号なので並列処理に向く' },
        ],
        explanation: '正解！ChaCha20-Poly1305はソフトウェア実装でもタイミング攻撃に強い設計です。AES-NIがないモバイルデバイスなどではAES-GCMより高速です。安全性は同等であり、TLS 1.3では両方がサポートされています。',
      },
    },
  ]

  return (
    <main className="page symmetric">
      <StepLesson
        lessonId="symmetric"
        title="共通鍵暗号: 理論と実践"
        steps={steps}
      />
    </main>
  )
}
