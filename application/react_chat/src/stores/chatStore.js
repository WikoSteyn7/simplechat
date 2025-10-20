/**
 * Chat Store using Zustand
 * Manages global chat state
 */

import { create } from 'zustand';
import api from '../services/api';

const useChatStore = create((set, get) => ({
  // Conversations
  conversations: [],
  currentConversationId: null,
  loadingConversations: false,

  // Messages
  messages: [],
  loadingMessages: false,

  // Input state
  inputValue: '',
  isSending: false,

  // Settings
  selectedModel: null,
  availableModels: [],
  hybridSearchEnabled: false,
  selectedDocumentId: null,
  docScope: 'all',

  // UI State
  showConversationList: false,
  showSettings: false,
  showWorkspaceSearch: false,
  showCitationModal: false,
  activeCitation: null,

  // Actions
  setInputValue: (value) => set({ inputValue: value }),

  setShowConversationList: (show) => set({ showConversationList: show }),

  setShowSettings: (show) => set({ showSettings: show }),

  setShowWorkspaceSearch: (show) => set({ showWorkspaceSearch: show }),

  setShowCitationModal: (citation) => set({ 
    showCitationModal: !!citation, 
    activeCitation: citation 
  }),

  // Load conversations
  loadConversations: async () => {
    set({ loadingConversations: true });
    try {
      const data = await api.getConversations();
      set({ 
        conversations: data.conversations || [],
        loadingConversations: false 
      });
    } catch (error) {
      console.error('Error loading conversations:', error);
      set({ loadingConversations: false });
    }
  },

  // Create new conversation
  createConversation: async () => {
    try {
      const data = await api.createConversation();
      // Backend returns { conversation_id, title }
      const newConversation = {
        id: data.conversation_id,
        title: data.title || 'New Chat',
        last_updated: new Date().toISOString(),
      };
      
      set((state) => ({
        conversations: [newConversation, ...state.conversations],
        currentConversationId: newConversation.id,
        messages: [],
        showConversationList: false,
      }));

      return newConversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  // Select conversation
  selectConversation: async (conversationId) => {
    set({ currentConversationId: conversationId, loadingMessages: true });
    try {
      const data = await api.getMessages(conversationId);
      set({ 
        messages: data.messages || [],
        loadingMessages: false,
        showConversationList: false,
      });
    } catch (error) {
      console.error('Error loading messages:', error);
      set({ loadingMessages: false });
    }
  },

  // Delete conversation
  deleteConversation: async (conversationId) => {
    try {
      await api.deleteConversation(conversationId);
      
      set((state) => {
        const newConversations = state.conversations.filter(c => c.id !== conversationId);
        const newCurrentId = state.currentConversationId === conversationId 
          ? (newConversations[0]?.id || null)
          : state.currentConversationId;

        return {
          conversations: newConversations,
          currentConversationId: newCurrentId,
          messages: newCurrentId === state.currentConversationId ? state.messages : [],
        };
      });

      // Load messages for new current conversation if changed
      const { currentConversationId } = get();
      if (currentConversationId && currentConversationId !== conversationId) {
        get().selectConversation(currentConversationId);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  },

  // Send message
  sendMessage: async (messageText) => {
    const { currentConversationId, messages, selectedModel, hybridSearchEnabled, selectedDocumentId, docScope } = get();
    
    if (!messageText.trim()) return;

    // Create conversation if none exists
    let conversationId = currentConversationId;
    if (!conversationId) {
      const newConv = await get().createConversation();
      conversationId = newConv.id;
    }

    // Add user message optimistically
    const tempUserMessageId = `temp_user_${Date.now()}`;
    const userMessage = {
      id: tempUserMessageId,
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
      conversation_id: conversationId,
    };

    set({ 
      messages: [...messages, userMessage],
      inputValue: '',
      isSending: true,
    });

    try {
      const response = await api.sendMessage({
        message: messageText,
        conversationId,
        hybridSearch: hybridSearchEnabled,
        selectedDocumentId,
        docScope,
        modelDeployment: selectedModel,
      });

      // Add AI response - backend returns 'reply' not 'response'
      const aiMessage = {
        id: response.message_id || `ai_${Date.now()}`,
        role: 'assistant',
        content: response.reply || response.response || '', // Handle both field names
        timestamp: new Date().toISOString(),
        conversation_id: conversationId,
        model: response.model_deployment_name || response.model,
        augmented: response.augmented || false,
        hybrid_citations: response.hybrid_citations || [],
        web_citations: response.web_citations || [],
        agent_citations: response.agent_citations || [],
        agent_display_name: response.agent_display_name,
        agent_name: response.agent_name,
      };

      set((state) => ({
        messages: [...state.messages, aiMessage],
        isSending: false,
      }));

      // Reload conversations to update last_updated
      get().loadConversations();

    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic user message on error
      set((state) => ({
        messages: state.messages.filter(m => m.id !== tempUserMessageId),
        isSending: false,
      }));
      throw error;
    }
  },

  // Load models
  loadModels: async () => {
    try {
      const data = await api.getModels();
      const models = data.models || [];
      
      // Handle both APIM and direct deployment formats
      const formattedModels = models.map(m => ({
        deploymentName: m.deploymentName || m.deployment,
        modelName: m.modelName || m.name || m.deploymentName,
      }));
      
      set({ 
        availableModels: formattedModels,
        selectedModel: formattedModels[0]?.deploymentName || null,
      });
    } catch (error) {
      console.error('Error loading models:', error);
      // Don't fail the app if models can't be loaded
      set({ availableModels: [], selectedModel: null });
    }
  },

  // Update settings
  setHybridSearch: (enabled) => set({ hybridSearchEnabled: enabled }),
  setSelectedDocument: (docId) => set({ selectedDocumentId: docId }),
  setDocScope: (scope) => set({ docScope: scope }),
  setSelectedModel: (model) => set({ selectedModel: model }),
}));

export default useChatStore;

