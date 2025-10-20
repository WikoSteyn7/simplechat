/**
 * Main App Component
 */

import { useEffect } from 'react';
import useChatStore from './stores/chatStore';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import ConversationList from './components/ConversationList';
import WorkspaceSearch from './components/WorkspaceSearch';
import EnhancedCitationModal from './components/EnhancedCitationModal';

function App() {
  const { 
    loadConversations, 
    loadModels, 
    showWorkspaceSearch, 
    setShowWorkspaceSearch,
    showCitationModal,
    activeCitation,
    setShowCitationModal
  } = useChatStore();

  useEffect(() => {
    // Load initial data
    loadConversations();
    loadModels();
  }, [loadConversations, loadModels]);

  return (
    <div 
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #e8e8e8 0%, #f5f5f5 25%, #ffffff 50%, #f0f0f0 75%, #e5e5e5 100%)',
        backgroundSize: '400% 400%',
      }}
    >
      <Header />
      <ChatWindow />
      <ChatInput />
      <ConversationList />
      
      {/* Workspace Search Modal */}
      <WorkspaceSearch 
        show={showWorkspaceSearch} 
        onClose={() => setShowWorkspaceSearch(false)} 
      />
      
      {/* Enhanced Citation Modal */}
      {showCitationModal && activeCitation && (
        <EnhancedCitationModal
          citationId={activeCitation.citationId}
          docId={activeCitation.docId}
          pageNumber={activeCitation.pageNumber}
          fileName={activeCitation.fileName}
          onClose={() => setShowCitationModal(null)}
        />
      )}
    </div>
  );
}

export default App;

