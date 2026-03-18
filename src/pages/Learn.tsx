import { useEffect } from 'react'
import StepLesson, { type LessonStep } from '../components/ui/StepLesson'
import '../components/ui/StepLesson.css'

// ─── Fundamentals (Steps 1-3) ───

function WhatIsEncryption() {
  return (
    <>
      <p>
        暗号化は「秘密のメッセージを他人に読まれないようにする技術」です。
        インターネットで買い物をするとき、パスワードやクレジットカード情報が盗まれないよう守っているのが暗号化です。
      </p>

      <h3>暗号化が解決する問題</h3>
      <ul>
        <li><strong>盗聴防止:</strong> 通信内容を第三者に読まれない</li>
        <li><strong>改ざん防止:</strong> データが途中で書き換えられていないことを保証</li>
        <li><strong>なりすまし防止:</strong> 通信相手が本物であることを確認</li>
        <li><strong>否認防止:</strong> デジタル署名により送信者が「送っていない」と言い逃れできないようにする</li>
      </ul>

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
    </>
  )
}

function SymmetricVsAsymmetric() {
  return (
    <>
      <p>暗号には大きく2種類あります。</p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>共通鍵暗号（対称鍵暗号）</h3>
          <ul>
            <li><strong>仕組み:</strong> 同じ鍵で暗号化と復号化</li>
            <li><strong>長所:</strong> 高速（ハードウェア実装可能）</li>
            <li><strong>短所:</strong> n人通信には n(n-1)/2 個の鍵が必要</li>
            <li><strong>短所:</strong> 鍵の安全な共有が必要</li>
            <li><strong>代表例:</strong> AES, ChaCha20</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>公開鍵暗号（非対称鍵暗号）</h3>
          <ul>
            <li><strong>仕組み:</strong> 公開鍵で暗号化、秘密鍵で復号化</li>
            <li><strong>長所:</strong> 鍵配送問題の解決</li>
            <li><strong>短所:</strong> 共通鍵の1000〜10000倍遅い</li>
            <li><strong>短所:</strong> 量子コンピュータの脅威</li>
            <li><strong>代表例:</strong> RSA, ECDH, Ed25519</li>
          </ul>
        </div>
      </div>

      <h3>なぜ公開鍵暗号が発明されたか</h3>
      <p>
        共通鍵暗号には「鍵をどうやって安全に渡すか」という<strong>鍵配送問題</strong>がありました。
        1976年、Whitfield DiffieとMartin Hellmanが革命的なアイデアを提案：
        「公開してもよい鍵と、秘密にする鍵を数学的に関連付ける」
      </p>
      <ol>
        <li>各ユーザーは公開鍵と秘密鍵のペアを生成</li>
        <li>公開鍵は誰にでも配布してよい</li>
        <li>送信者は受信者の公開鍵で暗号化</li>
        <li>受信者は自分の秘密鍵でのみ復号化できる</li>
      </ol>
    </>
  )
}

function HybridAndTLS() {
  return (
    <>
      <p>
        実際のWebサイト（HTTPS）では、共通鍵暗号と公開鍵暗号の<strong>両方</strong>を組み合わせています。
        公開鍵暗号で安全に鍵を共有し、その鍵で共通鍵暗号を使って高速にデータをやり取りします。
        これを「ハイブリッド暗号」と呼びます。
      </p>

      <h3>TLS 1.3のハンドシェイク</h3>
      <ol>
        <li>クライアントがサーバーの証明書（公開鍵を含む）を取得</li>
        <li>ECDH鍵交換（P-256やx25519）でセッション鍵を共有（公開鍵暗号）</li>
        <li>以降の通信はAES-256-GCMで暗号化（共通鍵暗号）</li>
        <li>セッション終了後、セッション鍵は破棄（Perfect Forward Secrecy）</li>
      </ol>

      <h3>ハッシュ関数の役割</h3>
      <p>
        暗号システムには暗号化だけでなく、<strong>ハッシュ関数</strong>も重要な柱です。
        ハッシュ関数は「データの指紋」を作る技術で、パスワード保存、ファイル検証、デジタル署名に使われます。
      </p>
      <ul>
        <li><strong>原像計算困難性:</strong> ハッシュ値から元のデータを復元できない</li>
        <li><strong>衝突困難性:</strong> 同じハッシュ値を持つ異なるデータを見つけるのが困難</li>
        <li><strong>代表例:</strong> SHA-256（安全）、SHA-1（危殆化）、MD5（完全に危殆化）</li>
      </ul>

      <div className="step-lesson__callout">
        暗号の3つの柱：<strong>共通鍵暗号</strong>（高速なデータ暗号化）、<strong>公開鍵暗号</strong>（鍵配送の解決）、<strong>ハッシュ関数</strong>（データの完全性検証）。
        これらを組み合わせて安全なシステムが構築されます。
      </div>
    </>
  )
}

// ─── Algorithms (Steps 4-6) ───

function AESDeepDive() {
  return (
    <>
      <p>
        AES（Advanced Encryption Standard）は、2001年にNISTがDESの後継として標準化した共通鍵暗号です。
        設計者はJoan DaemenとVincent Rijmen（ベルギー）。
      </p>

      <h3>内部構造（SPN: Substitution-Permutation Network）</h3>
      <p>AESは128bitブロックを以下の4操作で繰り返し処理します（AES-256は14ラウンド）。</p>
      <ol>
        <li><strong>SubBytes:</strong> S-Box（置換表）による非線形変換</li>
        <li><strong>ShiftRows:</strong> 行ごとに左シフト（拡散）</li>
        <li><strong>MixColumns:</strong> 列ごとの行列乗算（拡散）</li>
        <li><strong>AddRoundKey:</strong> ラウンド鍵とXOR</li>
      </ol>

      <h3>暗号モード</h3>
      <p>AESは固定長ブロック（16バイト）しか暗号化できないため、モードが必要です。</p>
      <ul>
        <li><strong>ECB（使用禁止）:</strong> 同じ平文ブロックが同じ暗号文になり、パターンが漏洩</li>
        <li><strong>CBC:</strong> 前のブロックの暗号文を次のブロックとXOR。パディングオラクル攻撃に注意</li>
        <li><strong>GCM（推奨）:</strong> CTRモード + GMAC認証。暗号化と改ざん検知を同時に提供。TLS 1.3の必須暗号スイート</li>
        <li><strong>ChaCha20-Poly1305（推奨）:</strong> AES-NIがないデバイスでも高速。モバイル向け</li>
      </ul>

      <div className="step-lesson__callout">
        現代では必ず<strong>AEAD（認証付き暗号）</strong>を使用してください。AES-GCMまたはChaCha20-Poly1305が推奨です。
      </div>
    </>
  )
}

function RSAAndECC() {
  return (
    <>
      <h3>RSA（Rivest-Shamir-Adleman）</h3>
      <p>
        RSAは<strong>素因数分解問題の困難性</strong>に基づく公開鍵暗号です。
      </p>
      <ul>
        <li><strong>鍵生成:</strong> 2つの大きな素数 p, q を生成し、N = pq を計算。公開指数 e と秘密指数 d を導出</li>
        <li><strong>暗号化:</strong> C = M^e (mod N)</li>
        <li><strong>復号化:</strong> M = C^d (mod N)</li>
        <li><strong>鍵長:</strong> 最低2048bit、推奨3072bit</li>
        <li><strong>パディング:</strong> OAEP必須（PKCS#1 v1.5は非推奨）</li>
      </ul>

      <h3>楕円曲線暗号（ECC）</h3>
      <p>
        RSAと同等の安全性を、はるかに短い鍵長で実現します。
      </p>
      <ul>
        <li>ECC-256bit は RSA-3072bit と同等の安全性</li>
        <li>計算量・メモリ・通信量が大幅に削減。モバイル・IoTに最適</li>
      </ul>

      <h3>ECDH鍵交換</h3>
      <ol>
        <li>Aliceは秘密鍵 a を生成、公開鍵 A = aG を計算</li>
        <li>Bobは秘密鍵 b を生成、公開鍵 B = bG を計算</li>
        <li>共有秘密 S = abG（双方が同じ値を計算可能）</li>
      </ol>

      <h3>推奨曲線</h3>
      <ul>
        <li><strong>P-256:</strong> NIST標準、広くサポート</li>
        <li><strong>Curve25519:</strong> TLS 1.3で推奨。安全性と実装の容易さを重視</li>
        <li><strong>secp256k1:</strong> Bitcoin、Ethereumで使用</li>
      </ul>

      <div className="step-lesson__callout">
        RSA・ECCともにShorのアルゴリズムにより量子コンピュータで解読可能です。PQCへの移行が必要です。
      </div>
    </>
  )
}

function HashAlgorithms() {
  return (
    <>
      <h3>SHA-2ファミリー（SHA-256, SHA-512）</h3>
      <p>
        2001年にNISTが発表。Merkle-Damgard構造を採用し、Davies-Meyer圧縮関数を使用。
      </p>
      <ol>
        <li><strong>パディング:</strong> メッセージを512bitブロックに分割</li>
        <li><strong>初期ハッシュ値:</strong> 8つの32bit定数（最初の8つの素数の平方根）</li>
        <li><strong>圧縮関数:</strong> 各ブロックで64ラウンドの処理</li>
        <li><strong>最終ハッシュ値:</strong> 8つの32bitワードを連結して256bit出力</li>
      </ol>

      <h3>ハッシュ関数の危殆化の歴史</h3>
      <ul>
        <li><strong>MD5 (128bit):</strong> 2004年衝突発見、完全に危殆化</li>
        <li><strong>SHA-1 (160bit):</strong> 2017年Google/CWIが実用的衝突攻撃を実証</li>
        <li><strong>SHA-2 (SHA-256, SHA-512):</strong> 現在も安全。量子攻撃下でも128bit相当の安全性を保持</li>
        <li><strong>SHA-3 (Keccak):</strong> 2015年標準化。SHA-2とは異なるスポンジ構造を採用</li>
      </ul>

      <div className="step-lesson__callout">
        SHA-3はSHA-2の脆弱性が発見された場合のバックアップとして機能します。
        任意長出力が可能なSHAKE128/SHAKE256も提供されています。
      </div>
    </>
  )
}

// ─── Security (Steps 7-9) ───

function RandomAndKeyManagement() {
  return (
    <>
      <h3>暗号における乱数の安全性</h3>
      <p>
        乱数は暗号の「命」です。鍵を作るときに予測しやすい乱数を使うと、
        どんなに強力な暗号アルゴリズムを使っても攻撃者に鍵を推測されます。
      </p>
      <p>
        <code>Math.random()</code>は決定論的な疑似乱数生成器（PRNG）であり、
        <strong>セキュリティに関わる用途には絶対に使用してはいけません</strong>。
      </p>
      <ul>
        <li><strong>ブラウザ:</strong> <code>crypto.getRandomValues()</code>を使用</li>
        <li><strong>Node.js:</strong> <code>crypto.randomBytes()</code>を使用</li>
        <li><strong>Python:</strong> <code>secrets.token_bytes()</code>を使用</li>
      </ul>

      <h3>鍵管理の実務</h3>
      <ul>
        <li><strong>鍵生成:</strong> 必ずCSPRNGを使用し、十分な鍵長を確保（AES-256, RSA-3072以上）</li>
        <li><strong>鍵の保管:</strong> HSM/TPM/Secure Enclaveでハードウェアレベルの保護。LocalStorageやCookieへの保存は厳禁</li>
        <li><strong>鍵のローテーション:</strong> 定期的（1〜2年）に鍵を更新</li>
        <li><strong>PFS:</strong> セッションごとに一時鍵を使用し、長期鍵の漏洩影響を最小化</li>
      </ul>

      <div className="step-lesson__callout">
        <strong>実際の攻撃事例:</strong> 2013年のAndroid Bitcoin Walletでは、SecureRandomの実装不備により秘密鍵が漏洩しました。
        2008年のDebian OpenSSLでは、エントロピー不足により鍵生成が予測可能になりました。
      </div>
    </>
  )
}

function CipherAttacks() {
  return (
    <>
      <p>
        数学的に安全な暗号アルゴリズムでも、<strong>実装を間違える</strong>と簡単に破られます。
        ここで紹介する攻撃は、実際に現実世界で被害を出したものです。
      </p>

      <h3>ECBモードによるパターン漏洩</h3>
      <p>
        同じ平文ブロックが同じ暗号文になるため、画像を暗号化しても輪郭が見えてしまいます。
        いかなる場合も使用禁止です。
      </p>

      <h3>IV/ナンスの再利用</h3>
      <p>
        CBCモードでIVを使い回すと最初のブロックの等価性が漏洩。
        CTR/GCMモードでナンスを使い回すと<strong>鍵ストリームが完全に露出</strong>し、平文が復元されます。
      </p>

      <h3>パディングオラクル攻撃</h3>
      <p>
        CBCモードで「パディングが正しいかどうか」のエラーメッセージを返すと、
        攻撃者は暗号文を少しずつ解読できます。
        対策はAEADを使用するか、Encrypt-then-MAC構成を採用すること。
      </p>

      <h3>タイミング攻撃</h3>
      <p>
        処理時間のわずかな差から秘密情報を推測。
        文字列比較で通常の<code>==</code>を使うと、一致している長さが漏れます。
        常に一定時間で比較する<code>timingSafeEqual</code>関数を使用してください。
      </p>

      <div className="step-lesson__callout">
        <strong>鉄則:</strong> 暗号ライブラリを自作せず、信頼された実装を使用すること。
        ただし、その仕組みを理解することは安全な利用のために重要です。
      </div>
    </>
  )
}

function PasswordAndTLS() {
  return (
    <>
      <h3>パスワード保護のセキュリティ</h3>
      <p>
        単純なハッシュ関数（SHA-256など）は高速すぎるため、パスワード保存には不向きです。
        計算コストを高く設定できる専用の関数（KDF）を使用します。
      </p>
      <ul>
        <li><strong>Argon2:</strong> 最も推奨される最新アルゴリズム（メモリハード）</li>
        <li><strong>bcrypt:</strong> 広く使われている強力なアルゴリズム</li>
        <li><strong>PBKDF2:</strong> NIST推奨だが、GPU耐性は低め</li>
      </ul>
      <p>
        必ず<strong>ソルト</strong>を付与してレインボーテーブル攻撃を防ぎ、
        <strong>ストレッチング</strong>で総当たり攻撃を遅らせます。
      </p>

      <h3>TLS / PKI の実践</h3>
      <p>
        最新のTLS 1.3を使用し、古い暗号スイート（RSA鍵交換、CBCモード、SHA-1等）を無効化します。
      </p>
      <ul>
        <li><strong>証明書検証:</strong> 中間者攻撃は証明書の検証を省略したときに成立する。「オレオレ証明書」を安易に許可しない</li>
        <li><strong>DV証明書:</strong> ドメイン管理権限のみ確認</li>
        <li><strong>OV証明書:</strong> 組織の実在性を確認</li>
        <li><strong>EV証明書:</strong> 最も厳格な審査</li>
      </ul>

      <div className="step-lesson__callout">
        <strong>ベストプラクティス:</strong> パスワードにはArgon2 + ソルト、通信にはTLS 1.3 + AES-GCMまたはChaCha20-Poly1305を使用してください。
      </div>
    </>
  )
}

// ─── PQC (Steps 10-11) ───

function QuantumThreatOverview() {
  return (
    <>
      <p>
        現代暗号は<strong>公開鍵暗号の困難性</strong>（素因数分解・離散対数）と
        <strong>共通鍵暗号の総当たりが現実的でないこと</strong>の二本柱で成立しています。
        量子アルゴリズムはそれぞれに対応する弱点を突きます。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>Shorのアルゴリズム</h3>
          <ul>
            <li>素因数分解・離散対数を多項式時間に</li>
            <li>RSA、DH、ECDH/ECDSAの前提が崩壊</li>
            <li>RSA-2048解読には推定数百万物理qubit</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>Groverのアルゴリズム</h3>
          <ul>
            <li>総当たり探索を平方根に短縮</li>
            <li>AES-128は実質64bit安全性に</li>
            <li>対策: 鍵長を2倍に（AES-256推奨）</li>
          </ul>
        </div>
      </div>

      <h3>NIST PQC標準化</h3>
      <p>
        2022年、NISTは第1陣として<strong>Kyber</strong>（KEM）、<strong>Dilithium</strong>（署名）、
        FALCON、SPHINCS+を選出。格子ベースの方式が主流です。
      </p>

      <div className="step-lesson__callout">
        <strong>Harvest Now, Decrypt Later:</strong> 今の暗号通信を記録し、量子コンピュータが実用化されたら解読する攻撃。
        長期秘匿データは今すぐPQCへの移行を検討すべきです。
      </div>
    </>
  )
}

function PQCMigration() {
  return (
    <>
      <h3>Kyber（鍵カプセル化機構）</h3>
      <p>Module-LWEベースのKEM。TLS・VPN・ディスク暗号化に組み込まれる公開鍵PQCの主役です。</p>
      <ul>
        <li><strong>Kyber-512:</strong> AES-128相当（公開鍵800B）</li>
        <li><strong>Kyber-768:</strong> AES-192相当（公開鍵1184B）。ハイブリッドTLSのデファクト</li>
        <li><strong>Kyber-1024:</strong> AES-256相当（公開鍵1568B）</li>
      </ul>

      <h3>Dilithium（デジタル署名）</h3>
      <p>M-SIS/M-LWEベースの署名方式。PKI・コード署名・ブロックチェーン向け。</p>
      <ul>
        <li>Dilithium3: 公開鍵 1952B、署名 3293B（RSA-2048の約8倍のサイズ）</li>
        <li>署名・検証速度はECDSAと同等</li>
      </ul>

      <h3>ハイブリッド暗号方式</h3>
      <p>未知の脆弱性に備えて、古典暗号とPQCを<strong>併用</strong>するのが移行期のベストプラクティスです。</p>
      <ul>
        <li>X25519 + Kyber768 を並列で鍵交換し、共有秘密を連結してKDF</li>
        <li>Cloudflare、Google Chrome、Signal PQXDH等が実装中</li>
      </ul>

      <h3>移行ロードマップ</h3>
      <ol>
        <li><strong>Phase 1（現在）:</strong> 既存サービスにハイブリッド暗号を追加</li>
        <li><strong>Phase 2（2025-2030）:</strong> PQC単独モードを必須要件化</li>
        <li><strong>Phase 3（2030年代）:</strong> 古典公開鍵暗号を段階的に廃止</li>
      </ol>

      <div className="step-lesson__callout">
        PQCは既存インフラで展開しやすいのが強み。政府・金融・宇宙通信など極秘用途では量子鍵配送（QKD）との併用も検討されています。
      </div>
    </>
  )
}

export default function Learn() {
  useEffect(() => {
    document.title = '学習 - CryptoLab'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const steps: LessonStep[] = [
    // ─── Fundamentals (Steps 1-3) ───
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
        explanation: '正解！Kerckhoffsの原理により、鍵以外のすべて（アルゴリズム、実装コード、暗号文など）が公開されても安全でなければなりません。秘密にすべきは「鍵」のみです。',
      },
    },
    {
      title: '共通鍵暗号 vs 公開鍵暗号',
      content: <SymmetricVsAsymmetric />,
      quiz: {
        question: '公開鍵暗号の最大の利点は何か？',
        options: [
          { label: '暗号化速度が速い' },
          { label: '鍵配送問題の解決', correct: true },
          { label: '鍵長が短い' },
          { label: '量子コンピュータに強い' },
        ],
        explanation: '正解！公開鍵は誰でも知ってよいため、事前に秘密の鍵を共有する必要がありません。公開鍵で暗号化したデータは、対応する秘密鍵でしか復号できません。',
      },
    },
    {
      title: 'ハイブリッド暗号とハッシュ関数',
      content: <HybridAndTLS />,
      quiz: {
        question: 'HTTPS通信で公開鍵暗号と共通鍵暗号をどう使い分けているか？',
        options: [
          { label: '公開鍵暗号だけを使用する' },
          { label: '共通鍵暗号だけを使用する' },
          { label: '公開鍵暗号で鍵を共有し、共通鍵暗号でデータを暗号化する', correct: true },
          { label: '通信内容によって切り替える' },
        ],
        explanation: '正解！ハンドシェイク時に公開鍵暗号（ECDH）で共通鍵（セッション鍵）を安全に共有し、データ転送時に共通鍵暗号（AES-GCM）で高速に暗号化します。',
      },
    },
    // ─── Algorithms (Steps 4-6) ───
    {
      title: 'AES - 共通鍵暗号の標準',
      content: <AESDeepDive />,
      quiz: {
        question: 'なぜECBモードを使用してはいけないのか？',
        options: [
          { label: '暗号化速度が遅いから' },
          { label: '鍵長が短くなるから' },
          { label: '同じ平文ブロックが同じ暗号文になり、パターンが漏洩するから', correct: true },
          { label: 'AESと互換性がないから' },
        ],
        explanation: '正解！ECBモードでは同じ平文ブロックが常に同じ暗号文ブロックに変換されるため、データのパターンが丸見えになります。必ずGCMなどのAEADモードを使用してください。',
      },
    },
    {
      title: 'RSA と 楕円曲線暗号',
      content: <RSAAndECC />,
      quiz: {
        question: 'ECC-256bitはRSA何bitと同等の安全性を持つか？',
        options: [
          { label: 'RSA-256bit' },
          { label: 'RSA-1024bit' },
          { label: 'RSA-2048bit' },
          { label: 'RSA-3072bit', correct: true },
        ],
        explanation: '正解！ECC-256bitはRSA-3072bitと同等の安全性を持ちます。楕円曲線暗号は短い鍵長で高い安全性を実現でき、モバイルやIoTデバイスに最適です。',
      },
    },
    {
      title: 'ハッシュアルゴリズムの詳解',
      content: <HashAlgorithms />,
      quiz: {
        question: 'SHA-1が危殆化した原因は？',
        options: [
          { label: '鍵長が短すぎたため' },
          { label: '2017年に実用的な衝突攻撃が実証されたため', correct: true },
          { label: '量子コンピュータにより解読されたため' },
          { label: 'NISTが標準から除外したため' },
        ],
        explanation: '正解！2017年、GoogleとCWI Amsterdamが「SHAttered攻撃」で2つの異なるPDFファイルから同じSHA-1ハッシュ値を生成することに成功しました。',
      },
    },
    // ─── Security (Steps 7-9) ───
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
        explanation: '正解！Math.random()は決定論的な疑似乱数生成器であり、内部状態から次の値を予測できます。暗号用途にはcrypto.getRandomValues()等のCSPRNGを使用してください。',
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
        explanation: '正解！タイミング攻撃は処理時間の差から秘密情報を推測します。timingSafeEqual関数は入力に関わらず常に一定時間で比較を行い、この攻撃を防ぎます。',
      },
    },
    {
      title: 'パスワード保護とTLS',
      content: <PasswordAndTLS />,
      quiz: {
        question: 'パスワードの安全な保存に最も推奨されるアルゴリズムは？',
        options: [
          { label: 'SHA-256' },
          { label: 'AES-256' },
          { label: 'Argon2', correct: true },
          { label: 'MD5 + ソルト' },
        ],
        explanation: '正解！Argon2はメモリハードなKDF（鍵導出関数）で、計算コストを高く設定でき、GPU/ASICによる総当たり攻撃への耐性が高いです。必ずソルトを付与して使用してください。',
      },
    },
    // ─── PQC (Steps 10-11) ───
    {
      title: '量子コンピュータの脅威',
      content: <QuantumThreatOverview />,
      quiz: {
        question: 'Groverのアルゴリズムへの対策として正しいものは？',
        options: [
          { label: '公開鍵暗号を使わない' },
          { label: 'ハッシュ関数を使わない' },
          { label: '鍵長を2倍にする（例：AES-256を使用）', correct: true },
          { label: '暗号化を2回行う' },
        ],
        explanation: '正解！Groverのアルゴリズムは総当たり探索を平方根に短縮するため、鍵長を2倍にすることで同等の安全性を維持できます。AES-128ではなくAES-256を使用してください。',
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
        explanation: '正解！ハイブリッド方式（例：X25519 + Kyber768）では、片方が破られてももう片方が通信を守ります。Cloudflare、Google、Signal等が既にこのアプローチを採用しています。',
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
