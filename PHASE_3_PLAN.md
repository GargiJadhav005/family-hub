# Phase 3: Data Quality & Feature Completion Plan

**Duration**: 2-3 hours  
**Status**: 🔴 Not started  
**Objective**: Complete database infrastructure, implement remaining features, add performance optimizations  

---

## 3.1 Create Comprehensive Seed Script

**File**: `backend/src/scripts/seedAll.ts`  
**Duration**: ~30 minutes  
**Impact**: Enables team to populate database in seconds for testing

### What to Create

```bash
npm run seed:all    # Single command to populate entire database
```

### Sample Data to Generate

**Users** (23 total):
- 5 teachers (teachers 1-5, class: 10-A/10-B/9-A/9-B/8-A)
- 15 students (in 3 classes: 10-A x 5, 10-B x 5, 9-A x 5)
- 15 parents (one per student, shared parents for siblings)
- 1 admin (admin@school.edu)

**Enrollments**:
- Link each student with 2 parents (mom/dad)
- Assign students to classes based on name

**Academic Data**:
- 20 homework items (5 per class)
- 50 attendance records (per student, last 10 days)
- 30 scores (3-5 per student)
- 3 quizzes (one per class) with 5 questions each

**Events & Communications**:
- 5 announcements (class-wide)
- 3 meetings (scheduled for next 2 weeks)
- 10 enquiries (student/parent questions)

**Script Structure**:
```typescript
// backend/src/scripts/seedAll.ts
async function seedDatabase() {
  1. dropAllCollections()     // Clean slate
  2. seedUsers()              // Create demo users (hashed passwords)
  3. seedStudents()           // Enroll students with parents
  4. seedHomework()           // Create assignments per class
  5. seedAttendance()         // Create attendance records
  6. seedScores()             // Add academic scores
  7. seedQuizzes()            // Create quizzes with questions
  8. seedAnnouncements()      // Create system announcements
  9. seedMeetings()           // Schedule meetings
  10. seedEnquiries()         // Add sample enquiries
  11. createIndexes()         // Ensure all indexes exist
  12. log("✓ Seeding complete")
}
```

### How It Works

```bash
# Option 1: Run in development
cd backend
npm run seed:all

# Option 2: Run with environment override
NODE_ENV=development npm run seed:all

# Verify data was seeded
mongosh family_hub
db.users.count()  # Should show ~23
db.homework.count()  # Should show ~20
```

### Data Validation

After seeding:
```bash
✓ Created 5 teachers
✓ Created 15 students with 15 parents
✓ Created 1 admin user
✓ Created 20 homework assignments
✓ Created 50 attendance records
✓ Created 30 academic scores
✓ Created 3 quizzes with 15 questions
✓ Created 5 announcements
✓ Created 3 meetings
✓ Created 10 enquiries
✓ Created 15 indexes
Total records: 147
Database ready for testing!
```

### Login Test Instructions

After seeding, test with:
```
Teacher: teacher1@school.edu / password123
Student: student1@school.edu / password123
Parent:  parent1@school.edu / password123
Admin:   admin@school.edu / admin123
```

---

## 3.2 Add Database Indexes for Performance

**File**: `backend/src/utils/db.ts` (add index creation)  
**Duration**: ~30 minutes  
**Expected Improvement**: Query times <100ms (from 200-300ms)

### Indexes to Create

```typescript
// User indexes
userSchema.index({email: 1, role: 1}, {unique: true});

// Student indexes
studentSchema.index({className: 1});
studentSchema.index({studentUserId: 1});
studentSchema.index({className: 1, studentUserId: 1});

// Homework indexes
homeworkSchema.index({className: 1});
homeworkSchema.index({createdByTeacherId: 1});
homeworkSchema.index({className: 1, createdByTeacherId: 1});

// HomeworkStatus indexes
statusSchema.index({studentId: 1});
statusSchema.index({homeworkId: 1});
statusSchema.index({studentId: 1, homeworkId: 1}, {unique: true});

// Attendance indexes
attendanceSchema.index({studentId: 1});
attendanceSchema.index({date: 1});
attendanceSchema.index({studentId: 1, date: 1});

// Score indexes
scoreSchema.index({studentId: 1});
scoreSchema.index({date: 1});
scoreSchema.index({studentId: 1, date: 1});

// Quiz indexes
quizSchema.index({className: 1});
quizSchema.index({createdByTeacherId: 1});

// Meeting indexes
meetingSchema.index({date: 1});
meetingSchema.index({status: 1});
```

### Implementation

Add to `connectDB()` in `backend/src/utils/db.ts`:
```typescript
async function createIndexes() {
  await User.collection.createIndex({email: 1, role: 1}, {unique: true});
  await Student.collection.createIndex({className: 1, studentUserId: 1});
  // ... create all indexes
  console.log('✓ All indexes created');
}

export async function connectDB() {
  // ... existing connection code
  await createIndexes();
}
```

### Performance Verification

```bash
# Before indexing
GET /api/homework?className=10-A  # ~250ms

# After indexing
GET /api/homework?className=10-A  # ~25ms (10x faster!)
```

---

## 3.3 Fix Remaining Homework Status Retrieval

**File**: `backend/src/controllers/homeworkController.ts`  
**Duration**: ~20 minutes  
**Objective**: Provide student consolidated homework view

### New Endpoint

```
GET /api/homework/student/all
Response:
{
  "homeworks": [
    {
      "_id": "...",
      "title": "Chapter 5 Exercise",
      "dueDate": "2024-01-15",
      "status": "Completed",        // From HomeworkStatus
      "statusUpdatedAt": "2024-01-14T15:30:00Z",
      "feedback": "Good work!"
    },
    ...
  ]
}
```

### Implementation

```typescript
// In homeworkController.ts
export const getStudentHomeworkStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const userClass = req.user.meta?.class;
    
    // Get all homework for student's class
    const homeworks = await Homework.find({className: userClass});
    
    // Get student's status for each
    const result = await Promise.all(
      homeworks.map(async (hw) => {
        const status = await HomeworkStatus.findOne({
          studentId: userId,
          homeworkId: hw._id
        });
        return {
          ...hw.toObject(),
          status: status?.status || "NotStarted",
          statusUpdatedAt: status?.updatedAt,
          feedback: status?.feedback
        };
      })
    );
    
    res.json({homeworks: result});
  } catch (error) {
    res.status(500).json({error: "Failed to fetch homework"});
  }
};
```

### Route

```typescript
// In homeworkRoutes.ts
router.get('/student/all', verifyToken, getStudentHomeworkStatus);
```

---

## 3.4 Enhance Quiz & Meeting Controllers

**Duration**: ~30 minutes  
**Objective**: Standardize and add role-based access control

### Quiz Controller Updates

```typescript
// Quiz responses (standardize format)
POST /api/quiz → {quiz: {...}}
GET /api/quiz → {quizzes: [...]}
GET /api/quiz/:id → {quiz: {...}}

// Add role-based filtering
if (req.user.role === "student") {
  // Only assigned quizzes
  query.assignedClasses = req.user.meta.class;
} else if (req.user.role === "teacher") {
  // Only own quizzes
  query.createdByTeacherId = req.user._id;
}
```

### Meeting Controller Updates

```typescript
// Meeting responses (standardize format)
POST /api/meeting → {meeting: {...}}
GET /api/meeting → {meetings: [...]}
GET /api/meeting/:id → {meeting: {...}}

// Add role-based filtering
if (req.user.role === "teacher") {
  // Only meetings user created
  query.createdByTeacherId = req.user._id;
} else if (req.user.role === "student" || req.user.role === "parent") {
  // Only meetings for student's class
  query.assignedClasses = req.user.meta.class;
}
```

### Controllers to Update

- ✅ Quiz: getQuizzes, createQuiz, getQuizById
- ✅ Meeting: getMeetings, createMeeting, getMeetingById
- ⏳ Instruction: getInstructions, createInstruction
- ⏳ Event: getEvents, createEvent
- ⏳ Enquiry: getEnquiries, createEnquiry
- ⏳ Announcement: getAnnouncements, createAnnouncement

---

## 3.5 Implement Notification System Foundation

**Duration**: ~20 minutes  
**Files**: `backend/src/utils/notification.ts`, `backend/src/models/Notification.ts`

### Notification Utility

```typescript
// backend/src/utils/notification.ts
export async function sendNotification(
  recipientId: string,
  event: 'homework_assigned' | 'grade_posted' | 'meeting_scheduled' | 'attendance_marked',
  data: Record<string, any>
) {
  const notification = new Notification({
    recipientId,
    event,
    data,
    read: false,
    createdAt: new Date()
  });
  
  await notification.save();
  
  // Future: Send email/SMS based on preference
  // await sendEmail(recipient, subject, message);
}
```

### Notification Events

```typescript
// After homework is created
await sendNotification(student._id, 'homework_assigned', {
  subject: homework.subject,
  dueDate: homework.dueDate
});

// After score is recorded
await sendNotification(student._id, 'grade_posted', {
  subject: score.subject,
  marks: score.marks
});

// After meeting is scheduled
await sendNotification(parent._id, 'meeting_scheduled', {
  date: meeting.date,
  topic: meeting.topic
});
```

### API Endpoints (Future)

```
GET /api/notifications → {notifications: [...]}
PATCH /api/notifications/:id/read → {ok: true}
DELETE /api/notifications/:id → {ok: true}
```

---

## Testing Phase 3 Completion

### Seed Script Testing

```bash
# Clear and reseed
npm run seed:all

# Verify counts
mongosh family_hub
db.users.count()          # 23
db.homework.count()       # 20
db.attendance.count()     # 50
db.scores.count()         # 30
```

### Performance Testing

```bash
# Before indexes
curl http://localhost:5000/api/homework?className=10-A
# Response time: ~250ms

# After indexes
curl http://localhost:5000/api/homework?className=10-A
# Response time: ~25ms
```

### Endpoint Testing

```bash
# Test new homework status endpoint
curl -H "Authorization: Bearer {token}" \
  http://localhost:5000/api/homework/student/all
# Should return: {homeworks: [...]}

# Test quiz filtering
curl -H "Authorization: Bearer {token}" \
  http://localhost:5000/api/quiz
# Should return: {quizzes: [...]} (filtered by role)

# Test meeting scheduling
curl -X POST http://localhost:5000/api/meeting \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-01-20", "topic": "Progress Review"}'
# Should return: {meeting: {...}}
```

---

## Completion Checklist for Phase 3

- [ ] Seed script created and tested (5.1)
- [ ] All database indexes added (5.2)
- [ ] Homework student endpoint working (5.3)
- [ ] Quiz controller standardized with RBAC (5.4)
- [ ] Meeting controller standardized with RBAC (5.4)
- [ ] Notification system foundation created (5.5)
- [ ] All 6 controllers updated for standard response format (5.4)
- [ ] Database performance verified <100ms queries
- [ ] Seed data verified: 147+ records created
- [ ] Git committed: "Phase 3: Data Quality & Features Complete"

---

## Phase 3 → Phase 4 Transition

Once Phase 3 complete:

**Phase 4 Tasks**:
1. Complete API.md with endpoint examples (all 50+ endpoints)
2. Write unit tests: auth, controllers, utilities
3. Final ARCHITECTURE.md Polish
4. Update CHANGELOG with all changes
5. Final documentation review

**Estimated Combined Time**: 8-11 hours total  
**Current Progress**: 2-3 hours (Phases 1-2 + Doc framework)  
**Remaining**: 5-8 hours (Phases 3-4)

