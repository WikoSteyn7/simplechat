/**
 * Citation Parsing and Rendering Utilities
 * Handles inline subscript citations from the backend
 */

/**
 * Parse citation ID to extract document ID and page number
 */
export function parseDocIdAndPage(citationId) {
  if (!citationId) return { docId: null, pageNumber: null };

  const lastUnderscore = citationId.lastIndexOf('_');
  if (lastUnderscore === -1) return { docId: citationId, pageNumber: null };

  const docId = citationId.substring(0, lastUnderscore);
  const pageNumber = parseInt(citationId.substring(lastUnderscore + 1), 10);

  return { docId, pageNumber: isNaN(pageNumber) ? null : pageNumber };
}

/**
 * Parse citations in message content
 * Converts (Source: filename, Page(s): X) format to numbered subscripts [1], [2], etc.
 * Handles both with and without [#citation_id] brackets
 */
export function parseCitations(message, citationsMap = {}, hybridCitations = []) {
  // Updated regex to make the bracket section optional
  const citationRegex = /\(Source:\s*([^,]+),\s*Page(?:s)?:\s*([^)]+)\)(?:\s*((?:\[#.*?\]\s*)+))?/gi;
  let citationCounter = Object.keys(citationsMap).length;
  const newCitations = [];

  const result = message.replace(citationRegex, (whole, filename, pages, bracketSection) => {
    let citationIds = [];

    // Try to extract citation IDs from brackets if present
    if (bracketSection) {
      const bracketMatches = bracketSection.match(/\[#.*?\]/g) || [];
      bracketMatches.forEach((match) => {
        let inner = match.slice(2, -1).trim();
        const refs = inner.split(/[;,]/);
        refs.forEach((r) => {
          let ref = r.trim();
          if (ref.startsWith('#')) ref = ref.slice(1);
          citationIds.push(ref);
        });
      });
    }

    // If no citation IDs from brackets, try to match from hybridCitations by filename and page
    if (citationIds.length === 0 && hybridCitations.length > 0) {
      const pagesList = pages.split(/,/).map(p => p.trim());
      
      pagesList.forEach(pageStr => {
        const pageNum = parseInt(pageStr, 10);
        if (!isNaN(pageNum)) {
          // Find matching citation in hybridCitations array
          const matchingCitation = hybridCitations.find(c => 
            c.file_name === filename.trim() && 
            (c.page_number === pageNum || c.chunk_sequence === pageNum)
          );
          
          if (matchingCitation) {
            citationIds.push(matchingCitation.citation_id || matchingCitation.chunk_id);
          } else {
            // Generate a synthetic citation ID
            const syntheticId = `${filename.trim().replace(/[^a-zA-Z0-9]/g, '_')}_${pageNum}`;
            citationIds.push(syntheticId);
          }
        }
      });
    }

    // Get unique citation IDs
    const uniqueIds = [...new Set(citationIds)];
    const citationNumbers = [];

    uniqueIds.forEach((citationId) => {
      if (!citationsMap[citationId]) {
        citationCounter++;
        citationsMap[citationId] = citationCounter;
        
        // Extract page number from citation ID
        const parts = citationId.split('_');
        const pageNum = parts[parts.length - 1];
        
        newCitations.push({
          number: citationCounter,
          citationId: citationId,
          fileName: filename.trim(),
          pageNumber: pageNum,
        });
      }
      citationNumbers.push(citationsMap[citationId]);
    });

    // Create numbered citations
    const numberedCitations = citationNumbers.map((num, idx) => 
      `<sup><a href="#citation-ref-${num}" class="citation-page-link" data-citation-id="${uniqueIds[idx]}" data-citation-number="${num}">[${num}]</a></sup>`
    ).join('');

    return numberedCitations;
  });

  return { result, newCitations, citationsMap };
}

/**
 * Format hybrid citations for display
 */
export function formatHybridCitations(citations = []) {
  if (!Array.isArray(citations) || citations.length === 0) return [];

  return citations.map((cite, index) => {
    const citationId = cite.citation_id || `${cite.chunk_id}_${cite.page_number || index}`;
    const { docId, pageNumber } = parseDocIdAndPage(citationId);
    
    return {
      id: citationId,
      docId: docId,
      type: 'document',
      fileName: cite.file_name,
      pageNumber: pageNumber || cite.page_number || 'N/A',
      content: cite.content || '',
    };
  });
}

/**
 * Format web citations for display
 */
export function formatWebCitations(citations = []) {
  if (!Array.isArray(citations) || citations.length === 0) return [];

  return citations.map((cite) => ({
    type: 'web',
    url: cite.url,
    title: cite.title || cite.url,
  }));
}

/**
 * Format agent citations for display
 */
export function formatAgentCitations(citations = []) {
  if (!Array.isArray(citations) || citations.length === 0) return [];

  return citations.map((cite, index) => ({
    type: 'agent',
    toolName: cite.tool_name || `Tool ${index + 1}`,
    arguments: typeof cite.function_arguments === 'object' 
      ? JSON.stringify(cite.function_arguments) 
      : cite.function_arguments,
    result: typeof cite.function_result === 'object'
      ? JSON.stringify(cite.function_result)
      : cite.function_result || 'No result',
    timestamp: cite.timestamp,
  }));
}

