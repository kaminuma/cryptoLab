import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import StepLesson, { type LessonStep } from '../components/ui/StepLesson'
import '../components/ui/StepLesson.css'

/* =========================================
   Step 1: 暗号化とは何か — 手紙のたとえ
   たとえ話 → 用語定義 → Before/After → ここがポイント
   ========================================= */
function WhatIsEncryption() {
  const [plaintext, setPlaintext] = useState('Hello')
  const [key, setKey] = useState(42)
  const [ciphertext, setCiphertext] = useState('')

  useEffect(() => {
    const encrypted = Array.from(plaintext)
      .map(ch => {
        const code = ch.charCodeAt(0)
        return String.fromCharCode(code ^ key)
      })
      .join('')
    setCiphertext(
      Array.from(encrypted)
        .map(ch => ch.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(' ')
    )
  }, [plaintext, key])

  const decrypted = Array.from(plaintext)
    .map(ch => {
      const code = ch.charCodeAt(0) ^ key
      return String.fromCharCode(code ^ key)
    })
    .join('')

  return (
    <>
      <p>
        友人に秘密の手紙を送りたいとします。
        郵便配達員に中身を読まれないように、あなたと友人だけが知っている「ルール」で文字を置き換えます。
        受け取った友人は同じルールを逆に使い、元の手紙に戻します。
        これが<strong>暗号化</strong>の本質です。
      </p>

      <div className="step-lesson__callout">
        <strong>用語定義</strong><br />
        <strong>平文 (Plaintext):</strong> 保護したい元のデータ。<br />
        <strong>暗号文 (Ciphertext):</strong> 暗号化後のデータ。第三者には意味不明。<br />
        <strong>鍵 (Key):</strong> 暗号化・復号化に使う秘密の情報。<br />
        <strong>暗号化 (Encryption):</strong> C = E(K, P) — 鍵を使って平文を暗号文に変換。<br />
        <strong>復号化 (Decryption):</strong> P = D(K, C) — 鍵を使って暗号文を平文に戻す。
      </div>

      <h3>暗号化が解決する4つの問題</h3>
      <p>暗号技術は「データを隠す」だけではありません。現代の暗号は4つの根本的な問題を解決します。</p>
      <ul>
        <li><strong>機密性 (Confidentiality):</strong> 通信内容を第三者に読まれない</li>
        <li><strong>完全性 (Integrity):</strong> データが途中で書き換えられていないことを保証</li>
        <li><strong>認証 (Authentication):</strong> 通信相手が本物であることを確認</li>
        <li><strong>否認防止 (Non-repudiation):</strong> 送信者が「送っていない」と否定できなくする</li>
      </ul>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>
        <p style={{ marginBottom: 'var(--spacing-md)', fontSize: '0.95rem' }}>
          XOR暗号のデモ: 各文字のバイト値を鍵の値でXOR演算します。同じ操作をもう一度行うと元に戻る — これが対称鍵暗号の基本原理です。
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <div>
            <label>平文:</label>
            <input
              type="text"
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              placeholder="暗号化する文字を入力"
            />
          </div>
          <div>
            <label>鍵 (0-255):</label>
            <input
              type="number"
              min={0}
              max={255}
              value={key}
              onChange={(e) => setKey(Number(e.target.value) & 0xff)}
            />
          </div>
        </div>
        <div style={{ marginTop: 'var(--spacing-md)' }}>
          <label>暗号文 (16進数):</label>
          <div className="step-lesson__demo-result">{ciphertext || '(空)'}</div>
        </div>
        <div style={{ marginTop: 'var(--spacing-sm)' }}>
          <label>復号結果 (XOR をもう一度):</label>
          <div className="step-lesson__demo-result">{decrypted}</div>
        </div>
        <div style={{
          marginTop: 'var(--spacing-sm)',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '0.85rem',
          background: 'color-mix(in srgb, var(--color-secondary) 8%, transparent)',
          color: 'var(--color-text-muted)',
        }}>
          XOR演算: P XOR K = C, C XOR K = P — 同じ鍵で2回XORすると元に戻ります。鍵を変えると暗号文が全く変わることを確認してみてください。
        </div>
      </div>

      <h3>Kerckhoffsの原理 (1883)</h3>
      <p>
        Auguste Kerckhoffsが提唱した暗号設計の基本原則:
        「暗号システムは、鍵以外のすべてが公開されても安全でなければならない」。
        現代暗号では<strong>アルゴリズムは公開し、鍵のみを秘密にする</strong>のが鉄則です。
        「仕組みを隠すことで安全にする」（セキュリティ・バイ・オブスキュリティ）は、
        いずれ仕組みが漏洩するため推奨されません。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>Before: 古典的な考え方</h3>
          <ul>
            <li>暗号のアルゴリズムを秘密にする</li>
            <li>仕組みが漏れたら全滅</li>
            <li>専門家による検証が不可能</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>After: Kerckhoffsの原理</h3>
          <ul>
            <li>アルゴリズムは公開、鍵だけ秘密</li>
            <li>鍵を変えるだけで安全性を回復</li>
            <li>世界中の専門家が検証・改善</li>
          </ul>
        </div>
      </div>

      <p>
        <strong>ここがポイント:</strong> 上のデモで鍵を変えると暗号文が完全に変わりました。
        アルゴリズム（XOR演算）は公開されていても、鍵が秘密なら暗号文から平文は推測できません。
        これがKerckhoffsの原理の直感的な意味です。ただし実用には、XOR単体では不十分で、
        より強力なアルゴリズムが必要になります — それが次のステップ以降のテーマです。
      </p>
    </>
  )
}

/* =========================================
   Step 2: 共通鍵暗号 vs 公開鍵暗号
   たとえ話 → 用語定義 → Before/After → ここがポイント
   ========================================= */
function SymmetricVsAsymmetric() {
  return (
    <>
      <p>
        共通鍵暗号は「二人だけが知っている合言葉」のようなものです。
        高速で効率的ですが、合言葉をどうやって安全に相手に伝えるかという
        <strong>鍵配送問題</strong>が生じます。
        100人のグループなら、4,950個もの異なる合言葉が必要になります（n(n-1)/2）。
      </p>

      <div className="step-lesson__callout">
        <strong>用語定義</strong><br />
        <strong>共通鍵暗号（対称鍵暗号）:</strong> 暗号化と復号化に同じ鍵を使う方式。AES、ChaCha20など。<br />
        <strong>公開鍵暗号（非対称鍵暗号）:</strong> 暗号化用の公開鍵と復号用の秘密鍵を分離する方式。RSA、ECDHなど。<br />
        <strong>鍵配送問題:</strong> 共通鍵暗号で事前に鍵を安全に共有する方法の困難さ。
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>共通鍵暗号（対称鍵）</h3>
          <ul>
            <li><strong>速度:</strong> 非常に高速（ハードウェアアクセラレーション対応）</li>
            <li><strong>鍵長:</strong> 128-256ビット（短い）</li>
            <li><strong>弱点:</strong> 鍵配送問題、n人でn(n-1)/2個の鍵</li>
            <li><strong>代表例:</strong> AES-256-GCM, ChaCha20-Poly1305</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>公開鍵暗号（非対称鍵）</h3>
          <ul>
            <li><strong>速度:</strong> 共通鍵の1,000〜10,000倍遅い</li>
            <li><strong>鍵長:</strong> 2048-4096ビット（RSA）/ 256ビット（ECC）</li>
            <li><strong>強み:</strong> 鍵配送問題の解決</li>
            <li><strong>代表例:</strong> RSA, ECDH, Ed25519</li>
          </ul>
        </div>
      </div>

      <h3>公開鍵暗号の発明 — 暗号学のパラダイムシフト</h3>
      <p>
        1976年、Whitfield DiffieとMartin Hellmanが革命的なアイデアを発表しました。
        「公開してもよい鍵と、秘密にする鍵を数学的に関連付ける」。
        たとえるなら、<strong>開いた南京錠を世界中にばらまく</strong>ようなものです。
        誰でも南京錠で箱を閉じられますが、鍵を持つあなただけが開けられます。
      </p>
      <ol>
        <li>各ユーザーは公開鍵（南京錠）と秘密鍵（鍵）のペアを生成</li>
        <li>公開鍵は誰にでも配布してよい</li>
        <li>送信者は受信者の公開鍵で暗号化</li>
        <li>受信者は自分の秘密鍵でのみ復号化できる</li>
      </ol>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong> 共通鍵暗号と公開鍵暗号は「どちらが優れているか」ではありません。
        それぞれの強みを活かし、弱みを補い合う関係です。次のステップで見るハイブリッド暗号は、
        まさにこの2つの「いいとこ取り」をしたものです。
      </div>

      <p>
        各アルゴリズムの詳しい仕組み:
        AESは<Link to="/aes">AES共通鍵暗号ページ</Link>で、
        RSA・ECCは<Link to="/rsa">RSA公開鍵暗号ページ</Link>で、
        インタラクティブに学べます。
      </p>
    </>
  )
}

/* =========================================
   Step 3: ハイブリッド暗号・ハッシュ関数・暗号の3本柱
   ========================================= */
function ThreePillars() {
  return (
    <>
      <p>
        現実の暗号システムは、1つの技術だけでは成り立ちません。
        HTTPS通信を例にとると、ブラウザがWebサイトに接続するたびに、
        <strong>3つの異なる暗号技術</strong>が連携して動いています。
      </p>

      <h3>暗号の3本柱</h3>
      <div className="step-lesson__visual">
        <div className="step-lesson__visual-flow">
          <div><strong>第1の柱: 共通鍵暗号</strong> — データの高速な暗号化</div>
          <div><strong>第2の柱: 公開鍵暗号</strong> — 鍵の安全な共有・デジタル署名</div>
          <div><strong>第3の柱: ハッシュ関数</strong> — データの完全性検証・「指紋」の生成</div>
        </div>
      </div>

      <h3>ハイブリッド暗号 — 3つの柱の共演</h3>
      <p>
        TLS 1.3のハンドシェイクでは、これら3つの柱が以下のように連携します。
      </p>
      <ol>
        <li><strong>公開鍵暗号:</strong> ECDH鍵交換（X25519）で、盗聴者がいても安全にセッション鍵を共有</li>
        <li><strong>共通鍵暗号:</strong> 共有したセッション鍵でAES-256-GCMまたはChaCha20-Poly1305による高速暗号化</li>
        <li><strong>ハッシュ関数:</strong> SHA-256/SHA-384でメッセージの完全性を検証し、鍵導出にもHKDFとして使用</li>
        <li><strong>PFS (Perfect Forward Secrecy):</strong> セッション終了後にセッション鍵を破棄。長期鍵が将来漏洩しても過去の通信は安全</li>
      </ol>

      <div className="step-lesson__callout">
        <strong>用語: ハッシュ関数</strong> — 任意のデータを固定長の「指紋」に変換する一方向関数。
        同じ入力には常に同じ出力を返すが、出力から入力を逆算することは不可能。
        SHA-256なら常に256ビット（64桁の16進数）を出力する。
        詳しくは<Link to="/hash">ハッシュ関数の専門ページ</Link>で、Merkle-Damgard構造やスポンジ構造を含めて解説しています。
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>Before: 単一技術だけの場合</h3>
          <ul>
            <li>共通鍵のみ: 鍵をどう渡す？</li>
            <li>公開鍵のみ: 遅くて大量データに不向き</li>
            <li>ハッシュのみ: 暗号化機能がない</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>After: ハイブリッド暗号</h3>
          <ul>
            <li>公開鍵で安全に鍵交換</li>
            <li>共通鍵で高速にデータ暗号化</li>
            <li>ハッシュで完全性を保証</li>
          </ul>
        </div>
      </div>

      <p>
        <strong>ここがポイント:</strong> 暗号の3本柱は「独立した技術」ではなく、
        互いに補完し合う<strong>エコシステム</strong>です。
        1つでも欠けると、全体のセキュリティが崩れます。
        この全体像を把握することが、個別のアルゴリズムを深く理解するための前提条件になります。
      </p>
    </>
  )
}

/* =========================================
   Step 4: Shannon理論 — 混乱と拡散
   ========================================= */
function ShannonTheory() {
  const [input, setInput] = useState('AB')
  const [showDiffusion, setShowDiffusion] = useState(false)

  // Simple substitution (confusion demo)
  const sBox: Record<string, string> = {
    'A': 'X', 'B': 'M', 'C': 'Q', 'D': 'Z', 'E': 'R', 'F': 'W',
    'G': 'J', 'H': 'N', 'I': 'P', 'J': 'G', 'K': 'L', 'L': 'K',
    'M': 'B', 'N': 'H', 'O': 'F', 'P': 'I', 'Q': 'C', 'R': 'E',
    'S': 'T', 'T': 'S', 'U': 'V', 'V': 'U', 'W': 'D', 'X': 'A',
    'Y': 'O', 'Z': 'Y',
  }

  const confused = Array.from(input.toUpperCase())
    .map(ch => sBox[ch] ?? ch)
    .join('')

  // Simple permutation (diffusion demo)
  const diffused = (() => {
    const chars = Array.from(confused)
    if (chars.length < 2) return confused
    const result = [...chars]
    // Simple bit-level-inspired permutation: reverse pairs
    for (let i = 0; i < result.length - 1; i += 2) {
      [result[i], result[i + 1]] = [result[i + 1], result[i]]
    }
    return result.join('')
  })()

  return (
    <>
      <p>
        1949年、Claude Shannonは情報理論の父として知られる論文「秘匿通信の数学的理論」を発表しました。
        この論文で提唱された2つの原理 — <strong>混乱 (Confusion)</strong>と<strong>拡散 (Diffusion)</strong> —
        は、今日のすべての暗号アルゴリズムの設計思想の土台となっています。
      </p>

      <div className="step-lesson__callout">
        <strong>用語定義</strong><br />
        <strong>混乱 (Confusion):</strong> 暗号文と鍵の関係を複雑にすること。鍵の1ビットを変えると暗号文が予測不能に変わる。AESではS-Box（置換表）が担当。<br />
        <strong>拡散 (Diffusion):</strong> 平文の各ビットの影響を暗号文全体に広げること。平文の1ビットを変えると暗号文の約半分が変わる。AESではShiftRowsとMixColumnsが担当。
      </div>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>
        <p style={{ marginBottom: 'var(--spacing-md)', fontSize: '0.95rem' }}>
          Shannonの2原理を段階的に体験します。置換（混乱）で文字を入れ替え、転置（拡散）で位置をシャッフルします。
        </p>
        <label>入力 (英字):</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 8))}
          placeholder="例: HELLO"
          maxLength={8}
        />
        <div style={{ marginTop: 'var(--spacing-md)' }}>
          <label>Step 1 — 混乱 (Substitution / S-Box):</label>
          <div className="step-lesson__demo-result">
            {input.toUpperCase()} → {confused}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
            各文字が置換表により別の文字に変換されます。鍵と暗号文の関係が複雑になります。
          </div>
        </div>
        <div style={{ marginTop: 'var(--spacing-md)' }}>
          <button
            className="step-lesson__demo-btn step-lesson__demo-btn--secondary"
            onClick={() => setShowDiffusion(!showDiffusion)}
          >
            {showDiffusion ? 'Step 2を隠す' : 'Step 2 — 拡散を表示'}
          </button>
        </div>
        {showDiffusion && (
          <div style={{ marginTop: 'var(--spacing-md)' }}>
            <label>Step 2 — 拡散 (Permutation / 転置):</label>
            <div className="step-lesson__demo-result">
              {confused} → {diffused}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              文字の位置が入れ替わり、元の平文の影響が出力全体に広がります。AESではこの2つを14回繰り返します。
            </div>
          </div>
        )}
      </div>

      <h3>AESにおけるShannonの原理</h3>
      <p>
        AESの各ラウンドは、Shannonの原理を忠実に実装しています。
      </p>
      <ul>
        <li><strong>SubBytes (混乱):</strong> S-Boxで各バイトを非線形に置換 — 鍵と暗号文の関係を複雑化</li>
        <li><strong>ShiftRows (拡散):</strong> 行ごとに左シフト — 異なるバイト間に依存関係を作る</li>
        <li><strong>MixColumns (拡散):</strong> 列ごとの行列乗算 — 1バイトの変化を列全体に波及</li>
        <li><strong>AddRoundKey (混乱):</strong> ラウンド鍵とXOR — 鍵情報を各ラウンドに注入</li>
      </ul>
      <p>
        これを14ラウンド（AES-256）繰り返すことで、平文の1ビットの変化が暗号文全体に波及し、
        鍵なしでの解読が計算上不可能になります。
      </p>

      <p>
        <strong>ここがポイント:</strong> 「混乱」と「拡散」は暗号設計のための<strong>設計原則</strong>であり、
        特定のアルゴリズムではありません。AESもChaCha20もSHA-256も、すべてこの2つの原則に基づいて設計されています。
        新しい暗号アルゴリズムを評価するとき、「混乱と拡散は十分か？」と問うことが基本的な判断軸になります。
        AESの内部構造の詳細は<Link to="/aes">AES専門ページ</Link>で体験できます。
      </p>
    </>
  )
}

/* =========================================
   Step 5: AES — 共通鍵暗号の標準
   ========================================= */
function AESOverview() {
  return (
    <>
      <p>
        AES（Advanced Encryption Standard）は、2001年にNISTがDESの後継として標準化した
        <strong>世界で最も広く使われている共通鍵暗号</strong>です。
        設計者はベルギーのJoan DaemenとVincent Rijmen。5年間の公開コンペで15候補から選ばれました。
      </p>

      <div className="step-lesson__callout">
        <strong>用語定義</strong><br />
        <strong>ブロック暗号:</strong> データを固定長ブロック（AESは128ビット=16バイト）に分割して暗号化する方式。<br />
        <strong>SPN (Substitution-Permutation Network):</strong> 置換と転置を交互に繰り返す暗号構造。Shannonの混乱と拡散を直接実装。<br />
        <strong>AEAD (Authenticated Encryption with Associated Data):</strong> 暗号化と認証（改ざん検知）を同時に行うモード。
      </div>

      <h3>暗号モード — なぜブロック暗号だけでは不十分か</h3>
      <p>
        AESは128ビット（16バイト）のブロックしか暗号化できません。
        実際のデータ（メール、ファイル、通信）は16バイトより大きいため、
        <strong>暗号モード</strong>で複数ブロックを連結する必要があります。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>ECB（使用禁止）</h3>
          <ul>
            <li>同じ平文ブロック → 同じ暗号文</li>
            <li>画像を暗号化しても輪郭が見える</li>
            <li><strong>いかなる場合も使用禁止</strong></li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>GCM / ChaCha20-Poly1305（推奨）</h3>
          <ul>
            <li>暗号化 + 改ざん検知を同時提供</li>
            <li>TLS 1.3の必須暗号スイート</li>
            <li><strong>必ずAEADモードを選択すること</strong></li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong> 「AESを使っているから安全」ではありません。
        ECBモードのAESは同じ鍵・同じ平文が同じ暗号文になり、パターンが漏洩します。
        <strong>正しいモード（AEAD）を選ぶこと</strong>が、アルゴリズム選択と同じくらい重要です。
        AES内部のSubBytes/ShiftRows/MixColumnsの動作をインタラクティブに試すには<Link to="/aes">AES専門ページ</Link>をご覧ください。
      </div>
    </>
  )
}

/* =========================================
   Step 6: RSAと楕円曲線暗号 — 公開鍵暗号の世界
   ========================================= */
function RSAAndECCOverview() {
  return (
    <>
      <p>
        公開鍵暗号は「一方向関数」— 計算は簡単だが逆算は困難な数学的問題 — に基づいています。
        RSAは<strong>巨大な数の素因数分解の困難さ</strong>を、ECCは<strong>楕円曲線上の離散対数問題の困難さ</strong>を利用します。
      </p>

      <div className="step-lesson__callout">
        <strong>用語定義</strong><br />
        <strong>RSA:</strong> 素因数分解問題に基づく公開鍵暗号。1977年にRivest, Shamir, Adlemanが発明。<br />
        <strong>ECC (楕円曲線暗号):</strong> 楕円曲線上の離散対数問題に基づく暗号。同等安全性で鍵長がRSAの1/10以下。<br />
        <strong>ECDH:</strong> 楕円曲線を使ったDiffie-Hellman鍵交換。TLS 1.3で標準。<br />
        <strong>デジタル署名:</strong> 秘密鍵でデータに「署名」し、公開鍵で検証する仕組み。
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>RSA</h3>
          <ul>
            <li><strong>安全性の根拠:</strong> 大きな合成数 N = p × q の素因数分解の困難さ</li>
            <li><strong>鍵長:</strong> 最低2048ビット、推奨3072ビット</li>
            <li><strong>パディング:</strong> OAEP必須（PKCS#1 v1.5は非推奨）</li>
            <li><strong>用途:</strong> 暗号化、デジタル署名、鍵交換</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>楕円曲線暗号 (ECC)</h3>
          <ul>
            <li><strong>安全性の根拠:</strong> 楕円曲線上の離散対数問題</li>
            <li><strong>鍵長:</strong> ECC-256 = RSA-3072相当</li>
            <li><strong>推奨曲線:</strong> Curve25519 (TLS 1.3), P-256 (NIST)</li>
            <li><strong>用途:</strong> 鍵交換 (ECDH), 署名 (Ed25519)</li>
          </ul>
        </div>
      </div>

      <h3>ECDHの直感的理解</h3>
      <p>
        色の混合にたとえると分かりやすくなります。Aliceが「秘密の赤」、Bobが「秘密の青」を持っているとします。
        二人は公開の「黄色」を共有し、それぞれが自分の秘密色を混ぜた色を交換します。
        受け取った色にさらに自分の秘密色を混ぜると、二人とも同じ色にたどり着きます。
        盗聴者は混ざった色を見ても、元の秘密色に分離できません。
      </p>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong> RSAとECCの両方とも、<strong>Shorのアルゴリズムにより
        量子コンピュータで解読可能</strong>です。この脅威がStep 10-11で扱うPQC（ポスト量子暗号）の動機になっています。
        RSAの鍵生成・暗号化・復号をインタラクティブに体験するには<Link to="/rsa">RSA専門ページ</Link>をご覧ください。
      </div>
    </>
  )
}

/* =========================================
   Step 7: ハッシュ関数 — データの指紋
   ========================================= */
function HashOverview() {
  return (
    <>
      <p>
        ハッシュ関数は「データの指紋採取装置」です。どんな長さの入力でも、固定長の出力（ハッシュ値/ダイジェスト）を返します。
        指紋が人間を一意に識別するように、ハッシュ値はデータを一意に識別します。
        しかし指紋から人間を「復元」できないように、ハッシュ値から元のデータを復元することは不可能です。
      </p>

      <div className="step-lesson__callout">
        <strong>用語定義</strong><br />
        <strong>原像計算困難性:</strong> ハッシュ値から元のデータを復元できない（一方向性）。<br />
        <strong>衝突耐性:</strong> 同じハッシュ値を持つ2つの異なるデータを見つけることが困難。<br />
        <strong>アバランシェ効果:</strong> 入力の1ビットの変化で出力の約50%が変化する性質。
      </div>

      <h3>ハッシュ関数の危殆化の歴史</h3>
      <div className="step-lesson__visual">
        <div className="step-lesson__visual-flow">
          <div><strong>MD5 (128bit)</strong> — 2004年衝突攻撃で崩壊。使用禁止。</div>
          <div><strong>SHA-1 (160bit)</strong> — 2017年GoogleがSHAttered攻撃を実証。非推奨。</div>
          <div><strong>SHA-2 (256/512bit)</strong> — 現在の標準。Merkle-Damgard構造。</div>
          <div><strong>SHA-3 (Keccak)</strong> — 2015年標準化。スポンジ構造でSHA-2のバックアップ。</div>
        </div>
      </div>

      <h3>2つの設計アプローチ</h3>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>Merkle-Damgard構造 (SHA-2)</h3>
          <ul>
            <li>圧縮関数をブロックごとに連鎖</li>
            <li>内部状態 = 出力サイズ（256bit）</li>
            <li>Length Extension Attackに注意</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>スポンジ構造 (SHA-3)</h3>
          <ul>
            <li>吸収（Absorb）→ 搾取（Squeeze）</li>
            <li>内部状態 = 1600bit（出力より大）</li>
            <li>Length Extension Attack耐性あり</li>
          </ul>
        </div>
      </div>

      <p>
        <strong>ここがポイント:</strong> ハッシュ関数は「暗号の接着剤」として、署名、認証、鍵導出、
        コミットメントスキームなど、あらゆる暗号プロトコルの構成要素です。
        ハッシュ関数が破られると影響範囲が極めて広いため、アルゴリズムの差し替えが容易な設計（crypto agility）が求められます。
        SHA-256の内部動作やアバランシェ効果のデモは<Link to="/hash">ハッシュ関数の専門ページ</Link>で詳しく体験できます。
      </p>
    </>
  )
}

/* =========================================
   Step 8: 乱数と鍵管理 — 暗号の「命」
   ========================================= */
function RandomAndKeyManagement() {
  const [randomValues, setRandomValues] = useState<string[]>([])
  const [mathRandomValues, setMathRandomValues] = useState<string[]>([])

  const generateSecureRandom = useCallback(() => {
    const arr = new Uint8Array(16)
    crypto.getRandomValues(arr)
    setRandomValues(prev => [
      Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join(' '),
      ...prev.slice(0, 4),
    ])
  }, [])

  const generateMathRandom = useCallback(() => {
    const values = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 256)
    )
    setMathRandomValues(prev => [
      values.map(b => b.toString(16).padStart(2, '0')).join(' '),
      ...prev.slice(0, 4),
    ])
  }, [])

  return (
    <>
      <p>
        暗号アルゴリズムがどんなに強力でも、鍵を作る乱数が予測可能なら意味がありません。
        たとえると、<strong>世界最強の金庫の暗証番号を「1234」にする</strong>ようなものです。
        暗号の安全性は「最も弱いリンク」で決まり、乱数がその弱点になることは驚くほど多いのです。
      </p>

      <div className="step-lesson__callout">
        <strong>用語定義</strong><br />
        <strong>CSPRNG (暗号論的に安全な擬似乱数生成器):</strong> 過去の出力から未来の出力を予測できない乱数生成器。OSのエントロピープールを利用。<br />
        <strong>PRNG (擬似乱数生成器):</strong> 決定論的アルゴリズムによる乱数生成。Math.random()はこちら。暗号用途には不適切。<br />
        <strong>エントロピー:</strong> 乱数の「ランダムさ」の度合い。マウス操作、キー入力、ハードウェアノイズなどから収集。
      </div>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>
        <p style={{ marginBottom: 'var(--spacing-md)', fontSize: '0.95rem' }}>
          2つの乱数生成器を比較します。どちらも「ランダムに見える」16バイトを生成しますが、
          Math.random()は内部状態から予測可能 — 暗号用途には使えません。
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <div>
            <button
              className="step-lesson__demo-btn step-lesson__demo-btn--primary"
              onClick={generateSecureRandom}
              style={{ width: '100%', marginBottom: 'var(--spacing-sm)' }}
            >
              crypto.getRandomValues()
            </button>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-success)', marginBottom: '4px', fontWeight: 600 }}>暗号用途に安全</div>
            {randomValues.map((v, i) => (
              <div key={i} className="step-lesson__demo-result" style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 1 - i * 0.2 }}>
                {v}
              </div>
            ))}
          </div>
          <div>
            <button
              className="step-lesson__demo-btn step-lesson__demo-btn--secondary"
              onClick={generateMathRandom}
              style={{ width: '100%', marginBottom: 'var(--spacing-sm)' }}
            >
              Math.random()
            </button>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-danger)', marginBottom: '4px', fontWeight: 600 }}>暗号用途に危険</div>
            {mathRandomValues.map((v, i) => (
              <div key={i} className="step-lesson__demo-result" style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 1 - i * 0.2 }}>
                {v}
              </div>
            ))}
          </div>
        </div>
        <div style={{
          marginTop: 'var(--spacing-md)',
          fontSize: '0.85rem',
          color: 'var(--color-text-subtle)',
          lineHeight: '1.6',
        }}>
          生成されたバイト列は見た目は似ていますが、Math.random()は内部のシード値（通常はxorshift128+）から
          決定論的に計算されるため、攻撃者が内部状態を復元すると以降のすべての値を予測できます。
        </div>
      </div>

      <h3>鍵管理の4原則</h3>
      <ul>
        <li><strong>鍵生成:</strong> 必ずCSPRNGを使用。十分な鍵長を確保（AES-256, RSA-3072以上）</li>
        <li><strong>鍵の保管:</strong> HSM/TPM/Secure Enclaveでハードウェア保護。LocalStorageやCookieへの保存は厳禁</li>
        <li><strong>鍵のローテーション:</strong> 定期的（1〜2年）に更新。漏洩リスクの時間的限定</li>
        <li><strong>鍵の破棄:</strong> 不要になった鍵は安全に消去。PFSによりセッション鍵は即座に破棄</li>
      </ul>

      <div className="step-lesson__callout">
        <strong>実際の攻撃事例:</strong><br />
        <strong>2013年 Android Bitcoin Wallet:</strong> SecureRandomの実装不備により秘密鍵が漏洩。<br />
        <strong>2008年 Debian OpenSSL:</strong> メンテナーが「メモリ未初期化」の警告を修正した際にエントロピー源を削除。
        2年間にわたり生成された全SSHキー・SSL証明書が予測可能に。
      </div>

      <p>
        <strong>ここがポイント:</strong> 乱数の品質は外見では判断できません。
        上のデモで生成したバイト列は見た目は同じように「ランダム」ですが、
        安全性は根本的に異なります。暗号鍵の生成には<strong>必ず</strong>CSPRNGを使ってください。
      </p>
    </>
  )
}

/* =========================================
   Step 9: 暗号実装の落とし穴 — サイドチャネル攻撃
   ========================================= */
function CipherAttacks() {
  const [secret, setSecret] = useState('SECRET')
  const [guess, setGuess] = useState('SECRET')
  const [timingResult, setTimingResult] = useState<{
    naive: { match: boolean; chars: number }
    safe: { match: boolean }
  } | null>(null)

  useEffect(() => {
    // Simulate naive comparison - count matching prefix chars
    let matchCount = 0
    for (let i = 0; i < Math.min(secret.length, guess.length); i++) {
      if (secret[i] === guess[i]) matchCount++
      else break
    }
    const naiveMatch = secret === guess

    // Constant-time comparison always checks all chars
    let safeMatch = secret.length === guess.length
    for (let i = 0; i < Math.max(secret.length, guess.length); i++) {
      if ((secret[i] ?? '') !== (guess[i] ?? '')) safeMatch = false
      // No early exit!
    }

    setTimingResult({
      naive: { match: naiveMatch, chars: matchCount },
      safe: { match: safeMatch },
    })
  }, [secret, guess])

  return (
    <>
      <p>
        数学的に安全な暗号アルゴリズムも、<strong>実装を間違える</strong>と簡単に破られます。
        暗号を「壊す」のではなく「迂回する」攻撃 — サイドチャネル攻撃は、
        現実世界で最も頻繁に悪用される攻撃手法です。
      </p>

      <div className="step-lesson__callout">
        <strong>用語定義</strong><br />
        <strong>サイドチャネル攻撃:</strong> 暗号アルゴリズムの数学的弱点ではなく、実装上の物理的情報（処理時間、電力消費、電磁波など）から秘密を推測する攻撃。<br />
        <strong>タイミング攻撃:</strong> 処理時間の微小な差から秘密情報を推測するサイドチャネル攻撃の一種。<br />
        <strong>パディングオラクル攻撃:</strong> 暗号文の復号時にパディングエラーの有無を観測し、暗号文を段階的に解読する攻撃。
      </div>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>
        <p style={{ marginBottom: 'var(--spacing-md)', fontSize: '0.95rem' }}>
          タイミング攻撃の概念デモ。通常の文字列比較は先頭から順に比較し、不一致で即座に終了します。
          この「早期終了」により、一致した文字数が処理時間に漏洩します。
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <div>
            <label>秘密の値:</label>
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
          </div>
          <div>
            <label>攻撃者の推測:</label>
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
            />
          </div>
        </div>
        {timingResult && (
          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            <div className="step-lesson__comparison" style={{ margin: 0 }}>
              <div className="step-lesson__comparison-item">
                <h3>通常の比較 (==)</h3>
                <p style={{ fontSize: '0.9rem' }}>
                  一致した先頭文字数: <strong style={{ color: 'var(--color-danger)' }}>{timingResult.naive.chars}文字</strong>
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>
                  不一致で即座に終了。処理時間から一致長が漏洩し、攻撃者は1文字ずつ推測を改善できます。
                </p>
              </div>
              <div className="step-lesson__comparison-item">
                <h3>定時間比較 (timingSafeEqual)</h3>
                <p style={{ fontSize: '0.9rem' }}>
                  結果: <strong style={{ color: timingResult.safe.match ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {timingResult.safe.match ? '一致' : '不一致'}
                  </strong>（のみ）
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>
                  常にすべての文字を比較。処理時間は入力に依存しないため、何も漏洩しません。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <h3>よくある実装ミスの一覧</h3>
      <ul>
        <li><strong>ECBモード使用:</strong> 同じ平文ブロック → 同じ暗号文。パターン漏洩</li>
        <li><strong>IV/ナンスの再利用:</strong> GCMでナンスを再利用 → 鍵ストリーム露出 → 平文復元</li>
        <li><strong>パディングオラクル:</strong> 復号エラーの種類を返す → 暗号文の段階的解読</li>
        <li><strong>タイミング攻撃:</strong> 上のデモの通り。必ずtimingSafeEqualを使用</li>
      </ul>

      <div className="step-lesson__callout">
        <strong>ここがポイント — 鉄則:</strong> 暗号ライブラリを自作せず、信頼された実装を使用すること。
        ただし、<strong>仕組みを理解していなければ正しく使うこともできません</strong>。
        「なぜECBがダメか」「なぜナンスを再利用してはいけないか」を理解することが、
        安全な暗号利用の第一歩です。
      </div>
    </>
  )
}

/* =========================================
   Step 10: パスワード保護とTLS — 実践のセキュリティ
   ========================================= */
function PasswordAndTLS() {
  return (
    <>
      <p>
        暗号の理論を学んだら、次は実世界でどう使われているかを見ましょう。
        あなたが毎日使うパスワードログインとHTTPS通信には、
        ここまで学んだ暗号技術のほぼすべてが関わっています。
      </p>

      <h3>パスワード保護 — 「意図的に遅い」ハッシュ関数</h3>
      <p>
        SHA-256は高速で優れたハッシュ関数ですが、パスワードの保存には<strong>速すぎる</strong>のが問題です。
        攻撃者はGPUを使って1秒間に数十億のパスワードハッシュを試行できます。
        パスワード保存には、意図的に計算コストが高い<strong>KDF（鍵導出関数）</strong>を使います。
      </p>

      <div className="step-lesson__callout">
        <strong>用語定義</strong><br />
        <strong>KDF (Key Derivation Function):</strong> パスワードから暗号鍵を導出する関数。意図的に計算を遅くして総当たり攻撃を困難にする。<br />
        <strong>ソルト:</strong> パスワードごとに付加するランダムな値。同じパスワードでも異なるハッシュ値になり、レインボーテーブル攻撃を防ぐ。<br />
        <strong>メモリハード:</strong> 計算にメモリを大量に消費させる性質。GPUやASICによる並列攻撃を困難にする。
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>Before: SHA-256でパスワード保存</h3>
          <ul>
            <li>高速すぎて総当たりが容易</li>
            <li>ソルトなしではレインボーテーブルで即解読</li>
            <li>GPU 1台で毎秒数十億ハッシュ</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>After: Argon2 + ソルト</h3>
          <ul>
            <li>意図的に遅い（100ms〜1秒/回）</li>
            <li>メモリハードでGPU並列化を阻止</li>
            <li>ソルトで同一パスワードも異なるハッシュ</li>
          </ul>
        </div>
      </div>

      <h3>推奨アルゴリズム</h3>
      <ul>
        <li><strong>Argon2id:</strong> 最も推奨。メモリハード + 時間コスト調整可能。2015年Password Hashing Competition優勝</li>
        <li><strong>bcrypt:</strong> 長年の実績。コストファクターで計算時間を調整可能</li>
        <li><strong>PBKDF2:</strong> NIST推奨だがGPU耐性は低め。HMAC-SHA256をN回繰り返す単純な構造</li>
      </ul>

      <h3>TLS / PKI — 通信の保護</h3>
      <p>
        TLS 1.3は暗号の3本柱をすべて統合したプロトコルです。
      </p>
      <ul>
        <li><strong>鍵交換:</strong> ECDHE（X25519 or P-256）</li>
        <li><strong>データ暗号化:</strong> AES-256-GCM or ChaCha20-Poly1305</li>
        <li><strong>ハッシュ/MAC:</strong> SHA-256 or SHA-384（HKDF経由）</li>
        <li><strong>証明書:</strong> X.509証明書でサーバーの正当性を検証</li>
      </ul>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong> 安全なシステムは「正しいアルゴリズムを正しく組み合わせる」ことで成り立ちます。
        パスワードにはArgon2 + ソルト、通信にはTLS 1.3。
        個々の要素を理解していないと、「なぜこの組み合わせなのか」が分からず、
        設定ミスやダウングレード攻撃に気づけません。
      </div>
    </>
  )
}

/* =========================================
   Step 11: 量子コンピュータの脅威
   ========================================= */
function QuantumThreat() {
  return (
    <>
      <p>
        現代暗号の多くは「ある数学的問題が計算上困難である」という仮定に依存しています。
        量子コンピュータは、その仮定の一部を覆す力を持っています。
        たとえるなら、巨大な迷路を<strong>すべての通路を同時に歩く</strong>ように解くのが量子計算です。
      </p>

      <div className="step-lesson__callout">
        <strong>用語定義</strong><br />
        <strong>Shorのアルゴリズム:</strong> 素因数分解と離散対数問題を多項式時間で解く量子アルゴリズム。RSA、ECDH、ECDSAの安全性前提を崩壊させる。<br />
        <strong>Groverのアルゴリズム:</strong> 総当たり探索を平方根に短縮する量子アルゴリズム。AES-128は実質64ビット安全性に低下。<br />
        <strong>CRQC (Cryptographically Relevant Quantum Computer):</strong> 暗号解読に十分な能力を持つ量子コンピュータ。
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>Shorのアルゴリズム</h3>
          <ul>
            <li>素因数分解・離散対数を多項式時間に</li>
            <li>RSA、DH、ECDH/ECDSAの前提が崩壊</li>
            <li>RSA-2048解読に推定数百万物理qubit</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>Groverのアルゴリズム</h3>
          <ul>
            <li>総当たり探索を平方根に短縮</li>
            <li>AES-128 → 実質64ビット安全性</li>
            <li>対策: 鍵長を2倍に（AES-256推奨）</li>
          </ul>
        </div>
      </div>

      <h3>Harvest Now, Decrypt Later</h3>
      <p>
        今最も懸念されている脅威は「<strong>今の暗号通信を記録し、量子コンピュータが実用化されたら解読する</strong>」攻撃です。
        国家機密、医療データ、金融情報など、10〜30年の機密性が求められるデータは、
        <strong>今すぐ</strong>ポスト量子暗号への移行を検討すべきです。
      </p>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong> 「量子コンピュータはまだ先の話」は半分正しく、半分間違っています。
        CRQCの実現は10〜30年先かもしれませんが、Harvest Now, Decrypt Later攻撃は<strong>今この瞬間に</strong>起きている可能性があります。
        長期秘匿データを扱うシステムの移行は、今から始める必要があります。
        詳しくは<Link to="/pqc">ポスト量子暗号ページ</Link>で、格子ベース暗号の仕組みをインタラクティブに学べます。
      </div>
    </>
  )
}

/* =========================================
   Step 12: PQCへの移行 — 次世代の暗号
   ========================================= */
function PQCMigration() {
  return (
    <>
      <p>
        量子コンピュータの脅威に対応するため、NISTは2016年からポスト量子暗号（PQC）の標準化を進めてきました。
        2022年に第1陣として<strong>4つのアルゴリズム</strong>を選出。
        「量子コンピュータでも解けない」新しい数学的困難性に基づいています。
      </p>

      <div className="step-lesson__callout">
        <strong>用語定義</strong><br />
        <strong>格子ベース暗号:</strong> 高次元格子上の最短ベクトル問題（SVP）や学習付き誤差問題（LWE）の困難性に基づく暗号。PQCの主流。<br />
        <strong>KEM (Key Encapsulation Mechanism):</strong> 公開鍵暗号の一種で、共有秘密鍵を安全にカプセル化する仕組み。Kyberが代表例。<br />
        <strong>ハイブリッド方式:</strong> 古典暗号とPQCを併用し、片方が破られても安全性を保つアプローチ。
      </div>

      <h3>NIST PQC標準アルゴリズム</h3>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>ML-KEM (旧Kyber) — 鍵交換</h3>
          <ul>
            <li>Module-LWEベースのKEM</li>
            <li>ML-KEM-768: 公開鍵1184バイト</li>
            <li>TLS/VPN/ディスク暗号化向け</li>
            <li>Chrome, Signal PQXDH等で実装済み</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>ML-DSA (旧Dilithium) — 署名</h3>
          <ul>
            <li>M-SIS/M-LWEベースのデジタル署名</li>
            <li>ML-DSA-65: 公開鍵1952バイト</li>
            <li>PKI/コード署名/ブロックチェーン向け</li>
            <li>署名速度はECDSAと同等</li>
          </ul>
        </div>
      </div>

      <h3>移行のベストプラクティス — ハイブリッド方式</h3>
      <p>
        PQCアルゴリズムは比較的新しく、未知の脆弱性が見つかる可能性もあります。
        そのため移行期は<strong>古典暗号とPQCを併用するハイブリッド方式</strong>が推奨されます。
      </p>
      <div className="step-lesson__visual">
        <div className="step-lesson__visual-flow">
          <div><strong>ハイブリッド鍵交換の仕組み</strong></div>
          <div>1. X25519（古典）とML-KEM-768（PQC）を並列で鍵交換</div>
          <div>2. 両方の共有秘密を連結してKDFに入力</div>
          <div>3. どちらか一方が破られても、もう一方が通信を守る</div>
        </div>
      </div>

      <h3>移行ロードマップ</h3>
      <ol>
        <li><strong>Phase 1（現在）:</strong> 既存サービスにハイブリッド暗号を追加。暗号ライブラリのPQC対応を確認</li>
        <li><strong>Phase 2（2025-2030）:</strong> PQC単独モードの段階的必須化</li>
        <li><strong>Phase 3（2030年代）:</strong> 古典公開鍵暗号の段階的廃止</li>
      </ol>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong> PQCへの移行は「将来の課題」ではなく、<strong>今始めるべきプロセス</strong>です。
        ハイブリッド方式を使えば既存の安全性を損なわずにPQC対応を進められます。
        格子ベース暗号の数学的背景やKyberの動作デモは<Link to="/pqc">ポスト量子暗号ページ</Link>で詳しく学べます。
      </div>
    </>
  )
}

/* =========================================
   メインコンポーネント
   ========================================= */
export default function Learn() {
  useEffect(() => {
    document.title = '学習 - CryptoLab'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const steps: LessonStep[] = [
    // ─── Fundamentals (Steps 1-4) ───
    {
      title: '暗号化とは何か',
      content: <WhatIsEncryption />,
      quiz: {
        question: 'Kerckhoffsの原理によると、暗号化で公開してよいのは何か？',
        options: [
          { label: '秘密鍵' },
          { label: 'アルゴリズム（暗号化の方法）', correct: true },
          { label: '平文データ' },
          { label: '鍵の生成方法' },
        ],
        explanation: '正解！Kerckhoffsの原理により、鍵以外のすべて（アルゴリズム、実装コード、暗号文など）が公開されても安全でなければなりません。秘密にすべきは「鍵」のみです。上のXOR暗号デモでも、アルゴリズム（XOR演算）は公開されていますが、鍵が分からなければ暗号文を解読できません。',
      },
    },
    {
      title: '共通鍵暗号 vs 公開鍵暗号',
      content: <SymmetricVsAsymmetric />,
      quiz: {
        question: '公開鍵暗号が解決した最大の問題は何か？',
        options: [
          { label: '暗号化速度の向上' },
          { label: '鍵配送問題', correct: true },
          { label: '鍵長の短縮' },
          { label: '量子コンピュータへの耐性' },
        ],
        explanation: '正解！共通鍵暗号では「鍵をどう安全に渡すか」が最大の課題でした。公開鍵暗号は、公開鍵を誰にでも配布できるようにすることで、この根本的な問題を解決しました。',
      },
    },
    {
      title: '暗号の3本柱とハイブリッド暗号',
      content: <ThreePillars />,
      quiz: {
        question: 'HTTPS通信で暗号の3本柱をどう使い分けているか？',
        options: [
          { label: '公開鍵暗号だけを使用する' },
          { label: '共通鍵暗号だけを使用する' },
          { label: '公開鍵暗号で鍵を共有し、共通鍵暗号でデータを暗号化し、ハッシュで完全性を検証する', correct: true },
          { label: '通信内容の重要度によって切り替える' },
        ],
        explanation: '正解！TLS 1.3ではECDH（公開鍵暗号）でセッション鍵を共有し、AES-GCM（共通鍵暗号）でデータを暗号化し、SHA-256（ハッシュ関数）でメッセージの完全性を検証します。3つの柱が連携してはじめて安全な通信が実現します。',
      },
    },
    {
      title: 'Shannon理論 — 混乱と拡散',
      content: <ShannonTheory />,
      quiz: {
        question: 'Shannonの「混乱 (Confusion)」の目的は何か？',
        options: [
          { label: '暗号文を長くすること' },
          { label: '暗号文と鍵の関係を複雑にすること', correct: true },
          { label: '平文の影響を暗号文全体に広げること' },
          { label: '暗号化の速度を上げること' },
        ],
        explanation: '正解！混乱は暗号文と鍵の関係を複雑にすることです。「平文の影響を暗号文全体に広げる」のは拡散（Diffusion）の役割です。AESではS-Boxが混乱を、ShiftRows/MixColumnsが拡散を担当しています。',
      },
    },
    // ─── Algorithms (Steps 5-7) ───
    {
      title: 'AES — 共通鍵暗号の標準',
      content: <AESOverview />,
    },
    {
      title: 'RSA と楕円曲線暗号',
      content: <RSAAndECCOverview />,
      quiz: {
        question: 'ECC-256ビットはRSA何ビットと同等の安全性を持つか？',
        options: [
          { label: 'RSA-256ビット' },
          { label: 'RSA-1024ビット' },
          { label: 'RSA-2048ビット' },
          { label: 'RSA-3072ビット', correct: true },
        ],
        explanation: '正解！ECC-256bitはRSA-3072bitと同等の安全性を持ちます。楕円曲線暗号は短い鍵長で高い安全性を実現でき、モバイルやIoTデバイスに最適です。',
      },
    },
    {
      title: 'ハッシュ関数 — データの指紋',
      content: <HashOverview />,
    },
    // ─── Security (Steps 8-10) ───
    {
      title: '乱数と鍵管理',
      content: <RandomAndKeyManagement />,
      quiz: {
        question: 'なぜMath.random()を暗号鍵の生成に使用してはいけないのか？',
        options: [
          { label: '生成される数値の範囲が狭いから' },
          { label: '予測可能な決定論的PRNGであり、暗号学的強度がないから', correct: true },
          { label: '小数点以下の精度が低いから' },
          { label: 'ブラウザでしか動作しないから' },
        ],
        explanation: '正解！Math.random()はxorshift128+等の決定論的アルゴリズムで動作しており、内部状態を復元されると以降の全出力が予測されます。上のデモで見た通り、見た目のランダムさと暗号学的な安全性は全く別の概念です。',
      },
    },
    {
      title: '暗号実装の落とし穴',
      content: <CipherAttacks />,
      quiz: {
        question: 'タイミング攻撃の対策として正しいものは？',
        options: [
          { label: '暗号化を2回行う' },
          { label: '処理時間にランダムな遅延を追加する' },
          { label: '常に一定時間で比較するtimingSafeEqual関数を使用する', correct: true },
          { label: 'より長い鍵を使用する' },
        ],
        explanation: '正解！timingSafeEqual関数は入力に関わらずすべての文字を比較し、処理時間を一定に保ちます。「ランダムな遅延」は統計的に除去できるため対策として不十分です。上のデモで、通常比較が「一致した文字数」を漏洩する仕組みを確認してください。',
      },
    },
    {
      title: 'パスワード保護とTLS',
      content: <PasswordAndTLS />,
    },
    // ─── PQC (Steps 11-12) ───
    {
      title: '量子コンピュータの脅威',
      content: <QuantumThreat />,
      quiz: {
        question: 'Groverのアルゴリズムへの対策として正しいものは？',
        options: [
          { label: '公開鍵暗号を使わない' },
          { label: 'ハッシュ関数を使わない' },
          { label: '鍵長を2倍にする（例: AES-256を使用）', correct: true },
          { label: '暗号化を2回行う' },
        ],
        explanation: '正解！Groverのアルゴリズムは総当たり探索を平方根に短縮するため、AES-128は実質64ビット安全性に低下します。鍵長を2倍（AES-256 → 128ビット安全性）にすることで、量子環境でも十分な安全性を維持できます。',
      },
    },
    {
      title: 'PQCへの移行',
      content: <PQCMigration />,
      quiz: {
        question: '現在のPQC移行期に推奨されるアプローチは？',
        options: [
          { label: '即座にすべてをPQCに置き換える' },
          { label: '量子コンピュータが実用化されるまで待つ' },
          { label: '古典暗号とPQCを併用するハイブリッド方式', correct: true },
          { label: '量子鍵配送（QKD）のみを使用する' },
        ],
        explanation: '正解！ハイブリッド方式（例: X25519 + ML-KEM-768）では、片方が破られてももう片方が通信を守ります。PQCアルゴリズムの安全性が長期的に証明されるまでの「保険」として、古典暗号との併用が最も堅実なアプローチです。',
      },
    },
  ]

  return (
    <main className="page learn">
      <StepLesson
        title="暗号技術の体系的理解"
        steps={steps}
      />
    </main>
  )
}
