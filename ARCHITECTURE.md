# Family Hub - School Management System

## Architecture Overview

This project uses a **modern full-stack architecture**:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express.js + MongoDB + Mongoose
- **Architecture Pattern**: MVC (Model-View-Controller)
- **Authentication**: JWT with secure HTTP-only cookies
- **Database**: MongoDB (Atlas or local)

---

## Project Structure

```
family-hub/
+-- frontend/                   # React SPA (port 5173)
¦   +-- src/
¦   ¦   +-- components/        # Reusable React components
¦   ¦   +-- pages/            # Page components
¦   ¦   +-- contexts/         # React Context (Auth)
¦   ¦   +-- hooks/            # Custom React hooks
¦   ¦   +-- lib/              # Utilities (API calls, helpers)
¦   ¦   +-- App.tsx           # Main app component
¦   +-- public/
¦   +-- vite.config.ts
¦   +-- tsconfig.json
¦   +-- package.json
¦   +-- .env.frontend         # Frontend env vars

+-- backend/                    # Express.js API (port 5000)
¦   +-- src/
¦   ¦   +-- models/           # Mongoose schemas
¦   ¦   ¦   +-- User.ts
¦   ¦   ¦   +-- Student.ts
¦   ¦   ¦   +-- Homework.ts
¦   ¦   ¦   +-- HomeworkStatus.ts
¦   ¦   ¦   +-- Attendance.ts
¦   ¦   ¦   +-- Score.ts
¦   ¦   ¦   +-- index.ts      # Model exports
¦   ¦   ¦
¦   ¦   +-- controllers/      # Business logic
¦   ¦   ¦   +-- authController.ts
¦   ¦   ¦   +-- studentController.ts
¦   ¦   ¦   +-- teacherController.ts
¦   ¦   ¦   +-- homeworkController.ts
¦   ¦   ¦   +-- attendanceController.ts
¦   ¦   ¦   +-- scoresController.ts
¦   ¦   ¦
¦   ¦   +-- routes/           # Express routes
¦   ¦   ¦   +-- authRoutes.ts
¦   ¦   ¦   +-- studentRoutes.ts
¦   ¦   ¦   +-- teacherRoutes.ts
¦   ¦   ¦   +-- homeworkRoutes.ts
¦   ¦   ¦   +-- attendanceRoutes.ts
¦   ¦   ¦   +-- scoresRoutes.ts
¦   ¦   ¦
¦   ¦   +-- middleware/       # Express middleware
¦   ¦   ¦   +-- auth.ts       # JWT verification
¦   ¦   ¦
¦   ¦   +-- utils/            # Helper functions
¦   ¦   ¦   +-- db.ts         # MongoDB connection
¦   ¦   ¦   +-- auth.ts       # JWT & password utilities
¦   ¦   ¦
¦   ¦   +-- server.ts         # Express app setup
¦   ¦
¦   +-- .env                  # Backend env vars
¦   +-- tsconfig.json
¦   +-- package.json
¦   +-- .gitignore

+-- package.json              # Root workspace (optional)
```

---

## MVC Pattern Explained

### Models (`backend/src/models/`)
- Define MongoDB schemas using Mongoose
- Examples: User, Student, Homework, Attendance, Score
- Handle data structure and validation

### Controllers (`backend/src/controllers/`)
- Contain business logic for each resource
- Handle validation, DB operations, response formatting
- Examples: authController, teacherController, homeworkController
- Export functions that handle HTTP requests

### Routes (`backend/src/routes/`)
- Define HTTP endpoints and map to controllers
- Apply middleware (auth, role-based access control)
- Keep route definitions clean and organized

### Middleware (`backend/src/middleware/`)
- Auth middleware: Verify JWT tokens and attach user to request
- Role-based access control (requireRole)
- Request validation

### Utilities (`backend/src/utils/`)
- `db.ts`: MongoDB connection and management
- `auth.ts`: JWT signing/verification, password hashing with bcrypt

---

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current authenticated user

### Students
- `GET /api/students` - List all students
- `GET /api/students/:id` - Get student by ID

### Teacher
- `POST /api/teacher/enroll` - Enroll new student (creates student + parent users)

### Homework
- `GET /api/homework` - Get homework (filtered by teacher if needed)
- `POST /api/homework` - Create homework (teacher only)
- `PATCH /api/homework/:id/status` - Update homework completion status

### Attendance
- `GET /api/attendance?date=YYYY-MM-DD` - Get attendance records
- `POST /api/attendance` - Mark attendance (teacher only)

### Scores
- `GET /api/scores?studentId=...&className=...` - Get scores
- `POST /api/scores` - Add score (teacher only)

---

## Authentication Flow

1. User logs in at `/login` page
2. Frontend sends `POST /api/auth/login` with email, password, role
3. Backend verifies credentials and returns JWT token + user data
4. Frontend stores token in localStorage
5. For subsequent requests, token sent in `Authorization: Bearer <token>` header
6. Auth middleware verifies token and attaches user to request object
7. Controllers can check `req.user` and `req.user.role`

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

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  passwordHash: String,
  role: "teacher" | "parent" | "student",
  avatar: String (optional),
  meta: Map<String, String>,
  createdAt: Date,
  updatedAt: Date
}
```

### Students Collection
```javascript
{
  _id: ObjectId,
  name: String,
  roll: String,
  className: String,
  parentName: String,
  studentEmail: String,
  parentEmail: String,
  studentUserId: ObjectId (ref: User),
  parentUserId: ObjectId (ref: User),
  createdByTeacherId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Homework Collection
```javascript
{
  _id: ObjectId,
  subject: String,
  title: String,
  description: String,
  dueDate: String,
  className: String (optional),
  createdByTeacherId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

Similar structures for HomeworkStatus, Attendance, Score collections.

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
