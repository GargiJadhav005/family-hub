# 🎓 Family Hub - School Management System

A comprehensive full-stack school management platform built with **React + TypeScript** (Frontend) and **Node.js + Express** (Backend).

## ✨ Current Status

**✅ PRODUCTION READY** - All demo accounts removed, real account system implemented

---

## 🎯 Features

### 👨‍🏫 Teachers
- Enroll and manage students
- Create homework assignments
- Track student attendance
- Create and manage quizzes
- Generate report cards
- Schedule parent meetings
- Post instructions and feedback

### 🧑‍🎓 Students
- View assigned homework
- Attempt quizzes
- Check scores and grades
- View report cards
- Download resources

### 👨‍👩‍👧 Parents
- Monitor child's progress
- View attendance records
- Check grades and scores
- Receive school notifications
- Schedule meetings with teachers

### 🛠️ Admin
- Manage all users (create, edit, delete)
- View system-wide analytics
- Handle student enquiries
- Configure school settings
- Post system announcements

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (or Bun 1.0+)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd family-hub

# Install dependencies
npm install
cd backend && npm install && cd ..

# Configure environment variables
cp backend/.env.example backend/.env
cp .env.example .env.local
# Edit .env and .env.local with your configuration

# Create admin account
cd backend
npm run seed:admin
# You'll get: admin@google.com / Admin@123
# Change password on first login!

# Start development servers
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm run dev

# Access at http://localhost:5173
```

---

## 📚 Documentation

- **[SETUP_COMPLETE.md](./SETUP_COMPLETE.md)** - Complete setup and development guide
- **[DEPLOYMENT_CREDENTIALS.md](./DEPLOYMENT_CREDENTIALS.md)** - Production deployment guide
- **[API.md](./API.md)** - API endpoint documentation
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - System quick reference

---

## 🏗️ Architecture

### Frontend
- **Framework**: React 18+ with TypeScript
- **UI Library**: Radix UI + TailwindCSS
- **State Management**: React Context + React Query
- **Routing**: React Router v6
- **Build**: Vite

### Backend
- **Runtime**: Node.js with Express
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod schemas
- **API Style**: RESTful

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | System control, user management, analytics |
| **Teacher** | Student enrollment, homework, attendance, quizzes |
| **Student** | View homework, take quizzes, check scores |
| **Parent** | Monitor progress, view attendance & grades |

---

## 📊 API Overview

**50+ Endpoints** across 14 modules:
- Authentication & Authorization
- Student Management
- Teacher Operations
- Homework & Assignments
- Attendance Tracking
- Quiz Management
- Report Cards & Analytics
- Meetings & Scheduling
- Announcements
- Notifications

See [API.md](./API.md) for detailed documentation.

---

## 🔐 Security

✅ **Implemented:**
- JWT-based authentication
- Role-based access control (RBAC)
- Bcrypt password hashing
- CORS protection
- Input validation (Zod)
- MongoDB injection prevention

⚠️ **Before Production:**
1. Change all default passwords
2. Set strong JWT_SECRET
3. Use production MongoDB cluster
4. Enable HTTPS
5. Configure email service for notifications
6. Review and customize CORS settings

---

## 📦 Project Structure

```
family-hub/
├── public/                 # Static assets
├── src/                   # Frontend code
│   ├── pages/            # React page components
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React context (auth, etc)
│   ├── lib/              # API utilities
│   └── hooks/            # Custom hooks
├── backend/              # Backend code
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # API endpoints
│   │   ├── models/       # MongoDB schemas
│   │   ├── middleware/   # Express middleware
│   │   └── utils/        # Helper functions
│   └── package.json
├── SETUP_COMPLETE.md     # Full setup guide
├── DEPLOYMENT_CREDENTIALS.md  # Deployment guide
└── README.md            # This file
```

---

## 🧪 Key Pages

### Public Pages
- Home / Landing
- Login
- Campus Info
- Activities
- Admissions

### Admin Pages
- Dashboard & Analytics
- User Management
- Enquiry Management

### Teacher Pages
- Dashboard
- Student Enrollment (8 modules)
- Attendance Management
- Homework Assignment
- Quiz Creation
- Meeting Scheduling
- Analytics & Progress

### Student Pages
- Dashboard
- View Homework
- Attempt Quizzes
- Check Scores

### Parent Pages
- Dashboard
- View Progress
- Check Homework
- Track Attendance

---

## 🚀 Deployment

See [DEPLOYMENT_CREDENTIALS.md](./DEPLOYMENT_CREDENTIALS.md) for:
- Environment setup
- Database configuration
- Admin account creation
- Production build steps
- Deploy verification checklist

---

## 🆘 Troubleshooting

**For common issues and solutions, see:**
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

---

## 📝 Important Notes

⚠️ **Demo Accounts Removed** - This is a production-ready system
- No hardcoded demo credentials
- Real account creation required
- Proper environment variable configuration needed
- All passwords sent securely

---

## 📞 Support

1. Check documentation in this repo
2. Review troubleshooting guide  
3. Check backend console for error messages
4. Verify environment configuration

---

## 📄 License

[Specify your license]

---

**Version**: 1.0.0 Production Ready  
**Last Updated**: April 2026  

For complete setup instructions, see [SETUP_COMPLETE.md](./SETUP_COMPLETE.md)

- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
