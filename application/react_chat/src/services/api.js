/**
 * API Service Layer
 * Handles all communication with the Flask backend
 */

class APIService {
  constructor() {
    this.baseURL = '';
  }

  /**
   * Generic fetch wrapper with error handling
   */
  async request(url, options = {}) {
    const defaultOptions = {
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get all conversations for the current user
   */
  async getConversations() {
    return this.request('/api/get_conversations');
  }

  /**
   * Get messages for a specific conversation
   */
  async getMessages(conversationId) {
    return this.request(`/api/get_messages?conversation_id=${conversationId}`);
  }

  /**
   * Create a new conversation
   */
  async createConversation(title = 'New Chat') {
    return this.request('/api/create_conversation', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId) {
    return this.request('/api/delete_conversation', {
      method: 'DELETE',
      body: JSON.stringify({ conversation_id: conversationId }),
    });
  }

  /**
   * Send a message and get AI response
   */
  async sendMessage({
    message,
    conversationId,
    hybridSearch = false,
    selectedDocumentId = null,
    imageGeneration = false,
    docScope = 'all',
    chatType = 'user',
    activeGroupId = null,
    modelDeployment = null,
    classifications = null,
    promptInfo = null,
    agentInfo = null,
  }) {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        hybrid_search: hybridSearch,
        selected_document_id: selectedDocumentId,
        classifications,
        image_generation: imageGeneration,
        doc_scope: docScope,
        chat_type: chatType,
        active_group_id: activeGroupId,
        model_deployment: modelDeployment,
        prompt_info: promptInfo,
        agent_info: agentInfo,
      }),
    });
  }

  /**
   * Get available GPT models
   */
  async getModels() {
    try {
      // Try the GPT models endpoint first
      return await this.request('/api/models/gpt');
    } catch (error) {
      console.warn('Failed to fetch models from /api/models/gpt:', error);
      // Return empty models array as fallback
      return { models: [] };
    }
  }

  /**
   * Get documents for workspaces
   */
  async getDocuments(scope = 'all', groupId = null) {
    let url = '/api/documents';
    const params = new URLSearchParams();
    
    if (scope !== 'all') {
      params.append('scope', scope);
    }
    if (groupId) {
      params.append('group_id', groupId);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return this.request(url);
  }

  /**
   * Get conversation metadata/details
   */
  async getConversationDetails(conversationId) {
    return this.request(`/api/conversations/${conversationId}/details`);
  }

  /**
   * Submit user feedback
   */
  async submitFeedback({ aiResponseId, conversationId, feedbackType, reason = '' }) {
    return this.request('/api/feedback', {
      method: 'POST',
      body: JSON.stringify({
        ai_response_id: aiResponseId,
        conversation_id: conversationId,
        feedback_type: feedbackType,
        reason,
      }),
    });
  }

  /**
   * Upload file to conversation
   */
  async uploadFile(file, conversationId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversation_id', conversationId);

    const response = await fetch('/api/upload_file', {
      method: 'POST',
      credentials: 'same-origin',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Upload failed');
    }

    return response.json();
  }

  /**
   * Get current user info
   */
  async getCurrentUser() {
    return this.request('/api/current_user');
  }
}

export default new APIService();

