# SuperWorker React Chat Interface

A modern, mobile-first React chat interface for SuperWorker, fully compatible with the existing Flask backend.

## Features

- 🎨 Modern, sleek UI with smooth animations
- 📱 Mobile-first responsive design
- 💬 Real-time chat with AI
- 📝 Inline subscript citations support
- 🗂️ Conversation management
- 🔍 Document workspace integration
- ⚡ Fast and optimized with Vite
- 🎯 Full backend compatibility

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Python Flask backend running on http://localhost:5000

### Installation

```bash
# Navigate to the react_chat directory
cd simplechat/application/react_chat

# Install dependencies
npm install

# Start development server
npm run dev
```

The development server will start on `http://localhost:5173` with proxying to the Flask backend.

## Building for Production

```bash
# Build for production
npm run build
```

The build output will be placed in `../single_app/static/react_chat` for integration with Flask.

## Project Structure

```
react_chat/
├── src/
│   ├── components/         # React components
│   │   ├── ChatMessage.jsx
│   │   ├── ChatInput.jsx
│   │   ├── ChatWindow.jsx
│   │   ├── CitationList.jsx
│   │   ├── ConversationList.jsx
│   │   ├── Header.jsx
│   │   └── WelcomeScreen.jsx
│   ├── services/           # API services
│   │   └── api.js
│   ├── stores/             # State management
│   │   └── chatStore.js
│   ├── utils/              # Utilities
│   │   ├── citations.js    # Citation parsing
│   │   ├── markdown.js     # Markdown processing
│   │   └── formatters.js   # Formatting helpers
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## API Integration

The React app communicates with the Flask backend through these main endpoints:

- `GET /api/get_conversations` - Fetch conversation list
- `GET /api/get_messages?conversation_id=<id>` - Fetch messages
- `POST /api/create_conversation` - Create new conversation
- `POST /api/chat` - Send message and get AI response
- `DELETE /api/delete_conversation` - Delete conversation
- `GET /api/models` - Get available models

## Features Implemented

### ✅ Core Chat Functionality
- Send and receive messages
- Real-time message display
- Loading states and animations

### ✅ Citations
- Inline subscript citations (Source: filename, Pages: X)
- Document citations with file and page
- Web citations with links
- Agent/tool citations

### ✅ Conversation Management
- List all conversations
- Create new conversations
- Delete conversations
- Select and switch conversations

### ✅ UI/UX
- Mobile-first responsive design
- Smooth animations with Framer Motion
- Modern gradient buttons
- Avatar icons matching the design
- Auto-scrolling to latest messages
- Typing indicators

### ✅ Advanced Features
- Markdown rendering with DOMPurify
- Table support
- Code syntax highlighting
- Message copying
- Feedback (thumbs up/down)

## Integration with Flask

To serve the React app from Flask, add a route in your Flask app:

```python
@app.route('/chat')
@login_required
@user_required
def react_chat():
    return render_template('react_chat.html')
```

Create `templates/react_chat.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="apple-mobile-web-app-capable" content="yes">
    <title>SuperWorker Chat</title>
    <link rel="stylesheet" href="{{ url_for('static', filename='react_chat/assets/index.css') }}">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="{{ url_for('static', filename='react_chat/assets/index.js') }}"></script>
  </body>
</html>
```

## Customization

### Colors

Edit `tailwind.config.js` to change the primary colors:

```javascript
colors: {
  primary: {
    DEFAULT: '#FF6B35',  // Main brand color
    dark: '#E55527',     // Darker shade
    light: '#FF8A5C',    // Lighter shade
  },
}
```

### Features

Toggle features in the backend settings - the React app will automatically adapt.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Optimized bundle size with tree-shaking
- Lazy loading for components
- Memoization for expensive computations
- Virtual scrolling for long conversation lists (future enhancement)

## License

Same as the main SuperWorker application.



















