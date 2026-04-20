# Complete Deployment Guide: Netlify + GitHub

## Project: Department of Physics Website
**Repository**: https://github.com/minhazexo/dop-repo.git  
**Current Branch**: master  
**Backend**: Node.js/Express in `/Server`  
**Frontend**: React 19 with Create React App  

---

## 📋 Prerequisites

### 1. Required Tools
- **Git** (already installed)
- **Node.js** 18+ (already installed)
- **Netlify CLI** (optional but recommended)
- **GitHub Account** (connected: minhazexo)

### 2. Environment Variables Needed
Create `.env` file in root (DO NOT commit to GitHub):
```
REACT_APP_API_URL=https://your-backend-url.herokuapp.com
REACT_APP_SITE_URL=https://your-site.netlify.app
```

Create `.env` in `/Server` for backend:
```
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
JWT_SECRET=your-jwt-secret
PORT=5010
```

---

## 🚀 Quick Deployment Workflow

### Standard Workflow (After Code Changes):
```bash
# 1. Make your code changes
# 2. Test locally
npm start

# 3. Commit changes
git add .
git commit -m "Description of changes"

# 4. Push to GitHub (triggers Netlify auto-deploy)
git push origin master

# 5. Netlify automatically builds and deploys
# 6. Check deployment status at: https://app.netlify.com/sites/your-site/deploys
```

---

## 🔧 Initial Setup (One-Time)

### Step 1: Connect GitHub to Netlify
1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" and authorize Netlify
4. Select your repository: `minhazexo/dop-repo`
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
   - **Node version**: 18 (or latest)

### Step 2: Set Environment Variables in Netlify
In Netlify Dashboard → Site settings → Environment variables:
- `REACT_APP_API_URL` = your backend URL
- `NODE_VERSION` = 18
- Any other frontend environment variables

### Step 3: Configure Custom Domain (Optional)
1. Netlify Dashboard → Domain settings
2. Add custom domain
3. Follow DNS configuration instructions

---

## 📁 File Structure for Deployment

### Important Files for Deployment:
```
├── .gitignore              # Already excludes node_modules, .env, build
├── package.json            # Build scripts: "build": "react-scripts build"
├── public/
│   ├── _redirects          # Netlify redirects (already exists)
│   └── index.html          # React entry point
├── src/
│   └── api.js              # API configuration
└── Server/                 # Backend (needs separate deployment)
```

### Netlify Configuration Files to Add:

#### 1. `netlify.toml` (Create in root)
```toml
[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

#### 2. Update `public/_redirects` (already exists)
```
/*    /index.html    200
```

---

## 🔄 Automated Deployment Pipeline

### Option A: GitHub Actions + Netlify (Recommended)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Netlify

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      env:
        REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}
        
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v2
      with:
        publish-dir: './build'
        production-branch: master
        github-token: ${{ secrets.GITHUB_TOKEN }}
        deploy-message: "Deploy from GitHub Actions"
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Option B: Netlify CLI (Local Deployment)
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize Netlify in your project
netlify init

# Deploy to production
netlify deploy --prod

# Or deploy a draft
netlify deploy --dir=build
```

---

## 🗄️ Backend Deployment (Separate Service)

### Recommended: Render.com (Free Tier)
1. Create new account at [render.com](https://render.com)
2. Create new "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `cd Server && npm install`
   - **Start Command**: `node server.js`
   - **Environment Variables**: Add DB credentials, JWT_SECRET, etc.
5. Get your backend URL (e.g., `https://dop-backend.onrender.com`)

### Update Frontend API Configuration:
In `src/api.js`, change:
```javascript
// For production
const API_BASE_URL = process.env.REACT_APP_API_URL || "https://dop-backend.onrender.com/api";

// For development (keep proxy)
// const API_BASE_URL = process.env.NODE_ENV === 'production' 
//   ? process.env.REACT_APP_API_URL 
//   : '/api';
```

---

## 📊 Database Deployment

### Free MySQL Options:
1. **PlanetScale** (Recommended)
   ```bash
   # Install CLI
   npm install -g planetscale
   
   # Create database
   pscale database create dop-db
   
   # Get connection string
   pscale connect dop-db
   ```

2. Update `Server/db.js` with PlanetScale connection:
```javascript
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true
  }
});
```

---

## 🐛 Troubleshooting Common Issues

### Issue 1: Build fails on Netlify
**Solution**: Check build logs in Netlify Dashboard
- Ensure Node.js version is set to 18+
- Check for missing dependencies in `package.json`
- Verify build command is correct

### Issue 2: API calls fail after deployment
**Solution**: 
1. Check `REACT_APP_API_URL` environment variable
2. Verify CORS configuration in `Server/server.js`:
```javascript
app.use(cors({ 
  origin: ["https://your-site.netlify.app", "http://localhost:3000"], 
  credentials: true 
}));
```

### Issue 3: Routing doesn't work (404 on refresh)
**Solution**: Ensure `public/_redirects` contains:
```
/*    /index.html    200
```

### Issue 4: Large build size
**Solution**: Optimize with:
```bash
# Analyze bundle size
npm run build -- --stats

# Consider code splitting in React
# Move large PDFs to CDN
```

---

## 🔐 Security Best Practices

### 1. Never Commit Sensitive Data
- Add to `.gitignore`: `.env`, `.env.local`, `Server/uploads/`
- Use environment variables in Netlify dashboard

### 2. Secure Backend API
- Implement rate limiting
- Use HTTPS only
- Validate all inputs
- Sanitize database queries

### 3. Frontend Security
- Use Content Security Policy (CSP)
- Implement proper authentication flow
- Store tokens in HttpOnly cookies (not localStorage)

---

## 📈 Monitoring & Maintenance

### 1. Check Deployment Status
- Netlify Dashboard: https://app.netlify.com/sites/your-site/deploys
- GitHub Actions: https://github.com/minhazexo/dop-repo/actions

### 2. Performance Monitoring
```bash
# Audit performance
npm run build
npx lighthouse https://your-site.netlify.app --view
```

### 3. Regular Updates
```bash
# Update dependencies monthly
npm outdated
npm update

# Test after updates
npm test
npm run build
```

---

## 🚨 Emergency Rollback

### If deployment breaks:
1. **Netlify Rollback**:
   - Go to Netlify Dashboard → Deploys
   - Click "Publish deploy" on previous working version

2. **Git Revert**:
```bash
# Revert last commit
git revert HEAD
git push origin master

# Or reset to previous commit
git reset --hard HEAD~1
git push origin master --force
```

---

## 📞 Support Resources

### Documentation:
- [Netlify Docs](https://docs.netlify.com/)
- [Create React App Deployment](https://create-react-app.dev/docs/deployment/)
- [Render Docs](https://render.com/docs)

### Your Project Links:
- GitHub: https://github.com/minhazexo/dop-repo
- Netlify: https://app.netlify.com/teams/minhazexo/sites
- Backend: (Configure after deployment)

---

## ✅ Deployment Checklist

### Before Each Deployment:
- [ ] Run `npm test` locally
- [ ] Run `npm run build` successfully
- [ ] Test API connectivity
- [ ] Update version in `package.json` if needed
- [ ] Update CHANGELOG.md (create if doesn't exist)

### After Deployment:
- [ ] Verify site loads at your URL
- [ ] Test all major features
- [ ] Check mobile responsiveness
- [ ] Verify API endpoints work
- [ ] Test authentication flow

---

## 🎯 Quick Reference Commands

```bash
# Development
npm start                    # Start dev server
npm run server              # Start backend server

# Building
npm run build               # Build for production
npm run build:analyze       # Analyze bundle size

# Deployment
git add . && git commit -m "Update" && git push origin master  # Standard deploy
netlify deploy --prod      # Manual deploy with CLI
npm run deploy             # Custom script (add to package.json)

# Maintenance
npm audit                  # Check security vulnerabilities
npm update                 # Update dependencies
npx serve build           # Test production build locally
```

---

## 📝 Creating a CHANGELOG.md (Recommended)

Create `CHANGELOG.md` in root:
```markdown
# Changelog

## [1.0.0] - 2024-01-01
### Added
- Initial deployment to Netlify
- Backend deployed to Render.com
- MySQL database on PlanetScale

### Changed
- Updated API configuration for production
- Added environment variables

### Fixed
- CORS configuration for production
- Routing issues with Netlify redirects
```

---

## 🏁 Final Notes

Your project is already well-configured for deployment. The key steps are:

1. **Connect GitHub to Netlify** (one-time setup)
2. **Deploy backend separately** (Render.com recommended)
3. **Configure environment variables** in both Netlify and backend
4. **Use the standard Git workflow** for future updates

With this setup, every `git push origin master` will automatically:
1. Trigger GitHub Actions (if configured)
2. Build your React app
3. Deploy to Netlify
4. Make changes live within 2-3 minutes

**Remember**: Always test locally before pushing to master. Use feature branches for major changes:
```bash
git checkout -b feature/new-feature
# Make changes
git push origin feature/new-feature
# Create Pull Request on GitHub
```

Happy deploying! 🚀