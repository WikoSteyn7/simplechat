/**
 * WorkspaceSearch Component
 * Full workspace/document search functionality
 */

import { useState, useEffect } from 'react';
import { Search, FileText, Folder } from 'lucide-react';
import api from '../services/api';
import useChatStore from '../stores/chatStore';

export default function WorkspaceSearch({ show, onClose }) {
  const { setHybridSearch, setSelectedDocument, setDocScope, docScope } = useChatStore();
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Load documents when scope changes
  useEffect(() => {
    if (show) {
      loadDocuments();
    }
  }, [show, docScope]);

  // Filter documents based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDocs(documents);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredDocs(documents.filter(doc => 
        doc.title?.toLowerCase().includes(query) || 
        doc.file_name?.toLowerCase().includes(query)
      ));
    }
  }, [searchQuery, documents]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await api.getDocuments(docScope);
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSelect = (docId) => {
    setSelectedDocument(docId);
    setHybridSearch(true);
    onClose();
  };

  const handleScopeChange = (newScope) => {
    setDocScope(newScope);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.4)' }}>
      <div 
        className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
        }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Search Workspaces</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scope Selector */}
        <div className="p-4 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Scope</label>
          <div className="grid grid-cols-3 gap-2">
            {['all', 'personal', 'group'].map(scope => (
              <button
                key={scope}
                onClick={() => handleScopeChange(scope)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  docScope === scope
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {scope.charAt(0).toUpperCase() + scope.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No documents found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* All Documents option */}
              <button
                onClick={() => handleDocumentSelect(null)}
                className="w-full p-3 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center gap-3 border border-gray-200"
              >
                <Folder className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">All Documents</p>
                  <p className="text-sm text-gray-500">Search across all documents in {docScope}</p>
                </div>
              </button>

              {/* Individual documents */}
              {filteredDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleDocumentSelect(doc.id)}
                  className="w-full p-3 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center gap-3 border border-gray-200"
                >
                  <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {doc.title || doc.file_name}
                    </p>
                    {doc.file_name && doc.title !== doc.file_name && (
                      <p className="text-sm text-gray-500 truncate">{doc.file_name}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

