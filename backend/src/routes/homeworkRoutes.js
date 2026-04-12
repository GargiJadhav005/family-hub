const { Router } = require('express');
const { getHomework, createHomework, updateHomeworkStatus, getStudentAllHomeworkWithStatus } = require('../controllers/homeworkController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = Router();

router.get('/', authMiddleware, getHomework);
router.post('/', authMiddleware, requireRole('teacher'), createHomework);
router.patch('/:id/status', authMiddleware, updateHomeworkStatus);
router.get('/student/all', authMiddleware, requireRole('student'), getStudentAllHomeworkWithStatus);

module.exports = router;
