# ? Developer Quick Reference

## Start Servers Fast

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
npm run dev
```

Then open: **http://localhost:5173**

---

## Common Commands

### Backend
```bash
npm run dev          # Start dev server with hot reload
npm run build        # Compile TypeScript
npm run typecheck    # Check TypeScript errors
npm run lint         # Run ESLint
npm start            # Run compiled version
```

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview build locally
npm run test         # Run tests
npm run lint         # Run ESLint
```

---

## API Endpoints by Feature

### ?? Auth
```
POST /api/auth/login         { email, password, role }
GET  /api/auth/me            ? requires JWT
```

### ?? Students
```
GET  /api/students           ? requires JWT
GET  /api/students/:id       ? requires JWT
```

### ?? Teacher
```
POST /api/teacher/enroll     { name, parentName, className }
```

### ?? Homework
```
GET  /api/homework           ? requires JWT
POST /api/homework           { subject, title, description, dueDate }
PATCH /api/homework/:id/status { status }
```

### ?? Attendance
```
GET  /api/attendance?date=YYYY-MM-DD ? requires JWT
POST /api/attendance         { date, records }
```

### ?? Scores
```
GET  /api/scores?studentId=... OR ?className=... ? requires JWT
POST /api/scores             { studentId, subject, testName, scorePercent, grade, date }
```

---

## Frontend API Usage

### Using apiCall Utility
```typescript
import { apiCall } from '@/lib/api';

// GET request
const data = await apiCall('/students');

// POST request
const result = await apiCall('/homework', {
  method: 'POST',
  body: JSON.stringify({ subject, title, description })
});

// PATCH request
await apiCall('/homework/abc123/status', {
  method: 'PATCH',
  body: JSON.stringify({ status: 'completed' })
});
```

**Features:**
- ? Automatically adds JWT token
- ? Handles JSON serialization
- ? Throws errors on non-OK responses
- ? Returns parsed JSON

---

## Backend MVC Pattern

### Models (Database Schemas)
```typescript
// File: backend/src/models/MyModel.ts
import mongoose from 'mongoose';

const mySchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  metadata: Map
}, { timestamps: true });

export const MyModel = mongoose.model('MyModel', mySchema);
```

### Controllers (Business Logic)
```typescript
// File: backend/src/controllers/myController.ts
import { Request, Response } from 'express';
import { MyModel } from '../models';
import { AuthRequest } from '../middleware/auth';

export async function listItems(req: AuthRequest, res: Response) {
  try {
    const items = await MyModel.find({});
    res.json({ items });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Routes (URL Mapping)
```typescript
// File: backend/src/routes/myRoutes.ts
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { listItems, createItem } from '../controllers/myController';

const router = Router();

router.get('/', authMiddleware, listItems);
router.post('/', authMiddleware, requireRole('teacher'), createItem);

export default router;
```

### Register in Server
```typescript
// In backend/src/server.ts
app.use('/api/myitems', myRoutes);
```

---

## Authentication

### Check User in Controller
```typescript
export async function myFunction(req: AuthRequest, res: Response) {
  // Check if authenticated
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Check role
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Use user ID
  const userId = req.user._id;
}
```

### Create Token (for reference)
```typescript
import { signToken } from '../utils/auth';

const token = signToken(user._id.toString(), user.role);
```

### Verify Token (automatic via middleware)
```typescript
// Just use authMiddleware in route
router.get('/protected', authMiddleware, myController);
```

---

## Common Patterns

### Validate Input with Zod
```typescript
import { z } from 'zod';

const CreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0)
});

try {
  const parsed = CreateSchema.parse(req.body);
} catch (err) {
  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: 'Invalid input', details: err.errors });
  }
}
```

### Query with Filters
```typescript
const query: any = {};
if (req.query.status) query.status = req.query.status;
if (req.query.date) query.date = req.query.date;

const results = await Model.find(query);
```

### Populate References
```typescript
// Get student with populated user references
const student = await Student.findById(id)
  .populate('studentUserId', 'name email')
  .populate('parentUserId', 'name email');
```

### Save New Record
```typescript
const item = new Model({
  name: 'Test',
  email: 'test@example.com'
});

await item.save();
res.status(201).json({ id: item._id.toString(), ...item });
```

### Update Record
```typescript
const updated = await Model.findByIdAndUpdate(
  id,
  { $set: { status: 'active' } },
  { new: true } // return updated doc
);
```

---

## Debugging

### Backend Logs
```bash
# Check console output when running: npm run dev
# All API calls logged with method and path
[2026-03-11T14:05:23.456Z] POST /api/auth/login
```

### Frontend Errors
- Open DevTools: **F12**
- Check **Console** tab for fetch errors
- Check **Network** tab to see API requests

### MongoDB Queries
```bash
# Test in MongoDB Compass/mongosh
db.users.findOne({ email: 'test@school.edu' })
db.students.find({}).pretty()
```

---

## File Locations

### To fix something, look here:

**Login not working?**
- Backend: `backend/src/controllers/authController.ts`
- Frontend: `src/contexts/AuthContext.tsx`

**Homework not showing?**
- Backend: `backend/src/controllers/homeworkController.ts`
- Frontend: `src/pages/teacher/TeacherLMS.tsx` or `src/pages/student/StudentDashboard.tsx`

**Database issues?**
- Config: `backend/.env`
- Connection: `backend/src/utils/db.ts`

**CORS errors?**
- Backend: `backend/src/server.ts` (look for cors configuration)
- Frontend: `.env.frontend` (check VITE_API_URL)

---

## Deployment Checklist

### Before Deploying

- [ ] Update MongoDB connection (production cluster)
- [ ] Change JWT_SECRET to strong random string
- [ ] Update NODE_ENV to production
- [ ] Update FRONTEND_URL in backend .env
- [ ] Update VITE_API_URL to production backend URL
- [ ] Run: `npm run build` in backend
- [ ] Run: `npm run build` in frontend
- [ ] Test in production URLs

### Deploy Backend
```bash
cd backend
npm run build
# Deploy dist/ folder with NODE_ENV=production
```

### Deploy Frontend
```bash
npm run build
# Deploy dist/ folder to static host
```

---

## Useful Links

- TypeScript Docs: https://www.typescriptlang.org/
- Express Docs: https://expressjs.com/
- Mongoose Docs: https://mongoosejs.com/
- MongoDB Manual: https://docs.mongodb.com/manual/
- React Docs: https://react.dev/
- Vite Docs: https://vitejs.dev/

---

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check MONGODB_URI, MongoDB connection status |
| Port in use | Kill process on port 5000 or 5173 |
| Module not found | Run npm install, check imports |
| Auth failing | Check JWT_SECRET, clear localStorage |
| Refresh token expired | Re-login to get new token |
| CORS error | Check FRONTEND_URL in backend .env |
| TypeScript errors | Run npm run typecheck to see all |

---

**Happy coding!** ??
