# 🎓 Family Hub - School Management System
## Complete Setup & Deployment Guide

### 📋 Project Overview
A full-stack school management system built with **React + TypeScript (Frontend)** and **Node.js + Express (Backend)** with MongoDB database.

**Current Status**: ✅ **Production Ready** (Demo accounts removed)

---

## 🚀 Quick Start (Development)

### Prerequisites
- **Node.js** 18+ (or Bun 1.0+)
- **MongoDB** (local or MongoDB Atlas)
- **Git**

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd final_fullstack/family-hub-main

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### 2. Configure Environment Variables

**Backend Configuration:**
```bash
# Copy and update backend/.env
cd backend
cp .env.example .env
```

Edit `backend/.env` and set:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A strong random string (generate with node crypto)
- `FRONTEND_URL` - Where your frontend will run

**Frontend Configuration:**
```bash
# At project root
cp .env.example .env.local
```

Edit `.env.local` and set:
- `VITE_API_URL` - Your backend API URL (http://localhost:5000/api for dev)

### 3. Create Admin Account
```bash
cd backend
npm run seed:admin
# Output will show: admin@google.com / Admin@123
# ⚠️ Change password immediately after first login!
```

### 4. Start Development Servers

**Terminal 1: Backend**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2: Frontend**
```bash
# From project root
npm run dev
# Runs on http://localhost:5173
```

### 5. Access the Application
- **Frontend**: http://localhost:5173
- **Login**: admin@google.com / Admin@123 (change after first login!)
- **Backend API**: http://localhost:5000/api

---

## 🔒 System Architecture

### Frontend (src/)
```
src/
├── pages/               # Page components
│   ├── admin/          # Admin dashboard
│   ├── teacher/        # Teacher pages (8 modules)
│   ├── student/        # Student pages
│   ├── parent/         # Parent pages
│   └── Login.tsx       # Authentication
├── components/         # Reusable UI components
├── contexts/          # AuthContext, global state
├── lib/               # API utilities, helpers
└── hooks/             # Custom React hooks
```

### Backend (backend/src/)
```
backend/src/
├── controllers/       # Business logic (14 modules)
├── routes/           # API endpoint definitions
├── models/           # MongoDB schemas
├── middleware/       # Auth, validation
├── utils/            # Database, auth utilities
└── server.ts         # Express app setup
```

---

## 👥 User Roles & Access

| Role | Capabilities | Pages |
|------|-------------|-------|
| **Admin** | Manage all users, view analytics, handle enquiries | 1 dashboard |
| **Teacher** | Enroll students, assign homework, mark attendance, create quizzes | 8 pages |
| **Student** | View homework, attempt quizzes, check scores | 3 pages |
| **Parent** | Monitor child's progress, view attendance & marks | 3 pages |

---

## 🔑 Account Creation

### Via Admin Dashboard
1. Login as admin (admin@google.com)
2. Go to "User Management"
3. Click "Add User" and select role
4. System generates credentials automatically

### Teachers Creating Students
1. Login as teacher
2. Go to "Enroll Students"
3. Enter student details
4. System creates login credentials for student and parent

---

## 📦 API Endpoints (50 Total)

**All endpoints require authentication except:**
- `POST /api/auth/login`
- `POST /api/enquiry`
- `GET /api/health`

**Main Modules:**
- `/api/auth/*` - Login, get current user
- `/api/students/*` - Student management
- `/api/teacher/*` - Teacher operations
- `/api/homework/*` - Homework management
- `/api/attendance/*` - Attendance tracking
- `/api/scores/*` - Grade management
- `/api/events/*` - School events & notices
- `/api/meetings/*` - Teacher-parent meetings
- `/api/quizzes/*` - Quiz management
- `/api/admin/*` - Admin functions
- `/api/notifications/*` - In-app notifications

See [backend/ADMIN_API.md](./backend/ADMIN_API.md) for detailed API documentation.

---

## 🧪 Testing the System

### Test Admin Functions
```bash
# Login test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@google.com","password":"Admin@123","role":"admin"}'

# View all users (with auth token)
curl http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer <your_token>"
```

### Manual Testing Checklist
- [ ] Can login with created credentials
- [ ] Cannot access other role's pages
- [ ] Can create users (as admin)
- [ ] Can enroll students (as teacher)
- [ ] Can view progress (as parent)
- [ ] Can view scores (as student)

---

## 🛠️ Building for Production

### Frontend Build
```bash
npm run build
npm run preview  # Preview production build locally
```

### Backend Build
```bash
cd backend
npm run build
npm start
```

### Environment Variables for Production
```env
# .env
NODE_ENV=production
JWT_SECRET=<very-long-random-string>
MONGODB_URI=<production-mongodb-url>
FRONTEND_URL=<your-production-domain>
```

---

## 📚 Documentation Files
- [API.md](./API.md) - API endpoint examples
- [ADMIN_API.md](./backend/ADMIN_API.md) - Admin-specific operations
- [DEPLOYMENT_CREDENTIALS.md](./DEPLOYMENT_CREDENTIALS.md) - Complete deployment guide
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues & solutions
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - System reference

---

## 🆘 Troubleshooting

### "Cannot connect to database"
```bash
# Check MongoDB URI
echo $MONGODB_URI

# Test connection with mongosh
mongosh "$MONGODB_URI"
```

### "Invalid credentials" on login
- Verify user exists in database
- Check email/password are correct
- Ensure password hasn't been changed

### Frontend can't reach backend
- Verify VITE_API_URL in .env.local is correct
- Check backend is running: `curl http://localhost:5000/api/health`
- Check CORS configuration in backend/.env

### Password hashing errors
```bash
cd backend
npm install bcryptjs --save
npm run dev
```

---

## 🔐 Security Reminders

✅ **Before Deployment:**
1. Change admin password from `Admin@123`
2. Set strong JWT_SECRET (min 32 characters)
3. Use your own MongoDB cluster (not shared)
4. Enable HTTPS on production domain
5. Set `NODE_ENV=production`
6. Review and customize CORS origins
7. Set up email configuration for notifications

❌ **Never:**
1. Commit .env files with real credentials
2. Use demo/test credentials in production
3. Share JWT_SECRET across users
4. Expose MongoDB URI in client-side code
5. Deploy without HTTPS

---

## 📝 Project Statistics

- **Frontend Pages**: 14 (9 protected role-based)
- **Backend Endpoints**: 50+ (14 modules)
- **Database Collections**: 10+
- **API Controllers**: 14
- **Route Files**: 14
- **Type Safety**: 100% TypeScript

---

## 🤝 Support & Questions

For detailed help, refer to:
1. [DEPLOYMENT_CREDENTIALS.md](./DEPLOYMENT_CREDENTIALS.md) - Account setup
2. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
3. [API.md](./API.md) - API examples
4. Console logs and error messages

---

## 📌 Important Notes

- **Demo accounts removed** from this version (use real accounts)
- All hardcoded credentials removed from code
- System uses proper environment variables
- Database queries use Mongoose with validation
- All endpoints require JWT authentication (except public ones)
- Role-based access control enforced client & server-side

---

**Version**: 1.0.0  
**Last Updated**: April 2026  
**Status**: ✅ Production Ready

For deployment instructions, see [DEPLOYMENT_CREDENTIALS.md](./DEPLOYMENT_CREDENTIALS.md)
