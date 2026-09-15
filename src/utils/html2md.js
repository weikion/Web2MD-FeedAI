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
 * Main function to convert HTML string or DOM element to Markdown
 */
export function htmlToMarkdown(htmlOrElement, options = {}) {
  const {
    baseUrl = (typeof window !== 'undefined' ? window.location.href : ''),
    includeMetadata = false,
    title = '',
    sourceUrl = ''
  } = options;

  let container;
  if (typeof htmlOrElement === 'string') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlOrElement, 'text/html');
    container = doc.body;
  } else {
    container = htmlOrElement;
  }

  const processedElement = preprocessElement(container, baseUrl);
  const turndown = createTurndownService();
  let markdown = turndown.turndown(processedElement);

  // Normalize broken table lines into valid GFM tables
  markdown = normalizeMarkdownTables(markdown);

  // Clean excessive empty lines (more than 2 consecutive newlines)
  markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

  // Add AI metadata frontmatter if requested
  if (includeMetadata && (title || sourceUrl)) {
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
