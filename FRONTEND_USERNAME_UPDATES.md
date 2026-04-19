# Frontend Updates Required for Username-Based Auth

## Summary

The backend now uses **username** instead of **email** for authentication. You need to update the frontend login form and API calls.

## Changes Needed

### 1. Login Form Component

**Location:** `src/pages/Login.tsx` (or your login component)

**BEFORE:**
```typescript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const data = await login(email, password);
    // ... store token and user
  } catch (error) {
    // ... handle error
  }
};

return (
  <form onSubmit={handleLogin}>
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    <button type="submit">Login</button>
  </form>
);
```

**AFTER:**
```typescript
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const data = await login(username, password);
    // ... store token and user
  } catch (error) {
    // ... handle error
  }
};

return (
  <form onSubmit={handleLogin}>
    <input
      type="text"
      placeholder="Username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      required
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    <button type="submit">Login</button>
  </form>
);
```

### 2. API Service

**Location:** `src/lib/api.ts` (or `src/services/auth.ts`)

**BEFORE:**
```typescript
export async function login(email: string, password: string) {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error('Login failed');
  }
}
```

**AFTER:**
```typescript
export async function login(username: string, password: string) {
  try {
    const response = await apiClient.post('/auth/login', {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error('Login failed');
  }
}
```

### 3. Auth Context

**Location:** `src/contexts/AuthContext.tsx`

**BEFORE:**
```typescript
const login = async (email: string, password: string, role?: string) => {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
      role,
    });
    
    const { user, token } = response.data;
    localStorage.setItem('token', token);
    setUser(user);
    return { user, token };
  } catch (error) {
    throw error;
  }
};
```

**AFTER:**
```typescript
const login = async (username: string, password: string, role?: string) => {
  try {
    const response = await apiClient.post('/auth/login', {
      username,
      password,
      role,
    });
    
    const { user, token } = response.data;
    localStorage.setItem('token', token);
    setUser(user);
    return { user, token };
  } catch (error) {
    throw error;
  }
};
```

### 4. User Display (Optional)

If you display user info, update to show username:

**BEFORE:**
```typescript
// Show user email in navbar
<div className="user-profile">
  <p>Email: {user?.email}</p>
</div>
```

**AFTER:**
```typescript
// Show username in navbar
<div className="user-profile">
  <p>Username: {user?.username}</p>
  <p className="text-sm text-gray-500">{user?.email}</p>
</div>
```

## Test Credentials

After running `npm run seed` in the backend, use these to test:

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `Admin@123` |
| Teacher | `teacher.john` | `Teacher@123` |
| Student | `student.jane` | `Student@123` |
| Parent | `parent.mak` | `Parent@123` |

## Testing Checklist

- [ ] Update login form field label from "Email" to "Username"
- [ ] Update login form input type from `type="email"` to `type="text"`
- [ ] Update login API function to accept `username` parameter
- [ ] Update AuthContext to use `username` instead of `email`
- [ ] Test login with one of the test accounts
- [ ] Verify token is received and stored
- [ ] Verify user information is displayed correctly
- [ ] Test logout
- [ ] Test with different roles (teacher, student, parent)
- [ ] Test with wrong username (should show "Invalid credentials")
- [ ] Test with wrong password (should show "Invalid credentials")

## Example: Complete Login Component

```typescript
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      // Navigation handled by AuthContext or router
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Family Hub Login</h2>
        
        {error && (
          <div className="error-message">{error}</div>
        )}

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="e.g., admin, teacher.john"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <div className="test-credentials">
          <p>Test Credentials:</p>
          <ul>
            <li>Username: admin | Password: Admin@123</li>
            <li>Username: teacher.john | Password: Teacher@123</li>
            <li>Username: student.jane | Password: Student@123</li>
            <li>Username: parent.mak | Password: Parent@123</li>
          </ul>
        </div>
      </form>
    </div>
  );
}
```

## Common Issues

### Issue: Login still sends "email" field
**Solution:** Ensure you updated all login API calls, not just the form state.

### Issue: "Invalid credentials" after frontend update
**Solution:** 
1. Verify backend seed script ran: `npm run seed`
2. Check username spelling (case-insensitive)
3. Test backend directly with curl:
   ```bash
   curl -X POST http://localhost:9000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"Admin@123"}'
   ```

### Issue: User info not showing after login
**Solution:** Check that `user.username` exists in the response. May need to update TypeScript interfaces:

```typescript
// Update user interface
interface User {
  id: string;
  name: string;
  username: string;  // ← Add this
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  avatar?: string;
  meta?: Record<string, any>;
}
```

## TypeScript Interfaces to Update

```typescript
// src/types/auth.ts or similar

export interface LoginRequest {
  username: string;      // Changed from email
  password: string;
  role?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface User {
  id: string;
  name: string;
  username: string;      // New field
  email: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  avatar?: string | null;
  meta?: Record<string, string>;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string, role?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}
```

## Deployment Notes

1. **Update before deploying to Vercel:**
   - Update all frontend login forms
   - Update API calls
   - Update TypeScript types
   - Don't forget to commit changes

2. **Backend already updated:**
   - Username generation works
   - Database indexes updated
   - All seed scripts updated

3. **Test thoroughly:**
   - Local login test
   - All user roles (admin, teacher, student, parent)
   - Error cases (wrong username, wrong password)

---

**Status:** ✅ Backend complete | ⏳ Frontend awaiting your updates

**Questions?** See `USERNAME_AUTH_CHANGES.md` for complete documentation.
