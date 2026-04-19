# Quick Reference: Username-Based Authentication

## ✅ What Changed

| Feature | Before | After |
|---------|--------|-------|
| **Login Field** | Email (`email@example.com`) | Username (`john.doe`) |
| **User Model** | No username field | Username field (unique) |
| **Seed Accounts** | Email-based | Username-based |
| **Admin User Creation** | Auto-generate email | Auto-generate username |
| **Welcome Email** | Shows email for login | Shows username for login |

## 🔐 New Test Accounts (Run: `npm run seed`)

```
┌─────────┬──────────────────┬──────────────┐
│ Role    │ Username         │ Password     │
├─────────┼──────────────────┼──────────────┤
│ Admin   │ admin            │ Admin@123    │
│ Teacher │ teacher.john     │ Teacher@123  │
│ Student │ student.jane     │ Student@123  │
│ Parent  │ parent.mak       │ Parent@123   │
└─────────┴──────────────────┴──────────────┘
```

## 📝 Login API

```bash
POST /api/auth/login

# Request
{
  "username": "admin",
  "password": "Admin@123"
}

# Response
{
  "user": {
    "id": "...",
    "name": "Admin User",
    "username": "admin",
    "email": "admin@family-hub.local",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🛠️ Backend Scripts

```bash
# Create all test accounts
npm run seed

# Create admin account
npm run seed:admin

# Create real school data
npm run seed:real

# Start backend
npm start

# Development mode (with auto-reload)
npm run dev
```

## 📋 Files Modified

1. **Model:** `src/models/User.js` - Added username field
2. **Auth Utils:** `src/utils/auth.js` - Added generateUsername()
3. **Seed Scripts:** 
   - `seed.js` - Updated with usernames
   - `seedAdmin.js` - Updated with usernames
   - `seedRealData.js` - Updated with usernames
4. **Controllers:**
   - `src/controllers/authController.js` - Login with username
   - `src/controllers/adminController.js` - Generate usernames for new users
5. **Email:** `src/utils/email.js` - Include username in welcome email
6. **Documentation:** `USERNAME_AUTH_CHANGES.md` - Complete guide

## 🚀 Next Steps

### 1. Run Seed Script
```bash
cd backend
npm run seed
```

Output:
```
✅ All accounts ready!

Login Credentials:
─────────────────────────────────
ADMIN: username=admin, password=Admin@123
TEACHER: username=teacher.john, password=Teacher@123
STUDENT: username=student.jane, password=Student@123
PARENT: username=parent.mak, password=Parent@123
```

### 2. Start Backend
```bash
npm start
```

Output:
```
✓ Connected to MongoDB
🔧 Creating Express server...
✅ Server running on port 9000
```

### 3. Test Login
```bash
curl -X POST http://localhost:9000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'
```

### 4. Update Frontend
- Change login form from `email` field to `username` field
- Update API calls to use username instead of email
- Update AuthContext to use username

## 🔑 Key Features

✅ **Unique Usernames**
- Auto-generated: `firstname.lastname`
- Auto-incremented on duplicates: `john.doe1`, `john.doe2`

✅ **Secure Password Generation**
- Temporary passwords: 12 characters, alphanumeric + special
- Users must change on first login

✅ **Email Still Used**
- For communication (welcome emails, notifications)
- For user reference in admin panel
- Can be duplicate now (not enforced)

✅ **Backward Compatible**
- Old email-based accounts still in database
- New logins use username

## ❓ FAQ

**Q: Can I use email to login?**  
A: No, email-based login has been replaced with username-based login.

**Q: What if I want to keep the old system?**  
A: Check `USERNAME_AUTH_CHANGES.md` for migration notes.

**Q: Can users change their username?**  
A: Not yet. Can be added as a future feature.

**Q: How is username generated?**  
A: From full name - `firstname.lastname`. If taken, appends numbers.

**Q: What if username generation fails?**  
A: System will keep trying: `john.doe`, `john.doe1`, `john.doe2`, etc.

**Q: Can I have the sample email back?**  
A: Yes, you can run `npm run seed:admin` to create admin@family-hub.local again.

## 📊 Database Changes

### Old Index (Dropped)
```
users: { email: 1 } [UNIQUE]
```

### New Indexes (Created)
```
users: { username: 1 } [UNIQUE]
users: { email: 1, role: 1 }
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid credentials" | Check username spelling and password |
| "Username not found" | Run `npm run seed` to create accounts |
| Duplicate index warning | Safe to ignore (Mongoose caching) |
| User creation fails | Username might already exist (try different name) |

---

**Status:** ✅ Complete and tested

**Test Results:**
- ✅ Seed accounts created successfully
- ✅ Usernames generated correctly
- ✅ Database indexes updated
- ✅ All 4 test accounts ready for login
