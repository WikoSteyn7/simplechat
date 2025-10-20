/**
 * ChatMessage Component
 * Renders individual chat messages with citations
 */

import { motion } from 'framer-motion';
import { User, Sparkles, ThumbsUp, ThumbsDown, Copy, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { processMessageContent } from '../utils/markdown';
import { formatHybridCitations, formatWebCitations, formatAgentCitations, parseDocIdAndPage } from '../utils/citations';
import CitationList from './CitationList';
import CitationReference from './CitationReference';
import useChatStore from '../stores/chatStore';

export default function ChatMessage({ message, isUser }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const messageRef = useRef(null);
  const { setShowCitationModal } = useChatStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type) => {
    setFeedback(type);
    // TODO: Send feedback to backend
  };

  // Process message content and get numbered citations
  const processed = isUser ? { html: null, citations: [] } : processMessageContent(message.content, {}, message.hybrid_citations || []);
  const htmlContent = processed.html;
  const inlineCitations = processed.citations || [];
  
  const hybridCitations = formatHybridCitations(message.hybrid_citations);
  const webCitations = formatWebCitations(message.web_citations);
  const agentCitations = formatAgentCitations(message.agent_citations);
  const hasCitations = hybridCitations.length > 0 || webCitations.length > 0 || agentCitations.length > 0 || inlineCitations.length > 0;

  // Handle citation link clicks
  useEffect(() => {
    if (!messageRef.current || isUser) return;

    const handleCitationClick = (e) => {
      const target = e.target.closest('a.citation-page-link');
      if (!target) return;

      e.preventDefault();
      const citationId = target.getAttribute('data-citation-id');
      if (!citationId) return;

      const { docId, pageNumber } = parseDocIdAndPage(citationId);
      if (!docId || !pageNumber) return;

      // Find the citation to get file name from inline citations or hybrid citations
      let fileName = '';
      const inlineCitation = inlineCitations.find(c => c.citationId === citationId);
      if (inlineCitation) {
        fileName = inlineCitation.fileName;
      } else {
        const hybridCitation = hybridCitations.find(c => c.id === citationId);
        fileName = hybridCitation?.fileName || '';
      }
      
      // Open enhanced citation modal
      setShowCitationModal({
        citationId,
        docId,
        pageNumber,
        fileName,
      });
    };

    const element = messageRef.current;
    element.addEventListener('click', handleCitationClick);

    return () => {
      element.removeEventListener('click', handleCitationClick);
    };
  }, [htmlContent, isUser, setShowCitationModal, inlineCitations, hybridCitations]);

  return (
    <motion.div
      ref={messageRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 px-4`}
    >
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[85%] md:max-w-[70%]`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isUser ? 'bg-white shadow-md' : 'bg-white shadow-md'
          }`}>
            {isUser ? (
              <div className="w-6 h-6 flex flex-col gap-[3px] items-center justify-center">
                <div className="w-5 h-[3px] bg-primary rounded-full"></div>
                <div className="w-5 h-[3px] bg-primary rounded-full"></div>
                <div className="w-5 h-[3px] bg-primary rounded-full"></div>
              </div>
            ) : (
              <Sparkles className="w-5 h-5 text-primary" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`px-4 py-3 ${
              isUser
                ? 'text-gray-800'
                : 'text-gray-800'
            }`}
            style={{
              background: isUser 
                ? 'rgba(255, 255, 255, 0.85)'
                : 'rgba(245, 245, 245, 0.75)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: isUser
                ? '0 4px 24px rgba(0, 0, 0, 0.08)'
                : '0 4px 16px rgba(0, 0, 0, 0.06)',
              borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
          >
            {isUser ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div 
                className="prose prose-sm max-w-none prose-p:my-2 prose-headings:my-2 prose-ul:my-2 prose-ol:my-2"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            )}
          </div>

          {/* Inline Citation References */}
          {!isUser && inlineCitations.length > 0 && (
            <div className="mt-2 bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-gray-100">
              <CitationReference citations={inlineCitations} />
            </div>
          )}

          {/* Actions for AI messages */}
          {!isUser && (
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              <button
                onClick={() => handleFeedback('up')}
                className={`p-1.5 hover:bg-gray-100 rounded-lg transition-colors ${
                  feedback === 'up' ? 'text-primary' : 'text-gray-500'
                }`}
                title="Good response"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => handleFeedback('down')}
                className={`p-1.5 hover:bg-gray-100 rounded-lg transition-colors ${
                  feedback === 'down' ? 'text-red-500' : 'text-gray-500'
                }`}
                title="Poor response"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>

              {message.model && (
                <span className="text-xs text-gray-400 ml-2">
                  {message.agent_display_name || message.model}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

