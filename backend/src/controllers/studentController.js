const { Student } = require('../models');
const { getMetaValue } = require('../utils/auth');
const { serializeStudentForViewer, STUDENT_UPDATABLE_FIELDS } = require('../utils/studentSerialize');

async function getStudents(req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = req.user;
    let query = {};

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const search = req.query.search;
    const className = req.query.className;

    if (user.role === 'teacher') {
      const teacherClass = getMetaValue(user.meta, 'class');
      if (teacherClass) {
        query.className = teacherClass;
      }
    } else if (user.role === 'parent') {
      query.parentUserId = user._id;
    } else if (user.role === 'student') {
      query.studentUserId = user._id;
    } else if (user.role === 'admin') {
      query = {};
    } else {
      res.status(403).json({ error: 'Not allowed' });
      return;
    }

    if (className) {
      query.className = className;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { roll: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Student.countDocuments(query);

    const students = await Student.find(query)
      .populate('studentUserId', 'name email role')
      .populate('parentUserId', 'name email role')
      .populate('createdByTeacherId', 'name email')
      .sort({ roll: 1 })
      .skip(skip)
      .limit(limit);

    const items = students.map((s) => {
      const plain = s.toObject ? s.toObject() : s;
      return serializeStudentForViewer(
        {
          ...plain,
          studentUserId: plain.studentUserId?._id ?? plain.studentUserId,
          parentUserId: plain.parentUserId?._id ?? plain.parentUserId,
        },
        user.role,
        user._id
      );
    });

    res.json({
      students: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('GetStudents error:', err);
    res.status(500).json({
      error: 'Failed to fetch students',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}

async function getStudentById(req, res) {
  try {
    const { id } = req.params;

    const student = await Student.findById(id)
      .populate('studentUserId', 'name email role')
      .populate('parentUserId', 'name email role');

    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = req.user;

    if (user.role === 'teacher') {
      const teacherClass = getMetaValue(user.meta, 'class');
      if (student.className !== teacherClass) {
        res.status(403).json({ error: 'Student not in your class' });
        return;
      }
    } else if (user.role === 'parent') {
      if (student.parentUserId?.toString() !== user._id.toString()) {
        res.status(403).json({ error: 'Not your child' });
        return;
      }
    } else if (user.role === 'student') {
      if (student.studentUserId?.toString() !== user._id.toString()) {
        res.status(403).json({ error: 'Not authorized' });
        return;
      }
    } else if (user.role !== 'admin') {
      res.status(403).json({ error: 'Not allowed' });
      return;
    }

    const plain = student.toObject ? student.toObject() : student;
    const item = serializeStudentForViewer(
      {
        ...plain,
        studentUserId: plain.studentUserId?._id ?? plain.studentUserId,
        parentUserId: plain.parentUserId?._id ?? plain.parentUserId,
      },
      user.role,
      user._id
    );

    res.json({ student: item });
  } catch (err) {
    console.error('GetStudentById error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateStudent(req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (!['teacher', 'admin'].includes(req.user.role)) {
      res.status(403).json({ error: 'Not allowed' });
      return;
    }

    const { id } = req.params;
    const updates = req.body;

    const student = await Student.findById(id);
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    if (req.user.role === 'teacher') {
      const teacherClass = getMetaValue(req.user.meta, 'class');
      if (student.className !== teacherClass) {
        res.status(403).json({ error: 'Student not in your class' });
        return;
      }
    }

    if (updates.roll !== undefined && updates.roll !== student.roll) {
      const targetClass = updates.className ?? student.className;
      const dup = await Student.findOne({
        className: targetClass,
        roll: updates.roll,
        _id: { $ne: student._id },
      });
      if (dup) {
        res.status(400).json({ error: 'Roll number already used in this class' });
        return;
      }
    }

    for (const key of STUDENT_UPDATABLE_FIELDS) {
      if (key in updates && updates[key] !== undefined) {
        student[key] = updates[key];
      }
    }

    await student.save();

    const plain = student.toObject();
    res.json({
      student: serializeStudentForViewer(
        {
          ...plain,
          studentUserId: plain.studentUserId,
          parentUserId: plain.parentUserId,
        },
        req.user.role,
        req.user._id
      ),
    });
  } catch (err) {
    console.error('updateStudent error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteStudent(req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (req.user.role !== 'admin') {
      res.status(403).json({ error: 'Only admin can delete' });
      return;
    }

    const { id } = req.params;

    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    console.error('deleteStudent error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
