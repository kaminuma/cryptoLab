import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="logo-dot" />
            <span>CryptoLab</span>
          </Link>
          <p className="footer-tagline">
            ブラウザで動く暗号技術のハンズオン学習サイト
          </p>
        </div>

        <div className="footer-nav">
          <div className="footer-nav-group">
            <h4>学習コンテンツ</h4>
            <Link to="/learn">暗号の基礎</Link>
            <Link to="/labs">ラボ（古典・共通鍵・公開鍵）</Link>
            <Link to="/aes">AES暗号</Link>
            <Link to="/hash">ハッシュ関数</Link>
          </div>
          <div className="footer-nav-group">
            <h4>応用</h4>
            <Link to="/rsa">RSA暗号</Link>
            <Link to="/pqc">ポスト量子暗号</Link>
            <Link to="/hmac">HMAC</Link>
            <Link to="/signature">デジタル署名</Link>
            <Link to="/tools/xor">XORツール</Link>
            <Link to="/tools/hash-cracker">ハッシュクラッカー</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} CryptoLab</span>
        </div>
      </div>
    </footer>
  )
}
