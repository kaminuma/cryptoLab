# CryptoLab

**https://cryptolab-8xw.pages.dev/**

暗号技術を「触って理解する」インタラクティブ学習サイト。古典暗号からポスト量子暗号まで、ブラウザ上でデモを動かしながら学べます。

## 学習コンテンツ

| カテゴリ | 内容 |
|---------|------|
| 古典暗号 | シーザー、ヴィジュネル、アトバッシュ、転置暗号、エニグマシミュレータ |
| 共通鍵暗号 | AES-GCM、AEAD、IV管理、パディングオラクル攻撃 |
| 公開鍵暗号 | ECDH鍵交換、ECDSA署名、PKI |
| RSA | 鍵生成、OAEP、PSS署名、前方秘匿性 |
| ハッシュ | SHA-256内部構造、Merkle-Damgård構造、SHA-3比較 |
| PQC | Shor/Groverアルゴリズム、格子暗号、Kyber/Dilithium |

## ツール

- **進数変換** — 2進/10進/16進/Base64の相互変換
- **ハッシュクラッカー** — ブルートフォースによるハッシュ解析デモ
- **XOR暗号化** — XOR演算の可視化

## 技術スタック

- React 18 + TypeScript + Vite
- WebCrypto API（AES-GCM / ECDH / RSA）
- ECharts（頻度分析グラフ）
- Cloudflare Pages

## セットアップ

```bash
bun install
bun dev
```

## テスト

```bash
bun test
```

## ライセンス

MIT
