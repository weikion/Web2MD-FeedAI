# Web2MD-FeedAI - AI 網頁轉 Markdown 瀏覽器擴充功能

<p align="center">
  <img src="public/images/banner.jpg" alt="Web2MD-FeedAI Banner" width="100%">
</p>

<p align="center">
  <a href="./README.md">English</a> | <a href="./README.zh-CN.md">简体中文</a> | <b>繁體中文</b> | <a href="./README.ja.md">日本語</a> | <a href="./README.ru.md">Русский</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-Manifest_V3-4285F4?logo=googlechrome&logoColor=white" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Version-1.2.1-00C7B7" alt="Version">
  <img src="https://img.shields.io/badge/License-Apache--2.0-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg" alt="PRs Welcome">
</p>

> **Web2MD-FeedAI 的唯一定位是生產力工具：幫助使用者將任意網頁的選區或全頁正文高效轉換為專為大型語言模型（LLM/AI）最佳化的高品質結構化 Markdown，並透過瀏覽器原生側邊欄提供即時預覽、編輯與一鍵複製。**

---

## 📸 實際效果截圖 (Screenshots)

<table align="center" width="100%">
  <tr>
    <td align="center" width="33%">
      <img src="public/images/screenshot_1.png" alt="劃選即時擷取與智慧轉換" width="100%">
      <br>
      <b>🎯 劃選即時擷取與自適應浮動工具列</b>
    </td>
    <td align="center" width="33%">
      <img src="public/images/screenshot_2.png" alt="Chrome 原生側邊欄與即時渲染預覽" width="100%">
      <br>
      <b>🖥️ Chrome 原生側邊欄即時編輯與渲染預覽</b>
    </td>
    <td align="center" width="33%">
      <img src="public/images/screenshot_3.png" alt="全頁智慧提煉與多語言支援" width="100%">
      <br>
      <b>📰 全頁智慧正文提煉與 5 種語言切換</b>
    </td>
  </tr>
</table>

---

## ✨ 核心特性

- 🎯 **劃選精準轉換（主打功能）**：
  - 網頁任意劃選內容一鍵轉換為結構化 Markdown。
  - 劃選後自動浮出微型膠囊按鈕：支援「複製 MD」或「開啟側邊欄 ↗」。
  - **智慧感知側邊欄（免彈窗打擾）**：當目前視窗已開啟側邊欄時，選中的內容會**自動、即時同步展示**在右側側邊欄，頁面不再彈出任何遮擋選單，專注對照閱讀。
  - 自動推斷程式碼區塊語言（如 `python`、`javascript`、`json` 等），智慧過濾行號干擾。
  - 自動將相對 URL 和圖片位址轉為完整絕對連結，防止 AI 查證時丟圖、丟連結。
  - 完整保留 LaTeX / KaTeX / MathJax 數學公式語法（`$formula$` / `$$formula$$`）。
  - **智慧原生 Markdown 感知**：若已劃選內容本身已是 Markdown 格式（如程式碼區塊內、AI 回應原始碼、原生 Markdown 文字或 `.md` 檔案），自動保留原始格式，無需也不再進行二次轉義。

- 📊 **非標準複雜表格全自適應相容**：
  - 深度相容 Slate.js、騰訊雲 API 文件等沒有 `<thead>` 或首行使用 `<td class="is-header">` 的非標準表格。
  - 自動將儲存格內多行換行轉為 GFM `<br>`，杜絕表格破損錯位。
  - 即使僅劃選部分表格行（孤立 `<tr>`），也能自動識別包裹輸出為完美 Markdown 表格。

- 🖥️ **原生右側側邊欄（Chrome SidePanel）**：
  - 佔用瀏覽器原生右側捲軸區域，獨立視口，不遮擋原網頁，支援並排對照閱讀。
  - 支援即時編輯調整，支援 Markdown 原始碼模式與富文字渲染預覽模式平滑切換。
  - 即時統計字數與估算主流 LLM（GPT-4o / Claude 3.5 / DeepSeek）的 Tokens 消耗。

- 📰 **全頁智慧擷取（Readability 演算法）**：
  - 整合 Mozilla Readability 演算法，像閱讀模式一樣剝離導航、推薦、廣告與頁尾雜質。
  - 僅提煉純淨正文，為 AI 節省高達 70% 的無用 Token 上下文。

- 🧩 **全框架 `<iframe>` 深度穿透**：
  - 支援跨域或同源 `<iframe>`（如 Notion、語雀、飛書嵌入模組及程式碼沙盒）內部選區精準擷取。
  - 自動將來源標題與 URL 對齊為瀏覽器頂級網頁真實位址，AI 元數據溯源永不遺失。

- ⚡ **一鍵複製與本機匯出**：
  - 側邊欄及頁面均有一鍵複製按鈕，具備觸感回饋動效；支援一鍵匯出為 `.md` 檔案。
  - 可選「AI 元資訊（Frontmatter）」開關（預設關閉），需要時一鍵注入來源標題、URL 及時間戳記。
  - **純淨無快速鍵衝突**：不綁定全域快速鍵，避免與其他擴充功能或系統快捷鍵衝突，即點即用。

- 🌍 **國際化多語言支援 (i18n)**：
  - 頂部右上角內建輕量語言切換器，即切即換並跨會話記憶。
  - 完整支援 5 種主流語言包：🇨🇳 簡體中文 (`zh-CN`)、🇺🇸 English (`en`)、🇭🇰 繁體中文 (`zh-TW`)、🇯🇵 日本語 (`ja`)、🇷🇺 Русский (`ru`)。

---

## 🚀 安裝使用指南（Chrome / Edge）

### 1. 從發布包直接安裝
1. 前往 GitHub 倉庫的 [Releases](../../releases) 頁面，下載最新的 `Web2MD-FeedAI-v1.2.1.zip`；
2. 開啟 Chrome 瀏覽器，存取擴充功能管理頁面：`chrome://extensions/`（Edge 存取：`edge://extensions/`）；
3. 開啟右上角 **「開發人員模式 (Developer mode)」** 開關；
4. 將下載的 ZIP 解壓縮，點擊 **「載入未打包項目 (Load unpacked)」** 並選取解壓後的資料夾；
5. 在瀏覽器擴充功能列將 **Web2MD-FeedAI** 圖示固定在工具列，即可立即使用！

### 2. 開發者本機建置與打包
```bash
# 1. 安裝相依套件
npm install

# 2. 本地建置生產包到 dist 目錄
npm run build

# 3. 執行完整自動化測試套件
npm test

# 4. 一鍵打包產生商店發布安裝包 (ZIP 產物輸出到 release/ 目錄)
npm run package
```

---

## 🛠️ 專案架構

```
Web2MD-FeedAI/
├── public/                    # 靜態公共資源 (manifest.json, icons, images)
│   ├── images/                # 截圖展示與說明素材
│   └── icons/                 # 16/32/48/128/1080 尺寸全套圖示
├── scripts/
│   ├── build.js               # 基於 Vite 的極速多入口打包指令碼
│   └── package.js             # 商店 ZIP 發布包一鍵打包工具
├── src/
│   ├── background/            # 後台 Service Worker (SidePanel 調度與視窗會話追蹤)
│   ├── content/               # 網頁注入腳本 (iframe穿透、選區擷取、浮標與Toast)
│   ├── sidepanel/             # 原生右側側邊欄 (雙模式切換、Markdown編輯器/渲染預覽)
│   └── utils/
│       ├── html2md.js         # Turndown 轉換引擎與表格/程式碼區塊/公式最佳化
│       ├── readability.js     # Mozilla Readability 頁面正文清洗演算法
│       ├── token.js           # 字元與 LLM Token 預估器
│       └── i18n.js            # 5 種語言國際化引擎
├── test/
│   └── verify.js              # 核心功能端到端自動化單元驗證套件
├── dist/                      # 編譯就緒的生產擴充功能目錄（可直接載入瀏覽器）
└── release/                   # Chrome Web Store 官方標準 ZIP 發布包
```

---

## 💖 贊助與支持 (Sponsor)

**Web2MD-FeedAI** 是一款完全開源、純淨、無任何廣告且堅持 100% 本地保護隱私的生產力工具。

如果您覺得這個小工具在日常與 AI（ChatGPT / Claude / DeepSeek / Kimi）的互動中幫您節省了寶貴的時間與 Token，或者提升了您的工作流程體驗，歡迎請作者喝一杯咖啡 ☕！您的慷慨支持是本專案持續維護與迭代更多優秀特性的最大動力！

<p align="center">
  <img src="public/images/ercode.jpg" alt="贊助收款二維碼" width="280px" style="border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.12);">
  <br>
  <sub>掃碼支持作者（微信 / 支付寶）</sub>
</p>

---

## 📄 開源協議 (License)

本專案基於 [Apache-2.0 license](LICENSE) 協議開源。
