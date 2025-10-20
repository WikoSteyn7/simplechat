/**
 * CitationList Component
 * Displays citations for AI messages
 */

import { FileText, Globe, Cpu } from 'lucide-react';
import useChatStore from '../stores/chatStore';

export default function CitationList({ hybridCitations = [], webCitations = [], agentCitations = [] }) {
  const { setShowCitationModal } = useChatStore();

  const handleCitationClick = (citation) => {
    // Open enhanced citation modal
    setShowCitationModal({
      citationId: citation.id,
      docId: citation.docId || citation.id.split('_').slice(0, -1).join('_'),
      pageNumber: citation.pageNumber,
      fileName: citation.fileName,
    });
  };

  if (hybridCitations.length === 0 && webCitations.length === 0 && agentCitations.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {hybridCitations.map((citation, index) => (
        <button
          key={`hybrid-${index}`}
          onClick={() => handleCitationClick(citation)}
          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs transition-colors cursor-pointer"
          title={`Click to view: ${citation.fileName}, Page ${citation.pageNumber}`}
        >
          <FileText className="w-3 h-3" />
          <span className="max-w-[120px] truncate">{citation.fileName}</span>
          <span className="text-blue-500">p.{citation.pageNumber}</span>
        </button>
      ))}

      {webCitations.map((citation, index) => (
        <a
          key={`web-${index}`}
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs transition-colors"
          title={citation.title}
        >
          <Globe className="w-3 h-3" />
          <span className="max-w-[120px] truncate">{citation.title}</span>
        </a>
      ))}

      {agentCitations.map((citation, index) => (
        <button
          key={`agent-${index}`}
          onClick={() => handleCitationClick(citation, `agent-${index}`)}
          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs transition-colors"
          title={citation.toolName}
        >
          <Cpu className="w-3 h-3" />
          <span className="max-w-[120px] truncate">{citation.toolName}</span>
        </button>
      ))}
    </div>
  );
}

