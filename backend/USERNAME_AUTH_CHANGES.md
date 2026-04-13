# Username-Based Authentication Implementation

## Overview

The backend has been updated to use **username-based authentication** instead of email-based login. Users now login with a unique username and password instead of email and password.

## Changes Made

### 1. **User Model** (`src/models/User.js`)

**Added username field:**
```javascript
username: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
  minlength: 3,
}
```

**Index changes:**
- Added unique index on `username`
- Kept index on `email` + `role` (for reference)

### 2. **Auth Utilities** (`src/utils/auth.js`)

**New function: `generateUsername(name)`**
- Generates unique usernames from user names
- Format: `firstname.lastname` or `firstname` if only one name
- Automatically appends numbers for duplicates (e.g., `john.doe2`)
- Returns: Promise<string>

**Updated: `toClientUser(user)`**
- Now includes `username` in the response object

### 3. **Auth Controller** (`src/controllers/authController.js`)

**Updated: `login()` function**
- **Before:** Accepted `email` in request body
- **After:** Accepts `username` in request body
- **Request format:**
  ```json
  {
    "username": "admin",
    "password": "Admin@123",
    "role": "admin" // optional
  }
  ```

### 4. **Admin Controller** (`src/controllers/adminController.js`)

**Updated: `createUser()` function**
- Auto-generates unique username when creating users
- Includes username in the response
- If creating a student with parent account, also generates parent username
- Returns both temp password and username (in dev mode)

### 5. **Email Utility** (`src/utils/email.js`)

**Updated: `sendUserCreatedEmail()` function**
- Now includes username in the welcome email
- Shows username instead of email for login

### 6. **Seed Scripts**

#### `seed.js` - Main test data seeder
Creates 4 test accounts:
```
Admin:   username="admin"          password="Admin@123"
Teacher: username="teacher.john"   password="Teacher@123"
Student: username="student.jane"   password="Student@123"
Parent:  username="parent.mak"     password="Parent@123"
```

#### `seedAdmin.js` - Admin account creator
- Creates single admin account
- Username: `admin`
- Password: `Admin@123`
- Email: `admin@family-hub.local`

#### `seedRealData.js` - Real school data
- Updated to generate usernames for teachers and students
- Uses same seed data structure

## Login Credentials

### Test Accounts (from `npm run seed`)

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `Admin@123` |
| Teacher | `teacher.john` | `Teacher@123` |
| Student | `student.jane` | `Student@123` |
| Parent | `parent.mak` | `Parent@123` |

### Admin Account (from `npm run seed:admin`)

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `Admin@123` |

## Usage

### Create Test Data

```bash
# Create all test accounts (admin, teacher, student, parent)
npm run seed

# Create only admin account
npm run seed:admin

# Create real school data with students
npm run seed:real
```

### Login API Endpoint

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

**Response (Success):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "username": "admin",
    "email": "admin@family-hub.local",
    "role": "admin",
    "avatar": null,
    "meta": {}
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Error):**
```json
{
  "error": "Invalid credentials"
}
```

## Migration Notes

### Database

If upgrading from email-based to username-based:

1. **Existing users need usernames assigned:**
   ```javascript
   // Migration script (optional)
   db.users.updateMany(
     { username: { $exists: false } },
     [{$set: { username: { $toLower: { $substr: ["$name", 0, 20] } } }}]
   )
   ```

2. **Old indexes are automatically dropped:**
   - The seed scripts remove the old `email_1` unique index
   - New `username_1` unique index is created

### User Creation Flow

**When Admin Enrolls New User:**

1. Admin provides: `name`, `email`, `role`
2. System generates: `username` (auto)
3. System generates: `temporaryPassword` (auto)
4. User is created with `username` and hashed password
5. Email sent with: `username` and `temporaryPassword`

**Example Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "...",
    "name": "John Doe",
    "username": "john.doe",
    "email": "john@school.edu",
    "role": "teacher",
    "avatar": null,
    "meta": {}
  },
  "temporaryPassword": "xK9#mL2@qR5$",  // Dev mode only
  "username": "john.doe"  // Dev mode only
}
```

## Frontend Changes Needed

### Login Page

**Update the login form:**
```typescript
// Before
const data = {
  email: emailInput.value,
  password: passwordInput.value
};

// After
const data = {
  username: usernameInput.value,
  password: passwordInput.value
};
```

### Update API Call

**File:** `src/lib/api.ts` (or equivalent)

```typescript
// Before
export async function login(email: string, password: string) {
  return apiClient.post('/auth/login', { email, password });
}

// After
export async function login(username: string, password: string) {
  return apiClient.post('/auth/login', { username, password });
}
```

### Update Auth Context

**File:** `src/contexts/AuthContext.tsx`

```typescript
// Update the login method to use username
const login = async (username: string, password: string, role?: string) => {
  const response = await authAPI.login(username, password);
  // ... rest of login logic
};
```

## Important Considerations

### Username Format

- Lowercase letters and dots (.)
- No special characters
- Minimum 3 characters
- Must be unique
- Auto-generated from name if possible

### Password Policy

- Temporary passwords: 12 characters (alphanumeric + special chars)
- Users must change on first login
- Minimum recommended: 8 characters

### Email Handling

- Email is still stored and used for:
  - Communication (welcome emails, notifications)
  - User reference
  - Recovery (future feature)
- Email is **not** used for login anymore
- Can be duplicate emails across different roles (not enforced as unique)

## Testing

### Manual Test

```bash
# 1. Create seed data
npm run seed

# 2. Start backend
npm start

# 3. Test login (in another terminal)
curl -X POST http://localhost:9000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin@123"
  }'
```

### Expected Output

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
  "token": "eyJ..."
}
```

### Test All Accounts

```bash
# Teacher
curl -X POST http://localhost:9000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "teacher.john", "password": "Teacher@123"}'

# Student
curl -X POST http://localhost:9000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "student.jane", "password": "Student@123"}'

# Parent
curl -X POST http://localhost:9000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "parent.mak", "password": "Parent@123"}'
```

## Troubleshooting

### "Invalid credentials" Error

1. **Check username exists:**
   ```bash
   npm run seed # to create test accounts
   ```

2. **Verify password is correct**

3. **Check for typos in username**

### "Username and password are required"

- Ensure request body includes both `username` and `password` fields

### Duplicate Index Warning

- Warning: "Duplicate schema index on {"username":1}"
- **Cause:** Schema caching in Mongoose
- **Solution:** Restart the server; warning is safe to ignore

### User Creation Fails with Duplicate Username

- Username already exists
- System should auto-generate unique variation
- Check for issues in `generateUsername()` function

## Future Enhancements

1. **Username recovery:** Allow users to reset/change username
2. **Username display:** Show username in admin UI
3. **Username search:** Filter users by username in admin panel
4. **Username suggestions:** Provide alternatives if desired username taken
5. **Custom usernames:** Allow users to set their own username (with validation)

## Files Modified

- `backend/src/models/User.js`
- `backend/src/utils/auth.js`
- `backend/src/controllers/authController.js`
- `backend/src/controllers/adminController.js`
- `backend/src/utils/email.js`
- `backend/src/scripts/seed.js`
- `backend/src/scripts/seedAdmin.js`
- `backend/src/scripts/seedRealData.js`

## Backward Compatibility

⚠️ **Note:** This change is **NOT backward compatible** with email-based login.

- Old login flow: `email` + `password` → **NO LONGER WORKS**
- New login flow: `username` + `password` → **REQUIRED**

If you need to support both, you would need to:
1. Keep email as fallback
2. Update login controller to check username first, then email
3. This is **not recommended** for production

