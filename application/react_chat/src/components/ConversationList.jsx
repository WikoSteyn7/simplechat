/**
 * ConversationList Component
 * Sidebar showing conversation history
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, MessageSquare, Trash2, Loader2 } from 'lucide-react';
import useChatStore from '../stores/chatStore';
import { formatTimestamp, getConversationTitle } from '../utils/formatters';

export default function ConversationList() {
  const {
    conversations,
    currentConversationId,
    showConversationList,
    setShowConversationList,
    loadingConversations,
    selectConversation,
    createConversation,
    deleteConversation,
  } = useChatStore();

  const handleNewChat = async () => {
    try {
      await createConversation();
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleDeleteConversation = async (e, conversationId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await deleteConversation(conversationId);
      } catch (error) {
        console.error('Error deleting conversation:', error);
      }
    }
  };

  return (
    <AnimatePresence>
      {showConversationList && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConversationList(false)}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-80 shadow-xl z-50 flex flex-col"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
              <button
                onClick={() => setShowConversationList(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* New Chat Button */}
            <div className="p-3 border-b border-gray-200">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-md transition-all font-medium"
              >
                <Plus className="w-5 h-5" />
                New Chat
              </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {loadingConversations ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm">No conversations yet</p>
                  <p className="text-gray-400 text-xs mt-1">Start a new chat to begin</p>
                </div>
              ) : (
                <div className="py-2">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => selectConversation(conversation.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-l-4 group ${
                        currentConversationId === conversation.id
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm truncate mb-1">
                            {getConversationTitle(conversation)}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {formatTimestamp(conversation.last_updated || conversation.created_at)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteConversation(e, conversation.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

