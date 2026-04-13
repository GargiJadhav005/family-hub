const { Attendance, Student } = require('../models');
const { getMetaValue } = require('../utils/auth');
const mongoose = require('mongoose');

const getTeacherClass = (user) => getMetaValue(user.meta, 'class');

function startOfLocalDay(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function formatYmd(d) {
  if (!d) return '';
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  const y = dt.getFullYear();
  const mo = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

async function getAttendance(req, res) {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const from = req.query.from || '';
    const to = req.query.to || '';
    const singleDate = req.query.date || new Date().toISOString().slice(0, 10);

    const page = Number(req.query.page) || 1;
    const maxCap = user.role === 'teacher' || user.role === 'admin' ? 500 : 200;
    const defaultLimit =
      user.role === 'teacher' && from && to ? Math.min(400, maxCap) : user.role === 'teacher' ? 120 : 50;
    const limit = Math.min(Number(req.query.limit) || defaultLimit, maxCap);
    const skip = (page - 1) * limit;

    let filter = {};
    if (from && to) {
      filter.date = { $gte: startOfLocalDay(from), $lte: startOfLocalDay(to) };
    } else {
      filter.date = startOfLocalDay(singleDate);
    }

    if (user.role === 'teacher') {
      const teacherClass = getTeacherClass(user);
      if (!teacherClass) {
        res.status(400).json({ error: 'Teacher class not assigned' });
        return;
      }
      filter.className = teacherClass;
    }

    if (user.role === 'parent') {
      const children = await Student.find({
        parentUserId: user._id,
      })
        .select('_id')
        .lean();

      filter.studentId = { $in: children.map((c) => c._id) };
    }

    if (user.role === 'student') {
      const student = await Student.findOne({
        studentUserId: user._id,
      })
        .select('_id')
        .lean();

      if (!student) {
        res.status(404).json({ error: 'Student record not found' });
        return;
      }

      filter.studentId = student._id;
    }

    if (user.role === 'admin') {
      const className = req.query.className;
      if (className) filter.className = className;
    } else if (!['teacher', 'parent', 'student'].includes(user.role)) {
      res.status(403).json({ error: 'Not allowed' });
      return;
    }

    const [records, total] = await Promise.all([
      Attendance.find(filter)
        .populate('studentId', 'name roll className')
        .sort({ date: 1, studentId: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Attendance.countDocuments(filter),
    ]);

    const items = records.map((a) => ({
      id: a._id.toString(),
      studentId: a.studentId?._id?.toString(),
      studentName: a.studentId?.name,
      studentRoll: a.studentId?.roll,
      className: a.className,
      date: a.date,
      status: a.status,
    }));

    res.json({
      attendance: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error('GetAttendance error:', err);
    res.status(500).json({
      error: 'Failed to fetch attendance',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
}

async function markAttendance(req, res) {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    if (user.role !== 'teacher') {
      res.status(403).json({ error: 'Only teachers can mark attendance' });
      return;
    }

    const { date: dateStr, records } = req.body;

    if (!dateStr || !records || !Array.isArray(records) || records.length === 0) {
      res.status(400).json({ error: 'Invalid input' });
      return;
    }

    const date = startOfLocalDay(dateStr);

    const teacherClass = getTeacherClass(user);
    if (!teacherClass) {
      res.status(400).json({ error: 'Teacher class assignment not found' });
      return;
    }

    const studentIds = records.map((r) => r.studentId);

    const validStudents = await Student.find({
      _id: { $in: studentIds },
      className: teacherClass,
    })
      .select('_id')
      .lean();

    if (validStudents.length !== studentIds.length) {
      res.status(400).json({
        error: 'Some students do not belong to your class',
        expected: studentIds.length,
        found: validStudents.length,
      });
      return;
    }

    const bulkOps = records.map((r) => ({
      updateOne: {
        filter: { studentId: new mongoose.Types.ObjectId(r.studentId), date },
        update: {
          $set: {
            studentId: new mongoose.Types.ObjectId(r.studentId),
            className: teacherClass,
            date,
            status: r.status,
            markedByTeacherId: user._id,
          },
        },
        upsert: true,
      },
    }));

    await Attendance.bulkWrite(bulkOps);

    res.json({
      ok: true,
      message: `Attendance marked for ${records.length} students on ${dateStr}`,
      recordsCount: records.length,
    });
  } catch (err) {
    console.error('MarkAttendance error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const YM_REGEX = /^\d{4}-\d{2}$/;

async function getAttendanceMonth(req, res) {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    if (user.role !== 'teacher') {
      res.status(403).json({ error: 'Only teachers can export class month view' });
      return;
    }
    const ym = req.query.ym || '';
    if (!YM_REGEX.test(ym)) {
      res.status(400).json({ error: 'Query ym must be YYYY-MM' });
      return;
    }
    const teacherClass = getTeacherClass(user);
    if (!teacherClass) {
      res.status(400).json({ error: 'Teacher class not assigned' });
      return;
    }
    const [y, m] = ym.split('-').map(Number);
    const rangeStart = new Date(y, m - 1, 1);
    rangeStart.setHours(0, 0, 0, 0);
    const rangeEnd = new Date(y, m, 0);
    rangeEnd.setHours(23, 59, 59, 999);
    const daysInMonth = rangeEnd.getDate();
    const dates = [];
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(`${ym}-${String(day).padStart(2, '0')}`);
    }

    const [students, records] = await Promise.all([
      Student.find({ className: teacherClass }).select('name roll').sort({ roll: 1 }).lean(),
      Attendance.find({
        className: teacherClass,
        date: { $gte: rangeStart, $lte: rangeEnd },
      })
        .select('studentId date status')
        .lean(),
    ]);

    res.json({
      ym,
      className: teacherClass,
      dates,
      students: students.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        roll: s.roll,
      })),
      records: records.map((r) => ({
        studentId: r.studentId?.toString(),
        date: r.date,
        status: r.status,
      })),
    });
  } catch (err) {
    console.error('GetAttendanceMonth error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getAttendance,
  markAttendance,
  getAttendanceMonth,
};
