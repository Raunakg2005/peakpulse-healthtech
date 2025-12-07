# 🚀 Vercel + Railway Deployment Guide

## Architecture
- **Frontend**: Vercel (Next.js)
- **ML Service**: Railway (FastAPI)
- **Database**: MongoDB Atlas (free tier)

---

## Step 1: MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com/
2. Create free cluster (M0 Sandbox - 512MB)
3. Create database user
4. Whitelist all IPs: `0.0.0.0/0`
5. Get connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/healthtech?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy ML Service to Railway

### A. Create Railway Account
1. Go to https://railway.app/
2. Sign in with GitHub
3. Click "New Project"

### B. Deploy ML Service
1. Select "Deploy from GitHub repo"
2. Choose: `Periscope-Hackathon2025/404-Healer-Not-Found`
3. Select "ml-service" folder as root directory
4. Railway will auto-detect Python

### C. Configure Environment Variables
Add these in Railway dashboard:
```
PYTHONUNBUFFERED=1
ENV=production
```

### D. Get ML Service URL
- Railway will give you a URL like: `https://your-ml-service.up.railway.app`
- Save this URL for Vercel configuration

---

## Step 3: Deploy Frontend to Vercel

### A. Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

### B. Deploy via GitHub (Recommended)
1. Go to https://vercel.com/
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Import: `Periscope-Hackathon2025/404-Healer-Not-Found`
5. Root Directory: `./` (project root)
6. Framework: Next.js (auto-detected)

### C. Configure Environment Variables in Vercel

Go to Project Settings → Environment Variables:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/healthtech

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-domain.vercel.app

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Fit
GOOGLE_FIT_CLIENT_ID=your-google-fit-client-id.apps.googleusercontent.com
GOOGLE_FIT_CLIENT_SECRET=your-google-fit-client-secret
GOOGLE_FIT_REDIRECT_URI=https://your-domain.vercel.app/api/auth/callback/google-fit

# Groq AI
GROQ_API_KEY=your-groq-api-key

# ML Service (Railway URL)
ML_API_URL=https://your-ml-service.up.railway.app
NEXT_PUBLIC_ML_API_URL=https://your-ml-service.up.railway.app
```

### D. Update Google OAuth Redirect URIs
1. Go to https://console.cloud.google.com/apis/credentials
2. Edit OAuth 2.0 Client ID
3. Add Authorized redirect URIs:
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   https://your-domain.vercel.app/api/auth/callback/google-fit
   ```

---

## Step 4: Deploy

### Vercel (Frontend)
```bash
# Option 1: Via CLI
cd d:\E\healthtech2.0
vercel --prod

# Option 2: Via GitHub (Automatic)
git push origin main
# Vercel auto-deploys on push
```

### Railway (ML Service)
```bash
# Railway auto-deploys on git push
git push origin main
```

---

## Step 5: Verify Deployment

### Check ML Service
Visit: `https://your-ml-service.up.railway.app/docs`
- Should see FastAPI Swagger docs
- Test `/health` endpoint

### Check Frontend
Visit: `https://your-domain.vercel.app`
- Should load homepage
- Test signup/login
- Check dashboard loads
- Verify ML predictions work

---

## Troubleshooting

### Frontend Issues
**"Internal Server Error"**
- Check Vercel logs: Project → Deployments → View Function Logs
- Verify all env variables are set
- Check MongoDB connection string

**"ML predictions not loading"**
- Verify `NEXT_PUBLIC_ML_API_URL` is set correctly
- Check Railway ML service is running
- Test ML API directly: `https://your-ml-service.up.railway.app/docs`

### ML Service Issues
**"Application failed to start"**
- Check Railway logs
- Verify `requirements.txt` is correct
- Reduce model size if memory issues

**"502 Bad Gateway"**
- Railway service crashed
- Check logs for Python errors
- Verify port binding: `--host 0.0.0.0 --port $PORT`

### Database Issues
**"MongoServerSelectionError"**
- Check MongoDB Atlas is running
- Verify IP whitelist includes `0.0.0.0/0`
- Test connection string format
- Check username/password are correct

---

## Post-Deployment Checklist

- [ ] Frontend loads at Vercel URL
- [ ] Can sign up with email/password
- [ ] Can sign in with Google OAuth
- [ ] Dashboard displays user data
- [ ] ML predictions load
- [ ] Chatbot responds
- [ ] Activities can be logged
- [ ] Challenges can be joined
- [ ] Leaderboard displays
- [ ] Mobile responsive works

---

## Costs (Free Tier Limits)

### Vercel
- **Bandwidth**: 100GB/month
- **Serverless Functions**: 100GB-hours
- **Builds**: Unlimited

### Railway
- **Credit**: $5/month free
- **RAM**: 512MB (free tier)
- **Uptime**: ~$5 = ~350 hours/month

### MongoDB Atlas
- **Storage**: 512MB
- **RAM**: Shared
- **Connections**: 100 concurrent

**Total**: FREE for development/demo  
**For production**: ~$20-30/month (paid tiers)

---

## Scaling (Future)

### If you exceed free tiers:
1. **Vercel Pro**: $20/month (better bandwidth)
2. **Railway Pro**: Pay-as-you-go ($0.000463/GB-hour)
3. **MongoDB M10**: $10/month (dedicated cluster)

---

## Monitoring

### Vercel Analytics
- Enable in Project Settings → Analytics
- Track page views, performance

### Railway Metrics
- Dashboard shows CPU, RAM, Network
- Set up alerts for downtime

### Custom Monitoring
- Add Sentry for error tracking
- Use Uptime Robot for availability checks

---

## Custom Domain (Optional)

### Vercel
1. Project Settings → Domains
2. Add your domain
3. Update DNS records

### Railway
1. Service Settings → Networking
2. Add custom domain
3. Point CNAME to Railway

---

## Environment-Specific URLs

**Development (Local)**
- Frontend: http://localhost:3000
- ML Service: http://localhost:8000

**Production (Deployed)**
- Frontend: https://peakpulse.vercel.app (or your domain)
- ML Service: https://peakpulse-ml.up.railway.app

---

## Quick Commands

```bash
# Deploy to Vercel
vercel --prod

# Check Vercel logs
vercel logs

# Railway logs (in dashboard)
# Or use Railway CLI:
railway logs

# Force redeploy
vercel --force
railway up --force
```

---

**Last Updated**: December 7, 2025  
**Status**: Ready for deployment  
**Time to Deploy**: ~15-20 minutes
