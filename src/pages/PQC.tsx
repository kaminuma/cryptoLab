import { useEffect, useState } from 'react'
import StepLesson, { type LessonStep } from '../components/ui/StepLesson'
import '../components/ui/StepLesson.css'
import { usePageMeta } from '../hooks/usePageMeta'

/* =========================================
   Step 1: なぜ「量子」が暗号を脅かすのか
   たとえ話から入り、全体の見取り図を提示
   ========================================= */
function WhyQuantumThreatens() {
  return (
    <>
      <p>
        ポスト量子暗号を理解するために、まず「迷路」のたとえで考えてみましょう。
      </p>
      <p>
        現代の暗号は<strong>巨大な迷路</strong>のようなものです。
        入口から出口まで正しいルート（秘密鍵）を知っている人は一瞬で通り抜けられますが、
        知らない人は何十億もの分岐をひとつずつ試さなければなりません。
        古典コンピュータが迷路を解くとき、通路を1本ずつ歩いて確かめる必要があります。
        ところが量子コンピュータは、<strong>すべての通路を同時に歩ける</strong>かのように振る舞います。
        この「同時に試す」力こそが、現代暗号を脅かす本質です。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: 量子重ね合わせ（Superposition）</strong><br />
        古典ビットは0か1のどちらかだが、量子ビット（qubit）は0と1の状態を同時に保持できる。
        n個のqubitで2<sup>n</sup>個の状態を同時に表現し、並列に計算を進められる。
      </div>

      <p>
        ただし「すべてが速くなる」わけではありません。
        量子コンピュータが劇的に速くなるのは、<strong>特定の数学的構造を持つ問題</strong>に限られます。
        暗号にとって致命的なのは、以下の2つのアルゴリズムです。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>Shorのアルゴリズム</h3>
          <ul>
            <li>素因数分解・離散対数を多項式時間で解く</li>
            <li>RSA、Diffie-Hellman、ECDHを<strong>完全に破壊</strong></li>
            <li>公開鍵暗号が主な標的</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>Groverのアルゴリズム</h3>
          <ul>
            <li>探索問題を平方根の時間で解く</li>
            <li>共通鍵暗号の安全性を<strong>半減</strong>させる</li>
            <li>AES-128 → 64bit安全性に低下</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>用語: Harvest Now, Decrypt Later（HNDL）</strong><br />
        攻撃者が今の暗号通信を記録しておき、将来量子コンピュータが実用化された時点で解読する戦略。
        政府機密や医療記録など長期秘匿が必要なデータは、今すぐ対策が必要とされる理由。
      </div>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong>
        <br />1. 量子コンピュータは「迷路のすべての通路を同時に歩ける」ような計算能力を持つ。
        <br />2. Shorのアルゴリズムは公開鍵暗号を、Groverのアルゴリズムは共通鍵暗号の安全性をそれぞれ脅かす。
        <br />3. HNDL攻撃により、量子コンピュータ実用化の「前」から対策が必要。
      </div>
    </>
  )
}

/* =========================================
   Step 2: Shorのアルゴリズム — なぜ素因数分解が速くなるか
   量子フーリエ変換の直感的説明
   ========================================= */
function ShorAlgorithm() {
  return (
    <>
      <p>
        Step 1の迷路のたとえを思い出してください。
        Shorのアルゴリズムは、迷路の中に隠された<strong>「繰り返しパターン」</strong>を量子の力で一瞬で見つけ出す方法です。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: Shorのアルゴリズム（1994年）</strong><br />
        Peter Shorが発表した量子アルゴリズム。整数の素因数分解と離散対数問題を
        多項式時間 O((log N)<sup>3</sup>) で解く。
        RSA、Diffie-Hellman、楕円曲線暗号のすべてを破る理論的根拠。
      </div>

      <p>
        なぜ素因数分解が速くなるのか、直感的に理解しましょう。
        RSAの安全性は「N = p x q のNからp, qを求めるのが難しい」ことに依存しています。
        Shorのアルゴリズムはこれを<strong>周期発見問題</strong>に変換します。
      </p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>Shorのアルゴリズムの流れ</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>1. ランダムな a を選び、f(x) = a<sup>x</sup> mod N を考える</div>
          <div>2. この関数には「周期 r」がある（f(x) = f(x+r)）</div>
          <div>3. 量子フーリエ変換で周期 r を高速に発見</div>
          <div>4. r から gcd(a<sup>r/2</sup> - 1, N) で p または q を計算</div>
          <div style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-text-subtle)' }}>
            古典コンピュータ: 周期 r の発見に指数時間が必要
          </div>
          <div style={{ color: 'var(--color-text-subtle)' }}>
            量子コンピュータ: 量子フーリエ変換で多項式時間
          </div>
        </div>
      </div>

      <p>
        <strong>量子フーリエ変換（QFT）</strong>が鍵です。
        古典コンピュータでは、周期を見つけるためにf(x)を膨大な回数計算する必要がありますが、
        量子コンピュータは重ね合わせ状態で全てのxに対するf(x)を同時に計算し、
        QFTで周期を「波の干渉パターン」として一気に抽出します。
        音叉の共鳴のように、正しい周期の信号だけが強め合い、他は打ち消し合うイメージです。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>古典コンピュータでの素因数分解</h3>
          <ul>
            <li>最善: 一般数体ふるい法</li>
            <li>RSA-2048: 数千年〜数百万年</li>
            <li>計算量: 準指数時間</li>
            <li>鍵を大きくすれば安全性を保てる</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>量子コンピュータでの素因数分解</h3>
          <ul>
            <li>Shorのアルゴリズム</li>
            <li>RSA-2048: 約4000論理qubitで数時間</li>
            <li>計算量: 多項式時間 O((log N)<sup>3</sup>)</li>
            <li>鍵を大きくしても焼け石に水</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong>
        <br />1. Shorのアルゴリズムは素因数分解を「周期発見」に帰着させ、量子フーリエ変換で高速に解く。
        <br />2. RSAの鍵を大きくしても多項式時間で解けるため、根本的な対策にならない。
        <br />3. 必要なqubit数（約4000論理qubit）はまだ実現していないが、10〜20年以内と予測されている。
      </div>
    </>
  )
}

/* =========================================
   Step 3: Groverのアルゴリズムと共通鍵暗号への影響
   ========================================= */
function GroverAlgorithm() {
  return (
    <>
      <p>
        Shorが公開鍵暗号を「破壊」するのに対し、Groverのアルゴリズムは共通鍵暗号の安全性を「半減」させます。
        この違いを正確に理解することが、量子時代の暗号選択の基盤になります。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: Groverのアルゴリズム（1996年）</strong><br />
        Lov Groverが発表した量子探索アルゴリズム。
        N個の要素から条件を満たすものを探す問題を、古典の O(N) から O(&#8730;N) に高速化する。
        暗号の文脈では、鍵の総当たり探索を平方根の時間で行える。
      </div>

      <p>
        迷路のたとえに戻りましょう。共通鍵暗号の鍵を見つけることは、
        N本の通路のうち正しい1本を見つけることに相当します。
        古典コンピュータはN本すべてを試す必要がありますが、
        量子コンピュータは&#8730;N本を試すだけで見つけられます。
      </p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>Groverの影響: 安全性ビット数の半減</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            AES-128: 2<sup>128</sup>通りの鍵 → Groverで2<sup>64</sup>回の探索 → <strong>64bit安全性</strong>
          </div>
          <div>
            AES-192: 2<sup>192</sup>通りの鍵 → Groverで2<sup>96</sup>回の探索 → <strong>96bit安全性</strong>
          </div>
          <div>
            AES-256: 2<sup>256</sup>通りの鍵 → Groverで2<sup>128</sup>回の探索 → <strong>128bit安全性</strong>
          </div>
          <div style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-text-subtle)' }}>
            128bit安全性は量子時代でも十分 → AES-256を使えばOK
          </div>
        </div>
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>公開鍵暗号への影響（Shor）</h3>
          <ul>
            <li>RSA: <strong>完全に破壊</strong></li>
            <li>ECDH/ECDSA: <strong>完全に破壊</strong></li>
            <li>Diffie-Hellman: <strong>完全に破壊</strong></li>
            <li>対策: アルゴリズム自体の置き換えが必要</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>共通鍵暗号への影響（Grover）</h3>
          <ul>
            <li>AES-128: 64bit安全性に低下（不十分）</li>
            <li>AES-256: 128bit安全性（十分）</li>
            <li>SHA-256: 128bit衝突耐性（十分）</li>
            <li>対策: <strong>鍵長を2倍にすれば対応可能</strong></li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong>
        <br />1. Groverは共通鍵暗号の安全性を半分にするが、鍵長を2倍にすれば対抗できる（AES-256で十分）。
        <br />2. Shorは公開鍵暗号を根本的に破壊するため、アルゴリズム自体の置き換えが必要。
        <br />3. 「量子耐性暗号（PQC）」が急務なのは主に公開鍵暗号の問題。
      </div>
    </>
  )
}

/* =========================================
   Step 4: 格子とは何か — LWE問題の直感的理解
   ========================================= */
function LatticeAndLWE() {
  return (
    <>
      <p>
        量子コンピュータに対抗するため、暗号学者たちは「素因数分解」に代わる新しい難しい問題を探しました。
        その答えが<strong>格子（Lattice）</strong>上の問題です。
        ここでもたとえ話から始めましょう。
      </p>

      <p>
        格子問題を理解するために、<strong>「ノイズ入りの連立方程式」</strong>を想像してください。
        中学校で習った連立方程式 — 例えば「3x + 5y = 23, 2x + 7y = 31」は、
        正確に解を求められます。ところが、各式に少しずつランダムなノイズ（誤差）を加えると、
        「3x + 5y ≈ 23, 2x + 7y ≈ 31」のように近似的にしか成り立ちません。
        変数の数が少なければノイズを無視して解けますが、
        変数が数百〜数千になると、ノイズが邪魔をして正しい解を見つけるのが
        <strong>量子コンピュータでも</strong>極めて困難になります。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: LWE問題（Learning With Errors）</strong><br />
        「ノイズ付きの線形方程式系から秘密ベクトルを復元する」問題。
        行列 A と秘密ベクトル s に対して b = As + e（eはノイズ）が与えられたとき、
        A と b から s を求めることが計算量的に困難。
        2005年にOded Regevが提案し、最悪ケースの格子問題への帰着が証明されている。
      </div>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>LWE問題の構造</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            公開: A（ランダム行列）, b = A*s + e
          </div>
          <div>秘密: s（秘密ベクトル）, e（小さなノイズ）</div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            例（小さいスケール）:
          </div>
          <div>  [ 3  5 ] [s1]   [2]   [23 + 2]   [25]</div>
          <div>  [ 2  7 ] [s2] + [1] = [31 + 1] = [32]</div>
          <div style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-text-subtle)' }}>
            実際のKyberでは 256次元の多項式環上で動作（Ring-LWE）
          </div>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>用語: 格子（Lattice）</strong><br />
        n次元空間における基底ベクトルの整数線形結合で表される点の集合。
        2次元なら碁盤の目のようなもの。格子上の「最短ベクトル問題（SVP）」や
        「最近ベクトル問題（CVP）」は、次元が高くなると量子コンピュータでも効率的に解けないと信じられている。
        LWE問題はこれらの格子問題に帰着される。
      </div>

      <p>
        格子問題が暗号に適している理由は3つあります。
      </p>
      <ol>
        <li>
          <strong>量子耐性</strong> — Shorのアルゴリズムは周期性を利用するが、格子問題には周期構造がないため適用できない。
        </li>
        <li>
          <strong>最悪ケース帰着</strong> — LWE問題の困難性は、格子問題の最悪ケース（最も解きやすいインスタンス）の困難性に帰着される。
          つまり「たまたま弱い鍵が生成される」リスクが低い。
        </li>
        <li>
          <strong>効率性</strong> — 特にRing-LWE（多項式環上のLWE）は、行列演算を多項式乗算に置き換えることで高速かつコンパクトに実装できる。
        </li>
      </ol>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong>
        <br />1. 格子暗号の安全性は「ノイズ入りの連立方程式を解く難しさ」に基づく。
        <br />2. 量子コンピュータのShorアルゴリズムは格子問題に適用できない。
        <br />3. Ring-LWEにより、理論的な安全性と実装効率を両立できる。
      </div>
    </>
  )
}

/* =========================================
   Step 5: Kyberの仕組み — 鍵カプセル化の流れ
   ========================================= */
function KyberMechanism() {
  return (
    <>
      <p>
        Step 4で学んだLWE問題を使って、実際にどう暗号通信を行うのか見てみましょう。
        NISTが標準として選定した<strong>CRYSTALS-Kyber（ML-KEM, FIPS 203）</strong>は、
        「鍵カプセル化機構（KEM）」と呼ばれる仕組みを使います。
      </p>

      <div className="step-lesson__callout">
        <strong>用語: KEM（Key Encapsulation Mechanism）</strong><br />
        共通鍵を安全に相手に送るための仕組み。公開鍵で共通鍵を「カプセル」に包んで送り、
        受信者が秘密鍵でカプセルを開けて共通鍵を取り出す。
        RSAのような直接暗号化ではなく、共通鍵の受け渡しに特化した設計。
      </div>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>Kyberの鍵カプセル化フロー</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            <strong>1. 鍵生成（KeyGen）</strong>
          </div>
          <div>   秘密鍵: s（秘密ベクトル）</div>
          <div>   公開鍵: (A, b = As + e)　← LWE問題のインスタンス</div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            <strong>2. カプセル化（Encaps）</strong> — 送信者が実行
          </div>
          <div>   ランダムなr, e', e'' を生成</div>
          <div>   u = A<sup>T</sup>r + e'</div>
          <div>   v = b<sup>T</sup>r + e'' + encode(m)　← mはランダムな共通鍵の種</div>
          <div>   カプセル: (u, v) を送信 / 共通鍵: K = H(m)</div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            <strong>3. 脱カプセル化（Decaps）</strong> — 受信者が実行
          </div>
          <div>   m' = decode(v - s<sup>T</sup>u)　← ノイズが相殺されmが復元</div>
          <div>   共通鍵: K = H(m')</div>
        </div>
      </div>

      <p>
        <strong>なぜ秘密鍵sがあるとmを復元できるのか？</strong>
        v - s<sup>T</sup>u を計算すると、LWEのノイズ項が相殺され、encode(m)に近い値が得られます。
        ノイズは「十分小さい」ため、復号時に丸め処理で正しいmを取り出せます。
        一方、sを知らない攻撃者はLWE問題を解く必要があり、これは計算量的に困難です。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>RSA鍵交換との比較</h3>
          <ul>
            <li>RSA: c = m<sup>e</sup> mod n で暗号化</li>
            <li>安全性: 素因数分解の困難性</li>
            <li>量子コンピュータ: Shorで破壊</li>
            <li>公開鍵サイズ: 256バイト（RSA-2048）</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>Kyber鍵カプセル化</h3>
          <ul>
            <li>Kyber: LWEベースのカプセル化</li>
            <li>安全性: Module-LWE問題の困難性</li>
            <li>量子コンピュータ: 既知の攻撃なし</li>
            <li>公開鍵サイズ: 1184バイト（Kyber768）</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong>
        <br />1. KyberはLWE問題のノイズを巧みに利用し、秘密鍵保持者だけがノイズを除去して共通鍵を取り出せる。
        <br />2. KEMは「共通鍵を安全に共有する」ことに特化した仕組みで、TLSの鍵交換に最適。
        <br />3. 公開鍵サイズはRSAの約5倍だが、暗号化・復号の速度はRSAより高速。
      </div>
    </>
  )
}

/* =========================================
   Step 6: 鍵サイズ比較 — インタラクティブ可視化
   ========================================= */

type AlgorithmData = {
  name: string
  category: string
  publicKey: number
  privateKey: number
  cipherOrSig: number
  cipherOrSigLabel: string
  quantumSafe: boolean
  nistLevel: string
}

const algorithms: AlgorithmData[] = [
  {
    name: 'RSA-2048',
    category: '公開鍵暗号',
    publicKey: 256,
    privateKey: 1280,
    cipherOrSig: 256,
    cipherOrSigLabel: '暗号文',
    quantumSafe: false,
    nistLevel: '-',
  },
  {
    name: 'RSA-4096',
    category: '公開鍵暗号',
    publicKey: 512,
    privateKey: 2560,
    cipherOrSig: 512,
    cipherOrSigLabel: '暗号文',
    quantumSafe: false,
    nistLevel: '-',
  },
  {
    name: 'ECDH P-256',
    category: '鍵交換',
    publicKey: 64,
    privateKey: 32,
    cipherOrSig: 64,
    cipherOrSigLabel: '共有秘密',
    quantumSafe: false,
    nistLevel: '-',
  },
  {
    name: 'ECDSA P-256',
    category: '署名',
    publicKey: 64,
    privateKey: 32,
    cipherOrSig: 64,
    cipherOrSigLabel: '署名',
    quantumSafe: false,
    nistLevel: '-',
  },
  {
    name: 'Kyber512 (ML-KEM)',
    category: 'PQC KEM',
    publicKey: 800,
    privateKey: 1632,
    cipherOrSig: 768,
    cipherOrSigLabel: '暗号文',
    quantumSafe: true,
    nistLevel: 'Level 1',
  },
  {
    name: 'Kyber768 (ML-KEM)',
    category: 'PQC KEM',
    publicKey: 1184,
    privateKey: 2400,
    cipherOrSig: 1088,
    cipherOrSigLabel: '暗号文',
    quantumSafe: true,
    nistLevel: 'Level 3',
  },
  {
    name: 'Kyber1024 (ML-KEM)',
    category: 'PQC KEM',
    publicKey: 1568,
    privateKey: 3168,
    cipherOrSig: 1568,
    cipherOrSigLabel: '暗号文',
    quantumSafe: true,
    nistLevel: 'Level 5',
  },
  {
    name: 'Dilithium2 (ML-DSA)',
    category: 'PQC 署名',
    publicKey: 1312,
    privateKey: 2560,
    cipherOrSig: 2420,
    cipherOrSigLabel: '署名',
    quantumSafe: true,
    nistLevel: 'Level 2',
  },
  {
    name: 'Dilithium3 (ML-DSA)',
    category: 'PQC 署名',
    publicKey: 1952,
    privateKey: 4032,
    cipherOrSig: 3293,
    cipherOrSigLabel: '署名',
    quantumSafe: true,
    nistLevel: 'Level 3',
  },
  {
    name: 'FALCON-512',
    category: 'PQC 署名',
    publicKey: 897,
    privateKey: 1281,
    cipherOrSig: 666,
    cipherOrSigLabel: '署名',
    quantumSafe: true,
    nistLevel: 'Level 1',
  },
  {
    name: 'SPHINCS+-128f',
    category: 'PQC 署名',
    publicKey: 32,
    privateKey: 64,
    cipherOrSig: 17088,
    cipherOrSigLabel: '署名',
    quantumSafe: true,
    nistLevel: 'Level 1',
  },
]

function KeySizeComparison() {
  const [showChart, setShowChart] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<'publicKey' | 'cipherOrSig'>('publicKey')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const categories = ['all', ...Array.from(new Set(algorithms.map(a => a.category)))]

  const filtered = filterCategory === 'all'
    ? algorithms
    : algorithms.filter(a => a.category === filterCategory)

  const maxValue = Math.max(...filtered.map(a => a[selectedMetric]))

  return (
    <>
      <p>
        PQCアルゴリズムの最大の実用上の課題は<strong>鍵サイズの増大</strong>です。
        RSAやECCと比較して、どの程度大きくなるのかを視覚的に確認しましょう。
      </p>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>

        <div style={{ marginBottom: 'var(--spacing-md)' }}>
          <label>カテゴリで絞り込み:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'すべて表示' : c}</option>
            ))}
          </select>
        </div>

        {/* サイズ比較テーブル */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-mono)',
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th style={{ textAlign: 'left', padding: '8px 6px', color: 'var(--color-text-main)' }}>アルゴリズム</th>
                <th style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--color-text-main)' }}>公開鍵</th>
                <th style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--color-text-main)' }}>秘密鍵</th>
                <th style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--color-text-main)' }}>暗号文/署名</th>
                <th style={{ textAlign: 'center', padding: '8px 6px', color: 'var(--color-text-main)' }}>NIST</th>
                <th style={{ textAlign: 'center', padding: '8px 6px', color: 'var(--color-text-main)' }}>量子耐性</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((algo) => (
                <tr key={algo.name} style={{
                  borderBottom: '1px solid var(--color-border)',
                  background: algo.quantumSafe ? 'color-mix(in srgb, var(--color-success) 5%, transparent)' : 'transparent',
                }}>
                  <td style={{ padding: '8px 6px', fontWeight: 600, color: 'var(--color-text-main)' }}>{algo.name}</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--color-text-muted)' }}>{algo.publicKey.toLocaleString()} B</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--color-text-muted)' }}>{algo.privateKey.toLocaleString()} B</td>
                  <td style={{ textAlign: 'right', padding: '8px 6px', color: 'var(--color-text-muted)' }}>{algo.cipherOrSig.toLocaleString()} B</td>
                  <td style={{ textAlign: 'center', padding: '8px 6px', color: 'var(--color-text-subtle)' }}>{algo.nistLevel}</td>
                  <td style={{ textAlign: 'center', padding: '8px 6px' }}>
                    {algo.quantumSafe
                      ? <span style={{ color: 'var(--color-success-dark)', fontWeight: 700 }}>Yes</span>
                      : <span style={{ color: 'var(--color-danger-dark)', fontWeight: 700 }}>No</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* バーチャート表示切り替え */}
        <div style={{ marginTop: 'var(--spacing-lg)' }}>
          <button
            onClick={() => setShowChart(!showChart)}
            className="step-lesson__demo-btn step-lesson__demo-btn--primary"
          >
            {showChart ? 'バーチャートを閉じる' : 'バーチャートで視覚的に比較'}
          </button>
        </div>

        {showChart && (
          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label>比較する値:</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as 'publicKey' | 'cipherOrSig')}
              >
                <option value="publicKey">公開鍵サイズ</option>
                <option value="cipherOrSig">暗号文/署名サイズ</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {filtered.map((algo) => {
                const value = algo[selectedMetric]
                const widthPercent = Math.max((value / maxValue) * 100, 2)
                return (
                  <div key={algo.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '140px',
                      minWidth: '140px',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'right',
                      color: 'var(--color-text-main)',
                      fontWeight: 600,
                    }}>
                      {algo.name}
                    </div>
                    <div style={{ flex: 1, position: 'relative', height: '22px' }}>
                      <div style={{
                        width: `${widthPercent}%`,
                        height: '100%',
                        borderRadius: '4px',
                        background: algo.quantumSafe
                          ? 'linear-gradient(90deg, var(--color-success), var(--color-success-dark))'
                          : 'linear-gradient(90deg, var(--color-danger), var(--color-danger-dark))',
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                    <div style={{
                      width: '70px',
                      minWidth: '70px',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--color-text-subtle)',
                    }}>
                      {value.toLocaleString()} B
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ marginTop: 'var(--spacing-sm)', fontSize: '0.8rem', color: 'var(--color-text-subtle)' }}>
              <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>&#9632;</span> 量子耐性あり
              {' / '}
              <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>&#9632;</span> 量子耐性なし
            </div>
          </div>
        )}
      </div>

      <p>
        表から読み取れる重要な傾向を整理します。
      </p>
      <ul>
        <li>
          <strong>Kyber768</strong>の公開鍵（1184 B）はECDH P-256（64 B）の約18倍だが、
          RSA-4096（512 B）の約2.3倍に過ぎない。TLSハンドシェイクでの影響は限定的。
        </li>
        <li>
          <strong>SPHINCS+</strong>は公開鍵が極小（32 B）だが、署名が約17 KBと巨大。
          ハッシュのみに依存するため保守的な安全性を持つが、用途が限られる。
        </li>
        <li>
          <strong>FALCON-512</strong>は署名サイズが666 Bと格子署名の中で最小。
          ただし実装の複雑さ（浮動小数点演算が必要）がデメリット。
        </li>
      </ul>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong>
        <br />1. PQCの鍵・暗号文はECCより大幅に大きいが、RSAと比べると桁違いではない。
        <br />2. 用途に応じてKEM（Kyber）と署名（Dilithium/FALCON/SPHINCS+）を使い分ける。
        <br />3. 実際のTLS通信ではKyber768のサイズ増加は許容範囲であることが実証されている。
      </div>
    </>
  )
}

/* =========================================
   Step 7: NIST標準化の詳細
   Rainbowの脱落理由を含む
   ========================================= */
function NISTStandardization() {
  return (
    <>
      <p>
        2016年に始まったNISTのPost-Quantum Cryptography標準化プロジェクトは、
        暗号史上最大規模の公開評価プロセスです。
        82方式の応募から、6年以上の評価を経て標準が選定されました。
      </p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>NIST PQC標準化タイムライン</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            2016年 ── 公募開始（82方式が応募）
          </div>
          <div>2017年 ── Round 1: 69方式に絞り込み</div>
          <div>2019年 ── Round 2: 26方式に絞り込み</div>
          <div>2020年 ── Round 3: 7+8方式（最終候補+代替候補）</div>
          <div>2022年 ── 第1陣発表: Kyber / Dilithium / FALCON / SPHINCS+</div>
          <div>2024年 ── FIPS 203 (ML-KEM), 204 (ML-DSA), 205 (SLH-DSA) 公開</div>
          <div>2025年 ── FIPS 206 (FN-DSA = FALCON) ドラフト公開</div>
        </div>
      </div>

      <h3>選定されたアルゴリズム</h3>
      <ul>
        <li>
          <strong>CRYSTALS-Kyber → ML-KEM（FIPS 203）</strong><br />
          鍵カプセル化機構。Module-LWE問題に基づく。TLS、VPN、メッセンジャーの鍵交換に使用。
          鍵サイズと速度のバランスが最も優れている。
        </li>
        <li>
          <strong>CRYSTALS-Dilithium → ML-DSA（FIPS 204）</strong><br />
          デジタル署名。Module-LWE問題に基づく。PKI、コード署名、証明書に使用。
          NISTが「一般用途ではこれを第一選択肢にすべき」と推奨。
        </li>
        <li>
          <strong>SPHINCS+ → SLH-DSA（FIPS 205）</strong><br />
          ハッシュベース署名。ハッシュ関数の安全性のみに依存する保守的な設計。
          格子問題が将来破られた場合のバックアップとして重要。
        </li>
        <li>
          <strong>FALCON → FN-DSA（FIPS 206, ドラフト）</strong><br />
          署名サイズが小さい格子ベース署名。NTRU格子を使用。
          帯域幅が制約される環境（IoT等）向け。
        </li>
      </ul>

      <h3>Rainbowはなぜ脱落したか</h3>
      <div className="step-lesson__callout">
        <strong>用語: Rainbow</strong><br />
        多変数多項式ベースの署名方式。Round 3の最終候補まで残っていたが、
        2022年にWard Beullensにより「1週間で秘密鍵を復元できる」攻撃が発見され、
        安全性パラメータの大幅な引き上げが必要となり脱落した。
      </div>
      <p>
        Beullensの攻撃は、Rainbowの代数的構造（Oil and Vinegar構造）に内在する弱点を突くものでした。
        この事例は、<strong>長期間の公開評価がなぜ重要か</strong>を示しています。
        Rainbowは15年以上研究されていたにもかかわらず、Round 3の段階で致命的な攻撃が見つかりました。
        これは暗号技術の選定において「保守的であること」の重要性を改めて示しています。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>第4ラウンド（追加評価中）</h3>
          <ul>
            <li><strong>Classic McEliece</strong> — 符号ベースKEM。鍵が巨大（261 KB）だが非常に堅牢</li>
            <li><strong>BIKE</strong> — 符号ベースKEM。コンパクトな鍵サイズ</li>
            <li><strong>HQC</strong> — 符号ベースKEM。単純な構造で解析しやすい</li>
            <li><strong>SIKE</strong> — 同種写像ベースKEM。2022年に破られ脱落</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>脱落した方式とその理由</h3>
          <ul>
            <li><strong>Rainbow</strong> — 代数的攻撃で破壊</li>
            <li><strong>SIKE</strong> — 通常のPCで1時間で破壊される攻撃が発見</li>
            <li><strong>GeMSS</strong> — 多変数方式。署名サイズが巨大</li>
            <li><strong>NTRU Prime</strong> — Kyberとの類似性から統合判断</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong>
        <br />1. NISTは6年以上の公開評価を経てKyber/Dilithium/SPHINCS+/FALCONを選定した。
        <br />2. RainbowやSIKEの脱落は、暗号技術には長期的な公開検証が不可欠であることを示している。
        <br />3. FIPS 203/204/205は既に正式公開されており、実装・移行の準備が整っている。
      </div>
    </>
  )
}

/* =========================================
   Step 8: 移行のベストプラクティス
   ========================================= */
function MigrationBestPractices() {
  return (
    <>
      <p>
        Step 1のHNDL攻撃を思い出してください。
        量子コンピュータの実用化を待ってからでは遅いのです。
        では、具体的にどう移行を進めるべきか — 実務レベルのロードマップを見ていきましょう。
      </p>

      <h3>ハイブリッド暗号方式</h3>
      <div className="step-lesson__callout">
        <strong>用語: ハイブリッド暗号（Hybrid Cryptography）</strong><br />
        古典暗号とPQCを<strong>併用</strong>する方式。
        共通鍵は「X25519 + Kyber768」のように両方のアルゴリズムで導出し、結合する。
        片方が破られても、もう片方が通信を守る。移行期のリスクを最小化する標準的なアプローチ。
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>即座に全面切り替え（Before）</h3>
          <ul>
            <li>PQCアルゴリズムに未知の脆弱性があれば即座に被害</li>
            <li>古いクライアントとの互換性が失われる</li>
            <li>鍵サイズ増大による性能問題を一度に抱える</li>
            <li>リスクが集中</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>ハイブリッドで段階移行（After）</h3>
          <ul>
            <li>古典暗号 + PQCの二重保護</li>
            <li>フォールバックで互換性を維持</li>
            <li>段階的にPQC比率を増やせる</li>
            <li>リスクが分散</li>
          </ul>
        </div>
      </div>

      <h3>移行ロードマップ</h3>
      <ol>
        <li>
          <strong>Phase 0 — 暗号資産の棚卸し（今すぐ）</strong><br />
          自社システムで使われている暗号アルゴリズム、鍵長、プロトコルバージョンを洗い出す。
          「どこでRSAやECDHを使っているか」を把握することが第一歩。
        </li>
        <li>
          <strong>Phase 1 — ハイブリッドモードの導入（現在〜2027年）</strong><br />
          TLS接続にX25519Kyber768を追加。Signal PQXDH、Google ChromeのTLS、
          AWS KMSなどが既にこのフェーズにある。
        </li>
        <li>
          <strong>Phase 2 — PQC必須化（2027〜2030年）</strong><br />
          ハイブリッドモードを経て信頼性が確認されたら、PQCを必須要件に格上げ。
          古典暗号のみの接続を段階的に拒否。
        </li>
        <li>
          <strong>Phase 3 — 古典公開鍵暗号の廃止（2030年代）</strong><br />
          RSA、ECDH、ECDSAを完全に廃止。PQCのみで運用。
          NISTは2035年までにRSA-2048やECC P-256の使用を非推奨にする見通し。
        </li>
      </ol>

      <h3>先行事例</h3>
      <ul>
        <li>
          <strong>Signal PQXDH</strong> — メッセンジャーで Kyber1024 + X25519 をハイブリッド利用。
          2023年から全ユーザーに展開済み。
        </li>
        <li>
          <strong>Google Chrome / Cloudflare</strong> — TLS 1.3でX25519Kyber768をデフォルト有効化。
          数十億接続で実証済み。
        </li>
        <li>
          <strong>Apple iMessage PQ3</strong> — Kyberを使用したPQCプロトコルを2024年に導入。
          「レベル3」の量子セキュリティを謳う。
        </li>
        <li>
          <strong>AWS KMS / Azure</strong> — PQC TLSオプションをプレビュー提供中。
        </li>
      </ul>

      <h3>実装上の注意点</h3>
      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>移行チェックリスト</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            [1] 暗号アジリティ（Crypto Agility）を確保する
          </div>
          <div>    → アルゴリズムを設定で切り替え可能にする</div>
          <div>[2] 鍵サイズ増大への対応</div>
          <div>    → Kyber768の公開鍵（1.2KB）がTLSハンドシェイクに収まるか確認</div>
          <div>[3] パフォーマンステスト</div>
          <div>    → Kyberの暗号化/復号はRSAより高速だが、鍵生成が重い場合がある</div>
          <div>[4] ライブラリの選定</div>
          <div>    → liboqs (Open Quantum Safe)、BoringSSL PQ、wolfSSL PQ等</div>
          <div>[5] 証明書チェーンの更新</div>
          <div>    → Dilithium署名の証明書はサイズが増加する</div>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>ここがポイント:</strong>
        <br />1. ハイブリッド暗号で「古典暗号 + PQC」を併用し、移行リスクを分散する。
        <br />2. 暗号アジリティ（アルゴリズムを設定で切り替え可能にすること）が移行の鍵。
        <br />3. 大手クラウド・メッセンジャーは既にPQC移行を開始しており、理論ではなく実務の段階に入っている。
      </div>
    </>
  )
}

/* =========================================
   メインコンポーネント
   ========================================= */
export default function PQC() {
  usePageMeta({ title: 'ポスト量子暗号', description: '量子コンピュータの脅威と格子暗号による対策を学ぶ' })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const steps: LessonStep[] = [
    {
      title: 'なぜ「量子」が暗号を脅かすのか',
      content: <WhyQuantumThreatens />,
      quiz: {
        question: 'Harvest Now, Decrypt Later（HNDL）攻撃に対して最も適切な対策は？',
        options: [
          { label: '量子コンピュータが実用化されてから対策を始める' },
          { label: '共通鍵暗号のみを使い、公開鍵暗号を一切使わない' },
          { label: '長期秘匿が必要なデータの通信を今すぐPQC対応にする', correct: true },
          { label: 'データを暗号化せず、物理的セキュリティだけに頼る' },
        ],
        explanation: '正解！HNDL攻撃では、攻撃者が現在の暗号通信を記録し将来解読します。長期秘匿データ（政府機密、医療記録等）は量子コンピュータの実用化を待たず、今すぐPQCまたはハイブリッド暗号に移行すべきです。',
      },
    },
    {
      title: 'Shorのアルゴリズム — 公開鍵暗号の崩壊',
      content: <ShorAlgorithm />,
      quiz: {
        question: 'Shorのアルゴリズムが素因数分解を高速に解ける理由は？',
        options: [
          { label: '量子コンピュータは全ての計算を高速化するから' },
          { label: '素因数分解を周期発見問題に変換し、量子フーリエ変換で周期を高速に見つけるから', correct: true },
          { label: '量子コンピュータは無限のメモリを持つから' },
          { label: '素数の一覧表を事前に計算しておくから' },
        ],
        explanation: '正解！Shorのアルゴリズムは、f(x) = a^x mod N の周期rを量子フーリエ変換で効率的に発見し、rからgcd(a^(r/2) - 1, N)で因数を計算します。周期発見に量子並列性を活用する点が核心です。',
      },
    },
    {
      title: 'Groverのアルゴリズムと共通鍵暗号への影響',
      content: <GroverAlgorithm />,
      quiz: {
        question: '量子コンピュータ時代にAES-128ではなくAES-256が推奨される理由は？',
        options: [
          { label: 'AES-128は古典コンピュータでも既に破られているから' },
          { label: 'AES-256のほうがブロックサイズが大きいから' },
          { label: 'Groverのアルゴリズムで安全性が半減するため、AES-128は64bit安全性に低下するが、AES-256は128bit安全性を維持するから', correct: true },
          { label: 'AES-256はShorのアルゴリズムに耐性があるから' },
        ],
        explanation: '正解！Groverのアルゴリズムは鍵探索の計算量を平方根に削減します。AES-128の2^128通りは2^64回の探索になり不十分ですが、AES-256の2^256通りは2^128回の探索となり、量子時代でも十分な安全性を保ちます。',
      },
    },
    {
      title: '格子とは何か — LWE問題の直感的理解',
      content: <LatticeAndLWE />,
      quiz: {
        question: 'LWE（Learning With Errors）問題が暗号に適している主な理由は？',
        options: [
          { label: '計算が非常に高速だから' },
          { label: 'LWEの困難性が格子問題の最悪ケースに帰着でき、量子コンピュータでも効率的に解けないから', correct: true },
          { label: '素因数分解よりも歴史が長く、十分に研究されているから' },
          { label: 'ノイズが大きいほど安全になり、鍵サイズを小さくできるから' },
        ],
        explanation: '正解！LWE問題は格子上の最短ベクトル問題（SVP）の最悪ケースに帰着されます。これはShorのアルゴリズムでは解けず、量子コンピュータに対する耐性が理論的に裏付けられています。',
      },
    },
    {
      title: 'Kyberの仕組み — 鍵カプセル化の流れ',
      content: <KyberMechanism />,
    },
    {
      title: '鍵サイズ比較 — 何がどれだけ大きくなるか',
      content: <KeySizeComparison />,
      quiz: {
        question: 'SPHINCS+（SLH-DSA）が他のPQC署名と比較して持つ最大の特徴は？',
        options: [
          { label: '署名サイズが最も小さい' },
          { label: '格子問題に基づいており高速である' },
          { label: 'ハッシュ関数のみに依存し、格子問題が破られても安全性を保つ', correct: true },
          { label: '量子コンピュータ上でのみ動作する' },
        ],
        explanation: '正解！SPHINCS+はハッシュ関数の安全性のみに依存する保守的な設計です。格子ベースの方式（Kyber/Dilithium）に未知の脆弱性が発見された場合のバックアップとして戦略的に重要ですが、署名サイズが約17KBと大きいトレードオフがあります。',
      },
    },
    {
      title: 'NIST標準化 — 6年の選定プロセス',
      content: <NISTStandardization />,
      quiz: {
        question: 'RainbowがNISTのPQC最終候補から脱落した理由は？',
        options: [
          { label: '鍵サイズが大きすぎたから' },
          { label: '量子コンピュータに対する耐性がなかったから' },
          { label: '代数的構造の弱点を突く攻撃が発見され、1週間で秘密鍵が復元可能になったから', correct: true },
          { label: '実装が複雑すぎて誰も実装できなかったから' },
        ],
        explanation: '正解！2022年にWard Beullensが発見した攻撃により、Rainbowの代数的構造（Oil and Vinegar構造）の弱点が露呈しました。通常のPCで1週間程度で秘密鍵を復元できることが示され、安全なパラメータでは鍵サイズが実用に堪えないことが判明しました。',
      },
    },
    {
      title: '移行のベストプラクティス',
      content: <MigrationBestPractices />,
      quiz: {
        question: 'PQC移行において「暗号アジリティ（Crypto Agility）」が重要とされる理由は？',
        options: [
          { label: '暗号化の処理速度を向上させるため' },
          { label: 'アルゴリズムを設定で切り替え可能にし、将来の脆弱性発見や標準変更に迅速に対応するため', correct: true },
          { label: '複数の暗号アルゴリズムを同時に使うことで安全性を高めるため' },
          { label: '量子コンピュータ上で暗号を実行するため' },
        ],
        explanation: '正解！Rainbow、SIKEの例が示すように、安全と思われていたアルゴリズムが突然破られることがあります。暗号アジリティにより、アルゴリズムをコード変更なしに切り替え可能にしておけば、新たな脆弱性が発見されても迅速に対応でき、移行リスクを大幅に低減できます。',
      },
    },
  ]

  return (
    <main className="page pqc">
      <StepLesson
        lessonId="pqc"
        title="ポスト量子暗号 (PQC)"
        steps={steps}
      />
    </main>
  )
}
