const { Router } = require('express');
const { getStudents, getStudentById, updateStudent, deleteStudent } = require('../controllers/studentController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = Router();

router.get('/', authMiddleware, getStudents);
router.get('/:id', authMiddleware, getStudentById);
router.put('/:id', authMiddleware, requireRole('teacher', 'admin'), updateStudent);
router.delete('/:id', authMiddleware, requireRole('admin'), deleteStudent);

module.exports = router;
