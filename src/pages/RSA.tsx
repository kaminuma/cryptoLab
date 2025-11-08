import { useState } from 'react'
import { generatePrime, gcd, modInverse } from '@/utils/bigint'

type Status = 'idle' | 'generating' | 'completed' | 'error'

const formatBigInt = (value: bigint, group = 64) => {
  const text = value.toString(16).toUpperCase()
  return text.replace(new RegExp(`.{1,${group}}`, 'g'), '$&\n').trim()
}

const info = {
  title: 'RSA キー生成とは？',
  summary:
    'RSA は Diffie–Hellman 以前から広く使われている公開鍵暗号で、TLS 証明書や S/MIME、コード署名などで活躍してきました。2 つの巨大な素数 p, q を選び、その積 N = p × q を公開鍵の土台にします。N の素因数分解が難しい（＝大規模素因数分解アルゴリズムが現実的でない）という計算困難性に依存している点が特徴です。',
  points: [
    'p, q の素数性と秘密指数 d の保護が安全性の核心。ブラウザで生成したキーは必ず学習用途に限定してください。',
    '公開指数 e には 65537 を採用し、φ(N) と互いに素でない場合は素数を再生成します。',
    'RSA は鍵交換（ハイブリッド暗号化）や署名にも使われますが、現在は ECDH や EdDSA への移行が進んでいます。',
    'p, q はビット長が大きいため表示は 16 進＋改行を採用しています。',
  ],
}

export default function RSAPage() {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('「2048ビット鍵を生成」を押すと、ブラウザ内で素数を探して p / q / N を表示します。')
  const [bits] = useState(2048)
  const [p, setP] = useState<bigint | null>(null)
  const [q, setQ] = useState<bigint | null>(null)
  const [n, setN] = useState<bigint | null>(null)
  const [d, setD] = useState<bigint | null>(null)
  const [eValue] = useState(65537n)

  const generateRSA = async () => {
    try {
      setStatus('generating')
      setMessage('素数 p を探索中...')
      const half = bits / 2
      let primeP = await generatePrime(half)
      setMessage('素数 q を探索中...')
      let primeQ = await generatePrime(half)
      while (primeP === primeQ) {
        primeQ = await generatePrime(half)
      }

      const modulus = primeP * primeQ
      const phi = (primeP - 1n) * (primeQ - 1n)

      if (gcd(eValue, phi) !== 1n) {
        setMessage('再生成します（e と φ(N) が互いに素ではありませんでした）...')
        return generateRSA()
      }

      const dValue = modInverse(eValue, phi)

      setP(primeP)
      setQ(primeQ)
      setN(modulus)
      setD(dValue)
      setStatus('completed')
      setMessage('生成完了。以下の p, q, N, d は学習用サンプルです。')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'RSA キー生成中にエラーが発生しました。')
    }
  }

  return (
    <main className="page rsa">
      <section className="page-header">
        <p className="eyebrow">RSA Demo</p>
        <h1>2048 ビット RSA 鍵をブラウザで生成。</h1>
        <p className="lede">
          RSA は「公開鍵で暗号化 / 秘密鍵で復号」や「秘密鍵で署名 / 公開鍵で検証」といった用途で長年使われています。ここでは計算の裏側を理解するために、ブラウザ内で素数を探索し p, q, N, d を可視化します。
        </p>
      </section>

      <section className="card">
        <div className="card-header">
          <h2>生成パラメータ</h2>
          <p>公開指数 e = 65537、素数は {bits / 2} ビットずつ生成します。</p>
        </div>
        <p>{message}</p>
        <div className="actions">
          <button className="primary" type="button" onClick={generateRSA} disabled={status === 'generating'}>
            2048ビット鍵を生成
          </button>
          {status === 'generating' && <span className="hint">※ 数十秒かかる場合があります（ブラウザで素数を探索中）。</span>}
        </div>
        <div className="info-panel">
          <h3>{info.title}</h3>
          <p>{info.summary}</p>
          <ul>
            {info.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </section>

      {(p !== null || q !== null || n !== null || d !== null) && (
        <section className="card">
          <div className="card-header">
            <h2>生成結果（16 進数）</h2>
            <p>コピーの際は十分ご注意ください。学習用であり、実運用では使用しないでください。</p>
          </div>
          {p !== null && (
            <>
              <label htmlFor="rsa-p">p（1024-bit prime）</label>
              <textarea id="rsa-p" rows={6} readOnly value={formatBigInt(p)} />
            </>
          )}
          {q !== null && (
            <>
              <label htmlFor="rsa-q">q（1024-bit prime）</label>
              <textarea id="rsa-q" rows={6} readOnly value={formatBigInt(q)} />
            </>
          )}
          {n !== null && (
            <>
              <label htmlFor="rsa-n">N = p × q</label>
              <textarea id="rsa-n" rows={8} readOnly value={formatBigInt(n)} />
            </>
          )}
          {d !== null && (
            <>
              <label htmlFor="rsa-d">d（秘密指数）</label>
              <textarea id="rsa-d" rows={8} readOnly value={formatBigInt(d)} />
            </>
          )}
        </section>
      )}

      <section className="card caution">
        <h2>注意</h2>
        <ul>
          <li>このデモは学習・検証用途に限定されています。実運用の鍵生成には必ず信頼できるライブラリと安全な乱数源を使用してください。</li>
          <li>ブラウザで生成した p, q を第三者へ送ると秘密鍵が再現できます。取り扱いに注意してください。</li>
          <li>生成に時間がかかる場合はデバイスの性能差と素数探索の性質によるものです。</li>
        </ul>
      </section>
    </main>
  )
}
