# Family Hub - Complete Setup Guide

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+ and npm (or use `nvm`)
- MongoDB 4.0+ (local or cloud instance like MongoDB Atlas)
- Git

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd family-hub

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Configure Environment

**Backend Setup**:
```bash
cd backend

# Copy template to .env
cp .env.example .env

# Edit .env with your values
# REQUIRED: Set JWT_SECRET (use a strong random string, min 32 characters)
# REQUIRED: Set MONGODB_URI (local or MongoDB Atlas connection string)
nano .env  # or use your preferred editor

cd ..
```

**Example backend/.env**:
```
JWT_SECRET=your-super-secret-key-change-this-in-production-min-32-chars
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=family_hub
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_EXPIRES_IN=7d
```

**Frontend Setup**:
```bash
# Copy template
cp .env.example .env.local

# Optional: Edit .env.local if using custom API URL
# Default: http://localhost:5000/api
```

### 3: Start Development Servers

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
# ✅ Server running on http://localhost:5000
```

**Terminal 2 - Frontend**:
```bash
npm run dev
# ✅ App running on http://localhost:5173
```

### 4: Login & Explore

Visit `http://localhost:5173` with test credentials:

| Role | Email | Password |
|------|-------|----------|
| Teacher | teacher@school.edu | teacher123 |
| Parent | parent@school.edu | parent123 |
| Student | student@school.edu | student123 |
| Admin | admin@school.edu | admin123 |

**Expected output:**
```
? Connected to MongoDB
? Server running at http://localhost:5000
? CORS enabled for http://localhost:5173
```

If you see errors about MongoDB, check that:
- MONGODB_URI in backend/.env is correct
- Your MongoDB cluster allows connections from your IP
- Your internet connection is working

### Step 2: In another terminal, start the Frontend

```powershell
npm run dev
```

**Expected output:**
```
VITE v7.3.1 ready in 123 ms
?  Local:   http://localhost:5173/
```

### Step 3: Open the Application

- Open browser and go to: **http://localhost:5173**
- Click "Login"
- Try these test credentials OR enroll a new student

---

## ?? Testing the API

### Test Data / Creating Your First User

To create test users, you can either:

**Option A: Enroll a new student (as teacher)**
1. Need to create a teacher account first
2. You may need to use MongoDB directly to create initial admin teacher

**Option B: Direct to MongoDB** (If you have MongoDB client)
```javascript
// Create a teacher user
db.users.insertOne({
  name: "John Teacher",
  email: "teacher@school.edu",
  passwordHash: "$2a$10$...", // bcrypt hash of "Pass1234"
  role: "teacher",
  avatar: null,
  meta: new Map(),
  createdAt: new Date()
})
```

### Test with curl (Backend endpoint examples)

```bash
# Test health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@school.edu",
    "password": "Pass1234",
    "role": "teacher"
  }'

# Get current user (replace TOKEN with actual token)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/students
```

---

## ?? Directory Structure

**Backend** (MVC Pattern):
```
backend/
+-- src/
�   +-- models/         (6 files) - Database schemas
�   +-- controllers/    (6 files) - Business logic
�   +-- routes/         (6 files) - HTTP endpoints
�   +-- middleware/     (1 file)  - Auth middleware
�   +-- utils/          (2 files) - DB & auth helpers
�   +-- server.ts       - Main Express app
+-- .env                - MongoDB and JWT config
+-- tsconfig.json       - TypeScript config
+-- package.json        - Dependencies
```

**Frontend** (React):
```
src/
+-- pages/              - Page components
+-- components/         - Reusable UI components
+-- contexts/           - AuthContext
+-- hooks/              - Custom React hooks
+-- lib/                - api.ts (API utility)
+-- App.tsx             - Main component with routes
```

---

## ?? Key Features

### Authentication
- JWT-based authentication
- Role-based access control (teacher/parent/student)
- Secure password hashing with bcryptjs
- Auto-restore session on page reload

### API Endpoints

**Auth**
- POST /api/auth/login
- GET /api/auth/me

**Students**
- GET /api/students
- GET /api/students/:id

**Teacher**
- POST /api/teacher/enroll

**Homework**
- GET /api/homework
- POST /api/homework
- PATCH /api/homework/:id/status

**Attendance**
- GET /api/attendance
- POST /api/attendance

**Scores**
- GET /api/scores
- POST /api/scores

---

## ?? Troubleshooting

### "Cannot find module" errors
```bash
# Reinstall dependencies
cd backend
rm -r node_modules
npm install
```

### MongoDB connection errors
- Check MONGODB_URI in backend/.env
- Verify MongoDB cluster whitelist IP
- Try testing in MongoDB Compass or mongosh

### CORS errors
- Backend already has CORS enabled for localhost:5173
- If deploying, update FRONTEND_URL in backend/.env

### Port already in use
```bash
# Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# For port 5173
netstat -ano | findstr :5173
```

### TypeScript errors in backend
```bash
npm run typecheck  # Check for TypeScript errors
```

---

## ?? Example: Add New Feature

To add a new entity (e.g., Exam):

1. **Create Model** ? `backend/src/models/Exam.ts`
2. **Create Controller** ? `backend/src/controllers/examController.ts`
3. **Create Routes** ? `backend/src/routes/examRoutes.ts`
4. **Register in server.ts** ? `app.use("/api/exams", examRoutes)`
5. **Add Frontend page** ? `src/pages/Exams.tsx`
6. **Call API** ? `apiCall("/exams")` from frontend

---

## ?? Environment Variables

**Backend (.env)**
```
MONGODB_URI=mongodb+srv://user:pass@cluster.net/?appName=Cluster0
MONGODB_DB_NAME=family_hub
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env.frontend)**
```
VITE_API_URL=http://localhost:5000/api
```

---

## ?? Data Flow Diagram

```
User Browser
    ?
[http://localhost:5173] Frontend (React/Vite)
    ? HTTP + JWT token
[http://localhost:5000] Backend (Express)
    ?
Middleware (Auth)
    ?
Controller (Business Logic)
    ?
Model (Mongoose)
    ?
MongoDB (Cluster)
```

---

## ? Next Steps

1. ? Verify backend starts: `npm run dev` in backend/
2. ? Verify frontend starts: `npm run dev` in root
3. ? Test login page
4. ? Test enrollment (teacher can create students)
5. ? Test homework, attendance, scores features
6. ? Add more test data as needed
7. ?? Deploy to production when ready

---

## ?? Support

- Check ARCHITECTURE.md for detailed info
- Backend logs show API calls
- Frontend console (F12) shows fetch errors
- Check MongoDB logs if data issues
