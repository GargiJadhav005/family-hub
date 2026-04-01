# Family Hub - Complete API Documentation

## Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: Set via `VITE_API_URL` environment variable

## Authentication

All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <JWT_TOKEN>
```

### Login (Public)
Returns a JWT token and user information.

**Endpoint**: `POST /auth/login`

**Request**:
```json
{
  "email": "teacher@school.edu",
  "password": "password123",
  "role": "teacher"
}
```

**Response** (200):
```json
{
  "user": {
    "id": "user_id",
    "name": "John Teacher",
    "email": "teacher@school.edu",
    "role": "teacher",
    "avatar": null,
    "meta": {}
  },
  "token": "eyJhbGc..."
}
```

**Errors**:
- 400: Invalid input
- 401: Invalid credentials or role mismatch

---

### Get Current User
Validates and returns the authenticated user's profile.

**Endpoint**: `GET /auth/me` *(Protected)*

**Response** (200):
```json
{
  "user": {
    "id": "user_id",
    "name": "John Teacher",
    "email": "teacher@school.edu",
    "role": "teacher",
    "avatar": null,
    "meta": {}
  }
}
```

**Errors**:
- 401: No token or invalid token
- 404: User not found

---

## Students

### List Students
Get all enrolled students (accessible to authenticated users).

**Endpoint**: `GET /students` *(Protected)*

**Query Parameters**:
- `className` (optional): Filter by class name

**Response** (200):
```json
{
  "students": [
    {
      "id": "student_id",
      "name": "Arav Patil",
      "roll": "01",
      "class": "इयत्ता ४-ब",
      "parentName": "Ms. Patil",
      "studentEmail": "arav.patil@school.edu",
      "parentEmail": "parent.arav.patil@school.edu",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Errors**:
- 401: Unauthorized
- 500: Server error

---

### Get Student by ID
Get specific student details.

**Endpoint**: `GET /students/:id` *(Protected)*

**Response** (200):
```json
{
  "student": {
    "id": "student_id",
    "name": "Arav Patil",
    "roll": "01",
    "class": "इयत्ता ४-ब",
    "parentName": "Ms. Patil",
    "studentEmail": "arav.patil@school.edu",
    "parentEmail": "parent.arav.patil@school.edu"
  }
}
```

**Errors**:
- 401: Unauthorized
- 404: Student not found
- 500: Server error

---

## Teacher Routes

### Enroll Student
Create new student account with automatic parent account.

**Endpoint**: `POST /teacher/enroll` *(Protected - Teacher only)*

**Request**:
```json
{
  "name": "Arav Patil",
  "parentName": "Ms. Patil",
  "className": "इयत्ता ४-ब"
}
```

**Response** (201):
```json
{
  "student": {
    "id": "STU123ABC",
    "name": "Arav Patil",
    "roll": "01",
    "class": "इयत्ता ४-ब",
    "parentName": "Ms. Patil",
    "studentEmail": "arav.patil@school.edu",
    "studentPassword": "Pass1234",
    "parentEmail": "parent.arav.patil@school.edu",
    "parentPassword": "Pass5678",
    "studentUser": {...},
    "parentUser": {...}
  }
}
```

**Errors**:
- 403: Only teachers can enroll
- 400: Duplicate email or invalid input
- 500: Server error

---

## Homework

### List Homework
Get homework based on user role.
- **Teachers**: See their created homework
- **Students**: See homework for their class

**Endpoint**: `GET /homework` *(Protected)*

**Query Parameters**:
- `className` (optional): Filter by class

**Response** (200):
```json
{
  "homework": [
    {
      "id": "hw_id",
      "subject": "गणित",
      "title": "पाठ १ व्यायाम",
      "description": "पृष्ठ २०-२५ व्यायाम करा",
      "className": "इयत्ता ४-ब",
      "dueDate": "2024-01-20",
      "completed": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Create Homework *(Teacher only)*
Assign homework to a class.

**Endpoint**: `POST /homework` *(Protected - Teacher only)*

**Request**:
```json
{
  "subject": "गणित",
  "title": "पाठ १ व्यायाम",
  "description": "पृष्ठ २०-२५ व्यायाम करा",
  "className": "इयत्ता ४-ब",
  "dueDate": "2024-01-20"
}
```

**Response** (201):
```json
{
  "homework": {
    "id": "hw_id",
    "subject": "गणित",
    "title": "पाठ १ व्यायाम",
    "description": "पृष्ठ २०-२५ व्यायाम करा",
    "className": "इयत्ता ४-ब",
    "dueDate": "2024-01-20",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Errors**:
- 403: Only teachers can create
- 400: Invalid input (all fields required except dueDate)
- 500: Server error

---

### Update Homework Status
Mark homework as completed or in progress.

**Endpoint**: `PATCH /homework/:id/status` *(Protected)*

**Request**:
```json
{
  "status": "completed",
  "studentId": "student_id"
}
```

**Response** (200):
```json
{
  "homeworkId": "hw_id",
  "studentId": "student_id",
  "status": "completed",
  "updatedAt": "2024-01-18T15:45:00Z"
}
```

**Status Values**: `pending`, `in_progress`, `completed`

**Errors**:
- 400: Invalid status
- 500: Server error

---

## Attendance

### Get Attendance Records
Retrieve attendance for a specific date.

**Endpoint**: `GET /attendance` *(Protected)*

**Query Parameters**:
- `date` (optional): Format YYYY-MM-DD, defaults to today

**Response** (200):
```json
{
  "attendance": [
    {
      "id": "att_id",
      "studentId": "student_id",
      "studentName": "Arav Patil",
      "date": "2024-01-17",
      "status": "present"
    }
  ]
}
```

---

### Mark Attendance *(Teacher only)*
Record attendance for students.

**Endpoint**: `POST /attendance` *(Protected - Teacher only)*

**Request**:
```json
{
  "date": "2024-01-17",
  "records": [
    {
      "studentId": "student_id_1",
      "status": "present"
    },
    {
      "studentId": "student_id_2",
      "status": "absent"
    },
    {
      "studentId": "student_id_3",
      "status": "late"
    }
  ]
}
```

**Response** (200):
```json
{
  "ok": true,
  "message": "Attendance marked for 3 students on 2024-01-17",
  "recordsCount": 3
}
```

**Status Values**: `present`, `absent`, `late`

**Errors**:
- 403: Only teachers can mark
- 400: Invalid input or student IDs don't exist
- 500: Server error

---

## Scores

### Get Scores
Retrieve scores based on user role.
- **Teachers**: All student scores
- **Students**: Their own scores

**Endpoint**: `GET /scores` *(Protected)*

**Query Parameters**:
- `studentId` (optional): Filter by student
- `className` (optional): Filter by class

**Response** (200):
```json
{
  "scores": [
    {
      "id": "score_id",
      "studentId": "student_id",
      "studentName": "Arav Patil",
      "subject": "गणित",
      "title": "पाठ १ चाचणी",
      "score": 85,
      "total": 100,
      "grade": "A",
      "date": "2024-01-15"
    }
  ]
}
```

---

### Add Score *(Teacher only)*
Record a student's score.

**Endpoint**: `POST /scores` *(Protected - Teacher only)*

**Request**:
```json
{
  "studentId": "student_id",
  "subject": "गणित",
  "testName": "पाठ १ चाचणी",
  "scorePercent": 85,
  "grade": "A",
  "date": "2024-01-15"
}
```

**Response** (201):
```json
{
  "score": {
    "id": "score_id",
    "studentId": "student_id",
    "subject": "गणित",
    "testName": "पाठ १ चाचणी",
    "scorePercent": 85,
    "grade": "A",
    "date": "2024-01-15"
  }
}
```

**Errors**:
- 403: Only teachers can add
- 400: Invalid input
- 500: Server error

---

## Quizzes

### List Quizzes
Get available quizzes.

**Endpoint**: `GET /quizzes` *(Protected)*

**Response** (200):
```json
{
  "quizzes": [
    {
      "id": "quiz_id",
      "title": "गणित क्विझ १",
      "subject": "गणित",
      "className": "इयत्ता ४-ब",
      "icon": "📝",
      "questions": [
        {
          "question": "२+२ = ?",
          "options": ["२", "३", "४", "५"],
          "correctIndex": 2
        }
      ],
      "dueDate": "2024-01-20",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Create Quiz *(Teacher only)*
Create a new quiz.

**Endpoint**: `POST /quizzes` *(Protected - Teacher only)*

**Request**:
```json
{
  "title": "गणित क्विझ २",
  "subject": "गणित",
  "className": "इयत्ता ४-ब",
  "icon": "📝",
  "questions": [
    {
      "question": "२+२ = ?",
      "options": ["२", "३", "४", "५"],
      "correctIndex": 2
    }
  ],
  "dueDate": "2024-01-20T23:59:59Z"
}
```

---

## Admin Routes *(Admin only)*

### Get Dashboard
System overview with statistics.

**Endpoint**: `GET /admin/dashboard` *(Protected - Admin only)*

**Response** (200):
```json
{
  "totalUsers": 50,
  "teachers": 5,
  "students": 30,
  "parents": 15,
  "newEnquiries": 2,
  "totalAnnouncements": 12,
  "timestamp": "2024-01-17T12:30:00Z"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes
- **200** OK: Successful GET/PATCH
- **201** Created: Successful POST (resource created)
- **400** Bad Request: Invalid input data
- **401** Unauthorized: Missing or invalid token
- **403** Forbidden: User doesn't have permission
- **404** Not Found: Resource not found
- **500** Internal Server Error: Server error

---

## Response Format Standards

### Single Resource
```json
{
  "student": { /* resource data */ }
}
```

### Multiple Resources
```json
{
  "students": [ /* array of resources */ ]
}
```

### Action Results
```json
{
  "ok": true,
  "message": "Action completed",
  "recordsCount": 5
}
```

---

## Rate Limiting
Currently no rate limiting enabled. Recommended for production:
- 100 requests per minute per IP
- 1000 requests per hour per authenticated user

---

## Support & Troubleshooting

See [TROUBLESHOOTING.md](../TROUBLESHOOTING.md) for common issues and solutions.
