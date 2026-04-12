require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./utils/db');
const { getCorsOriginList } = require('./utils/corsOrigins');

// Import all routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const homeworkRoutes = require('./routes/homeworkRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const scoresRoutes = require('./routes/scoresRoutes');
const eventRoutes = require('./routes/eventRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const instructionRoutes = require('./routes/instructionRoutes');
const quizRoutes = require('./routes/quizRoutes');
const adminRoutes = require('./routes/adminRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportCardRoutes = require('./routes/reportCardRoutes');
const lmsRoutes = require('./routes/lmsRoutes');

const { getCourses } = require('./controllers/lmsController');
const { authMiddleware, requireRole } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 9000;

app.use(cors({
  origin: getCorsOriginList(),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/instructions', instructionRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/enquiry', enquiryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/report-cards', reportCardRoutes);

// LMS route
app.get('/api/lms', authMiddleware, requireRole('teacher', 'student', 'parent', 'admin'), getCourses);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, _next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

async function start() {
  try {
    if (!process.env.JWT_SECRET) {
      console.error('❌ FATAL: JWT_SECRET environment variable is not set');
      console.error('ℹ️  Please set JWT_SECRET in your .env file');
      process.exit(1);
    }

    if (!process.env.MONGODB_URI) {
      console.error('❌ FATAL: MONGODB_URI environment variable is not set');
      console.error('ℹ️  Please set MONGODB_URI in your .env file');
      process.exit(1);
    }

    await connectDB();
    console.log('✓ Connected to MongoDB\n');

    console.log('🔧 Creating Express server...');
    const server = app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`\n✅ Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 CORS enabled for ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n`);
      console.log('📡 Server is ready to accept requests');
    });

    console.log('📌 Server instance created, setting up event handlers...');

    server.on('clientError', (err) => {
      console.error('❌ Client error:', err.message);
    });

    server.on('connection', (socket) => {
      console.log('📡 New connection received');
      socket.on('data', (data) => {
        console.log('📨 Data received on socket');
      });
    });

    server.on('listening', () => {
      console.log('🎧 Server is now listening for connections');
    });

    server.on('error', (err) => {
      console.error('❌ Server error:', err);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
