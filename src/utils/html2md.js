import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

/**
 * Configure Turndown with AI-optimized rules
 */
export function createTurndownService() {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*'
  });

  // Load GitHub Flavored Markdown (GFM) plugins (tables, strikethrough, task lists)
  turndownService.use(gfm);

  // Strip scripts, styles, noscript, iframes, SVGs (often icons)
  turndownService.remove(['script', 'style', 'noscript', 'canvas', 'iframe']);

  // Custom rule: Code blocks with language detection and clean formatting
  turndownService.addRule('fencedCodeBlockWithLang', {
    filter: function (node, options) {
      return (
        options.codeBlockStyle === 'fenced' &&
        node.nodeName === 'PRE' &&
        node.firstChild &&
        node.firstChild.nodeName === 'CODE'
      );
    },
    replacement: function (content, node, options) {
      const codeNode = node.firstChild;
      let language = '';

      // Try to find language from class names (e.g. language-js, lang-python, hljs-json)
      const classAttr = (codeNode.getAttribute('class') || '') + ' ' + (node.getAttribute('class') || '');
      const match = classAttr.match(/(?:language|lang|hljs)-([a-zA-Z0-9_\-#+]+)/i);
      if (match) {
        language = match[1].toLowerCase();
      } else if (codeNode.getAttribute('data-lang')) {
        language = codeNode.getAttribute('data-lang').toLowerCase();
      } else if (node.getAttribute('data-lang')) {
        language = node.getAttribute('data-lang').toLowerCase();
      }

      // Extract text content cleanly, excluding line number elements
      const clone = codeNode.cloneNode(true);
      const lineNumbers = clone.querySelectorAll('.line-numbers, .hljs-ln-numbers, .gutter, .linenumber');
      lineNumbers.forEach(el => el.remove());

      const codeText = clone.textContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const delimiter = '```';

      return '\n\n' + delimiter + (language || '') + '\n' + codeText.replace(/\n+$/, '') + '\n' + delimiter + '\n\n';
    }
  });

  // Custom rule: LaTeX / MathJax / KaTeX formulas
  turndownService.addRule('mathFormula', {
    filter: function (node) {
      if (node.nodeName === 'SPAN' || node.nodeName === 'DIV') {
        if (node.classList.contains('katex') || node.classList.contains('MathJax') || node.hasAttribute('data-tex')) {
          return true;
        }
      }
      return false;
    },
    replacement: function (content, node) {
      const tex = node.getAttribute('data-tex') ||
                  node.getAttribute('alt') ||
                  (node.querySelector('annotation[encoding="application/x-tex"]') || {}).textContent;
      if (tex && tex.trim()) {
        const isBlock = node.nodeName === 'DIV' || node.classList.contains('katex-display') || node.classList.contains('MathJax_Display');
        return isBlock ? `\n\n$$ ${tex.trim()} $$\n\n` : ` $${tex.trim()}$ `;
      }
      return content;
    }
  });

  // Custom rule: Clean up noisy link buttons or empty anchors
  turndownService.addRule('cleanLinks', {
    filter: function (node) {
      return node.nodeName === 'A' && !node.getAttribute('href');
    },
    replacement: function (content) {
      return content;
    }
  });

  // Custom rule: Ensure table cells NEVER produce broken multi-line markdown
  turndownService.addRule('tableCell', {
    filter: ['th', 'td'],
    replacement: function (content, node) {
      let clean = content
        .replace(/\s*\r?\n\s*/g, '<br>')
        .replace(/(?:<br\s*\/?>\s*)+/gi, '<br>')
        .replace(/^<br\s*\/?>|<br\s*\/?>$/gi, '')
        .trim();

      const siblings = Array.from(node.parentNode.children);
      const index = siblings.indexOf(node);
      const prefix = index === 0 ? '| ' : ' ';
      return prefix + clean + ' |';
    }
  });

  return turndownService;
}

/**
 * Pre-process DOM element before converting to Markdown:
 * - Converts relative URLs (a[href], img[src]) to absolute URLs
 * - Removes hidden elements
 */
export function preprocessElement(element, baseUrl) {
  const container = element.cloneNode(true);
  const base = baseUrl || window.location.href;

  // Resolve relative URLs to absolute
  const links = container.querySelectorAll('a[href]');
  links.forEach(a => {
    try {
      const href = a.getAttribute('href');
      if (href && !href.startsWith('javascript:') && !href.startsWith('#')) {
        a.setAttribute('href', new URL(href, base).href);
      }
    } catch (_) {}
  });

  const images = container.querySelectorAll('img[src]');
  images.forEach(img => {
    try {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('data:')) {
        img.setAttribute('src', new URL(src, base).href);
      }
    } catch (_) {}
  });

  // Remove elements explicitly hidden
  const hiddenElements = container.querySelectorAll('[hidden], [aria-hidden="true"]');
  hiddenElements.forEach(el => el.remove());

  // Wrap orphan tr or tbody elements if user selected partial table
  const orphanRows = Array.from(container.querySelectorAll('tr')).filter(tr => !tr.closest('table'));
  if (orphanRows.length > 0) {
    const wrapperTable = (container.ownerDocument || document).createElement('table');
    const firstOrphan = orphanRows[0];
    firstOrphan.parentNode.insertBefore(wrapperTable, firstOrphan);
    orphanRows.forEach(tr => wrapperTable.appendChild(tr));
  }

  // Normalize HTML tables so Turndown GFM can convert non-standard tables:
  // - Handles tables lacking <thead> or with only <td> cells in the first row (e.g. Slate.js, Tencent docs)
  // - Removes colgroup/col which can interfere with column counts
  const tables = container.querySelectorAll('table');
  tables.forEach(table => {
    const colgroups = table.querySelectorAll('colgroup');
    colgroups.forEach(cg => cg.remove());

    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length === 0) return;

    const firstRow = rows[0];
    const firstRowCells = Array.from(firstRow.children).filter(el => el.nodeName === 'TD' || el.nodeName === 'TH');
    if (firstRowCells.length === 0) return;

    const allTh = firstRowCells.every(c => c.nodeName === 'TH');
    let thead = table.querySelector('thead');

    if (!thead || !allTh) {
      if (!thead) {
        thead = (table.ownerDocument || document).createElement('thead');
        table.insertBefore(thead, table.firstChild);
      }

      const newHeaderRow = (table.ownerDocument || document).createElement('tr');
      Array.from(firstRow.attributes).forEach(attr => newHeaderRow.setAttribute(attr.name, attr.value));

      firstRowCells.forEach(cell => {
        const th = (table.ownerDocument || document).createElement('th');
        Array.from(cell.attributes).forEach(attr => th.setAttribute(attr.name, attr.value));
        while (cell.firstChild) {
          th.appendChild(cell.firstChild);
        }
        newHeaderRow.appendChild(th);
      });

      thead.appendChild(newHeaderRow);
      firstRow.remove();
    }
  });

  return container;
}

/**
 * Normalize and repair broken Markdown tables where cells were accidentally wrapped onto multiple lines.
 * Transforms multi-line cell breaks into standard GFM <br> tags.
 */
export function normalizeMarkdownTables(md) {
  if (!md || typeof md !== 'string') return md;

  const lines = md.split('\n');
  const result = [];
  let inTable = false;
  let pendingRow = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if delimiter row | --- | --- |
    const isDelimiter = /^\|(?:\s*:?-+:?\s*\|)+$/.test(trimmed);
    const startsWithPipe = trimmed.startsWith('|');
    const endsWithPipe = trimmed.endsWith('|');

    if (isDelimiter) {
      if (pendingRow !== null) {
        result.push(pendingRow);
        pendingRow = null;
      }
      result.push(line);
      inTable = true;
      continue;
    }

    if (inTable) {
      // Empty line ends table
      if (trimmed === '') {
        if (pendingRow !== null) {
          result.push(pendingRow);
          pendingRow = null;
        }
        result.push(line);
        inTable = false;
        continue;
      }

      if (startsWithPipe && endsWithPipe) {
        // Complete table row
        if (pendingRow !== null) {
          result.push(pendingRow);
        }
        pendingRow = line;
      } else if (startsWithPipe && !endsWithPipe) {
        // Row starts with pipe but broken onto next line
        if (pendingRow !== null) {
          result.push(pendingRow);
        }
        pendingRow = line;
      } else if (!startsWithPipe && endsWithPipe) {
        // Trailing end of row
        if (pendingRow !== null) {
          pendingRow = pendingRow.replace(/\s+$/, '') + '<br>' + trimmed;
          result.push(pendingRow);
          pendingRow = null;
        } else {
          result.push(line);
        }
      } else {
        // Continuation line in middle of cell
        if (pendingRow !== null) {
          pendingRow = pendingRow.replace(/\s+$/, '') + '<br>' + trimmed;
        } else {
          result.push(line);
        }
      }
    } else {
      result.push(line);
    }
  }

  if (pendingRow !== null) {
    result.push(pendingRow);
  }

  return result.join('\n');
}


/**
 * Detect if an element or selection is within an explicit Markdown code block
 */
export function isInsideMarkdownCodeBlock(node) {
  if (!node) return false;
  let el = (node.nodeType === 3 /* Node.TEXT_NODE */) ? node.parentElement : node;
  while (el && el.tagName !== 'BODY' && el.tagName !== 'HTML') {
    const className = (typeof el.className === 'string') ? el.className : (el.getAttribute ? (el.getAttribute('class') || '') : '');
    if (/(?:^|\s)(?:language|lang|hljs)-(?:markdown|md)(?:\s|$)/i.test(className)) {
      return true;
    }
    const dataLang = el.getAttribute ? (el.getAttribute('data-lang') || el.getAttribute('data-language') || '') : '';
    if (/^(?:markdown|md)$/i.test(dataLang.trim())) {
      return true;
    }
    el = el.parentElement;
  }
  return false;
}

/**
 * Detect if an element or selection is within a code block of a non-markdown programming language
 */
export function isInsideNonMarkdownCodeBlock(node) {
  if (!node) return false;
  let el = (node.nodeType === 3 /* Node.TEXT_NODE */) ? node.parentElement : node;
  while (el && el.tagName !== 'BODY' && el.tagName !== 'HTML') {
    const className = (typeof el.className === 'string') ? el.className : (el.getAttribute ? (el.getAttribute('class') || '') : '');
    const match = className.match(/(?:^|\s)(?:language|lang|hljs)-([a-zA-Z0-9_\-#+]+)(?:\s|$)/i);
    if (match) {
      const lang = match[1].toLowerCase();
      if (lang !== 'markdown' && lang !== 'md') {
        return true;
      }
    }
    const dataLang = el.getAttribute ? (el.getAttribute('data-lang') || el.getAttribute('data-language') || '') : '';
    if (dataLang.trim()) {
      const lang = dataLang.trim().toLowerCase();
      if (lang !== 'markdown' && lang !== 'md') {
        return true;
      }
    }
    el = el.parentElement;
  }
  return false;
}

/**
 * Check if the text content exhibits clear Markdown syntax characteristics
 */
export function isMarkdownText(text) {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (!trimmed) return false;

  // 1. YAML Frontmatter
  if (/^---\r?\n[\s\S]+?\r?\n---/.test(trimmed)) {
    return true;
  }

  // 2. Fenced code block (``` or ~~~)
  if (/(?:^|\n)```[a-zA-Z0-9_\-#+]*\s*\n[\s\S]*?\n```/.test(trimmed) || /^```[\s\S]*?```$/.test(trimmed)) {
    return true;
  }

  // 3. Markdown table (header row with | followed by separator row | --- |)
  if (/\|[^\n]+\|\r?\n\|(?:\s*:?---+:?\s*\|)+/.test(trimmed)) {
    return true;
  }

  // 4. Markdown links or images: [text](url) or ![alt](url)
  if (/(?:^|[^\\])!?\[[^\]\n]{1,200}\]\((?:https?:\/\/[^\s)]+|\/[^\s)]+|#[^\s)]+)\)/.test(trimmed)) {
    return true;
  }

  // 5. Task list items: - [ ] or - [x]
  if (/(?:^|\n)\s*[-*+]\s+\[[ xX]\]\s+\S+/.test(trimmed)) {
    return true;
  }

  // Check for typical programming language code to avoid false positives on Python/Shell comments etc.
  const looksLikeCode = /(?:^|\n)\s*(?:def\s+\w+|function\s*\(|class\s+\w+|import\s+[\w{}*]+|export\s+(?:default|const|let|var|function)|const\s+\w+\s*=|let\s+\w+\s*=|var\s+\w+\s*=|return\s+[\w'"({]|public\s+(?:static\s+)?void|package\s+\w+)/.test(trimmed);

  // Score structural markdown elements
  let score = 0;

  // ATX Headings: # Header (only if not typical programming code)
  if (/(?:^|\n)#{1,6}\s+\S+/.test(trimmed)) {
    if (!looksLikeCode) {
      score += 2;
    }
  }

  // Bold or strikethrough: **bold** or ~~strike~~
  if (/(?:^|[^\\])\*\*(?!\s)[^\n]+?(?<!\s)\*\*/.test(trimmed) || /(?:^|[^\\])~~(?!\s)[^\n]+?(?<!\s)~~/.test(trimmed)) {
    score += 1.5;
  }

  // Blockquote: > quote
  if (/(?:^|\n)>\s+\S+/.test(trimmed)) {
    score += 1.5;
  }

  // Bullet list with multiple items (e.g. - item 1\n- item 2)
  if (/(?:^|\n)\s*[-*+]\s+\S+[\s\S]*?\n\s*[-*+]\s+\S+/.test(trimmed)) {
    score += 2;
  } else if (/(?:^|\n)\s*[-*+]\s+\S+/.test(trimmed) && !looksLikeCode) {
    score += 1;
  }

  // Numbered list with multiple items
  if (/(?:^|\n)\s*\d+\.\s+\S+[\s\S]*?\n\s*\d+\.\s+\S+/.test(trimmed)) {
    score += 2;
  } else if (/(?:^|\n)\s*\d+\.\s+\S+/.test(trimmed)) {
    score += 1;
  }

  // Inline code: `code`
  if (/(?:^|[^\\])`[^`\n]{1,80}`(?:$|[^\\])/.test(trimmed)) {
    score += 1;
  }

  // Horizontal rule: --- or ***
  if (/(?:^|\n)(?:---|\*\*\*|___)\s*$/m.test(trimmed)) {
    score += 1;
  }

  return score >= 2;
}

/**
 * Check if a container contains rich rendered HTML elements (outside pre/code),
 * indicating that it is a rendered webpage rather than already markdown.
 */
export function hasRichHtmlElements(container) {
  if (!container) return false;
  let el = container;
  if (typeof container === 'string') {
    if (!/<[a-z][\s\S]*>/i.test(container)) return false;
    if (typeof DOMParser !== 'undefined') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(container, 'text/html');
      el = doc.body;
    } else {
      return false;
    }
  }
  if (!el || !el.querySelectorAll) return false;

  const richElements = el.querySelectorAll('h1, h2, h3, h4, h5, h6, table, ul, ol, dl, hr, blockquote, a[href], img[src]');
  for (let i = 0; i < richElements.length; i++) {
    const item = richElements[i];
    if (item.closest && !item.closest('pre, code')) {
      return true;
    }
  }
  return false;
}

/**
 * Determine whether content is already in Markdown format and does not require HTML-to-Markdown conversion
 */
export function isAlreadyMarkdown(text, htmlOrElement, options = {}) {
  if (options && options.isMarkdown !== undefined) {
    return !!options.isMarkdown;
  }

  // If container has rich rendered HTML elements (headings, tables, links outside pre/code),
  // it should be converted from HTML to Markdown.
  if (htmlOrElement && hasRichHtmlElements(htmlOrElement)) {
    return false;
  }

  const rawText = (typeof text === 'string' && text) ? text :
                  (htmlOrElement && typeof htmlOrElement !== 'string' && htmlOrElement.textContent) ? htmlOrElement.textContent :
                  (typeof htmlOrElement === 'string' && !/<[a-z][\s\S]*>/i.test(htmlOrElement)) ? htmlOrElement : '';

  return isMarkdownText(rawText);
}

/**
 * Main function to convert HTML string or DOM element to Markdown
 */
export function htmlToMarkdown(htmlOrElement, options = {}) {
  const {
    baseUrl = (typeof window !== 'undefined' ? window.location.href : ''),
    includeMetadata = false,
    title = '',
    sourceUrl = '',
    rawText = '',
    isMarkdown = undefined
  } = options;

  let container;
  if (typeof htmlOrElement === 'string') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlOrElement, 'text/html');
    container = doc.body;
  } else {
    container = htmlOrElement;
  }

  // Check if content is already in Markdown format (no need to convert with Turndown)
  const alreadyMd = isMarkdown === true || (isMarkdown === undefined && isAlreadyMarkdown(rawText || (container ? container.textContent : ''), container, options));

  let markdown = '';

  if (alreadyMd) {
    markdown = (rawText || (container ? container.textContent : (typeof htmlOrElement === 'string' ? htmlOrElement : ''))).trim();
  } else {
    const processedElement = preprocessElement(container, baseUrl);
    const turndown = createTurndownService();
    markdown = turndown.turndown(processedElement);
  }

  // Normalize broken table lines into valid GFM tables
  markdown = normalizeMarkdownTables(markdown);

  // Clean excessive empty lines (more than 2 consecutive newlines)
  markdown = markdown.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

  // Add AI metadata frontmatter if requested and not already present
  if (includeMetadata && (title || sourceUrl) && !/^---\r?\n[\s\S]+?\r?\n---/m.test(markdown)) {
    const lines = [
      '---',
      title ? `title: "${title.replace(/"/g, '\\"')}"` : '',
      sourceUrl ? `source: "${sourceUrl}"` : '',
      `captured_at: "${new Date().toISOString()}"`,
      '---'
    ].filter(line => line !== '');

    markdown = lines.join('\n') + '\n\n' + markdown;
  }

  return markdown;
}
