/**
 * BottomNavBar Component
 * Bottom navigation bar matching the image design
 */

import { motion } from 'framer-motion';
import useChatStore from '../stores/chatStore';

export default function BottomNavBar() {
  const { createConversation, setShowConversationList } = useChatStore();

  const handleAskMe = () => {
    setShowConversationList(true);
  };

  const handleShowMe = async () => {
    await createConversation();
  };

  const handleCenterButton = () => {
    // Center button action - could toggle or create new chat
    createConversation();
  };

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring', damping: 20 }}
      className="fixed bottom-24 left-0 right-0 px-6 pb-4 pointer-events-none z-20"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Ask Me Button */}
        <button
          onClick={handleAskMe}
          className="text-primary font-bold text-base uppercase tracking-wider hover:text-primary-dark transition-colors"
          style={{
            textShadow: '0 2px 8px rgba(255, 107, 53, 0.2)',
          }}
        >
          ASK ME
        </button>

        {/* Center Icon Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCenterButton}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all"
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.5)',
          }}
        >
          <div className="w-7 h-7 flex flex-col gap-[3px] items-center justify-center">
            <div className="w-6 h-[3px] bg-primary rounded-full"></div>
            <div className="w-6 h-[3px] bg-primary rounded-full"></div>
            <div className="w-6 h-[3px] bg-primary rounded-full"></div>
          </div>
        </motion.button>

        {/* Show Me Button */}
        <button
          onClick={handleShowMe}
          className="text-gray-600 font-bold text-base uppercase tracking-wider hover:text-gray-800 transition-colors"
          style={{
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          SHOW ME
        </button>
      </div>
    </motion.div>
  );
}



















