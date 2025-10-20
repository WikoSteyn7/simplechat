/**
 * CitationReference Component
 * Shows numbered citation references at the bottom of messages
 */

import { FileText } from 'lucide-react';
import useChatStore from '../stores/chatStore';

export default function CitationReference({ citations = [] }) {
  const { setShowCitationModal } = useChatStore();

  if (!citations || citations.length === 0) return null;

  const handleCitationClick = (citation) => {
    const { docId, pageNumber } = parseDocIdFromCitation(citation.citationId);
    
    setShowCitationModal({
      citationId: citation.citationId,
      docId: docId,
      pageNumber: pageNumber,
      fileName: citation.fileName,
    });
  };

  const parseDocIdFromCitation = (citationId) => {
    const lastUnderscore = citationId.lastIndexOf('_');
    if (lastUnderscore === -1) return { docId: citationId, pageNumber: null };
    
    const docId = citationId.substring(0, lastUnderscore);
    const pageNumber = parseInt(citationId.substring(lastUnderscore + 1), 10);
    
    return { docId, pageNumber: isNaN(pageNumber) ? null : pageNumber };
  };

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <div className="space-y-1.5">
        {citations.map((citation) => (
          <div
            key={citation.number}
            id={`citation-ref-${citation.number}`}
            className="flex items-start gap-2 text-xs group cursor-pointer hover:bg-blue-50 p-1.5 rounded transition-colors"
            onClick={() => handleCitationClick(citation)}
          >
            <span className="font-bold text-primary flex-shrink-0 min-w-[20px]">
              [{citation.number}]
            </span>
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-gray-700 truncate group-hover:text-primary transition-colors">
                {citation.fileName}
              </span>
              <span className="text-gray-500">
                p.{citation.pageNumber}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



















