import { htmlToMarkdown, normalizeMarkdownTables } from '../utils/html2md.js';
import { countTokensAndChars } from '../utils/token.js';
import { t, setLocale, getLocale, detectDefaultLocale } from '../utils/i18n.js';

// State
let currentMode = 'selection'; // 'selection' | 'article'
let currentActiveTab = null;
let rawHtmlCache = {
  selectionHtml: '',
  selectionText: '',
  selectionIsMarkdown: false,
  pageHtml: '',
  articleHtml: ''
};
let pageInfo = {
  title: '',
  url: ''
};

// DOM Elements
const editor = document.getElementById('markdown-editor');
const previewWrap = document.getElementById('preview-wrap');
const editorWrap = document.getElementById('editor-wrap');
const markdownPreview = document.getElementById('markdown-preview');
const emptyState = document.getElementById('empty-state');

const charCountEl = document.getElementById('char-count');
const tokenCountEl = document.getElementById('token-count');
const activePageTitleEl = document.getElementById('active-page-title');
const langSelect = document.getElementById('lang-select');

const tabSelection = document.getElementById('tab-selection');
const tabArticle = document.getElementById('tab-article');

const btnRefresh = document.getElementById('btn-refresh');
const btnClear = document.getElementById('btn-clear');
const btnDownload = document.getElementById('btn-download');
const btnCopy = document.getElementById('btn-copy');
const copyBtnText = document.getElementById('copy-btn-text');

const toggleFrontmatter = document.getElementById('toggle-frontmatter');
const toggleFrontmatterLabel = document.getElementById('toggle-frontmatter-label');
const viewRawBtn = document.getElementById('view-raw');
const viewPreviewBtn = document.getElementById('view-preview');

const refreshBubble = document.getElementById('refresh-bubble');
const bubbleClose = document.getElementById('bubble-close');
let bubbleTimeout = null;

let sidepanelPort = null;

/**
 * Show refresh hint bubble above refresh button
 */
function showRefreshBubble() {
  if (currentMode !== 'article') return;
  if (!refreshBubble) return;

  refreshBubble.classList.remove('hidden');

  if (bubbleTimeout) clearTimeout(bubbleTimeout);
  bubbleTimeout = setTimeout(() => {
    hideRefreshBubble();
  }, 12000);
}

/**
 * Hide refresh hint bubble
 */
function hideRefreshBubble() {
  if (refreshBubble) {
    refreshBubble.classList.add('hidden');
  }
  if (bubbleTimeout) {
    clearTimeout(bubbleTimeout);
    bubbleTimeout = null;
  }
}

/**
 * Initialize SidePanel
 */
async function init() {
  connectToBackground();
  bindEvents();
  await loadPreferences();
  await refreshActiveTab();
}

/**
 * Connect to background service worker to declare active sidepanel per window
 */
function connectToBackground() {
  try {
    sidepanelPort = chrome.runtime.connect({ name: 'sidepanel-connection' });

    chrome.windows.getCurrent((win) => {
      if (win && win.id != null && sidepanelPort) {
        sidepanelPort.postMessage({
          type: 'REGISTER_SIDEPANEL_WINDOW',
          windowId: win.id
        });
      }
    });

    sidepanelPort.onMessage.addListener((msg) => {
      if (msg.type === 'SYNC_SELECTION' && msg.data) {
        handleIncomingSelection(msg.data);
      }
    });

    sidepanelPort.onDisconnect.addListener(() => {
      sidepanelPort = null;
    });
  } catch (err) {
    console.warn('Could not connect sidepanel port to background:', err);
  }
}

/**
 * Automatically display incoming selection content when sidepanel is already open
 */
function handleIncomingSelection(data) {
  if (!data || (!data.html && !data.text)) return;

  // Auto switch to selection tab
  currentMode = 'selection';
  tabSelection.classList.add('active');
  tabArticle.classList.remove('active');
  hideRefreshBubble();

  // Cache selection HTML, text, and markdown detection status
  rawHtmlCache.selectionHtml = data.html || '';
  rawHtmlCache.selectionText = data.text || '';
  rawHtmlCache.selectionIsMarkdown = !!data.isMarkdown;

  // Update page info if available
  if (data.title) pageInfo.title = data.title;
  if (data.url) pageInfo.url = data.url;
  updateTitleBadge(pageInfo.title, pageInfo.url);

  // Re-generate markdown with current settings and display in editor/preview
  regenerateMarkdown();

  // Persist to storage
  if (editor.value) {
    chrome.storage.local.set({
      latestMarkdown: editor.value,
      latestSource: {
        type: 'selection',
        title: pageInfo.title,
        url: pageInfo.url,
        timestamp: Date.now()
      }
    });
  }
}


/**
 * Apply current locale translations to UI
 */
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translated = t(key);
    if (key === 'empty_desc') {
      el.innerHTML = translated;
    } else {
      el.textContent = translated;
    }
  });

  editor.placeholder = t('editor_placeholder');
  if (toggleFrontmatterLabel) toggleFrontmatterLabel.title = t('ai_meta_tooltip');
  if (viewRawBtn) viewRawBtn.title = t('view_raw_tooltip');
  if (viewPreviewBtn) viewPreviewBtn.title = t('view_preview_tooltip');
  if (btnRefresh) btnRefresh.title = t('btn_refresh_tooltip');
  if (btnClear) btnClear.title = t('btn_clear_tooltip');
  if (btnDownload) btnDownload.title = t('btn_download_tooltip');

  updateTitleBadge(pageInfo.title, pageInfo.url);
  updateStats();

  if (viewPreviewBtn.classList.contains('active')) {
    renderPreview();
  }
}

/**
 * Load user saved preferences
 */
async function loadPreferences() {
  try {
    const prefs = await chrome.storage.local.get(['includeMetadata', 'latestMarkdown', 'latestSource', 'userLocale']);
    
    // Set locale
    const locale = prefs.userLocale || detectDefaultLocale();
    setLocale(locale);
    if (langSelect) langSelect.value = locale;
    applyTranslations();

    if (prefs.includeMetadata !== undefined) {
      toggleFrontmatter.checked = prefs.includeMetadata;
    } else {
      toggleFrontmatter.checked = false;
    }
    if (prefs.latestMarkdown) {
      setMarkdownContent(prefs.latestMarkdown);
    }
  } catch (err) {
    console.warn('Could not load preferences:', err);
  }
}

/**
 * Bind UI event listeners
 */
function bindEvents() {
  // Language selector
  if (langSelect) {
    langSelect.addEventListener('change', async (e) => {
      const newLocale = e.target.value;
      setLocale(newLocale);
      await chrome.storage.local.set({ userLocale: newLocale });
      applyTranslations();
    });
  }

  // Mode tabs
  tabSelection.addEventListener('click', () => switchMode('selection'));
  tabArticle.addEventListener('click', () => switchMode('article'));

  // Bubble events
  if (bubbleClose) {
    bubbleClose.addEventListener('click', (e) => {
      e.stopPropagation();
      hideRefreshBubble();
    });
  }
  if (refreshBubble) {
    refreshBubble.addEventListener('click', async () => {
      hideRefreshBubble();
      await refreshActiveTab();
      await fetchContentForCurrentMode(true);
    });
  }

  // Refresh
  btnRefresh.addEventListener('click', async () => {
    hideRefreshBubble();
    await refreshActiveTab();
    await fetchContentForCurrentMode(true);
  });

  // Editor typing
  editor.addEventListener('input', () => {
    updateStats();
    toggleEmptyState(editor.value.trim().length === 0);
  });

  // Toggle Frontmatter
  toggleFrontmatter.addEventListener('change', async () => {
    await chrome.storage.local.set({ includeMetadata: toggleFrontmatter.checked });
    regenerateMarkdown();
  });

  // View switch: Raw vs Preview
  viewRawBtn.addEventListener('click', () => switchView('raw'));
  viewPreviewBtn.addEventListener('click', () => switchView('preview'));

  // Copy button
  btnCopy.addEventListener('click', handleCopy);

  // Clear button
  btnClear.addEventListener('click', () => {
    setMarkdownContent('');
    rawHtmlCache = { selectionHtml: '', pageHtml: '', articleHtml: '' };
    toggleEmptyState(true);
  });

  // Download button
  btnDownload.addEventListener('click', handleDownload);

  // Listen to storage changes from content script
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.latestMarkdown) {
      setMarkdownContent(changes.latestMarkdown.newValue);
    }
  });

  // Listen for tab switch in browser
  chrome.tabs.onActivated.addListener(async () => {
    await refreshActiveTab();
    // Auto check if new tab has selection in selection mode, or prompt refresh in article mode
    if (currentMode === 'selection') {
      fetchContentForCurrentMode(false);
    } else if (currentMode === 'article') {
      showRefreshBubble();
    }
  });

  // Listen for tab navigation, reload, or dynamic title changes
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (currentActiveTab && tabId === currentActiveTab.id) {
      if (changeInfo.title || changeInfo.url || changeInfo.status === 'complete') {
        refreshActiveTab();
        if (currentMode === 'article' && (changeInfo.url || changeInfo.status === 'complete')) {
          showRefreshBubble();
        }
      }
    }
  });
}

/**
 * Update the title badge in the header UI
 */
function updateTitleBadge(title, url) {
  const displayTitle = title || url || t('unnamed_page');
  activePageTitleEl.textContent = displayTitle;
  activePageTitleEl.title = `${displayTitle}\n${url || ''}`;
}

/**
 * Get active tab and extract <title> tag value from rendered HTML
 */
async function refreshActiveTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      currentActiveTab = tab;

      // Directly read the <title> tag value from the rendered HTML DOM
      if (chrome.scripting && chrome.scripting.executeScript && tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('edge://') && !tab.url.startsWith('about:')) {
        try {
          const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => document.querySelector('title')?.textContent?.trim() || document.title || ''
          });
          if (results && results[0] && results[0].result) {
            pageInfo.title = results[0].result;
          }
        } catch (_) {}
      }

      if (!pageInfo.title && tab.title) {
        pageInfo.title = tab.title;
      }
      if (tab.url) pageInfo.url = tab.url;

      updateTitleBadge(pageInfo.title, pageInfo.url);
      return tab;
    }
  } catch (err) {
    console.warn('Error querying active tab:', err);
  }
  return null;
}

/**
 * Switch mode: selection / article
 */
async function switchMode(mode) {
  hideRefreshBubble();
  if (currentMode === mode && editor.value.trim()) return;
  currentMode = mode;

  [tabSelection, tabArticle].forEach(t => t.classList.remove('active'));
  if (mode === 'selection') tabSelection.classList.add('active');
  if (mode === 'article') tabArticle.classList.add('active');

  await fetchContentForCurrentMode(true);
}

/**
 * Fetch HTML content from active tab based on selected mode
 */
async function fetchContentForCurrentMode(force = false) {
  if (!currentActiveTab || !currentActiveTab.id) {
    await refreshActiveTab();
  }
  if (!currentActiveTab || !currentActiveTab.id) return;

  // Cannot inject into chrome:// or edge:// pages
  if (currentActiveTab.url && (currentActiveTab.url.startsWith('chrome://') || currentActiveTab.url.startsWith('edge://') || currentActiveTab.url.startsWith('about:'))) {
    if (force) {
      alert(t('unsupported_page'));
    }
    return;
  }

  try {
    if (currentMode === 'selection') {
      const resp = await chrome.tabs.sendMessage(currentActiveTab.id, { type: 'GET_SELECTION_DATA' });
      if (resp) {
        if (resp.title) pageInfo.title = resp.title;
        if (resp.url) pageInfo.url = resp.url;
        updateTitleBadge(pageInfo.title, pageInfo.url);

        if (resp.html || resp.text) {
          rawHtmlCache.selectionHtml = resp.html || '';
          rawHtmlCache.selectionText = resp.text || '';
          rawHtmlCache.selectionIsMarkdown = !!resp.isMarkdown;
          regenerateMarkdown();
        } else if (force || !editor.value.trim()) {
          toggleEmptyState(true);
        }
      } else if (force || !editor.value.trim()) {
        toggleEmptyState(true);
      }
    } else if (currentMode === 'article') {
      const resp = await chrome.tabs.sendMessage(currentActiveTab.id, { type: 'GET_PAGE_DATA' });
      if (resp && resp.html) {
        rawHtmlCache.articleHtml = resp.html;
        pageInfo.title = resp.title || pageInfo.title;
        pageInfo.url = resp.url || pageInfo.url;
        updateTitleBadge(pageInfo.title, pageInfo.url);
        regenerateMarkdown();
      }
    }
  } catch (err) {
    console.warn('Could not communicate with content script:', err);
    if (force && !editor.value.trim()) {
      toggleEmptyState(true);
    }
  }
}

/**
 * Re-generate markdown from cached HTML and options
 */
function regenerateMarkdown() {
  let sourceHtml = '';
  let sourceText = '';
  let isMd = false;

  if (currentMode === 'selection') {
    sourceHtml = rawHtmlCache.selectionHtml;
    sourceText = rawHtmlCache.selectionText;
    isMd = !!rawHtmlCache.selectionIsMarkdown;
  } else {
    sourceHtml = rawHtmlCache.articleHtml || rawHtmlCache.pageHtml;
  }

  if (!sourceHtml && !sourceText) {
    if (!editor.value.trim()) toggleEmptyState(true);
    return;
  }

  const markdown = htmlToMarkdown(sourceHtml || sourceText, {
    baseUrl: pageInfo.url,
    title: pageInfo.title,
    sourceUrl: pageInfo.url,
    includeMetadata: toggleFrontmatter.checked,
    rawText: sourceText,
    isMarkdown: isMd
  });

  setMarkdownContent(markdown);
}

/**
 * Set markdown into editor and trigger stats update
 */
function setMarkdownContent(mdText) {
  editor.value = normalizeMarkdownTables(mdText);
  updateStats();
  toggleEmptyState(editor.value.trim().length === 0);
  if (viewPreviewBtn.classList.contains('active')) {
    renderPreview();
  }
}

/**
 * Update Token and character statistics
 */
function updateStats() {
  const text = editor.value;
  const stats = countTokensAndChars(text);
  charCountEl.textContent = t('char_count', { count: stats.chars.toLocaleString() });
  tokenCountEl.textContent = t('token_count', { count: stats.estimatedTokens.toLocaleString() });
}

/**
 * Switch view between Raw editor and Preview
 */
function switchView(view) {
  if (view === 'raw') {
    viewRawBtn.classList.add('active');
    viewPreviewBtn.classList.remove('active');
    editorWrap.classList.remove('hidden');
    previewWrap.classList.add('hidden');
  } else {
    viewPreviewBtn.classList.add('active');
    viewRawBtn.classList.remove('active');
    editorWrap.classList.add('hidden');
    previewWrap.classList.remove('hidden');
    renderPreview();
  }
}

/**
 * Simple, robust Markdown to HTML renderer for the preview tab
 */
function renderPreview() {
  const raw = normalizeMarkdownTables(editor.value);
  if (!raw.trim()) {
    markdownPreview.innerHTML = `<p style="color:#64748b;">${t('preview_empty')}</p>`;
    return;
  }

  let html = raw
    // Escape special HTML chars
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Restore intentional <br> tags
  html = html.replace(/&lt;br\s*\/?&gt;/gi, '<br>');

  // Code blocks: ```lang ... ```
  html = html.replace(/```([a-zA-Z0-9_\-#+]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="lang-${lang}">${code.trim()}</code></pre>`;
  });

  // Headers: # h1, ## h2, ### h3, #### h4
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Blockquotes: > quote
  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

  // Bold & Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Robust Markdown Table support
  html = html.replace(/(?:^|\n)(\|(?:[^\n]+\|\r?\n?)+)/g, (match, tableBlock) => {
    const rows = tableBlock.trim().split('\n');
    if (rows.length < 2) return match;

    let tableHtml = '\n<table>';
    let isFirstRow = true;

    rows.forEach((row) => {
      const trimmedRow = row.trim();
      // Skip delimiter row like | --- | --- |
      if (/^\|(?:\s*:?-+:?\s*\|)+$/.test(trimmedRow)) return;

      const cells = trimmedRow.split('|').slice(1, -1);
      const tag = isFirstRow ? 'th' : 'td';
      tableHtml += '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>';
      isFirstRow = false;
    });

    tableHtml += '</table>\n';
    return tableHtml;
  });

  // Paragraphs / Newlines (prevent wrapping block tags into <p>)
  html = html.replace(/\n\n+/g, '</p><p>');
  html = '<p>' + html + '</p>';
  html = html.replace(/<p>\s*(<(?:table|pre|h1|h2|h3|h4|blockquote)[\s\S]*?<\/(?:table|pre|h1|h2|h3|h4|blockquote)>)\s*<\/p>/gi, '$1');
  html = html.replace(/<p><\/p>/g, '');

  markdownPreview.innerHTML = html;
}

/**
 * Handle copy action
 */
async function handleCopy() {
  const content = editor.value;
  if (!content.trim()) return;

  try {
    await navigator.clipboard.writeText(content);
    btnCopy.classList.add('copied');
    copyBtnText.textContent = t('btn_copied');

    // Notify host tab toast
    if (currentActiveTab && currentActiveTab.id) {
      const stats = countTokensAndChars(content);
      chrome.tabs.sendMessage(currentActiveTab.id, {
        type: 'SHOW_TOAST',
        text: t('toast_copied_selection'),
        meta: `${t('char_count', { count: stats.chars.toLocaleString() })} · ${t('token_count', { count: stats.estimatedTokens.toLocaleString() })}`
      }).catch(() => {});
    }

    setTimeout(() => {
      btnCopy.classList.remove('copied');
      copyBtnText.textContent = t('btn_copy');
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
    alert(t('copy_failed'));
  }
}

/**
 * Handle markdown download
 */
function handleDownload() {
  const content = editor.value;
  if (!content.trim()) return;

  const safeTitle = (pageInfo.title || 'Web2MD-FeedAI_Export')
    .replace(/[\\/:*?"<>|]/g, '_')
    .slice(0, 50);

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeTitle}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Toggle empty state
 */
function toggleEmptyState(isEmpty) {
  if (isEmpty) {
    emptyState.classList.remove('hidden');
    editorWrap.classList.add('hidden');
    previewWrap.classList.add('hidden');
  } else {
    emptyState.classList.add('hidden');
    if (viewPreviewBtn.classList.contains('active')) {
      previewWrap.classList.remove('hidden');
      editorWrap.classList.add('hidden');
    } else {
      editorWrap.classList.remove('hidden');
      previewWrap.classList.add('hidden');
    }
  }
}

// Start
document.addEventListener('DOMContentLoaded', init);
