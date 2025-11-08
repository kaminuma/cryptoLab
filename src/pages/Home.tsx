import { Link } from 'react-router-dom'

const highlights = [
  {
    title: 'Classical → PQC',
    description: 'シーザー暗号から ECDH、PQC までを 1 つのサイトで順番に学べるよう整理しました。',
  },
  {
    title: 'WebCrypto 実行基盤',
    description: '暗号処理はすべてブラウザの SubtleCrypto API 上で実行。テキストはローカルで完結します。',
  },
  {
    title: '公開を意識した教材',
    description: 'NIST PQC の最新情報や量子実験ログへの導線を用意し、調査結果をそのまま共有できます。',
  },
]

const steps = [
  '古典 → 共通鍵 → 公開鍵ラボを順番に触って全体像を掴む',
  'ログや可視化を見ながら「なぜそうなるか」を押さえる',
  '量子耐性暗号や実験ログにリンクし、公開記事へまとめる',
]

export default function Home() {
  return (
    <div className="home">
      <section className="hero">
        <p className="eyebrow">Hands-on Cryptography</p>
        <h1>暗号を学んで、実践し、楽しもう。</h1>
        <p>
          CryptoLab は、学習・実装・可視化を一続きで進められるハンズオンサイトです。
          WebCrypto で動く 3 つのラボと PQC ロードマップを 1 つの UI にまとめています。
        </p>
        <div className="hero-actions">
          <Link to="/labs" className="primary large">
            ラボを開く
          </Link>
          <Link to="/learn" className="secondary large">
            解説を読む
          </Link>
        </div>
      </section>

      <section className="card-grid">
        {highlights.map((item) => (
          <article key={item.title} className="card highlight">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </section>

      <section className="card roadmap">
        <h2>ハンズオンの 3 ステップ</h2>
        <ol>
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="hint">
          量子アルゴリズム実験は <a href="https://github.com/kaminuma/quantum-rsa-lab" target="_blank" rel="noreferrer">Quantum RSA Lab</a>{' '}
          を参照してください。
        </p>
      </section>
    </div>
  )
}
