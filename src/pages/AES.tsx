import { useState, useEffect } from 'react'
import StepLesson, { type LessonStep } from '../components/ui/StepLesson'
import '../components/ui/StepLesson.css'
import { usePageMeta } from '../hooks/usePageMeta'
import {
  encrypt,
  decrypt,
  generateRandomKey,
  bytesToHex,
  type AESMode
} from '@/lib/aes'

/* =========================================
   Step 1: DESからAESへ — 標準暗号の世代交代
   歴史的背景 → なぜDESでは不十分か → Rijndael選定
   ========================================= */
function DEStoAESHistory() {
  return (
    <>
      <p>
        AESを理解するには、まずその前身である<strong>DES（Data Encryption Standard）</strong>の
        限界を知る必要があります。DESは1977年にNISTが標準化したブロック暗号ですが、
        1990年代にはその安全性に深刻な疑問が突きつけられていました。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>DES（1977年〜）</h3>
          <ul>
            <li><strong>鍵長:</strong> 56ビット（2<sup>56</sup> = 約7.2 x 10<sup>16</sup>通り）</li>
            <li><strong>ブロックサイズ:</strong> 64ビット</li>
            <li><strong>構造:</strong> Feistelネットワーク（16ラウンド）</li>
            <li><strong>致命的問題:</strong> 1998年、EFF（電子フロンティア財団）の
              「Deep Crack」が56時間で全鍵探索に成功</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>AES（2001年〜）</h3>
          <ul>
            <li><strong>鍵長:</strong> 128 / 192 / 256ビット</li>
            <li><strong>ブロックサイズ:</strong> 128ビット</li>
            <li><strong>構造:</strong> SPN（置換・転置ネットワーク）</li>
            <li><strong>強度:</strong> AES-128でも2<sup>128</sup>通り。
              全宇宙の原子数（約10<sup>80</sup>）より多い</li>
          </ul>
        </div>
      </div>

      <p>
        DESの鍵長56ビットは設計当時（1970年代）でも短いと批判されていました。
        NSAが当初のLucifer暗号（128ビット鍵）を56ビットに短縮したという経緯があり、
        「意図的にバックドアを仕込んだのでは」という疑念が長年つきまといました。
      </p>

      <p>
        3DES（Triple DES）で鍵長を112ビットに拡張する応急措置がとられましたが、
        ブロックサイズ64ビットに起因する<strong>誕生日攻撃</strong>（Sweet32攻撃、2016年）や
        処理速度の問題から、根本的な後継が求められました。
      </p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>AES選定コンペティション（1997-2000）</strong></div>
          <div>1997: NISTが後継暗号の公募を開始</div>
          <div>1998: 15候補が提出（MARS, RC6, Rijndael, Serpent, Twofish等）</div>
          <div>1999: 5候補に絞り込み（第2ラウンド）</div>
          <div>2000: <strong>Rijndael</strong>を選定（Joan Daemen & Vincent Rijmen）</div>
          <div>2001: FIPS 197として標準化</div>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>なぜRijndaelが選ばれたか:</strong>
        Serpentはより保守的な安全性マージンを持ちましたが、Rijndaelは
        (1) ハードウェア・ソフトウェア両方で高速、
        (2) メモリ使用量が少なくスマートカードにも実装可能、
        (3) 数学的構造が明快で安全性の分析がしやすい、
        という総合力で勝りました。
      </div>
    </>
  )
}

/* =========================================
   Step 2: AES全体構造 — SPN構造と4つの操作
   ========================================= */
function OverallStructure() {
  return (
    <>
      <p>
        AESは<strong>SPN構造</strong>（Substitution-Permutation Network）を採用しています。
        DESのFeistel構造とは異なり、毎ラウンドで<strong>全128ビット</strong>を変換します。
        Feistelでは半分ずつ処理するため、同じ拡散性を得るのに倍のラウンドが必要です。
      </p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>AES-128 の処理フロー（10ラウンド）</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            平文 (128bit) = 4x4バイト行列（State）
          </div>
          <div>  |</div>
          <div>  +-- AddRoundKey（初期ラウンド鍵を XOR）</div>
          <div>  |</div>
          <div>  +-- [ラウンド 1〜9] ───────────────</div>
          <div>  |   | SubBytes    ... 非線形変換（混乱）</div>
          <div>  |   | ShiftRows   ... 行の巡回シフト（拡散）</div>
          <div>  |   | MixColumns  ... 列の線形変換（拡散）</div>
          <div>  |   | AddRoundKey ... ラウンド鍵と XOR</div>
          <div>  |   └───────────────────────</div>
          <div>  |</div>
          <div>  +-- [最終ラウンド 10] ──────────────</div>
          <div>  |   | SubBytes</div>
          <div>  |   | ShiftRows</div>
          <div>  |   | AddRoundKey（MixColumnsなし）</div>
          <div>  |   └───────────────────────</div>
          <div>  |</div>
          <div>  暗号文 (128bit)</div>
        </div>
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>鍵長とラウンド数</h3>
          <ul>
            <li><strong>AES-128:</strong> 鍵128bit / 10ラウンド</li>
            <li><strong>AES-192:</strong> 鍵192bit / 12ラウンド</li>
            <li><strong>AES-256:</strong> 鍵256bit / 14ラウンド</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>鍵スケジュール</h3>
          <ul>
            <li>マスター鍵からラウンド鍵を導出</li>
            <li>RotWord + SubWord + Rcon で各ワードを生成</li>
            <li>各ラウンド鍵は前のラウンド鍵に依存</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>Stateの表現:</strong>
        AESは128ビットの入力を4行4列のバイト行列（State）として扱います。
        列優先（column-major）で格納されるため、入力バイト b0,b1,...,b15 は
        State[行][列] = b[行+4*列] として配置されます。
        この行列表現が ShiftRows と MixColumns の設計を自然にしています。
      </div>
    </>
  )
}

/* =========================================
   Step 3: SubBytesの深掘り — S-Boxの数学的設計
   GF(2⁸)逆数 + アフィン変換 → 線形近似確率の最小化
   ========================================= */
function SubBytesDeepDive() {
  return (
    <>
      <p>
        SubBytesはAESの安全性の核心です。各バイトをS-Box（Substitution Box）で置換しますが、
        このS-Boxは<strong>恣意的に作られたものではありません</strong>。
        明確な数学的原理に基づき、攻撃への耐性を最大化するよう設計されています。
      </p>

      <div className="step-lesson__callout">
        <strong>設計原理: なぜGF(2<sup>8</sup>)の逆数を使うのか</strong><br />
        差分攻撃・線形攻撃という2つの強力な攻撃に対して、S-Boxの耐性を数学的に保証するためです。
        GF(2<sup>8</sup>)上の逆数写像は、すべての非線形関数の中で
        <strong>線形近似確率と差分確率を同時に最小化する</strong>最適な選択として知られています。
      </div>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>S-Box生成の2ステップ</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            Step 1: GF(2<sup>8</sup>)上の乗法逆数
          </div>
          <div>  入力バイト b → b<sup>-1</sup> mod (x<sup>8</sup>+x<sup>4</sup>+x<sup>3</sup>+x+1)</div>
          <div>  ※ 0 → 0 と定義（0には逆数がないため）</div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            Step 2: GF(2)上のアフィン変換
          </div>
          <div>  b<sup>-1</sup> に対してビット単位の行列演算 + 定数加算</div>
          <div>  b&apos; = A * b<sup>-1</sup> + c （Aは8x8行列、cは定数ベクトル）</div>
        </div>
      </div>

      <p>
        <strong>なぜ2段階なのか?</strong> 逆数写像だけでは代数的構造が残り、
        代数的攻撃（連立方程式を解いて鍵を求める攻撃）に対して脆弱です。
        アフィン変換を加えることで、その代数的構造を壊し、
        代数的攻撃への耐性も確保しています。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>S-Boxの暗号学的特性</h3>
          <ul>
            <li><strong>最大線形近似確率:</strong> 2<sup>-3</sup>（1/8）
              — 入出力の線形関係が偏る確率を最小化</li>
            <li><strong>最大差分確率:</strong> 2<sup>-6</sup>（1/64）
              — 入力差分から出力差分を予測する確率を最小化</li>
            <li><strong>代数次数:</strong> 7（8ビット入力に対して最大に近い）</li>
            <li><strong>不動点:</strong> S-Box(0x00) = 0x63 (0は0にならない)</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>DES S-Boxとの比較</h3>
          <ul>
            <li>DESのS-Boxは<strong>経験的に</strong>設計された（NSAの支援下）</li>
            <li>設計根拠が長年非公開で、バックドア疑惑があった</li>
            <li>AESのS-Boxは<strong>数学的根拠が完全に公開</strong>されている</li>
            <li>「Nothing up my sleeve（隠し事なし）」設計</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>線形攻撃とは:</strong>
        Matsui（1993）がDESに対して初めて実証した攻撃手法です。
        暗号の入出力に存在するわずかな線形相関を大量の平文-暗号文ペアで統計的に検出し、
        鍵ビットを推定します。S-Boxの線形近似確率が高いほど、必要な平文数が少なくなり攻撃が容易になります。
        AESのS-Boxはこの確率を数学的に最小化しています。
      </div>
    </>
  )
}

/* =========================================
   Step 4: ShiftRows / MixColumns — 拡散の仕組み
   Full diffusion after 2 rounds
   ========================================= */
function DiffusionLayers() {
  return (
    <>
      <p>
        SubBytesが<strong>混乱（Confusion）</strong>を担うのに対し、
        ShiftRowsとMixColumnsは<strong>拡散（Diffusion）</strong>を担います。
        この2つの操作が組み合わさることで、
        <strong>2ラウンドで入力の1バイトの変化が全16バイトに波及</strong>します（Full Diffusion）。
      </p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>ShiftRows — 行ごとに左巡回シフト</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            行0: シフトなし　 [b0  b4  b8  b12]
          </div>
          <div>
            行1: 1バイト左　 [b5  b9  b13 b1 ]
          </div>
          <div>
            行2: 2バイト左　 [b10 b14 b2  b6 ]
          </div>
          <div>
            行3: 3バイト左　 [b15 b3  b7  b11]
          </div>
          <div style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-text-subtle)' }}>
            目的: 同一列のバイトを異なる列に分散させ、
          </div>
          <div style={{ color: 'var(--color-text-subtle)' }}>
            次のMixColumnsで異なるバイト同士を混合させる
          </div>
        </div>
      </div>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>MixColumns — GF(2<sup>8</sup>)上の行列乗算</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            各列ベクトル [s0, s1, s2, s3] に対して:
          </div>
          <div>
            [2 3 1 1] [s0]   [s0&apos;]
          </div>
          <div>
            [1 2 3 1] [s1] = [s1&apos;]
          </div>
          <div>
            [1 1 2 3] [s2]   [s2&apos;]
          </div>
          <div>
            [3 1 1 2] [s3]   [s3&apos;]
          </div>
          <div style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-text-subtle)' }}>
            演算はすべてGF(2<sup>8</sup>)上（加算=XOR, 乗算=多項式乗算 mod 既約多項式）
          </div>
        </div>
      </div>

      <p>
        MixColumnsの行列 {'{2,3,1,1}...'} は<strong>MDS行列</strong>（Maximum Distance Separable）です。
        これは符号理論に基づく概念で、入力の1バイトが変化したとき、
        出力で少なくとも4バイト以外のすべてが変化することを保証します（Branch Number = 5）。
      </p>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>2ラウンドでのFull Diffusion</h3>
          <ul>
            <li><strong>ラウンド1:</strong> 1バイト変化 → SubBytes → ShiftRows → MixColumnsで同列4バイトに拡散</li>
            <li><strong>ラウンド2:</strong> ShiftRowsが4バイトを4列に分散 → MixColumnsで各列の4バイトが全バイトに拡散</li>
            <li>結果: <strong>たった2ラウンドで1バイトの変化が16バイト全体に波及</strong></li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>なぜ最終ラウンドにMixColumnsがないか</h3>
          <ul>
            <li>暗号化と復号の<strong>構造的対称性</strong>を確保するため</li>
            <li>MixColumnsは線形変換なので、直後のAddRoundKeyと交換可能</li>
            <li>最終ラウンドのMixColumnsは安全性に寄与しない</li>
            <li>削除することで復号処理の設計が簡潔になる</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>Shannonの原則（1949年）:</strong>
        安全な暗号には「混乱」（鍵と暗号文の関係を複雑にする）と
        「拡散」（平文の統計的性質を暗号文全体に散らす）の両方が必要。
        AESではSubBytesが混乱を、ShiftRows + MixColumnsが拡散を担い、
        AddRoundKeyが鍵依存性を注入します。この4つが組み合わさることで、
        10ラウンドという比較的少ないラウンド数で高い安全性を実現しています。
      </div>
    </>
  )
}

/* =========================================
   Step 5: パディング（PKCS#7）とパディング・オラクル攻撃
   ========================================= */
function PaddingAndOracle() {
  return (
    <>
      <p>
        AESは128ビット（16バイト）単位でデータを処理します。
        平文の長さが16の倍数でない場合、<strong>パディング</strong>で末尾を埋める必要があります。
        最も広く使われているのが<strong>PKCS#7パディング</strong>です。
      </p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>PKCS#7パディングの規則</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            不足バイト数 = N とすると、N の値を N バイト分追加する
          </div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            例1: &quot;Hello&quot; (5バイト) → 不足11バイト
          </div>
          <div>
            [48 65 6C 6C 6F <strong>0B 0B 0B 0B 0B 0B 0B 0B 0B 0B 0B</strong>]
          </div>
          <div style={{ marginTop: 'var(--spacing-xs)' }}>
            例2: &quot;AES-128 block!&quot; (14バイト) → 不足2バイト
          </div>
          <div>
            [41 45 53 2D 31 32 38 20 62 6C 6F 63 6B 21 <strong>02 02</strong>]
          </div>
          <div style={{ marginTop: 'var(--spacing-xs)' }}>
            例3: ぴったり16バイトの場合 → 16バイト全部パディング
          </div>
          <div>
            [データ16バイト] [<strong>10 10 10 ... 10</strong>] (0x10 = 16)
          </div>
          <div style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-text-subtle)' }}>
            ※ ぴったり16の倍数でも必ず1ブロック追加する。
          </div>
          <div style={{ color: 'var(--color-text-subtle)' }}>
            　復号時に「最終バイトの値 = パディング長」で確実に除去するため。
          </div>
        </div>
      </div>

      <p>
        パディングの仕組みは単純ですが、CBCモードと組み合わさると
        <strong>パディング・オラクル攻撃</strong>という深刻な脆弱性を生みます。
      </p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>パディング・オラクル攻撃の原理</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            1. 攻撃者が暗号文の一部を改ざんしてサーバーに送信
          </div>
          <div>
            2. サーバーが復号を試行:
          </div>
          <div>
            　 - パディングが不正 → &quot;Padding Error&quot; を返す
          </div>
          <div>
            　 - パディングが正しい → &quot;OK&quot; or &quot;MAC Error&quot; を返す
          </div>
          <div>
            3. このYes/No応答（オラクル）を使って、
          </div>
          <div>
            　 暗号文を1バイトずつ変えながら平文を特定
          </div>
          <div>
            4. 1ブロック(16バイト)の復元に最大 16 x 256 = 4096回の問い合わせ
          </div>
        </div>
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>実際の被害事例</h3>
          <ul>
            <li><strong>2010年 ASP.NET:</strong> Webアプリケーションの暗号化Cookieが解読される脆弱性（CVE-2010-3332）</li>
            <li><strong>2013年 Lucky Thirteen:</strong> TLS CBC実装のタイミング差を利用した変種（CVE-2013-0169）</li>
            <li><strong>2014年 POODLE:</strong> SSL 3.0のCBCパディング処理の欠陥（CVE-2014-3566）</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>根本的な対策</h3>
          <ul>
            <li><strong>AEADモードを使う</strong>（AES-GCM, ChaCha20-Poly1305）</li>
            <li>認証タグの検証が先に行われるため、パディング判定に到達しない</li>
            <li>CBCを使う場合は<strong>Encrypt-then-MAC</strong>を適用</li>
            <li>エラーメッセージを一律にする（タイミング差も排除）</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>教訓:</strong>
        パディング・オラクル攻撃は「暗号化しただけで安全」という誤解の象徴です。
        暗号文の<strong>完全性（改ざん検知）</strong>が保証されなければ、
        機密性すら破られてしまいます。これがAEAD（認証付き暗号）が必須とされる理由です。
      </div>
    </>
  )
}

/* =========================================
   Step 6: ブロックモード — ECB, CBC, CTR, GCM
   ========================================= */
function BlockModes() {
  return (
    <>
      <p>
        AESは128ビット単位でデータを処理するブロック暗号です。
        長いメッセージを安全に暗号化するには<strong>モード</strong>の選択が決定的に重要です。
        モードの選択を誤ると、AES自体の強度に関係なく暗号が無力化されます。
      </p>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>ECB（Electronic Codebook）</h3>
          <ul>
            <li>ブロックごとに独立して暗号化</li>
            <li>同じ平文ブロック → 同じ暗号文</li>
            <li>パターンが露出するため<strong>使用禁止</strong></li>
            <li>並列処理は可能だが安全性が致命的</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>CBC（Cipher Block Chaining）</h3>
          <ul>
            <li>前の暗号文とXORしてから暗号化</li>
            <li>IVをランダム生成するのが必須</li>
            <li>パディング・オラクル攻撃に注意（Step 5参照）</li>
            <li>暗号化は逐次処理（復号は並列化可能）</li>
          </ul>
        </div>
      </div>
      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>CTR（Counter）</h3>
          <ul>
            <li>Nonce+カウンタを暗号化して鍵ストリームを生成</li>
            <li>鍵ストリームと平文のXORで暗号化（ストリーム暗号化）</li>
            <li>暗号化・復号ともに完全並列化可能</li>
            <li>認証がないため単体では改ざん検知不可</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>GCM（Galois/Counter Mode）</h3>
          <ul>
            <li>CTR + GHASH で認証付き暗号（AEAD）</li>
            <li>暗号化と同時に認証タグを生成</li>
            <li>AAD（追加認証データ）でヘッダーも保護可能</li>
            <li><strong>TLS 1.3 の標準構成</strong></li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>モード選択のフローチャート</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            認証（改ざん検知）が必要か？
          </div>
          <div>├ Yes → <strong>AES-GCM</strong>（第一選択）</div>
          <div>│　　　　 or ChaCha20-Poly1305（AES-NI非対応環境）</div>
          <div>└ 教育/研究目的のみ</div>
          <div>　├ パターン秘匿が必要 → CBC or CTR</div>
          <div>　└ ECBは<strong>一切使用しない</strong></div>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>Nonce再利用の禁忌:</strong>
        CTRやGCMでNonce（IV）を再利用すると、同じ鍵ストリームが生成され
        C<sub>1</sub> XOR C<sub>2</sub> = M<sub>1</sub> XOR M<sub>2</sub> となり平文の情報が漏洩します。
        GCMではさらにGHASH鍵Hも復元され、認証タグの偽造が可能になります。
        実務では毎回 <code>crypto.getRandomValues()</code> でIVを生成してください。
      </div>
    </>
  )
}

/* =========================================
   Step 7: AES-GCMの使い方
   Symmetric.tsxのGCM数学的詳細と重複しない — ここでは実用に焦点
   ========================================= */
function AESGCMUsage() {
  return (
    <>
      <p>
        AES-GCMは<strong>AEAD（Authenticated Encryption with Associated Data）</strong>の代表格です。
        共通鍵暗号ページではGHASHの数学（GF(2<sup>128</sup>)上の多項式演算）を詳しく解説しています。
        ここでは<strong>AES-GCMを正しく使うための実践知識</strong>に焦点を当てます。
      </p>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>AES-GCMの入出力</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            入力:
          </div>
          <div>  - 鍵 K（128/192/256ビット）</div>
          <div>  - IV / Nonce（推奨96ビット = 12バイト）</div>
          <div>  - 平文 P（任意長）</div>
          <div>  - AAD（追加認証データ、任意長、暗号化されない）</div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            出力:
          </div>
          <div>  - 暗号文 C（平文と同じ長さ）</div>
          <div>  - 認証タグ T（128ビット）</div>
          <div style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-text-subtle)' }}>
            送信データ = IV || C || T （IVは秘密にする必要なし）
          </div>
        </div>
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>AAD（追加認証データ）の活用</h3>
          <ul>
            <li><strong>TLS:</strong> レコードヘッダ（プロトコルバージョン、長さ等）をAADに</li>
            <li><strong>データベース:</strong> レコードIDをAADに、データ本体を暗号化</li>
            <li><strong>API:</strong> HTTPヘッダをAADに、ボディを暗号化</li>
            <li>AADは暗号化されないが、改ざんは検知される</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>GCM利用時の制約</h3>
          <ul>
            <li><strong>IV長:</strong> 96ビット推奨。他の長さも可能だが内部でGHASHされるためコスト増</li>
            <li><strong>同一鍵でのIV衝突:</strong> 絶対禁止。96ビットランダムなら2<sup>32</sup>回まで安全</li>
            <li><strong>暗号化データ量上限:</strong> 1つの(鍵,IV)ペアで約64GB</li>
            <li><strong>鍵ローテーション:</strong> 2<sup>32</sup>メッセージを超えたら鍵を更新</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>Web Crypto API でのAES-GCM利用例（概念コード）</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            // 鍵生成
          </div>
          <div>const key = await crypto.subtle.generateKey(</div>
          <div>{'  '}{'{'}algorithm: &quot;AES-GCM&quot;, length: 256{'}'}, true, [&quot;encrypt&quot;, &quot;decrypt&quot;]</div>
          <div>)</div>
          <div style={{ marginTop: 'var(--spacing-xs)' }}>
            // 暗号化（IVは毎回ランダム生成）
          </div>
          <div>const iv = crypto.getRandomValues(new Uint8Array(12))</div>
          <div>const ct = await crypto.subtle.encrypt(</div>
          <div>{'  '}{'{'}name: &quot;AES-GCM&quot;, iv, additionalData: aad{'}'}, key, plaintext</div>
          <div>)</div>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>GCM vs CBC+HMAC:</strong>
        AES-GCMは暗号化と認証を1パスで処理するため、
        CBC+HMAC（Encrypt-then-MAC）の約半分の計算量で同等の安全性を実現します。
        さらにGCMはCTRベースなので暗号化・復号ともに並列化可能です。
        新規実装では常にAES-GCMを第一選択としてください。
      </div>
    </>
  )
}

/* =========================================
   Step 8: 暗号化/復号デモ（既存ロジック維持）
   ========================================= */
function EncryptDecryptDemo() {
  const [plaintext, setPlaintext] = useState('Hello, AES!')
  const [key, setKey] = useState<Uint8Array>(generateRandomKey(128))
  const [keySize, setKeySize] = useState<128 | 192 | 256>(128)
  const [mode, setMode] = useState<AESMode>('CBC')
  const [ciphertext, setCiphertext] = useState<Uint8Array | null>(null)
  const [iv, setIv] = useState<Uint8Array | null>(null)
  const [decrypted, setDecrypted] = useState('')
  const [error, setError] = useState('')

  const handleGenerateKey = () => {
    const newKey = generateRandomKey(keySize)
    setKey(newKey)
    setCiphertext(null)
    setIv(null)
    setDecrypted('')
  }

  const handleEncrypt = () => {
    try {
      setError('')
      const result = encrypt(plaintext, key, mode)
      setCiphertext(result.ciphertext)
      setIv(result.iv || null)
      setDecrypted('')
    } catch (error) {
      setError(`暗号化エラー: ${error}`)
    }
  }

  const handleDecrypt = () => {
    if (!ciphertext) {
      setError('まず暗号化を実行してください')
      return
    }
    try {
      setError('')
      const result = decrypt(ciphertext, key, mode, iv || undefined)
      setDecrypted(result)
    } catch (error) {
      setError(`復号エラー: ${error}`)
    }
  }

  return (
    <>
      <p>
        鍵長とモードを選んで暗号化/復号を実行しましょう。
        ECBでは同じ平文ブロックが同じ暗号文になること、CBC/CTRではIV/Nonceが生成されることを確認してください。
      </p>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>

        <label>鍵長:</label>
        <div className="step-lesson__demo-radio-group">
          {([128, 192, 256] as const).map((size) => (
            <label key={size}>
              <input
                type="radio"
                name="keySize"
                value={size}
                checked={keySize === size}
                onChange={(e) => setKeySize(Number(e.target.value) as 128 | 192 | 256)}
              />
              {' '}AES-{size}
            </label>
          ))}
        </div>

        <button
          type="button"
          className="step-lesson__demo-btn step-lesson__demo-btn--secondary"
          onClick={handleGenerateKey}
        >
          ランダム鍵を再生成
        </button>

        <label>現在の鍵（16進表記）:</label>
        <div className="step-lesson__demo-result">{bytesToHex(key)}</div>

        <label>ブロックモード:</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as AESMode)}
        >
          <option value="CBC">CBC</option>
          <option value="CTR">CTR</option>
          <option value="ECB">ECB</option>
        </select>

        {mode === 'ECB' && (
          <div className="step-lesson__callout">
            ECBはパターンがそのまま漏れるので学習用途以外では使用禁止です。
          </div>
        )}

        <label>平文:</label>
        <textarea
          rows={3}
          value={plaintext}
          onChange={(e) => setPlaintext(e.target.value)}
          placeholder="Hello, AES!"
        />

        <div className="step-lesson__demo-actions">
          <button
            type="button"
            className="step-lesson__demo-btn step-lesson__demo-btn--primary"
            onClick={handleEncrypt}
          >
            暗号化
          </button>
          <button
            type="button"
            className="step-lesson__demo-btn step-lesson__demo-btn--secondary"
            onClick={handleDecrypt}
            disabled={!ciphertext}
          >
            復号
          </button>
        </div>

        {ciphertext && (
          <>
            <label>暗号文（16進数）:</label>
            <div className="step-lesson__demo-result">{bytesToHex(ciphertext)}</div>
            {iv && (
              <>
                <label>{mode === 'CTR' ? 'Nonce' : 'IV'}:</label>
                <div className="step-lesson__demo-result">{bytesToHex(iv)}</div>
              </>
            )}
          </>
        )}

        {error && <p className="step-lesson__demo-result" style={{ color: 'var(--color-danger)' }}>{error}</p>}

        {decrypted && (
          <>
            <label>復号結果:</label>
            <div className="step-lesson__demo-result">{decrypted}</div>
            {decrypted === plaintext && (
              <div className="step-lesson__callout">入力と一致しました。正しく復号されています。</div>
            )}
          </>
        )}
      </div>
    </>
  )
}

/* =========================================
   Step 9: モード比較（ECBの危険性を可視化）
   既存ロジック維持
   ========================================= */
function ModeComparisonDemo() {
  const [compareText, setCompareText] = useState('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
  const [ecbResult, setEcbResult] = useState('')
  const [cbcResult, setCbcResult] = useState('')
  const [ctrResult, setCtrResult] = useState('')
  const [error, setError] = useState('')

  const handleCompare = () => {
    try {
      setError('')
      const compareKey = generateRandomKey(128)
      const ecbEncrypted = encrypt(compareText, compareKey, 'ECB')
      setEcbResult(bytesToHex(ecbEncrypted.ciphertext))
      const cbcEncrypted = encrypt(compareText, compareKey, 'CBC')
      setCbcResult(bytesToHex(cbcEncrypted.ciphertext))
      const ctrEncrypted = encrypt(compareText, compareKey, 'CTR')
      setCtrResult(bytesToHex(ctrEncrypted.ciphertext))
    } catch (error) {
      setError(`エラー: ${error}`)
    }
  }

  /* Split hex string into 32-char (16-byte = 1 block) chunks for visual comparison */
  const splitBlocks = (hex: string) => {
    const chunks: string[] = []
    for (let i = 0; i < hex.length; i += 32) {
      chunks.push(hex.slice(i, i + 32))
    }
    return chunks
  }

  return (
    <>
      <p>
        同じ繰り返しパターンの平文を各モードで暗号化すると、ECBの弱点が一目瞭然です。
        ECBでは<strong>同じ平文ブロックが同じ暗号文ブロック</strong>になりますが、CBC/CTRではすべてのブロックが異なります。
      </p>

      <div className="step-lesson__demo">
        <span className="step-lesson__demo-label">INTERACTIVE</span>

        <label>繰り返しパターンの平文:</label>
        <input
          type="text"
          value={compareText}
          onChange={(e) => setCompareText(e.target.value)}
          placeholder="AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
        />

        <button
          type="button"
          className="step-lesson__demo-btn step-lesson__demo-btn--primary"
          onClick={handleCompare}
        >
          各モードで暗号化
        </button>

        {error && <p className="step-lesson__demo-result" style={{ color: 'var(--color-danger)' }}>{error}</p>}

        {ecbResult && (
          <div className="step-lesson__comparison">
            <div className="step-lesson__comparison-item">
              <h3>ECB</h3>
              <p><strong>同じブロックが同じ暗号文になる:</strong></p>
              {splitBlocks(ecbResult).map((block, i) => (
                <div key={i} className="step-lesson__demo-result">{block}</div>
              ))}
            </div>
            <div className="step-lesson__comparison-item">
              <h3>CBC</h3>
              <p><strong>チェインにより各ブロックが変化:</strong></p>
              {splitBlocks(cbcResult).map((block, i) => (
                <div key={i} className="step-lesson__demo-result">{block}</div>
              ))}
            </div>
          </div>
        )}

        {ctrResult && (
          <div className="step-lesson__comparison">
            <div className="step-lesson__comparison-item">
              <h3>CTR</h3>
              <p><strong>疑似ストリーム暗号。Nonce再利用厳禁:</strong></p>
              {splitBlocks(ctrResult).map((block, i) => (
                <div key={i} className="step-lesson__demo-result">{block}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="step-lesson__callout">
        <strong>注目:</strong> ECBの結果を見ると、同じ内容の平文ブロックがまったく同じ暗号文になっていることが分かります。
        これは画像を暗号化した場合に輪郭が見えてしまう「ECBペンギン問題」として有名です。
        実務では<strong>ECBは一切使用せず</strong>、AES-GCM を第一選択としてください。
      </div>
    </>
  )
}

/* =========================================
   Step 10 (概念上のStep 10だがindex上は9番目):
   AESの実世界での利用と量子時代への展望
   ========================================= */
function RealWorldAES() {
  return (
    <>
      <p>AESは現代のインターネットとデータ保護の基盤として、あらゆる場所で使われています。</p>
      <ul>
        <li>
          <strong>TLS / HTTPS</strong> — Webブラウザとサーバーの通信を保護。
          ECDHで共通鍵を共有 → HKDFでAES-GCM用の鍵を導出 → AESで高速に暗号化、というハイブリッド構成。
        </li>
        <li>
          <strong>ディスク暗号化</strong> — FileVault（macOS）、BitLocker（Windows）、LUKS（Linux）が
          AES-XTSモードでストレージ全体を保護。
        </li>
        <li>
          <strong>VPN / SSH</strong> — トンネリングされた通信の中身をAES-GCMで暗号化。
        </li>
        <li>
          <strong>モバイルアプリ</strong> — iOSのデータ保護API、AndroidのKeyStoreがAES-256を利用。
        </li>
        <li>
          <strong>クラウドストレージ</strong> — AWS S3、Google Cloud Storageが保存時暗号化（at-rest encryption）にAES-256-GCMを利用。
        </li>
      </ul>

      <div className="step-lesson__visual">
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', lineHeight: '2.2', textAlign: 'left', display: 'inline-block' }}>
          <div><strong>TLS 1.3 の暗号スイート例</strong></div>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            TLS_AES_256_GCM_SHA384
          </div>
          <div>
            │　　│　　│　　└─ 鍵導出ハッシュ (HKDF)
          </div>
          <div>
            │　　│　　└─ ブロックモード (Galois/Counter)
          </div>
          <div>
            │　　└─ 鍵長 (256ビット)
          </div>
          <div>
            └─ ブロック暗号 (AES)
          </div>
          <div style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-text-subtle)' }}>
            鍵交換はECDHE（別途ネゴシエーション）
          </div>
        </div>
      </div>

      <div className="step-lesson__comparison">
        <div className="step-lesson__comparison-item">
          <h3>AES-NI（ハードウェア加速）</h3>
          <ul>
            <li>Intel/AMDのCPU命令セット（2010年〜）</li>
            <li>S-Boxを命令レベルで処理しサイドチャネル攻撃を防止</li>
            <li>ソフトウェア実装比で<strong>10倍以上</strong>の高速化</li>
            <li>AES-GCMで10 Gbps以上のスループット</li>
          </ul>
        </div>
        <div className="step-lesson__comparison-item">
          <h3>量子時代への備え</h3>
          <ul>
            <li>Groverのアルゴリズム: 鍵探索を平方根に高速化</li>
            <li>AES-128 → 64ビット安全性に低下</li>
            <li>AES-256 → 128ビット安全性（十分に安全）</li>
            <li>NISTは長期データにはAES-256を推奨</li>
          </ul>
        </div>
      </div>

      <div className="step-lesson__callout">
        <strong>まとめ — AESを正しく使うための鉄則:</strong><br />
        (1) モードはAES-GCMを第一選択。ECBは絶対に使わない。<br />
        (2) IVは毎回ランダム生成。再利用は暗号の完全崩壊を招く。<br />
        (3) 鍵長は用途に応じてAES-128（高速）またはAES-256（長期保護）。<br />
        (4) 鍵はCSPRNGで生成し、KMSで管理。ソースコードにハードコードしない。<br />
        (5) パディング・オラクル攻撃を防ぐため、AEADモードを使い認証を必ず行う。
      </div>
    </>
  )
}

/* =========================================
   メインコンポーネント
   ========================================= */
export default function AESPage() {
  usePageMeta({ title: 'AES暗号', description: 'AESの内部構造、S-Box、暗号利用モードを詳しく学ぶ' })

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  const steps: LessonStep[] = [
    {
      title: 'DESからAESへ — 標準暗号の世代交代',
      content: <DEStoAESHistory />,
      quiz: {
        question: 'DESが安全でなくなった最大の理由は？',
        options: [
          { label: 'Feistelネットワーク自体に脆弱性があったから' },
          { label: '鍵長56ビットが短すぎ、総当たり探索が現実的になったから', correct: true },
          { label: 'S-Boxの設計にバックドアが発見されたから' },
          { label: 'ブロックサイズが大きすぎて実装が困難だったから' },
        ],
        explanation: '正解！DESの鍵長56ビット（約7.2 x 10^16通り）は、1998年にEFFのDeep Crackが56時間で全鍵探索に成功したことで、実用的な安全性を失いました。AESは最小でも128ビット鍵（2^128通り）を採用し、この問題を根本的に解決しています。',
      },
    },
    {
      title: 'AES全体構造 — SPN構造',
      content: <OverallStructure />,
      quiz: {
        question: 'AESの1ラウンドに含まれない操作はどれ？',
        options: [
          { label: 'SubBytes（S-Boxによる非線形変換）' },
          { label: 'ShiftRows（行の左シフト）' },
          { label: 'FeistelNetwork（半分に分割して交差）', correct: true },
          { label: 'AddRoundKey（ラウンド鍵とXOR）' },
        ],
        explanation: '正解！AESはSPN構造であり、Feistelネットワークは使いません。Feistel構造はDESで採用されていた方式です。AESは SubBytes / ShiftRows / MixColumns / AddRoundKey の4操作を繰り返し、毎ラウンドで全128ビットを変換します。',
      },
    },
    {
      title: 'SubBytesの深掘り — S-Boxの数学的設計',
      content: <SubBytesDeepDive />,
      quiz: {
        question: 'AESのS-BoxがGF(2^8)の逆数を基にしている理由は？',
        options: [
          { label: '計算が高速だから' },
          { label: 'ハードウェア実装が容易だから' },
          { label: '線形近似確率と差分確率を同時に最小化するため', correct: true },
          { label: 'DESのS-Boxと互換性を保つため' },
        ],
        explanation: '正解！GF(2^8)上の逆数写像は、線形攻撃の線形近似確率（最大2^-3）と差分攻撃の差分確率（最大2^-6）を同時に最小化する、暗号学的に最適な非線形関数です。さらにアフィン変換を加えることで代数的攻撃への耐性も確保しています。',
      },
    },
    {
      title: 'ShiftRows / MixColumns — 拡散の仕組み',
      content: <DiffusionLayers />,
      quiz: {
        question: 'AESで「2ラウンドで1バイトの変化が全16バイトに波及する」ことを何と呼ぶ？',
        options: [
          { label: 'Full Confusion' },
          { label: 'Full Diffusion', correct: true },
          { label: 'Avalanche Effect（雪崩効果）の完了' },
          { label: 'Complete Substitution' },
        ],
        explanation: '正解！ShiftRowsが異なる列にバイトを分散させ、MixColumnsのMDS行列（Branch Number = 5）が各列内のバイトを混合することで、わずか2ラウンドで入力の1バイトの変化が出力の全16バイトに波及します。これをFull Diffusionと呼びます。',
      },
    },
    {
      title: 'パディング（PKCS#7）と攻撃',
      content: <PaddingAndOracle />,
      quiz: {
        question: 'パディング・オラクル攻撃の根本的な対策は？',
        options: [
          { label: 'パディングをランダムな値にする' },
          { label: 'エラーメッセージを暗号化して返す' },
          { label: 'AES-GCMなどのAEADモードを使い、復号前に認証タグで改ざんを検知する', correct: true },
          { label: '鍵長を256ビットに拡張する' },
        ],
        explanation: '正解！AEADモード（AES-GCM等）では認証タグの検証が復号の前に行われるため、改ざんされた暗号文はパディング処理に到達する前に拒否されます。パディング・オラクル攻撃はそもそも成立しません。',
      },
    },
    {
      title: 'ブロックモード: ECB, CBC, CTR, GCM',
      content: <BlockModes />,
      quiz: {
        question: 'ECBモードが危険な理由は？',
        options: [
          { label: '暗号化速度が遅すぎるから' },
          { label: '鍵長が短くなるから' },
          { label: '同じ平文ブロックが同じ暗号文になり、パターンが漏れるから', correct: true },
          { label: 'IVが必要だが生成が難しいから' },
        ],
        explanation: '正解！ECBは各ブロックを独立に暗号化するため、同じ内容の平文ブロックはすべて同じ暗号文になります。これによりデータのパターン（画像の輪郭など）がそのまま露出してしまいます（「ECBペンギン問題」）。',
      },
    },
    {
      title: 'AES-GCMの使い方',
      content: <AESGCMUsage />,
      quiz: {
        question: 'AES-GCMのAAD（追加認証データ）の特徴は？',
        options: [
          { label: '暗号化も認証もされる' },
          { label: '暗号化されないが、改ざんは認証タグで検知される', correct: true },
          { label: '暗号化されるが、認証はされない' },
          { label: '暗号化も認証もされない（メタデータのみ）' },
        ],
        explanation: '正解！AADは暗号化されず平文のまま送信されますが、GHASHの計算に含まれるため、改ざんされると認証タグの検証が失敗します。TLSではレコードヘッダ（プロトコルバージョン等）をAADとして保護しています。',
      },
    },
    {
      title: 'ハンズオン: AES暗号化/復号',
      content: <EncryptDecryptDemo />,
    },
    {
      title: 'モード比較: ECBの弱点を可視化',
      content: <ModeComparisonDemo />,
    },
    {
      title: 'AESの実世界での活用と展望',
      content: <RealWorldAES />,
      quiz: {
        question: '量子コンピュータ時代に備えたAESの推奨鍵長は？',
        options: [
          { label: 'AES-128（Grover攻撃後も64ビット安全性で十分）' },
          { label: 'AES-192（中間的な安全性）' },
          { label: 'AES-256（Grover攻撃後も128ビット安全性を維持）', correct: true },
          { label: 'AESは量子コンピュータに対して無力なので使うべきでない' },
        ],
        explanation: '正解！Groverのアルゴリズムは鍵探索を平方根に高速化しますが、AES-256なら128ビット安全性が残り、十分に安全です。RSAやECDHのような公開鍵暗号はShorのアルゴリズムで完全に破られますが、AESのような対称鍵暗号は鍵長を倍にすれば量子時代にも耐えます。',
      },
    },
  ]

  return (
    <main className="page aes">
      <StepLesson
        lessonId="aes"
        title="AES 対称鍵暗号"
        steps={steps}
      />
    </main>
  )
}
