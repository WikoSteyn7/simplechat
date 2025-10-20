/**
 * BottomNav Component
 * Bottom navigation matching the image design
 */

import { MessageSquare, Sparkles } from 'lucide-react';
import useChatStore from '../stores/chatStore';

export default function BottomNav() {
  const { createConversation, setShowConversationList } = useChatStore();

  const handleAskMe = () => {
    setShowConversationList(true);
  };

  const handleShowMe = async () => {
    await createConversation();
  };

  return (
    <div className="fixed bottom-20 left-0 right-0 px-4 pb-4 pointer-events-none z-20">
      <div className="max-w-4xl mx-auto flex items-center justify-between pointer-events-auto">
        <button
          onClick={handleAskMe}
          className="text-primary font-semibold text-sm uppercase tracking-wide hover:text-primary-dark transition-colors"
        >
          Ask Me
        </button>

        <button
          onClick={handleShowMe}
          className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all transform hover:scale-105"
        >
          <div className="w-6 h-6 flex flex-col gap-[3px] items-center justify-center">
            <div className="w-5 h-[3px] bg-primary rounded-full"></div>
            <div className="w-5 h-[3px] bg-primary rounded-full"></div>
            <div className="w-5 h-[3px] bg-primary rounded-full"></div>
          </div>
        </button>

        <button
          onClick={handleShowMe}
          className="text-gray-600 font-semibold text-sm uppercase tracking-wide hover:text-gray-800 transition-colors"
        >
          Show Me
        </button>
      </div>
    </div>
  );
}



















