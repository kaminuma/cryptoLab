import { useEffect } from 'react'
import StepLesson, { type LessonStep } from '../components/ui/StepLesson'
import '../components/ui/StepLesson.css'

function QuantumThreat() {
  return (
    <>
      <p>
        現代の暗号技術は<strong>素因数分解</strong>や<strong>離散対数</strong>といった数学的問題の困難性に依存しています。
        しかし、量子コンピュータの登場により、これらの前提が崩壊する可能性があります。
      </p>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>古典コンピュータ</h3>
          <ul>
            <li><strong>RSA-2048:</strong> 解読に数十億年</li>
            <li><strong>ECDH P-256:</strong> 現実的に不可能</li>
            <li>ビット（0か1）で逐次計算</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>量子コンピュータ</h3>
          <ul>
            <li><strong>RSA-2048:</strong> Shorのアルゴリズムで多項式時間</li>
            <li><strong>ECDH P-256:</strong> 同様に解読可能</li>
            <li>qubit（重ね合わせ）で並列計算</li>
          </ul>
        </div>
      </div>
      <div className="step-lesson__callout">
        <strong>Harvest Now, Decrypt Later:</strong> 攻撃者は今の暗号通信を記録し、将来量子コンピュータで解読する可能性があります。
        長期秘匿が必要なデータは、今すぐPQCへの移行を検討すべきです。
      </div>
    </>
  )
}

function PQCAlgorithms() {
  return (
    <>
      <p>
        ポスト量子暗号（PQC）は、量子コンピュータでも解けない数学的問題に基づく暗号方式です。
        主に以下のファミリーがあります。
      </p>
      <ul>
        <li>
          <strong>格子ベース（Lattice-based）</strong> — 最短ベクトル問題（SVP）やLWE問題に基づく。
          Kyber（KEM）、Dilithium/FALCON（署名）が代表例。鍵サイズと性能のバランスが良い。
        </li>
        <li>
          <strong>ハッシュベース（Hash-based）</strong> — ハッシュ関数の安全性のみに依存。
          SPHINCS+が代表例。保守的で信頼性が高いが、署名サイズが大きい。
        </li>
        <li>
          <strong>符号ベース（Code-based）</strong> — 誤り訂正符号の復号困難性に基づく。
          Classic McElieceが代表例。鍵サイズが非常に大きい（数百KB）が堅牢。
        </li>
        <li>
          <strong>多変数多項式（Multivariate）</strong> — 連立多変数方程式の求解困難性に基づく。
          Rainbowは攻撃により脱落。研究は継続中。
        </li>
      </ul>
      <div className="step-lesson__callout">
        現在最も実用的と見なされているのは<strong>格子ベース</strong>の方式で、
        Kyber（鍵交換）とDilithium（署名）がNISTの第1陣として選定されています。
      </div>
    </>
  )
}

function NISTStandardization() {
  return (
    <>
      <p>
        NISTは2016年からPost-Quantum Cryptography標準化プロジェクトを進めています。
        82方式の応募から、複数ラウンドの評価を経て標準が選定されました。
      </p>
      <ol>
        <li><strong>2016年:</strong> NISTがPQC公募開始（82方式が応募）</li>
        <li><strong>2017-2020年:</strong> 3ラウンドで安全性・実装性を評価</li>
        <li><strong>2022年:</strong> 第1陣として Kyber / Dilithium / FALCON / SPHINCS+ を選出</li>
        <li><strong>2024年:</strong> FIPS 203/204 ドラフト公開、実装ガイド整備中</li>
      </ol>

      <h3>選定されたアルゴリズム</h3>
      <ul>
        <li><strong>CRYSTALS-Kyber（FIPS 203）:</strong> 鍵カプセル化機構（KEM）。TLS・VPN等の鍵交換に使用</li>
        <li><strong>CRYSTALS-Dilithium（FIPS 204）:</strong> デジタル署名。PKI・コード署名に使用</li>
        <li><strong>FALCON:</strong> デジタル署名。コンパクトな署名サイズが特徴</li>
        <li><strong>SPHINCS+:</strong> ハッシュベース署名。保守的な安全性保証</li>
      </ul>

      <div className="step-lesson__callout">
        Cloudflare、Google、AWSなどの大手クラウドは既にハイブリッドTLS（X25519 + Kyber768）のテストを開始しています。
      </div>
    </>
  )
}

function FutureOfCrypto() {
  return (
    <>
      <p>
        暗号技術の未来は、PQCへの段階的な移行と、量子鍵配送（QKD）との併用で形作られます。
      </p>

      <h3>移行ロードマップ</h3>
      <ol>
        <li><strong>Phase 1（現在）:</strong> 既存サービスにハイブリッド暗号を追加。X25519 + Kyber768の並行運用</li>
        <li><strong>Phase 2（2025-2030）:</strong> PQC単独モードを用意し、必須要件化</li>
        <li><strong>Phase 3（2030年代）:</strong> 古典公開鍵暗号を段階的に廃止</li>
      </ol>

      <h3>ハイブリッド暗号方式</h3>
      <p>
        移行期のベストプラクティスは、古典暗号とPQCを<strong>併用</strong>すること。
        片方が破られても、もう片方が通信を守ります。
      </p>
      <ul>
        <li><strong>Signal PQXDH:</strong> メッセンジャーで Kyber + X25519 を同時利用</li>
        <li><strong>Google Chrome / Firefox:</strong> X25519 + Kyber768 をテスト搭載</li>
        <li><strong>AWS KMS / Azure:</strong> PQC TLSオプションをプレビュー提供</li>
      </ul>

      <h3>量子鍵配送（QKD）</h3>
      <p>
        量子物理で盗聴を検知するアプローチ。PQCと補完関係にあります。
        政府・金融・宇宙通信など極秘用途での併用が検討されています。
      </p>

      <div className="step-lesson__callout">
        <strong>実装時の注意:</strong> Kyber1024の公開鍵は約1.6KBなど、既存方式よりサイズが大きい点に注意が必要です。
        WASM化やWeb Workerでの分離を前提に設計しましょう。
      </div>
    </>
  )
}

export default function PQC() {
  useEffect(() => {
    document.title = '量子耐性暗号 - CryptoLab'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const steps: LessonStep[] = [
    {
      title: '量子コンピュータの脅威',
      content: <QuantumThreat />,
      quiz: {
        question: '量子コンピュータが現代暗号に脅威となる主な理由は？',
        options: [
          { label: '量子コンピュータは現在のコンピュータより電力効率が良いから' },
          { label: 'Shorのアルゴリズムにより素因数分解や離散対数が多項式時間で解けるから', correct: true },
          { label: '量子コンピュータはすべての計算を高速化するから' },
          { label: '量子コンピュータはインターネットに直接接続できるから' },
        ],
        explanation: '正解！Shorのアルゴリズムは素因数分解と離散対数問題を多項式時間で解くことができ、RSA、Diffie-Hellman、ECDHなどの公開鍵暗号の安全性の前提を崩壊させます。',
      },
    },
    {
      title: 'ポスト量子暗号アルゴリズム',
      content: <PQCAlgorithms />,
      quiz: {
        question: '現在最も実用的と見なされているPQCのアルゴリズムファミリーは？',
        options: [
          { label: '多変数多項式ベース' },
          { label: '符号ベース（Code-based）' },
          { label: '格子ベース（Lattice-based）', correct: true },
          { label: 'ハッシュベース（Hash-based）' },
        ],
        explanation: '正解！格子ベースの方式（Kyber、Dilithium）は鍵サイズと性能のバランスが良く、NISTの第1陣として選定されています。',
      },
    },
    {
      title: 'NIST標準化の動向',
      content: <NISTStandardization />,
    },
    {
      title: '暗号技術の未来',
      content: <FutureOfCrypto />,
      quiz: {
        question: 'PQC移行期のベストプラクティスは何か？',
        options: [
          { label: '即座にすべての暗号をPQCに置き換える' },
          { label: '量子コンピュータが実用化されるまで何もしない' },
          { label: '古典暗号とPQCを併用するハイブリッド方式を採用する', correct: true },
          { label: '暗号化を使わずに物理的なセキュリティに頼る' },
        ],
        explanation: '正解！ハイブリッド暗号方式では、古典暗号（X25519等）とPQC（Kyber等）を並行して使用します。片方が破られても、もう片方が通信を守るため、移行期のリスクを最小化できます。',
      },
    },
  ]

  return (
    <main className="page pqc">
      <StepLesson
        title="ポスト量子暗号 (PQC)"
        steps={steps}
      />
    </main>
  )
}
