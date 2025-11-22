export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div>
          <strong>CryptoLab</strong> — ブラウザで動く暗号技術のハンズオン学習サイト
        </div>
        <div className="footer-links">
          <span>© {year} CryptoLab</span>
          <a href="https://www.nist.gov/news-events/news/2022/07/nist-announces-first-four-quantum-resistant-cryptographic-algorithms" target="_blank" rel="noreferrer">
            NIST PQC 参考
          </a>
          <a href="https://github.com/kaminuma/quantum-rsa-lab" target="_blank" rel="noreferrer">
            Quantum RSA Lab
          </a>
        </div>
      </div>
    </footer>
  )
}
