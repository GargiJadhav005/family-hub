const mongoose = require("mongoose");
const { Score, Student, ReportCard, Attendance, Homework, HomeworkStatus } = require("../models");
const { getMetaValue } = require("../utils/auth");
const { studentProfileForReportCard } = require("../utils/studentProfile");
const { enrollmentSnapshotFromStudent } = require("../utils/reportCardSnapshot");

const emptyAttendance = () => ({
  totalDays: 0,
  presentDays: 0,
  absentDays: 0,
  lateDays: 0,
});

const emptyHomework = () => ({ total: 0, completed: 0 });

async function summarizeAttendance(studentId) {
  const records = await Attendance.find({ studentId });
  let presentDays = 0;
  let absentDays = 0;
  let lateDays = 0;
  for (const r of records) {
    if (r.status === "present") presentDays += 1;
    else if (r.status === "absent") absentDays += 1;
    else if (r.status === "late") lateDays += 1;
  }
  return {
    totalDays: records.length,
    presentDays,
    absentDays,
    lateDays,
  };
}

async function summarizeHomework(studentId, className) {
  const total = await Homework.countDocuments({ className });
  const completed = await HomeworkStatus.countDocuments({
    studentId,
    status: { $in: ["completed", "submitted", "late"] },
  });
  return { total, completed };
}

async function getScores(req, res) {
  try {
    if (!req.user) { 
      return res.status(401).json({ error: "Not authenticated" }); 
    }

    const query = {};
    const forceStudentId = req.query.studentId;
    const className = req.query.className;

    if (forceStudentId) {
      if (req.user.role === "teacher") {
        const teacherClass = getMetaValue(req.user.meta, "class");
        const student = await Student.findById(forceStudentId);
        if (student && student.className !== teacherClass) {
          return res.status(403).json({ error: "Student not in your class" }); 
        }
      }
      query.studentId = forceStudentId;
    } else if (req.user.role === "student") {
      const studentDoc = await Student.findOne({ studentUserId: req.user._id });
      if (!studentDoc) { 
        return res.json({ scores: [] }); 
      }
      query.studentId = studentDoc._id;
    } else if (req.user.role === "parent") {
      const children = await Student.find({ parentUserId: req.user._id }).select("_id");
      query.studentId = { $in: children.map((c) => c._id) };
    } else if (req.user.role === "teacher") {
      const teacherClass = className || getMetaValue(req.user.meta, "class");
      if (teacherClass) {
        const students = await Student.find({ className: teacherClass }).select("_id");
        query.studentId = { $in: students.map((s) => s._id) };
      }
    } else if (className) {
      const students = await Student.find({ className }).select("_id");
      query.studentId = { $in: students.map((s) => s._id) };
    }

    const scores = await Score.find(query)
      .populate("studentId", "name roll className")
      .sort({ date: -1 })
      .limit(50);

    const items = scores.map((s) => ({
      _id: s._id.toString(),
      id: s._id.toString(),
      studentId: s.studentId?._id?.toString(),
      studentName: s.studentId?.name,
      studentRoll: s.studentId?.roll,
      subject: s.subject,
      title: s.testName,
      testName: s.testName,
      score: s.scorePercent,
      scorePercent: s.scorePercent,
      total: 100,
      grade: s.grade,
      date: s.date,
    }));

    res.json({ scores: items });
  } catch (err) {
    console.error("GetScores error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function addScore(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (req.user.role !== "teacher") {
      return res.status(403).json({ error: "Only teachers can add scores" });
    }

    const { studentId, subject, testName, scorePercent, grade, date } = req.body;

    if (!studentId || !subject || !testName || scorePercent === undefined || !grade || !date) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const teacherClass = getMetaValue(req.user.meta, "class");
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    if (teacherClass && student.className !== teacherClass) {
      return res.status(403).json({ error: "Student not in your class" });
    }

    const score = new Score({
      studentId,
      subject,
      testName,
      scorePercent,
      grade,
      date,
    });

    await score.save();

    res.status(201).json({
      score: {
        id: score._id.toString(),
        studentId,
        studentName: student.name,
        subject,
        testName,
        scorePercent,
        grade,
        date,
      }
    });
  } catch (err) {
    console.error("AddScore error:", err);
    res.status(500).json({ 
      error: "Failed to create score",
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined
    });
  }
}

async function getAnalytics(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const teacherClass = getMetaValue(req.user.meta, "class");
    const students = await Student.find(
      teacherClass ? { className: teacherClass } : {}
    ).select("_id name roll className").lean();

    const studentIds = students.map((s) => s._id);

    const scores = await Score.find({ studentId: { $in: studentIds } })
      .sort({ date: -1 })
      .lean();

    const bySubject = {};
    const monthly = {};

    for (const s of scores) {
      if (!bySubject[s.subject]) bySubject[s.subject] = { total: 0, count: 0 };
      bySubject[s.subject].total += s.scorePercent;
      bySubject[s.subject].count += 1;

      const month = new Date(s.date).toLocaleDateString("en", { month: "short", year: "2-digit" });
      if (!monthly[month]) monthly[month] = { total: 0, count: 0 };
      monthly[month].total += s.scorePercent;
      monthly[month].count += 1;
    }

    const subjectPerformance = Object.entries(bySubject).map(([subject, v]) => ({
      subject,
      avg: Math.round(v.total / v.count),
    }));

    const monthlyTrend = Object.entries(monthly).map(([month, v]) => ({
      month,
      avg: Math.round(v.total / v.count),
    }));

    const weakAreas = subjectPerformance
      .filter((s) => s.avg < 75)
      .map((s) => ({
        subject: s.subject,
        topic: "पुनरावृत्ती आवश्यक",
        severity: s.avg < 60 ? "high" : "medium",
        avg: s.avg,
      }));

    const strongAreas = subjectPerformance
      .filter((s) => s.avg >= 85)
      .map((s) => ({
        subject: s.subject,
        topic: "उत्कृष्ट कामगिरी",
        percentage: `${s.avg}%`,
      }));

    const now = new Date();
    const fromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const toDate = now.toISOString().slice(0, 10);

    const attRecords = await Attendance.find({
      studentId: { $in: studentIds },
      date: { $gte: fromDate, $lte: toDate },
    }).lean();

    const attByStudent = {};
    for (const a of attRecords) {
      const sid = a.studentId.toString();
      if (!attByStudent[sid]) attByStudent[sid] = { present: 0, total: 0 };
      attByStudent[sid].total += 1;
      if (a.status === "present") attByStudent[sid].present += 1;
    }

    const totalDays = Object.values(attByStudent).reduce((m, v) => Math.max(m, v.total), 0);
    const avgAttendance = totalDays > 0
      ? Math.round(
          Object.values(attByStudent).reduce((s, v) => s + (v.present / v.total) * 100, 0) /
          Object.keys(attByStudent).length
        )
      : null;

    res.json({
      subjectPerformance,
      monthlyTrend,
      weakAreas,
      strongAreas,
      totalStudents: students.length,
      avgAttendance,
      teacherClass: teacherClass || null,
    });
  } catch (err) {
    console.error("getAnalytics error:", err);
    res.status(500).json({ error: "Analytics failed" });
  }
}

module.exports = {
  getScores,
  addScore,
  getAnalytics,
};
