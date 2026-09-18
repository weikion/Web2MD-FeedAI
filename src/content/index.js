import { htmlToMarkdown, isInsideMarkdownCodeBlock, isInsideNonMarkdownCodeBlock, isAlreadyMarkdown } from '../utils/html2md.js';
import { extractArticle } from '../utils/readability.js';
import { countTokensAndChars } from '../utils/token.js';
import { t, setLocale, detectDefaultLocale } from '../utils/i18n.js';

let floatingBtn = null;
let toastTimeout = null;

// Synchronize locale from storage
chrome.storage.local.get(['userLocale'], (res) => {
  if (res && res.userLocale) {
    setLocale(res.userLocale);
  } else {
    setLocale(detectDefaultLocale());
  }
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.userLocale) {
    setLocale(changes.userLocale.newValue);
    if (floatingBtn) {
      removeFloatingButton();
    }
  }
});

/**
 * Directly read the <title> tag value from rendered HTML
 */
function getHtmlTitle() {
  const titleEl = document.querySelector('title');
  if (titleEl && titleEl.textContent && titleEl.textContent.trim()) {
    return titleEl.textContent.trim();
  }
  return document.title || '';
}

/**
 * Get current selection HTML, plain text, and markdown detection status
 */
function getSelectionData() {
  const selection = window.getSelection();
  const pageTitle = getHtmlTitle();
  const pageUrl = window.location.href;

  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    return {
      html: '',
      text: '',
      title: pageTitle,
      url: pageUrl,
      hasSelection: false,
      isMarkdown: false
    };
  }

  const range = selection.getRangeAt(0);
  const container = document.createElement('div');
  container.appendChild(range.cloneContents());

  // Clean line numbers if any
  const lineNumbers = container.querySelectorAll('.line-numbers, .hljs-ln-numbers, .gutter, .linenumber');
  const hasLineNumbers = lineNumbers.length > 0;
  if (hasLineNumbers) {
    lineNumbers.forEach(el => el.remove());
  }

  const rawText = hasLineNumbers ? container.textContent.trim() : selection.toString().trim();
  if (!rawText) {
    return {
      html: '',
      text: '',
      title: pageTitle,
      url: pageUrl,
      hasSelection: false,
      isMarkdown: false
    };
  }

  // Detect whether the selected content is already in Markdown format
  let isMarkdown = false;
  let ancestor = range.commonAncestorContainer;
  if (ancestor && ancestor.nodeType === 3) {
    ancestor = ancestor.parentElement;
  }

  if (isInsideMarkdownCodeBlock(ancestor)) {
    isMarkdown = true;
  } else if (!isInsideNonMarkdownCodeBlock(ancestor)) {
    const isMdPage = (typeof document !== 'undefined' && document.contentType === 'text/markdown') ||
                     /\.(md|markdown)(\?.*)?$/i.test(window.location.pathname) ||
                     (window.location.hostname === 'raw.githubusercontent.com' && /\.(md|markdown)$/i.test(window.location.pathname));

    if (isMdPage) {
      isMarkdown = true;
    } else {
      isMarkdown = isAlreadyMarkdown(rawText, container);
    }
  }

  return {
    html: container.innerHTML,
    text: rawText,
    title: pageTitle,
    url: pageUrl,
    hasSelection: true,
    isMarkdown: isMarkdown
  };
}

/**
 * Get whole page article or raw HTML
 */
function getPageData() {
  const article = extractArticle(document);
  return {
    title: getHtmlTitle() || article.title,
    url: window.location.href,
    html: article.contentHtml,
    text: article.textContent,
    excerpt: article.excerpt,
    siteName: article.siteName
  };
}

/**
 * Show a sleek floating toast notification on the page
 */
function showToast(message, metaText = '') {
  let toast = document.getElementById('copytomd-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'copytomd-toast';
    document.body.appendChild(toast);
  }

  clearTimeout(toastTimeout);
  toast.classList.remove('copytomd-toast-hiding');
  toast.innerHTML = `
    <div class="copytomd-toast-check">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </div>
    <span>${message}</span>
    ${metaText ? `<span class="copytomd-toast-badge">${metaText}</span>` : ''}
  `;

  toastTimeout = setTimeout(() => {
    toast.classList.add('copytomd-toast-hiding');
    setTimeout(() => {
      if (toast && toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 250);
  }, 2200);
}

/**
 * Copy text to clipboard safely
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  }
}

/**
 * Convert selection and copy immediately
 */
async function convertSelectionAndCopy(includeMetadata) {
  const data = getSelectionData();
  if (!data) return false;

  let metaPref = false;
  try {
    const prefs = await chrome.storage.local.get(['includeMetadata']);
    if (prefs.includeMetadata !== undefined) metaPref = prefs.includeMetadata;
  } catch (_) {}

  const useMetadata = includeMetadata !== undefined ? includeMetadata : metaPref;

  const markdown = htmlToMarkdown(data.html, {
    baseUrl: data.url,
    title: data.title,
    sourceUrl: data.url,
    includeMetadata: useMetadata,
    rawText: data.text,
    isMarkdown: data.isMarkdown
  });

  const stats = countTokensAndChars(markdown);
  const success = await copyToClipboard(markdown);

  if (success) {
    showToast(t('toast_copied_selection'), `${t('char_count', { count: stats.chars })} · ${t('token_count', { count: stats.estimatedTokens })}`);

    // Sync data to chrome.storage for SidePanel to display
    chrome.storage.local.set({
      latestMarkdown: markdown,
      latestSource: {
        type: 'selection',
        title: data.title,
        url: data.url,
        timestamp: Date.now()
      }
    });
  }
  return success;
}


let selectionSeq = 0;

/**
 * Render or remove the floating tooltip button near the user's cursor selection
 */
function updateFloatingButton() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    removeFloatingButton();
    return;
  }

  const text = selection.toString().trim();
  if (!text) {
    removeFloatingButton();
    return;
  }

  // Avoid interfering inside form fields
  const activeEl = document.activeElement;
  if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
    removeFloatingButton();
    return;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    removeFloatingButton();
    return;
  }

  const currentSeq = ++selectionSeq;
  const data = getSelectionData();

  // If sidepanel is currently open in this window, sync selection directly and skip popup menu
  try {
    chrome.runtime.sendMessage({
      type: 'HANDLE_SELECTION_CHANGE',
      data: data
    }, (response) => {
      // Ignore outdated response
      if (currentSeq !== selectionSeq) return;

      if (!chrome.runtime.lastError && response && response.handled) {
        // Sidepanel is open and received selection: do not show floating menu
        removeFloatingButton();
      } else {
        // Sidepanel is not open: show floating menu as usual
        showFloatingButton(rect);
      }
    });
  } catch (_) {
    showFloatingButton(rect);
  }
}

/**
 * Render floating menu popup near cursor
 */
function showFloatingButton(rect) {
  // Avoid showing popup inside tiny or hidden utility iframes
  if (window.self !== window.top && (window.innerWidth < 120 || window.innerHeight < 60)) {
    return;
  }

  if (!floatingBtn) {
    floatingBtn = document.createElement('div');
    floatingBtn.id = 'copytomd-floating-btn';
    floatingBtn.innerHTML = `
      <div class="copytomd-float-icon">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
        </svg>
      </div>
      <span class="copytomd-float-action" id="copytomd-act-copy">${t('float_copy')}</span>
      <span class="copytomd-float-divider"></span>
      <span class="copytomd-float-action" id="copytomd-act-panel" title="${t('float_panel_title')}">${t('float_panel')}</span>
    `;

    floatingBtn.addEventListener('mousedown', (e) => {
      e.stopPropagation(); // prevent collapsing selection
    });

    floatingBtn.querySelector('#copytomd-act-copy').addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      await convertSelectionAndCopy();
      removeFloatingButton();
    });

    floatingBtn.querySelector('#copytomd-act-panel').addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const data = getSelectionData();
      if (data) {
        const md = htmlToMarkdown(data.html, {
          baseUrl: data.url,
          title: data.title,
          sourceUrl: data.url,
          rawText: data.text,
          isMarkdown: data.isMarkdown
        });
        await chrome.storage.local.set({
          latestMarkdown: md,
          latestSource: {
            type: 'selection',
            title: data.title,
            url: data.url,
            timestamp: Date.now()
          }
        });
      }
      chrome.runtime.sendMessage({ type: 'OPEN_SIDEPANEL' });
      removeFloatingButton();
    });

    document.body.appendChild(floatingBtn);
  }

  // Positioning
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  let top = rect.top + scrollY - 38;
  let left = rect.right + scrollX - 50;

  // Ensure it doesn't float above top edge
  if (rect.top < 45) {
    top = rect.bottom + scrollY + 8;
  }
  // Ensure it stays within viewport horizontally
  left = Math.max(10, Math.min(left, window.innerWidth - 180 + scrollX));

  floatingBtn.style.top = `${top}px`;
  floatingBtn.style.left = `${left}px`;
}


function removeFloatingButton() {
  if (floatingBtn && floatingBtn.parentNode) {
    floatingBtn.parentNode.removeChild(floatingBtn);
    floatingBtn = null;
  }
}

// Listen for mouseup and keyup to trigger floating button
document.addEventListener('mouseup', () => {
  setTimeout(updateFloatingButton, 20);
});

document.addEventListener('keyup', (e) => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Shift'].includes(e.key)) {
    setTimeout(updateFloatingButton, 20);
  } else if (e.key === 'Escape') {
    removeFloatingButton();
  }
});

document.addEventListener('mousedown', (e) => {
  if (floatingBtn && !floatingBtn.contains(e.target)) {
    removeFloatingButton();
  }
});

// Message listener from background or sidepanel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_PAGE_INFO') {
    if (window.self === window.top) {
      sendResponse({
        title: document.title || '',
        url: window.location.href || ''
      });
      return true;
    }
  }

  if (message.type === 'GET_SELECTION_DATA') {
    const data = getSelectionData();
    if (data && data.hasSelection) {
      sendResponse(data);
      return true;
    }
    return false;
  }

  if (message.type === 'GET_PAGE_DATA') {
    // Only top window extracts full page article
    if (window.self === window.top) {
      const data = getPageData();
      sendResponse(data);
      return true;
    }
    return false;
  }

  if (message.type === 'TRIGGER_SELECTION_CONVERT') {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed && selection.toString().trim()) {
      convertSelectionAndCopy(message.includeMetadata || false).then(sendResponse);
      return true;
    }
    return false;
  }

  if (message.type === 'SHOW_TOAST') {
    showToast(message.text, message.meta || '');
    sendResponse({ success: true });
    return true;
  }
});
