# Web2MD-FeedAI - AI 网页转 Markdown 浏览器扩展

<p align="center">
  <img src="public/images/banner.jpg" alt="Web2MD-FeedAI Banner" width="100%">
</p>

<p align="center">
  <a href="./README.md">English</a> | <b>简体中文</b> | <a href="./README.zh-TW.md">繁體中文</a> | <a href="./README.ja.md">日本語</a> | <a href="./README.ru.md">Русский</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-Manifest_V3-4285F4?logo=googlechrome&logoColor=white" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Version-1.2.1-00C7B7" alt="Version">
  <img src="https://img.shields.io/badge/License-Apache--2.0-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg" alt="PRs Welcome">
</p>

> **Web2MD-FeedAI 的唯一定位是生产力工具：帮助用户将任意网页的选区或整页正文高效转换为专为大语言模型（LLM/AI）优化的高质量结构化 Markdown，并通过浏览器原生侧边栏提供实时预览、编辑与一键复制。**

---

## 📸 实际效果截图 (Screenshots)

<table align="center" width="100%">
  <tr>
    <td align="center" width="33%">
      <img src="public/images/screenshot_1.png" alt="划选即时捕获与智能转换" width="100%">
      <br>
      <b>🎯 划选即时捕获与自适应浮动工具条</b>
    </td>
    <td align="center" width="33%">
      <img src="public/images/screenshot_2.png" alt="Chrome 原生侧边栏与实时渲染预览" width="100%">
      <br>
      <b>🖥️ Chrome 原生侧边栏实时编辑与渲染预览</b>
    </td>
    <td align="center" width="33%">
      <img src="public/images/screenshot_3.png" alt="整页智能提炼与多语言支持" width="100%">
      <br>
      <b>📰 整页智能正文提炼与 5 种语言切换</b>
    </td>
  </tr>
</table>

---

## ✨ 核心特性

- 🎯 **划选精准转换（主打功能）**：
  - 网页任意划选内容一键转换为结构化 Markdown。
  - 划选后自动浮出微型胶囊按钮：支持“复制 MD”或“打开侧边栏 ↗”。
  - **智能感知侧边栏（免弹窗打扰）**：当当前窗口已打开侧边栏时，选中的内容会**自动、即时同步展示**在右侧边栏，页面不再弹出任何遮挡菜单，专注对照阅读。
  - 自动推断代码块语言（如 `python`、`javascript`、`json` 等），智能过滤行号干扰。
  - 自动将相对 URL 和图片地址转为完整绝对链接，防止 AI 查证丢图、丢链接。
  - 完整保留 LaTeX / KaTeX / MathJax 数学公式语法（`$formula$` / `$$formula$$`）。
  - **智能原生 Markdown 感知**：若已划选内容本身已是 Markdown 格式（如代码块内、AI 响应源码、原生 Markdown 文本或 `.md` 文件），自动保留原始格式，无需也不再进行二次转义。

- 📊 **非标准复杂表格全自适应兼容**：
  - 深度兼容 Slate.js、腾讯云 API 文档等没有 `<thead>` 或首行使用 `<td class="is-header">` 的非标准表格。
  - 自动将单元格内多行换行转为 GFM `<br>`，杜绝表格破损错位。
  - 即使仅划选部分表格行（孤立 `<tr>`），也能自动识别包裹输出为完美 Markdown 表格。

- 🖥️ **原生右侧边栏（Chrome SidePanel）**：
  - 占用浏览器原生右侧滚动条区域，独立视口，不遮挡原网页，支持并排对照阅读。
  - 支持实时编辑调整，支持 Markdown 源码模式与富文本渲染预览模式平滑切换。
  - 实时统计字数与估算主流 LLM（GPT-4o / Claude 3.5 / DeepSeek）的 Tokens 消耗。

- 📰 **整页智能提取（Readability 算法）**：
  - 集成 Mozilla Readability 算法，像阅读模式一样剥离导航、推荐、广告与页脚杂质。
  - 仅提炼纯净正文，为 AI 极致节省高达 70% 的无用 Token 上下文。

- 🧩 **全框架 `<iframe>` 深度穿透**：
  - 支持跨域或同源 `<iframe>`（如 Notion、语雀、飞书嵌入模块及代码沙箱）内部选区精准捕捉。
  - 自动将来源标题与 URL 对齐为浏览器顶级网页真实地址，AI 元数据溯源永不丢失。

- ⚡ **一键复制与本地导出**：
  - 侧边栏及页面均有一键复制按钮，带触感反馈动效；支持一键导出为 `.md` 文件。
  - 可选“AI 元信息（Frontmatter）”开关（默认关闭），需要时一键注入来源标题、URL 及时间戳。
  - **纯净无快捷键冲突**：不绑定全局热键，避免与其他插件或系统快捷键冲突，即点即用。

- 🌍 **国际化多语言支持 (i18n)**：
  - 顶部右上角内置轻量语言切换器，即切即换并跨会话记忆。
  - 完整支持 5 种主流语言包：🇨🇳 简体中文 (`zh-CN`)、🇺🇸 English (`en`)、🇭🇰 繁體中文 (`zh-TW`)、🇯🇵 日本語 (`ja`)、🇷🇺 Русский (`ru`)。

---

## 🚀 安装使用指南（Chrome / Edge）

### 1. 从发布包直接安装
1. 前往 GitHub 仓库的 [Releases](../../releases) 页面，下载最新的 `Web2MD-FeedAI-v1.2.1.zip`；
2. 打开 Chrome 浏览器，访问扩展管理页面：`chrome://extensions/`（Edge 访问：`edge://extensions/`）；
3. 开启右上角 **“开发者模式 (Developer mode)”** 开关；
4. 将下载的 ZIP 解压，点击 **“加载已解压的扩展程序 (Load unpacked)”** 并选择解压出的文件夹；
5. 在浏览器扩展栏将 **Web2MD-FeedAI** 图标固定在工具栏，即可立即使用！

### 2. 开发者本地构建与打包
```bash
# 1. 安装依赖
npm install

# 2. 本地构建生产包到 dist 目录
npm run build

# 3. 运行完整自动化测试套件
npm test

# 4. 一键打包生成市场发布安装包 (ZIP 产物输出到 release/ 目录)
npm run package
```

---

## 🛠️ 项目架构

```
Web2MD-FeedAI/
├── public/                    # 静态公共资源 (manifest.json, icons, images)
│   ├── images/                # 截图展示与说明素材
│   └── icons/                 # 16/32/48/128/1080 尺寸全套图标
├── scripts/
│   ├── build.js               # 基于 Vite 的极速多入口打包脚本
│   └── package.js             # 商店 ZIP 发布包一键打包工具
├── src/
│   ├── background/            # 后台 Service Worker (SidePanel 调度与窗口会话跟踪)
│   ├── content/               # 网页注入脚本 (iframe穿透、选区捕捉、浮标与Toast)
│   ├── sidepanel/             # 原生右侧边栏 (双模式切换、Markdown编辑器/渲染预览)
│   └── utils/
│       ├── html2md.js         # Turndown 转换引擎与表格/代码块/公式优化
│       ├── readability.js     # Mozilla Readability 页面正文清洗算法
│       ├── token.js           # 字符与 LLM Token 预估器
│       └── i18n.js            # 5 种语言国际化引擎
├── test/
│   └── verify.js              # 核心功能端到端自动化单元验证套件
├── dist/                      # 编译就绪的生产扩展目录（可直接载入浏览器）
└── release/                   # Chrome Web Store 官方标准 ZIP 发布包
```

---

## 💖 赞助与支持 (Sponsor)

**Web2MD-FeedAI** 是一款完全开源、纯净、无任何广告且坚持 100% 离线保护隐私的生产力工具。

如果您觉得这个小工具在日常与 AI（ChatGPT / Claude / DeepSeek / Kimi）的交互中帮您节省了宝贵的时间与 Token，或者提升了您的工作流体验，欢迎请作者喝一杯咖啡 ☕！您的慷慨支持是本项目持续维护和迭代更多优秀特性的最大动力！

<p align="center">
  <img src="public/images/ercode.jpg" alt="赞助收款二维码" width="280px" style="border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.12);">
  <br>
  <sub>扫码支持作者（微信 / 支付宝）</sub>
</p>

---

## 📄 开源协议 (License)

本项目基于 [Apache-2.0 license](LICENSE) 协议开源。
