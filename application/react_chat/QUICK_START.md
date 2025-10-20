# Quick Start Guide - React Chat Interface

Get the new React chat interface up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Flask backend running
- User authentication working

## Quick Setup (5 minutes)

### 1. Install Dependencies (1 minute)

```bash
cd simplechat/application/react_chat
npm install
```

### 2. Build the React App (1 minute)

**Windows:**
```powershell
.\build.ps1
```

**Linux/Mac:**
```bash
chmod +x build.sh
./build.sh
```

### 3. Register Flask Route (1 minute)

Open `simplechat/application/single_app/app.py` and add:

```python
# At the top with other imports
from route_frontend_react_chat import register_route_frontend_react_chat

# In the routes section (around line 450)
# ------------------- React Chat Route -----------------------
register_route_frontend_react_chat(app)
```

### 4. Start Flask & Test (2 minutes)

```bash
# Start Flask (from single_app directory)
python app.py
```

Navigate to: `http://localhost:5000/chat`

**That's it!** 🎉

## What You Get

- ✅ Modern mobile-first chat interface
- ✅ Full backend compatibility
- ✅ Inline subscript citations working
- ✅ Conversation management
- ✅ Smooth animations
- ✅ Professional UI matching the design

## Development Mode (Optional)

For hot-reload during development:

Terminal 1 (Flask):
```bash
cd simplechat/application/single_app
python app.py
```

Terminal 2 (React dev server):
```bash
cd simplechat/application/react_chat
npm run dev
```

Then open: `http://localhost:5173`

## Customization

### Change Brand Colors

Edit `tailwind.config.js`:
```javascript
colors: {
  primary: {
    DEFAULT: '#FF6B35',  // Your color here
    dark: '#E55527',
    light: '#FF8A5C',
  },
}
```

Rebuild: `npm run build`

## Troubleshooting

**React app doesn't load?**
- Check that `static/react_chat/assets/` folder exists
- Verify route is registered in `app.py`
- Check browser console for errors

**API errors?**
- Ensure Flask is running
- Check you're logged in
- Verify backend endpoints work at `/api/get_conversations`

**Citations not working?**
- Backend must return `hybrid_citations` in API response
- Check citation format: `(Source: file, Pages: X) [#id]`

## Next Steps

1. ✅ Test all features
2. ✅ Customize colors and branding
3. ✅ Deploy to production
4. ✅ See INTEGRATION_GUIDE.md for advanced configuration

## URLs

- Legacy Interface: `/chats`
- New React Interface: `/chat`
- API Docs: See backend route files

## Support Files

- `README.md` - Full documentation
- `INTEGRATION_GUIDE.md` - Deployment and advanced setup
- `package.json` - Dependencies and scripts
- `vite.config.js` - Build configuration

Enjoy your new modern chat interface! 🚀



















