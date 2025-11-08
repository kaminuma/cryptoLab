export type ClassicalCipher = {
  id:
    | 'caesar'
    | 'atbash'
    | 'scytale'
    | 'vigenere'
    | 'autokey'
    | 'playfair'
    | 'hill'
    | 'otp'
    | 'enigma'
  name: string
  era: string
  type: string
  description: string
  highlights: string[]
  interactive?: 'caesar' | 'vigenere' | 'atbash'
  references?: Array<{ label: string; url: string }>
}

export const classicalCiphers: ClassicalCipher[] = [
  {
    id: 'caesar',
    name: 'シーザー暗号',
    era: '古代ローマ (紀元前 1 世紀)',
    type: '単純換字 (シフト)',
    description: 'アルファベットを一定量だけ平行移動させる最も有名な換字式暗号。ユリウス・シーザーが用いたとされる。',
    highlights: ['26 通りしかないため総当たりで破れる', '頻度分布がそのまま残る', '教育・パズル用途で広く利用'],
    interactive: 'caesar',
    references: [
      { label: 'Caesar cipher - Britannica', url: 'https://www.britannica.com/topic/Caesar-cipher' },
    ],
  },
  {
    id: 'atbash',
    name: 'アトバッシュ暗号',
    era: '古代ヘブライ',
    type: '固定換字 (逆順)',
    description: 'アルファベットを逆順で置換する単純換字。A↔Z, B↔Y のように対応づける。',
    highlights: ['キー不要で単純', '頻度分布がそのまま', '歴史的宗教文書に散見'],
    interactive: 'atbash',
    references: [
      { label: 'Atbash cipher overview', url: 'https://cryptii.com/pipes/atbash-cipher' },
    ],
  },
  {
    id: 'scytale',
    name: 'スキュタレー',
    era: '古代ギリシャ・スパルタ',
    type: '転置式 (シリンダー)',
    description: '帯状の皮を棒に巻き付けて文字を書く転置式。棒の直径がキーに相当する。',
    highlights: ['アルファベット自体は変えない転置', '棒のサイズを推測されると解読可能', '軍事通信の初期例'],
  },
  {
    id: 'vigenere',
    name: 'ヴィジュネル暗号',
    era: '16 世紀 (ベルジュ文献)',
    type: '多表式換字',
    description: 'キーワードを用いてシフト量を周期的に入れ替える換字。単純頻度解析に強い。',
    highlights: ['キー周期を推定されると解読可能', 'カシスキーテストやフリードマンテストで解析', '多くのバリエーションの土台'],
    interactive: 'vigenere',
    references: [
      { label: 'Vigenère cipher - Crypto Corner', url: 'https://crypto.interactive-maths.com/vigenere-cipher.html' },
    ],
  },
  {
    id: 'autokey',
    name: 'オートキー暗号',
    era: '16 世紀',
    type: '自動鍵多表式',
    description: 'キーワードの後に平文や直前の出力を連結してシフト値を決める方式。',
    highlights: ['初期キーのみ秘密にすればよい', '繰り返し構造が解析されやすい', 'ヴィジュネル改良として登場'],
  },
  {
    id: 'playfair',
    name: 'プレイフェア暗号',
    era: '1850 年代',
    type: '二文字換字 (5×5 グリッド)',
    description: '5×5 のマトリクスを鍵にして二文字ペアを置換。I/J を統合して 25 文字にする。',
    highlights: ['単純頻度に強いが二文字頻度で解読', 'キー表の設定が重要', '第一次世界大戦でも使用'],
  },
  {
    id: 'hill',
    name: 'Hill 暗号',
    era: '1929 年',
    type: '線形代数ブロック換字',
    description: '文字ベクトルに行列を掛けてシフトする方式。`C = K·P mod 26`。',
    highlights: ['逆行列が存在する必要', '既知平文があると行列を復元される', '行列サイズを変えて強度を調整'],
  },
  {
    id: 'otp',
    name: 'ワンタイムパッド',
    era: '1917 年以降',
    type: 'XOR (ストリーム)',
    description: '完全ランダムな鍵ストリームと平文を XOR する完全秘匿暗号。',
    highlights: ['鍵が真にランダムかつ一度きりなら情報理論的安全', '鍵配布が最大の課題', '米ソ冷戦期でも利用'],
    references: [{ label: 'Shannon 1949 "Communication Theory of Secrecy Systems"', url: 'https://systemsciences.uwaterloo.ca/~ssfrankel/SSShannon1949.pdf' }],
  },
  {
    id: 'enigma',
    name: 'エニグマ',
    era: '1920〜40 年代',
    type: '電気機械ローター',
    description: 'ローター・反射板・プラグボードで多段換字を行う機械式暗号。第二次世界大戦で著名。',
    highlights: ['同じ文字が自分自身にマップされない構造', 'ローター設定＋日替わりキー', 'ブレッチリーパークの解読で有名'],
    references: [
      { label: 'Bletchley Park archives', url: 'https://bletchleypark.org.uk/' },
    ],
  },
]
