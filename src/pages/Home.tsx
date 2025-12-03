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
    description: '暗号処理はすべてブラウザの SubtleCrypto API 上で実行。データは外部に送信されず、ブラウザ内で完結します。',
  },
  {
    icon: '🚀',
    title: 'アウトプット重視の設計',
    description: 'NIST PQC の最新情報や量子実験ログへの導線を用意。学んだ知識をすぐに活用・共有できます。',
  },
]

const steps = [
  '古典暗号で暗号の基礎を学ぶ',
  '共通鍵暗号で対称鍵の仕組みを理解する',
  '公開鍵暗号でRSAなどの実践的な暗号を体験する',
]

export default function Home() {
  useEffect(() => {
    document.title = 'CryptoLab - 暗号技術のハンズオン学習'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <div className="home">
      <section className="hero">
        <p className="eyebrow">Hands-on Cryptography</p>
        <h1>暗号を学んで・実践し・楽しむ</h1>
        <p>
          CryptoLab は、学習・実装・可視化を一続きで進められるハンズオンサイトです。
          WebCrypto を扱うラボ群や PQC ロードマップを、同じ UI で切り替えながら体験できます。
        </p>
        <div className="hero-actions">
          <Link to="/labs" className="btn btn-primary">
            ラボを開く
          </Link>
          <Link to="/learn" className="btn btn-secondary">
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
          量子アルゴリズム実験機能は現在開発中です。
        </p>
      </section>
    </div>
  )
}
