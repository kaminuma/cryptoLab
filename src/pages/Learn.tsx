const sections = [
  {
    title: '暗号の 3 レイヤー',
    bullets: [
      '古典暗号: シーザーやヴィジュネルが代表例。手計算しやすい一方で頻度解析には弱い。',
      '共通鍵暗号: AES を中心に TLS やモバイル OS で標準採用。高速なブロック処理が特長。',
      '公開鍵暗号: Diffie–Hellman (1976) 以降、RSA や楕円曲線が実用化し、Web PKI の基盤になった。',
    ],
  },
  {
    title: 'WebCrypto API で学ぶ理由',
    bullets: [
      '最新ブラウザの SubtleCrypto API で AES-GCM・ECDH・HKDF をそのまま呼び出せる。',
      '鍵生成から暗号化までブラウザ内で完結するため、試した内容を安全に共有できる。',
    ],
  },
  {
    title: '量子計算と RSA',
    bullets: [
      'Shor アルゴリズム (1994) は RSA/ECC を多項式時間で破る可能性があるが、大規模 QPU は未だ整備中。',
      'NIST は 2016 年に PQC 標準化を開始し、2022 年に Kyber (KEM) と Dilithium (署名) などを第一陣として発表した。',
    ],
  },
]

export default function Learn() {
  return (
    <div className="learn page">
      <section className="page-header">
        <p className="eyebrow">Learn</p>
        <h1>暗号の基礎と最新動向</h1>
        <p className="lede">古典・共通鍵・公開鍵・PQC の要点を短いメモで辿れるように整理しました。記事化や社内共有に活用できます。</p>
      </section>

      {sections.map((section) => (
        <section key={section.title} className="card">
          <h2>{section.title}</h2>
          <ul>
            {section.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </section>
      ))}

      <section className="card resources">
        <h2>参考リンク</h2>
        <ul>
          <li>
            <a href="https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf" target="_blank" rel="noreferrer">
              FIPS 197: AES Standard (2001)
            </a>
          </li>
          <li>
            <a href="https://www.nist.gov/news-events/news/2022/07/nist-announces-first-four-quantum-resistant-cryptographic-algorithms" target="_blank" rel="noreferrer">
              NIST 2022 PQC 選定発表
            </a>
          </li>
          <li>
            <a href="https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto" target="_blank" rel="noreferrer">
              MDN: SubtleCrypto API
            </a>
          </li>
        </ul>
      </section>
    </div>
  )
}
