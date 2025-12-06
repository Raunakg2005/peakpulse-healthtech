# Environment Variables Setup

Create a `.env.local` file in the root directory with:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/healthtech

# NextAuth
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
EMAIL_FROM=HealthTech <noreply@healthtech.com>

# ML Service
ML_API_URL=http://localhost:8000
NEXT_PUBLIC_ML_API_URL=http://localhost:8000
```
