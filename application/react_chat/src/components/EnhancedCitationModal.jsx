/**
 * EnhancedCitationModal Component
 * Shows PDFs, videos, and other citation content in modals
 */

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function EnhancedCitationModal({ citationId, docId, pageNumber, fileName, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contentType, setContentType] = useState(null);
  const [contentUrl, setContentUrl] = useState(null);
  const [isVimeo, setIsVimeo] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (citationId && docId) {
      loadCitation();
    }
  }, [citationId, docId, pageNumber, fileName]);

  const getFileType = (filename) => {
    if (!filename) return 'pdf'; // Default to PDF
    const ext = filename.split('.').pop().toLowerCase();
    
    if (ext === 'pdf') return 'pdf';
    if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) return 'video';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'].includes(ext)) return 'image';
    return 'pdf'; // Default fallback
  };

  const convertTimestampToSeconds = (timestamp) => {
    console.log(`Converting timestamp: ${timestamp} (type: ${typeof timestamp})`);
    
    if (typeof timestamp === 'number') {
      return timestamp;
    }
    
    if (typeof timestamp === 'string') {
      const numericTimestamp = parseFloat(timestamp);
      if (!isNaN(numericTimestamp)) {
        return numericTimestamp;
      }
      
      if (timestamp.includes(':')) {
        const parts = timestamp.split(':').map(part => parseFloat(part));
        if (parts.length === 3) {
          return parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
          return parts[0] * 60 + parts[1];
        }
      }
    }
    
    return 0;
  };

  const loadCitation = async () => {
    setLoading(true);
    setError(null);

    try {
      const fileType = getFileType(fileName);
      setContentType(fileType);
      
      if (fileType === 'pdf') {
        setContentUrl(`/api/enhanced_citations/pdf?doc_id=${encodeURIComponent(docId)}&page=${encodeURIComponent(pageNumber || 1)}`);
        setLoading(false);
      } else if (fileType === 'video') {
        const checkUrl = `/api/enhanced_citations/video?doc_id=${encodeURIComponent(docId)}`;
        try {
          const response = await fetch(checkUrl);
          const data = await response.json();
          
          if (data.type === 'vimeo' && data.vimeo_url) {
            console.log('Detected Vimeo video:', data.vimeo_url);
            setIsVimeo(true);
            setContentUrl(data.vimeo_url);
          } else {
            console.log('Detected blob storage video');
            setIsVimeo(false);
            setContentUrl(checkUrl);
          }
        } catch (err) {
          console.error('Error checking video type, using blob storage:', err);
          setIsVimeo(false);
          setContentUrl(checkUrl);
        }
        setLoading(false);
      } else if (fileType === 'image') {
        setContentUrl(`/api/enhanced_citations/image?doc_id=${encodeURIComponent(docId)}`);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading citation:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleVideoLoaded = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    console.log(`Video loaded. Duration: ${video.duration} seconds`);
    
    // For videos, pageNumber is actually the chunk_sequence in seconds
    const timeInSeconds = convertTimestampToSeconds(pageNumber);
    console.log(`Seeking to timestamp: ${timeInSeconds} seconds`);
    
    if (timeInSeconds > 0 && timeInSeconds < video.duration) {
      video.currentTime = timeInSeconds;
    } else if (timeInSeconds >= video.duration) {
      console.warn(`Timestamp ${timeInSeconds} beyond duration ${video.duration}`);
      video.currentTime = Math.max(0, video.duration - 1);
    }
  };

  const handleVideoError = (e) => {
    console.error('Video playback error:', e);
    const video = videoRef.current;
    if (video && video.error) {
      let errorMsg = 'Could not load video. ';
      switch(video.error.code) {
        case 1: errorMsg += 'Loading was aborted.'; break;
        case 2: errorMsg += 'Network error occurred.'; break;
        case 3: errorMsg += 'Video is corrupted or unsupported format.'; break;
        case 4: errorMsg += 'Video source is not available.'; break;
        default: errorMsg += 'Unknown error.';
      }
      setError(errorMsg);
    }
  };

  if (!citationId) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col"
        style={{ height: contentType === 'video' ? '80vh' : 'auto', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">
            {contentType === 'pdf' && `PDF - Page ${pageNumber}`}
            {contentType === 'video' && `Video: ${fileName}`}
            {contentType === 'image' && `Image: ${fileName}`}
            {!contentType && 'Citation'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content - Fixed height container to prevent layout shift */}
        <div 
          className="flex-1 overflow-hidden"
          style={{ 
            minHeight: contentType === 'video' ? '500px' : '400px',
          }}
        >
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-full p-8 text-center">
              <div>
                <p className="text-red-600 font-medium mb-2">Failed to load citation</p>
                <p className="text-gray-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && contentType === 'pdf' && contentUrl && (
            <iframe
              src={contentUrl}
              className="w-full h-full border-0"
              title="PDF Viewer"
            />
          )}

          {!loading && !error && contentType === 'video' && contentUrl && (
            <div className="h-full w-full flex items-center justify-center bg-black">
              <video
                ref={videoRef}
                controls
                autoPlay
                onLoadedMetadata={handleVideoLoaded}
                onError={handleVideoError}
                className="w-full h-full"
                style={{ maxHeight: '100%', objectFit: 'contain' }}
              >
                <source src={contentUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {!loading && !error && contentType === 'image' && contentUrl && (
            <div className="h-full w-full flex items-center justify-center bg-gray-50">
              <img
                src={contentUrl}
                alt="Citation"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

