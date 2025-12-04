import { useEffect } from 'react'

const milestones = [
  {
    year: '2016',
    detail: 'NIST が Post-Quantum Cryptography (PQC) 標準化プロジェクトを開始。',
  },
  {
    year: '2022',
    detail: 'CRYSTALS-Kyber (KEM) と CRYSTALS-Dilithium (署名) が第 1 陣として選定。',
  },
  {
    year: '2024',
    detail: '最終仕様ドラフト (FIPS 203/204) が公開され、実装ガイドが整備中。',
  },
]

const roadmap = [
  {
    title: 'ステップ 1: 可視化コンテンツ',
    desc: 'Kyber/Dilithium の仕組みを図解し、鍵サイズや計算量を AES/ECDH と比較する。',
  },
  {
    title: 'ステップ 2: WebAssembly 連携',
    desc: 'Open Quantum Safe (liboqs) や pq-crystals 実装を WASM で取り込み、ブラウザ上で鍵生成をデモ。',
  },
  {
    title: 'ステップ 3: ラボ統合',
    desc: '既存タブに「PQC」を追加し、Kyber で共有鍵→AES-GCM という一連の流れを構築。',
  },
]

export default function PQC() {
  useEffect(() => {
    document.title = '量子耐性暗号 - CryptoLab'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])
  return (
    <div className="pqc page">
      <section className="page-header">
        <p className="eyebrow">Post-Quantum Readiness</p>
        <h1>量子耐性暗号（PQC）への移行計画</h1>
        <p className="lede">NIST の公式アナウンスに沿って里程標と実装ステップをまとめ、CryptoLab への組み込みロードマップを公開しています。</p>
      </section>

      <section className="card">
        <h2>主要マイルストーン</h2>
        <dl className="timeline">
          {milestones.map((item) => (
            <div key={item.year}>
              <dt>{item.year}</dt>
              <dd>{item.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="card">
        <h2>CryptoLab の PQC 実装計画</h2>
        <div className="roadmap-cards">
          {roadmap.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card caution">
        <h2>実装時の注意</h2>
        <ul>
          <li>鍵生成・復号には大きな計算コストがかかるため、WASM 化や Web Worker での分離を前提に設計します。</li>
          <li>Kyber1024 の公開鍵は約 1.6KB など、既存方式よりサイズが大きい点を UI/UX でフォローする必要があります。</li>
          <li>金融・公共用途での公開は、FIPS 203/204 の正式発行を確認したうえで仕様を固定してください。</li>
        </ul>
      </section>
    </div>
  )
}
