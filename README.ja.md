# Web2MD-FeedAI - AI向けWebページMarkdown変換ブラウザ拡張機能

<p align="center">
  <img src="public/images/banner.jpg" alt="Web2MD-FeedAI Banner" width="100%">
</p>

<p align="center">
  <a href="./README.md">简体中文</a> | <a href="./README.en.md">English</a> | <a href="./README.zh-TW.md">繁體中文</a> | <b>日本語</b> | <a href="./README.ru.md">Русский</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-Manifest_V3-4285F4?logo=googlechrome&logoColor=white" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Version-1.0.0-00C7B7" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg" alt="PRs Welcome">
</p>

> **Web2MD-FeedAI の唯一の目的は生産性の向上です。Webページの選択範囲またはページ全体の記事本文を、大規模言語モデル（LLM/AI）に最適化された高品質で構造化されたMarkdownに変換し、Chromeのネイティブサイドパネルを通じてリアルタイムプレビュー、編集、およびワンクリックコピーを提供します。**

---

## 📸 スクリーンショット (Screenshots)

<table align="center" width="100%">
  <tr>
    <td align="center" width="33%">
      <img src="public/images/screenshot_1.png" alt="テキスト選択＆フローティングバー" width="100%">
      <br>
      <b>🎯 選択範囲の即時キャプチャ＆フローティングバー</b>
    </td>
    <td align="center" width="33%">
      <img src="public/images/screenshot_2.png" alt="Chromeネイティブサイドパネル＆プレビュー" width="100%">
      <br>
      <b>🖥️ Chromeネイティブサイドパネル＆リアルタイム編集</b>
    </td>
    <td align="center" width="33%">
      <img src="public/images/screenshot_3.png" alt="記事本文抽出＆5言語対応" width="100%">
      <br>
      <b>📰 スマート本文抽出＆5言語スイッチャー</b>
    </td>
  </tr>
</table>

---

## ✨ 主な機能

- 🎯 **選択範囲の高精度Markdown変換（メイン機能）**:
  - Webページ上の任意のテキストやテーブルを選択し、構造化されたGFM Markdownに瞬時に変換。
  - フローティングツールチップがカーソル付近に表示：「MDコピー」または「サイドパネルを開く ↗」。
  - **サイドパネル自動同期（邪魔にならない設計）**: 現在のウィンドウでサイドパネルが開いている場合、選択したテキストは**自動的かつ即座にサイドパネルへ同期**され、ポップアップによる視覚的な遮蔽を防ぎます。
  - コードブロックの言語（Python、JavaScript、Goなど）を自動検出し、行番号のノイズを除去。
  - 相対URLや画像パスを完全な絶対URLに自動変換し、AIが参照する際のリンク切れを防止。
  - LaTeX / KaTeX / MathJax の数式構文（`$formula$` / `$$formula$$`）を保持。

- 📊 **非標準・複雑なHTMLテーブルの完全互換**:
  - Slate.jsやクラウドドキュメントなど、`<thead>` がない、または `<td class="is-header">` を使用するテーブルにも完全対応。
  - セル内の複数行改行を自動的に GFM `<br>` に修正し、テーブル構造の破損を防ぎます。
  - テーブルの一部行（孤立した `<tr>`）だけを選択した場合でも自動的に整形して出力。

- 🖥️ **Chromeネイティブサイドパネル（SidePanel）**:
  - ブラウザ右側の独立したビューポートを使用し、元のページを邪魔することなく並行して閲覧・対照可能。
  - Markdownソース編集とレンダリングプレビューをスムーズに切り替え。
  - 文字数および主要LLM（GPT-4o / Claude 3.5 / DeepSeek）の推定Token数をリアルタイム表示。

- 📰 **スマート記事本文抽出（Mozilla Readability）**:
  - ナビゲーションメニュー、広告、おすすめバー、フッターを自動で除去。
  - 核心となる記事本文のみを抽出し、AIコンテキストウィンドウの無駄なTokenを最大70%削減。

- 🧩 **全フレーム `<iframe>` の透過処理**:
  - Notionの埋め込みブロックやクラウドドキュメントのサンドボックス内にあるテキスト選択も正確にキャプチャ。
  - 最上位ページの正式なタイトルとURLを自動的に紐付け、AIのメタデータ追跡を保証。

- ⚡ **ワンクリックコピー＆ローカル出力**:
  - 触覚フィードバック付きのコピーボタン；ワンクリックで `.md` ファイルとして保存。
  - オプションの「AIメタ情報（Frontmatter）」トグル（デフォルトOFF）：必要に応じて先頭に出典・URL・タイムスタンプを付加。
  - **グローバルショートカットの競合なし**: 他の拡張機能やIDEとキーが衝突することはありません。

- 🌍 **国際化・多言語対応 (i18n)**:
  - 5つの主要言語を完全サポート：🇨🇳 簡体字中国語 (`zh-CN`)、🇺🇸 英語 (`en`)、🇭🇰 繁体字中国語 (`zh-TW`)、🇯🇵 日本語 (`ja`)、🇷🇺 ロシア語 (`ru`)。

---

## 🚀 インストール＆利用ガイド（Chrome / Edge）

### 1. GitHub Releasesからインストール
1. [Releases](../../releases) ページから最新の `Web2MD-FeedAI-v1.0.0.zip` をダウンロードします。
2. Chromeを開き、拡張機能管理ページ（`chrome://extensions/`）へアクセスします。
3. 右上の **「デベロッパーモード」** をオンにします。
4. ZIPを解凍し、**「パッケージ化されていない拡張機能を読み込む」** をクリックして解凍したフォルダを選択します。
5. ツールバーに **Web2MD-FeedAI** アイコンを固定すれば準備完了です！

### 2. ソースコードからのビルド＆パッケージング
```bash
# 1. 依存関係のインストール
npm install

# 2. 本番向けビルド (dist/へ出力)
npm run build

# 3. 自動テストスイートの実行
npm test

# 4. Chrome Web Store用ZIPパッケージの生成 (release/へ出力)
npm run package
```

---

## 🛠️ プロジェクト構成

```
Web2MD-FeedAI/
├── public/                    # 静的アセット (manifest.json, icons, images)
│   ├── images/                # スクリーンショット素材
│   └── icons/                 # 全サイズアイコン (16/32/48/128/1080)
├── scripts/
│   ├── build.js               # Viteベースの高速マルチエントリビルドスクリプト
│   └── package.js             # Chrome Web Store向けZIP自動生成ツール
├── src/
│   ├── background/            # バックグラウンドService Worker
│   ├── content/               # コンテンツスクリプト (iframe透過、選択キャプチャ)
│   ├── sidepanel/             # ネイティブサイドパネルUI
│   └── utils/
│       ├── html2md.js         # Turndown変換＆テーブル最適化エンジン
│       ├── readability.js     # Mozilla Readability記事抽出アルゴリズム
│       ├── token.js           # 文字数＆LLM Token推定器
│       └── i18n.js            # 5言語国際化エンジン
├── test/
│   └── verify.js              # 自動テスト検証スイート
├── dist/                      # 本番ビルド出力ディレクトリ
└── release/                   # 配布用ZIPパッケージディレクトリ
```

---

## 💖 スポンサー＆ご支援 (Sponsor)

**Web2MD-FeedAI** は完全オープンソースであり、広告なし、すべてのデータをユーザーのデバイス内で100%ローカル処理するプライバシー重視の生産性ツールです。

日頃のAI（ChatGPT / Claude / DeepSeek / Kimi）との対話において、時間やTokenの節約にお役に立てましたら、ぜひ作者へコーヒー1杯 ☕ のご支援をご検討いただけますと幸いです！皆様の温かいサポートが今後のメンテナンスと新機能開発の大きな励みとなります！

<p align="center">
  <img src="public/images/ercode.jpg" alt="Sponsor QR Code" width="280px" style="border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.12);">
  <br>
  <sub>QRコードで作者を支援（WeChat / Alipay）</sub>
</p>

---

## 📄 ライセンス (License)

本プロジェクトは [Apache-2.0 license](LICENSE) のもとで公開されています。
