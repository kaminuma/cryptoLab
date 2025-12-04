import { useState, useEffect } from 'react'

type TabId = 'fundamentals' | 'algorithms' | 'security' | 'pqc'

const tabs = [
  { id: 'fundamentals' as TabId, label: '基礎理論' },
  { id: 'algorithms' as TabId, label: 'アルゴリズム詳解' },
  { id: 'security' as TabId, label: '実践セキュリティ' },
  { id: 'pqc' as TabId, label: 'ポスト量子暗号' },
]

export default function Learn() {
  const [activeTab, setActiveTab] = useState<TabId>('fundamentals')

  useEffect(() => {
    document.title = '学習 - CryptoLab'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="learn page">
      <section className="page-header">
        <p className="eyebrow">Learn</p>
        <h1>暗号技術の体系的理解</h1>
        <p className="lede">
          古典暗号から最新のポスト量子暗号まで、暗号技術の理論と実装を深く学ぶための総合ガイド。
          中級者向けに、数学的背景から実装上の注意点まで網羅的に解説します。
        </p>
      </section>

      {/* タブナビゲーション */}
      <nav className="tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`tab${activeTab === tab.id ? ' active' : ''}`}
          >
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* タブコンテンツ */}
      {activeTab === 'fundamentals' && <FundamentalsContent />}
      {activeTab === 'algorithms' && <AlgorithmsContent />}
      {activeTab === 'security' && <SecurityContent />}
      {activeTab === 'pqc' && <PQCContent />}
    </div>
  )
}

// 基礎理論タブ
function FundamentalsContent() {
  return (
    <>
      {/* Step 1: 暗号化とは何か (Why?) */}
      <section className="card">
        <h2>1. 暗号化とは何か - なぜ必要なのか</h2>

        <div style={{
          background: '#f0f9ff',
          padding: '16px',
          borderRadius: '8px',
          borderLeft: '4px solid #0ea5e9',
          marginBottom: '16px',
        }}>
          <strong>💡 初学者向けポイント</strong>
          <p style={{ marginTop: '8px', marginBottom: '0', fontSize: '14px' }}>
            暗号化は「秘密のメッセージを他人に読まれないようにする技術」です。
            インターネットで買い物をするとき、パスワードやクレジットカード情報が盗まれないよう守っているのが暗号化です。
          </p>
        </div>

        <h3>暗号化が解決する問題</h3>
        <ul>
          <li><strong>盗聴防止:</strong> 通信内容を第三者に読まれない</li>
          <li><strong>改ざん防止:</strong> データが途中で書き換えられていないことを保証</li>
          <li><strong>なりすまし防止:</strong> 通信相手が本物であることを確認</li>
          <li><strong>否認防止:</strong> デジタル署名により送信者が「送っていない」と言い逃れできないようにする</li>
        </ul>
        <p style={{ fontSize: '14px', color: '#475569' }}>
          ※ 暗号化は「読めなくする」役割で、否認防止はデジタル署名技術の役割です。暗号化と署名はセットで語られますが、担う機能は別です。
        </p>

        <h3>暗号化の基本要素</h3>
        <p>
          暗号化（Encryption）は、平文（Plaintext）を暗号文（Ciphertext）に変換するプロセスです。
          この変換は鍵（Key）を用いて行われ、正しい鍵を持つ者のみが復号化（Decryption）により元の平文を復元できます。
        </p>
        <ul>
          <li><strong>平文 (P):</strong> 保護したい元のデータ</li>
          <li><strong>暗号文 (C):</strong> 暗号化後のデータ。第三者には意味不明</li>
          <li><strong>鍵 (K):</strong> 暗号化・復号化に使用する秘密情報</li>
          <li><strong>暗号化アルゴリズム (E):</strong> C = E(K, P)</li>
          <li><strong>復号化アルゴリズム (D):</strong> P = D(K, C)</li>
        </ul>

        <h3>Kerckhoffsの原理</h3>
        <p>
          1883年、Auguste Kerckhoffsが提唱した暗号設計の基本原則：
          「暗号システムは、鍵以外のすべてが公開されても安全でなければならない」
        </p>
        <p>
          この原理により、現代暗号では<strong>アルゴリズムは公開し、鍵のみを秘密にする</strong>という設計が主流です。
          セキュリティ・バイ・オブスキュリティ（秘匿による安全性）は推奨されません。
        </p>

        {/* 理解度チェック */}
        <div style={{ marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h4 style={{ marginTop: 0 }}>🔍 理解度チェック</h4>
          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', padding: '8px 0' }}>
              Q: 暗号化で公開してよいのは何でしょうか？（クリックして答えを確認）
            </summary>
            <p style={{ marginTop: '12px', paddingLeft: '12px', borderLeft: '3px solid #0ea5e9' }}>
              A: <strong>アルゴリズム（暗号化の方法）</strong>です。<br />
              Kerckhoffsの原理により、鍵以外のすべて（アルゴリズム、実装コード、暗号文など）が公開されても安全でなければなりません。
              秘密にすべきは「鍵」のみです。
            </p>
          </details>
        </div>

        {/* 次のステップへの橋渡し */}
        <p style={{
          marginTop: '24px',
          padding: '12px 16px',
          background: 'linear-gradient(to right, #e0f2fe, transparent)',
          borderLeft: '3px solid #0ea5e9',
          borderRadius: '4px',
          fontWeight: '500'
        }}>
          💡 <strong>次のステップへ:</strong> 暗号化の基本を理解しました。次は、暗号に2つの大きな種類（共通鍵と公開鍵）があることを学びます。
        </p>
      </section>

      {/* Step 2: 共通鍵 vs 公開鍵 (What?) */}
      <section className="card">
        <h2>2. 共通鍵暗号 vs 公開鍵暗号 - 2つの方式</h2>

        <div style={{
          background: '#f0f9ff',
          padding: '16px',
          borderRadius: '8px',
          borderLeft: '4px solid #0ea5e9',
          marginBottom: '16px',
        }}>
          <strong>💡 初学者向けポイント</strong>
          <p style={{ marginTop: '8px', marginBottom: '0', fontSize: '14px' }}>
            暗号には大きく2種類あります。<br />
            <strong>共通鍵暗号:</strong> 同じ鍵で暗号化と復号化をする（家の鍵のイメージ）<br />
            <strong>公開鍵暗号:</strong> 異なる2つの鍵を使う（南京錠と鍵のイメージ）
          </p>
        </div>

        <h3>共通鍵暗号（対称鍵暗号）</h3>
        <p>
          暗号化と復号化に<strong>同じ鍵</strong>を使用する方式。高速だが鍵配送問題（Key Distribution Problem）が存在します。
        </p>
        <ul>
          <li><strong>長所:</strong> 暗号化・復号化が高速（ハードウェア実装可能）</li>
          <li><strong>長所:</strong> 鍵長が短くても高い安全性（AES-128はGroverの平方根探索により量子時代でも64ビット安全性）</li>
          <li><strong>短所:</strong> n人が通信するには n(n-1)/2 個の鍵が必要</li>
          <li><strong>短所:</strong> 鍵を安全に共有する仕組みが別途必要</li>
        </ul>
        <p><strong>代表例:</strong> DES（廃止）、3DES（レガシー）、AES、ChaCha20</p>

        <h3>公開鍵暗号（非対称鍵暗号）</h3>
        <p>
          暗号化用の<strong>公開鍵</strong>と復号化用の<strong>秘密鍵</strong>を使い分ける方式。
          1976年のDiffie-Hellman鍵交換により、鍵配送問題が理論的に解決されました。
        </p>
        <ul>
          <li><strong>長所:</strong> 鍵配送問題の解決（公開鍵は誰でも知ってよい）</li>
          <li><strong>長所:</strong> デジタル署名により認証・否認防止が可能</li>
          <li><strong>短所:</strong> 暗号化・復号化が遅い（共通鍵の1000〜10000倍）</li>
          <li><strong>短所:</strong> 量子コンピュータによる脅威（Shorのアルゴリズム）</li>
        </ul>
        <p><strong>代表例:</strong> RSA（暗号化・署名）、ECDH（鍵交換）、ECDSA・Ed25519（署名）</p>

        {/* 理解度チェック */}
        <div style={{ marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h4 style={{ marginTop: 0 }}>🔍 理解度チェック</h4>
          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', padding: '8px 0' }}>
              Q: 公開鍵暗号の最大の利点は何でしょうか？
            </summary>
            <p style={{ marginTop: '12px', paddingLeft: '12px', borderLeft: '3px solid #0ea5e9' }}>
              A: <strong>鍵配送問題の解決</strong>です。<br />
              公開鍵は誰でも知ってよいため、事前に秘密の鍵を共有する必要がありません。
              公開鍵で暗号化したデータは、対応する秘密鍵でしか復号できないため、安全に通信できます。
            </p>
          </details>
        </div>

        {/* 次のステップへの橋渡し */}
        <p style={{
          marginTop: '24px',
          padding: '12px 16px',
          background: 'linear-gradient(to right, #e0f2fe, transparent)',
          borderLeft: '3px solid #0ea5e9',
          borderRadius: '4px',
          fontWeight: '500'
        }}>
          💡 <strong>次のステップへ:</strong> 2つの暗号方式を学びました。では、なぜ公開鍵暗号が発明されたのか、その歴史的背景を見ていきましょう。
        </p>
      </section>

      {/* Step 3: なぜ公開鍵が発明されたか (History & Problem) */}
      <section className="card">
        <h2>3. なぜ公開鍵暗号が発明されたか - 鍵配送問題の解決</h2>

        <div style={{
          background: '#f0f9ff',
          padding: '16px',
          borderRadius: '8px',
          borderLeft: '4px solid #0ea5e9',
          marginBottom: '16px',
        }}>
          <strong>💡 初学者向けポイント</strong>
          <p style={{ marginTop: '8px', marginBottom: '0', fontSize: '14px' }}>
            共通鍵暗号には「鍵をどうやって安全に渡すか」という大問題がありました。<br />
            例: AさんとBさんが初めて通信するとき、暗号化に使う鍵をどうやって共有する？<br />
            公開鍵暗号はこの問題を数学的に解決しました。
          </p>
        </div>

        <h3>鍵配送問題（Key Distribution Problem）</h3>
        <p>
          共通鍵暗号では、通信を始める前に送信者と受信者が同じ鍵を安全に共有する必要があります。
          しかし、まだ暗号化通信ができない状態で、鍵をどうやって安全に送るのか？
        </p>
        <ul>
          <li><strong>物理的な配送:</strong> 信頼できる人が手渡しで配送（コスト高、スケールしない）</li>
          <li><strong>事前共有:</strong> オフラインで事前に鍵を交換（柔軟性に欠ける）</li>
          <li><strong>階層的鍵管理:</strong> 鍵を管理する中央機関が必要（単一障害点）</li>
        </ul>

        <h3>公開鍵暗号による解決（1976年）</h3>
        <p>
          Whitfield DiffieとMartin Hellmanが革命的なアイデアを提案：<br />
          「公開してもよい鍵（公開鍵）と、秘密にする鍵（秘密鍵）を数学的に関連付ける」
        </p>
        <ol>
          <li>各ユーザーは公開鍵と秘密鍵のペアを生成</li>
          <li>公開鍵は誰にでも配布してよい（Webサイトで公開してもOK）</li>
          <li>送信者は受信者の公開鍵で暗号化</li>
          <li>受信者は自分の秘密鍵でのみ復号化できる</li>
        </ol>
        <p>
          これにより、事前の鍵共有なしで安全な通信が可能になりました。Diffie-Hellmanは暗号文そのものを作れない鍵交換プロトコルですが、その発想が公開鍵方式（RSAなど）の基盤となりました。
        </p>

        {/* 理解度チェック */}
        <div style={{ marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h4 style={{ marginTop: 0 }}>🔍 理解度チェック</h4>
          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', padding: '8px 0' }}>
              Q: 公開鍵暗号で「公開鍵」を誰かに盗まれても問題ないのはなぜでしょうか？
            </summary>
            <p style={{ marginTop: '12px', paddingLeft: '12px', borderLeft: '3px solid #0ea5e9' }}>
              A: <strong>公開鍵では復号できない</strong>からです。<br />
              公開鍵暗号では、公開鍵で暗号化したデータは秘密鍵でしか復号できません。
              公開鍵はその名の通り「公開してよい鍵」であり、暗号化にしか使えません。
              復号に必要な秘密鍵さえ安全に保管していれば、公開鍵が漏れても問題ありません。
            </p>
          </details>
        </div>

        {/* 次のステップへの橋渡し */}
        <p style={{
          marginTop: '24px',
          padding: '12px 16px',
          background: 'linear-gradient(to right, #e0f2fe, transparent)',
          borderLeft: '3px solid #0ea5e9',
          borderRadius: '4px',
          fontWeight: '500'
        }}>
          💡 <strong>次のステップへ:</strong> 公開鍵暗号の発明理由を理解しました。次は、実際のWebサイト（HTTPS）でどのように2つの暗号を組み合わせているか見てみましょう。
        </p>
      </section>

      {/* Step 4: 実システム(TLS)での組み合わせ方 (Real World) */}
      <section className="card">
        <h2>4. 実システムでの暗号の組み合わせ - TLSの仕組み</h2>

        <div style={{
          background: '#f0f9ff',
          padding: '16px',
          borderRadius: '8px',
          borderLeft: '4px solid #0ea5e9',
          marginBottom: '16px',
        }}>
          <strong>💡 初学者向けポイント</strong>
          <p style={{ marginTop: '8px', marginBottom: '0', fontSize: '14px' }}>
            実際のWebサイト（HTTPS）では、共通鍵暗号と公開鍵暗号の<strong>両方</strong>を組み合わせています。<br />
            公開鍵暗号で安全に鍵を共有 → その鍵で共通鍵暗号を使って高速にデータをやり取り。<br />
            これを「ハイブリッド暗号」と呼びます。
          </p>
        </div>

        <h3>ハイブリッド暗号方式</h3>
        <p>
          実際のシステム（TLS、PGP等）では共通鍵暗号と公開鍵暗号を組み合わせます：
        </p>
        <ol>
          <li><strong>ハンドシェイク:</strong> 公開鍵暗号（RSA, ECDH。TLS 1.3ならP-256やx25519など）で共通鍵（セッション鍵）を安全に共有</li>
          <li><strong>データ転送:</strong> 共通鍵暗号（AES-GCM）で大量データを高速に暗号化</li>
        </ol>
        <p>これにより「鍵配送の安全性」と「暗号化の高速性」を両立します。</p>

        <h3>TLS 1.3のハンドシェイク例</h3>
        <ol>
          <li>クライアントがサーバーの証明書（公開鍵を含む）を取得</li>
          <li>ECDH鍵交換（P-256やx25519などの楕円曲線）でセッション鍵を共有（公開鍵暗号）</li>
          <li>以降の通信はAES-256-GCMで暗号化（共通鍵暗号）</li>
          <li>セッション終了後、セッション鍵は破棄（Perfect Forward Secrecy）</li>
        </ol>

        <h3>なぜ共通鍵暗号も必要なのか</h3>
        <p>
          公開鍵暗号だけでは遅すぎるため、実用的ではありません。<br />
          動画ストリーミング、ファイルダウンロードなど大量データの暗号化には、
          高速な共通鍵暗号（AES）が必須です。
        </p>

        {/* 理解度チェック */}
        <div style={{ marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h4 style={{ marginTop: 0 }}>🔍 理解度チェック</h4>
          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', padding: '8px 0' }}>
              Q: HTTPS通信では、公開鍵暗号と共通鍵暗号をどのように使い分けていますか？
            </summary>
            <p style={{ marginTop: '12px', paddingLeft: '12px', borderLeft: '3px solid #0ea5e9' }}>
              A: <strong>公開鍵暗号で鍵を共有し、共通鍵暗号でデータを暗号化</strong>します。<br />
              ① ハンドシェイク時: 公開鍵暗号（ECDH）で共通鍵（セッション鍵）を安全に共有<br />
              ② データ転送時: 共通鍵暗号（AES-GCM）でWebページやファイルを高速に暗号化<br />
              これにより、安全性と速度の両立を実現しています。
            </p>
          </details>
        </div>

        {/* 次のステップへの橋渡し */}
        <p style={{
          marginTop: '24px',
          padding: '12px 16px',
          background: 'linear-gradient(to right, #e0f2fe, transparent)',
          borderLeft: '3px solid #0ea5e9',
          borderRadius: '4px',
          fontWeight: '500'
        }}>
          💡 <strong>次のステップへ:</strong> 暗号化の仕組みを理解しました。しかし、暗号システムには暗号化だけでなく、もう1つ重要な要素があります。それが「ハッシュ関数」です。
        </p>
      </section>

      {/* Step 5: ハッシュの役割 (Another Building Block) */}
      <section className="card">
        <h2>5. ハッシュ関数の役割 - もう1つの重要な部品</h2>

        <div style={{
          background: '#f0f9ff',
          padding: '16px',
          borderRadius: '8px',
          borderLeft: '4px solid #0ea5e9',
          marginBottom: '16px',
        }}>
          <strong>💡 初学者向けポイント</strong>
          <p style={{ marginTop: '8px', marginBottom: '0', fontSize: '14px' }}>
            ハッシュ関数は「データの指紋」を作る技術です。<br />
            どんなに大きなファイルでも、固定長の短い文字列（ハッシュ値）に変換します。<br />
            ファイルが1ビットでも変わると、ハッシュ値は全く別のものになります。<br />
            <strong>用途:</strong> パスワード保存、ファイル検証、デジタル署名
          </p>
        </div>

        <h3>ハッシュ関数とは</h3>
        <p>
          ハッシュ関数 H は任意長のメッセージ M を固定長のハッシュ値 h = H(M) に変換します。
        </p>

        <h3>暗号学的ハッシュ関数の要件</h3>
        <ul>
          <li><strong>原像計算困難性（Preimage Resistance）:</strong> h から M を求めることが計算量的に困難</li>
          <li><strong>第二原像計算困難性（Second Preimage Resistance）:</strong> M₁ が与えられたとき、H(M₁) = H(M₂) となる別の M₂ を見つけることが困難</li>
          <li><strong>衝突困難性（Collision Resistance）:</strong> H(M₁) = H(M₂) となる任意の M₁ ≠ M₂ を見つけることが困難</li>
        </ul>

        <h3>実際の用途</h3>
        <ul>
          <li><strong>データ整合性検証:</strong> ファイルの改ざん検知（SHA-256チェックサム）</li>
          <li><strong>パスワード保存:</strong> bcrypt、Argon2（ソルト＋ストレッチング）</li>
          <li><strong>デジタル署名:</strong> メッセージをハッシュ化してから署名（効率化）</li>
          <li><strong>鍵導出:</strong> HKDF、PBKDF2（パスワードから暗号鍵を生成）</li>
          <li><strong>ブロックチェーン:</strong> Proof of Work（Bitcoin、Ethereum）</li>
        </ul>

        <h3>危殆化の歴史</h3>
        <ul>
          <li><strong>MD5 (128bit):</strong> 2004年衝突発見、現在は完全に危殆化</li>
          <li><strong>SHA-1 (160bit):</strong> 2017年Google/CWIが実用的衝突攻撃、TLS証明書では2016年に非推奨</li>
          <li><strong>SHA-2 (SHA-256, SHA-512):</strong> 現在も安全、NIST標準（量子攻撃下でもGroverにより128bit相当の安全性を保持）</li>
          <li><strong>SHA-3 (Keccak):</strong> 2015年標準化、SHA-2とは異なる設計（スポンジ構造）</li>
        </ul>

        {/* 理解度チェック */}
        <div style={{ marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h4 style={{ marginTop: 0 }}>🔍 理解度チェック</h4>
          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', padding: '8px 0' }}>
              Q: なぜパスワードを保存するときにハッシュ化するのでしょうか？
            </summary>
            <p style={{ marginTop: '12px', paddingLeft: '12px', borderLeft: '3px solid #0ea5e9' }}>
              A: <strong>データベースが漏洩しても元のパスワードがわからないようにする</strong>ためです。<br />
              ハッシュ関数は一方向関数なので、ハッシュ値から元のパスワードを復元することは計算量的に困難です。
              ユーザーがログイン時に入力したパスワードをハッシュ化し、保存済みのハッシュ値と比較することで認証できます。
              ただし、実際はArgon2やbcryptなど、ソルトとストレッチングを含む専用の関数を使用します。
            </p>
          </details>
        </div>

        {/* 次のステップへの橋渡し */}
        <p style={{
          marginTop: '24px',
          padding: '12px 16px',
          background: 'linear-gradient(to right, #e0f2fe, transparent)',
          borderLeft: '3px solid #0ea5e9',
          borderRadius: '4px',
          fontWeight: '500'
        }}>
          💡 <strong>次のステップへ:</strong> 暗号の3つの柱（共通鍵・公開鍵・ハッシュ）を理解しました。次は、共通鍵暗号の実装上の重要な概念「モード」について学びます。
        </p>
      </section>

      {/* Step 6: ブロック暗号 → モードが必要な理由 (Deep Dive) */}
      <section className="card">
        <h2>6. ブロック暗号とモード - なぜ「モード」が必要なのか</h2>

        <div style={{
          background: '#f0f9ff',
          padding: '16px',
          borderRadius: '8px',
          borderLeft: '4px solid #0ea5e9',
          marginBottom: '16px',
        }}>
          <strong>💡 初学者向けポイント</strong>
          <p style={{ marginTop: '8px', marginBottom: '0', fontSize: '14px' }}>
            AESなどのブロック暗号は「固定サイズのブロック（16バイト）」しか暗号化できません。<br />
            でも実際のデータは様々なサイズです。動画は数GB、メッセージは数バイト。<br />
            「モード」は、様々なサイズのデータを安全に暗号化する方法を定義します。<br />
            <strong>重要:</strong> モードを間違えると、暗号化しても情報が漏れます。
          </p>
        </div>

        <h3>ブロック暗号とは</h3>
        <p>
          ブロック暗号（AESなど）は固定長ブロック（128bit = 16バイト）を暗号化します。
          しかし実際のデータは可変長です。暗号モードは可変長データを安全に暗号化する方法を定義します。
        </p>

        <h3>主要な暗号モード</h3>

        <h4>❌ ECB (Electronic CodeBook) - 使用禁止</h4>
        <p>
          各ブロックを独立に暗号化。同じ平文ブロックは同じ暗号文になるため、パターンが漏洩します。
          <strong>決して使用してはいけません。</strong>
        </p>

        <h4>✅ CBC (Cipher Block Chaining)</h4>
        <p>
          前のブロックの暗号文を次のブロックとXOR。初期化ベクトル（IV）が必要。
          IVは予測不可能でなければならず、平文とともに送信してもよい（暗号化は不要）。
        </p>
        <p><strong>問題点:</strong> パディングオラクル攻撃に脆弱、認証機能なし</p>

        <h4>✅ CTR (Counter)</h4>
        <p>
          カウンタ値を暗号化してストリーム暗号のように動作。並列処理可能で高速。
          ナンス（Nonce）＋カウンタで各ブロックを暗号化。
        </p>
        <p><strong>注意:</strong> ナンスを再利用すると鍵ストリームが露出し、CTR単体では改ざん検知ができない（認証付きのGCMなどと組み合わせる）</p>

        <h4>🌟 GCM (Galois/Counter Mode) - 推奨</h4>
        <p>
          CTRモード + GMAC認証。<strong>認証付き暗号（AEAD: Authenticated Encryption with Associated Data）</strong>の代表例。
        </p>
        <ul>
          <li>暗号化と認証を同時に提供</li>
          <li>改ざん検知が可能（認証タグ）</li>
          <li>TLS 1.3の必須暗号スイート</li>
          <li>ハードウェアアクセラレーション対応（AES-NI）</li>
        </ul>

        <h4>🌟 ChaCha20-Poly1305 - 推奨（モバイル向け）</h4>
        <p>
          ストリーム暗号ChaCha20 + Poly1305認証。AES-NIがないデバイスでも高速。
          GoogleがTLSに採用、Android/iOSで標準サポート。
        </p>

        {/* 理解度チェック */}
        <div style={{ marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h4 style={{ marginTop: 0 }}>🔍 理解度チェック</h4>
          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', padding: '8px 0' }}>
              Q: ECBモードを使用してはいけない理由は何でしょうか？
            </summary>
            <p style={{ marginTop: '12px', paddingLeft: '12px', borderLeft: '3px solid #0ea5e9' }}>
              A: <strong>同じ平文ブロックが同じ暗号文になるため、パターンが漏洩する</strong>からです。<br />
              ECBモードでは各ブロックを独立に暗号化するため、画像を暗号化しても輪郭が見えてしまいます。
              また、暗号文ブロックの並び替えや削除も検知できません。
              必ずCBC、CTR、GCMなどのモードを使用し、現代ではAES-GCMやChaCha20-Poly1305のようなAEAD（認証付き暗号）が推奨されます。
            </p>
          </details>
        </div>

        {/* 次のステップへの橋渡し */}
        <p style={{
          marginTop: '24px',
          padding: '12px 16px',
          background: 'linear-gradient(to right, #e0f2fe, transparent)',
          borderLeft: '3px solid #0ea5e9',
          borderRadius: '4px',
          fontWeight: '500'
        }}>
          💡 <strong>次のステップへ:</strong> 暗号の理論と実装を学びました。最後に、数学的に安全な暗号でも実装を間違えると破られる現実を見ていきましょう。
        </p>
      </section>

      {/* Step 7: 実世界の脆弱性と攻撃 (Security Awareness) */}
      <section className="card">
        <h2>7. 実世界の脆弱性と攻撃 - 暗号も完璧ではない</h2>

        <div style={{
          background: '#fff3cd',
          padding: '16px',
          borderRadius: '8px',
          borderLeft: '4px solid #ffc107',
          marginBottom: '16px',
        }}>
          <strong>⚠️ セキュリティ意識向上</strong>
          <p style={{ marginTop: '8px', marginBottom: '0', fontSize: '14px' }}>
            数学的に安全な暗号アルゴリズムでも、<strong>実装を間違える</strong>と簡単に破られます。<br />
            ここで紹介する攻撃は、実際に現実世界で被害を出したものばかりです。<br />
            暗号を使う開発者は、これらの落とし穴を理解する必要があります。
          </p>
        </div>

        <h3>1. ECBモードによるパターン漏洩</h3>
        <p>
          同じ平文ブロックが同じ暗号文になるため、画像を暗号化しても輪郭が見えてしまいます。
        </p>

        <h3>2. IV/ナンスの再利用</h3>
        <p>
          CBCモードでIVを使い回すと最初のブロックの等価性が漏洩。<br />
          CTR/GCMモードでナンスを使い回すと<strong>鍵ストリームが完全に露出</strong>し、平文が復元されます。
        </p>

        <h3>3. パディングオラクル攻撃</h3>
        <p>
          CBCモードで「パディングが正しいかどうか」のエラーメッセージを返すと、
          攻撃者は暗号文を少しずつ解読できます。
        </p>

        <h3>4. タイミング攻撃</h3>
        <p>
          処理時間のわずかな差（ナノ秒単位）から秘密情報を推測。<br />
          文字列比較で通常の<code>==</code>を使うと、一致している長さが漏れます。
        </p>

        <h3>5. 弱い乱数生成器の使用</h3>
        <p>
          <code>Math.random()</code>は予測可能なため、鍵生成やトークン生成には絶対使用禁止。<br />
          必ず<code>crypto.getRandomValues()</code>などのCSPRNGを使用。
        </p>

        <h3>6. ハードコードされた鍵</h3>
        <p>
          ソースコードに鍵を埋め込むと、リポジトリ公開時やアプリ解析で漏洩。<br />
          環境変数、HSM、Secure Enclaveなどで適切に管理する必要があります。
        </p>

        <h3>学習を深めるために</h3>
        <p>
          これらの攻撃の詳細は「実践セキュリティ」タブで解説しています。<br />
          暗号の理論だけでなく、実装上の注意点も学ぶことが重要です。
        </p>

        {/* 理解度チェック */}
        <div style={{ marginTop: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h4 style={{ marginTop: 0 }}>🔍 理解度チェック</h4>
          <details>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', padding: '8px 0' }}>
              Q: なぜMath.random()を暗号鍵の生成に使用してはいけないのでしょうか？
            </summary>
            <p style={{ marginTop: '12px', paddingLeft: '12px', borderLeft: '3px solid #0ea5e9' }}>
              A: <strong>Math.random()は予測可能な乱数だから</strong>です。<br />
              Math.random()は決定論的な疑似乱数生成器（PRNG）であり、内部状態から次の値を予測できます。
              暗号鍵、トークン、ソルト、ナンスなどのセキュリティ要素には、暗号学的に安全な乱数生成器（CSPRNG）を使用する必要があります。
              ブラウザではcrypto.getRandomValues()、Node.jsではcrypto.randomBytes()を使用してください。
            </p>
          </details>
        </div>
      </section>

      <section className="card resources">
        <h2>参考文献・リソース</h2>
        <ul>
          <li>
            <a href="https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf" target="_blank" rel="noreferrer">
              FIPS 197: AES Standard (2001)
            </a>
          </li>
          <li>
            <a href="https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38a.pdf" target="_blank" rel="noreferrer">
              NIST SP 800-38A: Block Cipher Modes of Operation
            </a>
          </li>
          <li>
            <a href="https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto" target="_blank" rel="noreferrer">
              MDN: SubtleCrypto API
            </a>
          </li>
          <li>
            <a href="https://www.cryptologie.net/" target="_blank" rel="noreferrer">
              Real-World Cryptography by David Wong
            </a>
          </li>
        </ul>
      </section>
    </>
  )
}

// アルゴリズム詳解タブ
function AlgorithmsContent() {
  return (
    <>
      <section className="card">
        <h2>AES (Advanced Encryption Standard)</h2>

        <h3>歴史と設計</h3>
        <p>
          2001年、NISTがDESの後継として標準化。Rijndael（ラインダール）アルゴリズムを採用。
          設計者はJoan DaemenとVincent Rijmen（ベルギー）。
        </p>

        <h3>内部構造</h3>
        <p>AESは<strong>置換・転置ネットワーク（SPN: Substitution-Permutation Network）</strong>です。</p>

        <h4>ラウンド数</h4>
        <ul>
          <li>AES-128: 10ラウンド</li>
          <li>AES-192: 12ラウンド</li>
          <li>AES-256: 14ラウンド</li>
        </ul>

        <h4>各ラウンドの操作（最終ラウンド以外）</h4>
        <ol>
          <li><strong>SubBytes:</strong> S-Box（置換表）による非線形変換。GF(2⁸)上の逆元計算</li>
          <li><strong>ShiftRows:</strong> 行ごとに左シフト（拡散）</li>
          <li><strong>MixColumns:</strong> 列ごとにGF(2⁸)上の行列乗算（拡散）</li>
          <li><strong>AddRoundKey:</strong> ラウンド鍵とXOR</li>
        </ol>

        <h3>鍵スケジュール</h3>
        <p>
          マスター鍵からラウンド鍵を導出。Rijndael Key Schedule により、
          各ラウンドで異なる128bitラウンド鍵を生成。
        </p>

        <h3>安全性</h3>
        <ul>
          <li><strong>全数探索攻撃:</strong> AES-128は2¹²⁸通り（約3.4 × 10³⁸）。現実的に不可能</li>
          <li><strong>差分・線形解読法:</strong> 十分なラウンド数で耐性あり</li>
          <li><strong>関連鍵攻撃:</strong> AES-256で理論的攻撃あり（2⁹⁹.⁵）だが実用上問題なし</li>
          <li><strong>量子コンピュータ:</strong> Groverのアルゴリズムで安全性が半減（AES-128→64bit、AES-256→128bit）</li>
        </ul>

        <h3>実装上の注意</h3>
        <ul>
          <li><strong>サイドチャネル攻撃:</strong> タイミング攻撃、電力解析に注意。AES-NIでハードウェア実装推奨</li>
          <li><strong>ECBモード禁止:</strong> 必ずCBC、CTR、GCMなどを使用</li>
          <li><strong>IV/ナンスの管理:</strong> 予測不可能で一意な値を使用</li>
        </ul>
      </section>

      <section className="card">
        <h2>RSA (Rivest-Shamir-Adleman)</h2>

        <h3>数学的基礎</h3>
        <p>
          RSAは<strong>素因数分解問題の困難性</strong>に基づきます。
          大きな合成数 N = pq（p, qは大きな素数）を素因数分解することは現在の古典コンピュータでは困難です。
        </p>

        <h4>鍵生成アルゴリズム</h4>
        <ol>
          <li>2つの大きな素数 p, q を生成（各1024bit以上推奨）</li>
          <li>N = pq を計算（公開係数）</li>
          <li>φ(N) = (p-1)(q-1) を計算（オイラーのトーシェント関数）</li>
          <li>gcd(e, φ(N)) = 1 となる e を選択（公開指数、通常65537 = 2¹⁶+1）</li>
          <li>ed ≡ 1 (mod φ(N)) となる d を計算（秘密指数、拡張ユークリッド互除法）</li>
        </ol>
        <p><strong>公開鍵:</strong> (N, e)　<strong>秘密鍵:</strong> (N, d)</p>

        <h4>暗号化・復号化</h4>
        <ul>
          <li><strong>暗号化:</strong> C ≡ M^e (mod N)</li>
          <li><strong>復号化:</strong> M ≡ C^d (mod N)</li>
        </ul>

        <h3>セキュリティ要件</h3>
        <ul>
          <li><strong>鍵長:</strong> 最低2048bit、推奨3072bit、長期用途は4096bit</li>
          <li><strong>素数生成:</strong> p, q は十分離れた値（close prime攻撃防止）</li>
          <li><strong>パディング必須:</strong> PKCS#1 v1.5は非推奨、<strong>OAEP（Optimal Asymmetric Encryption Padding）</strong>を使用</li>
        </ul>

        <h3>既知の攻撃</h3>
        <ul>
          <li><strong>Low Public Exponent攻撃:</strong> e=3で同じMを複数受信者に送信すると解読可能→OAEPで防御</li>
          <li><strong>Wienerの攻撃:</strong> d が小さすぎると連分数展開で復元可能</li>
          <li><strong>タイミング攻撃:</strong> べき乗剰余の計算時間から d が漏洩→ブラインド化で対策</li>
          <li><strong>Shorのアルゴリズム:</strong> 量子コンピュータで多項式時間で素因数分解可能（将来的脅威）</li>
        </ul>

        <h3>デジタル署名</h3>
        <p>秘密鍵で署名、公開鍵で検証：</p>
        <ul>
          <li><strong>署名生成:</strong> S ≡ H(M)^d (mod N)</li>
          <li><strong>署名検証:</strong> H(M) ≟ S^e (mod N)</li>
        </ul>
        <p>
          <strong>PSS（Probabilistic Signature Scheme）</strong>パディングを使用することが推奨されます。
        </p>
      </section>

      <section className="card">
        <h2>SHA-256 / SHA-1</h2>

        <h3>SHA-2ファミリー（SHA-256, SHA-512）</h3>
        <p>
          2001年にNISTが発表。Merkle–Damgård構造を採用し、Davies–Meyer圧縮関数を使用。
        </p>

        <h4>SHA-256の内部構造</h4>
        <ol>
          <li><strong>パディング:</strong> メッセージを512bitブロックに分割（最後にビット長追加）</li>
          <li><strong>初期ハッシュ値:</strong> 8つの32bit定数（最初の8つの素数の平方根）</li>
          <li><strong>圧縮関数:</strong> 各ブロックで64ラウンドの処理
            <ul>
              <li>Ch, Maj, Σ0, Σ1関数による非線形変換</li>
              <li>加算とビット演算の組み合わせ</li>
            </ul>
          </li>
          <li><strong>最終ハッシュ値:</strong> 8つの32bitワードを連結して256bit出力</li>
        </ol>

        <h3>SHA-1の危殆化</h3>
        <p>
          2017年、GoogleとCWI Amsterdamが<strong>SHAttered攻撃</strong>で実用的衝突を発見。
          2つの異なるPDFファイルで同じSHA-1ハッシュ値を生成。
        </p>
        <ul>
          <li><strong>計算量:</strong> 約2⁶³回のSHA-1計算（理論値2⁸⁰より低い）</li>
          <li><strong>影響:</strong> Git、SVN、デジタル署名、TLS証明書</li>
          <li><strong>対策:</strong> SHA-256への移行（Gitは2017年以降SHA-256対応検討）</li>
        </ul>

        <h3>SHA-3（Keccak）</h3>
        <p>
          SHA-2とは異なる<strong>スポンジ構造</strong>を採用。2015年にNISTが標準化。
          SHA-2の脆弱性が発見された場合のバックアップとして機能。
        </p>
        <ul>
          <li>SHA-3-256, SHA-3-512など複数のバリエーション</li>
          <li>拡張性が高く、任意長出力可能（SHAKE128, SHAKE256）</li>
          <li>ハードウェア実装が効率的</li>
        </ul>
      </section>

      <section className="card">
        <h2>ECDH (Elliptic Curve Diffie-Hellman)</h2>

        <h3>楕円曲線暗号（ECC）の利点</h3>
        <p>
          RSAと同等の安全性を、はるかに短い鍵長で実現：
        </p>
        <ul>
          <li>ECC-256bit ≈ RSA-3072bit の安全性</li>
          <li>計算量・メモリ使用量・通信量が大幅に削減</li>
          <li>モバイル・IoTデバイスに最適</li>
        </ul>

        <h3>楕円曲線の数学</h3>
        <p>
          有限体 GF(p) 上の楕円曲線： y² ≡ x³ + ax + b (mod p)
        </p>
        <p>
          点の加算とスカラー倍算を定義。離散対数問題の困難性に基づく。
        </p>

        <h4>ECDH鍵交換プロトコル</h4>
        <ol>
          <li>Aliceは秘密鍵 a を生成、公開鍵 A = aG を計算（Gは基点）</li>
          <li>Bobは秘密鍵 b を生成、公開鍵 B = bG を計算</li>
          <li>Aliceは B を受信、共有秘密 S = aB を計算</li>
          <li>Bobは A を受信、共有秘密 S = bA を計算</li>
          <li>S = abG（同じ値）を共有鍵として使用</li>
        </ol>

        <h3>推奨曲線</h3>
        <ul>
          <li><strong>P-256 (secp256r1):</strong> NIST標準、広くサポートされているが、NSAが選定した定数に懸念</li>
          <li><strong>Curve25519:</strong> Daniel J. Bernsteinが設計。安全性と実装の容易さを重視、TLS 1.3で推奨</li>
          <li><strong>secp256k1:</strong> Bitcoin、Ethereumで使用</li>
        </ul>

        <h3>セキュリティ上の注意</h3>
        <ul>
          <li><strong>曲線の選択:</strong> 信頼できる曲線パラメータを使用</li>
          <li><strong>無効曲線攻撃:</strong> 公開鍵の検証必須（点が曲線上にあるか確認）</li>
          <li><strong>量子耐性なし:</strong> Shorのアルゴリズムで解読可能→PQC移行必要</li>
        </ul>
      </section>

      <section className="card resources">
        <h2>参考文献・実装</h2>
        <ul>
          <li>
            <a href="https://csrc.nist.gov/publications/detail/fips/180/4/final" target="_blank" rel="noreferrer">
              FIPS 180-4: Secure Hash Standard (SHA-2, SHA-3)
            </a>
          </li>
          <li>
            <a href="https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-5.pdf" target="_blank" rel="noreferrer">
              FIPS 186-5: Digital Signature Standard (RSA, ECDSA)
            </a>
          </li>
          <li>
            <a href="https://github.com/paulmillr/noble-hashes" target="_blank" rel="noreferrer">
              @noble/hashes - 監査済みTypeScript実装
            </a>
          </li>
          <li>
            <a href="https://github.com/paulmillr/noble-curves" target="_blank" rel="noreferrer">
              @noble/curves - 楕円曲線暗号ライブラリ
            </a>
          </li>
        </ul>
      </section>
    </>
  )
}

// 実践セキュリティタブ
function SecurityContent() {
  return (
    <>
      {/* 1. 暗号における乱数の安全性 */}
      <section className="card">
        <h2>1. 暗号における乱数の安全性</h2>

        <h3>❌ Math.random() は絶対に使用しない</h3>
        <p>
          パスワード生成、ソルト生成、セッショントークン、暗号鍵など、
          <strong>セキュリティに関わる乱数生成には<code>Math.random()</code>を絶対に使用してはいけません</strong>。
        </p>

        <div style={{
          background: '#f0f9ff',
          padding: '12px',
          borderRadius: '4px',
          borderLeft: '4px solid #0ea5e9',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          <strong>注:</strong> UIのアニメーションやゲームの演出など、
          セキュリティに関係のない用途であれば<code>Math.random()</code>を使用しても問題ありません。
        </div>

        <h4>使用してはいけない理由</h4>
        <ul>
          <li><strong>予測可能性:</strong> 決定論的アルゴリズム（PRNG）であり、内部状態から次の値を予測可能</li>
          <li><strong>シード値の脆弱性:</strong> 実装によっては時刻などをシードにするため推測容易</li>
          <li><strong>暗号学的強度がない:</strong> CSPRNGではないため、統計的偏りや前方安全性に欠ける</li>
        </ul>

        <h4>実際の攻撃事例</h4>
        <ul>
          <li><strong>Android Bitcoin Wallet (2013):</strong> <code>SecureRandom</code>の実装不備により秘密鍵が漏洩</li>
          <li><strong>Debian OpenSSL (2008):</strong> エントロピー不足により鍵生成が予測可能に</li>
        </ul>

        <h3>✅ CSPRNG (Cryptographically Secure PRNG) の使用</h3>
        <p>必ず以下の暗号学的に安全な乱数生成器を使用してください：</p>

        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          <div>
            <strong>ブラウザ (Web Crypto API)</strong>
            <pre style={{ background: '#f8fafc', padding: '8px', fontSize: '12px', overflowX: 'auto' }}>{`const val = new Uint32Array(1);
crypto.getRandomValues(val);`}</pre>
          </div>
          <div>
            <strong>Node.js</strong>
            <pre style={{ background: '#f8fafc', padding: '8px', fontSize: '12px', overflowX: 'auto' }}>{`const crypto = require('crypto');
crypto.randomBytes(16);`}</pre>
          </div>
          <div>
            <strong>Python</strong>
            <pre style={{ background: '#f8fafc', padding: '8px', fontSize: '12px', overflowX: 'auto' }}>{`import secrets
secrets.token_bytes(16)`}</pre>
          </div>
        </div>
      </section>

      {/* 2. 鍵管理の実務 */}
      <section className="card">
        <h2>2. 鍵管理の実務</h2>

        <h3>鍵生成</h3>
        <p>
          必ずCSPRNGを使用し、十分な鍵長を確保します。
        </p>
        <ul>
          <li><strong>AES:</strong> 256bit推奨（最低128bit）</li>
          <li><strong>RSA:</strong> 3072bit推奨（最低2048bit）</li>
          <li><strong>ECC:</strong> 256bit以上</li>
        </ul>

        <h3>鍵の保管</h3>
        <p>鍵をアプリケーションコードやリポジトリにハードコードしてはいけません。</p>
        <ul>
          <li><strong>HSM / TPM / Secure Enclave:</strong> ハードウェアレベルで鍵を保護</li>
          <li><strong>Web環境:</strong>
            <ul>
              <li>IndexedDBにWeb Crypto APIの<code>extractable: false</code>（抽出不可）設定で保存</li>
              <li>❌ LocalStorageやCookieへの保存はXSSで漏洩する危険性が高い</li>
            </ul>
          </li>
        </ul>

        <h3>鍵のライフサイクル</h3>
        <ul>
          <li><strong>ローテーション:</strong> 定期的（1〜2年）に鍵を更新する</li>
          <li><strong>PFS (Perfect Forward Secrecy):</strong> セッションごとに一時鍵を使用し、長期鍵の漏洩影響を最小化（TLS 1.3等）</li>
        </ul>
      </section>

      {/* 3. ブロック暗号における落とし穴 */}
      <section className="card">
        <h2>3. ブロック暗号における落とし穴</h2>

        <h3>❌ ECBモード (Electronic CodeBook)</h3>
        <p>
          同じ平文が同じ暗号文になるため、データのパターンが漏洩します。
          <strong>いかなる場合も使用禁止です。</strong>
        </p>

        <h3>❌ IV (初期化ベクトル) の再利用</h3>
        <p>
          CBCモードでIVを使い回すと、最初のブロックの等価性が漏洩します。
          CTRモードやGCMモードでナンスを使い回すと、<strong>鍵ストリームが完全に露出し、平文が復元されます</strong>。
        </p>

        <h3>✅ GCMのNonce管理</h3>
        <p>
          AES-GCMでは96bit（12バイト）のナンスを使用します。
          カウンター方式などで一意性を厳密に保証する必要があります。
        </p>
      </section>

      {/* 4. 認証なし暗号の危険性 */}
      <section className="card">
        <h2>4. 認証なし暗号の危険性</h2>

        <h3>Malleability (展性)</h3>
        <p>
          CBCモードなどは、暗号文のビットを反転させると、復号後の平文の対応するビットも反転するという性質（展性）を持ちます。
          攻撃者は暗号文を改ざんすることで、復号結果を意図的に操作できる可能性があります。
        </p>

        <h3>✅ AEAD (Authenticated Encryption with Associated Data)</h3>
        <p>
          暗号化と同時に「認証（改ざん検知）」を行う方式を使用してください。
        </p>
        <ul>
          <li><strong>AES-GCM</strong></li>
          <li><strong>ChaCha20-Poly1305</strong></li>
        </ul>
      </section>

      {/* 5. 復号オラクル攻撃 */}
      <section className="card">
        <h2>5. 復号オラクル攻撃</h2>

        <h3>Padding Oracle攻撃</h3>
        <p>
          CBCモードにおいて、パディングが正しいかどうかのエラーメッセージ（オラクル）を利用して、
          暗号文を解読する攻撃です。
        </p>
        <p>
          <strong>対策:</strong> AEADを使用するか、Encrypt-then-MAC（暗号化してからMACを付与・検証）構成を採用する。
        </p>
      </section>

      {/* 6. タイミング攻撃・サイドチャネル */}
      <section className="card">
        <h2>6. タイミング攻撃・サイドチャネル</h2>

        <h3>タイミング攻撃</h3>
        <p>
          サイドチャネル攻撃の一種で、処理時間のわずかな差（ナノ秒単位）を計測することで秘密情報を推測する攻撃です。
        </p>
        <ul>
          <li><strong>文字列比較:</strong> 通常の比較（<code>==</code>, <code>strcmp</code>）は不一致の時点で処理を終えるため、一致している長さが推測可能。</li>
          <li><strong>対策:</strong> 常に一定時間で比較を行う<code>timingSafeEqual</code>関数を使用する。</li>
        </ul>

        <h3>その他の対策</h3>
        <ul>
          <li><strong>RSAブラインド化:</strong> 入力にランダムな値を掛けてから計算し、最後に除去することで計算時間をランダム化。</li>
          <li><strong>AES-NI:</strong> CPUの専用命令セットを使用し、定数時間での処理を保証。</li>
        </ul>
      </section>

      {/* 7. パスワード保護のセキュリティ */}
      <section className="card">
        <h2>7. パスワード保護のセキュリティ</h2>

        <h3>ブルートフォース・辞書攻撃への対策</h3>
        <p>
          単純なハッシュ関数（SHA-256など）は高速すぎるため、パスワード保存には不向きです。
        </p>

        <h3>✅ KDF (Key Derivation Function) の使用</h3>
        <p>
          計算コスト（CPU/メモリ）を高く設定できる専用の関数を使用します。
        </p>
        <ul>
          <li><strong>Argon2:</strong> 最も推奨される最新アルゴリズム（メモリハード）</li>
          <li><strong>bcrypt:</strong> 広く使われている強力なアルゴリズム</li>
          <li><strong>PBKDF2:</strong> NIST推奨だが、GPU耐性は低め（反復回数を十分大きくする）</li>
        </ul>
        <p>
          必ず<strong>ソルト（Salt）</strong>を付与してレインボーテーブル攻撃を防ぎ、
          <strong>ストレッチング</strong>（計算の繰り返し）で総当たり攻撃を遅らせます。
        </p>
      </section>

      {/* 8. TLS / PKI の実践 */}
      <section className="card">
        <h2>8. TLS / PKI の実践</h2>

        <h3>TLS 1.3</h3>
        <p>
          最新のTLS 1.3を使用し、古い暗号スイート（RSA鍵交換、CBCモード、SHA-1等）を無効化します。
        </p>

        <h3>証明書検証の重要性</h3>
        <div style={{
          background: '#fef2f2',
          padding: '12px',
          borderRadius: '4px',
          borderLeft: '4px solid #dc2626',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          <strong>警告:</strong> 中間者攻撃（MITM）は、クライアント側で<strong>証明書の検証を省略または不適切に実装したとき</strong>に成立します。
          「オレオレ証明書」を安易に許可したり、検証コードを無効化してはいけません。
        </div>

        <h3>証明書の種類</h3>
        <ul>
          <li><strong>DV (Domain Validation):</strong> ドメイン管理権限のみ確認</li>
          <li><strong>OV (Organization Validation):</strong> 組織の実在性を確認</li>
          <li><strong>EV (Extended Validation):</strong> 最も厳格な審査</li>
        </ul>
      </section>

      <section className="card resources">
        <h2>セキュリティベストプラクティス</h2>
        <ul>
          <li>
            <a href="https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html" target="_blank" rel="noreferrer">
              OWASP Cryptographic Storage Cheat Sheet
            </a>
          </li>
          <li>
            <a href="https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-52r2.pdf" target="_blank" rel="noreferrer">
              NIST SP 800-52 Rev. 2: TLS Guidelines
            </a>
          </li>
          <li>
            <a href="https://cwe.mitre.org/data/definitions/327.html" target="_blank" rel="noreferrer">
              CWE-327: Use of a Broken or Risky Cryptographic Algorithm
            </a>
          </li>
          <li>
            <a href="https://www.ssllabs.com/" target="_blank" rel="noreferrer">
              SSL Labs - TLS設定テストツール
            </a>
          </li>
        </ul>
      </section>
    </>
  )
}

// ポスト量子暗号タブ

function PQCContent() {
  return (
    <>
      <section className="card">
        <h2>量子コンピューター基礎</h2>
        <p>
          暗号の量子脅威を理解するには、まず古典計算と量子計算の違いを押さえるのが近道です。
          bitとqubitのギャップ、重ね合わせや干渉といった直感を掴んでおくと、ShorやGroverの威力が腑に落ちます。
        </p>
        <h3>bit vs qubit</h3>
        <ul>
          <li><strong>bit:</strong> 0か1のどちらか一方のみをとる。n個で2ⁿ通りを順番に計算する。</li>
          <li><strong>qubit:</strong> |0⟩と|1⟩の重ね合わせをとれる。n個で2ⁿ通りを同時に扱い、後段の干渉で必要なパターンだけを強調する。</li>
        </ul>
        <h3>重ね合わせと干渉</h3>
        <p>
          量子状態は波として足し引きされます。アルゴリズムは「正解の振幅を増幅」「誤りを打ち消す」ように構築され、
          Groverの振幅増幅やShorの周期発見がその代表例です。
        </p>
        <h3>量子もつれ（エンタングルメント）</h3>
        <p>
          複数qubitの状態が独立でなくなる量子特有の相関。Shorのフーリエ変換や量子エラー訂正の核となります。
        </p>
        <h3>量子計算が得意な問題</h3>
        <ul>
          <li>周期発見・素因数分解・離散対数（→ RSA/ECCが崩壊）</li>
          <li>構造を持つ探索（→ Groverで√Nスピードアップ）</li>
          <li>量子シミュレーション（化学・物性）など</li>
        </ul>
        <p>
          この基礎を押さえると、「なぜShorでRSAが破れるのか」「なぜGroverで鍵検索が半減するのか」
          ひいては「なぜPQCが必要なのか」という流れが理解しやすくなります。
        </p>
      </section>

      <section className="card">
        <h2>量子脅威の全体像</h2>
        <p>
          現代暗号は <strong>公開鍵暗号の困難性（素因数分解・離散対数）</strong> と
          <strong>共通鍵暗号の総当たりが現実的でないこと</strong> の二本柱で成立しています。
          量子アルゴリズムはそれぞれに対応する弱点を突きます。
        </p>
        <div className="info-panel">
          <h3>暗号の二本柱と量子攻撃</h3>
          <ul>
            <li>公開鍵暗号 → Shor で RSA / Diffie-Hellman / ECC が崩壊</li>
            <li>共通鍵・ハッシュ → Grover で平方根スピードアップ（鍵長2倍で対抗）</li>
          </ul>
        </div>
        <div className="concept-map">
          <div className="concept-node">
            <h4>古典暗号崩壊の理由</h4>
            <p>Shor が数論ベースの暗号を、多項式時間で攻略。Grover は鍵探索の指数を半減。</p>
          </div>
          <div className="concept-node">
            <h4>PQCへの移行</h4>
            <p>NIST PQCの採択（Kyber/Dilithiumなど）を軸に、TLS・PKI・VPNが順次更新中。</p>
          </div>
          <div className="concept-node">
            <h4>QKDという第2の柱</h4>
            <p>計算量ではなく量子物理で鍵配送を守るアプローチ。PQCと補完関係にあります。</p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>古典暗号が破られる理由</h2>

        <h3>Shorのアルゴリズム（1994年）</h3>
        <p>
          素因数分解と離散対数を多項式時間に落とし込む量子アルゴリズム。
          <strong>RSA、Diffie-Hellman、ECDH/ECDSAは前提そのものが破られます</strong>。
        </p>
        <ul>
          <li>RSA-2048解読には約4000論理qubit＋膨大なエラー訂正が必要（推定数百万物理qubit）</li>
          <li>計算量 O((log N)³) で、古典計算では到達できない速度へ</li>
        </ul>

        <h3>Groverのアルゴリズム（1996年）</h3>
        <p>総当たり探索を √N に短縮。AES-128は実質64bit安全性、AES-256は128bit相当へ。</p>
        <ul>
          <li>対策は鍵長を2倍にする（AES-256 / SHA-512 / 長いHMACキー）</li>
          <li>ハッシュ関数の衝突耐性・原像計算も半減する点に注意</li>
        </ul>

        <div className="info-panel">
          <h3>現在の量子計算機 & HNDL</h3>
          <ul>
            <li>IBM: Osprey 433 qubit（2022）、Condor 1121 qubit（2023）</li>
            <li>Google: Sycamoreが量子超越性を実証。まだエラー訂正がボトルネック</li>
            <li><strong>Harvest Now, Decrypt Later:</strong> 今の通信を記録し量子後に解読する攻撃。
              長期秘匿データは即PQCへ移行するのが実務ガイドライン</li>
          </ul>
        </div>
      </section>

      <section className="card">
        <h2>PQC（耐量子暗号）へのロードマップ</h2>
        <p>「いつ・何を・どう置き換えるか」を俯瞰したシラバスです。</p>

        <h3>NIST標準化タイムライン</h3>
        <ol>
          <li>2016年: NISTがPQC公募（82方式）</li>
          <li>2017-2020年: 3ラウンドで安全性・実装性を評価</li>
          <li>2022年: 第1陣として Kyber / Dilithium / FALCON / SPHINCS+ を選出</li>
          <li>2024年: FIPSドラフト → 実装指針として各国政府・大手クラウドが採用へ</li>
        </ol>

        <h3>アルゴリズムファミリー</h3>
        <div className="concept-map">
          <div className="concept-node">
            <h4>格子ベース</h4>
            <p>Kyber（KEM）、Dilithium/FALCON（署名）。最短ベクトル問題やM-LWE/M-SISを前提。</p>
          </div>
          <div className="concept-node">
            <h4>符号・多変数</h4>
            <p>Classic McElieceは巨大鍵だが堅牢。Rainbow/SIDHは攻撃により脱落。</p>
          </div>
          <div className="concept-node">
            <h4>ハッシュベース</h4>
            <p>SPHINCS+ は保守的で信頼性高いが、署名サイズ・計算コストが重い。</p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Kyber（鍵カプセル化機構）</h2>
        <p>Module-LWEベースのKEM。TLS・VPN・ディスク暗号化に組み込まれる公開鍵PQCの主役です。</p>

        <h3>パラメータセット</h3>
        <ul>
          <li>Kyber-512: AES-128相当（公開鍵800B / 秘密鍵1632B）</li>
          <li>Kyber-768: AES-192相当（公開鍵1184B）※ハイブリッドTLSのデファクト</li>
          <li>Kyber-1024: AES-256相当（公開鍵1568B）</li>
        </ul>

        <h3>実用上の特徴</h3>
        <ul>
          <li>鍵生成・カプセル化・復号は数十μsで完了（ARM/モバイルでも実装可）</li>
          <li>KEMなので既存の鍵合意APIに差し込みやすい</li>
        </ul>

        <div className="info-panel">
          <h3>TLS 1.3 ハイブリッド例</h3>
          <ol>
            <li>ClientHello に Kyber768 公開鍵（X25519 と並列）</li>
            <li>Server → Kyberカプセル化で共有秘密 Z<sub>PQC</sub></li>
            <li>X25519 の Z<sub>ECC</sub> と連結し HKDF → AES-GCM 鍵へ</li>
          </ol>
          <p>Cloudflare / Google / AWS などがこの方式でテスト & ロールアウト中。</p>
        </div>
      </section>

      <section className="card">
        <h2>Dilithium（デジタル署名）</h2>
        <p>M-SIS/M-LWEベースの署名方式。PKI・コード署名・ブロックチェーン向けの本命です。</p>

        <h3>パラメータセット</h3>
        <ul>
          <li>Dilithium2: AES-128相当（PK 1312B / Signature 2420B）</li>
          <li>Dilithium3: AES-192相当（PK 1952B / Signature 3293B）</li>
          <li>Dilithium5: AES-256相当（PK 2592B / Signature 4595B）</li>
        </ul>

        <h3>RSA / ECDSAとの比較</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', border: '1px solid #e2e8f0' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '8px', textAlign: 'left' }}>方式</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>公開鍵サイズ</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>署名長</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>量子耐性</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px' }}>RSA-2048</td>
              <td style={{ padding: '8px' }}>256B</td>
              <td style={{ padding: '8px' }}>256B</td>
              <td style={{ padding: '8px' }}>❌</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px' }}>ECDSA P-256</td>
              <td style={{ padding: '8px' }}>64B</td>
              <td style={{ padding: '8px' }}>64B</td>
              <td style={{ padding: '8px' }}>❌</td>
            </tr>
            <tr>
              <td style={{ padding: '8px' }}>Dilithium3</td>
              <td style={{ padding: '8px' }}>1952B</td>
              <td style={{ padding: '8px' }}>3293B</td>
              <td style={{ padding: '8px' }}>✅</td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: '8px', fontSize: '14px', color: '#64748b' }}>
          サイズは増えるが、署名・検証速度はECDSAと同等でミドルウェアにも投入可能。
        </p>

        <h3>主なユースケース</h3>
        <ul>
          <li>TLS/QUIC 証明書（ACMEサーバーのPQC対応）</li>
          <li>OS/ブラウザ/ドライバーなどのコード署名</li>
          <li>ブロックチェーン・スマートメーター・OTAアップデート</li>
        </ul>
      </section>

      <section className="card">
        <h2>ハイブリッド暗号方式</h2>
        <p>未知の脆弱性に備えて、古典暗号とPQCを<strong>併用</strong>するのが移行期のベストプラクティスです。</p>

        <h3>ハイブリッドTLS</h3>
        <ul>
          <li>X25519（楕円曲線） + Kyber768 を並列で握手し、共有秘密を連結してKDF</li>
          <li>片方が破られても、もう片方が通信を守る</li>
        </ul>

        <h3>実装例</h3>
        <ul>
          <li>Cloudflare: 2019年からハイブリッドTLSを実ネットで実験</li>
          <li>Google Chrome / Firefox Nightly: X25519+Kyber768サイファをテスト搭載</li>
          <li>Signal PQXDH: メッセンジャーでも Kyber + X25519 を同時利用</li>
          <li>AWS KMS / Azure: PQC TLSオプションをプレビュー提供</li>
        </ul>

        <h3>移行フェーズ</h3>
        <ol>
          <li><strong>Phase 1:</strong> 既存サービスにハイブリッドを追加（現在）</li>
          <li><strong>Phase 2:</strong> PQC単独モードを用意し必須要件化（2025-2030）</li>
          <li><strong>Phase 3:</strong> 古典公開鍵暗号を段階的に廃止（2030年代）</li>
        </ol>
      </section>

      <section className="card">
        <h2>量子暗号通信（QKD）</h2>
        <p>量子物理で盗聴を検知するアプローチ。PQCと相補的な第2の柱です。</p>

        <h3>BB84 / 量子鍵配送</h3>
        <ul>
          <li>光子の偏光状態などを送り、測定＝盗聴で状態が崩れる</li>
          <li>中国「墨子号」、NICTの東京QKDネットワークなどが実証中</li>
        </ul>

        <h3>実用課題</h3>
        <ul>
          <li>距離・コスト・スループットの制約（専用ファイバーや衛星が必要）</li>
          <li>理論は強固でも実装攻撃に備えたハード設計が求められる</li>
        </ul>

        <p>
          <strong>PQC vs QKD:</strong> 既存インフラで展開しやすいPQCが主流。
          ただし政府・金融・宇宙通信など極秘用途ではQKDとの併用が検討されています。
        </p>
      </section>

      <section className="card resources">
        <h2>参考資料・最新動向</h2>
        <ul>
          <li>
            <a href="https://csrc.nist.gov/projects/post-quantum-cryptography" target="_blank" rel="noreferrer">
              NIST Post-Quantum Cryptography Project
            </a>
          </li>
          <li>
            <a href="https://pq-crystals.org/" target="_blank" rel="noreferrer">
              CRYSTALS（Kyber & Dilithium公式サイト）
            </a>
          </li>
          <li>
            <a href="https://openquantumsafe.org/" target="_blank" rel="noreferrer">
              Open Quantum Safe - PQC実装プロジェクト
            </a>
          </li>
          <li>
            <a href="https://www.etsi.org/technologies/quantum-safe-cryptography" target="_blank" rel="noreferrer">
              ETSI Quantum Safe Cryptography
            </a>
          </li>
          <li>
            <a href="https://signal.org/docs/specifications/pqxdh/" target="_blank" rel="noreferrer">
              Signal PQXDH Specification
            </a>
          </li>
        </ul>
      </section>
    </>
  )
}
