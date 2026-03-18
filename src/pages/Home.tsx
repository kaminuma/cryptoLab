import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import '../styles/pages/home.css'

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
  usePageMeta({ title: '', description: '暗号技術をインタラクティブに学べるハンズオン学習プラットフォーム' })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  return (
    <div className="home">
      <section className="hero">
        <p className="eyebrow" style={{ letterSpacing: '0.3em' }}>THE CRYPTO LAB</p>
        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', lineHeight: 1.1 }}>
          <span style={{ fontFamily: 'var(--font-classic)', color: '#8b7355' }}>歴史</span>を解読し、
          <br />
          <span style={{ 
            fontFamily: 'var(--font-mono)', 
            color: '#00d2ff', 
            WebkitTextStroke: '1px #000',
            paintOrder: 'stroke fill'
          }}>未来</span>を実装する。
        </h1>
        <p style={{ maxWidth: '700px', margin: 'var(--spacing-lg) auto', fontSize: '1.1rem' }}>
          CryptoLab は、古典から現代、そしてポスト量子暗号までを網羅する
          インタラクティブな学習プラットフォームです。
        </p>
        <div className="hero-actions">
          <Link to="/labs" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
            ラボを開始する
          </Link>
          <Link to="/learn" className="btn btn-secondary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
            知識を深める
          </Link>
        </div>
      </section>

      <section className="usp-stats">
        <div className="usp-stat">
          <span className="usp-stat-number">10+</span>
          <span className="usp-stat-label">レッスン</span>
          <p className="usp-stat-desc">体系的な暗号技術カリキュラム</p>
        </div>
        <div className="usp-stat">
          <span className="usp-stat-number">ブラウザ完結</span>
          <span className="usp-stat-label"></span>
          <p className="usp-stat-desc">インストール不要、WebCrypto APIで実行</p>
        </div>
        <div className="usp-stat">
          <span className="usp-stat-number">古典〜PQC</span>
          <span className="usp-stat-label"></span>
          <p className="usp-stat-desc">古典暗号からポスト量子暗号まで網羅</p>
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
