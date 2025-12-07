# What You Need to Provide for Google Fit Integration

## Quick Checklist

- [ ] Google Cloud Project created
- [ ] Google Fit API enabled
- [ ] OAuth 2.0 credentials created
- [ ] Environment variables added to `.env.local`
- [ ] OAuth consent screen configured
- [ ] Test users added (if using External app type)

## Step-by-Step: What You Need to Do

### 1. Create Google Cloud Project (5 minutes)

1. Go to: https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "PeakPulse" or "404-Healer-Not-Found")
4. Click "Create"
5. **Note down your Project ID**

### 2. Enable Google Fit API (2 minutes)

1. In Google Cloud Console, go to: **APIs & Services** → **Library**
2. Search for: **"Fitness API"**
3. Click on it
4. Click **"Enable"**
5. Wait for it to be enabled

### 3. Configure OAuth Consent Screen (10 minutes)

1. Go to: **APIs & Services** → **OAuth consent screen**
2. Choose User Type:
   - **External** (for testing with any Google account)
   - **Internal** (only if you have Google Workspace)
3. Click **"Create"**

4. Fill in App Information:
   - **App name**: Your app name (e.g., "PeakPulse")
   - **User support email**: Your email
   - **App logo**: (Optional) Upload your app logo
   - **Developer contact information**: Your email

5. Click **"Save and Continue"**

6. Add Scopes (click "Add or Remove Scopes"):
   - Search and add these scopes:
     - `https://www.googleapis.com/auth/fitness.activity.read`
     - `https://www.googleapis.com/auth/fitness.body.read`
     - `https://www.googleapis.com/auth/fitness.heart_rate.read`
     - `https://www.googleapis.com/auth/fitness.sleep.read`
     - `https://www.googleapis.com/auth/fitness.nutrition.read`
     - `https://www.googleapis.com/auth/fitness.location.read`
   
7. Click **"Update"** then **"Save and Continue"**

8. Add Test Users (if External):
   - Click **"Add Users"**
   - Add your Google email address
   - Add any other test users' emails
   - Click **"Add"** then **"Save and Continue"**

9. Review and click **"Back to Dashboard"**

### 4. Create OAuth 2.0 Credentials (5 minutes)

1. Go to: **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Application type: **Web application**
4. Name: "PeakPulse Web Client" (or your app name)

5. Add Authorized JavaScript origins:
   - Click **"Add URI"**
   - Add: `http://localhost:3000`
   - (For production, also add: `https://yourapp.com`)

6. Add Authorized redirect URIs:
   - Click **"Add URI"**
   - Add: `http://localhost:3000/api/auth/callback/google-fit`
   - (For production, also add: `https://yourapp.com/api/auth/callback/google-fit`)

7. Click **"Create"**

8. **IMPORTANT**: Copy these values (you'll need them next):
   - **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
   - **Client Secret** (looks like: `GOCSPX-xxxxx`)

### 5. Add Environment Variables (2 minutes)

1. Open your `.env.local` file (create it if it doesn't exist)
2. Add these lines with YOUR values:

```env
# Google Fit API Configuration
GOOGLE_FIT_CLIENT_ID=paste-your-client-id-here.apps.googleusercontent.com
GOOGLE_FIT_CLIENT_SECRET=paste-your-client-secret-here
GOOGLE_FIT_REDIRECT_URI=http://localhost:3000/api/auth/callback/google-fit
```

3. **IMPORTANT**: Never commit `.env.local` to git!
4. Save the file
5. Restart your development server (`npm run dev`)

### 6. Test the Integration (5 minutes)

1. Start your dev server: `npm run dev`
2. Navigate to your profile page
3. Click "Connect Google Fit" button (you'll need to add this to UI)
4. Sign in with your Google account
5. Grant the requested permissions
6. You should be redirected back to your app
7. Check if `googleFit.isConnected` is true in your user profile

## What the Code Needs (Already Implemented)

✅ Database model updated to store tokens
✅ OAuth flow endpoints created
✅ Token refresh logic implemented
✅ Data fetching utilities created
✅ API routes for connect/disconnect/data
✅ Security measures (tokens not exposed)
✅ Error handling and reauthorization

## Environment Variables Summary

You need to provide these **3 values**:

| Variable | Where to Get It | Example |
|----------|----------------|---------|
| `GOOGLE_FIT_CLIENT_ID` | Google Cloud Console → Credentials | `123456.apps.googleusercontent.com` |
| `GOOGLE_FIT_CLIENT_SECRET` | Google Cloud Console → Credentials | `GOCSPX-abcdef123456` |
| `GOOGLE_FIT_REDIRECT_URI` | Set it yourself | `http://localhost:3000/api/auth/callback/google-fit` |

## For Production Deployment

When deploying to production, update:

1. **OAuth Consent Screen**:
   - Publish your app (remove "Testing" status)
   - Or keep it in testing and add all users

2. **Authorized Origins**:
   - Add your production domain: `https://yourapp.com`

3. **Redirect URIs**:
   - Add production callback: `https://yourapp.com/api/auth/callback/google-fit`

4. **Environment Variables**:
   - Update `GOOGLE_FIT_REDIRECT_URI` in production env
   - Ensure all secrets are secure

## Common Issues

### "Access Blocked: This app's request is invalid"
- **Fix**: Check redirect URI matches exactly in both:
  - Google Cloud Console
  - Your `.env.local` file

### "Error 400: redirect_uri_mismatch"
- **Fix**: Redirect URI must match exactly (including http/https)

### "This app isn't verified"
- **Normal**: During testing, click "Advanced" → "Go to [App Name] (unsafe)"
- **For Production**: Submit app for verification or keep in testing mode

## Need Help?

1. Check `docs/GOOGLE_FIT_SETUP.md` for detailed setup
2. Check `docs/GOOGLE_FIT_IMPLEMENTATION.md` for code examples
3. Google Cloud Console Help: https://cloud.google.com/docs
4. Google Fit API Docs: https://developers.google.com/fit

## Security Reminders

🔒 **Never commit these to git**:
- `.env.local` file
- Client Secret
- Access tokens
- Refresh tokens

✅ **Always**:
- Use `.env.local.example` for templates
- Add `.env.local` to `.gitignore`
- Use HTTPS in production
- Rotate secrets if exposed

## Estimated Time

- **First-time setup**: 20-30 minutes
- **Adding to new environment**: 5 minutes (just copy credentials)
- **Testing**: 5 minutes

## You're Done When...

✅ You can click "Connect Google Fit"
✅ Google OAuth screen appears
✅ You grant permissions
✅ You're redirected back to your app
✅ Database shows `googleFit.isConnected: true`
✅ You can fetch Google Fit data via API

---

**Ready to start?** Follow the steps above and you'll have Google Fit integrated in about 30 minutes! 🚀
