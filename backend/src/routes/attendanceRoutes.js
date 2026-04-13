const { Router } = require('express');
const { getAttendance, markAttendance, getAttendanceMonth } = require('../controllers/attendanceController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = Router();

router.get('/month', authMiddleware, requireRole('teacher'), getAttendanceMonth);
router.get('/', authMiddleware, getAttendance);
router.post('/', authMiddleware, requireRole('teacher'), markAttendance);

module.exports = router;
