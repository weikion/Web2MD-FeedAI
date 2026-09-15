/**
 * Token and character counter utility optimized for modern LLMs (GPT-4o, Claude 3.5, DeepSeek, etc.)
 */

export function countTokensAndChars(text) {
  if (!text || typeof text !== 'string') {
    return {
      chars: 0,
      words: 0,
      cjkChars: 0,
      estimatedTokens: 0
    };
  }

  const chars = text.length;

  // Count CJK (Chinese, Japanese, Korean) characters
  const cjkMatches = text.match(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g);
  const cjkChars = cjkMatches ? cjkMatches.length : 0;

  // Count non-CJK words (English words, numbers, etc.)
  const nonCjkText = text.replace(/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g, ' ');
  const wordsMatches = nonCjkText.trim().match(/[a-zA-Z0-9_\-]+/g);
  const words = wordsMatches ? wordsMatches.length : 0;

  // Modern LLM token estimation heuristic:
  // - CJK: ~0.65 - 0.75 tokens per character
  // - English words: ~1.2 - 1.3 tokens per word
  // - Other symbols/code: ~1 token per 3-4 chars
  const nonCjkSymbolChars = Math.max(0, chars - cjkChars - (words * 5));
  const estimatedTokens = Math.ceil(
    (cjkChars * 0.7) +
    (words * 1.25) +
    (nonCjkSymbolChars * 0.3)
  );

  return {
    chars,
    words,
    cjkChars,
    estimatedTokens: Math.max(chars > 0 ? 1 : 0, estimatedTokens)
  };
}
