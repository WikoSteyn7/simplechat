# Build script for React Chat Interface (PowerShell)
# This script builds the React app and places it in the Flask static directory

$ErrorActionPreference = "Stop"

Write-Host "🏗️  Building SuperWorker React Chat Interface..." -ForegroundColor Cyan

# Navigate to react_chat directory
Set-Location $PSScriptRoot

# Install dependencies if node_modules doesn't exist
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Build the app
Write-Host "🔨 Building production bundle..." -ForegroundColor Yellow
npm run build

Write-Host "✅ Build complete! React app is ready at ../single_app/static/react_chat" -ForegroundColor Green
Write-Host ""
Write-Host "To serve the React app, add this route to your Flask app.py:" -ForegroundColor Cyan
Write-Host ""
Write-Host "from route_frontend_react_chat import register_route_frontend_react_chat" -ForegroundColor White
Write-Host "register_route_frontend_react_chat(app)" -ForegroundColor White
Write-Host ""
Write-Host "Then navigate to /chat to use the new interface." -ForegroundColor Cyan



















