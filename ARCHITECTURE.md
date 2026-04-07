# Family Hub - School Management System - Architecture

## System Overview

**Family Hub** is a comprehensive school management system built with modern full-stack technologies:

- **Frontend**: React 18 + TypeScript, Vite bundler, Tailwind CSS, ShadcN UI components
- **Backend**: Express.js + TypeScript, MVC architecture, JWT authentication
- **Database**: MongoDB + Mongoose ODM, compound indexing for performance
- **Authentication**: JWT tokens (7-day expiry), per-role email uniqueness, bcryptjs password hashing
- **User Roles**: 4 distinct roles (teacher, parent, student, admin) with role-based access control
- **API Pattern**: RESTful with standardized response formats (Phase 2 implementation)

---

## Project Structure

```
family-hub/
+-- frontend/                   # React SPA (port 5173)
�   +-- src/
�   �   +-- components/        # Reusable React components
�   �   +-- pages/            # Page components
�   �   +-- contexts/         # React Context (Auth)
�   �   +-- hooks/            # Custom React hooks
�   �   +-- lib/              # Utilities (API calls, helpers)
�   �   +-- App.tsx           # Main app component
�   +-- public/
�   +-- vite.config.ts
�   +-- tsconfig.json
�   +-- package.json
�   +-- .env.frontend         # Frontend env vars

+-- backend/                    # Express.js API (port 5000)
�   +-- src/
�   �   +-- models/           # Mongoose schemas
�   �   �   +-- User.ts
�   �   �   +-- Student.ts
�   �   �   +-- Homework.ts
�   �   �   +-- HomeworkStatus.ts
�   �   �   +-- Attendance.ts
�   �   �   +-- Score.ts
�   �   �   +-- index.ts      # Model exports
�   �   �
�   �   +-- controllers/      # Business logic
�   �   �   +-- authController.ts
�   �   �   +-- studentController.ts
�   �   �   +-- teacherController.ts
�   �   �   +-- homeworkController.ts
�   �   �   +-- attendanceController.ts
�   �   �   +-- scoresController.ts
�   �   �
�   �   +-- routes/           # Express routes
�   �   �   +-- authRoutes.ts
�   �   �   +-- studentRoutes.ts
�   �   �   +-- teacherRoutes.ts
�   �   �   +-- homeworkRoutes.ts
�   �   �   +-- attendanceRoutes.ts
�   �   �   +-- scoresRoutes.ts
�   �   �
�   �   +-- middleware/       # Express middleware
�   �   �   +-- auth.ts       # JWT verification
�   �   �
�   �   +-- utils/            # Helper functions
�   �   �   +-- db.ts         # MongoDB connection
�   �   �   +-- auth.ts       # JWT & password utilities
�   �   �
�   �   +-- server.ts         # Express app setup
�   �
�   +-- .env                  # Backend env vars
�   +-- tsconfig.json
�   +-- package.json
�   +-- .gitignore

+-- package.json              # Root workspace (optional)
```

---

## User Roles & Access Control (RBAC)

**4 Distinct Roles**:

| Role    | Dashboard | Permissions |
|---------|-----------|------------|
| **teacher** | /teacher/dashboard | Create/grade homework, mark attendance, assign quizzes, view class scores, enroll students |
| **parent** | /parent/dashboard | View child's homework, grades, attendance, receive notifications |
| **student** | /student/dashboard | View homework, submit status, view grades, see schedule |
| **admin** | /admin/dashboard | Manage users, view system stats, generate reports, configure settings (NEW Phase 1.1) |

**Demo Credentials**:
```
Teacher:  teacher@school.edu / teacher123
Parent:   parent@school.edu / parent123
Student:  student@school.edu / student123
Admin:    admin@school.edu / admin123 (NEW)
```

**Email Uniqueness** (Fixed Phase 1.5):
- Email unique per-role (compound index: email + role)
- Allows: same email for student + parent (common family scenario)
- Example: `ram@example.com` can be both student and parent account

---

## Data Model Architecture

### User Model (Core - Phase 1.5 Updated)

```typescript
interface User {
  _id: ObjectId,
  name: string,
  email: string,                      // Unique per role
  password: string,                   // bcryptjs hashed (10 rounds)
  role: "teacher" | "parent" | "student" | "admin",
  meta: {
    class?: string,                   // Student's class (e.g., "10-A")
    parentEmail?: string,             // Emergency contact
    department?: string,              // Teacher's department
  },
  createdAt: Date,
  updatedAt: Date,
}

// Unique compound index enforced (Phase 1.5)
userSchema.index({email: 1, role: 1}, {unique: true});
```

### Enrollment Workflow

```
Teacher creates Student enrollment
        ↓
System auto-generates:
  • User (role: student) with temp password
  • User (role: parent) with temp password
  • Student record linking both
  ↓
Student assigned to class
  ↓
Homework for class visible to all students
  ↓
Each student creates HomeworkStatus for tracking
```

### Homework → HomeworkStatus Flow (Phase 1.3 & 2.3 Updated)

```
1. Teacher creates Homework
   - Assigns to class (className: "10-A")
   - Sets dueDate, description
   
2. System filters homework by class
   - Students in class 10-A see this homework
   - Students in class 9-B don't see it
   
3. Student views homework
   - Creates HomeworkStatus record (one-per-homework)
   
4. Student updates status
   - "NotStarted" → "InProgress" → "Completed"
   - Timestamp recorded for each change
   
5. Teacher views class submission status
   - Dashboard shows summary: 15 assigned, 12 completed, 3 pending
   
6. Parent views child's homework
   - Sees due date, completion status, teacher feedback
```

---

## API Response Format (Standardized - Phase 2.2)

### Single Resource Response (Phase 2.2 ✅)

```json
{
  "student": {
    "_id": "666abc...",
    "name": "राज कुमार",
    "email": "raj@school.edu",
    "class": "10-A"
  }
}
```

### Multiple Resources Response (Phase 2.2 ✅)

```json
{
  "students": [
    { "_id": "666abc...", "name": "राज कुमार", "class": "10-A" },
    { "_id": "666def...", "name": "अमिता शर्मा", "class": "10-A" }
  ]
}
```

### Action/Status Response (Phase 2.2 ✅)

```json
{
  "ok": true,
  "message": "Attendance marked for 25 students"
}
```

### Error Response (Phase 2.2 ✅)

```json
{
  "error": "Student not found in this class",
  "statusCode": 404
}
```

---

## MVC Pattern Explained

### Models (`backend/src/models/`)
- Define MongoDB schemas using Mongoose
- Examples: User, Student, Homework, Attendance, Score, Quiz, Meeting, Announcement, Notification, Enquiry (13 models total)
- Handle data structure and validation
- Enforce compound indexes for query performance

### Controllers (`backend/src/controllers/`)
- Contain business logic for each resource
- Handle validation, DB operations, response formatting (standardized Phase 2.2)
- Enforce role-based access control
- Examples: authController, teacherController, homeworkController, adminController (NEW Phase 1.1), studentController
- Total: 12 controllers handling auth, student, teacher, homework, attendance, scores, quiz, meeting, instruction, event, enquiry, admin (NEW)

### Routes (`backend/src/routes/`)
- Define HTTP endpoints and map to controllers
- Apply middleware (JWT auth, role validation)
- Keep route definitions clean and organized
- 12 route files for different domains (auth, student, teacher, admin (NEW), homework, attendance, scores, quiz, meeting, instruction, event, enquiry)

### Middleware (`backend/src/middleware/`)
- Auth middleware: Verify JWT tokens and attach user to request
- Role-based access control: requireRole("teacher"), requireRole("admin"), etc.
- Request validation
- CORS configuration for frontend access

### Utilities (`backend/src/utils/`)
- `db.ts`: MongoDB connection, validation, model indexing
- `auth.ts`: JWT signing/verification, password hashing with bcryptjs, token expiry (7 days)
- `email.ts`: Email sending utilities (future integration with SendGrid/SES)
- `types.ts`: TypeScript interfaces (AuthRequest, AuthResponse)

---

## API Endpoints (Standardized Phase 2.2)

### Authentication
- `POST /api/auth/login` - Login with email, password, role → returns {token, user}
- `GET /api/auth/me` - Get current authenticated user (refresh token)
- `POST /api/auth/register` - Register new account

### Students (Standardized Phase 2.2 ✅)
- `GET /api/students` - List all students (teacher only) → {students: [...]}
- `GET /api/students/:id` - Get student by ID → {student: {...}}
- `POST /api/students` - Create student (admin only)

### Teachers
- `POST /api/teacher/enroll` - Enroll new student (creates student + parent users) → {student: {...}}

### Homework (Updated Phase 2.3 ✅)
- `GET /api/homework` - Get homework (students: filtered by class, teachers: all) → {homeworks: [...]}
- `POST /api/homework` - Create homework (teacher only) → {homework: {...}}
- `GET /api/homework/:id/status` - Get student's homework status (NEW Phase 1.3) → {status: {...}}
- `PATCH /api/homework/:id/status` - Update homework status by student → {ok: true}

### Attendance
- `GET /api/attendance?date=YYYY-MM-DD` - Get attendance records → {attendance: [...]}
- `POST /api/attendance` - Mark attendance (teacher only) → {ok: true}

### Scores (Standardized Phase 2.2 ✅)
- `GET /api/scores?studentId=...&className=...` - Get scores (standardized) → {scores: [...]}
- `POST /api/scores` - Add score (teacher only) → {score: {...}}

### Admin (NEW Phase 1.1)
- `GET /api/admin/dashboard` - Dashboard stats (admin only) → {stats: {...}, users: [...]}
- `GET /api/admin/users` - List all users (admin only) → {users: [...]}
- `POST /api/admin/users` - Create user (admin only) → {user: {...}}
- `DELETE /api/admin/users/:id` - Delete user (admin only) → {ok: true}

### Quiz, Meeting, Instruction, Event, Enquiry, Announcement
- Various CRUD endpoints following same standardized format
- Role-based access control enforced

---

## Authentication Flow (Updated Phase 1.2)

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (Atlas or local)
- npm or yarn

### Installation

#### 1. Clone and install dependencies

```bash
cd family-hub

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (back to root)
cd ..
npm install
```

#### 2. Configure environment variables

**Backend** - `backend/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster0
MONGODB_DB_NAME=family_hub
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend** - `.env.frontend`:
```env
VITE_API_URL=http://localhost:5000/api
```

#### 3. Start the development servers

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```
Should output:
```
? Connected to MongoDB
? Server running at http://localhost:5000
```

**Terminal 2 - Frontend**:
```bash
npm run dev
```
Should output:
```
VITE v7.3.1 ready in 123 ms
? Local: http://localhost:5173/
```

#### 4. Test the application

1. Open `http://localhost:5173` in browser
2. Navigate to `/login`
3. Try enrolling a new student (as teacher) or login with existing credentials
4. Test homework, attendance, scores features

---

## Database Schema (Updated Phase 1.5 & 2.3)

### Users Collection (Phase 1.5 ✅ - Per-role email uniqueness)
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,                        // Unique per role (compound index)
  passwordHash: String,                 // bcryptjs hashed (10 rounds)
  role: "teacher" | "parent" | "student" | "admin",  // 4 roles
  avatar: String (optional),
  meta: Map<String, String>,
  createdAt: Date,
  updatedAt: Date
}

// Unique compound index (Phase 1.5)
userSchema.index({email: 1, role: 1}, {unique: true});
```

### Students Collection (Phase 2.3 ✅ - Class assignment)
```javascript
{
  _id: ObjectId,
  name: String,
  roll: String,
  className: String,                    // Class assignment for filtering (Phase 2.3)
  parentName: String,
  studentEmail: String,
  parentEmail: String,
  studentUserId: ObjectId (ref: User), // Link to student user
  parentUserId: ObjectId (ref: User),   // Link to parent user
  createdByTeacherId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}

// Compound index (Phase 3.2 pending)
studentSchema.index({className: 1, studentUserId: 1});
```

### Homework Collection (Phase 2.3 ✅ - Class-based filtering)
```javascript
{
  _id: ObjectId,
  subject: String,
  title: String,
  description: String,
  dueDate: String,                      // ISO 8601 format
  className: String,                    // Class assignment (Phase 2.3)
  createdByTeacherId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}

// Compound index for class filtering (Phase 3.2 pending)
homeworkSchema.index({className: 1, createdByTeacherId: 1});
```

### HomeworkStatus Collection
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: User),
  homeworkId: ObjectId (ref: Homework),
  status: "NotStarted" | "InProgress" | "Completed",
  submissionDate: Date (optional),
  feedback: String (optional),
  createdAt: Date,
  updatedAt: Date
}

// Compound unique index
statusSchema.index({studentId: 1, homeworkId: 1}, {unique: true});
```

### Attendance Collection (Future Phase 3.2 indexing)
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: User),
  date: Date (ISO 8601),
  status: "present" | "absent" | "late",
  markedByTeacherId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

Similar schemas for: Score, Quiz, Meeting, Instruction, Event, Announcement, Notification, Enquiry

---

## Development Tips

### Adding a new feature

1. **Create Model** - `backend/src/models/NewModel.ts`
2. **Create Controller** - `backend/src/controllers/newController.ts` with CRUD functions
3. **Create Routes** - `backend/src/routes/newRoutes.ts` and import in `server.ts`
4. **Create Frontend page** - `src/pages/NewPage.tsx` and add route in `App.tsx`
5. **Use API utility** - `import { apiCall } from '@/lib/api'` for consistent API calls

### Error Handling
- Controllers use try-catch and return JSON error responses
- Frontend catches errors and displays toasts (using Sonner)
- Check browser console and server logs for debugging

### Testing API locally
Use Postman or `curl`:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@school.edu",
    "password": "Pass1234",
    "role": "teacher"
  }'
```

---

## Deployment

### Backend (Node.js server)
- Deploy to: Heroku, Railway, Render, AWS, DigitalOcean, etc.
- Set environment variables on host
- Build: `npm run build`
- Start: `npm start`

### Frontend (React SPA)
- Deploy to: Vercel, Netlify, GitHub Pages, etc.
- Build: `npm run build`
- Set `VITE_API_URL` to production backend URL
- Serve the `dist/` folder

---

## Troubleshooting

**Backend won't connect to MongoDB:**
- Check `MONGODB_URI` in `.env`
- Verify MongoDB cluster is accessible
- Check firewall/network issues

**Frontend can't reach backend:**
- Backend must be running at `http://localhost:5000`
- Check `VITE_API_URL` in `.env.frontend`
- Enable CORS (already configured in `server.ts`)

**Auth token issues:**
- Clear localStorage: `localStorage.clear()`
- Re-login to get new token
- Check JWT_SECRET is same on backend

---

## Available Scripts

**Backend**:
```bash
npm run dev        # Start dev server with auto-reload
npm run build      # Compile TypeScript to JavaScript
npm start          # Run compiled server
npm run typecheck  # Check TypeScript types
npm run lint       # Run ESLint
```

**Frontend**:
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
npm run test       # Run tests
```

---

## Tech Stack Summary

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Hook Form |
| Backend   | Node.js, Express.js, TypeScript, Mongoose |
| Database  | MongoDB (Mongoose ODM) |
| Auth      | JWT, bcryptjs |
| Validation| Zod |
| HTTP      | CORS enabled, JSON |

---

## License

MIT or as specified in project

---

## Support

For issues or questions, check the code comments and error logs!
