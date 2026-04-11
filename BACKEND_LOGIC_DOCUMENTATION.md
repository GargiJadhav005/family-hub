# Family Hub - Backend Logic Documentation

## Table of Contents
1. [System Overview](#1-system-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Data Models](#3-data-models)
4. [Module-by-Module Analysis](#4-module-by-module-analysis)
5. [Issues & Missing Logic](#5-issues--missing-logic)
6. [Recommendations](#6-recommendations)

---

## 1. System Overview

### Architecture
- **Backend**: Express.js + TypeScript + MongoDB (Mongoose)
- **Authentication**: JWT-based with role-based access control (RBAC)
- **API Base**: `/api/*` endpoints

### API Routes Summary
| Route Base | Purpose |
|------------|---------|
| `/api/auth` | Authentication (login, me) |
| `/api/students` | Student management |
| `/api/teacher` | Teacher-specific actions (enroll) |
| `/api/homework` | Homework CRUD + status |
| `/api/attendance` | Attendance marking/viewing |
| `/api/scores` | Test scores management |
| `/api/events` | Events/notices |
| `/api/meetings` | Parent-teacher meetings |
| `/api/instructions` | Teacher instructions to students |
| `/api/quizzes` | Quiz management + submissions |
| `/api/admin` | Admin dashboard + user management |
| `/api/enquiry` | Public enquiry form |
| `/api/notifications` | User notifications |
| `/api/report-cards` | Report card generation |

---

## 2. User Roles & Permissions

### Role Definitions
| Role | Description |
|------|-------------|
| `admin` | Full system access, user management |
| `teacher` | Class management, student data, homework, scores |
| `parent` | View child's data, meetings, instructions |
| `student` | View own data, submit homework/quizzes |

### Role-Based Data Access Matrix

| Module | Admin | Teacher | Parent | Student |
|--------|-------|---------|--------|---------|
| **Students** | All | Own class only | Own children | Own record |
| **Homework** | All | Own created | Children's class | Own class |
| **Attendance** | All | Own class | Own children | Own record |
| **Scores** | All | Own class | Own children | Own record |
| **Events** | CRUD | CRUD | View (audience-based) | View (audience-based) |
| **Meetings** | View all | Own class | Own children | N/A |
| **Instructions** | View all | Create/view own class | View for children | N/A |
| **Quizzes** | All | Create/view results | N/A | Take quiz, view own results |
| **Report Cards** | All | Generate/view class | View children | View own |
| **Users** | CRUD | N/A | N/A | N/A |
| **Enquiries** | Respond | N/A | N/A | N/A |
| **Announcements** | Create | N/A | View | View |

---

## 3. Data Models

### 3.1 User Model
```typescript
{
  name: String (required),
  email: String (required, unique per role),
  passwordHash: String (required),
  role: "teacher" | "parent" | "student" | "admin",
  avatar: String | null,
  meta: Map<String, String> {
    // Teacher: { class: "5A" }
    // Student: { class: "5A", roll: "01" }
    // Parent: { child: "Student Name", class: "5A" }
  },
  isActive: Boolean (default: true)
}
// Index: { email: 1, role: 1 } (unique)
```

### 3.2 Student Model
```typescript
{
  name: String,
  roll: String,
  className: String,
  parentName: String,
  studentEmail: String (unique),
  parentEmail: String,
  studentUserId: ObjectId -> User,
  parentUserId: ObjectId -> User,
  createdByTeacherId: ObjectId -> User
}
```

### 3.3 Homework Model
```typescript
{
  subject: String,
  title: String,
  description: String,
  dueDate: String | null,
  className: String,
  section: String | null,
  createdByTeacherId: ObjectId -> User
}
```

### 3.4 HomeworkStatus Model
```typescript
{
  homeworkId: ObjectId -> Homework,
  studentId: ObjectId -> Student,
  status: "pending" | "in_progress" | "submitted" | "completed" | "late",
  submissionText: String | null,
  attachments: String[],
  feedback: String | null,
  gradedBy: ObjectId -> User | null,
  gradedAt: Date | null,
  submittedAt: Date | null,
  isLate: Boolean,
  notified: Boolean
}
// Pre-save: Auto-detects late submissions
```

### 3.5 Attendance Model
```typescript
{
  studentId: ObjectId -> Student,
  className: String,
  date: Date,
  status: "present" | "absent" | "late",
  markedByTeacherId: ObjectId -> User,
  notes: String | null,
  notified: Boolean
}
// Index: { studentId: 1, date: 1 } (unique)
// Pre-save: Normalizes date (removes time)
```

### 3.6 Score Model
```typescript
{
  studentId: ObjectId -> Student,
  subject: String,
  testName: String,
  scorePercent: Number (0-100),
  grade: String,
  date: String
}
```

### 3.7 Event Model
```typescript
{
  title: String,
  description: String,
  date: Date,
  endDate: Date | null,
  type: "notice" | "event",
  icon: String,
  targetAudience: "all" | "students" | "parents" | "teachers",
  targetClasses: String[],
  location: String | null,
  priority: "low" | "medium" | "high",
  createdBy: ObjectId -> User,
  isActive: Boolean,
  isNotified: Boolean
}
```

### 3.8 Meeting Model
```typescript
{
  teacherId: ObjectId -> User,
  teacherName: String,
  parentId: ObjectId -> User,
  studentId: ObjectId -> Student,
  studentName: String,
  date: Date,
  timeLabel: String,
  mode: "प्रत्यक्ष" | "ऑनलाइन",
  status: "नियोजित" | "पूर्ण" | "रद्द",
  notes: String
}
```

### 3.9 Instruction Model
```typescript
{
  teacherId: ObjectId -> User,
  teacherName: String,
  studentId: ObjectId -> Student,
  message: String
}
```

### 3.10 Quiz & QuizResult Models
```typescript
// Quiz
{
  title: String,
  subject: String,
  className: String,
  icon: String,
  questions: [{
    question: String,
    options: String[],
    correctIndex: Number
  }],
  dueDate: Date | null,
  createdByTeacherId: ObjectId -> User
}

// QuizResult
{
  quizId: ObjectId -> Quiz,
  studentId: ObjectId -> Student,
  answers: Number[],
  score: Number,
  total: Number,
  completedAt: Date
}
```

### 3.11 ReportCard Model
```typescript
{
  studentId: ObjectId -> Student,
  className: String,
  academicYear: String,
  term: "सत्र १" | "सत्र २" | "वार्षिक",
  subjectGrades: [{
    subject: String,
    grade: String,
    scorePercent: Number,
    effort: "उत्कृष्ट" | "चांगले" | "समाधानकारक" | "सुधारणा आवश्यक",
    remark: String
  }],
  attendanceSummary: {
    totalDays, presentDays, absentDays, lateDays
  },
  homeworkCompletion: { total, completed },
  overallGrade: String,
  overallPercent: Number,
  teacherComment: String,
  generatedByTeacherId: ObjectId -> User
}
// Index: { studentId: 1, academicYear: 1, term: 1 } (unique)
```

### 3.12 Notification Model
```typescript
{
  userId: ObjectId -> User,
  event: "homework_uploaded" | "quiz_created" | "new_announcement" | 
         "attendance_marked" | "meeting_scheduled" | "new_enquiry" | "new_user_created",
  title: String,
  message: String,
  relatedId: ObjectId | null,
  relatedModel: String | null,
  isRead: Boolean
}
```

### 3.13 Enquiry Model
```typescript
{
  name: String,
  email: String,
  phone: String,
  message: String,
  status: "new" | "read" | "responded",
  priority: "low" | "medium" | "high",
  response: String | null,
  respondedBy: ObjectId -> User | null,
  respondedAt: Date | null,
  forwardedToEmail: String | null,
  isForwarded: Boolean
}
// Pre-save: Auto-detects urgent messages and sets priority
```

### 3.14 Announcement Model
```typescript
{
  title: String,
  content: String,
  audience: "all" | "teachers" | "students" | "parents",
  targetClasses: String[],
  createdBy: ObjectId -> User,
  priority: "low" | "medium" | "high",
  isActive: Boolean,
  expiresAt: Date | null
}
```

---

## 4. Module-by-Module Analysis

### 4.1 Authentication Module

#### Current Flow
```
POST /api/auth/login
├── Validate: email, password, role (optional)
├── Find user by email
├── Check role match (if provided)
├── Check isActive status
├── Compare password hash
├── Generate JWT token (7d expiry)
└── Return: { user, token }

GET /api/auth/me
├── Verify JWT from Authorization header or cookie
├── Fetch fresh user data
├── Check isActive status
└── Return: { user }
```

#### Data Flow Diagram
```
Client → Login Request → authController.login()
                              ↓
                         Zod Validation
                              ↓
                         User.findOne({ email })
                              ↓
                         bcrypt.compare()
                              ↓
                         jwt.sign() → Token
                              ↓
                         Response: { user, token }
```

#### Issues Identified
| Issue | Severity | Description |
|-------|----------|-------------|
| No password reset | HIGH | Missing forgot password functionality |
| No registration | MEDIUM | Only admin can create users |
| No session management | LOW | No logout/token revocation |
| No refresh token | MEDIUM | Users must re-login after token expires |

---

### 4.2 Student Management Module

#### Current Flow
```
GET /api/students
├── Auth check
├── Role-based filtering:
│   ├── Teacher → students in their class (via meta.class)
│   ├── Parent → students with matching parentUserId
│   ├── Student → only own record
│   └── Admin → all students
├── Additional filters: className, search
├── Pagination: page, limit
└── Return: { students, pagination }

GET /api/students/:id
├── Auth check
├── Access control by role
└── Return: { student }

PUT /api/students/:id (Teacher/Admin)
├── Access control: teacher only for own class
└── Update student data

DELETE /api/students/:id (Admin only)
└── Hard delete student record
```

#### Teacher Enrollment Flow
```
POST /api/teacher/enroll
├── Validate: name, parentName, className
├── Auto-generate:
│   ├── Sequential roll number
│   ├── Student email: {name}.{timestamp}@school.edu
│   ├── Parent email: parent.{name}.{timestamp}@school.edu
│   ├── Random passwords
├── Create User records (student + parent)
├── Create Student record
└── Return: credentials (one-time display)
```

#### Issues Identified
| Issue | Severity | Description |
|-------|----------|-------------|
| No bulk enrollment | MEDIUM | Teachers must enroll one-by-one |
| Credentials display once | HIGH | If lost, no way to recover |
| No student transfer | MEDIUM | Cannot move student between classes |
| Hard delete only | HIGH | No soft delete, cascading delete missing |
| No email uniqueness validation | HIGH | Same email could exist across roles |

---

### 4.3 Homework Module

#### Current Flow
```
GET /api/homework
├── Teacher → own created homework
├── Student → homework for their class
├── Parent → homework for children's classes
└── Return: { homework, pagination }

POST /api/homework (Teacher only)
├── Validate: subject, title, description, className
├── Create homework
└── Return: { homework }

PATCH /api/homework/:id/status
├── Student → auto-resolve studentId
├── Upsert HomeworkStatus record
└── Return: { homeworkId, studentId, status }

GET /api/homework/student/all (Student only)
├── Get all homework for student's class
├── Join with HomeworkStatus
└── Return: { homeworks } with status
```

#### Issues Identified
| Issue | Severity | Description |
|-------|----------|-------------|
| No submission upload | HIGH | submissionText/attachments not implemented |
| No teacher feedback flow | HIGH | feedback/gradedBy never set |
| No notification on new homework | HIGH | `notified` field unused |
| Parent cannot view child's status | MEDIUM | No endpoint for parent |
| No homework edit/delete | MEDIUM | Once created, cannot modify |
| Status validation incomplete | MEDIUM | "submitted" status never triggers notification |

---

### 4.4 Attendance Module

#### Current Flow
```
GET /api/attendance?date=YYYY-MM-DD
├── Teacher → own class
├── Parent → own children
├── Student → own record
└── Return: { attendance, pagination }

POST /api/attendance (Teacher only)
├── Validate: date, records [{studentId, status}]
├── Verify students belong to teacher's class
├── Bulk upsert via bulkWrite
└── Return: { ok, recordsCount }
```

#### Issues Identified
| Issue | Severity | Description |
|-------|----------|-------------|
| No notification to parent | HIGH | `notified` field unused |
| Date filtering uses string | LOW | Should use Date range query |
| No attendance edit | MEDIUM | Can only overwrite same date |
| No monthly summary endpoint | MEDIUM | No aggregation API |
| Admin cannot view all | LOW | No admin filter logic |

---

### 4.5 Scores Module

#### Current Flow
```
GET /api/scores
├── Teacher → own class students
├── Student → auto-resolve to Student._id
├── Parent → children's scores
└── Return: { scores }

POST /api/scores (Teacher only)
├── Validate: studentId, subject, testName, scorePercent, grade, date
├── Verify student in teacher's class
└── Return: { score }
```

#### Issues Identified
| Issue | Severity | Description |
|-------|----------|-------------|
| No score edit/delete | MEDIUM | Cannot correct mistakes |
| No bulk score entry | MEDIUM | Must enter one-by-one |
| No notification | LOW | Parent not notified of new scores |
| Grade auto-calculation missing | LOW | Teacher must manually enter grade |

---

### 4.6 Events Module

#### Current Flow
```
GET /api/events
├── Filter by type, audience
├── Public (no auth required)
└── Return: { events, pagination }

POST /api/events (Teacher/Admin)
├── Create event
├── Send notifications to target audience
└── Return: { event }

DELETE /api/events/:id (Teacher/Admin)
└── Hard delete
```

#### Issues Identified
| Issue | Severity | Description |
|-------|----------|-------------|
| Model uses `createdByTeacherId` but controller uses `createdBy` | HIGH | Field mismatch |
| Events are public | MEDIUM | Should require auth for some |
| No event edit | MEDIUM | Cannot update events |
| targetClasses filter not implemented | MEDIUM | Always shows to all of audience |

---

### 4.7 Meetings Module

#### Current Flow
```
GET /api/meetings
├── Teacher → own meetings
├── Parent → children's meetings
├── Admin → all meetings
└── Return: { meetings }

POST /api/meetings (Teacher/Admin)
├── Validate: studentId, date, timeLabel, mode
├── Auto-set: studentName, teacherName, parentId
└── Return: { meeting }

PATCH /api/meetings/:id/status
├── Update status
└── Return: { meeting }
```

#### Issues Identified
| Issue | Severity | Description |
|-------|----------|-------------|
| No notification on schedule | HIGH | Commented out in code |
| Parent cannot request meeting | MEDIUM | Only teacher can create |
| No conflict detection | MEDIUM | Can double-book same time |
| No meeting edit | LOW | Cannot change time/date |

---

### 4.8 Instructions Module

#### Current Flow
```
GET /api/instructions
├── Teacher → own class students
├── Parent → children's instructions
├── Admin → all instructions
└── Return: { instructions }

POST /api/instructions (Teacher/Admin)
├── Validate: studentId, message
├── Verify student in class
└── Return: { instruction }
```

#### Issues Identified
| Issue | Severity | Description |
|-------|----------|-------------|
| No notification | HIGH | Commented out in code |
| No read receipt | MEDIUM | Parent doesn't mark as read |
| No instruction delete | LOW | Cannot remove old instructions |
| Student cannot view | MEDIUM | Only parent can see |

---

### 4.9 Quiz Module

#### Current Flow
```
GET /api/quizzes
├── Student → own class quizzes
├── Others → all/filtered
└── Return: { quizzes }

POST /api/quizzes (Auth required)
├── Create quiz with questions
└── Return: { quiz }

GET /api/quizzes/:id
├── Strip correctIndex for students
└── Return: { quiz }

POST /api/quizzes/:id/submit (Student)
├── Calculate score
├── Upsert QuizResult
└── Return: { result, score, total }

GET /api/quizzes/:id/results (Teacher)
└── Return: { results }
```

#### Issues Identified
| Issue | Severity | Description |
|-------|----------|-------------|
| No teacher role check on create | HIGH | Any authenticated user can create |
| No notification | MEDIUM | Students not notified of new quiz |
| No quiz edit/delete | MEDIUM | Cannot modify after creation |
| No due date enforcement | LOW | Students can submit anytime |

---

### 4.10 Report Card Module

#### Current Flow
```
GET /api/report-cards
├── Role-based filtering
└── Return: { reportCards }

POST /api/report-cards/save (Teacher)
├── Manual subject grades input
├── Calculate overallPercent, overallGrade
├── Upsert report card
└── Return: { reportCard }

POST /api/report-cards/generate/:studentId (Teacher)
├── Aggregate from Score collection
├── Auto-calculate grades
└── Return: { reportCard }

POST /api/report-cards/generate-all (Teacher)
├── Generate for entire class
└── Return: { reportCards, total }

GET /api/report-cards/:studentId
├── Access control
├── Fallback: build from scores if no saved card
└── Return: { reportCard }
```

#### Issues Identified
| Issue | Severity | Description |
|-------|----------|-------------|
| `attendanceSummary` not calculated | HIGH | Always empty in generation |
| `homeworkCompletion` not calculated | HIGH | Always empty in generation |
| No notification | MEDIUM | Parent not notified when ready |
| No PDF export | LOW | View only, no download |

---

### 4.11 Admin Module

#### Current Flow
```
GET /api/admin/dashboard
└── Return: { totalUsers, teachers, students, parents, newEnquiries, announcements }

GET /api/admin/users
├── Filter: role, isActive
├── Pagination
└── Return: { users, total, page, limit }

POST /api/admin/users
├── Generate random password
├── Create user with notification
├── Send email (async)
└── Return: { user, temporaryPassword (dev only) }

PATCH /api/admin/users/:userId
├── Update user fields
└── Return: { user }

DELETE /api/admin/users/:userId
├── Prevent self-deletion
└── Hard delete

POST /api/admin/announcements
├── Create announcement
├── Notify target audience
└── Return: { announcement }

GET /api/admin/enquiries
└── Return: { enquiries }

PATCH /api/admin/enquiries/:enquiryId/respond
├── Update status to "responded"
├── Send email response
└── Return: { enquiry }
```

#### Issues Identified
| Issue | Severity | Description |
|-------|----------|-------------|
| No cascading delete | HIGH | Deleting user doesn't clean related data |
| No password reset for users | HIGH | Admin cannot reset user password |
| Announcement audience bug | MEDIUM | `audience.slice(0, -1)` fails for some values |
| No user activity logs | LOW | No audit trail |
| No teacher assignment | MEDIUM | Cannot change teacher's class |

---

### 4.12 Notification Module

#### Current Flow
```
GET /api/notifications
├── Pagination
└── Return: { notifications, pagination, unreadCount }

GET /api/notifications/unread
└── Return: { notifications }

PATCH /api/notifications/:id/read
└── Mark as read

PATCH /api/notifications/mark-all-read
└── Mark all as read

DELETE /api/notifications/:id
DELETE /api/notifications/delete-all
```

#### Issues Identified
| Issue | Severity | Description |
|-------|----------|-------------|
| Field mismatch: `recipientId` vs `userId` | CRITICAL | Model uses `userId`, controller uses `recipientId` |
| Field mismatch: `read` vs `isRead` | CRITICAL | Model uses `isRead`, controller uses `read` |
| No real-time push | LOW | Polling only, no WebSocket |

---

### 4.13 Enquiry Module

#### Current Flow
```
POST /api/enquiry (Public)
├── Validate: name, email, phone, message
├── Create enquiry
├── Send email to school
├── Notify all admins
└── Return: { enquiry }

GET /api/enquiry/:enquiryId (Public)
└── Return: { status, response }
```

#### Issues Identified
| Issue | Severity | Description |
|-------|----------|-------------|
| Email sending fails silently | MEDIUM | Errors just logged |
| Phone validation too strict | LOW | Only 10 digits, no country code |

---

## 5. Issues & Missing Logic

### 5.1 CRITICAL Issues (Must Fix)

| # | Module | Issue | Impact |
|---|--------|-------|--------|
| 1 | Notification | Field names mismatch (`recipientId` vs `userId`, `read` vs `isRead`) | Notifications completely broken |
| 2 | Event | Controller uses `createdByTeacherId`, model uses `createdBy` | Events may not save correctly |
| 3 | Student Delete | No cascading delete | Orphaned homework status, attendance, scores |
| 4 | Homework | Submission flow not implemented | Core feature missing |

### 5.2 HIGH Priority Issues

| # | Module | Issue |
|---|--------|-------|
| 1 | Auth | No password reset/forgot password |
| 2 | Enrollment | Credentials shown once, no recovery |
| 3 | Notifications | Not sent for homework, quiz, attendance, meetings |
| 4 | Report Card | Attendance/homework summaries not calculated |
| 5 | Quiz | No role check on creation |

### 5.3 MEDIUM Priority Issues

| # | Module | Issue |
|---|--------|-------|
| 1 | All | No edit/update functionality for most entities |
| 2 | Admin | Announcement audience parsing bug |
| 3 | Homework | Parent cannot view child's homework status |
| 4 | Attendance | No monthly summary API |
| 5 | Meeting | No conflict detection |
| 6 | Meeting | Parent cannot request meetings |

### 5.4 Missing Features

| Feature | Description |
|---------|-------------|
| Password Reset | Forgot password flow |
| Bulk Operations | Bulk enrollment, score entry, etc. |
| File Upload | Homework submissions, attachments |
| Real-time Notifications | WebSocket/SSE for live updates |
| Audit Logging | Track admin actions |
| Export/Reports | PDF export for report cards |
| SMS Notifications | Integration with SMS gateway |
| Student Transfer | Move student between classes |

---

## 6. Recommendations

### 6.1 Immediate Fixes Required

1. **Fix Notification Controller**
   - Change `recipientId` → `userId`
   - Change `read` → `isRead`

2. **Fix Event Controller**
   - Change `createdByTeacherId` → `createdBy`

3. **Implement Cascading Deletes**
   - When Student deleted: remove HomeworkStatus, Attendance, Score, QuizResult
   - When User deleted: update related records

4. **Add Quiz Role Check**
   - Only teachers should create quizzes

### 6.2 Feature Implementation Priority

```
Phase 1 (Critical):
├── Fix notification field mismatches
├── Implement homework submission flow
├── Add cascading deletes
└── Fix event field naming

Phase 2 (High):
├── Add password reset
├── Implement actual notifications for all events
├── Complete report card generation (attendance + homework)
└── Add missing CRUD operations (edit, delete)

Phase 3 (Medium):
├── Bulk operations
├── Parent meeting requests
├── File uploads
└── Export functionality

Phase 4 (Enhancement):
├── Real-time notifications
├── SMS integration
├── Audit logging
└── Advanced analytics
```

### 6.3 Data Flow Corrections Needed

```
Current (Broken):
Teacher creates homework → No notification
Parent views dashboard → Cannot see homework status

Should Be:
Teacher creates homework 
  → Create HomeworkStatus for all class students
  → Send notification to students & parents
  → Update unread count

Parent views dashboard
  → Fetch child's HomeworkStatus
  → Display completion state
```

---

## Summary

The Family Hub backend has a solid foundation but suffers from several critical issues:

1. **Notification system is non-functional** due to field name mismatches
2. **Homework submission workflow is incomplete** - students can only update status, not submit work
3. **Missing cascading deletes** creates data integrity issues
4. **Most "notify" logic is commented out** - notifications are created but not sent
5. **Edit/Update operations missing** for most entities

The codebase follows good patterns (Zod validation, role-based access, pagination) but needs these gaps addressed before production use.
