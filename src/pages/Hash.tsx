import { useState, useEffect } from 'react';
import { sha256WithSteps, sha256WebCrypto, calculateAvalanche, type SHA256Result, type SHA256Step } from '../lib/hash/sha256';

export default function Hash() {
  const [input, setInput] = useState('abc');
  const [result, setResult] = useState<SHA256Result | null>(null);
  const [webCryptoHash, setWebCryptoHash] = useState('');
  const [isMatch, setIsMatch] = useState(false);

  // アバランシェ効果デモ用
  const [input2, setInput2] = useState('abd');
  const [avalanche, setAvalanche] = useState<any>(null);

  // 展開表示の制御
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set(['input', 'final']));

  useEffect(() => {
    document.title = 'ハッシュ関数 - CryptoLab';
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    // 自作SHA-256を実行
    const sha256Result = sha256WithSteps(input);
    setResult(sha256Result);

    // Web Crypto APIで検証
    sha256WebCrypto(input).then(hash => {
      setWebCryptoHash(hash);
      setIsMatch(hash === sha256Result.hash);
    });

    // アバランシェ効果の計算
    const hash1 = sha256Result.hash;
    const result2 = sha256WithSteps(input2);
    const hash2 = result2.hash;
    setAvalanche(calculateAvalanche(hash1, hash2));
  }, [input, input2]);

  const toggleStep = (step: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(step)) {
      newExpanded.delete(step);
    } else {
      newExpanded.add(step);
    }
    setExpandedSteps(newExpanded);
  };

  const renderStepData = (step: SHA256Step) => {
    const data = step.data;

    return (
      <div className="callout" style={{ fontSize: '13px', fontFamily: 'monospace' }}>
        {Object.entries(data).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '8px' }}>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 'bold' }}>{key}:</span>{' '}
            <span style={{
              color: key === 'hash' ? 'var(--color-primary)' : 'var(--color-text-main)',
              wordBreak: 'break-all'
            }}>
              {typeof value === 'object' && Array.isArray(value)
                ? JSON.stringify(value, null, 2)
                : String(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderAvalancheVisualization = () => {
    if (!avalanche) return null;

    const { bitDifferences, differentBits, totalBits, percentage } = avalanche;

    // ビットを8x32のグリッドで表示
    const rows = [];
    for (let i = 0; i < 8; i++) {
      const rowBits = bitDifferences.slice(i * 32, (i + 1) * 32);
      rows.push(
        <div key={i} style={{ display: 'flex', gap: '2px', marginBottom: '2px' }}>
          {rowBits.map((isDifferent: boolean, j: number) => (
            <div
              key={j}
              style={{
                width: '12px',
                height: '12px',
                background: isDifferent ? 'var(--color-accent)' : 'var(--color-border)',
                borderRadius: '2px'
              }}
              title={`Bit ${i * 32 + j}: ${isDifferent ? '異なる' : '同じ'}`}
            />
          ))}
        </div>
      );
    }

    return (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '8px' }}>
            {differentBits} / {totalBits} ビット ({percentage.toFixed(1)}%)
          </div>
          <div style={{ color: 'var(--color-text-subtle)' }}>
            1文字違うだけで約半分のビットが変化（理想: 50%）
          </div>
        </div>
        <div style={{ marginTop: '16px' }}>
          <div style={{ color: 'var(--color-text-subtle)', marginBottom: '8px', fontSize: '13px' }}>
            ビット差分の可視化（赤=異なる、灰=同じ）
          </div>
          {rows}
        </div>
      </div>
    );
  };

  return (
    <main className="page hash">
      <header className="page-header">
        <p className="eyebrow" style={{ color: 'var(--color-primary)' }}>[ HASH_ALGORITHM: SHA-256 ]</p>
        <h1>ハッシュ関数 & 整合性</h1>
        <p className="lede">
          不可逆なデータの指紋。
          SHA-256 によるデータの要約から、改ざん検知のメカニズムまで、デジタル世界の整合性を支える技術を体験する。
        </p>
      </header>

      {/* 重要な概念説明 */}
      <section className="card" style={{ borderLeft: '4px solid var(--color-accent)' }}>
        <h2 style={{ color: 'var(--color-accent)', marginBottom: 'var(--spacing-md)' }}>
          📌 重要: ハッシュ関数 ≠ 暗号化
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--color-accent)' }}>❌ 暗号化 (Encryption)</h3>
            <ul style={{ color: 'var(--color-text-muted)', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li><strong>目的:</strong> データを秘密にする</li>
              <li><strong>特徴:</strong> 復号可能（鍵があれば元に戻せる）</li>
              <li><strong>用途:</strong> 機密データの保護</li>
              <li><strong>例:</strong> AES, RSA</li>
            </ul>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--color-primary)' }}>✅ ハッシュ関数 (Hash Function)</h3>
            <ul style={{ color: 'var(--color-text-muted)', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li><strong>目的:</strong> データの「指紋」を作る</li>
              <li><strong>特徴:</strong> 一方向のみ（元に戻せない）</li>
              <li><strong>用途:</strong> 完全性確認、パスワード保管、デジタル署名</li>
              <li><strong>例:</strong> SHA-256, SHA-3</li>
            </ul>
          </div>
        </div>

        <div className="callout callout-info">
          <strong style={{ color: 'var(--color-primary)' }}>ハッシュ関数の3つの重要な性質:</strong>
          <ol style={{ marginTop: '8px', color: 'var(--color-text-muted)', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li><strong>決定性:</strong> 同じ入力は常に同じハッシュ値になる</li>
            <li><strong>一方向性:</strong> ハッシュ値から元のデータを復元できない</li>
            <li><strong>衝突耐性:</strong> 同じハッシュ値を持つ異なる入力を見つけるのが困難</li>
          </ol>
        </div>
      </section>

      {/* アルゴリズムの説明 */}
      <section className="card">
        <h2 style={{ color: 'var(--color-primary)' }}>SHA-256アルゴリズムの流れ</h2>

        <div style={{ color: 'var(--color-text-muted)', lineHeight: '1.8' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>1. パディング処理</h3>
            <p>メッセージを512ビット（64バイト）の倍数に調整します。</p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li>メッセージの末尾に'1'ビット（0x80）を追加</li>
              <li>'0'ビットを必要なだけ追加</li>
              <li>最後の64ビットに元のメッセージ長（ビット単位）を格納</li>
            </ul>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>2. メッセージスケジュール生成</h3>
            <p>各512ビットブロックから64個の32ビットワード（W₀〜W₆₃）を生成します。</p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li>W₀〜W₁₅: ブロックを直接32ビットワードに変換</li>
              <li>W₁₆〜W₆₃: 前のワードから計算（σ₀とσ₁関数を使用）</li>
            </ul>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>3. 圧縮関数（64ラウンド）</h3>
            <p>8個のハッシュ値（a〜h）を64回更新します。</p>
            <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
              <li>各ラウンドでΣ₀、Σ₁、Ch、Maj関数を使用</li>
              <li>ラウンド定数K（素数の立方根から生成）を加算</li>
              <li>メッセージスケジュールのワードWを加算</li>
            </ul>
          </div>

          <div>
            <h3 style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>4. 最終ハッシュ生成</h3>
            <p>更新されたハッシュ値を元の値に加算し、8個の32ビット値を連結して256ビットのハッシュを生成します。</p>
          </div>
        </div>
      </section>

      {/* 実装コード */}
      <section className="card">
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--color-text-main)' }}>実装コード（TypeScript）</h2>
        <p style={{ color: 'var(--color-text-subtle)', marginBottom: '16px' }}>
          このデモで使用しているSHA-256の完全な実装コードです。暗号化ライブラリを使わず、アルゴリズムをゼロから実装しています。
          Web Crypto APIとの出力一致を確認済みです。
        </p>

        <details className="card">
          <summary style={{
            cursor: 'pointer',
            fontWeight: 'bold',
            color: 'var(--color-primary)',
            userSelect: 'none',
            marginBottom: '16px'
          }}
          className="callout">
            📄 コードを表示する (クリックして展開)
          </summary>

          <pre><code>{`// SHA-256の初期ハッシュ値 (H0〜H7)
// 最初の8つの素数の平方根の小数部分の最初の32ビット
const H: number[] = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
];

// SHA-256のラウンド定数 (K0〜K63)
// 最初の64個の素数の立方根の小数部分の最初の32ビット
const K: number[] = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

// 32ビット右ローテーション
function rotr(n: number, x: number): number {
  return ((x >>> n) | (x << (32 - n))) & 0xffffffff;
}

// Σ0 (大文字シグマ0) 関数 - 圧縮関数で使用
function Σ0(x: number): number {
  return rotr(2, x) ^ rotr(13, x) ^ rotr(22, x);
}

// Σ1 (大文字シグマ1) 関数 - 圧縮関数で使用
function Σ1(x: number): number {
  return rotr(6, x) ^ rotr(11, x) ^ rotr(25, x);
}

// σ0 (小文字シグマ0) 関数 - メッセージスケジュールで使用
function σ0(x: number): number {
  return rotr(7, x) ^ rotr(18, x) ^ (x >>> 3);
}

// σ1 (小文字シグマ1) 関数 - メッセージスケジュールで使用
function σ1(x: number): number {
  return rotr(17, x) ^ rotr(19, x) ^ (x >>> 10);
}

// Ch (Choice) 関数 - xに基づいてyまたはzを選択
function Ch(x: number, y: number, z: number): number {
  return (x & y) ^ (~x & z);
}

// Maj (Majority) 関数 - x,y,zの多数決
function Maj(x: number, y: number, z: number): number {
  return (x & y) ^ (x & z) ^ (y & z);
}

// ステップ1: パディング処理
function padMessage(message: Uint8Array): Uint8Array {
  const msgLen = message.length;
  const bitLen = msgLen * 8;

  // パディング後のサイズを計算
  const k = (55 - msgLen) % 64;
  const totalLen = msgLen + 1 + k + 8;

  const padded = new Uint8Array(totalLen);
  padded.set(message, 0);
  padded[msgLen] = 0x80; // '1' ビットを追加

  // メッセージ長を64ビットビッグエンディアンで末尾に追加
  const high = Math.floor(bitLen / 0x100000000);
  const low = bitLen >>> 0;

  padded[totalLen - 8] = (high >>> 24) & 0xff;
  padded[totalLen - 7] = (high >>> 16) & 0xff;
  padded[totalLen - 6] = (high >>> 8) & 0xff;
  padded[totalLen - 5] = high & 0xff;
  padded[totalLen - 4] = (low >>> 24) & 0xff;
  padded[totalLen - 3] = (low >>> 16) & 0xff;
  padded[totalLen - 2] = (low >>> 8) & 0xff;
  padded[totalLen - 1] = low & 0xff;

  return padded;
}

// ステップ2: メッセージスケジュール生成
function generateMessageSchedule(block: Uint8Array): number[] {
  const W: number[] = new Array(64);

  // W0〜W15: ブロックを32ビットワードに変換（ビッグエンディアン）
  for (let t = 0; t < 16; t++) {
    W[t] = ((block[t * 4] << 24) | (block[t * 4 + 1] << 16) |
           (block[t * 4 + 2] << 8) | block[t * 4 + 3]) >>> 0;
  }

  // W16〜W63: 再帰的に計算
  for (let t = 16; t < 64; t++) {
    W[t] = (σ1(W[t - 2]) + W[t - 7] + σ0(W[t - 15]) + W[t - 16]) & 0xffffffff;
  }

  return W;
}

// ステップ3: 圧縮関数（64ラウンド）
function compress(W: number[], H: number[]): number[] {
  let [a, b, c, d, e, f, g, h] = H;

  for (let t = 0; t < 64; t++) {
    const T1 = (h + Σ1(e) + Ch(e, f, g) + K[t] + W[t]) & 0xffffffff;
    const T2 = (Σ0(a) + Maj(a, b, c)) & 0xffffffff;

    h = g;
    g = f;
    f = e;
    e = (d + T1) & 0xffffffff;
    d = c;
    c = b;
    b = a;
    a = (T1 + T2) & 0xffffffff;
  }

  return [
    (H[0] + a) & 0xffffffff,
    (H[1] + b) & 0xffffffff,
    (H[2] + c) & 0xffffffff,
    (H[3] + d) & 0xffffffff,
    (H[4] + e) & 0xffffffff,
    (H[5] + f) & 0xffffffff,
    (H[6] + g) & 0xffffffff,
    (H[7] + h) & 0xffffffff
  ];
}

// SHA-256ハッシュ計算
export function sha256(input: string): string {
  const message = new TextEncoder().encode(input);

  // ステップ1: パディング
  const padded = padMessage(message);

  // 初期ハッシュ値
  let hash = [...H];

  // 各512ビットブロックを処理
  const numBlocks = padded.length / 64;
  for (let i = 0; i < numBlocks; i++) {
    const block = padded.slice(i * 64, (i + 1) * 64);

    // ステップ2: メッセージスケジュール生成
    const W = generateMessageSchedule(block);

    // ステップ3: 圧縮関数
    hash = compress(W, hash);
  }

  // 最終ハッシュ値を16進文字列に変換
  return hash.map(h => (h >>> 0).toString(16).padStart(8, '0')).join('');
}`}</code>
          </pre>
        </details>
      </section>

      {/* SHA-256デモ */}
      <section className="card">
        <h2 style={{ color: 'var(--color-primary)' }}>SHA-256 デモ</h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
            入力テキスト:
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px'
            }}
            className="text-input"
            placeholder="ハッシュ化したいテキストを入力..."
          />
        </div>

        {result && (
          <div className="callout" style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: 'var(--color-primary)' }}>自作 SHA-256:</strong>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '14px',
                wordBreak: 'break-all',
                marginTop: '4px',
                color: isMatch ? 'var(--color-success)' : 'var(--color-accent)'
              }}>
                {result.hash}
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: 'var(--color-primary)' }}>Web Crypto API:</strong>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '14px',
                wordBreak: 'break-all',
                marginTop: '4px',
                color: 'var(--color-text-main)'
              }}>
                {webCryptoHash}
              </div>
            </div>

            <div style={{
              padding: '8px 12px',
              background: isMatch ? 'rgba(var(--color-success-rgb), 0.1)' : 'rgba(var(--color-accent-rgb), 0.1)',
              borderRadius: '4px',
              border: `1px solid ${isMatch ? 'var(--color-success)' : 'var(--color-accent)'}`,
              color: isMatch ? 'var(--color-success)' : 'var(--color-accent)'
            }}>
              {isMatch ? '✓ 一致しました！実装は正しいです' : '✗ 一致しません（実装エラー）'}
            </div>
          </div>
        )}
      </section>

      {/* 処理ステップの可視化 */}
      <section className="card">
        <h2 style={{ color: 'var(--color-primary)' }}>処理ステップの詳細</h2>
        <p style={{ color: 'var(--color-text-subtle)', marginBottom: '16px' }}>
          クリックして各ステップの詳細を表示
        </p>

        <div className="callout" style={{ padding: 0, overflow: 'hidden' }}>
          {result?.steps.map((step, idx) => (
            <div key={idx} style={{
              borderBottom: idx < result.steps.length - 1 ? '1px solid var(--color-border)' : 'none'
            }}>
              <button
                onClick={() => toggleStep(step.step)}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: expandedSteps.has(step.step) ? 'rgba(var(--color-primary-rgb), 0.05)' : 'transparent',
                  border: 'none',
                  color: 'var(--color-text-main)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'background 0.2s'
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {step.step.replace(/_/g, ' ').toUpperCase()}
                  </div>
                  <div style={{ color: 'var(--color-text-subtle)', fontSize: '14px' }}>
                    {step.description}
                  </div>
                </div>
                <span style={{ fontSize: '20px', color: 'var(--color-text-subtle)' }}>
                  {expandedSteps.has(step.step) ? '▼' : '▶'}
                </span>
              </button>

              {expandedSteps.has(step.step) && (
                <div style={{ padding: '0 16px 16px 16px' }}>
                  {renderStepData(step)}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* アバランシェ効果デモ */}
      <section className="card">
        <h2 style={{ color: 'var(--color-primary)' }}>アバランシェ効果</h2>
        <p style={{ color: 'var(--color-text-subtle)', marginBottom: '16px' }}>
          わずか1文字の違いでハッシュ値が大きく変化することを確認
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
              入力1:
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px'
              }}
              className="text-input"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--color-text-main)' }}>
              入力2:
            </label>
            <input
              type="text"
              value={input2}
              onChange={(e) => setInput2(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px'
              }}
              className="text-input"
            />
          </div>
        </div>

        <div className="callout">
          {renderAvalancheVisualization()}
        </div>
      </section>
    </main>
  );
}
