/**
 * Web2MD-FeedAI Internationalization (i18n) Engine
 * Supported locales: zh-CN (Simplified Chinese), en (English), zh-TW (Traditional Chinese), ja (Japanese), ru (Russian)
 */

export const SUPPORTED_LOCALES = ['zh-CN', 'en', 'zh-TW', 'ja', 'ru'];

export const TRANSLATIONS = {
  'zh-CN': {
    brand_tag: 'AI Ready',
    detecting_page: '检测中...',
    unnamed_page: '未命名网页',
    tab_selection: '选区内容',
    tab_article: '智能正文',
    ai_meta: 'AI 元信息',
    ai_meta_tooltip: '在 Markdown 顶部自动附带网页来源、标题和时间戳，便于 AI 溯源',
    view_raw: 'Raw',
    view_raw_tooltip: '编辑 Markdown 源码',
    view_preview: '预览',
    view_preview_tooltip: '预览渲染效果',
    editor_placeholder: '选区转换结果或整页正文将在此显示，支持直接编辑...',
    preview_empty: '暂无内容可预览',
    empty_title: '当前尚未捕获内容',
    empty_desc: '在任意网页划选文本后即可实时捕获；<br>或点击上方<b>「智能正文」</b>一键提取文章。',
    btn_refresh: '刷新',
    btn_refresh_tooltip: '从当前标签重新提取',
    btn_clear: '清空',
    btn_clear_tooltip: '清空当前内容',
    btn_download: '导出',
    btn_download_tooltip: '导出为 .md 文件',
    btn_copy: '一键复制',
    btn_copied: '已复制到剪贴板！',
    copy_failed: '复制失败，请手动全选复制',
    char_count: '{count} 字符',
    token_count: '~{count} Tokens',
    float_copy: '复制 MD',
    float_panel: '打开侧栏 ↗',
    float_panel_title: '在右侧侧边栏打开',
    toast_copied_selection: '已复制 Markdown',
    hint_refresh_article: '页面已切换，点击此处刷新提取正文',
    unsupported_page: 'Web2MD-FeedAI 无法在此受保护的浏览器内置页面中运行，请在普通网页中使用。'
  },
  'en': {
    brand_tag: 'AI Ready',
    detecting_page: 'Detecting...',
    unnamed_page: 'Untitled Page',
    tab_selection: 'Selection',
    tab_article: 'Article',
    ai_meta: 'AI Metadata',
    ai_meta_tooltip: 'Automatically inject source URL, title, and timestamp at the top of Markdown for AI context',
    view_raw: 'Raw',
    view_raw_tooltip: 'Edit raw Markdown',
    view_preview: 'Preview',
    view_preview_tooltip: 'Preview rendered Markdown',
    editor_placeholder: 'Selected content or full article will appear here. Editable...',
    preview_empty: 'No content to preview',
    empty_title: 'No Content Captured',
    empty_desc: 'Select text on any webpage to capture instantly,<br>or click <b>"Article"</b> above to extract the main content.',
    btn_refresh: 'Refresh',
    btn_refresh_tooltip: 'Re-extract from current tab',
    btn_clear: 'Clear',
    btn_clear_tooltip: 'Clear current content',
    btn_download: 'Export',
    btn_download_tooltip: 'Export as .md file',
    btn_copy: 'Copy',
    btn_copied: 'Copied to Clipboard!',
    copy_failed: 'Copy failed, please select and copy manually',
    char_count: '{count} Chars',
    token_count: '~{count} Tokens',
    float_copy: 'Copy MD',
    float_panel: 'SidePanel ↗',
    float_panel_title: 'Open in SidePanel',
    toast_copied_selection: 'Markdown Copied',
    hint_refresh_article: 'Page changed. Click to refresh article',
    unsupported_page: 'Web2MD-FeedAI cannot run on protected browser internal pages. Please use on standard webpages.'
  },
  'zh-TW': {
    brand_tag: 'AI Ready',
    detecting_page: '檢測中...',
    unnamed_page: '未命名網頁',
    tab_selection: '選區內容',
    tab_article: '智能正文',
    ai_meta: 'AI 元資訊',
    ai_meta_tooltip: '在 Markdown 頂部自動附帶網頁來源、標題與時間戳，便於 AI 溯源',
    view_raw: 'Raw',
    view_raw_tooltip: '編輯 Markdown 源碼',
    view_preview: '預覽',
    view_preview_tooltip: '預覽渲染效果',
    editor_placeholder: '選區轉換結果或全頁正文將在此顯示，支援直接編輯...',
    preview_empty: '暫無內容可預覽',
    empty_title: '當前尚未擷取內容',
    empty_desc: '在任意網頁劃選文字後即可即時擷取；<br>或點擊上方<b>「智能正文」</b>一鍵提取文章。',
    btn_refresh: '重新整理',
    btn_refresh_tooltip: '從當前標籤重新擷取',
    btn_clear: '清空',
    btn_clear_tooltip: '清空當前內容',
    btn_download: '匯出',
    btn_download_tooltip: '匯出為 .md 檔案',
    btn_copy: '一鍵複製',
    btn_copied: '已複製到剪貼簿！',
    copy_failed: '複製失敗，請手動全選複製',
    char_count: '{count} 字元',
    token_count: '~{count} Tokens',
    float_copy: '複製 MD',
    float_panel: '打開側邊欄 ↗',
    float_panel_title: '在右側邊欄打開',
    toast_copied_selection: '已複製 Markdown',
    hint_refresh_article: '頁面已切換，點擊此處重新整理擷取正文',
    unsupported_page: 'Web2MD-FeedAI 無法在此受保護的瀏覽器內建頁面中執行，請在一般網頁中使用。'
  },
  'ja': {
    brand_tag: 'AI Ready',
    detecting_page: '検出中...',
    unnamed_page: '名称未設定のページ',
    tab_selection: '選択範囲',
    tab_article: '本文抽出',
    ai_meta: 'AIメタ情報',
    ai_meta_tooltip: 'AIの文脈参照のため、ソースURL・タイトル・取得日時をMarkdown先頭に自動付加します',
    view_raw: 'Raw',
    view_raw_tooltip: 'Markdownソースを編集',
    view_preview: 'プレビュー',
    view_preview_tooltip: 'レンダリング結果をプレビュー',
    editor_placeholder: '選択されたテキストまたは記事本文がここに表示されます。編集可能です...',
    preview_empty: 'プレビューするコンテンツがありません',
    empty_title: 'コンテンツがありません',
    empty_desc: '任意のWebページでテキストを選択すると即座に取得されます。<br>または上部の<b>「本文抽出」</b>をクリックしてください。',
    btn_refresh: '更新',
    btn_refresh_tooltip: '現在のタブから再取得',
    btn_clear: 'クリア',
    btn_clear_tooltip: 'コンテンツをクリア',
    btn_download: '出力',
    btn_download_tooltip: '.md ファイルとして保存',
    btn_copy: 'コピー',
    btn_copied: 'クリップボードにコピーしました！',
    copy_failed: 'コピーに失敗しました。手動でコピーしてください',
    char_count: '{count} 文字',
    token_count: '~{count} Tokens',
    float_copy: 'MDコピー',
    float_panel: 'サイドバー ↗',
    float_panel_title: 'サイドパネルで開く',
    toast_copied_selection: 'Markdownをコピーしました',
    hint_refresh_article: 'ページが変更されました。クリックして本文を更新',
    unsupported_page: 'Web2MD-FeedAIはブラウザの内部保護ページでは動作しません。通常のWebページでご利用ください。'
  },
  'ru': {
    brand_tag: 'AI Ready',
    detecting_page: 'Определение...',
    unnamed_page: 'Безымянная страница',
    tab_selection: 'Выделение',
    tab_article: 'Статья',
    ai_meta: 'Метаданные AI',
    ai_meta_tooltip: 'Автоматически добавлять заголовок, URL источника и дату в начало Markdown для контекста AI',
    view_raw: 'Raw',
    view_raw_tooltip: 'Редактировать исходный Markdown',
    view_preview: 'Просмотр',
    view_preview_tooltip: 'Предварительный просмотр',
    editor_placeholder: 'Выделенный фрагмент или статья появятся здесь. Можно редактировать...',
    preview_empty: 'Нет содержимого для просмотра',
    empty_title: 'Контент пока не захвачен',
    empty_desc: 'Выделите текст на веб-странице для быстрого захвата<br>или нажмите <b>«Статья»</b> выше для извлечения.',
    btn_refresh: 'Обновить',
    btn_refresh_tooltip: 'Повторно извлечь из текущей вкладки',
    btn_clear: 'Очистить',
    btn_clear_tooltip: 'Очистить содержимое',
    btn_download: 'Экспорт',
    btn_download_tooltip: 'Экспорт в файл .md',
    btn_copy: 'Копировать',
    btn_copied: 'Скопировано в буфер!',
    copy_failed: 'Не удалось скопировать, выделите и скопируйте вручную',
    char_count: '{count} симв.',
    token_count: '~{count} Tokens',
    float_copy: 'Копировать MD',
    float_panel: 'Панель ↗',
    float_panel_title: 'Открыть в боковой панели',
    toast_copied_selection: 'Markdown скопирован',
    hint_refresh_article: 'Страница изменена. Нажмите для обновления статьи',
    unsupported_page: 'Web2MD-FeedAI не может работать на защищенных внутренних страницах браузера. Используйте на обычных веб-страницах.'
  }
};

let currentLocale = 'zh-CN';

/**
 * Determine default locale from browser or storage
 */
export function detectDefaultLocale() {
  const navLang = (typeof navigator !== 'undefined' && navigator.language) ? navigator.language : 'zh-CN';
  const langLower = navLang.toLowerCase();

  if (langLower.startsWith('zh-tw') || langLower.startsWith('zh-hk') || langLower.startsWith('zh-mo')) {
    return 'zh-TW';
  }
  if (langLower.startsWith('zh')) {
    return 'zh-CN';
  }
  if (langLower.startsWith('ja')) {
    return 'ja';
  }
  if (langLower.startsWith('ru')) {
    return 'ru';
  }
  if (langLower.startsWith('en')) {
    return 'en';
  }
  return 'zh-CN';
}

/**
 * Set active locale
 */
export function setLocale(locale) {
  if (SUPPORTED_LOCALES.includes(locale)) {
    currentLocale = locale;
  }
}

/**
 * Get active locale
 */
export function getLocale() {
  return currentLocale;
}

/**
 * Translate a key with optional dynamic placeholder replacements: {name}
 */
export function t(key, params = {}) {
  const dict = TRANSLATIONS[currentLocale] || TRANSLATIONS['zh-CN'];
  let text = dict[key] || TRANSLATIONS['zh-CN'][key] || key;

  if (params && typeof params === 'object') {
    Object.keys(params).forEach(paramKey => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
    });
  }

  return text;
}
