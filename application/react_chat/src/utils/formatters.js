/**
 * Formatting utilities
 */

/**
 * Format timestamp to human-readable format
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now';
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  // Format as date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Get conversation title (first few words of first message or default)
 */
export function getConversationTitle(conversation) {
  if (conversation.title && conversation.title !== 'New Chat') {
    return conversation.title;
  }

  // Try to extract from first message
  if (conversation.first_message) {
    const words = conversation.first_message.split(' ').slice(0, 6);
    return words.join(' ') + (conversation.first_message.split(' ').length > 6 ? '...' : '');
  }

  return 'New Chat';
}

/**
 * Truncate text to specified length
 */
export function truncate(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}



















