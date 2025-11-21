/**
 * SHA-256 ハッシュ関数の完全実装（教育用）
 *
 * SHA-256アルゴリズムの流れ:
 * 1. パディング処理: メッセージを512ビットの倍数に調整
 * 2. ブロック分割: 512ビット（64バイト）ごとに処理
 * 3. メッセージスケジュール: 各ブロックから64個の32ビットワード(W)を生成
 * 4. 圧縮関数: 64ラウンドの処理でハッシュ値を更新
 * 5. 最終ハッシュ: 8個の32ビット値を連結して256ビットのハッシュを生成
 */

/**
 * SHA-256の初期ハッシュ値 (H0〜H7)
 * これらは最初の8つの素数(2,3,5,7,11,13,17,19)の平方根の小数部分の最初の32ビット
 */
const H: number[] = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
];

/**
 * SHA-256のラウンド定数 (K0〜K63)
 * これらは最初の64個の素数の立方根の小数部分の最初の32ビット
 */
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

/**
 * 32ビット右ローテーション
 */
function rotr(n: number, x: number): number {
  return ((x >>> n) | (x << (32 - n))) & 0xffffffff;
}

/**
 * Σ0 (大文字シグマ0) 関数 - 圧縮関数で使用
 */
function Σ0(x: number): number {
  return rotr(2, x) ^ rotr(13, x) ^ rotr(22, x);
}

/**
 * Σ1 (大文字シグマ1) 関数 - 圧縮関数で使用
 */
function Σ1(x: number): number {
  return rotr(6, x) ^ rotr(11, x) ^ rotr(25, x);
}

/**
 * σ0 (小文字シグマ0) 関数 - メッセージスケジュールで使用
 */
function σ0(x: number): number {
  return rotr(7, x) ^ rotr(18, x) ^ (x >>> 3);
}

/**
 * σ1 (小文字シグマ1) 関数 - メッセージスケジュールで使用
 */
function σ1(x: number): number {
  return rotr(17, x) ^ rotr(19, x) ^ (x >>> 10);
}

/**
 * Ch (Choice) 関数 - xに基づいてyまたはzを選択
 */
function Ch(x: number, y: number, z: number): number {
  return (x & y) ^ (~x & z);
}

/**
 * Maj (Majority) 関数 - x,y,zの多数決
 */
function Maj(x: number, y: number, z: number): number {
  return (x & y) ^ (x & z) ^ (y & z);
}

/**
 * 処理の各ステップの詳細情報を格納する型
 */
export interface SHA256Step {
  step: string;
  description: string;
  data: any;
}

/**
 * SHA-256のステップバイステップ処理結果
 */
export interface SHA256Result {
  hash: string;
  steps: SHA256Step[];
}

/**
 * ステップ1: パディング処理
 * メッセージの末尾に以下を追加:
 * 1. '1' ビット (0x80)
 * 2. '0' ビットを適量追加して、(メッセージ長 + 1 + k) ≡ 448 (mod 512) となるようにする
 * 3. 元のメッセージ長を64ビットのビッグエンディアンで追加
 */
function padMessage(message: Uint8Array): { padded: Uint8Array; steps: SHA256Step[] } {
  const steps: SHA256Step[] = [];
  const msgLen = message.length;
  const bitLen = msgLen * 8;

  // パディング後のサイズを計算
  // (元のメッセージ + 1バイト(0x80) + kバイト(0x00...) + 8バイト(長さ)) が 512ビット(64バイト)の倍数
  const k = (55 - msgLen) % 64; // 448 bits = 56 bytes (512 - 64)
  const totalLen = msgLen + 1 + k + 8;

  const padded = new Uint8Array(totalLen);
  padded.set(message, 0);
  padded[msgLen] = 0x80; // '1' ビットを追加

  // 元のメッセージ長(ビット)を64ビットビッグエンディアンで末尾に追加
  // JavaScriptの数値は53ビットまで正確なので、上位32ビットと下位32ビットに分ける
  const high = Math.floor(bitLen / 0x100000000); // 上位32ビット
  const low = bitLen >>> 0; // 下位32ビット

  padded[totalLen - 8] = (high >>> 24) & 0xff;
  padded[totalLen - 7] = (high >>> 16) & 0xff;
  padded[totalLen - 6] = (high >>> 8) & 0xff;
  padded[totalLen - 5] = high & 0xff;
  padded[totalLen - 4] = (low >>> 24) & 0xff;
  padded[totalLen - 3] = (low >>> 16) & 0xff;
  padded[totalLen - 2] = (low >>> 8) & 0xff;
  padded[totalLen - 1] = low & 0xff;

  steps.push({
    step: 'padding',
    description: `パディング処理: ${msgLen}バイトのメッセージを${totalLen}バイト(${totalLen * 8}ビット)に拡張`,
    data: {
      originalLength: msgLen,
      paddedLength: totalLen,
      paddedHex: Array.from(padded).map(b => b.toString(16).padStart(2, '0')).join(' ')
    }
  });

  return { padded, steps };
}

/**
 * ステップ2: メッセージスケジュール生成
 * 512ビットブロックから64個の32ビットワード(W0〜W63)を生成
 * - W0〜W15: ブロックを直接32ビットワードに変換
 * - W16〜W63: 以下の式で計算
 *   Wt = σ1(Wt-2) + Wt-7 + σ0(Wt-15) + Wt-16
 */
function generateMessageSchedule(block: Uint8Array): { W: number[]; steps: SHA256Step[] } {
  const steps: SHA256Step[] = [];
  const W: number[] = new Array(64);

  // W0〜W15: ブロックを32ビットワードに変換（ビッグエンディアン）
  for (let t = 0; t < 16; t++) {
    W[t] = ((block[t * 4] << 24) | (block[t * 4 + 1] << 16) |
           (block[t * 4 + 2] << 8) | block[t * 4 + 3]) >>> 0;
  }

  steps.push({
    step: 'message_schedule_init',
    description: 'W0〜W15: ブロックデータを32ビットワードに変換',
    data: { W: W.slice(0, 16).map(w => '0x' + (w >>> 0).toString(16).padStart(8, '0')) }
  });

  // W16〜W63: 再帰的に計算
  for (let t = 16; t < 64; t++) {
    W[t] = (σ1(W[t - 2]) + W[t - 7] + σ0(W[t - 15]) + W[t - 16]) & 0xffffffff;
  }

  steps.push({
    step: 'message_schedule_expand',
    description: 'W16〜W63: σ0とσ1を使って拡張',
    data: {
      W: W.slice(16, 24).map(w => '0x' + (w >>> 0).toString(16).padStart(8, '0')),
      note: '最初の8個のみ表示（全64個）'
    }
  });

  return { W, steps };
}

/**
 * ステップ3: 圧縮関数
 * 64ラウンドの処理でハッシュ値を更新
 * 各ラウンドで以下の計算を実行:
 * T1 = h + Σ1(e) + Ch(e,f,g) + Kt + Wt
 * T2 = Σ0(a) + Maj(a,b,c)
 * 新しいハッシュ値 = (T1+T2, a, b, c, d+T1, e, f, g)
 */
function compress(W: number[], H: number[]): { newH: number[]; steps: SHA256Step[] } {
  const steps: SHA256Step[] = [];
  let [a, b, c, d, e, f, g, h] = H;

  // 主要なラウンド（0, 15, 31, 47, 63）の詳細を記録
  const detailedRounds = [0, 15, 31, 47, 63];

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

    // 特定のラウンドの詳細を記録
    if (detailedRounds.includes(t)) {
      steps.push({
        step: `round_${t}`,
        description: `ラウンド ${t}: T1=h+Σ1(e)+Ch(e,f,g)+K[${t}]+W[${t}], T2=Σ0(a)+Maj(a,b,c)`,
        data: {
          round: t,
          a: '0x' + (a >>> 0).toString(16).padStart(8, '0'),
          e: '0x' + (e >>> 0).toString(16).padStart(8, '0'),
          T1: '0x' + (T1 >>> 0).toString(16).padStart(8, '0'),
          T2: '0x' + (T2 >>> 0).toString(16).padStart(8, '0')
        }
      });
    }
  }

  steps.push({
    step: 'compression_summary',
    description: '64ラウンド完了: 各ラウンドでa〜hの値を更新',
    data: {
      totalRounds: 64,
      detailedRoundsShown: detailedRounds.length,
      note: '上記は代表的なラウンドのみ表示'
    }
  });

  const newH = [
    (H[0] + a) & 0xffffffff,
    (H[1] + b) & 0xffffffff,
    (H[2] + c) & 0xffffffff,
    (H[3] + d) & 0xffffffff,
    (H[4] + e) & 0xffffffff,
    (H[5] + f) & 0xffffffff,
    (H[6] + g) & 0xffffffff,
    (H[7] + h) & 0xffffffff
  ];

  return { newH, steps };
}

/**
 * SHA-256ハッシュ計算（ステップ記録付き）
 */
export function sha256WithSteps(input: string): SHA256Result {
  const steps: SHA256Step[] = [];
  const message = new TextEncoder().encode(input);

  steps.push({
    step: 'input',
    description: '入力メッセージ',
    data: {
      text: input,
      bytes: message.length,
      hex: Array.from(message).map(b => b.toString(16).padStart(2, '0')).join(' ')
    }
  });

  // ステップ1: パディング
  const { padded, steps: paddingSteps } = padMessage(message);
  steps.push(...paddingSteps);

  // 初期ハッシュ値
  let hash = [...H];
  steps.push({
    step: 'initial_hash',
    description: '初期ハッシュ値 H0〜H7（最初の8つの素数の平方根から生成）',
    data: { H: hash.map(h => '0x' + (h >>> 0).toString(16).padStart(8, '0')) }
  });

  // 各512ビットブロックを処理
  const numBlocks = padded.length / 64;
  for (let i = 0; i < numBlocks; i++) {
    const block = padded.slice(i * 64, (i + 1) * 64);

    steps.push({
      step: `block_${i}`,
      description: `ブロック ${i + 1}/${numBlocks} の処理開始`,
      data: { blockNumber: i + 1, totalBlocks: numBlocks }
    });

    // ステップ2: メッセージスケジュール生成
    const { W, steps: scheduleSteps } = generateMessageSchedule(block);
    steps.push(...scheduleSteps);

    // ステップ3: 圧縮関数
    const { newH, steps: compressSteps } = compress(W, hash);
    steps.push(...compressSteps);

    hash = newH;

    steps.push({
      step: `block_${i}_result`,
      description: `ブロック ${i + 1} 処理後のハッシュ値`,
      data: { H: hash.map(h => '0x' + (h >>> 0).toString(16).padStart(8, '0')) }
    });
  }

  // 最終ハッシュ値を16進文字列に変換
  const hashHex = hash.map(h => (h >>> 0).toString(16).padStart(8, '0')).join('');

  steps.push({
    step: 'final',
    description: '最終ハッシュ値: 8個の32ビット値を連結して256ビット(64文字の16進数)',
    data: { hash: hashHex }
  });

  return { hash: hashHex, steps };
}

/**
 * SHA-256ハッシュ計算（シンプル版）
 */
export function sha256(input: string): string {
  return sha256WithSteps(input).hash;
}

/**
 * Web Crypto APIを使ったSHA-256（検証用）
 */
export async function sha256WebCrypto(input: string): Promise<string> {
  const message = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', message);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * アバランシェ効果の計算
 * 2つの入力のハッシュ値を比較し、何ビット異なるかを返す
 */
export function calculateAvalanche(hash1: string, hash2: string): {
  differentBits: number;
  totalBits: number;
  percentage: number;
  bitDifferences: boolean[];
} {
  const bits1 = hash1.split('').map(h => parseInt(h, 16).toString(2).padStart(4, '0')).join('');
  const bits2 = hash2.split('').map(h => parseInt(h, 16).toString(2).padStart(4, '0')).join('');

  const bitDifferences = bits1.split('').map((b, i) => b !== bits2[i]);
  const differentBits = bitDifferences.filter(Boolean).length;
  const totalBits = bits1.length;
  const percentage = (differentBits / totalBits) * 100;

  return { differentBits, totalBits, percentage, bitDifferences };
}
