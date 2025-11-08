export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div>
        <strong>CryptoLab</strong> — ローカルで触って学べる暗号実験サイト
      </div>
      <div className="footer-meta">
        <span>© {year} CryptoLab</span>
        <a href="https://www.nist.gov/news-events/news/2022/07/nist-announces-first-four-quantum-resistant-cryptographic-algorithms" target="_blank" rel="noreferrer">
          NIST PQC 参考
        </a>
        <a href="https://github.com/kaminuma/quantum-rsa-lab" target="_blank" rel="noreferrer">
          Quantum RSA Lab
        </a>
      </div>
    </footer>
  )
}
