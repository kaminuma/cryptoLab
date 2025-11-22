# CryptoLab (React版)

**公開URL:** https://cryptolab-8xw.pages.dev/

古典暗号から WebCrypto／PQC への流れをローカルで「触って理解する」ための最小実験アプリ。React + Vite + TypeScript で構築し、サイト公開を見据えたホーム／ラボ／解説ページを備えています。

## 最短セットアップ（5ステップ）

1. `npm create vite@latest cryptolab -- --template react-ts`
2. `cd cryptolab && npm i`
3. `npm i echarts @noble/curves @noble/hashes`
4. 下記の `src/` 構成（3画面＋lib）をざっと作る
5. `npm run dev` で走らせながら画面ごとに機能追加

## 最小ディレクトリ

```
src/
├ App.tsx             # ルーティング & ナビゲーション
├ main.tsx            # React 版エントリ
├ pages/
│ ├ Home.tsx          # ヒーロー・特徴・ロードマップ
│ ├ Labs.tsx          # タブ切替: 古典 / 共通鍵 / 公開鍵
│ ├ Classical.tsx     # シーザー＋ヴィジュネル＋頻度グラフ
│ ├ Symmetric.tsx     # AES-GCM デモ
│ ├ PublicKey.tsx     # ECDH→HKDF→AES デモ
│ ├ RSA.tsx           # 2048-bit RSA 鍵生成デモ
│ ├ Learn.tsx         # 理論解説と参考リンク
│ └ PQC.tsx           # ポスト量子ロードマップ
└ lib/
  ├ classical/
  │ ├ caesar.ts
  │ └ vigenere.ts
  └ crypto/
    ├ webcrypto.ts
    └ ecdh.ts
```

## 主要機能

- 古典: シーザー／ヴィジュネル／アトバッシュなど、カタログから選んで即デモ実行。
- 共通鍵: Passphrase から SHA-256 でキー化 → AES-GCM 暗号／復号。IV・暗号文を Base64 表示。
- 公開鍵: P-256 ECDH → HKDF → AES-GCM の一連デモ。共有秘密の一致表示、塩/info 設定、ログ表示。
- RSA: ブラウザ内で 2048bit 級の RSA キーを生成し、p / q / N / d を確認（学習用途）。
- サイト全体: Home / Learn / PQC ページでロードマップや参考リンクを提供し、外部公開に備えた情報設計を追加。

## 提供済みスニペット

`lib/` 以下に貼り付ければOK:

- `lib/classical/caesar.ts`, `lib/classical/vigenere.ts`
- `lib/crypto/webcrypto.ts`（AES-GCM/HKDF ラッパー）
- `lib/crypto/ecdh.ts`（P-256 の ECDH デモ）

## ガードレール

- ECB は出さない（解説が必要なら赤字などで警告を添える）。
- IV の再利用は禁止。生成して見せるだけ。
- 長文やファイル暗号は対象外。短文デモに集中。
- PQC（Kyber/Dilithium）は 3 画面完成後に追加（WASM 導入は後回し）。

## 次にやること

1. PQC タブの実装（Kyber/Dilithium 図解、WASM サンプル）。 
2. RSA デモの生成時間短縮（Web Worker 化）と安全性ガイドの拡充。
3. ナビ／ヒーローの英語版テキスト、OGP 画像、SEO メタ追加。
4. デプロイ（Vercel/Netlify）用 CI 設定とパフォーマンス最適化（ECharts 遅延ロード等）。

## Analytics & Fork Policy

### Google Analytics
このプロジェクトは Google Analytics (GA4) を使用してアクセス解析を行っています。  
測定ID: `G-3Q5PQ24SGG`

**フォークする場合:**
- `index.html` 内の GA タグを削除するか、ご自身の測定IDに書き換えてください
- このIDのまま使用すると、元プロジェクトのアナリティクスにデータが送信されます

### Fork について
このプロジェクトをフォークする際は、以下をお願いします：
- 可能であれば事前にご一報ください（任意ですが歓迎します）
- 上記 GA IDの変更をお忘れなく

**連絡先:** kaminuma.dev@gmail.com

## ライセンス
MIT License
