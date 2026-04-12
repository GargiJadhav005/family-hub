const { Homework, HomeworkStatus, Student } = require('../models');
const { getMetaValue } = require('../utils/auth');
const mongoose = require('mongoose');

const getUserClass = (user) => user.meta?.class || (user.meta && user.meta.get && user.meta.get('class'));

const toClientHomework = (h) => ({
  id: h._id.toString(),
  subject: h.subject,
  title: h.title,
  description: h.description,
  dueDate: h.dueDate,
  className: h.className,
  createdAt: h.createdAt,
});

async function getHomework(req, res) {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    if (user.role === 'teacher') {
      query.createdByTeacherId = user._id;
      const teacherClass = getUserClass(user);
      if (teacherClass) {
        query.className = teacherClass;
      }
    }

    if (user.role === 'student') {
      const className = getUserClass(user);
      if (className) query.className = className;
    }

    if (user.role === 'parent') {
      const children = await Student.find({ parentUserId: user._id })
        .select('className')
        .lean();

      const classNames = [...new Set(children.map((c) => c.className))];
      query.className = { $in: classNames };
    }

    const [homework, total] = await Promise.all([
      Homework.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Homework.countDocuments(query),
    ]);

    res.json({
      homework: homework.map(toClientHomework),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('GetHomework error:', err);
    res.status(500).json({
      error: 'Failed to fetch homework',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}

async function createHomework(req, res) {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (user.role !== 'teacher') {
      res.status(403).json({ error: 'Only teachers can create homework' });
      return;
    }

    const { subject, title, description, className, dueDate } = req.body;

    if (!subject || !title || !description || !className) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const teacherClass = getMetaValue(user.meta, 'class');
    const finalClassName = teacherClass || className;
    if (teacherClass && className !== teacherClass) {
      res.status(403).json({ error: 'Homework can only be assigned to your class' });
      return;
    }

    const homework = await Homework.create({
      subject,
      title,
      description,
      className: finalClassName,
      dueDate: dueDate || null,
      createdByTeacherId: user._id,
    });

    res.status(201).json({
      homework: toClientHomework(homework),
    });
  } catch (err) {
    console.error('CreateHomework error:', err);
    res.status(500).json({
      error: 'Failed to create homework',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}

async function updateHomeworkStatus(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid homework ID' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { status, studentId: bodyStudentId } = req.body;

    if (!status || !['pending', 'in_progress', 'completed', 'submitted', 'late'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    let studentId = bodyStudentId;

    if (req.user.role === 'student') {
      const studentDoc = await Student.findOne({
        studentUserId: req.user._id,
      }).select('_id');

      if (!studentDoc) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }

      studentId = studentDoc._id.toString();
    }

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
      res.status(400).json({ error: 'Valid studentId required' });
      return;
    }

    const hwStatus = await HomeworkStatus.findOneAndUpdate(
      { homeworkId: id, studentId },
      {
        status,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    ).lean();

    res.json({
      homeworkId: id,
      studentId,
      status: hwStatus.status,
      updatedAt: hwStatus.updatedAt,
    });
  } catch (err) {
    console.error('UpdateHomeworkStatus error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getStudentAllHomeworkWithStatus(req, res) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (req.user.role !== 'student') {
      res.status(403).json({ error: 'Only students allowed' });
      return;
    }

    const studentDoc = await Student.findOne({
      studentUserId: req.user._id,
    }).lean();

    if (!studentDoc) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const className = studentDoc.className;

    const [homeworkList, statuses] = await Promise.all([
      Homework.find({ className }).lean(),
      HomeworkStatus.find({ studentId: studentDoc._id }).lean(),
    ]);

    const statusMap = new Map(statuses.map((s) => [s.homeworkId.toString(), s]));

    const result = homeworkList.map((hw) => {
      const s = statusMap.get(hw._id.toString());

      return {
        id: hw._id.toString(),
        subject: hw.subject,
        title: hw.title,
        description: hw.description,
        dueDate: hw.dueDate,
        className: hw.className,
        status: s?.status || 'pending',
        statusUpdatedAt: s?.updatedAt || null,
        feedback: s?.feedback || null,
        createdAt: hw.createdAt,
      };
    });

    res.json({ homeworks: result });
  } catch (err) {
    console.error('GetStudentAllHomeworkWithStatus error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getHomework,
  createHomework,
  updateHomeworkStatus,
  getStudentAllHomeworkWithStatus,
};
