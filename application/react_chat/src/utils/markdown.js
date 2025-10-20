/**
 * Markdown and Content Processing Utilities
 */

import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { parseCitations } from './citations';

/**
 * Configure marked options
 */
marked.setOptions({
  breaks: true,
  gfm: true,
});

/**
 * Convert Unicode box-drawing tables to Markdown tables
 */
export function convertUnicodeTableToMarkdown(text) {
  const lines = text.split('\n');
  const tableLines = [];
  let inTable = false;
  let isFirstDataRow = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (/^[─┌┐├┤└┘│┬┴┼]+$/.test(line.trim())) {
      if (!inTable && /┌.*┐/.test(line)) {
        inTable = true;
        isFirstDataRow = true;
      }
      continue;
    }

    if (inTable && /^│/.test(line)) {
      const cells = line.split('│')
        .slice(1, -1)
        .map(cell => cell.trim());
      
      tableLines.push('| ' + cells.join(' | ') + ' |');
      
      if (isFirstDataRow) {
        tableLines.push('| ' + cells.map(() => '---').join(' | ') + ' |');
        isFirstDataRow = false;
      }
    } else if (inTable) {
      inTable = false;
      isFirstDataRow = true;
    }
  }

  if (tableLines.length > 0) {
    return text.replace(/[─┌┐├┤└┘│┬┴┼\n]+/g, (match) => {
      if (tableLines.length > 0) {
        const table = tableLines.join('\n');
        tableLines.length = 0;
        return table;
      }
      return match;
    });
  }

  return text;
}

/**
 * Add target="_blank" to external links
 */
export function addTargetBlankToExternalLinks(html) {
  return html.replace(
    /<a\s+href="(https?:\/\/[^"]+)"/gi,
    '<a href="$1" target="_blank" rel="noopener noreferrer"'
  );
}

/**
 * Process message content with citations and markdown
 * Returns both HTML and citation metadata
 */
export function processMessageContent(content, existingCitationsMap = {}, hybridCitations = []) {
  if (!content) return { html: '', citations: [], citationsMap: {} };

  // Clean up content
  let cleaned = content.trim().replace(/\n{3,}/g, '\n\n');
  
  // Remove trailing brackets from URLs
  cleaned = cleaned.replace(/(\bhttps?:\/\/\S+)(%5D|\])+/gi, (_, url) => url);
  
  // Parse inline citations - now returns numbered format, pass hybridCitations for matching
  const { result: withCitations, newCitations, citationsMap } = parseCitations(cleaned, existingCitationsMap, hybridCitations);
  
  // Convert tables
  const withTables = convertUnicodeTableToMarkdown(withCitations);
  
  // Convert markdown to HTML
  const html = marked.parse(withTables);
  
  // Sanitize HTML - allow data-citation-id and data-citation-number
  const sanitized = DOMPurify.sanitize(html, {
    ADD_ATTR: ['target', 'rel', 'data-citation-id', 'data-citation-number'],
    ADD_TAGS: ['sup'],
  });
  
  // Add target blank to external links
  const finalHtml = addTargetBlankToExternalLinks(sanitized);
  
  return {
    html: finalHtml,
    citations: newCitations,
    citationsMap: citationsMap,
  };
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

