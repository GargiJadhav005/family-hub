# Family Hub - Deployment Guide

## Pre-Deployment Checklist

Before deploying to production, verify all these items:

### Security
- [ ] JWT_SECRET is strong (>32 random characters, NOT the default)
- [ ] MONGODB_URI points to production database (MongoDB Atlas recommended)
- [ ] Environment is set to `NODE_ENV=production`
- [ ] CORS origins are restricted to your domain only
- [ ] HTTPS is enabled (required for JWT cookies)
- [ ] Secrets are NOT in version control (.env excluded)
- [ ] Dependencies are up to date & no vulnerabilities

### Testing
- [ ] All 4 roles can login correctly
- [ ] Teachers can enroll students
- [ ] Attendance marking works
- [ ] Homework creation & submission work
- [ ] Scores & quizzes function correctly
- [ ] Logout works & clears tokens
- [ ] API errors are handled gracefully
- [ ] Database backup/restore tested

### Performance
- [ ] Database indexes are created
- [ ] API response times < 200ms
- [ ] Frontend bundle size reasonable
- [ ] No console errors in production build

### Operations
- [ ] Logging system configured
- [ ] Error tracking (e.g., Sentry) setup
- [ ] Monitoring alerts configured
- [ ] Backup strategy documented
- [ ] Disaster recovery plan ready

---

## Deployment Steps

### 1. Prepare Backend

```bash
cd backend

# Build TypeScript
npm run build

# Test production compile
npm run typecheck

# Verify build output
ls -la dist/
```

### 2. Prepare Frontend

```bash
# Build React app
npm run build

# Test production build locally
npm run preview

# Verify bundle
ls -la dist/
```

### 3. Setup Production MongoDB

**MongoDB Atlas (Recommended)**:

1. Create Atlas account
2. Create production cluster
3. Create dedicated database user (not admin)
4. Configure network access (IP whitelist)
5. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/family_hub`

**Self-Hosted MongoDB**:

1. Install MongoDB on server
2. Enable authentication
3. Create production database user
4. Setup replication for high availability
5. Configure backup (daily snapshots)

### 4. Environment Setup

**Production backend/.env**:

```bash
JWT_SECRET=<use-strong-random-key>         # 32+ random characters
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/family_hub
MONGODB_DB_NAME=family_hub
NODE_ENV=production
PORT=5000                                   # Or your server port
FRONTEND_URL=https://your-domain.com        # Production domain
JWT_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=school-admin@gmail.com
SMTP_PASSWORD=<app-specific-password>      # Use app password, not account password
SMTP_FROM=noreply@school.edu
```

**Production frontend/.env.production**:

```bash
VITE_API_URL=https://your-domain.com/api
```

### 5. Deploy Backend

**Option A: Heroku**

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create family-hub-server

# Set environment variables
heroku config:set JWT_SECRET=<your-secret>
heroku config:set MONGODB_URI=<your-uri>
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-domain.com

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

**Option B: AWS EC2 / DigitalOcean**

```bash
# SSH into server
ssh -i key.pem ubuntu@your-server.com

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo
git clone <your-repo>
cd family-hub/backend

# Install & build
npm ci  # Use ci instead of install
npm run build

# Setup PM2 for process management
sudo npm install -g pm2
pm2 start dist/server.js --name "family-hub-api"
pm2 save              # Save config
pm2 startup ubuntu    # Auto-start on reboot
```

**Option C: Docker**

```bash
# Create backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/server.js"]
```

```bash
# Build & run
docker build -t family-hub-backend .
docker run -p 5000:5000 \
  -e JWT_SECRET=xxx \
  -e MONGODB_URI=xxx \
  family-hub-backend
```

### 6. Deploy Frontend

**Option A: Vercel (Recommended for React)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Follow prompts, set VITE_API_URL
```

**Option B: Netlify**

```bash
# Connect GitHub repo at netlify.com
# Set build command: npm run build
# Set publish directory: dist
# Set env var: VITE_API_URL=https://api.your-domain.com
```

**Option C: Traditional Web Server (Nginx)**

```bash
# Build
npm run build

# Copy dist to server
scp -r dist/* user@server:/var/www/family-hub

# Configure Nginx
sudo nano /etc/nginx/sites-available/default

# Add:
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/family-hub;
    index index.html;
    
    # React Router fallback
    location / {
        try_files $uri /index.html;
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000/api/;
    }
}

# Enable & restart
sudo systemctl reload nginx
```

### 7. Website SSL/HTTPS

```bash
# Using Let's Encrypt (free)
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d your-domain.com

# Configure auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### 8. Verify Deployment

```bash
# Test API
curl https://api.your-domain.com/api/health
# Should return: {"status":"ok","timestamp":"..."}

# Test frontend
# Open https://your-domain.com in browser
# Try login flow

# Check logs
# Backend logs
pm2 logs family-hub-api

# Frontend errors (browser console: F12)
```

---

## Post-Deployment

### 1. Initial Data Setup

```bash
# SSH to server
ssh -i key.pem ubuntu@your-server.com

# Connect to backend
pm2 connect  # or relevant process

# Seed initial admin user
cd /path/to/family-hub/backend
npm run seed:admin

# Create via admin panel if needed
```

### 2. Monitoring Setup

**PM2 Monitoring**:
```bash
# Setup free tier
pm2 link <secret> <public-key>

# Get dashboardat app.pm2.io
```

**Error Tracking (Sentry)**:
```bash
# Install
npm install @sentry/node

# Setup in backend/server.ts
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

**Logging (Winston)**:
```javascript
// Optional: Add structured logging
import winston from 'winston';
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 3. Database Backups

```bash
# MongoDB Atlas: Automatic daily backups included

# Self-hosted:
mongodump --uri="mongodb://user:pass@host:27017/family_hub" \
  --out=/backups/family-hub-$(date +%Y%m%d)

# Schedule with cron:
0 2 * * * mongodump --uri="..." --out=/backups/$( date +\%Y\%m\%d )
```

### 4. Maintenance Windows

Schedule regular maintenance:
- Database index optimization (monthly)
- Security patches (as available)
- Dependency updates (quarterly)
- Full backup verification (monthly)

---

## Scaling Considerations

### When to Scale Up

- **Database**: >1M records or >500 concurrent users
- **API**: >100 requests/second or >50% CPU usage
- **Frontend**: >100MB bundle size

### Scaling Strategies

**Database**:
- MongoDB Atlas auto-scaling (M10+)
- Read replicas for reporting
- Archive old records to separate collection

**API**:
- Load balancer (Nginx, HAProxy)
- Multiple backend instances
- API caching layer (Redis)

**Frontend**:
- CDN for static content (Cloudflare, Netlify)
- Lazy loading components
- Code splitting

---

## Rollback Procedure

If deployment fails:

```bash
# Revert code
git revert <commit-hash>
git push

# Redeploy
# Heroku: git push heroku main
# PM2: pm2 restart all
# Docker: docker pull & run new image

# Restore database backup if needed
mongorestore --uri="..." /path/to/backup
```

---

## Disaster Recovery

**Recovery Time: <1 hour**
**Recovery Point: <1 day**

1. Database: Automatic daily backups via MongoDB Atlas
2. Code: All code in GitHub
3. Configuration: Stored in environment variables (not in repo)
4. User Uploads: Store in cloud (S3, Azure Blob)

---

## Performance Optimization

### Backend
- Enable gzip compression
- Add Redis for caching
- Implement query optimization
- Use pagination for large datasets

### Frontend
- Enable code splitting
- Use service workers for PWA
- Compress images
- Lazy load routes

### Database
- Create indexes on frequently queried fields
- Archive old records periodically
- Monitor slow queries

---

## Security Hardening

- [ ] Rate limiting on login endpoints
- [ ] CSRF protection
- [ ] SQL/NoSQL injection prevention (Mongoose does this)
- [ ] XSS protection (React + CSP headers)
- [ ] CORS properly configured
- [ ] HTTPS enforced
- [ ] Security headers (HSTS, X-Frame-Options, etc.)
- [ ] Regular security audits

---

## Support & Monitoring URLs

After deployment, monitor at:

- **Frontend**: https://your-domain.com
- **Backend API**: https://your-domain.com/api/health
- **Logs**: pm2 logs / CloudWatch / Sentry
- **Metrics**: PM2 Plus / New Relic / DataDog

