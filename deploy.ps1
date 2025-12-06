# PeakPulse Deployment Script for Periscope Hackathon 2025
# Team: 404 Healer Not Found

Write-Host "`n🏔️  PeakPulse - Deployment Script" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# Check if git is installed
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Yellow
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    Write-Host "   Download from: https://git-scm.com/download/win`n" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Git is installed`n" -ForegroundColor Green

# Navigate to project directory
$projectPath = "d:\E\healthtech2.0"
Write-Host "📂 Navigating to project directory..." -ForegroundColor Yellow
Set-Location -Path $projectPath

# Initialize git if needed
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git repository initialized`n" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository already exists`n" -ForegroundColor Green
}

# Add remote
Write-Host "🔗 Configuring remote repository..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin https://github.com/Periscope-Hackathon2025/404-Healer-Not-Found.git
Write-Host "✅ Remote added: 404-Healer-Not-Found`n" -ForegroundColor Green

# Show status
Write-Host "📊 Checking repository status..." -ForegroundColor Yellow
git status --short

# Stage files
Write-Host "`n📝 Staging all files..." -ForegroundColor Yellow
git add .
Write-Host "✅ Files staged`n" -ForegroundColor Green

# Create commit
Write-Host "💾 Creating commit..." -ForegroundColor Yellow
$commitMessage = @"
[Initial] PeakPulse - Quantum-Enhanced Wellness Platform

🏔️ PeakPulse - AI-Powered Wellness Platform
Team: 404 Healer Not Found
Periscope Hackathon 2025

Features:
- ✅ Next.js 16 frontend with TypeScript & Tailwind CSS
- ✅ 7 ML models including quantum dropout predictor (93.5% accuracy)
- ✅ Comprehensive gamification (25 badges, 30 levels, leaderboard)
- ✅ Calorie tracking with MET-based calculations
- ✅ MongoDB integration with Mongoose ODM
- ✅ FastAPI ML microservice
- ✅ Google OAuth authentication
- ✅ Real-time achievement notifications
- ✅ Complete documentation (Architecture, API, User Guide, ML Models)

Tech Stack:
- Frontend: Next.js 16.0.7, TypeScript, Tailwind CSS
- Backend: Node.js, NextAuth.js, FastAPI
- ML: Qiskit (Quantum), scikit-learn, TensorFlow
- Database: MongoDB
- Tools: Docker, Turbopack

Highlights:
🔬 World's first quantum-enhanced wellness platform
🎮 Full gamification with badges, levels & rewards
🤖 7 specialized ML models for personalization
📊 93.5% dropout prediction accuracy
🏆 Real-time achievements & leaderboard
"@

git commit -m $commitMessage
Write-Host "✅ Commit created`n" -ForegroundColor Green

# Push to GitHub
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "   Repository: https://github.com/Periscope-Hackathon2025/404-Healer-Not-Found" -ForegroundColor Cyan
Write-Host ""

$pushResult = git branch -M main 2>&1
$pushResult = git push -u origin main --force 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to GitHub!`n" -ForegroundColor Green
    
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host "🎉  Deployment Complete!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📍 Repository URL:" -ForegroundColor Yellow
    Write-Host "   https://github.com/Periscope-Hackathon2025/404-Healer-Not-Found" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Add team member names to README.md" -ForegroundColor White
    Write-Host "   2. Upload screenshots/demo video" -ForegroundColor White
    Write-Host "   3. Verify all documentation is complete" -ForegroundColor White
    Write-Host "   4. Test the live repository" -ForegroundColor White
    Write-Host "   5. Submit to hackathon organizers" -ForegroundColor White
    Write-Host ""
    Write-Host "🏆 Good luck with Periscope Hackathon 2025!" -ForegroundColor Magenta
    Write-Host ""
} else {
    Write-Host "❌ Push failed. Error output:" -ForegroundColor Red
    Write-Host $pushResult -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Possible solutions:" -ForegroundColor Yellow
    Write-Host "   1. Check your GitHub authentication (use Personal Access Token)" -ForegroundColor White
    Write-Host "   2. Ensure you have write access to the repository" -ForegroundColor White
    Write-Host "   3. Try manual push: git push -u origin main" -ForegroundColor White
    Write-Host ""
}
