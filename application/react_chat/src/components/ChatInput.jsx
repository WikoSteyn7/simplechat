/**
 * ChatInput Component
 * Handles message input and sending
 */

import { Send, Paperclip, FileText } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import useChatStore from '../stores/chatStore';

export default function ChatInput() {
  const { 
    inputValue, 
    setInputValue, 
    sendMessage, 
    isSending,
    hybridSearchEnabled,
    setShowWorkspaceSearch,
  } = useChatStore();
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = newHeight + 'px';
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [inputValue]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isSending) {
      try {
        await sendMessage(inputValue.trim());
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 safe-area-bottom z-10"
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-2">
            {/* Workspace search button */}
            <button
              type="button"
              onClick={() => setShowWorkspaceSearch(true)}
              className={`p-2.5 transition-colors mb-1 ${
                hybridSearchEnabled 
                  ? 'text-primary bg-primary/10' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Search workspaces"
            >
              <FileText className="w-5 h-5" />
            </button>
            
            {/* File attachment button */}
            <button
              type="button"
              className="p-2.5 text-gray-400 hover:text-gray-600 transition-colors mb-1"
              title="Attach file"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Input container */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything"
                rows={1}
                disabled={isSending}
                className="w-full px-4 py-3 pr-12 rounded-3xl focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                style={{
                  height: '48px',
                  maxHeight: '120px',
                  background: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                }}
              />
              
              {/* Send button - shows when there's input */}
              {inputValue.trim() && (
                <button
                  type="submit"
                  disabled={isSending}
                  className="absolute right-2 bottom-2 p-2 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

