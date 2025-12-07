# 🚀 Deployment Checklist

## Pre-Deployment

### ✅ Code Quality
- [ ] All TypeScript errors resolved
- [ ] No console errors in browser
- [ ] All API endpoints tested
- [ ] ML models trained and saved
- [ ] Environment variables documented

### ✅ Configuration
- [ ] `.env.local` configured with production values
- [ ] MongoDB connection string updated
- [ ] Google OAuth credentials verified
- [ ] Groq API key active
- [ ] NextAuth secret generated
- [ ] CORS settings configured

### ✅ Database
- [ ] MongoDB Atlas cluster created (if using cloud)
- [ ] Database indexes created
- [ ] Sample data loaded (optional)
- [ ] Backup strategy defined
- [ ] Connection string tested

### ✅ API Keys
- [ ] Google Client ID/Secret (OAuth)
- [ ] Groq API Key (Chatbot)
- [ ] MongoDB URI (Database)
- [ ] NextAuth Secret (Authentication)
- [ ] ML Service URL (Backend)

### ✅ Testing
- [ ] Local Docker build successful
- [ ] All pages load correctly
- [ ] Authentication flow works
- [ ] ML predictions return data
- [ ] Google Fit sync tested (if ready)
- [ ] Chatbot responds correctly
- [ ] Mobile responsive design verified

---

## Docker Deployment

### 1. Build Docker Images
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build frontend
docker-compose build ml-service
```

### 2. Environment Variables
```bash
# Copy template
cp .env.docker .env

# Edit with production values
nano .env
```

### 3. Start Services
```bash
# Start all containers
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 4. Health Checks
- [ ] Frontend: http://localhost:3000
- [ ] ML Service: http://localhost:8000/docs
- [ ] MongoDB: Connection successful
- [ ] All services running

---

## VPS Deployment

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y nginx docker.io docker-compose git

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. Clone Repository
```bash
cd /var/www
git clone https://github.com/Periscope-Hackathon2025/404-Healer-Not-Found.git peakpulse
cd peakpulse
```

### 3. Configure Environment
```bash
# Copy and edit .env
cp .env.docker .env
nano .env

# Update values:
# - MONGODB_URI (Atlas or local)
# - NEXTAUTH_URL (your domain)
# - GOOGLE_CLIENT_ID/SECRET
# - GROQ_API_KEY
```

### 4. Build and Deploy
```bash
# Make deploy script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### 5. Nginx Configuration
```bash
# Edit nginx config
sudo nano /etc/nginx/sites-available/default
```

Add:
```nginx
# PeakPulse at /health path
location /health {
    rewrite ^/health(.*)$ $1 break;
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

# ML Service
location /api/ml/ {
    proxy_pass http://localhost:8000/;
}
```

Reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL Certificate (Optional but Recommended)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Post-Deployment

### ✅ Verification
- [ ] Website loads at production URL
- [ ] SSL certificate valid (if configured)
- [ ] Authentication works
- [ ] Can create account and login
- [ ] Dashboard displays data
- [ ] ML predictions load
- [ ] Chatbot responds
- [ ] Activities can be logged
- [ ] Challenges can be joined
- [ ] Social features work
- [ ] Mobile view functional

### ✅ Monitoring
- [ ] Setup error logging (Sentry/etc)
- [ ] Configure uptime monitoring
- [ ] Database backup scheduled
- [ ] API rate limiting configured
- [ ] Analytics integrated (GA/etc)

### ✅ Performance
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] ML predictions < 2 seconds
- [ ] Chatbot response < 3 seconds
- [ ] Images optimized
- [ ] Caching configured

### ✅ Security
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] API keys not exposed
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] SQL injection prevention
- [ ] XSS protection enabled

---

## Troubleshooting

### Docker Issues
```bash
# View logs
docker-compose logs -f [service-name]

# Restart service
docker-compose restart [service-name]

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Issues
- Check MongoDB URI format
- Verify MongoDB is running
- Check firewall rules
- Test connection with mongosh

### ML Service Not Responding
- Check if models are loaded
- Verify port 8000 is accessible
- Check Python dependencies
- Review ML service logs

### Frontend Build Errors
- Clear .next folder: `rm -rf .next`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node -v` (should be 18+)
- Build locally first: `npm run build`

---

## Maintenance

### Regular Tasks
- [ ] **Daily**: Check error logs
- [ ] **Weekly**: Review performance metrics
- [ ] **Monthly**: Update dependencies
- [ ] **Quarterly**: Security audit
- [ ] **As needed**: Backup database

### Updates
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose build
docker-compose up -d

# Or use deploy script
./deploy.sh
```

### Backup
```bash
# Backup MongoDB
mongodump --uri="mongodb://..." --out=/backup/$(date +%Y%m%d)

# Backup code
tar -czf /backup/peakpulse-$(date +%Y%m%d).tar.gz /var/www/peakpulse
```

---

## Rollback Plan

### If Deployment Fails
1. Check logs: `docker-compose logs`
2. Identify failing service
3. Rollback to previous version:
```bash
git reset --hard HEAD~1
docker-compose down
docker-compose build
docker-compose up -d
```

### Database Rollback
```bash
# Restore from backup
mongorestore --uri="mongodb://..." /backup/20251207
```

---

## Production URLs

### Update these after deployment
- [ ] Frontend: `https://yourdomain.com/health`
- [ ] ML Service: `https://yourdomain.com/api/ml`
- [ ] API Docs: `https://yourdomain.com/api/ml/docs`
- [ ] MongoDB: `mongodb+srv://cluster.mongodb.net`

---

## Support Contacts

- **Dev Team**: healthtech@example.com
- **Hosting**: Hostinger Support
- **MongoDB**: Atlas Support
- **Emergency**: [Phone number]

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Version**: _______________  
**Status**: ⭕ Not Deployed | 🟡 In Progress | ✅ Deployed
