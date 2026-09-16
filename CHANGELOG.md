# 更新日志 (Changelog)

本项目的所有重要更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，并且本项目遵循 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/)。

---

## [1.0.1] - 2026-09-16

### ✨ 新增特性 (Features)
- **智能原生 Markdown 感知**：
  - 自动识别已划选内容是否本身已是 Markdown 格式（如代码块、AI 对话原始响应、原生 Markdown 排版文本、`.md` / `.markdown` 页面）。
  - 若为原生 Markdown，则直接保留其原始格式，跳过传统的 HTML-to-Markdown 转换逻辑，彻底解决已有 Markdown 语法符号（`#`、`-`、`[`、`]`、`**` 等）被反斜杠二次转义（如变为 `\#`、`\-`、`\[`）的破损问题。
  - **代码块上下文智能研判**：
    - 自动探查划选区域的祖先 `<pre>` / `<code>` 节点，若为 `language-markdown`、`language-md` 等，提取干净 Markdown 源码，杜绝嵌套产生双重代码块；
    - 精确过滤并区分 Python、JavaScript、Go、Rust、JSON 等非 Markdown 代码块，确保普通程序代码块仍规范包裹语言围栏；
    - 过滤并剔除代码块复制时可能附带的行号标签（`.line-numbers`, `.hljs-ln-numbers`, `.linenumber`）。
  - **全场景端到端直通**：
    - 划选浮层“复制 MD”一键复制干净原生 Markdown 并同步展示字数/Token 统计；
    - 划选浮层“打开侧边栏”或实时向已开启的侧边栏同步时，原生 Markdown 均直接传递并在侧边栏内实时编辑与渲染预览；
    - 侧边栏“刷新”与“AI 元数据（frontmatter）”操作无缝兼容原生 Markdown 文本。

### 🐞 修复与优化 (Fixes & Improvements)
- **开源协议徽章修正**：将所有多语言文档（中/繁/英/日/俄）顶部的 License 徽章图标统一修正为 `Apache-2.0`，与项目根目录 `LICENSE` 协议保持一致。
- **单元测试扩展**：在 `test/verify.js` 中新增针对原生 Markdown 感知、代码块语言研判、标准富文本 HTML 转换对比的完整自动化测试（共 9 项核心测试）。

---

## [1.0.0] - 2026-09-16

### 🎉 首次发布 (Initial Release)
- **划选精准转换**：网页任意划选内容一键转换为专为 AI 优化的高质量 GFM Markdown。
- **自适应浮动工具栏**：划选后自动浮出微型胶囊按钮，支持“复制 MD”与“打开侧边栏 ↗”。
- **智能感知侧边栏**：侧边栏已打开时自动实时静默同步选区内容，免弹窗打扰。
- **复杂表格兼容**：深度兼容无 `<thead>` 或使用 `<td class="is-header">` 的非标准表格，自动处理单元格多行换行。
- **数学公式与代码块**：完整保留 LaTeX / KaTeX / MathJax 公式（`$formula$` / `$$formula$$`），自动推断代码块语言并过滤行号。
- **全页文章提炼**：集成 Mozilla Readability 算法，支持一键提炼全页主体内容。
- **AI 前置元数据**：可选在 Markdown 顶部自动生成 YAML Frontmatter（标题、来源 URL、捕获时间戳）。
- **实时 Token 与字数统计**：支持实时估算 LLM Tokens 和字符统计。
- **多语言国际化**：完整支持简体中文、繁體中文、English、日本語、Русский 5 种语言切换。
