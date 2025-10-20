# Deployment Guide - React Chat Interface

This guide covers deploying the React chat interface to production environments.

## Pre-Deployment Checklist

- [ ] Backend API endpoints are working
- [ ] Authentication is configured
- [ ] Environment variables are set
- [ ] React app builds successfully
- [ ] Flask route is registered
- [ ] Testing completed

## Build for Production

### 1. Build the React App

```bash
cd simplechat/application/react_chat
npm run build
```

This creates optimized production files in `../single_app/static/react_chat/`

### 2. Verify Build Output

Check that these files exist:
```
single_app/static/react_chat/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── vendor-[hash].js
└── manifest.json (optional)
```

## Deployment Options

### Option 1: Azure App Service

#### Method A: Deploy with source code

1. **Add to .deployment** (if exists):
```ini
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

2. **Add to package.json** in project root:
```json
{
  "scripts": {
    "postinstall": "cd simplechat/application/react_chat && npm install && npm run build"
  }
}
```

3. Deploy via Azure CLI, GitHub Actions, or Azure DevOps

#### Method B: Pre-build locally

1. Build locally:
```bash
cd simplechat/application/react_chat
npm run build
```

2. Commit the `static/react_chat` folder
3. Deploy to Azure

**Recommended:** Method B for faster deployments

### Option 2: Docker

Add to your Dockerfile:

```dockerfile
FROM python:3.11-slim

# Install Node.js
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy application
WORKDIR /app
COPY simplechat /app/simplechat

# Build React app
WORKDIR /app/simplechat/application/react_chat
RUN npm install && npm run build

# Setup Python environment
WORKDIR /app/simplechat/application/single_app
RUN pip install --no-cache-dir -r requirements.txt

# Run Flask
CMD ["python", "app.py"]
```

### Option 3: Kubernetes

Create a build step in your CI/CD:

```yaml
# .github/workflows/deploy.yml
- name: Build React App
  run: |
    cd simplechat/application/react_chat
    npm install
    npm run build

- name: Build Docker Image
  run: docker build -t your-app:latest .
```

## Environment Configuration

### Production Environment Variables

Create `.env.production` in `react_chat/`:

```env
# API Configuration
VITE_API_BASE_URL=https://your-app.azurewebsites.net

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
```

### Flask Configuration

Ensure Flask knows it's in production:

```python
# app.py or config.py
import os

ENV = os.getenv('FLASK_ENV', 'production')
DEBUG = ENV == 'development'
```

## Optimizations

### 1. Enable Gzip Compression

In Flask:

```python
from flask_compress import Compress

app = Flask(__name__)
Compress(app)
```

### 2. Set Cache Headers

```python
@app.route('/static/<path:filename>')
def serve_static(filename):
    response = send_from_directory('static', filename)
    if filename.startswith('react_chat/assets/'):
        # Cache for 1 year (files have hash in name)
        response.cache_control.max_age = 31536000
        response.cache_control.public = True
    return response
```

### 3. CDN Integration (Optional)

If using Azure CDN:

1. Upload `static/react_chat` to Azure Blob Storage
2. Point CDN to blob storage
3. Update `react_chat.html` to load from CDN:

```html
<link rel="stylesheet" href="https://cdn.yourapp.com/react_chat/assets/index.css">
<script src="https://cdn.yourapp.com/react_chat/assets/index.js"></script>
```

## Monitoring

### 1. Application Insights (Azure)

Add to `index.html`:

```html
<script>
var appInsights=window.appInsights||function(config){
  // Application Insights snippet
}({
  instrumentationKey: "YOUR_KEY"
});
</script>
```

### 2. Error Tracking

In `App.jsx`:

```javascript
import { useEffect } from 'react';

useEffect(() => {
  window.addEventListener('error', (event) => {
    // Log to your error tracking service
    console.error('React Error:', event.error);
  });
}, []);
```

### 3. Performance Monitoring

```javascript
// Track page load time
window.addEventListener('load', () => {
  const loadTime = performance.now();
  console.log('Page load time:', loadTime);
  // Send to analytics
});
```

## Security Considerations

### 1. Content Security Policy

Add to Flask:

```python
@app.after_request
def set_csp(response):
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
    )
    return response
```

### 2. HTTPS Only

Ensure your app enforces HTTPS:

```python
from flask_talisman import Talisman

Talisman(app, force_https=True)
```

### 3. API Authentication

The React app uses session cookies for authentication. Ensure:
- Cookies are httpOnly
- Cookies are secure (HTTPS only)
- CSRF protection is enabled

## Troubleshooting

### Build fails

```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Assets not loading

- Check file paths in browser DevTools
- Verify `static/react_chat` exists
- Check Flask route serves files correctly

### API calls fail in production

- Verify CORS settings
- Check authentication cookies
- Ensure API base URL is correct

### Slow load times

- Enable gzip compression
- Use CDN for static files
- Check bundle size: `npm run build -- --analyze`

## Rollback Procedure

If issues occur after deployment:

1. **Quick rollback**: Revert to legacy interface
   ```python
   # Comment out React route temporarily
   # register_route_frontend_react_chat(app)
   ```

2. **Full rollback**: Deploy previous version
   ```bash
   git revert <commit-hash>
   git push
   ```

## Post-Deployment Verification

### 1. Smoke Tests

- [ ] Can access `/chat`
- [ ] Can login
- [ ] Can create conversation
- [ ] Can send message
- [ ] Citations render correctly
- [ ] Conversation list works

### 2. Performance Tests

- [ ] Page load < 3s
- [ ] First interaction < 1s
- [ ] API calls complete quickly

### 3. Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS/Android)

## CI/CD Pipeline Example

### GitHub Actions

```yaml
name: Deploy React Chat

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Build React App
        run: |
          cd simplechat/application/react_chat
          npm ci
          npm run build
          
      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: your-app-name
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
```

## Scaling Considerations

### Horizontal Scaling

The React app is stateless and scales horizontally:
- Use load balancer
- Enable sticky sessions for Flask
- Ensure shared session storage (Redis)

### Caching Strategy

1. **Static Assets**: Cache for 1 year (versioned)
2. **API Responses**: Short TTL (5 minutes)
3. **Session Data**: Redis or Azure Cache

## Maintenance

### Regular Updates

```bash
# Update dependencies quarterly
cd react_chat
npm update
npm audit fix
npm run build
```

### Security Patches

Monitor for vulnerabilities:
```bash
npm audit
```

Apply patches immediately:
```bash
npm audit fix
```

## Support

For deployment issues:
1. Check deployment logs
2. Review this guide
3. Check Flask application logs
4. Review browser console errors
5. Contact support team

## Resources

- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [React Deployment](https://react.dev/learn/start-a-new-react-project#deploying-to-production)
- [Azure App Service](https://docs.microsoft.com/azure/app-service/)
- [Flask Deployment](https://flask.palletsprojects.com/en/latest/deploying/)



















