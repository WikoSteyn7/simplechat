# React Chat Integration Guide

This guide explains how to integrate the React chat interface with your existing Flask application.

## Overview

The React chat interface is a completely separate, modern frontend that communicates with your existing Flask backend via API endpoints. It provides:

- ✅ Modern, mobile-first UI matching the design mockup
- ✅ Full compatibility with existing backend features
- ✅ Inline subscript citations
- ✅ Document workspace integration
- ✅ Real-time chat with AI
- ✅ Conversation management

## Architecture

```
┌─────────────────────────────────────┐
│                                     │
│    React Chat Interface             │
│    (Modern Mobile UI)               │
│                                     │
└──────────────┬──────────────────────┘
               │
               │ HTTP/JSON API
               │
┌──────────────▼──────────────────────┐
│                                     │
│    Flask Backend                    │
│    (Existing Infrastructure)        │
│                                     │
│  - Authentication                   │
│  - Chat API (/api/chat)            │
│  - Conversations API               │
│  - Documents API                   │
│  - Cosmos DB, Azure AI             │
│                                     │
└─────────────────────────────────────┘
```

## Step 1: Build the React App

### Option A: Using the build script (Recommended)

**Windows (PowerShell):**
```powershell
cd simplechat/application/react_chat
.\build.ps1
```

**Linux/Mac (Bash):**
```bash
cd simplechat/application/react_chat
chmod +x build.sh
./build.sh
```

### Option B: Manual build

```bash
cd simplechat/application/react_chat
npm install
npm run build
```

The build output will be placed in `../single_app/static/react_chat/`

## Step 2: Register the Flask Route

Add the React chat route to your Flask application:

### In `app.py`, add the import:

```python
from route_frontend_react_chat import register_route_frontend_react_chat
```

### Register the route (add with other route registrations):

```python
# ------------------- React Chat Route -----------------------
register_route_frontend_react_chat(app)
```

Example location in app.py:

```python
# =================== Front End Routes ===================
# ... existing routes ...

# ------------------- React Chat Route -----------------------
register_route_frontend_react_chat(app)

# =================== API Routes ===================
# ... existing API routes ...
```

## Step 3: Access the React Chat

1. Start your Flask application as usual
2. Navigate to `/chat` in your browser
3. The React interface will load and connect to your backend

**URLs:**
- Legacy chat interface: `/chats`
- New React chat interface: `/chat`

## Backend API Requirements

The React app uses these API endpoints (all already exist in your backend):

### Required Endpoints:
- ✅ `POST /api/chat` - Send messages
- ✅ `GET /api/get_conversations` - List conversations
- ✅ `GET /api/get_messages` - Get conversation messages
- ✅ `POST /api/create_conversation` - Create conversation
- ✅ `DELETE /api/delete_conversation` - Delete conversation
- ✅ `GET /api/models` - Get available models

### Optional Endpoints (for enhanced features):
- `GET /api/documents` - Document workspace
- `POST /api/upload_file` - File uploads
- `POST /api/feedback` - User feedback
- `GET /api/current_user` - User info

## Configuration

### Development Mode

For development with hot-reload:

1. Start the Flask backend:
```bash
python app.py
```

2. In a separate terminal, start the React dev server:
```bash
cd simplechat/application/react_chat
npm run dev
```

3. Navigate to `http://localhost:5173`

The React dev server will proxy API calls to Flask at `http://localhost:5000`.

### Production Mode

In production, Flask serves the built React files directly. Just build the app and access `/chat`.

## Customization

### Branding Colors

Edit `simplechat/application/react_chat/tailwind.config.js`:

```javascript
colors: {
  primary: {
    DEFAULT: '#FF6B35',  // Your brand color
    dark: '#E55527',     // Darker shade
    light: '#FF8A5C',    // Lighter shade
  },
}
```

Then rebuild:
```bash
npm run build
```

### App Title

The app title is pulled from `app_settings.app_title` in the Flask backend.

## Features Comparison

| Feature | Legacy Interface | React Interface |
|---------|-----------------|-----------------|
| Chat with AI | ✅ | ✅ |
| Inline Citations | ✅ | ✅ |
| Conversations | ✅ | ✅ |
| Document Search | ✅ | 🚧 In progress |
| Image Generation | ✅ | 🚧 In progress |
| Agents | ✅ | 🚧 In progress |
| Mobile-First | ⚠️ Responsive | ✅ Native mobile |
| Modern UI | ⚠️ Bootstrap | ✅ Custom design |
| Performance | Good | ⚡ Excellent |

## Deployment

### Azure App Service

1. Build the React app locally or in CI/CD
2. Include the `static/react_chat` folder in your deployment
3. Ensure `route_frontend_react_chat.py` is registered
4. Deploy as usual

### Docker

Add to your Dockerfile:

```dockerfile
# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

# Build React app
WORKDIR /app/simplechat/application/react_chat
RUN npm install
RUN npm run build

# Continue with Flask setup
WORKDIR /app/simplechat/application/single_app
...
```

## Troubleshooting

### React app doesn't load

1. Check that the build completed successfully
2. Verify `static/react_chat/assets/` exists with `index.js` and `index.css`
3. Check browser console for errors
4. Ensure the route is registered in Flask

### API calls fail

1. Check Flask backend is running
2. Verify authentication cookies are set
3. Check browser console network tab
4. Ensure CORS is configured if needed

### Citations not working

1. Verify backend returns `hybrid_citations`, `web_citations`, `agent_citations` in response
2. Check citation format matches: `(Source: file, Pages: X) [#citation_id]`
3. Review browser console for parsing errors

### Styling issues

1. Ensure `index.css` is loaded
2. Check Tailwind classes are compiled
3. Rebuild the app: `npm run build`

## Migration Path

You can run both interfaces side-by-side:

- **Phase 1**: Deploy React chat at `/chat`, keep legacy at `/chats`
- **Phase 2**: User testing and feedback on React interface
- **Phase 3**: Gradually migrate users to React interface
- **Phase 4**: Deprecate legacy interface or keep as admin tool

## Support

For issues or questions:
1. Check this integration guide
2. Review the React app README.md
3. Check backend API documentation
4. Review Flask application logs

## Next Steps

After integration:

1. ✅ Test all features in the React interface
2. ✅ Customize branding and colors
3. ✅ Add additional features as needed
4. ✅ Deploy to production
5. ✅ Monitor performance and user feedback

## Advanced Configuration

### Environment Variables

Create `.env.local` in `react_chat/`:

```env
VITE_API_BASE_URL=https://your-api.azurewebsites.net
```

### Custom API Service

Edit `src/services/api.js` to modify API calls or add custom headers.

### Analytics

Add analytics tracking in `src/App.jsx` or create a custom hook.

### WebSocket Support

For real-time streaming, modify the API service to use WebSocket connections instead of HTTP polling.



















