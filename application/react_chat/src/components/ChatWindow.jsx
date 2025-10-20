/**
 * ChatWindow Component
 * Main chat interface displaying messages
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import useChatStore from '../stores/chatStore';
import ChatMessage from './ChatMessage';
import WelcomeScreen from './WelcomeScreen';

export default function ChatWindow() {
  const { messages, loadingMessages, isSending, currentConversationId } = useChatStore();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const showWelcome = !currentConversationId || messages.length === 0;

  return (
    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto pb-4 pt-16 relative"
      style={{
        background: 'linear-gradient(135deg, #e8e8e8 0%, #f5f5f5 25%, #ffffff 50%, #f0f0f0 75%, #e5e5e5 100%)',
        backgroundSize: '400% 400%',
      }}
    >
      {/* Frosted overlay effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(200,200,200,0.2) 0%, transparent 50%)',
          backdropFilter: 'blur(100px)',
        }}
      />
      
      <div className="max-w-4xl mx-auto relative z-10">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : showWelcome ? (
          <WelcomeScreen />
        ) : (
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isUser={message.role === 'user'}
              />
            ))}
          </AnimatePresence>
        )}

        {isSending && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-4 px-4"
          >
            <div className="flex items-start max-w-[85%] md:max-w-[70%]">
              <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center mr-3">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-3" style={{ borderRadius: '20px 20px 20px 4px' }}>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

