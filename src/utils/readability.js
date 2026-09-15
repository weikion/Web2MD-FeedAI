import { Readability } from '@mozilla/readability';

/**
 * Extract clean article content from current page using Mozilla's Readability algorithm
 */
export function extractArticle(doc = document) {
  try {
    const documentClone = doc.cloneNode(true);
    const reader = new Readability(documentClone, {
      keepClasses: false,
      charThreshold: 20
    });
    const article = reader.parse();

    if (article && article.content) {
      return {
        title: article.title || doc.title || '',
        byline: article.byline || '',
        excerpt: article.excerpt || '',
        contentHtml: article.content,
        textContent: article.textContent,
        length: article.length,
        siteName: article.siteName || location.hostname
      };
    }
  } catch (err) {
    console.warn('[CopyToMD] Readability extraction failed, falling back to body cleanup:', err);
  }

  // Fallback: extract from body directly removing scripts and styles
  const fallbackClone = doc.body.cloneNode(true);
  const elementsToRemove = fallbackClone.querySelectorAll('script, style, noscript, nav, header, footer, aside');
  elementsToRemove.forEach(el => el.remove());

  return {
    title: doc.title || '',
    byline: '',
    excerpt: '',
    contentHtml: fallbackClone.innerHTML,
    textContent: fallbackClone.textContent,
    length: fallbackClone.textContent.length,
    siteName: location.hostname
  };
}
