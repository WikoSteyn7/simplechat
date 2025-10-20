#!/bin/bash

# Build script for React Chat Interface
# This script builds the React app and places it in the Flask static directory

set -e

echo "🏗️  Building SuperWorker React Chat Interface..."

# Navigate to react_chat directory
cd "$(dirname "$0")"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the app
echo "🔨 Building production bundle..."
npm run build

echo "✅ Build complete! React app is ready at ../single_app/static/react_chat"
echo ""
echo "To serve the React app, add this route to your Flask app.py:"
echo ""
echo "from route_frontend_react_chat import register_route_frontend_react_chat"
echo "register_route_frontend_react_chat(app)"
echo ""
echo "Then navigate to /chat to use the new interface."



















