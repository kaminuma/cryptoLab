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
  algorithm: string
  highlights: string[]
  interactive?: 'caesar' | 'vigenere' | 'atbash' | 'autokey' | 'otp' | 'enigma'
  references?: Array<{ label: string; url: string }>
}

export const classicalCiphers: ClassicalCipher[] = [
  {
    id: 'caesar',
    name: 'シーザー暗号',
    era: '古代ローマ (紀元前 1 世紀)',
    type: '単純換字 (シフト)',
    description: 'アルファベットを一定量だけ平行移動させる最も有名な換字式暗号。ユリウス・シーザーが用いたとされる。',
    algorithm: '各文字を固定値（シフト量）分だけアルファベット上でずらす。例えばシフト量が3の場合、A→D, B→E, C→F...となる。アルファベットの端（Z）に達した場合は先頭（A）に戻る（循環）。復号は逆方向に同じ量だけシフトする。数式では暗号化: C = (P + shift) mod 26、復号: P = (C - shift) mod 26 として表現できる。',
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
    algorithm: 'アルファベットの最初の文字と最後の文字を対応させる単純な置換暗号。A↔Z, B↔Y, C↔X...のように、位置が対称な文字同士を入れ替える。数式では C = (25 - P) mod 26 として表現できる（0-indexed）。暗号化と復号が同じ操作なので、暗号文に対して同じ処理を施せば平文に戻る。鍵の概念がなく、アルゴリズム自体が公開されていても使用できるが、逆に言えば誰でも簡単に解読できる。',
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
    algorithm: '特定の直径の円柱（棒）に長い帯状の素材を螺旋状に巻きつけ、その表面に平文を横方向に書く。巻きを解くと文字が無秩序に並んで見えるが、同じ直径の棒に巻き直せば元の文を読める。転置暗号の最古の例の一つで、文字そのものは変更せず、配置のみを変える。数学的には列数固定の行列転置として表現でき、棒の直径（周囲長）が列数に対応する。復号には送信側と同じ直径の棒が必要。',
    highlights: ['アルファベット自体は変えない転置', '棒のサイズを推測されると解読可能', '軍事通信の初期例'],
  },
  {
    id: 'vigenere',
    name: 'ヴィジュネル暗号',
    era: '16 世紀 (ベルジュ文献)',
    type: '多表式換字',
    description: 'キーワードを用いてシフト量を周期的に入れ替える換字。単純頻度解析に強い。',
    algorithm: 'キーワードの各文字を数値（A=0, B=1...Z=25）として扱い、平文の各文字に対応するキー文字の値だけシーザーシフトを適用する。キーワードは繰り返し使用される。例：平文 "HELLO"、キー "KEY" の場合、H+K, E+E, L+Y, L+K, O+E のように加算する。数式では C[i] = (P[i] + K[i mod keyLen]) mod 26。キーが短いと周期性が生まれ、カシスキーテストで鍵長を推定され、各位置ごとの頻度解析で解読される。キーが平文と同じ長さでランダムならワンタイムパッドになる。',
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
    algorithm: 'ヴィジュネル暗号の鍵繰り返しを改善した暗号。初期キーワードを使った後、平文自体を鍵ストリームに追加していく。例：平文 "HELLO"、初期キー "KEY" の場合、鍵ストリームは "KEYHEL" となり、H+K, E+E, L+Y, L+H, O+E と暗号化される。数式では C[0..n] = (P[0..n] + InitKey[0..n]) mod 26、C[n+1..] = (P[n+1..] + P[0..]) mod 26。鍵が繰り返さないため周期性がなくなるが、平文の一部が推測されると、それを鍵として後続部分が解読される脆弱性がある。復号時も同様に、復号した平文を次の鍵として使用する。',
    highlights: ['初期キーのみ秘密にすればよい', '繰り返し構造が解析されやすい', 'ヴィジュネル改良として登場'],
    interactive: 'autokey',
  },
  {
    id: 'playfair',
    name: 'プレイフェア暗号',
    era: '1850 年代',
    type: '二文字換字 (5×5 グリッド)',
    description: '5×5 のマトリクスを鍵にして二文字ペアを置換。I/J を統合して 25 文字にする。',
    algorithm: 'キーワードから重複を除いた文字と残りのアルファベットで5×5のマトリクスを作成（IとJは同一視して25文字に）。平文を2文字ずつのペア（ダイグラム）に分割し、以下のルールで暗号化：①同じ行にある場合→右隣の文字に置換（端なら行頭へ）、②同じ列にある場合→下の文字に置換（端なら列頭へ）、③それ以外→同じ行で相手の列にある文字に置換（矩形の対角）。同じ文字が連続する場合はXなどのパディング文字を挿入。復号は逆の操作（左隣、上の文字）を行う。単一文字頻度解析には強いが、ダイグラム（2文字組）の頻度解析に脆弱。',
    highlights: ['単純頻度に強いが二文字頻度で解読', 'キー表の設定が重要', '第一次世界大戦でも使用'],
  },
  {
    id: 'hill',
    name: 'Hill 暗号',
    era: '1929 年',
    type: '線形代数ブロック換字',
    description: '文字ベクトルに行列を掛けてシフトする方式。`C = K·P mod 26`。',
    algorithm: '線形代数を用いた多文字換字暗号。平文をn文字ずつのブロックに分割し、各文字を数値（A=0...Z=25）に変換してベクトルとする。n×nの鍵行列Kを用いて C = K·P mod 26 で暗号化する。例：2×2行列の場合、2文字ペアを2次元ベクトルとして行列演算。復号には鍵行列の逆行列K⁻¹を使用（P = K⁻¹·C mod 26）。逆行列がmod 26で存在するには、行列式とgcd(det(K), 26)=1 という条件が必要。既知平文攻撃に弱く、n組の平文-暗号文ペアがあれば鍵行列を復元できる。行列サイズを大きくすることで安全性を高められるが計算量も増加する。',
    highlights: ['逆行列が存在する必要', '既知平文があると行列を復元される', '行列サイズを変えて強度を調整'],
  },
  {
    id: 'otp',
    name: 'ワンタイムパッド',
    era: '1917 年以降',
    type: 'XOR (ストリーム)',
    description: '完全ランダムな鍵ストリームと平文を XOR する完全秘匿暗号。',
    algorithm: '理論的に解読不可能な唯一の暗号方式（Shannon の完全秘匿定理）。平文と同じ長さの完全ランダムな鍵を生成し、各文字ごとに加算（mod 26）または XOR 演算を行う。数式では C[i] = (P[i] + K[i]) mod 26 または C[i] = P[i] ⊕ K[i]。復号は C[i] - K[i] mod 26 または C[i] ⊕ K[i]。安全性の条件：①鍵が真にランダム、②鍵長が平文以上、③鍵の一度きり使用、④鍵の完全な秘匿。これらが満たされれば、暗号文から平文についての情報が一切得られない（情報理論的安全）。実用上の課題は、平文と同じ長さの鍵を安全に配送・管理する必要がある点。',
    highlights: ['鍵が真にランダムかつ一度きりなら情報理論的安全', '鍵配布が最大の課題', '米ソ冷戦期でも利用'],
    interactive: 'otp',
    references: [
      { label: 'Shannon - Communication Theory of Secrecy Systems (1949)', url: 'https://ieeexplore.ieee.org/document/6769090' },
      { label: 'One-time pad - Wikipedia', url: 'https://en.wikipedia.org/wiki/One-time_pad' },
    ],
  },

  {
    id: 'enigma',
    name: 'エニグマ',
    era: '1920〜40 年代',
    type: '電気機械ローター',
    description: 'ローター・反射板・プラグボードで多段換字を行う機械式暗号。第二次世界大戦で著名。',
    algorithm: '複数の回転ローター（円盤）と反射板、プラグボードを組み合わせた電気機械式暗号機。各ローターは26個の接点を持ち、内部配線で入出力を置換する。キーを押すと電流がプラグボード→ローター群→反射板→逆順にローター群→プラグボードと通過し、対応するランプが点灯。キー入力ごとに右端ローターが1ステップ回転し（オドメーター式に桁上がりも）、置換パターンが変化する。反射板により暗号化と復号が同一操作となるが、同時に「文字が自分自身に暗号化されない」という構造的弱点が生まれた。初期設定（ローター順序・位置・プラグボード配線）が鍵となる。ブレッチリーパークの Alan Turing らが Bombe マシンで解読に成功し、連合国の勝利に貢献した。',
    highlights: ['同じ文字が自分自身にマップされない構造', 'ローター設定＋日替わりキー', 'ブレッチリーパークの解読で有名'],
    interactive: 'enigma',
    references: [
      { label: 'Bletchley Park archives', url: 'https://bletchleypark.org.uk/' },
    ],
  },
]
