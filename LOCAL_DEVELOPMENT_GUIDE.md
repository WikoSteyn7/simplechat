# Local Development Setup Guide

**Last Updated:** October 1, 2025  
**Version:** 0.229.062

## Quick Start (5 Minutes)

This guide shows you how to run and test the application locally without deploying to Azure/Docker every time.

---

## Prerequisites

### Required Software

1. **Python 3.11** (recommended) or 3.9+
   - Download: [python.org/downloads](https://www.python.org/downloads/)
   - Verify: `python --version`

2. **Git** (for cloning/pulling updates)
   - Download: [git-scm.com](https://git-scm.com/)
   - Verify: `git --version`

3. **Code Editor** (VS Code recommended)
   - Download: [code.visualstudio.com](https://code.visualstudio.com/)

### Optional (But Recommended)

- **Azure CLI** (for managing Azure resources)
  - Download: [learn.microsoft.com/cli/azure/install-azure-cli](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)

---

## Step-by-Step Setup

### 1. Navigate to Application Directory

```bash
cd D:\dev\Projects\SuperWorker\Companion\VideoChat\simplechat\application\single_app
```

### 2. Create Python Virtual Environment

**Windows (PowerShell):**
```powershell
# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# If you get execution policy error:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Windows (Command Prompt):**
```cmd
# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate.bat
```

**Mac/Linux:**
```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### 3. Install Dependencies

```bash
# Upgrade pip first
python -m pip install --upgrade pip

# Install all requirements
pip install -r requirements.txt
```

This will install ~50 packages. Takes 2-5 minutes.

### 4. Configure Environment Variables

**Option A: Create `.env` file** (Recommended)

Create a file named `.env` in `simplechat/application/single_app/`:

```bash
# Copy example.env to .env
cp example.env .env

# Edit .env with your actual values
```

**Required Variables:**
```bash
# Azure Cosmos DB
AZURE_COSMOS_ENDPOINT="https://your-cosmos-account.documents.azure.com:443/"
AZURE_COSMOS_AUTHENTICATION_TYPE="key"
AZURE_COSMOS_KEY="your-cosmos-key-here"

# Azure AD Authentication
CLIENT_ID="your-client-id"
TENANT_ID="your-tenant-id"
SECRET_KEY="generate-a-strong-random-key-32-chars-minimum"

# Azure Environment
AZURE_ENVIRONMENT="public"

# Flask Debug Mode (for local development)
FLASK_DEBUG="1"

# Vimeo Integration (Optional)
VIMEO_ACCESS_TOKEN="your-vimeo-token-here"
VIMEO_ENABLE_UPLOAD="true"
VIMEO_PREFERRED_QUALITY="360p"
```

**Option B: Set Environment Variables Manually**

**Windows PowerShell:**
```powershell
$env:FLASK_DEBUG="1"
$env:AZURE_COSMOS_ENDPOINT="https://..."
$env:VIMEO_ACCESS_TOKEN="your-token"
# ... etc
```

**Mac/Linux:**
```bash
export FLASK_DEBUG=1
export AZURE_COSMOS_ENDPOINT="https://..."
export VIMEO_ACCESS_TOKEN="your-token"
# ... etc
```

### 5. Run the Application

**Simple Start:**
```bash
# Make sure venv is activated (you should see (venv) in prompt)
python app.py
```

**Expected Output:**
```
Initializing application...
DEBUG:Application settings: {...}
Setting up Application Insights logging...
Application initialized.
[VIMEO] Configuration validated successfully
Logging timer background task started.
 * Serving Flask app 'app'
 * Debug mode: on
WARNING: This is a development server. Do not use it in production.
 * Running on https://0.0.0.0:5000
Press CTRL+C to quit
```

**Access the App:**
```
Open browser to: https://localhost:5000
```

⚠️ **SSL Certificate Warning:** Click "Advanced" → "Proceed to localhost (unsafe)"  
This is normal for local development with `ssl_context='adhoc'`

---

## Local Development Workflow

### Making Changes and Testing

**1. Edit Code:**
```
- Open files in your editor
- Make changes to Python, JS, HTML, CSS files
- Save files
```

**2. Reload Changes:**

**For Python files:**
```
- Flask auto-reloads in debug mode
- Save file → Flask detects change → Auto-restarts
- Refresh browser to see changes
```

**For JavaScript/CSS/HTML files:**
```
- Changes are immediate
- Just refresh browser (Ctrl + R)
- Or hard refresh (Ctrl + Shift + R) to clear cache
```

**For config.py changes:**
```
- Stop Flask (Ctrl + C)
- Restart: python app.py
- (Config is loaded at startup only)
```

### Viewing Logs

**Terminal Output:**
All print statements and debug_print() calls appear in the terminal where you ran `python app.py`.

**Filter for specific logs:**
```bash
# In a separate terminal, watch logs:
# (while app is running)

# Watch all logs
python app.py 2>&1 | tee app.log

# Filter for Vimeo logs
python app.py 2>&1 | grep "\[VIMEO\]"

# Filter for Video Indexer logs
python app.py 2>&1 | grep "\[VIDEO INDEXER\]"
```

### Testing New Features

**Example: Test Vimeo Upload**

1. **Ensure Vimeo is configured:**
```bash
# Check your .env file has:
VIMEO_ACCESS_TOKEN="your_token"
VIMEO_ENABLE_UPLOAD="true"
```

2. **Restart app to load config:**
```bash
# Ctrl+C to stop
python app.py
```

3. **Test in browser:**
```
- Go to https://localhost:5000
- Login
- Navigate to User Workspace → Documents
- Drag & drop a small test video
- Watch terminal for Vimeo logs:
  [VIMEO] Creating video entry for: test.mp4
  [VIMEO] Video entry created successfully: /videos/...
  [VIMEO] Starting TUS upload
  [VIMEO] Upload completed successfully
  [VIMEO] Waiting for video processing
  [VIMEO] Video processing complete!
  [VIMEO] Retrieved both URLs
```

4. **Check for errors:**
```
- Terminal shows any errors
- Browser console shows frontend errors (F12)
- Fix errors and save files
- Flask auto-reloads
```

---

## Faster Development Tips

### 1. Hot Reload (Automatic)

Flask debug mode automatically reloads when Python files change!

**Just save your file → Flask restarts → Refresh browser**

**Exceptions (manual restart required):**
- Changes to `config.py`
- Changes to environment variables
- Installing new packages

### 2. Skip Authentication (Development Only)

**For faster testing, you can temporarily disable auth:**

Create `config_override.py`:
```python
# DON'T COMMIT THIS FILE!
# For local testing only

from functools import wraps

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Skip authentication check
        return f(*args, **kwargs)
    return decorated_function

def user_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        return f(*args, **kwargs)
    return decorated_function
```

⚠️ **WARNING:** Only use for isolated testing! Never deploy with auth disabled!

### 3. Use Local File Storage

**For testing without Azure Blob Storage:**

Set in `.env`:
```bash
# Disable blob storage features temporarily
ENABLE_ENHANCED_CITATIONS="false"
```

### 4. Browser Auto-Refresh

**Use browser extension for auto-reload:**
- **Chrome:** Live Server or Auto Refresh
- **Firefox:** Auto Reload
- **VS Code:** Live Server extension

### 5. Simplified Testing

**Test individual components:**

```python
# test_vimeo.py
from functions_vimeo import validate_vimeo_url, get_vimeo_access_token

# Test URL validation
url = "https://player.vimeo.com/progressive_redirect/download/123456/..."
is_valid, normalized, video_id, error = validate_vimeo_url(url)
print(f"Valid: {is_valid}, Video ID: {video_id}")

# Test token
token = get_vimeo_access_token()
print(f"Token configured: {bool(token)}")
```

Run: `python test_vimeo.py`

---

## Common Development Scenarios

### Scenario 1: Testing Vimeo Upload Feature

**Setup:**
```bash
# 1. Set environment variables
export VIMEO_ACCESS_TOKEN="your_test_token"
export VIMEO_ENABLE_UPLOAD="true"
export FLASK_DEBUG="1"

# 2. Start app
python app.py

# 3. In browser
https://localhost:5000
```

**Test:**
- Upload small test video (~10 MB)
- Watch terminal for logs
- Check document appears
- Test playback

### Scenario 2: Testing Frontend Changes Only

**For JS/CSS/HTML changes:**
```bash
# 1. Start app once
python app.py

# 2. Edit frontend files
# 3. Just refresh browser (no restart needed)
# 4. Check browser console for errors (F12)
```

### Scenario 3: Testing Backend Changes

**For Python changes:**
```bash
# 1. Start app in debug mode
export FLASK_DEBUG=1
python app.py

# 2. Edit Python files
# 3. Save file
# 4. Flask auto-reloads (watch terminal)
# 5. Refresh browser
```

### Scenario 4: Debugging Errors

**Python Errors:**
```bash
# Terminal shows full stack trace
# Look for the error message
# Check file and line number
# Fix and save (auto-reloads)
```

**JavaScript Errors:**
```bash
# Browser console (F12)
# Look for red error messages
# Check file and line number
# Fix and hard refresh (Ctrl + Shift + R)
```

**Network Errors:**
```bash
# Browser DevTools → Network tab
# Look for failed requests (red)
# Check status code and response
# Fix backend endpoint
```

---

## VS Code Setup (Recommended)

### 1. Install Extensions

- **Python** (Microsoft)
- **Pylance** (Microsoft)
- **Flask Snippets**
- **Better Comments**
- **GitLens**

### 2. Configure Debugging

Create `.vscode/launch.json`:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Flask App",
            "type": "python",
            "request": "launch",
            "module": "flask",
            "env": {
                "FLASK_APP": "app.py",
                "FLASK_DEBUG": "1"
            },
            "args": [
                "run",
                "--host=0.0.0.0",
                "--port=5000",
                "--cert=adhoc"
            ],
            "jinja": true,
            "justMyCode": false
        }
    ]
}
```

**Usage:**
- Press F5 to start debugging
- Set breakpoints in Python code
- Step through code execution
- Inspect variables

### 3. Configure Settings

Create `.vscode/settings.json`:

```json
{
    "python.defaultInterpreterPath": "${workspaceFolder}/venv/Scripts/python.exe",
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": true,
    "editor.formatOnSave": true,
    "files.exclude": {
        "**/__pycache__": true,
        "**/*.pyc": true
    }
}
```

---

## Environment Configuration

### Minimal .env for Local Testing

**Quick Start (minimum required):**

```bash
# === REQUIRED ===
SECRET_KEY="local-dev-secret-key-change-in-production"
FLASK_DEBUG="1"

# Azure Cosmos DB (use your dev/test instance)
AZURE_COSMOS_ENDPOINT="https://your-dev-cosmos.documents.azure.com:443/"
AZURE_COSMOS_AUTHENTICATION_TYPE="key"
AZURE_COSMOS_KEY="your-dev-cosmos-key"

# Azure AD (use dev app registration)
CLIENT_ID="your-dev-client-id"
TENANT_ID="your-tenant-id"
AZURE_ENVIRONMENT="public"

# === OPTIONAL (for testing specific features) ===

# Vimeo Integration
VIMEO_ACCESS_TOKEN="your-vimeo-token"
VIMEO_ENABLE_UPLOAD="true"
VIMEO_PREFERRED_QUALITY="360p"

# Video Indexer (if testing video features)
VIDEO_INDEXER_ENDPOINT="https://api.videoindexer.ai"
VIDEO_INDEXER_LOCATION="trial"
VIDEO_INDEXER_ACCOUNT_ID="your-account-id"

# Azure OpenAI (if testing chat features)
AZURE_OPENAI_ENDPOINT="https://your-openai.openai.azure.com/"
AZURE_OPENAI_KEY="your-key"
AZURE_OPENAI_DEPLOYMENT="your-deployment"

# Disable features you're not testing
ENABLE_ENHANCED_CITATIONS="false"
ENABLE_GROUP_WORKSPACES="false"
ENABLE_PUBLIC_WORKSPACES="false"
```

### Full .env Template

**For complete local development:**

Use `example.env` as template and fill in your values:

```bash
cp example.env .env
# Edit .env with your Azure resource credentials
```

---

## Running the Application

### Method 1: Direct Python (Recommended for Development)

```bash
# 1. Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Mac/Linux:
source venv/bin/activate

# 2. Set debug mode
# Windows:
$env:FLASK_DEBUG="1"

# Mac/Linux:
export FLASK_DEBUG=1

# 3. Run app
python app.py
```

**Access:** `https://localhost:5000`

**Advantages:**
- ✅ Auto-reload on file changes
- ✅ Detailed error messages
- ✅ Direct terminal output
- ✅ Fast iteration

### Method 2: Using Flask CLI

```bash
# Set environment
export FLASK_APP=app.py
export FLASK_DEBUG=1

# Run with flask command
flask run --host=0.0.0.0 --port=5000 --cert=adhoc
```

**Access:** `https://localhost:5000`

### Method 3: Docker (For Testing Container)

**Build locally:**
```bash
# From VideoChat root directory
cd D:\dev\Projects\SuperWorker\Companion\VideoChat

# Build container
docker build -f simplechat/Dockerfile.simple -t simplechat-local:latest .

# Run container
docker run -p 5000:5000 --env-file simplechat/application/single_app/.env simplechat-local:latest
```

**Access:** `http://localhost:5000`

**Advantages:**
- ✅ Tests actual container
- ✅ Matches production environment
- ✅ Catches Docker-specific issues

**Disadvantages:**
- ❌ Must rebuild on code changes
- ❌ Slower iteration
- ❌ Less debugging info

---

## Development Workflow

### Typical Development Session

```bash
# 1. Start of day - activate venv
cd D:\dev\Projects\SuperWorker\Companion\VideoChat\simplechat\application\single_app
.\venv\Scripts\Activate.ps1

# 2. Pull latest changes
git pull

# 3. Install any new dependencies
pip install -r requirements.txt

# 4. Start app
python app.py

# 5. Open browser
# https://localhost:5000

# 6. Make changes in editor
# Save files → Flask auto-reloads

# 7. Test changes in browser
# Refresh to see updates

# 8. Check terminal for logs
# Watch for errors or debug output

# 9. End of day - deactivate venv
deactivate
```

### Rapid Testing Loop

**For quick feature testing:**

```bash
# Terminal 1: Run app
python app.py

# Terminal 2: Watch logs
# (optional - filter for specific feature)
tail -f app.log | grep "VIMEO"

# Browser: Open DevTools (F12)
# - Console tab: See JavaScript logs
# - Network tab: See API requests
# - Elements tab: Inspect DOM changes

# Edit → Save → Auto-reload → Refresh → Test
# Repeat until feature works!
```

---

## Testing New Vimeo Feature Locally

### Quick Test Script

Create `test_vimeo_local.py`:

```python
#!/usr/bin/env python
"""Quick test script for Vimeo integration"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Test imports
try:
    from functions_vimeo import (
        get_vimeo_access_token,
        is_vimeo_enabled,
        validate_vimeo_url
    )
    print("✅ Vimeo module imports successful")
except ImportError as e:
    print(f"❌ Import error: {e}")
    exit(1)

# Test configuration
token = get_vimeo_access_token()
enabled = is_vimeo_enabled()

print(f"\n🔧 Configuration:")
print(f"  VIMEO_ACCESS_TOKEN configured: {bool(token)}")
print(f"  VIMEO_ENABLE_UPLOAD: {enabled}")

if not token:
    print("\n⚠️  Set VIMEO_ACCESS_TOKEN in .env file")
    exit(1)

# Test URL validation
test_urls = [
    "https://player.vimeo.com/progressive_redirect/download/1123322152/rendition/360p/file.mp4?signature=...",
    "https://player.vimeo.com/progressive_redirect/playback/1123322152/rendition/360p/file.mp4?signature=...",
    "https://vimeo.com/123456789",
    "https://invalid-url.com/video"
]

print(f"\n🧪 Testing URL Validation:")
for test_url in test_urls:
    from functions_documents import validate_vimeo_url
    is_valid, normalized, video_id, error = validate_vimeo_url(test_url)
    
    if is_valid:
        print(f"  ✅ Valid: {test_url[:60]}...")
        print(f"     Video ID: {video_id}")
    else:
        print(f"  ❌ Invalid: {test_url[:60]}...")
        print(f"     Error: {error}")

print(f"\n✅ All tests complete!")
print(f"\n🚀 Ready to test in browser: https://localhost:5000")
```

**Run it:**
```bash
python test_vimeo_local.py
```

---

## Troubleshooting Local Development

### Issue: "Module not found"

**Error:** `ModuleNotFoundError: No module named 'XXX'`

**Solution:**
```bash
# Ensure venv is activated
.\venv\Scripts\Activate.ps1

# Reinstall requirements
pip install -r requirements.txt

# If still failing, install specific package:
pip install package-name
```

### Issue: "Port already in use"

**Error:** `OSError: [Errno 98] Address already in use`

**Solution:**
```bash
# Find process using port 5000
# Windows:
netstat -ano | findstr :5000

# Mac/Linux:
lsof -ti:5000

# Kill the process
# Windows:
taskkill /PID <PID> /F

# Mac/Linux:
kill -9 <PID>

# Or use different port:
python app.py --port=5001
```

### Issue: "SSL certificate error"

**Error:** Browser shows "Your connection is not private"

**Solution:**
```
This is normal for local development!
1. Click "Advanced"
2. Click "Proceed to localhost (unsafe)"
3. Or disable HTTPS for local dev:

In app.py, change:
app.run(host="0.0.0.0", port=5000, debug=True, ssl_context='adhoc')
To:
app.run(host="0.0.0.0", port=5000, debug=True)

Then access: http://localhost:5000 (not https)
```

### Issue: "Environment variables not loading"

**Symptoms:** Config shows None or defaults

**Solution:**
```bash
# 1. Ensure .env file exists in correct location
ls simplechat/application/single_app/.env

# 2. Check .env is properly formatted (no quotes unless needed)
VIMEO_ACCESS_TOKEN=abc123  # Good
VIMEO_ACCESS_TOKEN="abc123"  # Also good
VIMEO_ACCESS_TOKEN='abc123'  # Also good

# 3. Restart app (env loaded at startup)
Ctrl+C
python app.py

# 4. Verify in app:
# Check terminal output for config values
```

### Issue: "Vimeo integration not working"

**Symptoms:** Upload fails or returns "not enabled"

**Debug Steps:**
```bash
# 1. Check environment variables are set
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('Token:', bool(os.getenv('VIMEO_ACCESS_TOKEN'))); print('Enabled:', os.getenv('VIMEO_ENABLE_UPLOAD'))"

# 2. Test Vimeo API directly
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.vimeo.com/me

# 3. Check backend logs for detailed errors
# Look for [VIMEO] prefixed messages

# 4. Verify token scopes include: upload, private, video_files
# Go to developer.vimeo.com → Your App → Authentication → Check scopes
```

### Issue: "CSS/JS changes not appearing"

**Symptoms:** Code changed but browser shows old version

**Solution:**
```bash
# 1. Hard refresh browser
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# 2. Clear browser cache
# Browser settings → Clear browsing data → Cached files

# 3. Disable browser cache (while DevTools open)
# F12 → Network tab → Check "Disable cache"

# 4. Add cache-busting to development
# In templates, add: ?v=timestamp to static files
<script src="/static/js/file.js?v=12345"></script>
```

---

## Best Practices

### 1. Use Separate Azure Resources for Dev

**Recommended:**
```
Production:
  - Cosmos DB: prod-cosmos-account
  - Video Indexer: prod-video-indexer
  - Storage: prod-storage

Development:
  - Cosmos DB: dev-cosmos-account
  - Video Indexer: dev-video-indexer (or trial)
  - Storage: dev-storage
```

**Why:**
- ✅ No risk to production data
- ✅ Can test destructive operations
- ✅ Cheaper (smaller instances)
- ✅ Faster iteration

### 2. Use .env for Secrets

**Never commit:**
```bash
# Add to .gitignore (already included)
.env
*.env
!example.env
```

**Use example.env as template:**
```bash
cp example.env .env
# Edit .env with real values
# Commit example.env (with placeholders)
# Never commit .env (with real secrets)
```

### 3. Keep Dependencies Updated

```bash
# Update a specific package
pip install --upgrade package-name

# Update all packages (careful!)
pip install --upgrade -r requirements.txt

# Freeze current versions
pip freeze > requirements.txt
```

### 4. Use Version Control

```bash
# Before making changes
git checkout -b feature/my-new-feature

# Make changes, test locally
# Commit when working
git add .
git commit -m "Add my new feature"

# Push to remote
git push origin feature/my-new-feature

# Create pull request for review
```

---

## Quick Reference Commands

### Start Development

```bash
cd D:\dev\Projects\SuperWorker\Companion\VideoChat\simplechat\application\single_app
.\venv\Scripts\Activate.ps1
python app.py
```

### Stop Application

```
Ctrl + C in terminal
```

### Restart After Config Changes

```bash
Ctrl + C
python app.py
```

### Test Specific Feature

```bash
# Test Vimeo URL validation
python -c "from functions_documents import validate_vimeo_url; print(validate_vimeo_url('https://player.vimeo.com/...'))"

# Test Vimeo configuration
python -c "from functions_vimeo import is_vimeo_enabled; print(is_vimeo_enabled())"
```

### View Logs in Real-Time

```bash
# Run app with log filtering
python app.py 2>&1 | grep "VIMEO\|VIDEO INDEXER\|ERROR"
```

---

## Production Deployment Comparison

| Aspect | Local Development | Production (Azure/Docker) |
|--------|-------------------|---------------------------|
| **Setup Time** | ~5 minutes | ~30-60 minutes |
| **Iteration Speed** | ⚡ Instant (auto-reload) | 🐌 Slow (rebuild/redeploy) |
| **Debugging** | ✅ Full access, breakpoints | ⚠️ Logs only |
| **Testing** | ✅ Easy, fast | ⚠️ Complex, slow |
| **Cost** | 💰 Free (dev resources) | 💰 Production costs |
| **Use Case** | 🔧 Development, testing | 🚀 User-facing, production |

**Recommendation:**
- Develop and test locally
- Deploy to production when feature is complete
- Much faster development cycle!

---

## 🎯 Summary

**You can now:**
- ✅ Run app locally in ~2 minutes
- ✅ Test changes instantly (auto-reload)
- ✅ Debug with full access to logs
- ✅ Iterate rapidly without Docker builds
- ✅ Test Vimeo integration locally
- ✅ Use VS Code debugging tools

**Typical workflow:**
1. Start app: `python app.py`
2. Edit code and save
3. Flask auto-reloads
4. Refresh browser to test
5. Check terminal for logs
6. Fix errors and repeat
7. Deploy to production when ready

**This saves hours of deployment time!** 🚀

---

**For your Vimeo testing:**
1. Set `VIMEO_ACCESS_TOKEN` in `.env`
2. Set `VIMEO_ENABLE_UPLOAD=true`
3. Run `python app.py`
4. Test upload at `https://localhost:5000`
5. Watch terminal for detailed Vimeo logs
6. Iterate until perfect!

**No more waiting for container builds!** ⚡

