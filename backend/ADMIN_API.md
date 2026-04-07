# Admin & Enquiry System API Documentation

## Overview

This document describes the Admin Module and Enquiry System endpoints added to the Family Hub backend.

---

## Admin Module

### Admin Authentication

All admin endpoints require:
- **Authentication**: Valid JWT token
- **Role**: `admin`

**Admin Credentials (Initial)**:
- Email: `admin@google.com`
- Password: `Admin@123`

### Endpoints

#### 1. Admin Dashboard
```
GET /api/admin/dashboard
```
Get system overview with user and enquiry statistics.

**Response**:
```json
{
  "totalUsers": 50,
  "teachers": 10,
  "students": 25,
  "parents": 14,
  "newEnquiries": 3,
  "totalAnnouncements": 5,
  "timestamp": "2026-04-01T10:30:00.000Z"
}
```

#### 2. Get All Users
```
GET /api/admin/users?role=teacher&isActive=true
```

**Query Parameters**:
- `role` (optional): `teacher`, `student`, `parent`
- `isActive` (optional): `true` or `false`

**Response**:
```json
{
  "total": 10,
  "users": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@school.edu",
      "role": "teacher",
      "avatar": null,
      "meta": {}
    }
  ]
}
```

#### 3. Create User (Teacher/Student/Parent)
```
POST /api/admin/users
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@school.edu",
  "role": "teacher"
}
```

**Required Fields**:
- `name`: String (required)
- `email`: Valid email (required)
- `role`: `teacher`, `student`, or `parent` (required)

**Response** (201 Created):
```json
{
  "message": "User created successfully",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "name": "Jane Smith",
    "email": "jane@school.edu",
    "role": "teacher",
    "avatar": null,
    "meta": {}
  },
  "temporaryPassword": "aBcD1234!@#$"
}
```

**Important**: The temporary password is shown only once. The email is sent to the user with their credentials.

#### 4. Get User by ID
```
GET /api/admin/users/:userId
```

**Response**:
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@school.edu",
    "role": "teacher",
    "avatar": null,
    "meta": {}
  }
}
```

#### 5. Update User
```
PATCH /api/admin/users/:userId
Content-Type: application/json

{
  "name": "John Smith",
  "isActive": true
}
```

**Updateable Fields**:
- `name`: String
- `email`: Valid email
- `isActive`: Boolean

#### 6. Delete User
```
DELETE /api/admin/users/:userId
```

**Response**:
```json
{
  "message": "User deleted successfully"
}
```

---

## Announcements

#### 1. Create Announcement
```
POST /api/admin/announcements
Content-Type: application/json

{
  "title": "School Closure",
  "content": "School will be closed on April 15th for maintenance",
  "audience": "all",
  "priority": "high"
}
```

**Fields**:
- `title`: String (required)
- `content`: String (required)
- `audience`: `all`, `teachers`, `students`, or `parents`
- `priority` (optional): `low`, `medium`, or `high` (default: `medium`)

**Response** (201 Created):
```json
{
  "message": "Announcement created successfully",
  "announcement": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "School Closure",
    "content": "School will be closed on April 15th for maintenance",
    "audience": "all",
    "priority": "high",
    "createdBy": "507f1f77bcf86cd799439010",
    "isActive": true,
    "createdAt": "2026-04-01T10:30:00.000Z",
    "updatedAt": "2026-04-01T10:30:00.000Z"
  }
}
```

#### 2. Get All Announcements
```
GET /api/admin/announcements
```

**Response**:
```json
{
  "announcements": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "School Closure",
      "content": "School will be closed on April 15th...",
      "audience": "all",
      "priority": "high",
      "createdBy": {
        "id": "507f1f77bcf86cd799439010",
        "name": "Admin User",
        "email": "admin@google.com"
      },
      "isActive": true,
      "createdAt": "2026-04-01T10:30:00.000Z"
    }
  ]
}
```

---

## Enquiry System

### Public Enquiry Submission

#### 1. Submit Enquiry (Public Endpoint)
```
POST /api/enquiry
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john@example.com",
  "phone": "1234567890",
  "message": "I am interested in enrolling my child in your school."
}
```

**Fields**:
- `name`: String, minimum 1 character (required)
- `email`: Valid email (required)
- `phone`: String, minimum 10 characters (required)
- `message`: String, minimum 10 characters (required)

**Response** (201 Created):
```json
{
  "message": "Enquiry submitted successfully. We will get back to you soon.",
  "enquiry": {
    "id": "507f1f77bcf86cd799439014",
    "name": "John Smith",
    "email": "john@example.com",
    "status": "new",
    "createdAt": "2026-04-01T10:30:00.000Z"
  }
}
```

#### 2. Get Enquiry Status (Public)
```
GET /api/enquiry/:enquiryId
```

**Response**:
```json
{
  "id": "507f1f77bcf86cd799439014",
  "status": "responded",
  "response": "Thank you for your enquiry. Our admission team will contact you shortly.",
  "respondedAt": "2026-04-01T10:45:00.000Z",
  "createdAt": "2026-04-01T10:30:00.000Z"
}
```

---

### Admin Enquiry Management

#### 1. Get All Enquiries
```
GET /api/admin/enquiries?status=new
```

**Query Parameters**:
- `status` (optional): `new`, `read`, or `responded`

**Response**:
```json
{
  "total": 5,
  "enquiries": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "John Smith",
      "email": "john@example.com",
      "phone": "1234567890",
      "message": "I am interested in enrolling my child...",
      "status": "new",
      "response": null,
      "respondedBy": null,
      "respondedAt": null,
      "createdAt": "2026-04-01T10:30:00.000Z",
      "updatedAt": "2026-04-01T10:30:00.000Z"
    }
  ]
}
```

#### 2. Mark Enquiry as Read
```
PATCH /api/admin/enquiries/:enquiryId/mark-read
```

**Response**:
```json
{
  "enquiry": {
    "_id": "507f1f77bcf86cd799439014",
    "status": "read",
    ...
  }
}
```

#### 3. Respond to Enquiry
```
PATCH /api/admin/enquiries/:enquiryId/respond
Content-Type: application/json

{
  "response": "Thank you for your enquiry. Our admission team will contact you shortly."
}
```

**Response**:
```json
{
  "message": "Enquiry responded successfully",
  "enquiry": {
    "_id": "507f1f77bcf86cd799439014",
    "status": "responded",
    "response": "Thank you for your enquiry. Our admission team will contact you shortly.",
    "respondedBy": "507f1f77bcf86cd799439010",
    "respondedAt": "2026-04-01T10:45:00.000Z",
    ...
  }
}
```

---

## Database Models

### User Model
```typescript
{
  name: string;
  email: string (unique);
  passwordHash: string;
  role: "teacher" | "student" | "parent" | "admin";
  avatar?: string;
  meta?: Map<string, string>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Enquiry Model
```typescript
{
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "new" | "read" | "responded";
  response?: string;
  respondedBy?: ObjectId (User);
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Announcement Model
```typescript
{
  title: string;
  content: string;
  audience: "all" | "teachers" | "students" | "parents";
  createdBy: ObjectId (User);
  priority: "low" | "medium" | "high";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Notification Model
```typescript
{
  userId: ObjectId (User);
  event: string;
  title: string;
  message: string;
  relatedId?: ObjectId;
  relatedModel?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Setup Instructions

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Email Service (NodeMailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# School Email for Enquiries
SCHOOL_EMAIL=admin@yourschool.edu
```

### 2. Install Dependencies

```bash
cd backend
npm install
# or
bun install
```

### 3. Create Admin User

```bash
npm run seed:admin
# or
bun run seed:admin
```

This creates:
- **Email**: `admin@google.com`
- **Password**: `Admin@123`

### 4. Start the Server

```bash
npm run dev
# or
bun run dev
```

---

## Email Configuration Guide

### Using Gmail

1. Enable 2-step verification: https://accounts.google.com
2. Generate app password: https://myaccount.google.com/apppasswords
3. Set environment variables:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=<app-password-from-step-2>
   ```

### Using Other Email Services

Configure SMTP details for your email provider:
- SES (AWS)
- SendGrid
- Mailgun
- etc.

---

## Error Handling

All endpoints return appropriate HTTP status codes:

| Status | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Server Error |

**Error Response Format**:
```json
{
  "error": "Error message",
  "details": [] // (optional) for validation errors
}
```

---

## Security Notes

1. **Admin passwords** should be changed immediately after first login
2. **SMTP credentials** should never be committed to version control
3. **JWT_SECRET** should be a strong random string in production
4. Users created by admin receive temporary passwords via email
5. All admin operations are logged (implement logging as needed)

---
