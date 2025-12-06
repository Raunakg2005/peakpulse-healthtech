# 🚀 Deployment Guide - Periscope Hackathon 2025

## Pushing to GitHub Repository

### Step 1: Initialize Git (if not already done)

```bash
cd d:\E\healthtech2.0
git init
```

### Step 2: Add Remote Repository

```bash
git remote add origin https://github.com/Periscope-Hackathon2025/404-Healer-Not-Found.git
```

### Step 3: Stage All Files

```bash
git add .
```

### Step 4: Create Initial Commit

```bash
git commit -m "[Initial] PeakPulse - Quantum-Enhanced Wellness Platform

- Complete Next.js frontend with TypeScript
- 7 ML models including quantum dropout predictor
- Comprehensive gamification system (25 badges, 30 levels)
- MongoDB integration
- FastAPI ML service
- Complete documentation
- Ready for Periscope Hackathon 2025"
```

### Step 5: Push to GitHub

```bash
git branch -M main
git push -u origin main
```

---

## Alternative: Using PowerShell Script

Save this as `deploy.ps1`:

```powershell
# PeakPulse Deployment Script
Write-Host "🏔️ Deploying PeakPulse to GitHub..." -ForegroundColor Cyan

# Check if git is installed
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}

# Navigate to project directory
Set-Location -Path "d:\E\healthtech2.0"

# Initialize git if needed
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
}

# Add remote
Write-Host "🔗 Adding remote repository..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/Periscope-Hackathon2025/404-Healer-Not-Found.git

# Stage files
Write-Host "📝 Staging files..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "💾 Creating commit..." -ForegroundColor Yellow
git commit -m "[Initial] PeakPulse - Quantum-Enhanced Wellness Platform

- Complete Next.js frontend with TypeScript
- 7 ML models including quantum dropout predictor
- Comprehensive gamification system (25 badges, 30 levels)
- MongoDB integration
- FastAPI ML service
- Complete documentation
- Ready for Periscope Hackathon 2025"

# Push
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main --force

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌐 View your project at: https://github.com/Periscope-Hackathon2025/404-Healer-Not-Found" -ForegroundColor Cyan
```

Run with:
```powershell
.\deploy.ps1
```

---

## Pre-Deployment Checklist

### ✅ Code Quality
- [ ] Remove all debug `console.log` statements
- [ ] Clean up commented code
- [ ] Ensure consistent formatting
- [ ] No hardcoded secrets (use .env)

### ✅ Documentation
- [ ] README.md complete with badges
- [ ] Team member names added
- [ ] Screenshots/demo video added
- [ ] All docs in /docs folder

### ✅ Configuration
- [ ] .gitignore properly configured
- [ ] .env.example created (if needed)
- [ ] package.json metadata updated

### ✅ Testing
- [ ] ML models trained and saved
- [ ] Database connection tested
- [ ] All API endpoints working
- [ ] Frontend builds successfully

---

## Clean-Up Commands

### Remove Debug Logs (Optional)

Search and remove console.log:
```bash
# Find all console.log instances
grep -r "console.log" --include="*.ts" --include="*.tsx" .

# Or use PowerShell
Get-ChildItem -Recurse -Include *.ts,*.tsx | Select-String "console.log"
```

### Format Code

```bash
# Format with Prettier
npm run format

# Or manually
npx prettier --write "**/*.{ts,tsx,js,jsx,json,md}"
```

---

## Environment Variables

Create `.env.example` for team:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/peakpulse

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ML Service
ML_SERVICE_URL=http://localhost:8000
```

---

## GitHub Repository Setup

### Branch Protection (Recommended)

1. Go to repository Settings
2. Navigate to Branches
3. Add rule for `main` branch:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date

### Labels

Create these labels for issues:
- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Documentation improvements
- `ml-model` - Machine learning related
- `frontend` - UI/UX changes
- `backend` - API/server changes

### Topics

Add these topics to your repo:
- `hackathon`
- `periscope-hackathon-2025`
- `quantum-computing`
- `machine-learning`
- `wellness`
- `nextjs`
- `fastapi`
- `mongodb`

---

## Continuous Integration (Optional)

### GitHub Actions Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Lint
      run: npm run lint
```

---

## Production Deployment

### Vercel (Recommended for Next.js)

1. **Connect GitHub**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel auto-detects Next.js

2. **Configure Environment Variables**
   - Add all .env variables in Vercel dashboard
   - Use MongoDB Atlas for production database

3. **Deploy**
   - Automatic deployment on every push to main
   - Preview deployments for pull requests

### Railway (For ML Service)

1. **Deploy FastAPI**
   - Connect GitHub repo
   - Select `ml-service` directory
   - Add environment variables
   - Railway provides HTTPS URL

2. **Update Frontend**
   - Update `ML_SERVICE_URL` in Vercel to Railway URL

---

## Post-Deployment Tasks

### Update README
- [ ] Add live demo URL
- [ ] Add screenshot URLs
- [ ] Add video demo link
- [ ] Update team member names

### Create Demo Content
- [ ] Record screen demo (3-5 minutes)
- [ ] Take screenshots of key features
- [ ] Upload to YouTube/Vimeo
- [ ] Add thumbnails to README

### Hackathon Submission
- [ ] Submit GitHub repo URL
- [ ] Submit live demo URL
- [ ] Submit video demo
- [ ] Fill presentation slides
- [ ] Prepare pitch (5 minutes)

---

## Troubleshooting

### Push Rejected?

```bash
# Force push (use carefully!)
git push -u origin main --force

# Or create new branch
git checkout -b hackathon-submission
git push -u origin hackathon-submission
```

### Large Files?

```bash
# Check file sizes
git ls-files | xargs -I{} du -h {} | sort -h | tail -20

# Remove large files from git history (if needed)
git filter-branch --tree-filter 'rm -f path/to/large/file' HEAD
```

### Merge Conflicts?

```bash
# Pull latest changes
git pull origin main

# Resolve conflicts manually
# Then:
git add .
git commit -m "[Fix] Resolve merge conflicts"
git push origin main
```

---

## Quick Reference

### Git Commands

```bash
# Status
git status

# Stage specific file
git add path/to/file

# Commit with message
git commit -m "[Feature] Add new feature"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main

# View commit history
git log --oneline

# Create branch
git checkout -b feature-branch

# Switch branch
git checkout main

# Merge branch
git merge feature-branch
```

### Commit Message Format

Follow the convention:
```
[Type] Short description

Detailed explanation (optional)

- Bullet point 1
- Bullet point 2
```

**Types:**
- `[Feature]` - New feature
- `[Fix]` - Bug fix
- `[Docs]` - Documentation
- `[Style]` - Formatting
- `[Refactor]` - Code restructure
- `[Test]` - Tests
- `[Chore]` - Maintenance

---

## Support

For deployment issues:
- GitHub Issues: https://github.com/Periscope-Hackathon2025/404-Healer-Not-Found/issues
- Team communication channel
- Hackathon Discord/Slack

---

<div align="center">

**Ready to deploy! 🚀**

Good luck with the Periscope Hackathon 2025!

</div>
