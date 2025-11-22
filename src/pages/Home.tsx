import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const highlights = [
  {
    icon: '🏛️',
    title: 'Classical → PQC',
    description: 'シーザー暗号から ECDH、そして最新の PQC まで。暗号技術の進化を時系列で体系的に学べます。',
  },
  {
    icon: '🔒',
    title: 'WebCrypto 実行基盤',
    description: '暗号処理はすべてブラウザの SubtleCrypto API 上で実行。データは外部に送信されず、ローカルで完結します。',
  },
  {
    icon: '🚀',
    title: 'アウトプット重視の設計',
    description: 'NIST PQC の最新情報や量子実験ログへの導線を用意。学んだ知識をすぐに活用・共有できます。',
  },
]

const steps = [
  '古典 → 共通鍵 → 公開鍵ラボを順番に触って全体像を掴む',
  'ログや可視化を見ながら「なぜそうなるか」を押さえる',
  '量子耐性暗号や実験ログにリンクし、公開記事へまとめる',
]

export default function Home() {
  useEffect(() => {
    document.title = 'CryptoLab - 暗号技術のハンズオン学習'
  }, [])

  return (
    <div className="home">
      <section className="hero">
        <p className="eyebrow">Hands-on Cryptography</p>
        <h1>暗号を学んで、実践し、楽しもう。</h1>
        <p>
          CryptoLab は、学習・実装・可視化を一続きで進められるハンズオンサイトです。
          WebCrypto で動く 3 つのラボと PQC ロードマップを、洗練された 1 つの UI にまとめました。
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
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>{item.icon}</div>
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
