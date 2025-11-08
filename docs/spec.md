# CryptoLab 仕様書

## 1. 目的

- 古典暗号と WebCrypto ベースの現代暗号をスマホでも触れる形で比較体験できるようにする。
- シーザー／ヴィジュネル／AES-GCM／ECDH→HKDF→AES のハンズオンをバックエンド不要で提供する。
- 将来的な PQC（Kyber/Dilithium）導入の足場を作り、UX が固まった後に拡張しやすくする。

## 2. 技術スタック

- Vite + React + TypeScript（`create-vite` の react-ts テンプレート）。
- 依存ライブラリ: `echarts`, `@noble/curves`, `@noble/hashes`。
- 対象ブラウザ: WebCrypto を利用できる最新の PC／モバイルブラウザ。

## 3. UX の全体像

- `App.tsx` が `古典 / 共通鍵 / 公開鍵` の 3 タブを描画（React Hooks で状態管理）。
- 各タブは `src/pages/` 配下の関数コンポーネントをレンダリング。
- モバイル優先の縦積みレイアウト。フォームと結果欄はスクロール最小化を意識。

## 4. 機能要件

### 4.1 古典画面（`src/pages/Classical.tsx`）

- 入力:
  - 平文テキストエリア。
  - シーザー用のシフト（-25〜25、スライダーまたは数値入力）。
  - ヴィジュネル用キーワード（英文字のみ）。
- 操作:
  - `暗号化` / `復号` ボタンで選択中の暗号処理を実行。
  - `頻度表示` ボタンで A〜Z の文字頻度棒グラフを表示／非表示。
- 出力:
  - 暗号文／平文エリア。
  - ECharts の棒グラフ（初回表示時に `echarts.init`）。
- 実装メモ:
  - `lib/classical/caesar.ts` と `lib/classical/vigenere.ts` を利用。
  - 頻度データは最新の出力テキストから計算し、`useMemo` で再計算を抑制。
  - ECharts の初期化／dispose は `useEffect` + `useRef` で管理。

### 4.2 共通鍵画面（`src/pages/Symmetric.tsx`）

- 入力:
  - 平文テキストエリア。
  - パスフレーズ入力（`TextEncoder` でバイト列化し、そのままデモ用キーに使用）。
- 操作:
  - `暗号化`: `aesGcmEncrypt` を呼び出し、自動生成 IV・暗号文を Base64 で表示。
  - `復号`: Base64 の IV／暗号文を受け取り `aesGcmDecrypt` で平文復元。
- 出力:
  - IV と暗号文（それぞれ Base64 表示）。
  - 復号した平文。
- 実装メモ:
  - `lib/crypto/webcrypto.ts` を利用。
  - ブラウザ用 Base64 ヘルパーを併設。
  - 暗号化のたびに IV を再生成し、暗号結果とセットで保持する。

### 4.3 公開鍵画面（`src/pages/PublicKey.tsx`）

- フロー:
  1. `ecdhDeriveSecret` で A/B の鍵ペア生成。
  2. 共有秘密 `za`/`zb` を導出し、同一であることを表示。
  3. 共有秘密を `hkdf`（ランダム塩＋固定 info）に投入して AES キー化。
  4. 派生キーで短文を AES-GCM 暗号化／復号。
- 入力:
  - 暗号化したい短文テキストエリア。
  - 任意の salt/info（デフォルト値あり）。
- 操作:
  - `鍵共有を実行`: 鍵生成〜HKDF までを一括実行。
  - `暗号化` / `復号`: 派生済みキーを使って AES-GCM を呼び出す。
- 出力:
  - 各公開鍵・共有秘密（ハッシュ）・IV・暗号文を Base64 で表示。
  - 共有秘密が一致していることを示すバッジやメッセージ。

## 5. ライブラリ構成

```
src/lib/
├ classical/
│ ├ caesar.ts        # caesarEncrypt/Decrypt
│ └ vigenere.ts      # vigenereEncrypt/Decrypt
└ crypto/
  ├ webcrypto.ts     # aesGcmEncrypt / aesGcmDecrypt / hkdf
  └ ecdh.ts          # ecdhDeriveSecret
```

- 上記ファイルは提供スニペットをそのまま利用。
- Base64 変換などのユーティリティは必要に応じて同階層へ追加。

## 6. UI/UX 留意点

- ラベル付き入力を縦方向に揃え、タブで画面遷移を明示。
- ボタン表記は日本語（`暗号化`、`復号` など）で統一。
- IV／暗号文の近くに「IVは自動生成・再利用禁止」といった注意書きを表示。
- 頻度グラフは表示要望があるまで描画しない（モバイルの負荷対策）。

## 7. 非目標・ガードレール

- ECB のデモは行わない（言及が必要な場合は赤警告付き）。
- IV の再利用を禁止。IV と暗号文が揃うまで復号ボタンを無効化してもよい。
- 対象は短文テキストのみ。ファイル暗号や大量データ処理は範囲外。
- PQC（Kyber/Dilithium）は 3 画面完成後に検討。WASM 導入は後工程。

## 8. ロードマップ（直近）

1. `Classical.tsx`：React 版のフォーム＋シーザー/ヴィジュネル切替＋頻度グラフ（完了済み）。
2. `Symmetric.tsx`：AES-GCM の暗号/復号フローと Base64表示を実装。
3. `PublicKey.tsx`：ECDH→HKDF→AES-GCM の一連デモを構築。

将来タスク: PQC プレイグラウンド（WASM）追加、可視化強化、コピー共有機能、テスト拡充など。
