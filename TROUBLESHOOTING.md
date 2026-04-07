# Family Hub - Troubleshooting Guide

## Common Issues & Solutions

### 1. Backend Won't Start

#### Error: `JWT_SECRET is not set`
**Problem**: Server exits immediately after startup.

**Solution**:
```bash
cd backend
nano .env

# Add this line:
JWT_SECRET=your-super-long-random-string-minimum-32-characters
```

Then restart:
```bash
npm run dev
```

---

#### Error: `Cannot connect to MongoDB`
**Problem**: Server crashes with "connection failed" error.

**Diagnosis**:
```bash
# Check if MongoDB is running
# Linux/macOS:
ps aux | grep mongod

# Windows:
tasklist | findstr mongod
```

**Solutions**:

**Option A: Start local MongoDB**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongodb

# Windows
# Use Services app or:
net start MongoDB
```

**Option B: Use MongoDB Atlas (Cloud)**
```bash
# 1. Create free account at mongodb.com/cloud/atlas
# 2. Create cluster
# 3. Get connection string (looks like:)
# mongodb+srv://username:password@cluster.mongodb.net/family_hub

# 4. Update backend/.env:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/family_hub
```

---

### 2. Frontend Connection Issues

#### Error: `API request failed` or `CORS error`
**Problem**: Frontend can't connect to backend.

**Check**:
1. Backend is running on localhost:5000
2. Frontend is running on localhost:5173
3. VITE_API_URL is correct

**Solution**:
```bash
# Frontend .env.local
VITE_API_URL=http://localhost:5000/api

# Restart frontend
# Press Ctrl+C in terminal
npm run dev
```

---

#### Error: `401 Unauthorized` on all requests
**Problem**: Auth token invalid or missing.

**Solution**:
1. Clear browser storage:
```javascript
// Open DevTools Console (F12) and run:
localStorage.clear()
sessionStorage.clear()
```

2. Logout and login again:
```bash
# Click "बाहेर पडा" (Logout) button
# Then login with test credentials
```

---

### 3. Port Already in Use

#### Error: `EADDRINUSE: address already in use :::5000`
**Problem**: Another process is using port 5000.

**Solution**:

```bash
# macOS/Linux - Find process:
lsof -i :5000
# Kill it:
kill -9 <PID>

# Windows - Find process:
netstat -ano | findstr :5000
# Kill it:
taskkill /PID <PID> /F

# Or use different port:
PORT=5001 npm run dev
```

---

### 4. Login Issues

#### Error: `Invalid credentials` even with correct password
**Problem**: User doesn't exist or password is wrong.

**Verify**:
1. Test credentials are in your system
2. MongoDB has data

**Seed test data**:
```bash
cd backend
npm run seed:all
cd ..
```

Then create users via Admin Dashboard or use the deployment guide:
- See [DEPLOYMENT_CREDENTIALS.md](./DEPLOYMENT_CREDENTIALS.md) for setting up real accounts
- Demo accounts have been removed from this version

---

#### Error: `Invalid role for this user`
**Problem**: Login specifies role that doesn't match user record.

**Solution**: 
- Ensure selected role matches user type
- Or create new user with correct role

---

### 5. Database Issues

#### Error: `duplicate key error`
**Problem**: Trying to create user with existing email.

**Solution**:
After model schema changes, you may need to reset the index:

```bash
# Connect to MongoDB
mongosh

# Run these commands:
use family_hub
db.users.dropIndex("email_1")
db.users.createIndex({"email": 1, "role": 1}, {unique: true})
exit
```

---

#### No data showing up
**Problem**: Database is empty.

**Solution**:
```bash
cd backend
npm run seed:all  # Takes ~10 seconds
cd ..
```

Then refresh frontend.

---

### 6. Frontend Display Issues

#### Marathi text showing as boxes or gibberish
**Problem**: Character encoding issue.

**Solution**:
1. Check browser supports UTF-8 (most modern browsers do)
2. Clear browser cache: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
3. Hard refresh: Ctrl+F5

---

#### Styles not loading (unstyled page)
**Problem**: Tailwind CSS not compiling.

**Solution**:
```bash
# Frontend directory
npm run dev

# Let Vite rebuild (takes 10-20 seconds)
# If still broken:
rm -rf node_modules
npm install
npm run dev
```

---

### 7. API Response Issues

#### Error: `Cannot read property 'student' of undefined`
**Problem**: API response format mismatch.

**Check**: Backend API is returning correct format:
```json
{
  "student": {
    "id": "...",
    "name": "..."
  }
}
```

Not:
```json
{
  "id": "...",
  "name": "..."
}
```

---

#### 404 errors on API calls
**Problem**: Endpoint doesn't exist.

**Check**:
1. Backend is running
2. Endpoint URL is correct
3. Path matches exactly (case-sensitive on Linux)

**Available endpoints**: See [API.md](../API.md)

---

### 8. Authentication Middleware

#### Error: `No token provided`
**Problem**: Request didn't include JWT token.

**Solution**: Ensure API call includes auth header:
```javascript
// This is automatic if using apiCall():
import { apiCall } from '@/lib/api';
const data = await apiCall('/endpoint');  // ✅ Includes token automatically
```

Not raw fetch:
```javascript
// ❌ Don't do this - manually include token:
const token = localStorage.getItem('auth_token');
const res = await fetch('/api/endpoint', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

### 9. Environment Variable Issues

#### Warning: `.env not loaded`
**Problem**: Backend not reading .env file.

**Check**:
```bash
cd backend
ls -la | grep .env

# Should show: .env (and .env.example)
```

If missing:
```bash
cp .env.example .env
nano .env  # Add your values
```

---

#### Frontend can't read `VITE_API_URL`
**Problem**: Frontend env vars not available.

**Rule**: Frontend env vars must start with `VITE_`

**Correct**:
```bash
# .env.local
VITE_API_URL=http://localhost:5000/api
```

**Wrong**:
```bash
API_URL=http://localhost:5000/api  # ❌ Won't work!
```

---

### 10. TypeScript / ESLint Errors

#### Warning: unused variable / unused parameter
**Problem**: Code style issues.

**Solution**:
```bash
# Fix automatically:
npm run lint -- --fix

# Or manually remove unused code
```

---

#### Error: Type 'string' not assignable to type
**Problem**: TypeScript type mismatch.

**Check**: Backend and frontend types match
- User roles: teacher, parent, student, admin
- Response formats are consistent

---

## Performance Issues

### Slow API responses

**Check**:
1. MongoDB is running locally (not over network)
2. Indexes exist on frequently queried fields
3. Database isn't too large (>1GB?)

**Add indexes**:
```bash
# Backend - indexes are auto-created from schema
# If not working, reset:
npm run dev  # Will create them on startup
```

---

### Slow frontend loads

**Check**:
```bash
# Clear cache
rm -rf node_modules/.vite

# Rebuild
npm run dev

# Or full rebuild
rm -rf dist
npm run build
```

---

## Debug Mode

### Enable verbose logging

**Backend**:
```bash
# Add to backend/.env:
DEBUG=*
npm run dev
```

**Frontend** - Open DevTools (F12):
```javascript
// In console:
localStorage.debug = '*'
location.reload()
```

---

## Getting Help

If these don't solve your issue:

1. **Check logs**: Look at error messages carefully
2. **Review docs**: 
   - [API.md](../API.md) - endpoint reference
   - [ARCHITECTURE.md](../ARCHITECTURE.md) - system design
3. **Test core features**:
   - Can you login?
   - Can you reach backend?
   - Is database populated?

---

## Still Stuck?

Create an issue on GitHub with:
- Error message (full stacktrace)
- Steps to reproduce
- Your environment (Node version, OS, MongoDB version)
- What you've already tried

