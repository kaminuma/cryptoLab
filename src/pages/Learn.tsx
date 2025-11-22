import { useState } from 'react'

type TabId = 'fundamentals' | 'algorithms' | 'security' | 'pqc'

const tabs = [
  { id: 'fundamentals' as TabId, label: '基礎理論' },
  { id: 'algorithms' as TabId, label: 'アルゴリズム詳解' },
  { id: 'security' as TabId, label: '実践セキュリティ' },
  { id: 'pqc' as TabId, label: 'ポスト量子暗号' },
]

export default function Learn() {
  const [activeTab, setActiveTab] = useState<TabId>('fundamentals')

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
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '32px',
        borderBottom: '2px solid #e2e8f0',
        flexWrap: 'wrap'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #2563eb' : '3px solid transparent',
              color: activeTab === tab.id ? '#2563eb' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '-2px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
      <section className="card">
        <h2>暗号化とは何か</h2>
        <p>
          暗号化（Encryption）は、平文（Plaintext）を暗号文（Ciphertext）に変換するプロセスです。
          この変換は鍵（Key）を用いて行われ、正しい鍵を持つ者のみが復号化（Decryption）により元の平文を復元できます。
        </p>
        <h3>暗号化の基本要素</h3>
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
      </section>

      <section className="card">
        <h2>共通鍵暗号 vs 公開鍵暗号</h2>

        <h3>共通鍵暗号（対称鍵暗号）</h3>
        <p>
          暗号化と復号化に<strong>同じ鍵</strong>を使用する方式。高速だが鍵配送問題（Key Distribution Problem）が存在します。
        </p>
        <ul>
          <li><strong>長所:</strong> 暗号化・復号化が高速（ハードウェア実装可能）</li>
          <li><strong>長所:</strong> 鍵長が短くても高い安全性（AES-128は量子時代でも64ビット安全性）</li>
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
        <p><strong>代表例:</strong> RSA、ECDH、ECDSA、Ed25519</p>

        <h3>ハイブリッド暗号</h3>
        <p>
          実際のシステム（TLS、PGP等）では両方を組み合わせます：
        </p>
        <ol>
          <li>公開鍵暗号で共通鍵（セッション鍵）を安全に共有</li>
          <li>共通鍵暗号で大量データを高速に暗号化</li>
        </ol>
        <p>これにより「鍵配送の安全性」と「暗号化の高速性」を両立します。</p>
      </section>

      <section className="card">
        <h2>ハッシュ関数の役割</h2>
        <p>
          ハッシュ関数 H は任意長のメッセージ M を固定長のハッシュ値 h = H(M) に変換します。
        </p>

        <h3>暗号学的ハッシュ関数の要件</h3>
        <ul>
          <li><strong>原像計算困難性（Preimage Resistance）:</strong> h から M を求めることが計算量的に困難</li>
          <li><strong>第二原像計算困難性（Second Preimage Resistance）:</strong> M₁ が与えられたとき、H(M₁) = H(M₂) となる別の M₂ を見つけることが困難</li>
          <li><strong>衝突困難性（Collision Resistance）:</strong> H(M₁) = H(M₂) となる任意の M₁ ≠ M₂ を見つけることが困難</li>
        </ul>

        <h3>用途</h3>
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
          <li><strong>SHA-2 (SHA-256, SHA-512):</strong> 現在も安全、NIST標準</li>
          <li><strong>SHA-3 (Keccak):</strong> 2015年標準化、SHA-2とは異なる設計（スポンジ構造）</li>
        </ul>
      </section>

      <section className="card">
        <h2>暗号モード（Block Cipher Modes）</h2>
        <p>
          ブロック暗号（AESなど）は固定長ブロック（128bit）を暗号化しますが、
          実際のデータは可変長です。暗号モードは可変長データを安全に暗号化する方法を定義します。
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
        <p><strong>注意:</strong> ナンスを再利用すると鍵ストリームが露出</p>

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
          処理時間のわずかな差（ナノ秒単位）を計測することで、秘密情報を推測する攻撃です。
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
        <h2>量子コンピュータの脅威</h2>

        <h3>量子コンピュータとは</h3>
        <p>
          量子ビット（qubit）を利用し、重ね合わせとエンタングルメントにより
          古典コンピュータでは不可能な並列計算を実現。
        </p>

        <h3>Shorのアルゴリズム（1994年）</h3>
        <p>
          Peter Shorが発表した量子アルゴリズム。<strong>素因数分解と離散対数問題を多項式時間で解く</strong>。
        </p>
        <ul>
          <li><strong>影響を受ける暗号:</strong>
            <ul>
              <li>RSA（素因数分解）</li>
              <li>ECDH、ECDSA（楕円曲線離散対数）</li>
              <li>Diffie-Hellman（離散対数）</li>
            </ul>
          </li>
          <li><strong>計算量:</strong> O((log N)³) - Nビット整数の因数分解</li>
          <li><strong>必要な量子ビット数:</strong> 2048bit RSA解読に約4098 qubit（エラー訂正込み）</li>
        </ul>

        <h3>Groverのアルゴリズム（1996年）</h3>
        <p>
          データベース検索を√N倍高速化。共通鍵暗号の鍵探索に適用可能。
        </p>
        <ul>
          <li><strong>影響:</strong>
            <ul>
              <li>AES-128 → 実質64bit安全性（2⁶⁴回の量子ゲート操作）</li>
              <li>AES-256 → 実質128bit安全性（依然として安全）</li>
            </ul>
          </li>
          <li><strong>対策:</strong> 鍵長を2倍にすることで従来と同等の安全性を維持</li>
        </ul>

        <h3>現在の量子コンピュータの状況</h3>
        <ul>
          <li><strong>IBM Quantum:</strong> 433 qubit（2022年、Osprey）、1121 qubit（2023年、Condor）</li>
          <li><strong>Google:</strong> 72 qubit（2018年、Bristlecone）、Sycamoreで量子超越性実証</li>
          <li><strong>問題点:</strong>
            <ul>
              <li>エラー率が高い（デコヒーレンス）</li>
              <li>エラー訂正に論理qubitあたり1000物理qubit必要</li>
              <li>RSA-2048解読には数百万qubit規模が必要（2030年代？）</li>
            </ul>
          </li>
        </ul>

        <h3>Harvest Now, Decrypt Later攻撃</h3>
        <p>
          現在暗号化された通信を記録しておき、将来量子コンピュータで解読する攻撃。
          <strong>長期保存データは今すぐPQC移行が必要</strong>。
        </p>
      </section>

      <section className="card">
        <h2>NIST PQC標準化プロセス</h2>

        <h3>タイムライン</h3>
        <ul>
          <li><strong>2016年:</strong> NIST PQC標準化プロジェクト開始、82方式が応募</li>
          <li><strong>2017-2020年:</strong> 第1〜3ラウンド選考</li>
          <li><strong>2022年7月:</strong> 第1陣として4方式を選定
            <ul>
              <li>CRYSTALS-Kyber（鍵カプセル化）</li>
              <li>CRYSTALS-Dilithium（デジタル署名）</li>
              <li>FALCON（デジタル署名）</li>
              <li>SPHINCS+（デジタル署名）</li>
            </ul>
          </li>
          <li><strong>2023年:</strong> FIPS草案公開</li>
          <li><strong>2024年:</strong> 標準化完了予定</li>
        </ul>

        <h3>アルゴリズムの分類</h3>
        <ul>
          <li><strong>格子ベース:</strong> Kyber, Dilithium, FALCON（最短ベクトル問題）</li>
          <li><strong>符号ベース:</strong> Classic McEliece（訂正不能な誤りを持つ符号の復号問題）</li>
          <li><strong>多変数多項式:</strong> Rainbow（解かれた、SIDHも解かれた）</li>
          <li><strong>ハッシュベース:</strong> SPHINCS+（ハッシュ関数の安全性のみに依存）</li>
        </ul>
      </section>

      <section className="card">
        <h2>Kyber（鍵カプセル化機構）</h2>

        <h3>概要</h3>
        <p>
          Module Learning With Errors（M-LWE）問題に基づく鍵カプセル化機構（KEM）。
          TLS、VPN、ディスク暗号化での鍵交換に使用。
        </p>

        <h3>パラメータセット</h3>
        <ul>
          <li><strong>Kyber-512:</strong> AES-128相当（公開鍵800bytes）</li>
          <li><strong>Kyber-768:</strong> AES-192相当（公開鍵1184bytes）</li>
          <li><strong>Kyber-1024:</strong> AES-256相当（公開鍵1568bytes）</li>
        </ul>

        <h3>パフォーマンス</h3>
        <ul>
          <li><strong>鍵生成:</strong> 数十マイクロ秒</li>
          <li><strong>カプセル化:</strong> 数十マイクロ秒</li>
          <li><strong>脱カプセル化:</strong> 数十マイクロ秒</li>
        </ul>
        <p>RSA-2048（数ミリ秒）やECDH P-256（数百マイクロ秒）と比較して実用的な速度。</p>

        <h3>実装</h3>
        <ul>
          <li><strong>liboqs:</strong> Open Quantum Safe プロジェクトのC実装</li>
          <li><strong>Cloudflare:</strong> TLS実験的サポート（2019年〜）</li>
          <li><strong>Google Chrome:</strong> 実験的実装（chrome://flags）</li>
        </ul>

        <h3>セキュリティ</h3>
        <ul>
          <li>古典コンピュータに対しても安全（格子問題の困難性）</li>
          <li>量子アルゴリズムによる已知の効率的攻撃なし</li>
          <li>CCA2安全性（選択暗号文攻撃耐性）</li>
        </ul>
      </section>

      <section className="card">
        <h2>Dilithium（デジタル署名）</h2>

        <h3>概要</h3>
        <p>
          M-LWE問題に基づくデジタル署名方式。Fiat-Shamir変換によりゼロ知識証明から構成。
        </p>

        <h3>パラメータセット</h3>
        <ul>
          <li><strong>Dilithium2:</strong> AES-128相当（公開鍵1312bytes、署名2420bytes）</li>
          <li><strong>Dilithium3:</strong> AES-192相当（公開鍵1952bytes、署名3293bytes）</li>
          <li><strong>Dilithium5:</strong> AES-256相当（公開鍵2592bytes、署名4595bytes）</li>
        </ul>

        <h3>比較: RSA vs ECDSA vs Dilithium</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '8px', textAlign: 'left' }}>方式</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>公開鍵</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>署名長</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>量子耐性</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px' }}>RSA-2048</td>
              <td style={{ padding: '8px' }}>256 bytes</td>
              <td style={{ padding: '8px' }}>256 bytes</td>
              <td style={{ padding: '8px' }}>❌</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px' }}>ECDSA P-256</td>
              <td style={{ padding: '8px' }}>64 bytes</td>
              <td style={{ padding: '8px' }}>64 bytes</td>
              <td style={{ padding: '8px' }}>❌</td>
            </tr>
            <tr>
              <td style={{ padding: '8px' }}>Dilithium3</td>
              <td style={{ padding: '8px' }}>1952 bytes</td>
              <td style={{ padding: '8px' }}>3293 bytes</td>
              <td style={{ padding: '8px' }}>✅</td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: '8px', fontSize: '14px', color: '#64748b' }}>
          署名サイズは大きいが、署名・検証速度はECDSAと同程度
        </p>

        <h3>用途</h3>
        <ul>
          <li>TLS証明書の署名</li>
          <li>ソフトウェア署名・コード署名</li>
          <li>ブロックチェーン・分散台帳</li>
          <li>ファームウェア更新の検証</li>
        </ul>
      </section>

      <section className="card">
        <h2>ハイブリッド暗号方式</h2>

        <h3>なぜハイブリッドか</h3>
        <p>
          PQC方式は実績が浅く、未知の脆弱性が発見される可能性があります。
          一方、RSA/ECCは量子コンピュータ以外の攻撃に対しては十分な実績があります。
        </p>

        <h3>ハイブリッドTLS</h3>
        <p>
          古典暗号とPQCを<strong>同時に使用</strong>し、どちらか一方が破られても安全性を維持：
        </p>
        <ul>
          <li>X25519（楕円曲線） + Kyber768</li>
          <li>共有鍵 = KDF(X25519の共有秘密 || Kyberの共有秘密)</li>
          <li>両方を解読しない限り通信内容は保護される</li>
        </ul>

        <h3>実装例</h3>
        <ul>
          <li><strong>Cloudflare:</strong> 2019年からハイブリッドTLS実験</li>
          <li><strong>Google Chrome:</strong> X25519+Kyber768サポート開始</li>
          <li><strong>Signal:</strong> PQXDH（Post-Quantum Extended Diffie-Hellman）</li>
          <li><strong>AWS KMS:</strong> Hybrid Post-Quantum TLS option</li>
        </ul>

        <h3>移行戦略</h3>
        <ol>
          <li><strong>フェーズ1（現在）:</strong> ハイブリッド方式でリスク分散</li>
          <li><strong>フェーズ2（2025-2030）:</strong> PQC単独方式へ移行開始</li>
          <li><strong>フェーズ3（2030-2035）:</strong> 古典暗号の段階的廃止</li>
        </ol>
      </section>

      <section className="card">
        <h2>量子暗号通信（QKD）</h2>

        <h3>量子鍵配送（Quantum Key Distribution）</h3>
        <p>
          量子力学の原理（測定による状態変化）を利用して、盗聴を物理的に検知しながら鍵を共有。
        </p>

        <h3>BB84プロトコル（1984年）</h3>
        <p>
          Charles BennettとGilles Brassardが提案。量子ビット（光子の偏光状態）で鍵を送信。
        </p>
        <ul>
          <li>盗聴者が測定すると量子状態が変化し、検知可能</li>
          <li>理論的には無条件安全性（計算量的困難性に依存しない）</li>
        </ul>

        <h3>実用化の課題</h3>
        <ul>
          <li><strong>距離制限:</strong> 光ファイバーで数百km（減衰）</li>
          <li><strong>高コスト:</strong> 専用ハードウェア必要（数千万円〜）</li>
          <li><strong>低速:</strong> 鍵生成レートが低い（数kbps〜数Mbps）</li>
          <li><strong>実装攻撃:</strong> 理論上安全でも、実装の不完全性を突く攻撃</li>
        </ul>

        <h3>量子衛星</h3>
        <ul>
          <li><strong>中国「墨子号」（2016年）:</strong> 衛星-地上間QKD実証</li>
          <li><strong>日本:</strong> NICT、QKDネットワーク東京QKDネットワーク</li>
        </ul>

        <h3>PQC vs QKD</h3>
        <p>
          <strong>相補的な技術:</strong> QKDは専用ネットワーク、PQCは既存インフラで動作。
          コスト・利便性からPQCが主流になる見込みだが、超高セキュリティ用途（政府、金融）ではQKDも併用。
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
