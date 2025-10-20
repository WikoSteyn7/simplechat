/**
 * Header Component
 * Top navigation bar
 */

import { Menu, Settings, LogOut, MessageSquare } from 'lucide-react';
import useChatStore from '../stores/chatStore';

export default function Header() {
  const { setShowConversationList, currentConversationId } = useChatStore();

  const handleLogout = () => {
    window.location.href = '/logout';
  };

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-30 safe-area-top"
      style={{
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Menu button */}
        <button
          onClick={() => setShowConversationList(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Conversations"
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        {/* Center: Logo/Title */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
            SuperWorker
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
    </header>
  );
}

