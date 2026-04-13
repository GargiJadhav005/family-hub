# Complete Testing Guide - Username-Based Authentication

## Quick Test (5 minutes)

### Step 1: Create Test Accounts
```bash
cd backend
npm run seed
```

**Expected Output:**
```
✅ All accounts ready!

Login Credentials:
─────────────────────────────────
ADMIN
  Username: admin
  Password: Admin@123

TEACHER
  Username: teacher.john
  Password: Teacher@123

STUDENT
  Username: student.jane
  Password: Student@123

PARENT
  Username: parent.mak
  Password: Parent@123
```

### Step 2: Start Backend
```bash
npm start
```

**Expected Output:**
```
✓ Connected to MongoDB
🔧 Creating Express server...
❌ 📍 Server running on port 9000
```

### Step 3: Test Login (in new terminal)
```bash
# Test Admin Login
curl -X POST http://localhost:9000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'
```

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "name": "Gargi Jadhav (Admin)",
    "username": "admin",
    "email": "admin@family-hub.local",
    "role": "admin",
    "avatar": null,
    "meta": {}
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

✅ **Test Complete!** If you see the token and user data, authentication works.

---

## Detailed Testing (15 minutes)

### Test 1: Create Admin Account Only
```bash
cd backend
npm run seed:admin
```

**Check for:**
- ✅ "Admin user created successfully!"
- ✅ Username: admin
- ✅ Password: Admin@123

### Test 2: Create All Test Accounts
```bash
npm run seed
```

**Check for:**
- ✅ "All accounts ready!"
- ✅ 4 accounts created (admin, teacher, student, parent)
- ✅ Each has unique username

### Test 3: Create Real School Data
```bash
npm run seed:real
```

**Check for:**
- ✅ Teacher account created
- ✅ 20 students created
- ✅ All have generated usernames

### Test 4: Start Backend
```bash
npm start
```

**Look for:**
```
✓ Connected to MongoDB
✓ Mongoose Models: User, Student, Homework...
🔧 Creating Express server...
📌 Server instance created
✅ Server running on port 9000
```

No errors? → **✅ Backend is healthy**

### Test 5: Test Each Role's Login

**Admin:**
```bash
curl -X POST http://localhost:9000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'
```

**Teacher:**
```bash
curl -X POST http://localhost:9000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher.john","password":"Teacher@123"}'
```

**Student:**
```bash
curl -X POST http://localhost:9000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student.jane","password":"Student@123"}'
```

**Parent:**
```bash
curl -X POST http://localhost:9000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"parent.mak","password":"Parent@123"}'
```

**All 4 should return:** `{ "user": {...}, "token": "..." }`

### Test 6: Negative Tests (Error Handling)

**Wrong Username:**
```bash
curl -X POST http://localhost:9000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"nonexistent","password":"Admin@123"}'
```

**Expected:** `{"error":"Invalid credentials"}`

**Wrong Password:**
```bash
curl -X POST http://localhost:9000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"WrongPassword"}'
```

**Expected:** `{"error":"Invalid credentials"}`

**Missing Username:**
```bash
curl -X POST http://localhost:9000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"Admin@123"}'
```

**Expected:** `{"error":"Username and password are required"}`

**Missing Password:**
```bash
curl -X POST http://localhost:9000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin"}'
```

**Expected:** `{"error":"Username and password are required"}`

### Test 7: Health Check
```bash
curl http://localhost:9000/api/health
```

**Expected:** `{"status":"ok","timestamp":"..."}`

---

## Windows PowerShell Testing

If on Windows and curl is not available:

### Test Login with PowerShell
```powershell
$body = @{'username'='admin';'password'='Admin@123'} | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:9000/api/auth/login" `
  -Method Post -ContentType "application/json" -Body $body
$response.Content | ConvertFrom-Json | ConvertTo-Json
```

### Test All 4 Roles
```powershell
# Admin
$creds = @{'username'='admin';'password'='Admin@123'}
$response = Invoke-WebRequest -Uri "http://localhost:9000/api/auth/login" `
  -Method Post -ContentType "application/json" `
  -Body ($creds | ConvertTo-Json)
Write-Host "✅ Admin Login:" ($response.Content | ConvertFrom-Json).user.username

# Teacher
$creds = @{'username'='teacher.john';'password'='Teacher@123'}
$response = Invoke-WebRequest -Uri "http://localhost:9000/api/auth/login" `
  -Method Post -ContentType "application/json" `
  -Body ($creds | ConvertTo-Json)
Write-Host "✅ Teacher Login:" ($response.Content | ConvertFrom-Json).user.username

# Student
$creds = @{'username'='student.jane';'password'='Student@123'}
$response = Invoke-WebRequest -Uri "http://localhost:9000/api/auth/login" `
  -Method Post -ContentType "application/json" `
  -Body ($creds | ConvertTo-Json)
Write-Host "✅ Student Login:" ($response.Content | ConvertFrom-Json).user.username

# Parent
$creds = @{'username'='parent.mak';'password'='Parent@123'}
$response = Invoke-WebRequest -Uri "http://localhost:9000/api/auth/login" `
  -Method Post -ContentType "application/json" `
  -Body ($creds | ConvertTo-Json)
Write-Host "✅ Parent Login:" ($response.Content | ConvertFrom-Json).user.username
```

---

## Using Postman

### Create Collection: "Family Hub Auth"

#### Request 1: Login Admin
- **Method:** POST
- **URL:** `http://localhost:9000/api/auth/login`
- **Headers:** 
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "username": "admin",
    "password": "Admin@123"
  }
  ```

#### Request 2: Login Teacher
- **Method:** POST
- **URL:** `http://localhost:9000/api/auth/login`
- **Body:**
  ```json
  {
    "username": "teacher.john",
    "password": "Teacher@123"
  }
  ```

#### Request 3: Login Student
- **Method:** POST
- **URL:** `http://localhost:9000/api/auth/login`
- **Body:**
  ```json
  {
    "username": "student.jane",
    "password": "Student@123"
  }
  ```

#### Request 4: Health Check
- **Method:** GET
- **URL:** `http://localhost:9000/api/health`

#### Request 5: Get Profile (Requires Auth)
- **Method:** GET
- **URL:** `http://localhost:9000/api/auth/me`
- **Headers:**
  ```
  Authorization: Bearer <TOKEN_FROM_LOGIN>
  ```

---

## Complete Test Checklist

### Setup
- [ ] MongoDB is running and connected
- [ ] `.env` file is configured in backend folder
- [ ] `npm install` completed in backend directory

### Seed Scripts
- [ ] `npm run seed:admin` works and creates admin account
- [ ] `npm run seed` works and creates all 4 test accounts
- [ ] `npm run seed:real` works and creates teacher + 20 students
- [ ] No errors or warnings (except Mongoose index warning)

### Backend Server
- [ ] `npm start` starts without errors
- [ ] Server connects to MongoDB
- [ ] Server listens on port 9000
- [ ] Server remains running

### API Tests - Success Cases
- [ ] Login with admin credentials returns token + user
- [ ] Login as teacher returns correct username
- [ ] Login as student returns correct username
- [ ] Login as parent returns correct username
- [ ] Token is JWT format (starts with `eyJ`)
- [ ] User object includes: id, name, username, email, role

### API Tests - Error Cases
- [ ] Wrong username returns "Invalid credentials"
- [ ] Wrong password returns "Invalid credentials"
- [ ] Missing username returns "Username and password are required"
- [ ] Missing password returns "Username and password are required"
- [ ] Health check returns {"status":"ok"}

### Database
- [ ] Admin account exists with username `admin`
- [ ] Teacher account exists with username `teacher.john`
- [ ] Student account exists with username `student.jane`
- [ ] Parent account exists with username `parent.mak`
- [ ] Username field is indexed and unique

---

## Troubleshooting

### Issue: "Cannot find module" errors
```bash
# Solution: Reinstall dependencies
cd backend
rm -rf node_modules
npm install
```

### Issue: "EADDRINUSE: address already in use 0.0.0.0:9000"
```bash
# Solution: Kill existing Node process
# Windows:
taskkill /F /IM node.exe

# Mac/Linux:
pkill -f node
```

### Issue: MongoDB connection fails
- [ ] Check MONGODB_URI in `.env` file
- [ ] Verify MongoDB cluster is running
- [ ] Check IP whitelist in MongoDB Atlas
- [ ] Verify credentials are correct

### Issue: "Invalid input" when sending request
- [ ] Check request has `Content-Type: application/json` header
- [ ] Verify JSON is valid (use JSON validator)
- [ ] Check body has both `username` and `password` fields

### Issue: Duplicate index warning
```
[MONGOOSE] Warning: Duplicate schema index on {"username":1}
```
- This is safe to ignore
- Caused by Mongoose schema caching
- Restart server to clear warning

### Issue: Users already exist from old seed
```bash
# Solution: Clean database and reseed
# Go to MongoDB Atlas → Collections → Drop database
# Then run:
npm run seed
```

---

## Test Results Format

When all tests pass, you should see:

```
✅ Seed Data
  ✓ Admin account created
  ✓ Teacher account created
  ✓ Student account created
  ✓ Parent account created

✅ Backend Server
  ✓ Connected to MongoDB
  ✓ Server running on port 9000
  ✓ All routes registered

✅ Login API Tests
  ✓ Admin login successful (token received)
  ✓ Teacher login successful (token received)
  ✓ Student login successful (token received)
  ✓ Parent login successful (token received)

✅ Error Handling
  ✓ Wrong username returns 401
  ✓ Wrong password returns 401
  ✓ Missing fields returns 400
  ✓ Invalid JSON returns 400

✅ All Tests Passed!
```

---

## Next: Frontend Testing

Once backend is confirmed working:

1. Update login form to use `username` field instead of `email`
2. Update API calls to send `username` instead of `email`
3. Test frontend login with test credentials
4. Verify token is stored in localStorage
5. Verify user data is displayed

See: `FRONTEND_USERNAME_UPDATES.md` for frontend changes needed.

---

**Total Testing Time:** 15-20 minutes  
**Success Criteria:** All 4 roles can login with valid credentials, invalid credentials rejected

Good luck! 🚀
